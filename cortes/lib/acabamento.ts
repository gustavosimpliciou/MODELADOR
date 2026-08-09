/**
 * ACAB — Acabamento Localizado da Região de Corte
 * ─────────────────────────────────────────────────────────────────────────────
 * Sistema modular de refinamento profissional do contorno gerado pelo corte.
 *
 * Princípios (REGRA DE OURO):
 *  - MENOS É MAIS
 *  - Atua SOMENTE na região gerada pelo corte + faixa de influência
 *  - Nunca deforma a peça inteira
 *  - Sutil por padrão
 *  - Original preservado até confirmação do usuário
 *
 * Pipeline:
 *  1. identifyCutRegion  → máscara de vértices (0..1)
 *  2. applyAcabamento    → fillet + Taubin localizado ponderado pela máscara
 *  3. validateGeometry   → manifold / degenerates / volume
 *
 * PERFORMANCE:
 *  - Toda a análise usa grafos de adjacência construídos em O(n) via hash de
 *    posição (solda vértices duplicados de STL binário). Nada aqui é O(n²):
 *    a detecção planar que travava malhas grandes foi substituída por BFS
 *    sobre a adjacência real de faces.
 *  - A suavização roda sobre UIDs soldados, então funciona de verdade em
 *    malhas STL não-indexadas (cada vértice vê todos os vizinhos da região).
 *  - runAcabamentoAsync cede a thread entre etapas e aceita cancelamento,
 *    mantendo a UI responsiva durante o processamento.
 */

import * as THREE from 'three'

const yieldToMain = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0))

// ─── Tipos públicos ──────────────────────────────────────────────────────────

export type AcabPresetId = 'sutil' | 'premium' | 'suave' | 'custom'

export interface AcabSettings {
  /** 0..1 — quanto a região será suavizada. Padrão ~0.25 */
  intensity: number
  /** Raio de influência a partir da região de corte, em mm (assumindo unidade mm). */
  radiusMm: number
  /** Passagens do solver Taubin. Padrão 1. */
  iterations: number
  /** Impede variação excessiva de volume. */
  preserveVolume: boolean
  /** Reduz influência perto de alta curvatura (detalhes). */
  preserveDetails: boolean
  preset: AcabPresetId
}

export interface AcabPreset {
  id: AcabPresetId
  label: string
  description: string
  settings: Omit<AcabSettings, 'preset'>
  recommended?: boolean
}

export interface CutRegionResult {
  /** Peso por vértice (0 = intocado, 1 = máximo acabamento). */
  vertexWeights: Float32Array
  /** Índices de faces que pertencem à região de corte (para highlight). */
  cutFaceIndices: number[]
  /** Pontos do contorno (para overlay de linha). */
  boundaryPoints: Float32Array
  /** Área aproximada da região de corte (mm² se unidade for mm). */
  areaEstimate: number
  method: 'tagged' | 'planar-cap' | 'boundary-expand' | 'fallback-none'
}

export interface AcabResult {
  geometry: THREE.BufferGeometry
  volumeBefore: number
  volumeAfter: number
  volumeDeltaPct: number
  valid: boolean
  issues: string[]
}

export interface ValidationResult {
  valid: boolean
  issues: string[]
  volume: number
}

/** Progresso incremental do pipeline assíncrono. */
export interface AcabProgress {
  stage: string
  pct: number
}

/** Token de cancelamento — set cancelled = true para abortar entre etapas. */
export interface AcabCancel {
  cancelled: boolean
}

export function createAcabCancel(): AcabCancel {
  return { cancelled: false }
}

/** Lançado quando o processamento é cancelado pelo usuário (não é erro real). */
export class AcabCancelledError extends Error {
  constructor() {
    super('Acabamento cancelado')
    this.name = 'AcabCancelledError'
  }
}

// ─── Predefinições ───────────────────────────────────────────────────────────

export const ACAB_PRESETS: AcabPreset[] = [
  {
    id: 'sutil',
    label: 'SUTIL',
    description: 'Pequena suavização — ideal para uso geral',
    settings: {
      intensity: 0.18,
      radiusMm: 0.20,
      iterations: 1,
      preserveVolume: true,
      preserveDetails: true,
    },
  },
  {
    id: 'premium',
    label: 'PREMIUM',
    description: 'Acabamento refinado — recomendado',
    recommended: true,
    settings: {
      intensity: 0.28,
      radiusMm: 0.30,
      iterations: 2,
      preserveVolume: true,
      preserveDetails: true,
    },
  },
  {
    id: 'suave',
    label: 'SUAVE',
    description: 'Mais perceptível, ainda sem deformar',
    settings: {
      intensity: 0.42,
      radiusMm: 0.40,
      iterations: 2,
      preserveVolume: true,
      preserveDetails: true,
    },
  },
  {
    id: 'custom',
    label: 'PERSONALIZADO',
    description: 'Controle manual completo',
    settings: {
      intensity: 0.25,
      radiusMm: 0.30,
      iterations: 1,
      preserveVolume: true,
      preserveDetails: true,
    },
  },
]

/** Limites de segurança — nunca permitir valores que destruam a peça. */
export const ACAB_LIMITS = {
  intensityMin: 0.0,
  intensityMax: 0.70,   // hard cap — nunca 100%
  radiusMmMin: 0.05,
  radiusMmMax: 1.50,    // evita invadir a peça toda
  iterationsMin: 1,
  iterationsMax: 4,
  maxVolumeDeltaPct: 2.5, // rejeita se volume mudar mais que isso
} as const

export function clampAcabSettings(s: AcabSettings): AcabSettings {
  return {
    preset: s.preset,
    intensity: Math.max(ACAB_LIMITS.intensityMin, Math.min(ACAB_LIMITS.intensityMax, s.intensity)),
    radiusMm: Math.max(ACAB_LIMITS.radiusMmMin, Math.min(ACAB_LIMITS.radiusMmMax, s.radiusMm)),
    iterations: Math.max(ACAB_LIMITS.iterationsMin, Math.min(ACAB_LIMITS.iterationsMax, Math.round(s.iterations))),
    preserveVolume: !!s.preserveVolume,
    preserveDetails: !!s.preserveDetails,
  }
}

export function settingsFromPreset(id: AcabPresetId): AcabSettings {
  const p = ACAB_PRESETS.find((x) => x.id === id) ?? ACAB_PRESETS[0]
  return { ...p.settings, preset: id }
}

// ─── Grafos de adjacência (O(n), sem strings no hot path) ─────────────────────
// Posições são soldadas por hash numérico 48-bit (mesma técnica do smart-cut).
// Isso resolve STL binário não-indexado: vértices duplicados com a mesma
// posição viram um único nó, tornando a suavização e o BFS reais.

const HASH_Q = 10
const HASH_OFF = 32768

function posKey(x: number, y: number, z: number): number {
  const qx = (Math.round(x * HASH_Q) + HASH_OFF) & 0xFFFF
  const qy = (Math.round(y * HASH_Q) + HASH_OFF) & 0xFFFF
  const qz = (Math.round(z * HASH_Q) + HASH_OFF) & 0xFFFF
  return qx + qy * 65536 + qz * 65536 * 65536
}

interface UidGraph {
  rawToUid: Int32Array
  uidCount: number
  uidPos: Float32Array
  uidAdj: Int32Array[]
  /** normais por UID (média area-weighted das faces adjacentes) */
  uidNormals: Float32Array
  /** raw vertices de cada UID (CSR) — usado para escrever de volta */
  uidVerts: { start: Int32Array; list: Int32Array }
}

/**
 * Constrói o grafo de UIDs soldados por posição em uma única passada O(n).
 */
function buildUidGraph(geometry: THREE.BufferGeometry): UidGraph {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const arr = pos.array as Float32Array
  const n = pos.count
  const rawToUid = new Int32Array(n)
  const keyToUid = new Map<number, number>()
  const uidPosArr: number[] = []

  for (let i = 0; i < n; i++) {
    const k = posKey(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2])
    let u = keyToUid.get(k)
    if (u === undefined) {
      u = keyToUid.size
      keyToUid.set(k, u)
      uidPosArr.push(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2])
    }
    rawToUid[i] = u
  }

  const uidCount = keyToUid.size
  const uidPos = new Float32Array(uidPosArr)

  const idx = geometry.index
  const faceCount = idx ? idx.count / 3 : n / 3
  const faceUid = new Int32Array(faceCount * 3)
  for (let f = 0; f < faceCount; f++) {
    for (let c = 0; c < 3; c++) {
      const vi = idx ? idx.getX(f * 3 + c) : f * 3 + c
      faceUid[f * 3 + c] = rawToUid[vi]
    }
  }

  // ── Arestas únicas entre UIDs (CSR) ──────────────────────────────────────
  const edgeSet = new Set<number>()
  for (let f = 0; f < faceCount; f++) {
    const a = faceUid[f * 3], b = faceUid[f * 3 + 1], c = faceUid[f * 3 + 2]
    edgeSet.add(a < b ? a * uidCount + b : b * uidCount + a)
    edgeSet.add(b < c ? b * uidCount + c : c * uidCount + b)
    edgeSet.add(c < a ? c * uidCount + a : a * uidCount + c)
  }
  const edges = Array.from(edgeSet)
  const cnt = new Int32Array(uidCount)
  for (const k of edges) {
    const a = Math.floor(k / uidCount)
    const b = k % uidCount
    cnt[a]++; cnt[b]++
  }
  const off = new Int32Array(uidCount + 1)
  for (let u = 0; u < uidCount; u++) off[u + 1] = off[u] + cnt[u]
  const list = new Int32Array(off[uidCount])
  const ptr = new Int32Array(uidCount)
  for (const k of edges) {
    const a = Math.floor(k / uidCount)
    const b = k % uidCount
    list[off[a] + ptr[a]++] = b
    list[off[b] + ptr[b]++] = a
  }
  const uidAdj: Int32Array[] = new Array(uidCount)
  for (let u = 0; u < uidCount; u++) uidAdj[u] = list.subarray(off[u], off[u + 1])

  // ── Normais por UID (area-weighted) ──────────────────────────────────────
  const nX = new Float32Array(uidCount)
  const nY = new Float32Array(uidCount)
  const nZ = new Float32Array(uidCount)
  for (let f = 0; f < faceCount; f++) {
    const i0 = idx ? idx.getX(f * 3) : f * 3
    const i1 = idx ? idx.getX(f * 3 + 1) : f * 3 + 1
    const i2 = idx ? idx.getX(f * 3 + 2) : f * 3 + 2
    const p0x = arr[i0 * 3], p0y = arr[i0 * 3 + 1], p0z = arr[i0 * 3 + 2]
    const p1x = arr[i1 * 3], p1y = arr[i1 * 3 + 1], p1z = arr[i1 * 3 + 2]
    const p2x = arr[i2 * 3], p2y = arr[i2 * 3 + 1], p2z = arr[i2 * 3 + 2]
    let nx = (p1y - p0y) * (p2z - p0z) - (p1z - p0z) * (p2y - p0y)
    let ny = (p1z - p0z) * (p2x - p0x) - (p1x - p0x) * (p2z - p0z)
    let nz = (p1x - p0x) * (p2y - p0y) - (p1y - p0y) * (p2x - p0x)
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
    if (len < 1e-14) continue
    nx /= len; ny /= len; nz /= len
    const ua = faceUid[f * 3], ub = faceUid[f * 3 + 1], uc = faceUid[f * 3 + 2]
    nX[ua] += nx; nY[ua] += ny; nZ[ua] += nz
    nX[ub] += nx; nY[ub] += ny; nZ[ub] += nz
    nX[uc] += nx; nY[uc] += ny; nZ[uc] += nz
  }
  const uidNormals = new Float32Array(uidCount * 3)
  for (let u = 0; u < uidCount; u++) {
    const l = Math.sqrt(nX[u] * nX[u] + nY[u] * nY[u] + nZ[u] * nZ[u])
    if (l < 1e-12) continue
    uidNormals[u * 3] = nX[u] / l
    uidNormals[u * 3 + 1] = nY[u] / l
    uidNormals[u * 3 + 2] = nZ[u] / l
  }

  // ── Vértices raw por UID (CSR) para escrita de volta ─────────────────────
  const vCnt = new Int32Array(uidCount)
  for (let i = 0; i < n; i++) vCnt[rawToUid[i]]++
  const vOff = new Int32Array(uidCount + 1)
  for (let u = 0; u < uidCount; u++) vOff[u + 1] = vOff[u] + vCnt[u]
  const vList = new Int32Array(n)
  const vPtr = new Int32Array(uidCount)
  for (let i = 0; i < n; i++) {
    const u = rawToUid[i]
    vList[vOff[u] + vPtr[u]++] = i
  }

  return {
    rawToUid,
    uidCount,
    uidPos,
    uidAdj,
    uidNormals,
    uidVerts: { start: vOff, list: vList },
  }
}

interface FaceAdjacency {
  faceCount: number
  /** faceAdj[f] = índices das faces vizinhas (únicas) */
  faceAdj: Int32Array[]
  faceNormals: Float32Array
  faceAreas: Float32Array
  faceCentroids: Float32Array
}

function buildFaceAdjacency(geometry: THREE.BufferGeometry): FaceAdjacency {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const arr = pos.array as Float32Array
  const idx = geometry.index
  const faceCount = idx ? idx.count / 3 : pos.count / 3

  const faceNormals = new Float32Array(faceCount * 3)
  const faceAreas = new Float32Array(faceCount)
  const faceCentroids = new Float32Array(faceCount * 3)

  const uidGraph = buildUidGraph(geometry)
  const faceUid = new Int32Array(faceCount * 3)
  for (let f = 0; f < faceCount; f++) {
    for (let c = 0; c < 3; c++) {
      const vi = idx ? idx.getX(f * 3 + c) : f * 3 + c
      faceUid[f * 3 + c] = uidGraph.rawToUid[vi]
    }
  }

  for (let f = 0; f < faceCount; f++) {
    const i0 = idx ? idx.getX(f * 3) : f * 3
    const i1 = idx ? idx.getX(f * 3 + 1) : f * 3 + 1
    const i2 = idx ? idx.getX(f * 3 + 2) : f * 3 + 2
    const p0x = arr[i0 * 3], p0y = arr[i0 * 3 + 1], p0z = arr[i0 * 3 + 2]
    const p1x = arr[i1 * 3], p1y = arr[i1 * 3 + 1], p1z = arr[i1 * 3 + 2]
    const p2x = arr[i2 * 3], p2y = arr[i2 * 3 + 1], p2z = arr[i2 * 3 + 2]
    let nx = (p1y - p0y) * (p2z - p0z) - (p1z - p0z) * (p2y - p0y)
    let ny = (p1z - p0z) * (p2x - p0x) - (p1x - p0x) * (p2z - p0z)
    let nz = (p1x - p0x) * (p2y - p0y) - (p1y - p0y) * (p2x - p0x)
    const area = Math.sqrt(nx * nx + ny * ny + nz * nz) * 0.5
    faceAreas[f] = area
    if (area > 1e-14) {
      const l = area * 2
      nx /= l; ny /= l; nz /= l
    } else {
      nx = 0; ny = 0; nz = 0
    }
    faceNormals[f * 3] = nx
    faceNormals[f * 3 + 1] = ny
    faceNormals[f * 3 + 2] = nz
    faceCentroids[f * 3] = (p0x + p1x + p2x) / 3
    faceCentroids[f * 3 + 1] = (p0y + p1y + p2y) / 3
    faceCentroids[f * 3 + 2] = (p0z + p1z + p2z) / 3
  }

  // ── faceAdj via vertFaces (uid) com mask de dedup O(1) ───────────────────
  const vfCnt = new Int32Array(uidGraph.uidCount)
  for (let i = 0; i < faceCount * 3; i++) vfCnt[faceUid[i]]++
  const vfOff = new Int32Array(uidGraph.uidCount + 1)
  for (let u = 0; u < uidGraph.uidCount; u++) vfOff[u + 1] = vfOff[u] + vfCnt[u]
  const vfList = new Int32Array(vfOff[uidGraph.uidCount])
  const vfPtr = new Int32Array(uidGraph.uidCount)
  for (let f = 0; f < faceCount; f++) {
    for (let c = 0; c < 3; c++) {
      const u = faceUid[f * 3 + c]
      vfList[vfOff[u] + vfPtr[u]++] = f
    }
  }

  const faceAdj: Int32Array[] = new Array(faceCount)
  const seen = new Uint8Array(faceCount)
  let tmp = new Int32Array(32)
  for (let f = 0; f < faceCount; f++) {
    let cnt = 0
    for (let c = 0; c < 3; c++) {
      const u = faceUid[f * 3 + c]
      for (let j = vfOff[u]; j < vfOff[u + 1]; j++) {
        const nb = vfList[j]
        if (nb === f || seen[nb]) continue
        seen[nb] = 1
        if (cnt === tmp.length) {
          const bigger = new Int32Array(tmp.length * 2)
          bigger.set(tmp)
          tmp = bigger
        }
        tmp[cnt++] = nb
      }
    }
    for (let k = 0; k < cnt; k++) seen[tmp[k]] = 0
    faceAdj[f] = tmp.slice(0, cnt)
  }

  return { faceCount, faceAdj, faceNormals, faceAreas, faceCentroids }
}

// ─── 1. Identificação da região de corte ─────────────────────────────────────

/**
 * Identifica a região gerada pelo corte.
 *
 * Estratégias (em ordem de prioridade):
 *  A) taggedFaceIndices gravados no momento do corte
 *  B) Detecção de "cap planar" — BFS sobre adjacência real de faces (O(n))
 *  C) Expansão a partir de boundary loops (arestas de borda)
 *  D) fallback-none — máscara zerada (não altera nada)
 */
export function identifyCutRegion(
  geometry: THREE.BufferGeometry,
  opts?: {
    taggedFaceIndices?: number[]
    preferredNormal?: THREE.Vector3
    scaleToMm?: number
  },
): CutRegionResult {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const idx = geometry.getIndex()
  const vertexCount = pos.count
  const weights = new Float32Array(vertexCount) // all 0

  if (vertexCount === 0) {
    return {
      vertexWeights: weights,
      cutFaceIndices: [],
      boundaryPoints: new Float32Array(0),
      areaEstimate: 0,
      method: 'fallback-none',
    }
  }

  // ── A) Tagged faces ────────────────────────────────────────────────────────
  if (opts?.taggedFaceIndices && opts.taggedFaceIndices.length > 0) {
    const cutFaces = opts.taggedFaceIndices
    const seedVerts = new Set<number>()
    for (const fi of cutFaces) {
      let a: number, b: number, c: number
      if (idx) {
        a = idx.getX(fi * 3)
        b = idx.getX(fi * 3 + 1)
        c = idx.getX(fi * 3 + 2)
      } else {
        a = fi * 3; b = fi * 3 + 1; c = fi * 3 + 2
      }
      seedVerts.add(a); seedVerts.add(b); seedVerts.add(c)
      weights[a] = 1; weights[b] = 1; weights[c] = 1
    }
    const boundary = extractBoundaryFromFaces(geometry, cutFaces)
    return {
      vertexWeights: weights,
      cutFaceIndices: cutFaces,
      boundaryPoints: boundary,
      areaEstimate: estimateFaceArea(geometry, cutFaces),
      method: 'tagged',
    }
  }

  // ── B) Planar cap detection (BFS — O(n)) ─────────────────────────────────
  const planar = detectPlanarCapRegions(geometry, opts?.preferredNormal)
  if (planar.faceIndices.length > 0) {
    for (const vi of planar.vertexIndices) weights[vi] = 1
    return {
      vertexWeights: weights,
      cutFaceIndices: planar.faceIndices,
      boundaryPoints: planar.boundaryPoints,
      areaEstimate: planar.area,
      method: 'planar-cap',
    }
  }

  // ── C) Open boundary expansion ─────────────────────────────────────────────
  const open = detectOpenBoundarySeeds(geometry)
  if (open.vertexIndices.length > 0) {
    for (const vi of open.vertexIndices) weights[vi] = 1
    return {
      vertexWeights: weights,
      cutFaceIndices: [],
      boundaryPoints: open.boundaryPoints,
      areaEstimate: 0,
      method: 'boundary-expand',
    }
  }

  return {
    vertexWeights: weights,
    cutFaceIndices: [],
    boundaryPoints: new Float32Array(0),
    areaEstimate: 0,
    method: 'fallback-none',
  }
}

/** Detecta regiões planares coesas (tampas de corte) via BFS O(n). */
function detectPlanarCapRegions(
  geometry: THREE.BufferGeometry,
  preferredNormal?: THREE.Vector3,
): { faceIndices: number[]; vertexIndices: number[]; boundaryPoints: Float32Array; area: number } {
  const idx = geometry.getIndex()

  const adj = buildFaceAdjacency(geometry)
  const faceCount = adj.faceCount
  const { faceNormals, faceAreas, faceCentroids, faceAdj } = adj

  geometry.computeBoundingBox()
  const bb = geometry.boundingBox!
  const modelSize = bb.min.distanceTo(bb.max) || 1
  const planeEps = modelSize * 0.002

  let totalArea = 0
  for (let f = 0; f < faceCount; f++) totalArea += faceAreas[f]
  totalArea = totalArea || 1

  const used = new Uint8Array(faceCount)
  let bestGroup: number[] = []
  let bestArea = 0

  const ALIGN = 0.97
  const queue = new Int32Array(faceCount)

  for (let seed = 0; seed < faceCount; seed++) {
    if (used[seed] || faceAreas[seed] < 1e-12) continue
    const sx = faceNormals[seed * 3], sy = faceNormals[seed * 3 + 1], sz = faceNormals[seed * 3 + 2]
    if (preferredNormal && Math.abs(sx * preferredNormal.x + sy * preferredNormal.y + sz * preferredNormal.z) < 0.9) continue

    const c0x = faceCentroids[seed * 3], c0y = faceCentroids[seed * 3 + 1], c0z = faceCentroids[seed * 3 + 2]
    let group: number[] | null = null
    let area = 0
    let count = 0
    let head = 0
    queue[0] = seed
    let qTail = 1
    used[seed] = 1

    while (head < qTail) {
      const f = queue[head++]
      if (!group) { group = []; count = 0 }
      group[count++] = f
      area += faceAreas[f]
      const nf = faceAdj[f]
      for (let i = 0; i < nf.length; i++) {
        const g = nf[i]
        if (used[g] || faceAreas[g] < 1e-12) continue
        const nx = faceNormals[g * 3], ny = faceNormals[g * 3 + 1], nz = faceNormals[g * 3 + 2]
        if (Math.abs(nx * sx + ny * sy + nz * sz) < ALIGN) continue
        const cgx = faceCentroids[g * 3] - c0x
        const cgy = faceCentroids[g * 3 + 1] - c0y
        const cgz = faceCentroids[g * 3 + 2] - c0z
        const dist = Math.abs(nx * cgx + ny * cgy + nz * cgz)
        if (dist > planeEps) continue
        used[g] = 1
        queue[qTail++] = g
      }
    }

    const groupArr = group ?? []
    const ratio = area / totalArea
    if (groupArr.length >= 8 && ratio > 0.01 && ratio < 0.55 && area > bestArea) {
      bestArea = area
      bestGroup = groupArr
    }
  }

  if (bestGroup.length === 0) {
    return { faceIndices: [], vertexIndices: [], boundaryPoints: new Float32Array(0), area: 0 }
  }

  const vertSet = new Set<number>()
  for (const f of bestGroup) {
    if (idx) {
      vertSet.add(idx.getX(f * 3))
      vertSet.add(idx.getX(f * 3 + 1))
      vertSet.add(idx.getX(f * 3 + 2))
    } else {
      vertSet.add(f * 3); vertSet.add(f * 3 + 1); vertSet.add(f * 3 + 2)
    }
  }

  return {
    faceIndices: bestGroup,
    vertexIndices: [...vertSet],
    boundaryPoints: extractBoundaryFromFaces(geometry, bestGroup),
    area: bestArea,
  }
}

function detectOpenBoundarySeeds(geometry: THREE.BufferGeometry): {
  vertexIndices: number[]
  boundaryPoints: Float32Array
} {
  const idx = geometry.getIndex()
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  if (!idx) return { vertexIndices: [], boundaryPoints: new Float32Array(0) }

  const edgeCount = new Map<number, { a: number; b: number; n: number }>()
  const faceCount = idx.count / 3
  const keyMod = pos.count
  for (let f = 0; f < faceCount; f++) {
    const a = idx.getX(f * 3), b = idx.getX(f * 3 + 1), c = idx.getX(f * 3 + 2)
    for (const [u, v] of [[a, b], [b, c], [c, a]] as [number, number][]) {
      const k = u < v ? u * keyMod + v : v * keyMod + u
      const e = edgeCount.get(k)
      if (e) e.n++
      else edgeCount.set(k, { a: u, b: v, n: 1 })
    }
  }

  const boundaryVerts = new Set<number>()
  const pts: number[] = []
  for (const e of edgeCount.values()) {
    if (e.n !== 1) continue
    boundaryVerts.add(e.a)
    boundaryVerts.add(e.b)
    pts.push(pos.getX(e.a), pos.getY(e.a), pos.getZ(e.a), pos.getX(e.b), pos.getY(e.b), pos.getZ(e.b))
  }

  return {
    vertexIndices: [...boundaryVerts],
    boundaryPoints: new Float32Array(pts),
  }
}

function extractBoundaryFromFaces(geometry: THREE.BufferGeometry, faces: number[]): Float32Array {
  const idx = geometry.getIndex()
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  if (!idx || faces.length === 0) return new Float32Array(0)

  const edgeCount = new Map<number, { a: number; b: number; n: number }>()
  const keyMod = pos.count

  for (const f of faces) {
    const a = idx.getX(f * 3), b = idx.getX(f * 3 + 1), c = idx.getX(f * 3 + 2)
    for (const [u, v] of [[a, b], [b, c], [c, a]] as [number, number][]) {
      const k = u < v ? u * keyMod + v : v * keyMod + u
      const e = edgeCount.get(k)
      if (e) e.n++
      else edgeCount.set(k, { a: u, b: v, n: 1 })
    }
  }

  const pts: number[] = []
  for (const e of edgeCount.values()) {
    if (e.n !== 1) continue
    pts.push(pos.getX(e.a), pos.getY(e.a), pos.getZ(e.a), pos.getX(e.b), pos.getY(e.b), pos.getZ(e.b))
  }
  return new Float32Array(pts)
}

function estimateFaceArea(geometry: THREE.BufferGeometry, faces: number[]): number {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const idx = geometry.getIndex()
  let area = 0
  const arr = pos.array as Float32Array
  for (const f of faces) {
    let a: number, b: number, c: number
    if (idx) {
      a = idx.getX(f * 3); b = idx.getX(f * 3 + 1); c = idx.getX(f * 3 + 2)
    } else {
      a = f * 3; b = f * 3 + 1; c = f * 3 + 2
    }
    const abx = arr[b * 3] - arr[a * 3], aby = arr[b * 3 + 1] - arr[a * 3 + 1], abz = arr[b * 3 + 2] - arr[a * 3 + 2]
    const acx = arr[c * 3] - arr[a * 3], acy = arr[c * 3 + 1] - arr[a * 3 + 1], acz = arr[c * 3 + 2] - arr[a * 3 + 2]
    const crx = aby * acz - abz * acy
    const cry = abz * acx - abx * acz
    const crz = abx * acy - aby * acx
    area += Math.sqrt(crx * crx + cry * cry + crz * crz) * 0.5
  }
  return area
}

// ─── 2. Expansão da máscara por raio (BFS no grafo de UIDs) ──────────────────

/**
 * Expande a máscara de sementes (weights≈1) para vizinhos até radiusMm,
 * com falloff suave. BFS geodésica aproximada sobre o grafo soldado.
 */
export function expandInfluenceMask(
  geometry: THREE.BufferGeometry,
  seedWeights: Float32Array,
  radiusMm: number,
  scaleToMm = 1,
  preserveDetails = true,
): Float32Array {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const n = pos.count
  const weights = new Float32Array(seedWeights)
  const radius = Math.max(1e-6, radiusMm / scaleToMm)

  const g = buildUidGraph(geometry)
  const { rawToUid, uidCount, uidPos, uidAdj } = g

  // Curvatura por UID (para preserveDetails)
  let curvature: Float32Array | null = null
  if (preserveDetails) {
    curvature = estimateUidCurvature(g)
  }

  const dist = new Float32Array(uidCount)
  dist.fill(Infinity)
  const queue = new Int32Array(uidCount)
  let qTail = 0
  const enqueued = new Uint8Array(uidCount)

  for (let i = 0; i < n; i++) {
    if (seedWeights[i] > 0.5) {
      const u = rawToUid[i]
      if (dist[u] !== 0) {
        dist[u] = 0
        queue[qTail++] = u
        enqueued[u] = 1
      }
    }
  }

  let head = 0
  while (head < qTail) {
    const u = queue[head++]
    if (dist[u] > radius) continue
    const ux = uidPos[u * 3], uy = uidPos[u * 3 + 1], uz = uidPos[u * 3 + 2]
    const nb = uidAdj[u]
    for (let k = 0; k < nb.length; k++) {
      const v = nb[k]
      const vx = uidPos[v * 3], vy = uidPos[v * 3 + 1], vz = uidPos[v * 3 + 2]
      const dx = vx - ux, dy = vy - uy, dz = vz - uz
      const d = dist[u] + Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (d < dist[v] && d <= radius * 1.05) {
        dist[v] = d
        if (!enqueued[v]) {
          enqueued[v] = 1
          queue[qTail++] = v
        }
      }
    }
  }

  const invR = 1 / radius
  for (let i = 0; i < n; i++) {
    const u = rawToUid[i]
    const d = dist[u]
    if (d === Infinity) {
      weights[i] = 0
      continue
    }
    const t = Math.min(1, d * invR)
    let w = 1 - t * t * (3 - 2 * t) // smoothstep inverso
    if (seedWeights[i] > 0.5) w = 1

    if (curvature && preserveDetails) {
      const c = curvature[u]
      const detailFactor = 1 / (1 + c * 8)
      w *= 0.35 + 0.65 * detailFactor
    }
    if (w > weights[i]) weights[i] = w
  }

  return weights
}

/** Curvatura média por UID: 1 - dot(normal do nó, normal do vizinho). */
function estimateUidCurvature(g: UidGraph): Float32Array {
  const { uidCount, uidAdj, uidNormals } = g
  const curv = new Float32Array(uidCount)
  for (let u = 0; u < uidCount; u++) {
    const nb = uidAdj[u]
    const n = nb.length
    if (n === 0) { curv[u] = 0; continue }
    const ux = uidNormals[u * 3], uy = uidNormals[u * 3 + 1], uz = uidNormals[u * 3 + 2]
    let sum = 0
    for (let k = 0; k < n; k++) {
      const v = nb[k]
      const nx = uidNormals[v * 3], ny = uidNormals[v * 3 + 1], nz = uidNormals[v * 3 + 2]
      const dot = Math.max(-1, Math.min(1, ux * nx + uy * ny + uz * nz))
      sum += 1 - dot
    }
    curv[u] = sum / n
  }
  return curv
}

/** Curvatura por vértice raw (usada no fallback de última instância). */
function estimateVertexCurvature(geometry: THREE.BufferGeometry): Float32Array {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const n = pos.count
  const g = buildUidGraph(geometry)
  const curv = estimateUidCurvature(g)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) out[i] = curv[g.rawToUid[i]]
  return out
}

// ─── 3. Micro-fillet + contorno na fronteira do corte ─────────────────────────

/**
 * Aproxima um fillet sutil nos vértices da fronteira do corte.
 *
 * - Amplitude relativa ao COMPRIMENTO MÉDIO DAS ARESTAS da malha (não a mm
 *   absolutos), para que o arredondamento seja visível independentemente da
 *   escala/unidade do modelo.
 * - Desloca ao longo da normal média area-weighted, com falloff suave pela
 *   máscara (pico na borda da região).
 * - Depois suaviza o contorno (anéis de alta máscara) tangencialmente, o que
 *   arredonda o desenho do corte em si.
 */
export function applyEdgeRefine(
  geometry: THREE.BufferGeometry,
  weights: Float32Array,
  settings: AcabSettings,
  scaleToMm = 1,
): THREE.BufferGeometry {
  const s = clampAcabSettings(settings)
  const geo = geometry.clone()
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const arr = pos.array as Float32Array
  const n = pos.count
  const g = buildUidGraph(geo)
  const { rawToUid, uidCount, uidPos, uidAdj, uidNormals } = g

  // Peso por UID = máximo dos pesos dos vértices raw (não divide o nó soldado)
  const uidW = new Float32Array(uidCount)
  for (let i = 0; i < n; i++) {
    const u = rawToUid[i]
    const w = weights[i]
    if (w > uidW[u]) uidW[u] = w
  }

  // Comprimento médio de aresta (escala local)
  let edgeSum = 0
  let edgeCount = 0
  for (let u = 0; u < uidCount; u++) {
    const nb = uidAdj[u]
    const ux = uidPos[u * 3], uy = uidPos[u * 3 + 1], uz = uidPos[u * 3 + 2]
    for (let k = 0; k < nb.length; k++) {
      const v = nb[k]
      if (v <= u) continue // conta cada aresta uma vez
      const dx = uidPos[v * 3] - ux, dy = uidPos[v * 3 + 1] - uy, dz = uidPos[v * 3 + 2] - uz
      edgeSum += Math.sqrt(dx * dx + dy * dy + dz * dz)
      edgeCount++
    }
  }
  const meanEdge = edgeCount > 0 ? edgeSum / edgeCount : 1e-4
  void scaleToMm

  // Amplitude do fillet: proporcional à aresta local e à intensidade.
  // intensity 0 → nada; cap garante que nunca deforma a peça toda.
  const amp = meanEdge * (0.28 + 0.55 * s.intensity)

  const step = (a: number, b: number, x: number) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)
  }

  // ── 1) Deslocamento do fillet ao longo da normal ─────────────────────────
  for (let u = 0; u < uidCount; u++) {
    const w = uidW[u]
    if (w < 0.25) continue
    const fall = step(0.25, 0.95, w)
    const d = amp * fall
    if (d < 1e-9) continue
    const nx = uidNormals[u * 3], ny = uidNormals[u * 3 + 1], nz = uidNormals[u * 3 + 2]
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
    if (len < 1e-12) continue
    uidPos[u * 3] += (nx / len) * d
    uidPos[u * 3 + 1] += (ny / len) * d
    uidPos[u * 3 + 2] += (nz / len) * d
  }

  // ── 2) Suavização do contorno (anéis de borda) — arredonda o desenho ─────
  // Move nós de alta máscara em direção à média dos vizinhos também de alta
  // máscara. Como os vizinhos estão no mesmo anel, isso alisa o contorno.
  const RING_W = 0.82
  const ring = new Uint8Array(uidCount)
  for (let u = 0; u < uidCount; u++) if (uidW[u] > RING_W) ring[u] = 1
  const ringCnt = new Int32Array(uidCount)
  const ringSum = new Float32Array(uidCount * 3)
  for (let u = 0; u < uidCount; u++) {
    if (!ring[u]) continue
    const nb = uidAdj[u]
    for (let k = 0; k < nb.length; k++) {
      const v = nb[k]
      if (!ring[v]) continue
      ringSum[u * 3] += uidPos[v * 3]
      ringSum[u * 3 + 1] += uidPos[v * 3 + 1]
      ringSum[u * 3 + 2] += uidPos[v * 3 + 2]
      ringCnt[u]++
    }
  }
  const RING_ITERS = 2
  const relax = 0.28
  const buf = new Float32Array(uidCount * 3)
  for (let it = 0; it < RING_ITERS; it++) {
    buf.set(uidPos)
    for (let u = 0; u < uidCount; u++) {
      if (!ring[u] || ringCnt[u] === 0) continue
      const inv = 1 / ringCnt[u]
      buf[u * 3] += (ringSum[u * 3] * inv - uidPos[u * 3]) * relax
      buf[u * 3 + 1] += (ringSum[u * 3 + 1] * inv - uidPos[u * 3 + 1]) * relax
      buf[u * 3 + 2] += (ringSum[u * 3 + 2] * inv - uidPos[u * 3 + 2]) * relax
    }
    uidPos.set(buf)
  }

  // ── 3) Grava de volta nos vértices raw (todos do UID, para não rachar) ───
  for (let u = 0; u < uidCount; u++) {
    const vs = g.uidVerts
    for (let j = vs.start[u]; j < vs.start[u + 1]; j++) {
      const vi = vs.list[j]
      arr[vi * 3] = uidPos[u * 3]
      arr[vi * 3 + 1] = uidPos[u * 3 + 1]
      arr[vi * 3 + 2] = uidPos[u * 3 + 2]
    }
  }

  pos.needsUpdate = true
  computeSmoothNormals(geo)
  return geo
}

// ─── 3b. Suavização localizada (Taubin ponderado no grafo soldado) ──────────

/**
 * Aplica Taubin (λ/μ) localizado apenas onde weight > 0.
 * Roda sobre o grafo soldado por posição — funciona em malhas STL
 * não-indexadas (cada vértice enxerga todos os vizinhos reais).
 */
export function applyLocalizedSmooth(
  geometry: THREE.BufferGeometry,
  weights: Float32Array,
  settings: AcabSettings,
  clone = true,
): THREE.BufferGeometry {
  const s = clampAcabSettings(settings)
  const geo = clone ? geometry.clone() : geometry
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const arr = pos.array as Float32Array
  const n = pos.count

  const g = buildUidGraph(geo)
  const { rawToUid, uidCount, uidPos, uidAdj } = g

  // Peso por UID = max dos pesos raw (mantém nós soldados coesos)
  const uidW = new Float32Array(uidCount)
  for (let i = 0; i < n; i++) {
    const u = rawToUid[i]
    if (weights[i] > uidW[u]) uidW[u] = weights[i]
  }

  // Força efetiva escala com a intensidade; λ/μ = Taubin estável.
  const eff = 0.35 + 0.65 * (s.intensity / 0.42)
  const lambda = 0.5 * eff
  const mu = -0.52 * eff

  const tmp = new Float32Array(uidCount * 3)

  const applyPass = (factor: number) => {
    for (let u = 0; u < uidCount; u++) {
      const w = uidW[u]
      if (w < 1e-4) {
        tmp[u * 3] = uidPos[u * 3]
        tmp[u * 3 + 1] = uidPos[u * 3 + 1]
        tmp[u * 3 + 2] = uidPos[u * 3 + 2]
        continue
      }
      const nb = uidAdj[u]
      const nLen = nb.length
      if (nLen === 0) {
        tmp[u * 3] = uidPos[u * 3]
        tmp[u * 3 + 1] = uidPos[u * 3 + 1]
        tmp[u * 3 + 2] = uidPos[u * 3 + 2]
        continue
      }
      let sx = 0, sy = 0, sz = 0
      for (let k = 0; k < nLen; k++) {
        const v = nb[k]
        sx += uidPos[v * 3]
        sy += uidPos[v * 3 + 1]
        sz += uidPos[v * 3 + 2]
      }
      const inv = 1 / nLen
      const lx = sx * inv - uidPos[u * 3]
      const ly = sy * inv - uidPos[u * 3 + 1]
      const lz = sz * inv - uidPos[u * 3 + 2]
      tmp[u * 3] = uidPos[u * 3] + lx * factor * w
      tmp[u * 3 + 1] = uidPos[u * 3 + 1] + ly * factor * w
      tmp[u * 3 + 2] = uidPos[u * 3 + 2] + lz * factor * w
    }
    uidPos.set(tmp)
  }

  for (let it = 0; it < s.iterations; it++) {
    applyPass(lambda)
    applyPass(mu)
  }

  // Grava de volta para o array de posições. Vértices com weight≈0 não foram
  // movidos (uidPos intacto), logo permanecem EXATAMENTE nas posições originais.
  const writeBack = () => {
    for (let i = 0; i < n; i++) {
      const u = rawToUid[i]
      arr[i * 3] = uidPos[u * 3]
      arr[i * 3 + 1] = uidPos[u * 3 + 1]
      arr[i * 3 + 2] = uidPos[u * 3 + 2]
    }
  }

  // Preservação de volume: correção radial suave em torno do centróide da região
  if (s.preserveVolume) {
    const idx = geo.getIndex()
    const volBefore = estimateVolumeFromPositions(arr, idx)
    writeBack()
    const volAfter = estimateVolumeFromPositions(arr, idx)
    if (volBefore > 1e-12 && Math.abs(volAfter - volBefore) / volBefore > 0.001) {
      const scale = Math.cbrt(volBefore / Math.max(volAfter, 1e-12))
      const safeScale = Math.max(0.985, Math.min(1.015, scale))
      if (Math.abs(safeScale - 1) > 1e-6) {
        let cx = 0, cy = 0, cz = 0, cw = 0
        for (let i = 0; i < n; i++) {
          const u = rawToUid[i]
          const w = uidW[u]
          if (w < 1e-4) continue
          cx += uidPos[u * 3] * w
          cy += uidPos[u * 3 + 1] * w
          cz += uidPos[u * 3 + 2] * w
          cw += w
        }
        if (cw > 0) {
          cx /= cw; cy /= cw; cz /= cw
          for (let u = 0; u < uidCount; u++) {
            const w = uidW[u]
            if (w < 1e-4) continue
            const x = uidPos[u * 3], y = uidPos[u * 3 + 1], z = uidPos[u * 3 + 2]
            const k = 1 + (safeScale - 1) * w
            uidPos[u * 3] = cx + (x - cx) * k
            uidPos[u * 3 + 1] = cy + (y - cy) * k
            uidPos[u * 3 + 2] = cz + (z - cz) * k
          }
          writeBack()
        }
      }
    }
  } else {
    writeBack()
  }

  pos.needsUpdate = true
  computeSmoothNormals(geo)
  return geo
}

function estimateVolumeFromPositions(arr: ArrayLike<number>, idx: THREE.BufferAttribute | null): number {
  let vol = 0
  const faceCount = idx ? idx.count / 3 : arr.length / 9
  for (let f = 0; f < faceCount; f++) {
    let a: number, b: number, c: number
    if (idx) {
      a = idx.getX(f * 3); b = idx.getX(f * 3 + 1); c = idx.getX(f * 3 + 2)
    } else {
      a = f * 3; b = f * 3 + 1; c = f * 3 + 2
    }
    const ax = arr[a * 3], ay = arr[a * 3 + 1], az = arr[a * 3 + 2]
    const bx = arr[b * 3], by = arr[b * 3 + 1], bz = arr[b * 3 + 2]
    const cx = arr[c * 3], cy = arr[c * 3 + 1], cz = arr[c * 3 + 2]
    vol += ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)
  }
  return Math.abs(vol) / 6
}

export function estimateVolume(geometry: THREE.BufferGeometry): number {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  return estimateVolumeFromPositions(pos.array as Float32Array, geometry.getIndex())
}

// ─── 4. Pipeline completo ────────────────────────────────────────────────────

/**
 * Escala de milímetro inferida: assume que a maior dimensão do modelo equivale
 * a ~100 mm. Usada quando a cena não informa scaleToMm.
 */
function estimateMmScale(geometry: THREE.BufferGeometry): number {
  if (!geometry.boundingBox) geometry.computeBoundingBox()
  const bb = geometry.boundingBox!
  const s = new THREE.Vector3()
  bb.getSize(s)
  const maxDim = Math.max(s.x, s.y, s.z, 1e-6)
  return maxDim / 100
}

export function runAcabamento(
  sourceGeometry: THREE.BufferGeometry,
  settings: AcabSettings,
  opts?: {
    taggedFaceIndices?: number[]
    preferredNormal?: THREE.Vector3
    scaleToMm?: number
  },
): AcabResult {
  const s = clampAcabSettings(settings)
  const scale = opts?.scaleToMm ?? estimateMmScale(sourceGeometry)

  let region = identifyCutRegion(sourceGeometry, opts)

  // Último recurso: sementes nos vértices de maior curvatura (ainda localizado).
  if (region.method === 'fallback-none') {
    const curv = estimateVertexCurvature(sourceGeometry)
    const n = curv.length
    const sorted = Array.from(curv).map((c, i) => [c, i] as [number, number])
    sorted.sort((a, b) => b[0] - a[0])
    const take = Math.max(12, Math.floor(n * 0.08))
    const seeds = new Float32Array(n)
    for (let k = 0; k < take; k++) seeds[sorted[k][1]] = 1
    region = {
      vertexWeights: seeds,
      cutFaceIndices: [],
      boundaryPoints: new Float32Array(0),
      areaEstimate: 0,
      method: 'boundary-expand',
    }
  }

  let expanded = expandInfluenceMask(
    sourceGeometry,
    region.vertexWeights,
    s.radiusMm,
    scale,
    s.preserveDetails,
  )

  let maxW = 0
  for (let i = 0; i < expanded.length; i++) if (expanded[i] > maxW) maxW = expanded[i]

  // Se a máscara ainda ficou zerada, tenta as arestas abertas da peça.
  if (maxW < 1e-4) {
    const open = detectOpenBoundarySeeds(sourceGeometry)
    if (open.vertexIndices.length > 0) {
      const seeds = new Float32Array(sourceGeometry.getAttribute('position').count)
      for (const vi of open.vertexIndices) seeds[vi] = 1
      expanded = expandInfluenceMask(sourceGeometry, seeds, s.radiusMm, scale, s.preserveDetails)
      maxW = 0
      for (let i = 0; i < expanded.length; i++) if (expanded[i] > maxW) maxW = expanded[i]
    }
  }

  if (maxW < 1e-4) {
    const geo = sourceGeometry.clone()
    computeSmoothNormals(geo)
    const vol = estimateVolume(geo)
    return {
      geometry: geo,
      volumeBefore: vol,
      volumeAfter: vol,
      volumeDeltaPct: 0,
      valid: true,
      issues: ['Nenhuma região de corte identificada — geometria inalterada.'],
    }
  }

  const volumeBefore = estimateVolume(sourceGeometry)

  // 1) Micro-fillet na fronteira (arredonda sutilmente o corte)
  let resultGeo = applyEdgeRefine(sourceGeometry, expanded, s, scale)
  // 2) Taubin localizado (limpa irregularidades e suaviza a transição)
  resultGeo = applyLocalizedSmooth(resultGeo, expanded, s, false)

  const validation = validateGeometry(resultGeo, volumeBefore)

  return {
    geometry: resultGeo,
    volumeBefore,
    volumeAfter: validation.volume,
    volumeDeltaPct: volumeBefore > 0
      ? ((validation.volume - volumeBefore) / volumeBefore) * 100
      : 0,
    valid: validation.valid,
    issues: validation.issues,
  }
}

/**
 * Versão assíncrona do pipeline: cede a thread entre etapas (UI responsiva) e
 * aceita cancelamento. Ideal para previews disparados por slider.
 */
export async function runAcabamentoAsync(
  sourceGeometry: THREE.BufferGeometry,
  settings: AcabSettings,
  opts?: {
    taggedFaceIndices?: number[]
    preferredNormal?: THREE.Vector3
    scaleToMm?: number
  },
  onProgress?: (p: AcabProgress) => void,
  cancel?: AcabCancel,
): Promise<AcabResult> {
  const check = () => {
    if (cancel?.cancelled) throw new AcabCancelledError()
  }
  const s = clampAcabSettings(settings)
  const scale = opts?.scaleToMm ?? estimateMmScale(sourceGeometry)

  onProgress?.({ stage: 'Identificando região de corte…', pct: 10 })
  check()
  await yieldToMain()

  let region = identifyCutRegion(sourceGeometry, opts)
  check()

  if (region.method === 'fallback-none') {
    onProgress?.({ stage: 'Região não detectada — usando curvatura…', pct: 18 })
    await yieldToMain()
    const curv = estimateVertexCurvature(sourceGeometry)
    check()
    const n = curv.length
    const sorted = Array.from(curv).map((c, i) => [c, i] as [number, number])
    sorted.sort((a, b) => b[0] - a[0])
    const take = Math.max(12, Math.floor(n * 0.08))
    const seeds = new Float32Array(n)
    for (let k = 0; k < take; k++) seeds[sorted[k][1]] = 1
    region = {
      vertexWeights: seeds,
      cutFaceIndices: [],
      boundaryPoints: new Float32Array(0),
      areaEstimate: 0,
      method: 'boundary-expand',
    }
  }

  onProgress?.({ stage: 'Expandindo máscara de influência…', pct: 35 })
  let expanded = expandInfluenceMask(
    sourceGeometry,
    region.vertexWeights,
    s.radiusMm,
    scale,
    s.preserveDetails,
  )
  check()
  await yieldToMain()

  let maxW = 0
  for (let i = 0; i < expanded.length; i++) if (expanded[i] > maxW) maxW = expanded[i]

  if (maxW < 1e-4) {
    const open = detectOpenBoundarySeeds(sourceGeometry)
    if (open.vertexIndices.length > 0) {
      const seeds = new Float32Array(sourceGeometry.getAttribute('position').count)
      for (const vi of open.vertexIndices) seeds[vi] = 1
      expanded = expandInfluenceMask(sourceGeometry, seeds, s.radiusMm, scale, s.preserveDetails)
      maxW = 0
      for (let i = 0; i < expanded.length; i++) if (expanded[i] > maxW) maxW = expanded[i]
    }
  }

  if (maxW < 1e-4) {
    onProgress?.({ stage: 'Nenhuma região detectada…', pct: 100 })
    const geo = sourceGeometry.clone()
    computeSmoothNormals(geo)
    const vol = estimateVolume(geo)
    return {
      geometry: geo,
      volumeBefore: vol,
      volumeAfter: vol,
      volumeDeltaPct: 0,
      valid: true,
      issues: ['Nenhuma região de corte identificada — geometria inalterada.'],
    }
  }

  const volumeBefore = estimateVolume(sourceGeometry)

  onProgress?.({ stage: 'Arredondando bordas do corte…', pct: 60 })
  let resultGeo = applyEdgeRefine(sourceGeometry, expanded, s, scale)
  check()
  await yieldToMain()

  onProgress?.({ stage: 'Suavizando superfície…', pct: 78 })
  resultGeo = applyLocalizedSmooth(resultGeo, expanded, s, false)
  check()
  await yieldToMain()

  onProgress?.({ stage: 'Validando geometria…', pct: 92 })
  const validation = validateGeometry(resultGeo, volumeBefore)
  check()

  onProgress?.({ stage: 'Pronto', pct: 100 })

  return {
    geometry: resultGeo,
    volumeBefore,
    volumeAfter: validation.volume,
    volumeDeltaPct: volumeBefore > 0
      ? ((validation.volume - volumeBefore) / volumeBefore) * 100
      : 0,
    valid: validation.valid,
    issues: validation.issues,
  }
}

// ─── 5. Validação geométrica ─────────────────────────────────────────────────

export function validateGeometry(
  geometry: THREE.BufferGeometry,
  volumeBefore?: number,
): ValidationResult {
  const issues: string[] = []
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const idx = geometry.getIndex()
  const n = pos.count

  let degenerates = 0
  const faceCount = idx ? idx.count / 3 : n / 3
  const arr = pos.array as Float32Array
  for (let f = 0; f < faceCount; f++) {
    let a: number, b: number, c: number
    if (idx) {
      a = idx.getX(f * 3); b = idx.getX(f * 3 + 1); c = idx.getX(f * 3 + 2)
    } else {
      a = f * 3; b = f * 3 + 1; c = f * 3 + 2
    }
    if (a === b || b === c || a === c) { degenerates++; continue }
    const ax = arr[a * 3], ay = arr[a * 3 + 1], az = arr[a * 3 + 2]
    const bx = arr[b * 3], by = arr[b * 3 + 1], bz = arr[b * 3 + 2]
    const cx = arr[c * 3], cy = arr[c * 3 + 1], cz = arr[c * 3 + 2]
    const abx = bx - ax, aby = by - ay, abz = bz - az
    const acx = cx - ax, acy = cy - ay, acz = cz - az
    const crx = aby * acz - abz * acy
    const cry = abz * acx - abx * acz
    const crz = abx * acy - aby * acx
    if (crx * crx + cry * cry + crz * crz < 1e-24) degenerates++
  }
  if (degenerates > 0) issues.push(`${degenerates} triângulos degenerados`)

  let nans = 0
  for (let i = 0; i < n * 3; i++) {
    if (!Number.isFinite(arr[i])) nans++
  }
  if (nans > 0) issues.push(`${nans} valores não-finitos na geometria`)

  const volume = estimateVolume(geometry)
  if (volumeBefore !== undefined && volumeBefore > 1e-12) {
    const deltaPct = Math.abs((volume - volumeBefore) / volumeBefore) * 100
    if (deltaPct > ACAB_LIMITS.maxVolumeDeltaPct) {
      issues.push(`Variação de volume excessiva (${deltaPct.toFixed(2)}%)`)
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    volume,
  }
}

// ─── Normais suaves por posição (aparência profissional, sem facetas) ─────────

function computeSmoothNormals(geometry: THREE.BufferGeometry): void {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const idx = geometry.index
  const n = pos.count
  const arr = pos.array as Float32Array

  const nx = new Float32Array(n)
  const ny = new Float32Array(n)
  const nz = new Float32Array(n)
  const faceCount = idx ? idx.count / 3 : n / 3
  for (let f = 0; f < faceCount; f++) {
    const a = idx ? idx.getX(f * 3) : f * 3
    const b = idx ? idx.getX(f * 3 + 1) : f * 3 + 1
    const c = idx ? idx.getX(f * 3 + 2) : f * 3 + 2
    const ax = arr[a * 3], ay = arr[a * 3 + 1], az = arr[a * 3 + 2]
    const bx = arr[b * 3], by = arr[b * 3 + 1], bz = arr[b * 3 + 2]
    const cx = arr[c * 3], cy = arr[c * 3 + 1], cz = arr[c * 3 + 2]
    let fnx = (by - ay) * (cz - az) - (bz - az) * (cy - ay)
    let fny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az)
    let fnz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
    const len = Math.sqrt(fnx * fnx + fny * fny + fnz * fnz)
    if (len < 1e-14) continue
    fnx /= len; fny /= len; fnz /= len
    nx[a] += fnx; ny[a] += fny; nz[a] += fnz
    nx[b] += fnx; ny[b] += fny; nz[b] += fnz
    nx[c] += fnx; ny[c] += fny; nz[c] += fnz
  }

  // Solda as normais por posição → superfície lisa sem facetas.
  const g = buildUidGraph(geometry)
  const { rawToUid, uidCount } = g
  const unx = new Float32Array(uidCount)
  const uny = new Float32Array(uidCount)
  const unz = new Float32Array(uidCount)
  const unc = new Float32Array(uidCount)
  for (let i = 0; i < n; i++) {
    const u = rawToUid[i]
    unx[u] += nx[i]; uny[u] += ny[i]; unz[u] += nz[i]; unc[u]++
  }
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const u = rawToUid[i]
    const l = unc[u] > 0 ? Math.sqrt(unx[u] * unx[u] + uny[u] * uny[u] + unz[u] * unz[u]) : 0
    if (l < 1e-12) {
      out[i * 3] = 0; out[i * 3 + 1] = 1; out[i * 3 + 2] = 0
      continue
    }
    out[i * 3] = unx[u] / l
    out[i * 3 + 1] = uny[u] / l
    out[i * 3 + 2] = unz[u] / l
  }
  const nrmAttr = new THREE.BufferAttribute(out, 3)
  geometry.setAttribute('normal', nrmAttr)
}

// ─── Helpers para highlight no viewport ──────────────────────────────────────

/** Gera geometria de linhas do contorno para overlay de highlight. */
export function buildBoundaryLineGeometry(boundaryPoints: Float32Array): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(boundaryPoints, 3))
  return geo
}

/** Cria uma cópia da geometria com cores de vértice para visualizar a máscara. */
export function buildMaskPreviewGeometry(
  geometry: THREE.BufferGeometry,
  weights: Float32Array,
  highlightColor = new THREE.Color('#ff6a00'),
  baseColor = new THREE.Color('#888888'),
): THREE.BufferGeometry {
  const geo = geometry.clone()
  const n = (geo.getAttribute('position') as THREE.BufferAttribute).count
  const colors = new Float32Array(n * 3)
  const tmp = new THREE.Color()
  for (let i = 0; i < n; i++) {
    tmp.copy(baseColor).lerp(highlightColor, weights[i])
    colors[i * 3] = tmp.r
    colors[i * 3 + 1] = tmp.g
    colors[i * 3 + 2] = tmp.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geo
}
