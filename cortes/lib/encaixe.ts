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
}

// ─── Planejamento / limites inteligentes ───────────────────────────────────────

const HEIGHT_MIN = 3
const HEIGHT_MAX = 8
const RADIUS_MM_MIN = 0.8
const FEMALE_WALL_MM = 0.5

/**
 * Analisa a seleção e calcula os limites do encaixe. Não modifica nada.
 * Retorna `null` quando a seleção não tem costura utilizável.
 */
export function analyzeEncaixe(
  geometry: THREE.BufferGeometry,
  selectedFaces: Set<number>,
  parts: EncaixePart[],
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

  // Complemento: OUTRA peça (nunca a própria ativa, identificada pela mesma
  // geometria) no lado da normal e mais próxima do centro.
  let complementIndex = -1
  let bestDist = Infinity
  for (let i = 0; i < parts.length; i++) {
    const partMesh = parts[i]?.mesh
    if (!partMesh || partMesh.geometry === geometry) continue
    const geo = partMesh.geometry
    if (!geo.boundingBox) geo.computeBoundingBox()
    const bbCenter = new THREE.Vector3()
    geo.boundingBox!.getCenter(bbCenter)
    const sideSign = bbCenter.clone().sub(center).dot(normal)
    const penalty = sideSign < 0 ? 1e6 : 0
    const score = bbCenter.distanceTo(center) + penalty
    if (score < bestDist) {
      bestDist = score
      complementIndex = i
    }
  }

  // Altura máxima limitada pela espessura da peça receptora (não atravessar).
  // Mantém a folga generosa para o usuário ajustar (apenas a parede de segurança).
  let maxHeight = HEIGHT_MAX
  if (complementIndex >= 0) {
    const thickness = measureThickness(parts[complementIndex].mesh, center, normal)
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
 * Gera as geometrias definitivas conforme o `mode`:
 *  - 'male'   → macho  = UNIÃO da peça com um cilindro (pino integrado);
 *  - 'female' → fêmea  = SUBTRAÇÃO da peça com um cilindro maior (furo);
 *  - 'both'   → macho na peça ativa + fêmea no complemento.
 *
 * `center`/`direction` estão no frame da `sourceMesh` (peça ativa). Cada
 * operação é executada no frame local da malha alvo (conversão automática),
 * então o encaixe alinha mesmo quando as peças estão deslocadas entre si.
 * Pode lançar — envolva em try/catch no chamador.
 */
export function applyEncaixe(params: EncaixeApplyParams): EncaixeResult {
  const { center, direction, radius, height, tolerance, mode, sourceMesh, maleMesh, femaleMesh } = params

  let maleGeo: THREE.BufferGeometry | null = null
  let femaleGeo: THREE.BufferGeometry | null = null
  let femaleDepth = 0

  if (mode === 'male' || mode === 'both') {
    const f = toTargetFrame(maleMesh, sourceMesh, center, direction)
    const brush = makeCylinderBrush(radius, height, f.center, f.direction)
    maleGeo = csgUnion(maleMesh.geometry, brush)
    disposeBrush(brush)
  }

  if (mode === 'female' || mode === 'both') {
    const f = toTargetFrame(femaleMesh, sourceMesh, center, direction)
    femaleDepth = computeFemaleDepth(femaleMesh, f.center, f.direction, height, tolerance)
    const brush = makeCylinderBrush(radius + tolerance, femaleDepth, f.center, f.direction)
    femaleGeo = csgSubtract(femaleMesh.geometry, brush)
    disposeBrush(brush)
  }

  for (const g of [maleGeo, femaleGeo]) {
    if (!g) continue
    g.computeVertexNormals()
    g.computeBoundingBox()
    g.computeBoundingSphere()
  }

  return { maleGeo, femaleGeo, femaleDepth }
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

/**
 * Profundidade da cavidade da fêmea: suficiente para receber o macho
 * (height + tolerance + folga), mas nunca atravessando a peça.
 */
function computeFemaleDepth(
  mesh: THREE.Mesh,
  center: THREE.Vector3,
  direction: THREE.Vector3,
  height: number,
  tolerance: number,
): number {
  const thickness = measureThickness(mesh, center, direction)
  const ideal = height + tolerance + 1
  if (thickness <= 0) return Math.max(1, ideal)
  return Math.max(0.8, Math.min(ideal, thickness - FEMALE_WALL_MM))
}

/**
 * Mede a espessura da peça ao longo de `dir` a partir do centro do encaixe.
 * `center`/`dir` estão no frame LOCAL da geometria da `mesh` (já convertidos
 * por toTargetFrame). A medida é feita com um mesh sem transformação (frame
 * local), então independe de position/quaternion/scale e funciona mesmo para
 * malhas fora da cena.
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
    const probe = new THREE.Mesh(mesh.geometry)
    const hits = ray.intersectObject(probe, false)
    if (hits.length < 2) return 0
    return Math.max(0, hits[hits.length - 1].distance - hits[0].distance)
  } catch {
    return 0
  }
}
