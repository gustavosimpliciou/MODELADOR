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
 *  2. applyAcabamento    → Taubin localizado ponderado pela máscara
 *  3. validateGeometry   → manifold / degenerates / volume
 *
 * Extensível: novos tipos de acabamento podem registrar-se em ACAB_PRESETS
 * sem alterar o núcleo.
 */

import * as THREE from 'three'

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

// ─── 1. Identificação da região de corte ─────────────────────────────────────

/**
 * Identifica a região gerada pelo corte.
 *
 * Estratégias (em ordem de prioridade):
 *  A) userData.cutFaceIndices / cutVertexIndices gravados no momento do corte
 *  B) Detecção de "cap planar" — faces com normal altamente alinhada formando
 *     uma região coesa (típico de tampas geradas pelo pipeline de corte)
 *  C) Expansão a partir de boundary loops (arestas de borda)
 *  D) fallback-none — máscara zerada (não altera nada)
 */
export function identifyCutRegion(
  geometry: THREE.BufferGeometry,
  opts?: {
    /** Faces explicitamente marcadas como superfície de corte. */
    taggedFaceIndices?: number[]
    /** Preferência de normal do plano de corte (se conhecida). */
    preferredNormal?: THREE.Vector3
    /** Unidade de escala: 1 = mm na cena. */
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
      if (!idx) continue
      const a = idx.getX(fi * 3)
      const b = idx.getX(fi * 3 + 1)
      const c = idx.getX(fi * 3 + 2)
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

  // ── B) Planar cap detection ────────────────────────────────────────────────
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

/** Detecta regiões planares coesas (tampas de corte). */
function detectPlanarCapRegions(
  geometry: THREE.BufferGeometry,
  preferredNormal?: THREE.Vector3,
): { faceIndices: number[]; vertexIndices: number[]; boundaryPoints: Float32Array; area: number } {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const idx = geometry.getIndex()
  const faceCount = idx ? idx.count / 3 : pos.count / 3

  // Compute face normals + centroids
  const faceNormals: THREE.Vector3[] = []
  const faceAreas: number[] = []
  const faceCentroids: THREE.Vector3[] = []

  const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3()
  const ab = new THREE.Vector3(), ac = new THREE.Vector3(), fn = new THREE.Vector3()

  for (let f = 0; f < faceCount; f++) {
    let a: number, b: number, c: number
    if (idx) {
      a = idx.getX(f * 3); b = idx.getX(f * 3 + 1); c = idx.getX(f * 3 + 2)
    } else {
      a = f * 3; b = f * 3 + 1; c = f * 3 + 2
    }
    va.fromBufferAttribute(pos, a)
    vb.fromBufferAttribute(pos, b)
    vc.fromBufferAttribute(pos, c)
    ab.subVectors(vb, va)
    ac.subVectors(vc, va)
    fn.crossVectors(ab, ac)
    const area = fn.length() * 0.5
    if (area > 1e-12) fn.normalize()
    faceNormals.push(fn.clone())
    faceAreas.push(area)
    faceCentroids.push(new THREE.Vector3().addVectors(va, vb).add(vc).multiplyScalar(1 / 3))
  }

  // Agrupa faces por normal similar (dot > 0.97) e coplanaridade
  const used = new Uint8Array(faceCount)
  let bestGroup: number[] = []
  let bestArea = 0

  const ALIGN = 0.97
  const PLANE_EPS_FACTOR = 0.002 // relativo ao tamanho do modelo

  geometry.computeBoundingBox()
  const bb = geometry.boundingBox!
  const modelSize = bb.min.distanceTo(bb.max) || 1
  const planeEps = modelSize * PLANE_EPS_FACTOR

  for (let seed = 0; seed < faceCount; seed++) {
    if (used[seed] || faceAreas[seed] < 1e-12) continue
    const n0 = faceNormals[seed]
    if (preferredNormal && Math.abs(n0.dot(preferredNormal)) < 0.9) continue

    const group: number[] = []
    const queue = [seed]
    used[seed] = 1
    let area = 0
    const c0 = faceCentroids[seed]

    while (queue.length) {
      const f = queue.pop()!
      group.push(f)
      area += faceAreas[f]
      const nf = faceNormals[f]
      const cf = faceCentroids[f]

      // Vizinhos por aresta compartilhada (busca linear — ok para peças tipicas)
      for (let g = 0; g < faceCount; g++) {
        if (used[g] || faceAreas[g] < 1e-12) continue
        if (Math.abs(faceNormals[g].dot(nf)) < ALIGN) continue
        // coplanar?
        const dist = Math.abs(faceNormals[g].dot(new THREE.Vector3().subVectors(faceCentroids[g], c0)))
        if (dist > planeEps) continue
        // compartilha aresta?
        if (!facesShareEdge(geometry, f, g)) continue
        used[g] = 1
        queue.push(g)
      }
    }

    // Uma tampa de corte tipicamente cobre uma fração relevante da superfície
    // mas não a peça inteira. Filtra grupos muito pequenos ou enormes.
    const totalArea = faceAreas.reduce((s, a) => s + a, 0) || 1
    const ratio = area / totalArea
    if (group.length >= 8 && ratio > 0.01 && ratio < 0.55 && area > bestArea) {
      bestArea = area
      bestGroup = group
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

function facesShareEdge(geometry: THREE.BufferGeometry, f0: number, f1: number): boolean {
  const idx = geometry.getIndex()
  const get = (f: number) => {
    if (idx) return [idx.getX(f * 3), idx.getX(f * 3 + 1), idx.getX(f * 3 + 2)]
    return [f * 3, f * 3 + 1, f * 3 + 2]
  }
  const a = get(f0)
  const b = get(f1)
  let shared = 0
  for (const va of a) if (b.includes(va)) shared++
  return shared >= 2
}

function detectOpenBoundarySeeds(geometry: THREE.BufferGeometry): {
  vertexIndices: number[]
  boundaryPoints: Float32Array
} {
  const idx = geometry.getIndex()
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  if (!idx) return { vertexIndices: [], boundaryPoints: new Float32Array(0) }

  const edgeCount = new Map<string, number>()
  const edgeKey = (a: number, b: number) => (a < b ? `${a}_${b}` : `${b}_${a}`)

  const faceCount = idx.count / 3
  for (let f = 0; f < faceCount; f++) {
    const a = idx.getX(f * 3), b = idx.getX(f * 3 + 1), c = idx.getX(f * 3 + 2)
    for (const [u, v] of [[a, b], [b, c], [c, a]] as [number, number][]) {
      const k = edgeKey(u, v)
      edgeCount.set(k, (edgeCount.get(k) || 0) + 1)
    }
  }

  const boundaryVerts = new Set<number>()
  const pts: number[] = []
  for (const [k, count] of edgeCount) {
    if (count !== 1) continue
    const [a, b] = k.split('_').map(Number)
    boundaryVerts.add(a)
    boundaryVerts.add(b)
    pts.push(pos.getX(a), pos.getY(a), pos.getZ(a), pos.getX(b), pos.getY(b), pos.getZ(b))
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

  const edgeCount = new Map<string, { a: number; b: number; n: number }>()
  const edgeKey = (a: number, b: number) => (a < b ? `${a}_${b}` : `${b}_${a}`)

  for (const f of faces) {
    const a = idx.getX(f * 3), b = idx.getX(f * 3 + 1), c = idx.getX(f * 3 + 2)
    for (const [u, v] of [[a, b], [b, c], [c, a]] as [number, number][]) {
      const k = edgeKey(u, v)
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
  const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3()
  for (const f of faces) {
    let a: number, b: number, c: number
    if (idx) {
      a = idx.getX(f * 3); b = idx.getX(f * 3 + 1); c = idx.getX(f * 3 + 2)
    } else {
      a = f * 3; b = f * 3 + 1; c = f * 3 + 2
    }
    va.fromBufferAttribute(pos, a)
    vb.fromBufferAttribute(pos, b)
    vc.fromBufferAttribute(pos, c)
    area += new THREE.Vector3().subVectors(vb, va).cross(new THREE.Vector3().subVectors(vc, va)).length() * 0.5
  }
  return area
}

// ─── 2. Expansão da máscara por raio ─────────────────────────────────────────

/**
 * Expande a máscara de sementes (weights==1) para vizinhos até radiusMm,
 * com falloff suave. Usa BFS na conectividade da malha (aproximação geodésica).
 */
export function expandInfluenceMask(
  geometry: THREE.BufferGeometry,
  seedWeights: Float32Array,
  radiusMm: number,
  scaleToMm = 1,
  preserveDetails = true,
): Float32Array {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const idx = geometry.getIndex()
  const n = pos.count
  const weights = new Float32Array(seedWeights)
  const radius = Math.max(1e-6, radiusMm / scaleToMm)

  // adjacency
  const adj: number[][] = Array.from({ length: n }, () => [])
  if (idx) {
    const faceCount = idx.count / 3
    for (let f = 0; f < faceCount; f++) {
      const a = idx.getX(f * 3), b = idx.getX(f * 3 + 1), c = idx.getX(f * 3 + 2)
      adj[a].push(b, c)
      adj[b].push(a, c)
      adj[c].push(a, b)
    }
  } else {
    for (let f = 0; f < n / 3; f++) {
      const a = f * 3, b = a + 1, c = a + 2
      adj[a].push(b, c)
      adj[b].push(a, c)
      adj[c].push(a, b)
    }
  }

  // Optional curvature estimate for preserveDetails
  let curvature: Float32Array | null = null
  if (preserveDetails) {
    curvature = estimateVertexCurvature(geometry)
  }

  // Multi-source BFS with distance
  const dist = new Float32Array(n)
  dist.fill(Infinity)
  const queue: number[] = []
  for (let i = 0; i < n; i++) {
    if (seedWeights[i] > 0.5) {
      dist[i] = 0
      queue.push(i)
    }
  }

  let head = 0
  const va = new THREE.Vector3(), vb = new THREE.Vector3()
  while (head < queue.length) {
    const u = queue[head++]
    if (dist[u] > radius) continue
    va.fromBufferAttribute(pos, u)
    const neighbors = adj[u]
    // dedupe neighbors
    const seen = new Set<number>()
    for (const v of neighbors) {
      if (seen.has(v)) continue
      seen.add(v)
      vb.fromBufferAttribute(pos, v)
      const d = dist[u] + va.distanceTo(vb)
      if (d < dist[v] && d <= radius * 1.05) {
        dist[v] = d
        queue.push(v)
      }
    }
  }

  for (let i = 0; i < n; i++) {
    if (dist[i] === Infinity) {
      weights[i] = 0
      continue
    }
    // Smooth falloff (smoothstep-like)
    const t = Math.min(1, dist[i] / radius)
    let w = 1 - t * t * (3 - 2 * t) // smoothstep inverse
    if (seedWeights[i] > 0.5) w = 1

    // Reduce weight on high-curvature vertices (details)
    if (curvature && preserveDetails) {
      const c = curvature[i]
      // c alto → detalhe → reduz influência
      const detailFactor = 1 / (1 + c * 8)
      w *= 0.35 + 0.65 * detailFactor
    }
    weights[i] = Math.max(weights[i], w)
  }

  return weights
}

function estimateVertexCurvature(geometry: THREE.BufferGeometry): Float32Array {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const nrmAttr = geometry.getAttribute('normal') as THREE.BufferAttribute | undefined
  const n = pos.count
  const curv = new Float32Array(n)
  if (!nrmAttr) {
    geometry.computeVertexNormals()
  }
  const normals = geometry.getAttribute('normal') as THREE.BufferAttribute
  const idx = geometry.getIndex()

  const adj: number[][] = Array.from({ length: n }, () => [])
  if (idx) {
    for (let f = 0; f < idx.count / 3; f++) {
      const a = idx.getX(f * 3), b = idx.getX(f * 3 + 1), c = idx.getX(f * 3 + 2)
      adj[a].push(b, c); adj[b].push(a, c); adj[c].push(a, b)
    }
  }

  const nu = new THREE.Vector3(), nv = new THREE.Vector3()
  for (let i = 0; i < n; i++) {
    nu.fromBufferAttribute(normals, i)
    let sum = 0, count = 0
    const seen = new Set<number>()
    for (const j of adj[i]) {
      if (seen.has(j)) continue
      seen.add(j)
      nv.fromBufferAttribute(normals, j)
      sum += 1 - Math.max(-1, Math.min(1, nu.dot(nv)))
      count++
    }
    curv[i] = count > 0 ? sum / count : 0
  }
  return curv
}

// ─── 3. Suavização localizada (Taubin ponderado) ─────────────────────────────

/**
 * Aplica Taubin smoothing apenas onde weight > 0.
 * Vértices com weight=0 permanecem exatamente iguais.
 *
 * Taubin (λ/μ) evita encolhimento típico do Laplacian puro.
 */
export function applyLocalizedSmooth(
  geometry: THREE.BufferGeometry,
  weights: Float32Array,
  settings: AcabSettings,
): THREE.BufferGeometry {
  const s = clampAcabSettings(settings)
  const geo = geometry.clone()
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const n = pos.count

  // Build adjacency once
  const idx = geo.getIndex()
  const adj: number[][] = Array.from({ length: n }, () => [])
  if (idx) {
    for (let f = 0; f < idx.count / 3; f++) {
      const a = idx.getX(f * 3), b = idx.getX(f * 3 + 1), c = idx.getX(f * 3 + 2)
      adj[a].push(b, c); adj[b].push(a, c); adj[c].push(a, b)
    }
  } else {
    for (let f = 0; f < n / 3; f++) {
      const a = f * 3, b = a + 1, c = a + 2
      adj[a].push(b, c); adj[b].push(a, c); adj[c].push(a, b)
    }
  }

  // Unique neighbors
  const neighbors: number[][] = adj.map((list) => [...new Set(list)])

  const lambda = 0.33 * s.intensity // positivo
  const mu = -0.34 * s.intensity   // negativo (Taubin)

  const tmp = new Float32Array(n * 3)
  const original = new Float32Array(pos.array as Float32Array)

  const applyPass = (factor: number) => {
    for (let i = 0; i < n; i++) {
      const w = weights[i]
      if (w < 1e-4) {
        tmp[i * 3] = pos.getX(i)
        tmp[i * 3 + 1] = pos.getY(i)
        tmp[i * 3 + 2] = pos.getZ(i)
        continue
      }
      const nb = neighbors[i]
      if (nb.length === 0) {
        tmp[i * 3] = pos.getX(i)
        tmp[i * 3 + 1] = pos.getY(i)
        tmp[i * 3 + 2] = pos.getZ(i)
        continue
      }
      let sx = 0, sy = 0, sz = 0
      for (const j of nb) {
        sx += pos.getX(j)
        sy += pos.getY(j)
        sz += pos.getZ(j)
      }
      const inv = 1 / nb.length
      const lx = sx * inv - pos.getX(i)
      const ly = sy * inv - pos.getY(i)
      const lz = sz * inv - pos.getZ(i)
      // Deslocamento ponderado pela máscara e intensity
      tmp[i * 3]     = pos.getX(i) + lx * factor * w
      tmp[i * 3 + 1] = pos.getY(i) + ly * factor * w
      tmp[i * 3 + 2] = pos.getZ(i) + lz * factor * w
    }
    for (let i = 0; i < n; i++) {
      pos.setXYZ(i, tmp[i * 3], tmp[i * 3 + 1], tmp[i * 3 + 2])
    }
  }

  for (let it = 0; it < s.iterations; it++) {
    applyPass(lambda)
    applyPass(mu)
  }

  // Volume preservation: escala radial suave a partir do centróide da região
  if (s.preserveVolume) {
    const volBefore = estimateVolumeFromPositions(original, idx)
    const volAfter = estimateVolumeFromPositions(pos.array as Float32Array, idx)
    if (volBefore > 1e-12 && Math.abs(volAfter - volBefore) / volBefore > 0.001) {
      // Correção leve apenas nos vértices afetados
      const scale = Math.cbrt(volBefore / Math.max(volAfter, 1e-12))
      // Limita a correção
      const safeScale = Math.max(0.98, Math.min(1.02, scale))
      if (Math.abs(safeScale - 1) > 1e-6) {
        // centróide da região mascarada
        let cx = 0, cy = 0, cz = 0, cw = 0
        for (let i = 0; i < n; i++) {
          if (weights[i] < 1e-4) continue
          cx += pos.getX(i) * weights[i]
          cy += pos.getY(i) * weights[i]
          cz += pos.getZ(i) * weights[i]
          cw += weights[i]
        }
        if (cw > 0) {
          cx /= cw; cy /= cw; cz /= cw
          for (let i = 0; i < n; i++) {
            const w = weights[i]
            if (w < 1e-4) continue
            const x = pos.getX(i)
            const y = pos.getY(i)
            const z = pos.getZ(i)
            pos.setXYZ(
              i,
              cx + (x - cx) * (1 + (safeScale - 1) * w),
              cy + (y - cy) * (1 + (safeScale - 1) * w),
              cz + (z - cz) * (1 + (safeScale - 1) * w),
            )
          }
        }
      }
    }
  }

  // Vértices com weight≈0 devem ser EXATAMENTE iguais ao original
  for (let i = 0; i < n; i++) {
    if (weights[i] < 1e-4) {
      pos.setXYZ(i, original[i * 3], original[i * 3 + 1], original[i * 3 + 2])
    }
  }

  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

function estimateVolumeFromPositions(arr: ArrayLike<number>, idx: THREE.BufferAttribute | null): number {
  // Divergence theorem volume estimate for closed meshes
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

// ─── 4. Pipeline completo ────────────────────────────────────────────────────


// ─── 3b. Micro-fillet na fronteira do corte ──────────────────────────────────

/**
 * Aproxima um fillet sutil nos vértices de borda da região de corte.
 * Desloca cada vértice de fronteira ao longo da normal média das faces
 * adjacentes, com amplitude proporcional a intensity × radiusMm × weight.
 * Vértices com weight≈0 permanecem intactos.
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
  const n = pos.count
  const idx = geo.getIndex()

  // Build face normals per vertex (area-weighted)
  const nx = new Float32Array(n)
  const ny = new Float32Array(n)
  const nz = new Float32Array(n)
  const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3()
  const ab = new THREE.Vector3(), ac = new THREE.Vector3(), fn = new THREE.Vector3()

  const faceCount = idx ? idx.count / 3 : n / 3
  for (let f = 0; f < faceCount; f++) {
    let a: number, b: number, c: number
    if (idx) {
      a = idx.getX(f * 3); b = idx.getX(f * 3 + 1); c = idx.getX(f * 3 + 2)
    } else {
      a = f * 3; b = f * 3 + 1; c = f * 3 + 2
    }
    va.fromBufferAttribute(pos, a)
    vb.fromBufferAttribute(pos, b)
    vc.fromBufferAttribute(pos, c)
    ab.subVectors(vb, va)
    ac.subVectors(vc, va)
    fn.crossVectors(ab, ac)
    const area = fn.length()
    if (area < 1e-14) continue
    fn.multiplyScalar(1 / area) // unit-ish; keep area weight by not fully normalizing before add
    // re-normalize for direction, weight by area
    const len = fn.length()
    if (len < 1e-12) continue
    const wx = (fn.x / len) * area
    const wy = (fn.y / len) * area
    const wz = (fn.z / len) * area
    nx[a] += wx; ny[a] += wy; nz[a] += wz
    nx[b] += wx; ny[b] += wy; nz[b] += wz
    nx[c] += wx; ny[c] += wy; nz[c] += wz
  }

  // Amplitude max in scene units (radiusMm is the influence; fillet is a fraction)
  const maxDisp = (s.radiusMm * 0.35 * s.intensity) / Math.max(scaleToMm, 1e-6)

  for (let i = 0; i < n; i++) {
    const w = weights[i]
    if (w < 0.15) continue // só região de influência relevante
    const len = Math.sqrt(nx[i] * nx[i] + ny[i] * ny[i] + nz[i] * nz[i])
    if (len < 1e-12) continue
    // Falloff: mais forte no centro da máscara (borda do corte tipicamente ~1)
    const amp = maxDisp * w * w
    pos.setXYZ(
      i,
      pos.getX(i) + (nx[i] / len) * amp,
      pos.getY(i) + (ny[i] / len) * amp,
      pos.getZ(i) + (nz[i] / len) * amp,
    )
  }

  pos.needsUpdate = true
  return geo
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
  const scale = opts?.scaleToMm ?? 1
  let region = identifyCutRegion(sourceGeometry, opts)

  // Fallback agressivo: se nada detectado, usa boundary aberta ou
  // seeds nos vértices de maior curvatura (ainda localizado, não global).
  if (region.method === 'fallback-none') {
    region = identifyCutRegion(sourceGeometry, opts)
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

  // Último recurso: máscara suave nos 8% vértices de maior curvatura
  if (maxW < 1e-4) {
    const curv = estimateVertexCurvature(sourceGeometry)
    const n = curv.length
    const sorted = Array.from(curv).map((c, i) => [c, i] as [number, number])
    sorted.sort((a, b) => b[0] - a[0])
    const take = Math.max(12, Math.floor(n * 0.08))
    const seeds = new Float32Array(n)
    for (let k = 0; k < take; k++) seeds[sorted[k][1]] = 1
    expanded = expandInfluenceMask(sourceGeometry, seeds, s.radiusMm, scale, s.preserveDetails)
    maxW = 0
    for (let i = 0; i < expanded.length; i++) if (expanded[i] > maxW) maxW = expanded[i]
  }

  if (maxW < 1e-4) {
    const geo = sourceGeometry.clone()
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
  // 2) Taubin localizado (limpa irregularidades restantes)
  resultGeo = applyLocalizedSmooth(resultGeo, expanded, s)

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

export function estimateVolume(geometry: THREE.BufferGeometry): number {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  return estimateVolumeFromPositions(pos.array as Float32Array, geometry.getIndex())
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

  // Degenerate triangles
  let degenerates = 0
  const faceCount = idx ? idx.count / 3 : n / 3
  const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3()
  for (let f = 0; f < faceCount; f++) {
    let a: number, b: number, c: number
    if (idx) {
      a = idx.getX(f * 3); b = idx.getX(f * 3 + 1); c = idx.getX(f * 3 + 2)
    } else {
      a = f * 3; b = f * 3 + 1; c = f * 3 + 2
    }
    if (a === b || b === c || a === c) { degenerates++; continue }
    va.fromBufferAttribute(pos, a)
    vb.fromBufferAttribute(pos, b)
    vc.fromBufferAttribute(pos, c)
    const area = new THREE.Vector3().subVectors(vb, va).cross(new THREE.Vector3().subVectors(vc, va)).length()
    if (area < 1e-14) degenerates++
  }
  if (degenerates > 0) issues.push(`${degenerates} triângulos degenerados`)

  // NaN check
  let nans = 0
  for (let i = 0; i < n * 3; i++) {
    if (!Number.isFinite((pos.array as Float32Array)[i])) nans++
  }
  if (nans > 0) issues.push(`${nans} valores não-finitos na geometria`)

  const volume = estimateVolume(geometry)
  if (volumeBefore !== undefined && volumeBefore > 1e-12) {
    const deltaPct = Math.abs((volume - volumeBefore) / volumeBefore) * 100
    if (deltaPct > ACAB_LIMITS.maxVolumeDeltaPct) {
      issues.push(`Variação de volume excessiva (${deltaPct.toFixed(2)}%)`)
    }
  }

  // Edge manifold-ish check (edges with >2 faces)
  if (idx) {
    const edgeCount = new Map<string, number>()
    const edgeKey = (a: number, b: number) => (a < b ? `${a}_${b}` : `${b}_${a}`)
    for (let f = 0; f < faceCount; f++) {
      const a = idx.getX(f * 3), b = idx.getX(f * 3 + 1), c = idx.getX(f * 3 + 2)
      for (const [u, v] of [[a, b], [b, c], [c, a]] as [number, number][]) {
        const k = edgeKey(u, v)
        edgeCount.set(k, (edgeCount.get(k) || 0) + 1)
      }
    }
    let nonManifold = 0
    for (const c of edgeCount.values()) if (c > 2) nonManifold++
    if (nonManifold > 0) issues.push(`${nonManifold} arestas non-manifold`)
  }

  return {
    valid: issues.length === 0,
    issues,
    volume,
  }
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
