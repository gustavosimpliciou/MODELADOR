/**
 * Smart AutoCut — AutoCut Inteligente na Seleção (SmartCut → AutoCut)
 * ------------------------------------------------------------------
 * Recebe uma REGIÃO selecionada pelo SmartCut (conjunto de faces) e decide
 * automaticamente a MELHOR forma de separá-la do resto do modelo:
 *
 *   1. Extrai a "costura" da seleção (arestas entre faces selecionadas e não
 *      selecionadas) — a junção natural onde o corte deve passar.
 *   2. Ajusta um PLANO por mínimos quadrados (PCA) ao anel de costura.
 *      - 'plano'       → plano alinhado ao eixo de menor variação.
 *      - 'inteligente' → melhor plano; se estiver ~alinhado a um eixo, encaixa
 *                        nele (corte mais limpo). Caso contrário, inclina.
 *      - 'adaptativo'  → melhor plano ajustado, sempre inclinado se necessário.
 *   3. Analisa a seção transversal (área, espessura, alongamento) para decidir
 *      se ENCAIXES agregam valor — e quantos/qual tipo.
 *   4. Planeja os encaixes (posição, orientação, raio, profundidade, tipo).
 *
 * O corte físico watertight reaproveita `solidPlaneCut`; os furos dos encaixes
 * são feitos por CSG (three-bvh-csg) no componente de UI.
 */

import * as THREE from 'three'

export type CutType = 'smart' | 'plane' | 'adaptive'
export type ConnectorType =
  | 'auto'
  | 'cylindrical'
  | 'conical'
  | 'rectangular'
  | 'oval'
  | 'keyed'

/** Resultado da análise geométrica da seleção. */
export interface SelectionAnalysis {
  /** Nº de arestas na costura entre seleção e resto. */
  seamEdges: number
  /** Centróide do anel de costura (espaço local). */
  seamCenter: THREE.Vector3
  /** Centróide da região selecionada (espaço local). */
  selectionCenter: THREE.Vector3
  /** Normal do melhor plano ajustado (PCA, menor variação). */
  fitNormal: THREE.Vector3
  /** Normal alinhada ao eixo cartesiano de menor extensão da costura. */
  axisNormal: THREE.Vector3
  /** Eixos no plano (perpendiculares à fitNormal). */
  planeU: THREE.Vector3
  planeV: THREE.Vector3
  /** Meia-extensão da seção nos eixos do plano. */
  halfU: number
  halfV: number
  /** Área aproximada da seção transversal (elipse dos extremos). */
  crossArea: number
  /** Planaridade 0..1 — quão bem a costura cabe num plano (1 = perfeitamente plana). */
  planarity: number
  /** Ângulo (graus) entre a fitNormal e o eixo cartesiano mais próximo. */
  axisTilt: number
  /** Diagonal da bounding box do modelo (referência de escala). */
  modelDiagonal: number
  /** true se a seleção tem costura utilizável (senão usa fallback por bbox). */
  hasSeam: boolean
}

export interface ResolvedConnectors {
  enabled: boolean
  count: number
  type: Exclude<ConnectorType, 'auto'>
  /** Raio base (mm nas unidades do modelo). */
  radius: number
  /** Profundidade por lado. */
  depth: number
  /** Motivo caso desabilitado automaticamente. */
  skipReason?: string
}

export interface ConnectorSpec {
  position: THREE.Vector3
  quaternion: THREE.Quaternion
  type: Exclude<ConnectorType, 'auto'>
  radius: number
  depth: number
}

// ─── Utilidades de vértice ──────────────────────────────────────────────────
const Q = 1e4
function keyOf(x: number, y: number, z: number): string {
  return `${Math.round(x * Q)},${Math.round(y * Q)},${Math.round(z * Q)}`
}

/**
 * Analisa a seleção e devolve as métricas necessárias para o AutoCut.
 */
export function analyzeSelection(
  geometry: THREE.BufferGeometry,
  selectedFaces: Set<number>,
): SelectionAnalysis {
  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute
  const idxAttr = geometry.index
  const faceCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3

  if (!geometry.boundingBox) geometry.computeBoundingBox()
  const bbox = geometry.boundingBox!
  const size = new THREE.Vector3()
  bbox.getSize(size)
  const modelDiagonal = size.length() || 1

  // Soldagem de vértices por posição
  const keyToId = new Map<string, number>()
  const idPos: number[] = []
  const vId = (v: number): number => {
    const k = keyOf(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v))
    let id = keyToId.get(k)
    if (id === undefined) {
      id = idPos.length / 3
      keyToId.set(k, id)
      idPos.push(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v))
    }
    return id
  }

  const cornerId = (f: number, c: number): number =>
    vId(idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c)

  // Mapa de aresta → contagem de faces selecionadas / não selecionadas
  interface EdgeInfo { sel: number; unsel: number; a: number; b: number }
  const edges = new Map<string, EdgeInfo>()

  const selCenter = new THREE.Vector3()
  let selFaceCount = 0

  for (let f = 0; f < faceCount; f++) {
    const isSel = selectedFaces.has(f)
    const a = cornerId(f, 0)
    const b = cornerId(f, 1)
    const c = cornerId(f, 2)

    if (isSel) {
      // acumula centróide da seleção
      selCenter.x += (idPos[a * 3] + idPos[b * 3] + idPos[c * 3]) / 3
      selCenter.y += (idPos[a * 3 + 1] + idPos[b * 3 + 1] + idPos[c * 3 + 1]) / 3
      selCenter.z += (idPos[a * 3 + 2] + idPos[b * 3 + 2] + idPos[c * 3 + 2]) / 3
      selFaceCount++
    }

    const tri: [number, number][] = [
      [a, b],
      [b, c],
      [c, a],
    ]
    for (const [x, y] of tri) {
      const lo = Math.min(x, y)
      const hi = Math.max(x, y)
      const k = `${lo}_${hi}`
      let info = edges.get(k)
      if (!info) {
        info = { sel: 0, unsel: 0, a: lo, b: hi }
        edges.set(k, info)
      }
      if (isSel) info.sel++
      else info.unsel++
    }
  }

  if (selFaceCount > 0) selCenter.multiplyScalar(1 / selFaceCount)

  // Costura = arestas com pelo menos uma face selecionada e uma não selecionada
  const seamPointIds = new Set<number>()
  let seamEdges = 0
  for (const info of edges.values()) {
    if (info.sel > 0 && info.unsel > 0) {
      seamEdges++
      seamPointIds.add(info.a)
      seamPointIds.add(info.b)
    }
  }

  // ── Fallback: sem costura utilizável (seleção isolada ou peça inteira) ──────
  if (seamPointIds.size < 3) {
    return fallbackAnalysis(geometry, selectedFaces, selCenter, modelDiagonal, idPos)
  }

  // Pontos da costura
  const pts: THREE.Vector3[] = []
  const seamCenter = new THREE.Vector3()
  for (const id of seamPointIds) {
    const p = new THREE.Vector3(idPos[id * 3], idPos[id * 3 + 1], idPos[id * 3 + 2])
    pts.push(p)
    seamCenter.add(p)
  }
  seamCenter.multiplyScalar(1 / pts.length)

  // ── PCA: covariância dos pontos da costura ─────────────────────────────────
  const cov = covariance(pts, seamCenter)
  const { values, vectors } = symmetricEigen3(cov)
  // values ascendente → vectors[0] é a menor variação = normal do plano
  const fitNormal = vectors[0].clone().normalize()
  const planeU = vectors[2].clone().normalize() // maior variação
  const planeV = vectors[1].clone().normalize()

  // Planaridade: 1 - (menorVar / mediaVar) — alta quando a costura é bem plana
  const sumVar = values[0] + values[1] + values[2] || 1
  const planarity = clamp01(1 - values[0] / (sumVar / 3))

  // Extensões na base do plano
  let halfU = 0
  let halfV = 0
  for (const p of pts) {
    const rel = p.clone().sub(seamCenter)
    halfU = Math.max(halfU, Math.abs(rel.dot(planeU)))
    halfV = Math.max(halfV, Math.abs(rel.dot(planeV)))
  }
  const crossArea = Math.PI * halfU * halfV

  // Eixo cartesiano mais próximo da fitNormal
  const { axisNormal, tilt } = nearestAxis(fitNormal)

  return {
    seamEdges,
    seamCenter,
    selectionCenter: selCenter,
    fitNormal,
    axisNormal,
    planeU,
    planeV,
    halfU,
    halfV,
    crossArea,
    planarity,
    axisTilt: tilt,
    modelDiagonal,
    hasSeam: true,
  }
}

/** Fallback quando não há costura clara: usa a bbox da seleção. */
function fallbackAnalysis(
  geometry: THREE.BufferGeometry,
  selectedFaces: Set<number>,
  selCenter: THREE.Vector3,
  modelDiagonal: number,
  idPos: number[],
): SelectionAnalysis {
  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute
  const idxAttr = geometry.index

  const box = new THREE.Box3()
  const v = new THREE.Vector3()
  for (const f of selectedFaces) {
    for (let c = 0; c < 3; c++) {
      const vi = idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c
      v.set(posAttr.getX(vi), posAttr.getY(vi), posAttr.getZ(vi))
      box.expandByPoint(v)
    }
  }
  const size = new THREE.Vector3()
  box.getSize(size)
  const center = new THREE.Vector3()
  box.getCenter(center)

  // Eixo de menor extensão da caixa = normal
  const comps: [number, THREE.Vector3][] = [
    [size.x, new THREE.Vector3(1, 0, 0)],
    [size.y, new THREE.Vector3(0, 1, 0)],
    [size.z, new THREE.Vector3(0, 0, 1)],
  ]
  comps.sort((a, b) => a[0] - b[0])
  const normal = comps[0][1]
  const planeU = comps[2][1]
  const planeV = comps[1][1]

  return {
    seamEdges: 0,
    seamCenter: center,
    selectionCenter: selCenter.lengthSq() > 0 ? selCenter : center,
    fitNormal: normal.clone(),
    axisNormal: normal.clone(),
    planeU,
    planeV,
    halfU: comps[2][0] / 2,
    halfV: comps[1][0] / 2,
    crossArea: (Math.PI * comps[2][0] * comps[1][0]) / 4,
    planarity: 0.5,
    axisTilt: 0,
    modelDiagonal,
    hasSeam: false,
  }
}

/**
 * Escolhe o plano de corte de acordo com o tipo pedido.
 * Devolve normal + ponto no espaço local da geometria.
 */
export function computeAutoCutPlane(
  analysis: SelectionAnalysis,
  cutType: CutType,
): { normal: THREE.Vector3; point: THREE.Vector3 } {
  const point = analysis.seamCenter.clone()

  if (cutType === 'plane') {
    return { normal: analysis.axisNormal.clone(), point }
  }
  if (cutType === 'adaptive') {
    return { normal: analysis.fitNormal.clone(), point }
  }
  // 'smart': encaixa no eixo se estiver quase alinhado, senão inclina
  if (analysis.axisTilt <= 14) {
    return { normal: analysis.axisNormal.clone(), point }
  }
  return { normal: analysis.fitNormal.clone(), point }
}

/**
 * Decide automaticamente se os encaixes agregam valor e resolve os parâmetros.
 * Mesmo com createConnectors=true, pode desabilitar por segurança estrutural.
 */
export function recommendConnectors(
  analysis: SelectionAnalysis,
  opts: {
    createConnectors: boolean
    type: ConnectorType
    count: number | 'auto'
  },
): ResolvedConnectors {
  const minDim = Math.min(analysis.halfU, analysis.halfV) * 2
  const maxDim = Math.max(analysis.halfU, analysis.halfV) * 2
  const diag = analysis.modelDiagonal

  const disabled = (skipReason: string): ResolvedConnectors => ({
    enabled: false,
    count: 0,
    type: 'cylindrical',
    radius: 0,
    depth: 0,
    skipReason,
  })

  if (!opts.createConnectors) return disabled('encaixes desativados')

  // Detecção automática: peça muito pequena / seção muito fina → sem encaixe
  if (minDim < diag * 0.025) return disabled('seção fina demais para encaixe seguro')
  if (analysis.crossArea < (diag * diag) * 0.0009) return disabled('seção pequena demais')

  // Raio base ~ 18% da menor dimensão, limitado
  const radius = clamp(minDim * 0.18, diag * 0.006, diag * 0.06)
  const depth = clamp(radius * 2.4, diag * 0.02, diag * 0.14)

  // Quantidade automática por tamanho da seção
  let count: number
  if (opts.count === 'auto') {
    if (maxDim > diag * 0.28) count = 3
    else if (maxDim > diag * 0.12) count = 2
    else count = 1
  } else {
    count = opts.count
  }
  // Não cria mais encaixes do que cabem lado a lado
  const maxFit = Math.max(1, Math.floor(maxDim / (radius * 3)))
  count = Math.min(count, maxFit)

  // Tipo automático: seção alongada → chavetado (anti-rotação); senão cilíndrico
  let type: Exclude<ConnectorType, 'auto'>
  if (opts.type === 'auto') {
    const aspect = maxDim / (minDim || 1)
    type = aspect > 1.8 ? 'keyed' : 'cylindrical'
  } else {
    type = opts.type
  }

  return { enabled: true, count, type, radius, depth }
}

/**
 * Planeja as posições/orientações dos encaixes ao longo da seção do corte.
 */
export function planConnectors(
  analysis: SelectionAnalysis,
  plane: { normal: THREE.Vector3; point: THREE.Vector3 },
  resolved: ResolvedConnectors,
): ConnectorSpec[] {
  if (!resolved.enabled || resolved.count <= 0) return []

  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    plane.normal.clone().normalize(),
  )

  // Distribui ao longo do eixo perpendicular mais largo da seção
  const useU = analysis.halfU >= analysis.halfV
  const along = (useU ? analysis.planeU : analysis.planeV).clone().normalize()
  const half = useU ? analysis.halfU : analysis.halfV
  const usableHalf = Math.max(half - resolved.radius * 1.5, 0)

  const specs: ConnectorSpec[] = []
  const n = resolved.count
  for (let i = 0; i < n; i++) {
    // t de -1..1 distribuído; centro quando n ímpar
    const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1
    const pos = plane.point.clone().add(along.clone().multiplyScalar(t * usableHalf))
    specs.push({
      position: pos,
      quaternion: quat.clone(),
      type: resolved.type,
      radius: resolved.radius,
      depth: resolved.depth,
    })
  }
  return specs
}

// ─── Geradores de geometria dos encaixes (altura ao longo de +Y) ──────────────
/**
 * Geometria do FURO (operando de CSG). Usa a folga (tolerance) somada ao raio.
 * A altura atravessa a junta para furar as duas peças.
 */
export function makeHoleGeometry(
  type: Exclude<ConnectorType, 'auto'>,
  radius: number,
  tolerance: number,
  depth: number,
): THREE.BufferGeometry {
  const r = radius + tolerance
  const h = depth * 2 + Math.max(depth * 0.25, radius * 0.5)
  return makeShape(type, r, h)
}

/**
 * Geometria do PINO (dowel), exibido no vão da junta. Levemente mais curto
 * que o furo para folga de encaixe.
 */
export function makeDowelGeometry(
  type: Exclude<ConnectorType, 'auto'>,
  radius: number,
  depth: number,
): THREE.BufferGeometry {
  const h = depth * 2 - Math.min(0.4, depth * 0.1)
  return makeShape(type, radius, h)
}

function makeShape(
  type: Exclude<ConnectorType, 'auto'>,
  r: number,
  h: number,
): THREE.BufferGeometry {
  let geo: THREE.BufferGeometry
  switch (type) {
    case 'conical':
      geo = new THREE.CylinderGeometry(r * 0.6, r, h, 28)
      break
    case 'rectangular':
      geo = new THREE.BoxGeometry(r * 1.8, h, r * 1.8)
      break
    case 'oval':
      geo = new THREE.CylinderGeometry(r, r, h, 28)
      geo.scale(1.7, 1, 0.7)
      break
    case 'keyed':
      // Prisma achatado (formato de chaveta) — impede rotação da junta
      geo = new THREE.BoxGeometry(r * 2.4, h, r * 1.05)
      break
    case 'cylindrical':
    default:
      geo = new THREE.CylinderGeometry(r, r, h, 28)
      break
  }
  geo.deleteAttribute('uv')
  return geo
}

// ─── Álgebra linear ──────────────────────────────────────────────────────────
type Mat3 = [number, number, number, number, number, number, number, number, number]

function covariance(pts: THREE.Vector3[], center: THREE.Vector3): Mat3 {
  let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0
  for (const p of pts) {
    const dx = p.x - center.x
    const dy = p.y - center.y
    const dz = p.z - center.z
    xx += dx * dx
    xy += dx * dy
    xz += dx * dz
    yy += dy * dy
    yz += dy * dz
    zz += dz * dz
  }
  const n = pts.length || 1
  return [xx / n, xy / n, xz / n, xy / n, yy / n, yz / n, xz / n, yz / n, zz / n]
}

/**
 * Autovalores/autovetores de uma matriz simétrica 3x3 via Jacobi cíclico.
 * Retorna valores em ordem ascendente com os vetores correspondentes.
 */
function symmetricEigen3(m: Mat3): { values: number[]; vectors: THREE.Vector3[] } {
  // Matriz de trabalho
  const a = [
    [m[0], m[1], m[2]],
    [m[3], m[4], m[5]],
    [m[6], m[7], m[8]],
  ]
  // Matriz de autovetores (identidade)
  const v = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]

  for (let sweep = 0; sweep < 32; sweep++) {
    // Soma dos off-diagonais
    const off = Math.abs(a[0][1]) + Math.abs(a[0][2]) + Math.abs(a[1][2])
    if (off < 1e-12) break

    for (const [p, q] of [[0, 1], [0, 2], [1, 2]] as [number, number][]) {
      const apq = a[p][q]
      if (Math.abs(apq) < 1e-15) continue
      const app = a[p][p]
      const aqq = a[q][q]
      const phi = 0.5 * Math.atan2(2 * apq, aqq - app)
      const c = Math.cos(phi)
      const s = Math.sin(phi)

      // Rotação a = Jᵀ a J
      for (let k = 0; k < 3; k++) {
        const akp = a[k][p]
        const akq = a[k][q]
        a[k][p] = c * akp - s * akq
        a[k][q] = s * akp + c * akq
      }
      for (let k = 0; k < 3; k++) {
        const apk = a[p][k]
        const aqk = a[q][k]
        a[p][k] = c * apk - s * aqk
        a[q][k] = s * apk + c * aqk
      }
      // Acumula autovetores
      for (let k = 0; k < 3; k++) {
        const vkp = v[k][p]
        const vkq = v[k][q]
        v[k][p] = c * vkp - s * vkq
        v[k][q] = s * vkp + c * vkq
      }
    }
  }

  const eig = [
    { val: a[0][0], vec: new THREE.Vector3(v[0][0], v[1][0], v[2][0]) },
    { val: a[1][1], vec: new THREE.Vector3(v[0][1], v[1][1], v[2][1]) },
    { val: a[2][2], vec: new THREE.Vector3(v[0][2], v[1][2], v[2][2]) },
  ]
  eig.sort((x, y) => x.val - y.val)
  return {
    values: eig.map((e) => e.val),
    vectors: eig.map((e) => e.vec.normalize()),
  }
}

function nearestAxis(n: THREE.Vector3): { axisNormal: THREE.Vector3; tilt: number } {
  const ax = Math.abs(n.x)
  const ay = Math.abs(n.y)
  const az = Math.abs(n.z)
  let axisNormal: THREE.Vector3
  let dot: number
  if (ax >= ay && ax >= az) {
    axisNormal = new THREE.Vector3(Math.sign(n.x) || 1, 0, 0)
    dot = ax
  } else if (ay >= ax && ay >= az) {
    axisNormal = new THREE.Vector3(0, Math.sign(n.y) || 1, 0)
    dot = ay
  } else {
    axisNormal = new THREE.Vector3(0, 0, Math.sign(n.z) || 1)
    dot = az
  }
  const tilt = Math.acos(clamp(dot, 0, 1)) * (180 / Math.PI)
  return { axisNormal, tilt }
}

function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x
}
function clamp01(x: number): number {
  return clamp(x, 0, 1)
}
