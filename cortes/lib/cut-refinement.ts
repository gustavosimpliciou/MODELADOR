/**
<<<<<<< HEAD
 * Cut Refinement — 4ª etapa do pipeline AutoCut (PREMIUM)
 * ───────────────────────────────────────────────────────
 *
 * Responsabilidade isolada: ACABAMENTO GEOMÉTRICO profissional das regiões
 * produzidas pelo corte. Não recalcula o corte, não decide onde cortar.
=======
<<<<<<< HEAD
 * Cut Refinement — 4ª etapa do pipeline AutoCut (PREMIUM)
 * ───────────────────────────────────────────────────────
 *
 * Responsabilidade isolada: ACABAMENTO GEOMÉTRICO profissional das regiões
 * produzidas pelo corte. Não recalcula o corte, não decide onde cortar.
=======
 * Cut Refinement — 4ª etapa do pipeline AutoCut
 * ─────────────────────────────────────────────
 *
 * Responsabilidade isolada: ACABAMENTO GEOMÉTRICO das regiões produzidas
 * pelo corte. Não recalcula o corte, não gera tampas, não decide onde cortar.
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
 *
 * Pipeline:
 *   calculateCut → generateCaps → applyCut → refineCut → resultado final
 *
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
 * Estratégia PREMIUM:
 *   1. Detectar loops de contorno do corte (boundary)
 *   2. Fairing + Catmull-Rom no contorno (eliminar dentes de serra)
 *   3. Micro-fillet real: inserir 1–2 anéis de faces com perfil arredondado
 *   4. Suavizar faixa de 1–2 anéis (Taubin restrito)
 *   5. Normais contínuas + validação
<<<<<<< HEAD
 *
 * intensity = 0 → bypass total (compatibilidade com AutoCut atual)
 *
 * NÃO altera seleção, SmartCut, calculateCut nem generateCaps.
=======
 *
 * intensity = 0 → bypass total (compatibilidade com AutoCut atual)
 *
 * NÃO altera seleção, SmartCut, calculateCut nem generateCaps.
=======
 * Princípios:
 *   CORTE   = forma
 *   TAMPA   = fechamento
 *   REFINAÇÃO = acabamento (micro-fillet sutil + continuidade de borda)
 *
 * Quando intensity = 0 / disabled → retorna a geometria intacta (compatibilidade).
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
 */

import * as THREE from 'three'
import { computeSmoothNormalsByPosition } from './smart-cut'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CutRefinementOptions {
  /**
   * Intensidade 0..100.
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
   * 0   = desabilitado
   * 1–25  = micro (quase invisível isolado, ótimo em comparação antes/depois)
   * 26–55 = premium padrão (recomendado)
   * 56–100 = mais arredondado, sempre limitado pelo safeRadius
<<<<<<< HEAD
=======
   */
  intensity: number
  /** Anéis de fillet (1 ou 2). Default 2 para perfil mais suave. */
  filletRings?: number
  /** Segmentos extras por aresta longa (densidade do fillet). Default auto. */
  segments?: number
  /** Raio solicitado (unidades do modelo). Se omitido, deriva da geometria. */
  requestedRadius?: number
  /** Vértices protegidos (encaixes, slots, furos) — chave quantizada. */
  protectedVertexKeys?: Set<string>
=======
   * 0   = desabilitado (resultado idêntico ao AutoCut atual)
   * 1–30 = micro-acabamento (padrão recomendado)
   * 31–70 = acabamento perceptível
   * 71–100 = mais arredondado, sempre limitado pelo safeRadius
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
   */
  intensity: number
  /** Anéis de fillet (1 ou 2). Default 2 para perfil mais suave. */
  filletRings?: number
  /** Segmentos extras por aresta longa (densidade do fillet). Default auto. */
  segments?: number
  /** Raio solicitado (unidades do modelo). Se omitido, deriva da geometria. */
  requestedRadius?: number
  /** Vértices protegidos (encaixes, slots, furos) — chave quantizada. */
  protectedVertexKeys?: Set<string>
<<<<<<< HEAD
=======
  /**
   * Quantização de soldagem (mesmo valor do pipeline).
   */
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
  weldQ?: number
}

export const DEFAULT_REFINEMENT: CutRefinementOptions = {
<<<<<<< HEAD
  intensity: 42,
  filletRings: 2,
  segments: 4,
=======
<<<<<<< HEAD
  intensity: 42,
  filletRings: 2,
  segments: 4,
  weldQ: 1e4,
}

export interface CutResultMeta {
  seamPoints?: Float32Array | null
  seamScore?: number
=======
  intensity: 18,
  segments: 3,
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
  weldQ: 1e4,
}

export interface CutResultMeta {
  seamPoints?: Float32Array | null
  seamScore?: number
<<<<<<< HEAD
=======
  /** Nº aproximado de segmentos da costura. */
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
  seamSegments?: number
}

export interface RefineResult {
  geometry: THREE.BufferGeometry
  applied: boolean
  safeRadius: number
  boundaryVertexCount: number
  issues: string[]
}

<<<<<<< HEAD
// ─── Quantização ──────────────────────────────────────────────────────────────
=======
<<<<<<< HEAD
// ─── Quantização ──────────────────────────────────────────────────────────────
=======
// ─── Helpers de quantização / chave ───────────────────────────────────────────
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a

const Q_DEFAULT = 1e4

function keyOf(x: number, y: number, z: number, Q: number): string {
  return `${Math.round(x * Q)},${Math.round(y * Q)},${Math.round(z * Q)}`
}

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
function keyV(v: THREE.Vector3, Q: number): string {
  return keyOf(v.x, v.y, v.z, Q)
}

<<<<<<< HEAD
=======
=======
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
function keyFromAttr(pos: THREE.BufferAttribute, i: number, Q: number): string {
  return keyOf(pos.getX(i), pos.getY(i), pos.getZ(i), Q)
}

<<<<<<< HEAD
// ─── Detecção de boundary ─────────────────────────────────────────────────────

interface BoundaryEdge {
  a: number
=======
<<<<<<< HEAD
// ─── Detecção de boundary ─────────────────────────────────────────────────────

interface BoundaryEdge {
  a: number
=======
// ─── Detecção de boundary loops ───────────────────────────────────────────────

interface BoundaryEdge {
  a: number // vertex index
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
  b: number
  keyA: string
  keyB: string
}

interface BoundaryInfo {
<<<<<<< HEAD
=======
<<<<<<< HEAD
  boundaryVerts: Set<number>
  edges: BoundaryEdge[]
  loops: number[][]
  meanEdgeLen: number
  minEdgeLen: number
  medianEdgeLen: number
}

=======
  /** Índices de vértices que pertencem a pelo menos uma aresta de borda. */
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
  boundaryVerts: Set<number>
  edges: BoundaryEdge[]
  loops: number[][]
  meanEdgeLen: number
  minEdgeLen: number
  medianEdgeLen: number
}

<<<<<<< HEAD
=======
/**
 * Detecta arestas de contorno (boundary) de uma BufferGeometry.
 * Funciona tanto em malhas indexadas quanto non-indexed (pos.length/3 faces).
 */
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
function detectBoundary(geo: THREE.BufferGeometry, weldQ: number): BoundaryInfo {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const idx = geo.index
  const faceCount = idx ? idx.count / 3 : pos.count / 3

  const edgeCount = new Map<string, number>()
  const edgeVerts = new Map<string, [number, number]>()

  const edgeKey = (ia: number, ib: number) => {
    const ka = keyFromAttr(pos, ia, weldQ)
    const kb = keyFromAttr(pos, ib, weldQ)
    return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`
  }

  for (let f = 0; f < faceCount; f++) {
    const i0 = idx ? idx.getX(f * 3) : f * 3
    const i1 = idx ? idx.getX(f * 3 + 1) : f * 3 + 1
    const i2 = idx ? idx.getX(f * 3 + 2) : f * 3 + 2
    const corners = [i0, i1, i2]
    for (let c = 0; c < 3; c++) {
      const a = corners[c]
      const b = corners[(c + 1) % 3]
      const k = edgeKey(a, b)
      edgeCount.set(k, (edgeCount.get(k) ?? 0) + 1)
      if (!edgeVerts.has(k)) edgeVerts.set(k, [a, b])
    }
  }

  const boundaryVerts = new Set<number>()
  const edges: BoundaryEdge[] = []
<<<<<<< HEAD
  const lengths: number[] = []
=======
<<<<<<< HEAD
  const lengths: number[] = []
=======
  let sumLen = 0
  let minLen = Infinity
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
  const tmpA = new THREE.Vector3()
  const tmpB = new THREE.Vector3()

  for (const [k, cnt] of edgeCount) {
    if (cnt !== 1) continue
    const [a, b] = edgeVerts.get(k)!
    boundaryVerts.add(a)
    boundaryVerts.add(b)
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
    edges.push({
      a, b,
      keyA: keyFromAttr(pos, a, weldQ),
      keyB: keyFromAttr(pos, b, weldQ),
    })
<<<<<<< HEAD
=======
    tmpA.set(pos.getX(a), pos.getY(a), pos.getZ(a))
    tmpB.set(pos.getX(b), pos.getY(b), pos.getZ(b))
    const len = tmpA.distanceTo(tmpB)
    if (len > 1e-12) lengths.push(len)
  }

  lengths.sort((a, b) => a - b)
  const meanEdgeLen = lengths.length ? lengths.reduce((s, v) => s + v, 0) / lengths.length : 0.01
  const minEdgeLen = lengths.length ? lengths[0] : meanEdgeLen
  const medianEdgeLen = lengths.length ? lengths[Math.floor(lengths.length / 2)] : meanEdgeLen

  const loops = buildLoops(edges, pos, weldQ)
  return { boundaryVerts, edges, loops, meanEdgeLen, minEdgeLen, medianEdgeLen }
}

=======
    const keyA = keyFromAttr(pos, a, weldQ)
    const keyB = keyFromAttr(pos, b, weldQ)
    edges.push({ a, b, keyA, keyB })
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
    tmpA.set(pos.getX(a), pos.getY(a), pos.getZ(a))
    tmpB.set(pos.getX(b), pos.getY(b), pos.getZ(b))
    const len = tmpA.distanceTo(tmpB)
    if (len > 1e-12) lengths.push(len)
  }

  lengths.sort((a, b) => a - b)
  const meanEdgeLen = lengths.length ? lengths.reduce((s, v) => s + v, 0) / lengths.length : 0.01
  const minEdgeLen = lengths.length ? lengths[0] : meanEdgeLen
  const medianEdgeLen = lengths.length ? lengths[Math.floor(lengths.length / 2)] : meanEdgeLen

  const loops = buildLoops(edges, pos, weldQ)
  return { boundaryVerts, edges, loops, meanEdgeLen, minEdgeLen, medianEdgeLen }
}

<<<<<<< HEAD
=======
/**
 * Constrói loops ordenados a partir de arestas de borda.
 * Não exige malha half-edge completa — usa mapa de adjacência por chave.
 */
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
function buildLoops(
  edges: BoundaryEdge[],
  pos: THREE.BufferAttribute,
  weldQ: number,
): number[][] {
  if (edges.length === 0) return []

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
  // Adjacência: key → lista de (outroKey, vertexIndexDoOutro, vertexIndexDeste)
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
  const adj = new Map<string, { otherKey: string; otherIdx: number; selfIdx: number }[]>()
  const add = (from: string, to: string, otherIdx: number, selfIdx: number) => {
    let list = adj.get(from)
    if (!list) { list = []; adj.set(from, list) }
    list.push({ otherKey: to, otherIdx, selfIdx })
  }
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======

>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
  for (const e of edges) {
    add(e.keyA, e.keyB, e.b, e.a)
    add(e.keyB, e.keyA, e.a, e.b)
  }

  const visited = new Set<string>()
  const loops: number[][] = []

  for (const startKey of adj.keys()) {
    if (visited.has(startKey)) continue
    const loop: number[] = []
    let cur = startKey
    let prev: string | null = null
    let guard = 0
<<<<<<< HEAD
    const maxGuard = edges.length * 3 + 8
=======
<<<<<<< HEAD
    const maxGuard = edges.length * 3 + 8
=======
    const maxGuard = edges.length * 2 + 4
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a

    while (guard++ < maxGuard) {
      if (visited.has(cur) && loop.length > 0) break
      visited.add(cur)
<<<<<<< HEAD
=======
<<<<<<< HEAD
      const neighbors = adj.get(cur) ?? []
      let next = neighbors.find((n) => n.otherKey !== prev) ?? neighbors[0]
      if (!next) break
      loop.push(next.selfIdx)
      prev = cur
      cur = next.otherKey
      if (cur === startKey && loop.length > 2) break
    }
    if (loop.length >= 3) loops.push(loop)
  }
  return loops
}

// ─── Safe radius ──────────────────────────────────────────────────────────────

function computeSafeRadius(
  info: BoundaryInfo,
  intensity: number,
  requestedRadius?: number,
): number {
  const t = Math.max(0, Math.min(100, intensity)) / 100
  const fromMed = info.medianEdgeLen * (0.12 + t * 0.28)
  const fromMin = info.minEdgeLen * 0.45
  let safe = Math.min(fromMed, fromMin)
  if (requestedRadius != null && requestedRadius > 0) {
    safe = Math.min(safe, requestedRadius)
  }
  const scale = t * t * (3 - 2 * t)
  return Math.max(0, safe * (0.55 + 0.45 * scale))
}

// ─── Contorno: fairing + Catmull-Rom ──────────────────────────────────────────

function loopToPoints(geo: THREE.BufferGeometry, loop: number[]): THREE.Vector3[] {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  return loop.map((i) => new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)))
}

function fairLoop(pts: THREE.Vector3[], iterations: number, alpha = 0.35): THREE.Vector3[] {
  if (pts.length < 4 || iterations <= 0) return pts.map((p) => p.clone())
  let cur = pts.map((p) => p.clone())
  const n = cur.length
  for (let it = 0; it < iterations; it++) {
    const next: THREE.Vector3[] = new Array(n)
    for (let i = 0; i < n; i++) {
      const prev = cur[(i - 1 + n) % n]
      const nxt = cur[(i + 1) % n]
      const avg = prev.clone().add(nxt).multiplyScalar(0.5)
      next[i] = cur[i].clone().lerp(avg, alpha)
    }
    cur = next
  }
  return cur
}

function resampleCatmullRom(pts: THREE.Vector3[], count: number): THREE.Vector3[] {
  const n = pts.length
  if (n < 3 || count < 3) return pts.map((p) => p.clone())

  const segLen: number[] = []
  let total = 0
  for (let i = 0; i < n; i++) {
    const d = pts[i].distanceTo(pts[(i + 1) % n])
    segLen.push(d)
    total += d
  }
  if (total < 1e-12) return pts.map((p) => p.clone())

  const out: THREE.Vector3[] = []
  for (let s = 0; s < count; s++) {
    const target = (s / count) * total
    let acc = 0
    let i = 0
    while (i < n && acc + segLen[i] < target) {
      acc += segLen[i]
      i++
    }
    const i0 = (i - 1 + n) % n
    const i1 = i % n
    const i2 = (i + 1) % n
    const i3 = (i + 2) % n
    const local = segLen[i1] > 1e-12 ? (target - acc) / segLen[i1] : 0
    const t = Math.max(0, Math.min(1, local))
    out.push(catmullRom(pts[i0], pts[i1], pts[i2], pts[i3], t))
  }
  return out
}

function catmullRom(
  p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, t: number,
): THREE.Vector3 {
  const t2 = t * t
  const t3 = t2 * t
  return new THREE.Vector3(
    0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    0.5 * ((2 * p1.z) + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3),
  )
}

function loopCentroid(pts: THREE.Vector3[]): THREE.Vector3 {
  const c = new THREE.Vector3()
  for (const p of pts) c.add(p)
  return c.multiplyScalar(1 / Math.max(1, pts.length))
}

function loopNormal(pts: THREE.Vector3[]): THREE.Vector3 {
  const n = new THREE.Vector3()
  const m = pts.length
  for (let i = 0; i < m; i++) {
    const cur = pts[i]
    const nxt = pts[(i + 1) % m]
    n.x += (cur.y - nxt.y) * (cur.z + nxt.z)
    n.y += (cur.z - nxt.z) * (cur.x + nxt.x)
    n.z += (cur.x - nxt.x) * (cur.y + nxt.y)
  }
  if (n.lengthSq() < 1e-20) return new THREE.Vector3(0, 1, 0)
  return n.normalize()
}

function computeVertexNormalsMap(
  geo: THREE.BufferGeometry,
  weldQ: number,
): Map<string, THREE.Vector3> {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const idx = geo.index
  const faceCount = idx ? idx.count / 3 : pos.count / 3
  const map = new Map<string, THREE.Vector3>()
  const ab = new THREE.Vector3(), ac = new THREE.Vector3(), fn = new THREE.Vector3()

  for (let f = 0; f < faceCount; f++) {
    const i0 = idx ? idx.getX(f * 3) : f * 3
    const i1 = idx ? idx.getX(f * 3 + 1) : f * 3 + 1
    const i2 = idx ? idx.getX(f * 3 + 2) : f * 3 + 2
    ab.set(pos.getX(i1) - pos.getX(i0), pos.getY(i1) - pos.getY(i0), pos.getZ(i1) - pos.getZ(i0))
    ac.set(pos.getX(i2) - pos.getX(i0), pos.getY(i2) - pos.getY(i0), pos.getZ(i2) - pos.getZ(i0))
    fn.crossVectors(ab, ac)
    if (fn.lengthSq() < 1e-20) continue
    fn.normalize()
    for (const vi of [i0, i1, i2]) {
      const k = keyFromAttr(pos, vi, weldQ)
      let n = map.get(k)
      if (!n) { n = new THREE.Vector3(); map.set(k, n) }
      n.add(fn)
    }
  }
  for (const n of map.values()) {
    if (n.lengthSq() > 1e-20) n.normalize()
  }
  return map
}

function buildFilletStrip(
  smoothLoop: THREE.Vector3[],
  surfaceNormals: Map<string, THREE.Vector3>,
  planeNormal: THREE.Vector3,
  centroid: THREE.Vector3,
  radius: number,
  rings: number,
  weldQ: number,
  protectedKeys: Set<string> | undefined,
): { positions: number[]; indices: number[] } {
  const n = smoothLoop.length
  if (n < 3 || radius <= 1e-12) return { positions: [], indices: [] }

  const ringCount = Math.max(1, Math.min(2, rings))
  const profileAngles = ringCount === 1 ? [Math.PI / 4] : [Math.PI / 6, Math.PI / 3]

  const frames: {
    p: THREE.Vector3
    inward: THREE.Vector3
    normal: THREE.Vector3
    protected: boolean
  }[] = []

  for (let i = 0; i < n; i++) {
    const p = smoothLoop[i]
    const k = keyV(p, weldQ)
    const protectedV = protectedKeys?.has(k) ?? false

    const inward = centroid.clone().sub(p)
    const pn = planeNormal.clone().normalize()
    inward.sub(pn.clone().multiplyScalar(inward.dot(pn)))
    if (inward.lengthSq() < 1e-16) {
      const prev = smoothLoop[(i - 1 + n) % n]
      const nxt = smoothLoop[(i + 1) % n]
      const tan = nxt.clone().sub(prev).normalize()
      inward.crossVectors(pn, tan)
    }
    if (inward.lengthSq() > 1e-16) inward.normalize()
    else inward.set(0, 0, 0)

    let sn = surfaceNormals.get(k)?.clone() ?? planeNormal.clone()
    if (sn.lengthSq() < 1e-16) sn = planeNormal.clone()
    sn.normalize()
    if (sn.dot(planeNormal) < 0) sn.negate()

    frames.push({ p: p.clone(), inward, normal: sn, protected: protectedV })
  }

  const allRings: THREE.Vector3[][] = [frames.map((f) => f.p.clone())]

  for (let r = 0; r < ringCount; r++) {
    const angle = profileAngles[r]
    const ring: THREE.Vector3[] = []
    for (let i = 0; i < n; i++) {
      const f = frames[i]
      if (f.protected) {
        ring.push(f.p.clone())
        continue
      }
      const sinA = Math.sin(angle)
      const cosA = Math.cos(angle)
      const offset = f.inward.clone().multiplyScalar(radius * sinA)
        .add(f.normal.clone().multiplyScalar(radius * (1 - cosA)))
      ring.push(f.p.clone().add(offset))
    }
    allRings.push(ring)
  }

  const positions: number[] = []
  for (const ring of allRings) {
    for (const p of ring) positions.push(p.x, p.y, p.z)
  }

  const indices: number[] = []
  for (let r = 0; r < allRings.length - 1; r++) {
    const baseA = r * n
    const baseB = (r + 1) * n
    for (let i = 0; i < n; i++) {
      const i1 = (i + 1) % n
      const a0 = baseA + i
      const a1 = baseA + i1
      const b0 = baseB + i
      const b1 = baseB + i1
      indices.push(a0, b0, a1)
      indices.push(a1, b0, b1)
    }
  }

  return { positions, indices }
}

function applyPremiumRefinement(
  geo: THREE.BufferGeometry,
  info: BoundaryInfo,
  safeRadius: number,
  intensity: number,
  weldQ: number,
  protectedKeys: Set<string> | undefined,
  filletRings: number,
): { geometry: THREE.BufferGeometry; issues: string[] } {
  const issues: string[] = []
  if (safeRadius <= 1e-12) {
    return { geometry: geo, issues: ['safeRadius zero'] }
  }

  const t = Math.max(0, Math.min(100, intensity)) / 100
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const idx = geo.index

  const fairIters = Math.round(2 + t * 6)
  const fairAlpha = 0.25 + t * 0.2

=======

>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
      const neighbors = adj.get(cur) ?? []
      let next = neighbors.find((n) => n.otherKey !== prev) ?? neighbors[0]
      if (!next) break
      loop.push(next.selfIdx)
      prev = cur
      cur = next.otherKey
      if (cur === startKey && loop.length > 2) break
    }
    if (loop.length >= 3) loops.push(loop)
  }
  return loops
}

// ─── Safe radius ──────────────────────────────────────────────────────────────

function computeSafeRadius(
  info: BoundaryInfo,
  intensity: number,
  requestedRadius?: number,
): number {
  const t = Math.max(0, Math.min(100, intensity)) / 100
  const fromMed = info.medianEdgeLen * (0.12 + t * 0.28)
  const fromMin = info.minEdgeLen * 0.45
  let safe = Math.min(fromMed, fromMin)
  if (requestedRadius != null && requestedRadius > 0) {
    safe = Math.min(safe, requestedRadius)
  }
  const scale = t * t * (3 - 2 * t)
  return Math.max(0, safe * (0.55 + 0.45 * scale))
}

// ─── Contorno: fairing + Catmull-Rom ──────────────────────────────────────────

function loopToPoints(geo: THREE.BufferGeometry, loop: number[]): THREE.Vector3[] {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  return loop.map((i) => new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)))
}

function fairLoop(pts: THREE.Vector3[], iterations: number, alpha = 0.35): THREE.Vector3[] {
  if (pts.length < 4 || iterations <= 0) return pts.map((p) => p.clone())
  let cur = pts.map((p) => p.clone())
  const n = cur.length
  for (let it = 0; it < iterations; it++) {
    const next: THREE.Vector3[] = new Array(n)
    for (let i = 0; i < n; i++) {
      const prev = cur[(i - 1 + n) % n]
      const nxt = cur[(i + 1) % n]
      const avg = prev.clone().add(nxt).multiplyScalar(0.5)
      next[i] = cur[i].clone().lerp(avg, alpha)
    }
    cur = next
  }
  return cur
}

function resampleCatmullRom(pts: THREE.Vector3[], count: number): THREE.Vector3[] {
  const n = pts.length
  if (n < 3 || count < 3) return pts.map((p) => p.clone())

  const segLen: number[] = []
  let total = 0
  for (let i = 0; i < n; i++) {
    const d = pts[i].distanceTo(pts[(i + 1) % n])
    segLen.push(d)
    total += d
  }
  if (total < 1e-12) return pts.map((p) => p.clone())

  const out: THREE.Vector3[] = []
  for (let s = 0; s < count; s++) {
    const target = (s / count) * total
    let acc = 0
    let i = 0
    while (i < n && acc + segLen[i] < target) {
      acc += segLen[i]
      i++
    }
    const i0 = (i - 1 + n) % n
    const i1 = i % n
    const i2 = (i + 1) % n
    const i3 = (i + 2) % n
    const local = segLen[i1] > 1e-12 ? (target - acc) / segLen[i1] : 0
    const t = Math.max(0, Math.min(1, local))
    out.push(catmullRom(pts[i0], pts[i1], pts[i2], pts[i3], t))
  }
  return out
}

function catmullRom(
  p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, t: number,
): THREE.Vector3 {
  const t2 = t * t
  const t3 = t2 * t
  return new THREE.Vector3(
    0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    0.5 * ((2 * p1.z) + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3),
  )
}

function loopCentroid(pts: THREE.Vector3[]): THREE.Vector3 {
  const c = new THREE.Vector3()
  for (const p of pts) c.add(p)
  return c.multiplyScalar(1 / Math.max(1, pts.length))
}

function loopNormal(pts: THREE.Vector3[]): THREE.Vector3 {
  const n = new THREE.Vector3()
  const m = pts.length
  for (let i = 0; i < m; i++) {
    const cur = pts[i]
    const nxt = pts[(i + 1) % m]
    n.x += (cur.y - nxt.y) * (cur.z + nxt.z)
    n.y += (cur.z - nxt.z) * (cur.x + nxt.x)
    n.z += (cur.x - nxt.x) * (cur.y + nxt.y)
  }
  if (n.lengthSq() < 1e-20) return new THREE.Vector3(0, 1, 0)
  return n.normalize()
}

function computeVertexNormalsMap(
  geo: THREE.BufferGeometry,
  weldQ: number,
): Map<string, THREE.Vector3> {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const idx = geo.index
  const faceCount = idx ? idx.count / 3 : pos.count / 3
  const map = new Map<string, THREE.Vector3>()
  const ab = new THREE.Vector3(), ac = new THREE.Vector3(), fn = new THREE.Vector3()

  for (let f = 0; f < faceCount; f++) {
    const i0 = idx ? idx.getX(f * 3) : f * 3
    const i1 = idx ? idx.getX(f * 3 + 1) : f * 3 + 1
    const i2 = idx ? idx.getX(f * 3 + 2) : f * 3 + 2
    ab.set(pos.getX(i1) - pos.getX(i0), pos.getY(i1) - pos.getY(i0), pos.getZ(i1) - pos.getZ(i0))
    ac.set(pos.getX(i2) - pos.getX(i0), pos.getY(i2) - pos.getY(i0), pos.getZ(i2) - pos.getZ(i0))
    fn.crossVectors(ab, ac)
    if (fn.lengthSq() < 1e-20) continue
    fn.normalize()
    for (const vi of [i0, i1, i2]) {
      const k = keyFromAttr(pos, vi, weldQ)
      let n = map.get(k)
      if (!n) { n = new THREE.Vector3(); map.set(k, n) }
      n.add(fn)
    }
  }
  for (const n of map.values()) {
    if (n.lengthSq() > 1e-20) n.normalize()
  }
  return map
}

function buildFilletStrip(
  smoothLoop: THREE.Vector3[],
  surfaceNormals: Map<string, THREE.Vector3>,
  planeNormal: THREE.Vector3,
  centroid: THREE.Vector3,
  radius: number,
  rings: number,
  weldQ: number,
  protectedKeys: Set<string> | undefined,
): { positions: number[]; indices: number[] } {
  const n = smoothLoop.length
  if (n < 3 || radius <= 1e-12) return { positions: [], indices: [] }

  const ringCount = Math.max(1, Math.min(2, rings))
  const profileAngles = ringCount === 1 ? [Math.PI / 4] : [Math.PI / 6, Math.PI / 3]

  const frames: {
    p: THREE.Vector3
    inward: THREE.Vector3
    normal: THREE.Vector3
    protected: boolean
  }[] = []

  for (let i = 0; i < n; i++) {
    const p = smoothLoop[i]
    const k = keyV(p, weldQ)
    const protectedV = protectedKeys?.has(k) ?? false

    const inward = centroid.clone().sub(p)
    const pn = planeNormal.clone().normalize()
    inward.sub(pn.clone().multiplyScalar(inward.dot(pn)))
    if (inward.lengthSq() < 1e-16) {
      const prev = smoothLoop[(i - 1 + n) % n]
      const nxt = smoothLoop[(i + 1) % n]
      const tan = nxt.clone().sub(prev).normalize()
      inward.crossVectors(pn, tan)
    }
    if (inward.lengthSq() > 1e-16) inward.normalize()
    else inward.set(0, 0, 0)

    let sn = surfaceNormals.get(k)?.clone() ?? planeNormal.clone()
    if (sn.lengthSq() < 1e-16) sn = planeNormal.clone()
    sn.normalize()
    if (sn.dot(planeNormal) < 0) sn.negate()

    frames.push({ p: p.clone(), inward, normal: sn, protected: protectedV })
  }

  const allRings: THREE.Vector3[][] = [frames.map((f) => f.p.clone())]

  for (let r = 0; r < ringCount; r++) {
    const angle = profileAngles[r]
    const ring: THREE.Vector3[] = []
    for (let i = 0; i < n; i++) {
      const f = frames[i]
      if (f.protected) {
        ring.push(f.p.clone())
        continue
      }
      const sinA = Math.sin(angle)
      const cosA = Math.cos(angle)
      const offset = f.inward.clone().multiplyScalar(radius * sinA)
        .add(f.normal.clone().multiplyScalar(radius * (1 - cosA)))
      ring.push(f.p.clone().add(offset))
    }
    allRings.push(ring)
  }

  const positions: number[] = []
  for (const ring of allRings) {
    for (const p of ring) positions.push(p.x, p.y, p.z)
  }

  const indices: number[] = []
  for (let r = 0; r < allRings.length - 1; r++) {
    const baseA = r * n
    const baseB = (r + 1) * n
    for (let i = 0; i < n; i++) {
      const i1 = (i + 1) % n
      const a0 = baseA + i
      const a1 = baseA + i1
      const b0 = baseB + i
      const b1 = baseB + i1
      indices.push(a0, b0, a1)
      indices.push(a1, b0, b1)
    }
  }

  return { positions, indices }
}

function applyPremiumRefinement(
  geo: THREE.BufferGeometry,
  info: BoundaryInfo,
  safeRadius: number,
  intensity: number,
  weldQ: number,
  protectedKeys: Set<string> | undefined,
  filletRings: number,
): { geometry: THREE.BufferGeometry; issues: string[] } {
  const issues: string[] = []
  if (safeRadius <= 1e-12) {
    return { geometry: geo, issues: ['safeRadius zero'] }
  }

  const t = Math.max(0, Math.min(100, intensity)) / 100
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const idx = geo.index

  const fairIters = Math.round(2 + t * 6)
  const fairAlpha = 0.25 + t * 0.2

<<<<<<< HEAD
=======
  // Mapa key → índices de vértice (para lidar com non-indexed)
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
  const keyToIndices = new Map<string, number[]>()
  for (let i = 0; i < pos.count; i++) {
    const k = keyFromAttr(pos, i, weldQ)
    let arr = keyToIndices.get(k)
    if (!arr) { arr = []; keyToIndices.set(k, arr) }
    arr.push(i)
  }

<<<<<<< HEAD
  const posArr = (pos.array as Float32Array).slice()
  const surfaceNormals = computeVertexNormalsMap(geo, weldQ)
=======
<<<<<<< HEAD
  const posArr = (pos.array as Float32Array).slice()
  const surfaceNormals = computeVertexNormalsMap(geo, weldQ)

  const filletPositions: number[] = []
  const filletIndices: number[] = []
  let filletVertBase = 0

  for (const loop of info.loops) {
    if (loop.length < 3) continue

    const rawPts = loopToPoints(geo, loop)
    const perimeter = rawPts.reduce((s, p, i) => s + p.distanceTo(rawPts[(i + 1) % rawPts.length]), 0)
    const targetCount = Math.max(
      loop.length,
      Math.min(256, Math.round(perimeter / Math.max(info.medianEdgeLen * 0.6, 1e-6))),
    )

    let smooth = fairLoop(rawPts, fairIters, fairAlpha)
    if (targetCount > smooth.length) {
      smooth = resampleCatmullRom(smooth, targetCount)
      smooth = fairLoop(smooth, 2, 0.3)
    }

    const centroid = loopCentroid(smooth)
    const planeN = loopNormal(smooth)

    for (let li = 0; li < loop.length; li++) {
      const vi = loop[li]
      const k = keyFromAttr(pos, vi, weldQ)
      if (protectedKeys?.has(k)) continue

      let target: THREE.Vector3
      if (smooth.length === loop.length) {
        target = smooth[li]
      } else {
        const orig = rawPts[li]
        let best = smooth[0]
        let bestD = Infinity
        for (const s of smooth) {
          const d = s.distanceToSquared(orig)
          if (d < bestD) { bestD = d; best = s }
        }
        target = best
      }

      const blend = 0.40 + t * 0.50
      const ox = posArr[vi * 3]
      const oy = posArr[vi * 3 + 1]
      const oz = posArr[vi * 3 + 2]
      posArr[vi * 3]     = ox + (target.x - ox) * blend
      posArr[vi * 3 + 1] = oy + (target.y - oy) * blend
      posArr[vi * 3 + 2] = oz + (target.z - oz) * blend

      const others = keyToIndices.get(k)
      if (others) {
        for (const oj of others) {
          if (oj === vi) continue
          posArr[oj * 3]     = posArr[vi * 3]
          posArr[oj * 3 + 1] = posArr[vi * 3 + 1]
          posArr[oj * 3 + 2] = posArr[vi * 3 + 2]
        }
      }
    }

    const strip = buildFilletStrip(
      smooth, surfaceNormals, planeN, centroid,
      safeRadius, filletRings, weldQ, protectedKeys,
    )

    if (strip.positions.length > 0 && strip.indices.length > 0) {
      const vCount = strip.positions.length / 3
      for (let i = 0; i < strip.positions.length; i++) filletPositions.push(strip.positions[i])
      for (const ix of strip.indices) filletIndices.push(ix + filletVertBase)
      filletVertBase += vCount
    }
  }

  const basePosCount = pos.count
  const baseIndices: number[] = []
  if (idx) {
    for (let i = 0; i < idx.count; i++) baseIndices.push(idx.getX(i))
  } else {
    for (let i = 0; i < pos.count; i++) baseIndices.push(i)
  }

  const filletVertCount = filletPositions.length / 3
  const totalVerts = basePosCount + filletVertCount
  const finalPos = new Float32Array(totalVerts * 3)
  finalPos.set(posArr, 0)
  if (filletVertCount > 0) finalPos.set(new Float32Array(filletPositions), basePosCount * 3)

  const finalIndices: number[] = [...baseIndices]
  for (const ix of filletIndices) finalIndices.push(ix + basePosCount)

  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.Float32BufferAttribute(finalPos, 3))
  out.setIndex(finalIndices)

  const band = new Set<number>()
  for (const vi of info.boundaryVerts) band.add(vi)
  for (let i = basePosCount; i < totalVerts; i++) band.add(i)

  const bandKeys = new Set<string>()
  for (const vi of band) {
    if (vi < totalVerts) {
      bandKeys.add(keyOf(finalPos[vi * 3], finalPos[vi * 3 + 1], finalPos[vi * 3 + 2], weldQ))
    }
  }
  const faceCount = finalIndices.length / 3
  for (let f = 0; f < faceCount; f++) {
    const i0 = finalIndices[f * 3], i1 = finalIndices[f * 3 + 1], i2 = finalIndices[f * 3 + 2]
    const k0 = keyOf(finalPos[i0 * 3], finalPos[i0 * 3 + 1], finalPos[i0 * 3 + 2], weldQ)
    const k1 = keyOf(finalPos[i1 * 3], finalPos[i1 * 3 + 1], finalPos[i1 * 3 + 2], weldQ)
    const k2 = keyOf(finalPos[i2 * 3], finalPos[i2 * 3 + 1], finalPos[i2 * 3 + 2], weldQ)
    if (bandKeys.has(k0) || bandKeys.has(k1) || bandKeys.has(k2)) {
      band.add(i0); band.add(i1); band.add(i2)
    }
  }

  const relaxIters = Math.round(2 + t * 4)
  relaxBand(out, band, protectedKeys, weldQ, relaxIters)

  try { computeSmoothNormalsByPosition(out) } catch { out.computeVertexNormals() }
  out.computeBoundingBox()
  out.computeBoundingSphere()

  const deg = countDegenerateFaces(out)
  if (deg > 0) issues.push(`${deg} face(s) degenerada(s)`)
  if (info.loops.length === 0) issues.push('nenhum loop de contorno detectado')
=======
  const boundaryKeys = new Set<string>()
  for (const vi of boundaryVerts) boundaryKeys.add(keyFromAttr(pos, vi, weldQ))
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a

  const filletPositions: number[] = []
  const filletIndices: number[] = []
  let filletVertBase = 0

  for (const loop of info.loops) {
    if (loop.length < 3) continue

    const rawPts = loopToPoints(geo, loop)
    const perimeter = rawPts.reduce((s, p, i) => s + p.distanceTo(rawPts[(i + 1) % rawPts.length]), 0)
    const targetCount = Math.max(
      loop.length,
      Math.min(256, Math.round(perimeter / Math.max(info.medianEdgeLen * 0.6, 1e-6))),
    )

    let smooth = fairLoop(rawPts, fairIters, fairAlpha)
    if (targetCount > smooth.length) {
      smooth = resampleCatmullRom(smooth, targetCount)
      smooth = fairLoop(smooth, 2, 0.3)
    }

    const centroid = loopCentroid(smooth)
    const planeN = loopNormal(smooth)

    for (let li = 0; li < loop.length; li++) {
      const vi = loop[li]
      const k = keyFromAttr(pos, vi, weldQ)
      if (protectedKeys?.has(k)) continue

      let target: THREE.Vector3
      if (smooth.length === loop.length) {
        target = smooth[li]
      } else {
        const orig = rawPts[li]
        let best = smooth[0]
        let bestD = Infinity
        for (const s of smooth) {
          const d = s.distanceToSquared(orig)
          if (d < bestD) { bestD = d; best = s }
        }
        target = best
      }

      const blend = 0.40 + t * 0.50
      const ox = posArr[vi * 3]
      const oy = posArr[vi * 3 + 1]
      const oz = posArr[vi * 3 + 2]
      posArr[vi * 3]     = ox + (target.x - ox) * blend
      posArr[vi * 3 + 1] = oy + (target.y - oy) * blend
      posArr[vi * 3 + 2] = oz + (target.z - oz) * blend

      const others = keyToIndices.get(k)
      if (others) {
        for (const oj of others) {
          if (oj === vi) continue
          posArr[oj * 3]     = posArr[vi * 3]
          posArr[oj * 3 + 1] = posArr[vi * 3 + 1]
          posArr[oj * 3 + 2] = posArr[vi * 3 + 2]
        }
      }
    }

    const strip = buildFilletStrip(
      smooth, surfaceNormals, planeN, centroid,
      safeRadius, filletRings, weldQ, protectedKeys,
    )

    if (strip.positions.length > 0 && strip.indices.length > 0) {
      const vCount = strip.positions.length / 3
      for (let i = 0; i < strip.positions.length; i++) filletPositions.push(strip.positions[i])
      for (const ix of strip.indices) filletIndices.push(ix + filletVertBase)
      filletVertBase += vCount
    }
  }

  const basePosCount = pos.count
  const baseIndices: number[] = []
  if (idx) {
    for (let i = 0; i < idx.count; i++) baseIndices.push(idx.getX(i))
  } else {
    for (let i = 0; i < pos.count; i++) baseIndices.push(i)
  }

  const filletVertCount = filletPositions.length / 3
  const totalVerts = basePosCount + filletVertCount
  const finalPos = new Float32Array(totalVerts * 3)
  finalPos.set(posArr, 0)
  if (filletVertCount > 0) finalPos.set(new Float32Array(filletPositions), basePosCount * 3)

  const finalIndices: number[] = [...baseIndices]
  for (const ix of filletIndices) finalIndices.push(ix + basePosCount)

  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.Float32BufferAttribute(finalPos, 3))
  out.setIndex(finalIndices)

  const band = new Set<number>()
  for (const vi of info.boundaryVerts) band.add(vi)
  for (let i = basePosCount; i < totalVerts; i++) band.add(i)

  const bandKeys = new Set<string>()
  for (const vi of band) {
    if (vi < totalVerts) {
      bandKeys.add(keyOf(finalPos[vi * 3], finalPos[vi * 3 + 1], finalPos[vi * 3 + 2], weldQ))
    }
  }
  const faceCount = finalIndices.length / 3
  for (let f = 0; f < faceCount; f++) {
    const i0 = finalIndices[f * 3], i1 = finalIndices[f * 3 + 1], i2 = finalIndices[f * 3 + 2]
    const k0 = keyOf(finalPos[i0 * 3], finalPos[i0 * 3 + 1], finalPos[i0 * 3 + 2], weldQ)
    const k1 = keyOf(finalPos[i1 * 3], finalPos[i1 * 3 + 1], finalPos[i1 * 3 + 2], weldQ)
    const k2 = keyOf(finalPos[i2 * 3], finalPos[i2 * 3 + 1], finalPos[i2 * 3 + 2], weldQ)
    if (bandKeys.has(k0) || bandKeys.has(k1) || bandKeys.has(k2)) {
      band.add(i0); band.add(i1); band.add(i2)
    }
  }

  const relaxIters = Math.round(2 + t * 4)
  relaxBand(out, band, protectedKeys, weldQ, relaxIters)

  try { computeSmoothNormalsByPosition(out) } catch { out.computeVertexNormals() }
  out.computeBoundingBox()
  out.computeBoundingSphere()

<<<<<<< HEAD
  const deg = countDegenerateFaces(out)
  if (deg > 0) issues.push(`${deg} face(s) degenerada(s)`)
  if (info.loops.length === 0) issues.push('nenhum loop de contorno detectado')
=======
  // ── Validação leve ───────────────────────────────────────────────────────
  const degenerate = countDegenerateFaces(out)
  if (degenerate > 0) {
    issues.push(`${degenerate} face(s) degenerada(s) após refinamento`)
  }

  if (moved === 0) {
    issues.push('nenhum vértice de borda deslocado (protegidos ou sem normal)')
  }
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a

  return { geometry: out, issues }
}

<<<<<<< HEAD
function relaxBand(
=======
<<<<<<< HEAD
function relaxBand(
=======
/**
 * Taubin λ/μ restrito aos vértices da banda de borda.
 * Não toca o restante da malha nem vértices protegidos.
 */
function relaxBoundaryBand(
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
  geo: THREE.BufferGeometry,
  band: Set<number>,
  protectedKeys: Set<string> | undefined,
  weldQ: number,
  iterations: number,
): void {
  if (iterations <= 0 || band.size === 0) return

  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const idx = geo.index
<<<<<<< HEAD
  if (!idx) return
  const faceCount = idx.count / 3

=======
<<<<<<< HEAD
  if (!idx) return
  const faceCount = idx.count / 3

=======
  const faceCount = idx ? idx.count / 3 : pos.count / 3

  // Solda por chave para operar em UIDs
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
  const keyToUID = new Map<string, number>()
  const uidOf = (i: number): number => {
    const k = keyFromAttr(pos, i, weldQ)
    let id = keyToUID.get(k)
<<<<<<< HEAD
    if (id === undefined) { id = keyToUID.size; keyToUID.set(k, id) }
=======
<<<<<<< HEAD
    if (id === undefined) { id = keyToUID.size; keyToUID.set(k, id) }
=======
    if (id === undefined) {
      id = keyToUID.size
      keyToUID.set(k, id)
    }
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
    return id
  }

  const vertUID = new Int32Array(pos.count)
  for (let i = 0; i < pos.count; i++) vertUID[i] = uidOf(i)
  const uidCount = keyToUID.size

  const uidPos = new Float32Array(uidCount * 3)
  const uidCnt = new Float32Array(uidCount)
<<<<<<< HEAD
  const isBand = new Uint8Array(uidCount)
  const isProt = new Uint8Array(uidCount)
=======
<<<<<<< HEAD
  const isBand = new Uint8Array(uidCount)
  const isProt = new Uint8Array(uidCount)
=======
  const isBandUID = new Uint8Array(uidCount)
  const isProtectedUID = new Uint8Array(uidCount)
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a

  for (let i = 0; i < pos.count; i++) {
    const u = vertUID[i]
    uidPos[u * 3] += pos.getX(i)
    uidPos[u * 3 + 1] += pos.getY(i)
    uidPos[u * 3 + 2] += pos.getZ(i)
    uidCnt[u]++
<<<<<<< HEAD
    if (band.has(i)) isBand[u] = 1
    if (protectedKeys?.has(keyFromAttr(pos, i, weldQ))) isProt[u] = 1
=======
<<<<<<< HEAD
    if (band.has(i)) isBand[u] = 1
    if (protectedKeys?.has(keyFromAttr(pos, i, weldQ))) isProt[u] = 1
=======
    if (band.has(i)) isBandUID[u] = 1
    const k = keyFromAttr(pos, i, weldQ)
    if (protectedKeys?.has(k)) isProtectedUID[u] = 1
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
  }
  for (let u = 0; u < uidCount; u++) {
    if (uidCnt[u] > 0) {
      uidPos[u * 3] /= uidCnt[u]
      uidPos[u * 3 + 1] /= uidCnt[u]
      uidPos[u * 3 + 2] /= uidCnt[u]
    }
  }

<<<<<<< HEAD
  const neighbors: Set<number>[] = Array.from({ length: uidCount }, () => new Set())
  for (let f = 0; f < faceCount; f++) {
    const u0 = vertUID[idx.getX(f * 3)]
    const u1 = vertUID[idx.getX(f * 3 + 1)]
    const u2 = vertUID[idx.getX(f * 3 + 2)]
=======
<<<<<<< HEAD
  const neighbors: Set<number>[] = Array.from({ length: uidCount }, () => new Set())
  for (let f = 0; f < faceCount; f++) {
    const u0 = vertUID[idx.getX(f * 3)]
    const u1 = vertUID[idx.getX(f * 3 + 1)]
    const u2 = vertUID[idx.getX(f * 3 + 2)]
=======
  // Vizinhos por face
  const neighbors: Set<number>[] = Array.from({ length: uidCount }, () => new Set())
  for (let f = 0; f < faceCount; f++) {
    const i0 = idx ? idx.getX(f * 3) : f * 3
    const i1 = idx ? idx.getX(f * 3 + 1) : f * 3 + 1
    const i2 = idx ? idx.getX(f * 3 + 2) : f * 3 + 2
    const u0 = vertUID[i0], u1 = vertUID[i1], u2 = vertUID[i2]
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
    neighbors[u0].add(u1); neighbors[u0].add(u2)
    neighbors[u1].add(u0); neighbors[u1].add(u2)
    neighbors[u2].add(u0); neighbors[u2].add(u1)
  }

<<<<<<< HEAD
  const LAMBDA = 0.45
  const MU = -0.48
=======
<<<<<<< HEAD
  const LAMBDA = 0.45
  const MU = -0.48
=======
  const LAMBDA = 0.48
  const MU = -0.51
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
  const buf = new Float32Array(uidCount * 3)

  for (let iter = 0; iter < iterations * 2; iter++) {
    const factor = iter % 2 === 0 ? LAMBDA : MU
    buf.set(uidPos)
    for (let u = 0; u < uidCount; u++) {
<<<<<<< HEAD
      if (!isBand[u] || isProt[u]) continue
=======
<<<<<<< HEAD
      if (!isBand[u] || isProt[u]) continue
      const nb = neighbors[u]
      if (nb.size === 0) continue
      let sx = 0, sy = 0, sz = 0
      for (const v of nb) {
        sx += uidPos[v * 3]; sy += uidPos[v * 3 + 1]; sz += uidPos[v * 3 + 2]
      }
      const inv = 1 / nb.size
      buf[u * 3]     = uidPos[u * 3]     + factor * (sx * inv - uidPos[u * 3])
      buf[u * 3 + 1] = uidPos[u * 3 + 1] + factor * (sy * inv - uidPos[u * 3 + 1])
      buf[u * 3 + 2] = uidPos[u * 3 + 2] + factor * (sz * inv - uidPos[u * 3 + 2])
=======
      if (!isBandUID[u] || isProtectedUID[u]) continue
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
      const nb = neighbors[u]
      if (nb.size === 0) continue
      let sx = 0, sy = 0, sz = 0
      for (const v of nb) {
        sx += uidPos[v * 3]; sy += uidPos[v * 3 + 1]; sz += uidPos[v * 3 + 2]
      }
<<<<<<< HEAD
      const inv = 1 / nb.size
      buf[u * 3]     = uidPos[u * 3]     + factor * (sx * inv - uidPos[u * 3])
      buf[u * 3 + 1] = uidPos[u * 3 + 1] + factor * (sy * inv - uidPos[u * 3 + 1])
      buf[u * 3 + 2] = uidPos[u * 3 + 2] + factor * (sz * inv - uidPos[u * 3 + 2])
=======
      buf[u * 3] = uidPos[u * 3] + factor * (sx / n - uidPos[u * 3])
      buf[u * 3 + 1] = uidPos[u * 3 + 1] + factor * (sy / n - uidPos[u * 3 + 1])
      buf[u * 3 + 2] = uidPos[u * 3 + 2] + factor * (sz / n - uidPos[u * 3 + 2])
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
    }
    uidPos.set(buf)
  }

<<<<<<< HEAD
  const arr = pos.array as Float32Array
  for (let i = 0; i < pos.count; i++) {
    const u = vertUID[i]
    if (!isBand[u] || isProt[u]) continue
=======
<<<<<<< HEAD
  const arr = pos.array as Float32Array
  for (let i = 0; i < pos.count; i++) {
    const u = vertUID[i]
    if (!isBand[u] || isProt[u]) continue
=======
  // Escreve de volta
  const arr = pos.array as Float32Array
  for (let i = 0; i < pos.count; i++) {
    const u = vertUID[i]
    if (!isBandUID[u] || isProtectedUID[u]) continue
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
    arr[i * 3] = uidPos[u * 3]
    arr[i * 3 + 1] = uidPos[u * 3 + 1]
    arr[i * 3 + 2] = uidPos[u * 3 + 2]
  }
  pos.needsUpdate = true
}

function countDegenerateFaces(geo: THREE.BufferGeometry): number {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const idx = geo.index
<<<<<<< HEAD
  if (!idx) return 0
  const faceCount = idx.count / 3
  const ab = new THREE.Vector3(), ac = new THREE.Vector3(), cross = new THREE.Vector3()
  let bad = 0
  for (let f = 0; f < faceCount; f++) {
    const i0 = idx.getX(f * 3), i1 = idx.getX(f * 3 + 1), i2 = idx.getX(f * 3 + 2)
=======
<<<<<<< HEAD
  if (!idx) return 0
  const faceCount = idx.count / 3
  const ab = new THREE.Vector3(), ac = new THREE.Vector3(), cross = new THREE.Vector3()
  let bad = 0
  for (let f = 0; f < faceCount; f++) {
    const i0 = idx.getX(f * 3), i1 = idx.getX(f * 3 + 1), i2 = idx.getX(f * 3 + 2)
=======
  const faceCount = idx ? idx.count / 3 : pos.count / 3
  const ab = new THREE.Vector3(), ac = new THREE.Vector3(), cross = new THREE.Vector3()
  let bad = 0
  for (let f = 0; f < faceCount; f++) {
    const i0 = idx ? idx.getX(f * 3) : f * 3
    const i1 = idx ? idx.getX(f * 3 + 1) : f * 3 + 1
    const i2 = idx ? idx.getX(f * 3 + 2) : f * 3 + 2
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
    ab.set(pos.getX(i1) - pos.getX(i0), pos.getY(i1) - pos.getY(i0), pos.getZ(i1) - pos.getZ(i0))
    ac.set(pos.getX(i2) - pos.getX(i0), pos.getY(i2) - pos.getY(i0), pos.getZ(i2) - pos.getZ(i0))
    cross.crossVectors(ab, ac)
    if (cross.lengthSq() < 1e-12) bad++
  }
  return bad
}

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
function weldToIndexed(geo: THREE.BufferGeometry, weldQ: number): THREE.BufferGeometry {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const keyToId = new Map<string, number>()
  const newPos: number[] = []
  const indices: number[] = []

  for (let i = 0; i < pos.count; i++) {
    const k = keyFromAttr(pos, i, weldQ)
    let id = keyToId.get(k)
    if (id === undefined) {
      id = newPos.length / 3
      keyToId.set(k, id)
      newPos.push(pos.getX(i), pos.getY(i), pos.getZ(i))
    }
    indices.push(id)
  }

  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(newPos), 3))
  out.setIndex(indices)
  return out
}

<<<<<<< HEAD
// ─── API pública ──────────────────────────────────────────────────────────────

=======
// ─── API pública ──────────────────────────────────────────────────────────────

=======
// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * ETAPA 4 — REFINAÇÃO DE CORTE
 *
 * Recebe a geometria já produzida pelas etapas 1–3 e aplica acabamento
 * exclusivamente nas regiões do corte (boundary + 1-anel).
 *
 * Se intensity === 0, devolve a geometria original sem alterações
 * (compatibilidade total com o comportamento atual).
 */
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
export function refineCut(
  geometry: THREE.BufferGeometry,
  meta: CutResultMeta = {},
  options: Partial<CutRefinementOptions> = {},
): RefineResult {
  const opts: CutRefinementOptions = { ...DEFAULT_REFINEMENT, ...options }
  const weldQ = opts.weldQ ?? Q_DEFAULT
  const intensity = Math.max(0, Math.min(100, opts.intensity ?? 0))
<<<<<<< HEAD
  const filletRings = Math.max(1, Math.min(2, opts.filletRings ?? 2))
=======
<<<<<<< HEAD
  const filletRings = Math.max(1, Math.min(2, opts.filletRings ?? 2))

  if (intensity <= 0) {
    return { geometry, applied: false, safeRadius: 0, boundaryVertexCount: 0, issues: [] }
  }

  let work = geometry
  if (!work.index) work = weldToIndexed(work, weldQ)

  const info = detectBoundary(work, weldQ)

  if (meta.seamPoints && meta.seamPoints.length >= 6) {
    const pos = work.getAttribute('position') as THREE.BufferAttribute
=======
  const segments = Math.max(2, Math.min(8, opts.segments ?? 3))
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a

  if (intensity <= 0) {
    return { geometry, applied: false, safeRadius: 0, boundaryVertexCount: 0, issues: [] }
  }

  let work = geometry
  if (!work.index) work = weldToIndexed(work, weldQ)

  const info = detectBoundary(work, weldQ)

  if (meta.seamPoints && meta.seamPoints.length >= 6) {
<<<<<<< HEAD
    const pos = work.getAttribute('position') as THREE.BufferAttribute
=======
    const pos = geometry.getAttribute('position') as THREE.BufferAttribute
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
    const seamKeys = new Set<string>()
    for (let i = 0; i + 2 < meta.seamPoints.length; i += 3) {
      seamKeys.add(keyOf(meta.seamPoints[i], meta.seamPoints[i + 1], meta.seamPoints[i + 2], weldQ))
    }
<<<<<<< HEAD
    for (let i = 0; i < pos.count; i++) {
      if (seamKeys.has(keyFromAttr(pos, i, weldQ))) info.boundaryVerts.add(i)
=======
<<<<<<< HEAD
    for (let i = 0; i < pos.count; i++) {
      if (seamKeys.has(keyFromAttr(pos, i, weldQ))) info.boundaryVerts.add(i)
=======
    // Marca vértices próximos à costura como boundary (tolerância 1 quanta)
    for (let i = 0; i < pos.count; i++) {
      const k = keyFromAttr(pos, i, weldQ)
      if (seamKeys.has(k)) info.boundaryVerts.add(i)
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
    }
  }

  const safeRadius = computeSafeRadius(info, intensity, opts.requestedRadius)

<<<<<<< HEAD
  if (info.boundaryVerts.size === 0 || (info.loops.length === 0 && info.edges.length === 0)) {
=======
<<<<<<< HEAD
  if (info.boundaryVerts.size === 0 || (info.loops.length === 0 && info.edges.length === 0)) {
    return {
      geometry: work, applied: false, safeRadius, boundaryVertexCount: 0,
      issues: ['Nenhuma borda de corte detectada'],
    }
  }

  if (info.loops.length === 0 && info.edges.length > 0) {
    info.loops.push([...info.boundaryVerts].slice(0, Math.min(info.boundaryVerts.size, 64)))
  }

  const { geometry: refined, issues } = applyPremiumRefinement(
    work, info, safeRadius, intensity, weldQ, opts.protectedVertexKeys, filletRings,
  )

  return {
    geometry: refined, applied: true, safeRadius,
    boundaryVertexCount: info.boundaryVerts.size, issues,
  }
}

=======
  if (info.boundaryVerts.size === 0 || safeRadius <= 1e-12) {
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
    return {
      geometry: work, applied: false, safeRadius, boundaryVertexCount: 0,
      issues: ['Nenhuma borda de corte detectada'],
    }
  }

  if (info.loops.length === 0 && info.edges.length > 0) {
    info.loops.push([...info.boundaryVerts].slice(0, Math.min(info.boundaryVerts.size, 64)))
  }

  const { geometry: refined, issues } = applyPremiumRefinement(
    work, info, safeRadius, intensity, weldQ, opts.protectedVertexKeys, filletRings,
  )

  return {
    geometry: refined, applied: true, safeRadius,
    boundaryVertexCount: info.boundaryVerts.size, issues,
  }
}

<<<<<<< HEAD
=======
/**
 * Aplica refinamento em um par de peças (selecionada + corpo) de forma
 * simétrica, preservando metadados de costura.
 */
>>>>>>> dac8c4e552b506c127fc93d52c269da72dffa681
>>>>>>> 742d4b244f3cd2cb134df30923ba6176fd21188a
export function refineCutPair(
  selected: THREE.BufferGeometry,
  body: THREE.BufferGeometry,
  meta: CutResultMeta = {},
  options: Partial<CutRefinementOptions> = {},
): {
  selected: THREE.BufferGeometry
  body: THREE.BufferGeometry
  selectedResult: RefineResult
  bodyResult: RefineResult
} {
  const selectedResult = refineCut(selected, meta, options)
  const bodyResult = refineCut(body, meta, options)
  return {
    selected: selectedResult.geometry,
    body: bodyResult.geometry,
    selectedResult,
    bodyResult,
  }
}
