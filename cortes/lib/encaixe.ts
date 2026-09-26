/**
 * Encaixe Circular Integrado — Macho/Fêmea paramétrico
 * -----------------------------------------------------------------
 * Substitui o antigo sistema de pino solto + furos. Agora o encaixe
 * faz parte da geometria das duas peças resultantes do corte:
 *
 *   Peça A (selecionada)  → MACHO  (protuberância cilíndrica integrada)
 *   Peça B (complemento)  → FÊMEA  (cavidade cilíndrica integrada)
 *
 * - O eixo segue a normal da costura da seleção (auto-orientação).
 * - Macho e fêmea são parametricamente vinculados: a fêmea deriva do
 *   macho + tolerância de impressão 3D.
 * - Limites inteligentes: o encaixe nunca ultrapassa a região da
 *   costura (diâmetro) nem atravessa a peça receptora (altura).
 * - Nenhum pino separado é gerado — o STL final tem só as duas peças.
 *
 * Tolerância: a cavidade da fêmea é maior que o macho por `tolerance`
 * (radial), garantindo folga de impressão sem folga visual.
 */

import * as THREE from 'three'
import { Evaluator, Brush, ADDITION as UNION, SUBTRACTION } from 'three-bvh-csg'
import { analyzeSelection } from './smart-autocut'
import { estimateVolume } from './acabamento'

/** O que gerar: pino (macho), furo (fêmea) ou os dois integrados. */
export type EncaixeMode = 'male' | 'female' | 'both'

/** Uma peça candidata a complemento do encaixe (Part ou CutPart). */
export interface EncaixePart {
  id: string
  name: string
  mesh: THREE.Mesh
}

// ─── Tipos públicos ────────────────────────────────────────────────────────────

/** Limites calculados a partir da seleção + geometria da peça. */
export interface EncaixeLimits {
  /** Centro do encaixe no espaço local da peça ativa. */
  center: THREE.Vector3
  /**
   * Normal da costura orientada da peça selecionada (ativa) em direção
   * ao complemento. Usada para o eixo e para a orientação automática.
   */
  normal: THREE.Vector3
  /** Base ortonormal do plano da costura (para reposicionar no plano). */
  planeU: THREE.Vector3
  planeV: THREE.Vector3
  /** Maior raio do macho permitido pela região da costura. */
  maxRadius: number
  /** Maior altura do macho permitida pela peça receptora (≤ 8). */
  maxHeight: number
  /** Índice em cutParts[] da peça complementar. -1 se não há complemento. */
  complementIndex: number
  /** Nome descritivo da peça complementar. */
  complementName: string
}

/** Parâmetros finais para gerar as geometrias. */
export interface EncaixeApplyParams {
  /** Centro do encaixe, no frame local da `sourceMesh` (peça ativa). */
  center: THREE.Vector3
  /**
   * Direção do eixo APONTANDO da peça macho → peça fêmea (no frame da
   * `sourceMesh`). O macho e a cavidade da fêmea se estendem ao longo dela.
   */
  direction: THREE.Vector3
  /** Raio do macho (mm). */
  radius: number
  /** Altura/protrusão do macho (mm). */
  height: number
  /** Folga radial da cavidade da fêmea (mm). */
  tolerance: number
  /** O que gerar: pino, furo ou ambos. */
  mode: EncaixeMode
  /** Malha cujo frame local expressa `center`/`direction` (a peça ativa). */
  sourceMesh: THREE.Mesh
  /** Malha que recebe o MACHO (união). Só usada nos modos male/both. */
  maleMesh: THREE.Mesh
  /** Malha que recebe a FÊMEA (subtração). Só usada nos modos female/both. */
  femaleMesh: THREE.Mesh
}

export interface EncaixeResult {
  /** Geometria da peça com o macho integrado (null nos modos que não o geram). */
  maleGeo: THREE.BufferGeometry | null
  /** Geometria da peça com a cavidade fêmea integrada (null quando não gerada). */
  femaleGeo: THREE.BufferGeometry | null
  /** Profundidade efetiva da cavidade (≤ espessura da peça). */
  femaleDepth: number
  /** Altura do pino efetivamente usada (após auto-fit — pode ser < pedida). */
  heightUsed: number
  /** Prova de que o booleano REALMENTE rodou (topologia + volume). */
  validation: {
    /** `true` apenas se o volume da malha mudou entre antes/depois. */
    femaleVolumeChanged: boolean
    /** Volume da peça alvo antes da subtração (mm³). */
    femaleVolumeBefore: number
    /** Volume da peça alvo depois da subtração (mm³). */
    femaleVolumeAfter: number
    /** `true` apenas se o nº de vértices mudou (booleano efetivamente executado). */
    femaleTopologyChanged: boolean
    /** Volume da peça alvo antes da união (mm³). */
    maleVolumeBefore: number
    /** Volume da peça alvo depois da união (mm³). */
    maleVolumeAfter: number
    /** `true` apenas se o volume da peça aumentou na união (pino adiciona). */
    maleVolumeChanged: boolean
    /** `true` apenas se o nº de vértices mudou na união. */
    maleTopologyChanged: boolean
  }
}

// ─── Planejamento / limites inteligentes ───────────────────────────────────────

const HEIGHT_MIN = 0.2
const HEIGHT_MAX = 8
const RADIUS_MM_MIN = 0.8
const FEMALE_WALL_MM = 0.5
/** Margem do cortador da fêmea: ultrapassa a superfície em 0.1mm para garantir
 * interseção real do Boolean Difference. Separado de `height`. */
const OUTSET_MM = 0.1
/** Folga axial: fundo da cavidade fica esta distância além da ponta do macho. */
const AXIAL_CLEARANCE_MM = 0.1
/** Cavidade mínima viável (abaixo disto, nem um pino mínimo cabe — erro claro). */
const MIN_CAVITY_MM = 0.8

const clampNum = (v: number, lo: number, hi: number) =>
  Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : lo

/**
 * Analisa a seleção e calcula os limites do encaixe. Não modifica nada.
 * Retorna `null` quando a seleção não tem costura utilizável.
 */
export function analyzeEncaixe(
  geometry: THREE.BufferGeometry,
  selectedFaces: Set<number>,
  parts: EncaixePart[],
  preferredComplementId?: string | null,
): EncaixeLimits | null {
  if (!selectedFaces || selectedFaces.size === 0) return null

  const ana = analyzeSelection(geometry, selectedFaces)
  if (!ana || !ana.hasSeam) return null

  // Normal orientada PARA FORA do interior da peça ativa (o macho projeta
  // para fora e a fêmea é cavada para dentro). O PCA devolve um autovetor sem
  // orientação definida (cima/baixo); aqui medimos de qual lado do plano está
  // o material — independe de como o usuário fez a seleção.
  const normal = orientOutward(geometry, ana.seamCenter, ana.fitNormal, selectedFaces)

  const center = ana.seamCenter.clone()

  // Diâmetro máximo = região da costura (com margem de segurança).
  // Região menor que o mínimo → não dá para encaixar com segurança.
  const maxRadius = Math.min(ana.halfU, ana.halfV) * 0.95
  if (maxRadius < RADIUS_MM_MIN) return null

  // Complemento: prioriza o `preferredComplementId` (peça identificada pela
  // RELAÇÃO DE CORTE — pai/filho do mesmo conjunto). Esse é o modo
  // determinístico usado pelo painel. Sem preferência, cai na heurística
  // geométrica: a peça mais próxima do centro da costura (sem penalizar o
  // lado, pois o complemento fica no lado "interno" −normal do corte).
  let complementIndex = -1
  if (preferredComplementId) {
    complementIndex = parts.findIndex((p) => p.id === preferredComplementId)
  }
  if (complementIndex < 0) {
    let bestDist = Infinity
    for (let i = 0; i < parts.length; i++) {
      const partMesh = parts[i]?.mesh
      if (!partMesh || partMesh.geometry === geometry) continue
      const geo = partMesh.geometry
      if (!geo.boundingBox) geo.computeBoundingBox()
      const bbCenter = new THREE.Vector3()
      geo.boundingBox!.getCenter(bbCenter)
      const score = bbCenter.distanceTo(center)
      if (score < bestDist) {
        bestDist = score
        complementIndex = i
      }
    }
  }

  // Altura máxima limitada pela espessura da peça receptora (não atravessar).
  // Mantém a folga generosa para o usuário ajustar (apenas a parede de segurança).
  // NOTA: center/normal estão no frame da peça ATIVA — converte para o frame
  // do complemento antes de medir (peças deslocadas têm frames diferentes).
  let maxHeight = HEIGHT_MAX
  if (complementIndex >= 0) {
    const compMesh = parts[complementIndex].mesh
    const srcMesh = parts.find((pt) => pt.mesh.geometry === geometry)?.mesh ?? compMesh
    const inComp = toTargetFrame(compMesh, srcMesh, center, normal)
    const thickness = measureThickness(compMesh, inComp.center, inComp.direction)
    if (thickness > 0) {
      maxHeight = Math.min(HEIGHT_MAX, thickness - FEMALE_WALL_MM)
    }
  }
  maxHeight = Math.max(HEIGHT_MIN, Math.min(HEIGHT_MAX, maxHeight))

  return {
    center,
    normal,
    planeU: ana.planeU.clone().normalize(),
    planeV: ana.planeV.clone().normalize(),
    maxRadius,
    maxHeight,
    complementIndex,
    complementName: complementIndex >= 0 ? parts[complementIndex].name : '',
  }
}

/**
 * Encontra o complemento pelo EIXO do encaixe (não por proximidade).
 *
 * A peça complementar verdadeira é aquela que o eixo da costura ATINGE a
 * partir do centro — é com ela que o par macho/fêmea vai se acoplar. Em
 * modelos com 3+ peças (ou após o 1º encaixe, quando já existem pinos e
 * furos), "a peça mais próxima" pode ser a peça ERRADA: o eixo não a
 * alcança, o snap falha e o pre-flight barra. Este teste elimina essa
 * classe inteira de falhas no 2º, 3º, ... encaixe.
 *
 * `center`/`normal` estão no frame da `sourceMesh`. Testa cada candidato no
 * seu próprio frame local, nos DOIS sentidos do eixo (a normal do PCA tem
 * sinal ambíguo — o complemento pode estar em qualquer lado). Retorna o id
 * do candidato atingido mais próximo, ou null se nenhum for atingido
 * (caller usa fallback).
 */
export function findComplementOnAxis(
  candidates: EncaixePart[],
  sourceMesh: THREE.Mesh,
  center: THREE.Vector3,
  normal: THREE.Vector3,
  maxDist = 1e4,
): string | null {
  let bestId: string | null = null
  let bestD = Infinity
  const n = normal.clone().normalize()
  for (const c of candidates) {
    if (!c.mesh || c.mesh === sourceMesh) continue
    for (const s of [1, -1]) {
      try {
        const f = toTargetFrame(c.mesh, sourceMesh, center, n.clone().multiplyScalar(s))
        const probe = new THREE.Mesh(c.mesh.geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
        const ray = new THREE.Raycaster(f.center, f.direction.clone().normalize())
        ray.near = 1e-4
        ray.far = maxDist
        const hits = ray.intersectObject(probe, false)
        if (hits.length > 0 && hits[0].distance < bestD) {
          bestD = hits[0].distance
          bestId = c.id
        }
      } catch {
        continue
      }
    }
  }
  return bestId
}

/**
 * Orienta a normal da costura para apontar PARA FORA da peça ativa, ou seja,
 * a direção onde o MACHO nasce (visível) e oposta ao interior onde a FÊMEA
 * é cavada. Sinais combinados, do mais confiável para o mais fraco:
 *
 *   1. RAYCAST direto no frame local: dispara um raio na normal e outro na
 *      anti-normal a partir do centro da costura; o lado que tem interseção
 *      com a malha é o INTERIOR. (Decisivo na maioria dos casos — não depende
 *      da direção da seleção nem do winding das faces.)
 *   2. PROXY do interior pelo centro da bounding sphere da geometria.
 *   3. Normal média (área-ponderada) das faces selecionadas.
 */
function orientOutward(
  geometry: THREE.BufferGeometry,
  seamCenter: THREE.Vector3,
  fitNormal: THREE.Vector3,
  selectedFaces: Set<number>,
): THREE.Vector3 {
  const n = fitNormal.clone().normalize()

  const flipViaProxy = (): number => {
    if (!geometry.boundingSphere) geometry.computeBoundingSphere()
    const bs = geometry.boundingSphere!
    const inward = bs.center.clone().sub(seamCenter).dot(n)
    if (Math.abs(inward) > 1e-6) return inward > 0 ? 1 : 0
    const selNormal = averageSelectionNormal(geometry, selectedFaces)
    if (selNormal.lengthSq() > 0.5 && selNormal.dot(n) < 0) return 1
    return 0
  }

  try {
    const probe = new THREE.Mesh(geometry)
    const posHits = new THREE.Raycaster(
      seamCenter.clone().addScaledVector(n, 1e-3), n,
    ).intersectObject(probe, false).length
    const negHits = new THREE.Raycaster(
      seamCenter.clone().addScaledVector(n, -1e-3), n.clone().negate(),
    ).intersectObject(probe, false).length
    if (posHits > 0 && negHits === 0) return n.clone().negate() // material em +n
    if (negHits > 0 && posHits === 0) return n.clone()           // material em −n
    return flipViaProxy() === 1 ? n.clone().negate() : n.clone()
  } catch {
    return flipViaProxy() === 1 ? n.clone().negate() : n.clone()
  }
}

/** Normal média (área-ponderada) das faces selecionadas. */
function averageSelectionNormal(
  geometry: THREE.BufferGeometry,
  selectedFaces: Set<number>,
): THREE.Vector3 {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const idx = geometry.index
  const faceCount = idx ? idx.count / 3 : pos.count / 3
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const e1 = new THREE.Vector3()
  const e2 = new THREE.Vector3()
  const sum = new THREE.Vector3()
  for (const f of selectedFaces) {
    if (f < 0 || f >= faceCount) continue
    a.fromBufferAttribute(pos, idx ? idx.getX(f * 3) : f * 3)
    b.fromBufferAttribute(pos, idx ? idx.getX(f * 3 + 1) : f * 3 + 1)
    c.fromBufferAttribute(pos, idx ? idx.getX(f * 3 + 2) : f * 3 + 2)
    e1.subVectors(b, a)
    e2.subVectors(c, a)
    e1.cross(e2)
    sum.add(e1)
  }
  return sum.normalize()
}

// ─── Aplicação (CSG) ───────────────────────────────────────────────────────────

/**
 * REGRA ABSOLUTA DO PAR MACHO/FÊMEA.
 *
 * Invariante garantida por esta função (sem exceções silenciosas):
 *   1. Macho criado  → fêmea criada (e vice-versa) no modo 'both'.
 *   2. Ou NADA é criado (erro lançado antes de qualquer mutação).
 *   3. O par sempre ENCAIXA: profundidade da fêmea ≥ altura do pino.
 *
 * Como é garantido:
 *   a. PRE-FLIGHT bilateral: antes de qualquer CSG, as duas ferramentas
 *      (pino e cortador) são posicionadas e têm sua interseção com a peça
 *      alvo verificada por bounding-box. Ferramenta fora da peça = erro
 *      imediato, sem executar metade do trabalho.
 *   b. AUTO-FIT: a altura do pino é reduzida automaticamente para caber na
 *      espessura real da peça receptora (com folga axial de 0.1mm). O valor
 *      usado volta em `heightUsed` para a UI relatar com honestidade.
 *   c. RETRY da fêmea: se a subtração voltar inalterada, uma segunda
 *      tentativa com reancoragem (lado oposto + outset dobrado) é feita
 *      antes de desistir.
 *   d. VERIFICAÇÃO do par: volume/topologia dos dois lados + fit
 *      (femaleDepth ≥ heightUsed). Qualquer prova faltando = throw.
 *
 * Pode lançar — envolva em try/catch no chamador.
 */
export function applyEncaixe(params: EncaixeApplyParams): EncaixeResult {
  // ── 0. Sanitiza parâmetros (nunca confia cegamente na UI/gizmo) ──────────
  const radius = clampNum(params.radius, RADIUS_MM_MIN, 50)
  const tolerance = clampNum(params.tolerance, 0, 2)
  let height = clampNum(params.height, HEIGHT_MIN, HEIGHT_MAX)
  const { center, mode, sourceMesh, maleMesh, femaleMesh } = params
  const direction = params.direction.clone().normalize()
  if (direction.lengthSq() < 0.5) throw new Error('direção do encaixe inválida')

  const needMale = mode === 'male' || mode === 'both'
  const needFemale = mode === 'female' || mode === 'both'
  if (mode === 'both' && maleMesh === femaleMesh) {
    throw new Error('macho e fêmea precisam de peças diferentes — faça o corte primeiro')
  }

  // Prova de que os booleanos rodaram de verdade: medimos a topologia e o
  // volume ANTES e DEPOIS de cada operação. Sem essa prova, NUNCA reportamos
  // sucesso — lançamos erro (o painel mostra erro e não fecha o fluxo).
  const validation = {
    femaleVolumeChanged: false,
    femaleVolumeBefore: 0,
    femaleVolumeAfter: 0,
    femaleTopologyChanged: false,
    maleVolumeBefore: 0,
    maleVolumeAfter: 0,
    maleVolumeChanged: false,
    maleTopologyChanged: false,
  }

  let maleGeo: THREE.BufferGeometry | null = null
  let femaleGeo: THREE.BufferGeometry | null = null
  let femaleDepth = 0

  // ── 1. Frames locais de cada alvo ─────────────────────────────────────────
  const mF = needMale ? toTargetFrame(maleMesh, sourceMesh, center, direction) : null
  const fF = needFemale ? toTargetFrame(femaleMesh, sourceMesh, center, direction) : null

  // ── 2. AUTO-FIT (antes de qualquer CSG): a altura do pino nunca excede a
  // capacidade real da peça receptora (espessura − parede − folga axial).
  // É isto que garante que o par sempre FECHA: depth(fêmea) ≥ height(macho).
  if (needFemale && fF) {
    const thickness = measureThickness(femaleMesh, fF.center, fF.direction)
    const cap = thickness > 0 ? thickness - FEMALE_WALL_MM : HEIGHT_MAX
    if (cap < MIN_CAVITY_MM) {
      throw new Error(
        `peça receptora fina demais (${Math.max(0, cap).toFixed(1)}mm) — o par macho/fêmea não caberia`,
      )
    }
    height = Math.min(height, cap - AXIAL_CLEARANCE_MM)
  }
  const heightUsed = height

  // ── 3. PRE-FLIGHT bilateral: posiciona as DUAS ferramentas e verifica
  // interseção com a peça alvo ANTES de executar qualquer booleano. Assim um
  // centro fora da superfície (pino flutuante / furo cego) falha AQUI com
  // mensagem clara — nunca depois de metade do par pronto.
  interface ToolPlan {
    brush: Brush
    base: THREE.Vector3
    dir: THREE.Vector3
  }
  let malePlan: ToolPlan | null = null
  let femalePlan: (ToolPlan & { depth: number; cavityRadius: number; outset: number }) | null = null
  // Diagnóstico do pre-flight (logado em qualquer falha — sem números, sem debug).
  const diag = {
    seam: fmtV3(center),
    dir: fmtV3(direction),
    maleTarget: needMale ? maleMesh.name || '?' : '-',
    femaleTarget: needFemale ? femaleMesh.name || '?' : '-',
    maleBase: '', maleHit: false, maleBox: '', maleBrushBox: '',
    femaleBase: '', femaleHit: false, femaleBox: '', femaleBrushBox: '',
    thickness: -1,
  }
  const logDiag = (where: string) => {
    console.error(
      `[CONNECTOR] pre-flight FALHOU em ${where} → seam=${diag.seam} dir=${diag.dir} ` +
      `macho: target=${diag.maleTarget} base=${diag.maleBase} hit=${diag.maleHit} ` +
      `alvo.bbox=${diag.maleBox} brush.bbox=${diag.maleBrushBox} | ` +
      `fêmea: target=${diag.femaleTarget} base=${diag.femaleBase} hit=${diag.femaleHit} ` +
      `espessura=${diag.thickness < 0 ? '?' : diag.thickness.toFixed(2)} ` +
      `alvo.bbox=${diag.femaleBox} brush.bbox=${diag.femaleBrushBox}`,
    )
  }
  try {
    if (needMale && mF) {
      const snap = snapCenterToSurface(maleMesh, mF.center, mF.direction)
      const base = snap.point
      const brush = makeCylinderBrush(radius, heightUsed, base, mF.direction)
      diag.maleBase = fmtV3(base)
      diag.maleHit = snap.hit
      diag.maleBox = fmtBox(boxOf(maleMesh.geometry))
      diag.maleBrushBox = fmtBox(boxOfBrush(brush))
      if (!snap.hit) {
        disposeBrush(brush)
        logDiag('macho/snap (eixo não atinge a peça do macho — complemento errado ou costura fora da face de contato?)')
        throw new Error('o eixo do encaixe não atinge a peça do macho — verifique a peça complementar e posicione o centro na face de contato')
      }
      if (!brushIntersectsMesh(brush, maleMesh)) {
        disposeBrush(brush)
        logDiag('macho/interseção (pino fora da peça)')
        throw new Error('o pino não toca a peça do macho (centro fora da superfície) — reposicione o centro na costura')
      }
      malePlan = { brush, base, dir: mF.direction }
    }
    if (needFemale && fF) {
      const snap = snapCenterToSurface(femaleMesh, fF.center, fF.direction)
      const base = snap.point
      const cavityRadius = radius + tolerance
      const outset = Math.max(cavityRadius * 1.5, 3) + OUTSET_MM
      const depth = computeFemaleDepth(femaleMesh, base, fF.direction, heightUsed)
      const brushLength = depth + outset
      const brushStart = base.clone().addScaledVector(fF.direction, -outset)
      const brush = makeCylinderBrush(cavityRadius, brushLength, brushStart, fF.direction)
      diag.femaleBase = fmtV3(base)
      diag.femaleHit = snap.hit
      diag.femaleBox = fmtBox(boxOf(femaleMesh.geometry))
      diag.femaleBrushBox = fmtBox(boxOfBrush(brush))
      diag.thickness = measureThickness(femaleMesh, base, fF.direction)
      if (!snap.hit) {
        disposeBrush(brush)
        logDiag('fêmea/snap (eixo não atinge a peça da fêmea — complemento errado ou costura fora da face de contato?)')
        throw new Error('o eixo do encaixe não atinge a peça da fêmea — verifique a peça complementar e posicione o centro na face de contato')
      }
      if (!brushIntersectsMesh(brush, femaleMesh)) {
        disposeBrush(brush)
        logDiag('fêmea/interseção (cortador fora da peça)')
        throw new Error('o cortador da fêmea não atinge a peça (centro fora da superfície) — reposicione o centro na costura')
      }
      femalePlan = { brush, base, dir: fF.direction, depth, cavityRadius, outset }
    }
  } catch (preErr) {
    if (malePlan) disposeBrush(malePlan.brush)
    if (femalePlan) disposeBrush(femalePlan.brush)
    throw preErr
  }

  // ── 4. Execução: macho (união) ────────────────────────────────────────────
  if (malePlan) {
    const before = meshStats(maleMesh.geometry)
    maleGeo = csgUnion(maleMesh.geometry, malePlan.brush)
    disposeBrush(malePlan.brush)
    const after = meshStats(maleGeo)
    validation.maleVolumeBefore = before.volume
    validation.maleVolumeAfter = after.volume
    validation.maleTopologyChanged = after.verts !== before.verts
    validation.maleVolumeChanged = after.volume > before.volume
    console.log(
      `[CONNECTOR] macho (união) → target=${maleMesh.name || '?'} ` +
      `antes={v:${before.verts}, vol:${before.volume.toFixed(1)}} ` +
      `depois={v:${after.verts}, vol:${after.volume.toFixed(1)}}`,
    )
    // União NÃO executada (geometria idêntica antes/depois) = erro, nunca
    // sucesso. Um pino 100% submerso também cai aqui: o macho não protrai.
    const maleUnchanged = after.verts === before.verts && Math.abs(after.volume - before.volume) < 1e-6
    if (maleUnchanged) {
      console.error('[CONNECTOR] macho: topologia e volume inalterados após união — booleano não executou')
      throw new Error('o macho não adicionou material: a união não alterou a geometria')
    }
  }

  // ── 5. Execução: fêmea (subtração) com 1 retry de reancoragem ─────────────
  // Se a subtração voltar inalterada (caso degenerado que passou no
  // pre-flight por pouco), tenta de novo com outset dobrado e base
  // recuada — só então desiste. Em qualquer falha, NADA é retornado
  // (o chamador descarta o maleGeo junto: par ou nada).
  if (femalePlan) {
    const targetBox = new THREE.Box3().setFromBufferAttribute(femaleMesh.geometry.getAttribute('position') as THREE.BufferAttribute)
    let attempt = 0
    let plan = femalePlan
    while (attempt < 2 && !femaleGeo) {
      const before = meshStats(femaleMesh.geometry)
      console.log(
        `[CONNECTOR] fêmea (subtração, tentativa ${attempt + 1}) → target=${femaleMesh.name || '?'} ` +
        `cutTool={r:${plan.cavityRadius.toFixed(2)}, len:${(plan.depth + plan.outset).toFixed(2)}, outset:${plan.outset.toFixed(2)}} ` +
        `antes={v:${before.verts}, vol:${before.volume.toFixed(1)}}`,
      )
      console.log(
        `[CONNECTOR] fêmea (diagnóstico) → seam(local)=${fmtV3(plan.base)} dir=${fmtV3(plan.dir)} ` +
        `alvo.bbox=${fmtBox(targetBox)}`,
      )
      const candidate = csgSubtract(femaleMesh.geometry, plan.brush)
      const after = meshStats(candidate)
      const unchanged = after.verts === before.verts && Math.abs(after.volume - before.volume) < 1e-6
      if (!unchanged && after.volume < before.volume) {
        disposeBrush(plan.brush)
        femaleGeo = candidate
        femaleDepth = plan.depth
        validation.femaleVolumeBefore = before.volume
        validation.femaleVolumeAfter = after.volume
        validation.femaleTopologyChanged = after.verts !== before.verts
        validation.femaleVolumeChanged = true
        console.log(
          `[CONNECTOR] fêmea (subtração) → depois={v:${after.verts}, vol:${after.volume.toFixed(1)}} ` +
          `removido=${(before.volume - after.volume).toFixed(2)}mm³`,
        )
      } else {
        candidate.dispose()
        disposeBrush(plan.brush)
        attempt++
        if (attempt < 2) {
          // Reancoragem: base recuada + ferramenta mais longa.
          const base2 = plan.base.clone().addScaledVector(plan.dir, -0.5)
          const outset2 = plan.outset * 2
          const brush2 = makeCylinderBrush(
            plan.cavityRadius, plan.depth + outset2,
            base2.clone().addScaledVector(plan.dir, -outset2), plan.dir,
          )
          plan = { ...plan, brush: brush2, base: base2, outset: outset2 }
          console.warn('[CONNECTOR] fêmea: primeira subtração inalterada — tentando com reancoragem')
        }
      }
    }
    if (!femaleGeo) {
      console.error('[CONNECTOR] fêmea: topologia e volume inalterados após subtração — furo não criado')
      throw new Error('a fêmea não removeu material: a subtração não alterou a geometria (furo cego)')
    }
  }

  // ── 6. VERIFICAÇÃO DO PAR (regra absoluta): fêmea comporta o macho ────────
  if (maleGeo && femaleGeo && !(femaleDepth + 1e-6 >= heightUsed)) {
    console.error(`[CONNECTOR] par incompatível: cavidade ${femaleDepth.toFixed(2)}mm < pino ${heightUsed.toFixed(2)}mm`)
    throw new Error('o par ficou incompatível (cavidade menor que o pino) — encaixe descartado')
  }

  for (const g of [maleGeo, femaleGeo]) {
    if (!g) continue
    g.computeVertexNormals()
    g.computeBoundingBox()
    g.computeBoundingSphere()
  }

  return { maleGeo, femaleGeo, femaleDepth, heightUsed, validation }
}

/**
 * Gate do pre-flight: a ferramenta CSG (em frame local do alvo) precisa
 * intersectar a peça — caso contrário o booleano seria cego (pino flutuante
 * ou furo fora da peça). Barato (só bounding boxes).
 */
function brushIntersectsMesh(brush: Brush, targetMesh: THREE.Mesh): boolean {
  try {
    const targetBox = boxOf(targetMesh.geometry)
    if (!targetBox) return false
    const brushBox = boxOfBrush(brush)
    if (!brushBox) return false
    return targetBox.intersectsBox(brushBox)
  } catch {
    return false
  }
}

/** Bounding box local de uma geometria (null se vazia). */
function boxOf(geo: THREE.BufferGeometry): THREE.Box3 | null {
  try {
    const p = geo.getAttribute('position') as THREE.BufferAttribute
    if (!p || p.count === 0) return null
    return new THREE.Box3().setFromBufferAttribute(p)
  } catch {
    return null
  }
}

/** Bounding box da ferramenta CSG no frame do alvo (recompõe a matriz antes). */
function boxOfBrush(brush: Brush): THREE.Box3 | null {
  try {
    brush.updateMatrixWorld(true)
    const p = brush.geometry.getAttribute('position') as THREE.BufferAttribute
    if (!p || p.count === 0) return null
    return new THREE.Box3().setFromBufferAttribute(p).applyMatrix4(brush.matrixWorld)
  } catch {
    return null
  }
}

/**
 * Converte `center`/`direction` do frame da `source` para o frame da `target`.
 * Quando `target === source` (mesma malha) não há conversão.
 */
function toTargetFrame(
  target: THREE.Mesh,
  source: THREE.Mesh,
  center: THREE.Vector3,
  direction: THREE.Vector3,
): { center: THREE.Vector3; direction: THREE.Vector3 } {
  if (target === source) {
    return { center: center.clone(), direction: direction.clone().normalize() }
  }
  const srcM = new THREE.Matrix4().compose(source.position, source.quaternion, source.scale)
  const tgtM = new THREE.Matrix4().compose(target.position, target.quaternion, target.scale)
  const invTgt = tgtM.clone().invert()
  return {
    center: center.clone().applyMatrix4(srcM).applyMatrix4(invTgt),
    direction: direction.clone().transformDirection(srcM).transformDirection(invTgt).normalize(),
  }
}

/** Cilindro com base no plano da costura (local) estendendo ao longo de `dir`. */
function makeCylinderBrush(
  radius: number,
  length: number,
  center: THREE.Vector3,
  dir: THREE.Vector3,
): Brush {
  const geo = new THREE.CylinderGeometry(radius, radius, length, 48, 1, false)
  geo.translate(0, length / 2, 0)
  const b = new Brush(geo)
  b.position.copy(center)
  b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
  b.updateMatrixWorld()
  return b
}

function csgUnion(a: THREE.BufferGeometry, b: Brush): THREE.BufferGeometry {
  const ev = new Evaluator()
  ev.attributes = ['position', 'normal']
  const ba = new Brush(ensureNormals(a.clone()))
  ba.updateMatrixWorld()
  return ev.evaluate(ba, b, UNION).geometry
}

function csgSubtract(a: THREE.BufferGeometry, b: Brush): THREE.BufferGeometry {
  const ev = new Evaluator()
  ev.attributes = ['position', 'normal']
  const ba = new Brush(ensureNormals(a.clone()))
  ba.updateMatrixWorld()
  return ev.evaluate(ba, b, SUBTRACTION).geometry
}

/**
 * O three-bvh-csg exige atributo `normal` na geometria de entrada; sem ele,
 * o Evaluator lança "Cannot read properties of undefined". Garante o atributo
 * antes do CSG (necessário para malhas de corte que não tenham normais).
 */
function ensureNormals(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  if (!geo.getAttribute('normal')) {
    if (!geo.boundingBox) geo.computeBoundingBox()
    geo.computeVertexNormals()
  }
  return geo
}

function disposeBrush(b: Brush): void {
  try { b.geometry?.dispose() } catch {}
}

/** Estatísticas de uma malha para validar que o CSG efetivamente rodou. */
function meshStats(geo: THREE.BufferGeometry): { verts: number; volume: number } {
  const pos = geo.getAttribute('position')
  const verts = pos ? pos.count : 0
  let volume = 0
  try {
    volume = estimateVolume(geo)
  } catch {
    volume = 0
  }
  return { verts, volume }
}

/**
 * Profundidade da cavidade da fêmea: suficiente para receber o macho
 * (height + folga de 0.1mm), mas nunca atravessando a peça.
 */
function computeFemaleDepth(
  mesh: THREE.Mesh,
  center: THREE.Vector3,
  direction: THREE.Vector3,
  height: number,
): number {
  const thickness = measureThickness(mesh, center, direction)
  // Folga axial: o macho entra `height` e o fundo da cavidade fica
  // AXIAL_CLEARANCE_MM além da ponta do macho.
  const ideal = height + AXIAL_CLEARANCE_MM
  if (thickness <= 0) return Math.max(1, ideal)
  return Math.max(0.8, Math.min(ideal, thickness - FEMALE_WALL_MM))
}

/**
 * Mede a espessura da peça ao longo de `dir` a partir de `center`.
 * `center`/`dir` estão no frame LOCAL da geometria da `mesh` (já convertidos
 * por toTargetFrame ou ancorados na superfície). A medida é feita com um mesh
 * sem transformação (frame local), então independe de position/quaternion/scale
 * e funciona mesmo para malhas fora da cena. Como a superfície de partida já
 * está ancorada na face, a espessura é a distância da interseção mais distante
 * (robusto tanto com origem fora quanto dentro do material).
 */
export function measureThickness(
  mesh: THREE.Mesh,
  center: THREE.Vector3,
  dir: THREE.Vector3,
): number {
  try {
    const origin = center.clone().addScaledVector(dir, 0.02)
    const ray = new THREE.Raycaster(origin, dir.clone().normalize())
    ray.near = 1e-4
    ray.far = 1e5
    // DoubleSide: conta tanto a entrada quanto a saída da malha.
    const probe = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
    const hits = ray.intersectObject(probe, false)
    if (hits.length === 0) return 0
    return Math.max(0, hits[hits.length - 1].distance)
  } catch {
    return 0
  }
}

/**
 * Ancorar o centro do encaixe na superfície da malha alvo ao longo do eixo.
 * Percorre o eixo completo (ambos os sentidos) e escolhe o ponto de
 * interseção mais próximo do centro da costura — é a face do corte. O centro
 * retornado fica levemente "antes" do ponto (contra a direção), para que:
 *  - o MACHO mergulhe um pouco no material e a união seja limpa;
 *  - a FÊMEA abra a boca completa na superfície.
 *
 * Retorna `hit: false` quando o eixo NÃO atinge a malha — o pre-flight usa
 * esse sinal para barrar com mensagem precisa (em vez de criar par cego).
 */
function snapCenterToSurface(
  mesh: THREE.Mesh,
  center: THREE.Vector3,
  dir: THREE.Vector3,
): { point: THREE.Vector3; hit: boolean } {
  try {
    const probe = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
    const d = dir.clone().normalize()
    const BIG = 1e4
    const pts: THREE.Vector3[] = []
    for (const s of [1, -1]) {
      const origin = center.clone().addScaledVector(d, -s * BIG)
      const ray = new THREE.Raycaster(origin, d.clone().multiplyScalar(s))
      ray.near = 1e-5
      ray.far = BIG * 2
      for (const h of ray.intersectObject(probe, false)) pts.push(h.point.clone())
    }
    if (pts.length === 0) return { point: center.clone(), hit: false }
    let best = pts[0]
    let bestD = Infinity
    for (const p of pts) {
      const dd = p.distanceToSquared(center)
      if (dd < bestD) {
        bestD = dd
        best = p
      }
    }
    return { point: best.clone().addScaledVector(d, -0.1), hit: true }
  } catch {
    return { point: center.clone(), hit: false }
  }
}

function fmtV3(v: THREE.Vector3): string {
  return `[${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)}]`
}

function fmtBox(b: THREE.Box3): string {
  const mn = b.min
  const mx = b.max
  return `min=${fmtV3(mn)} max=${fmtV3(mx)}`
}
