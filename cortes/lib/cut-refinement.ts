/**
 * Cut Refinement — 4ª etapa do pipeline AutoCut
 * ─────────────────────────────────────────────
 *
 * Responsabilidade isolada: ACABAMENTO GEOMÉTRICO das regiões produzidas
 * pelo corte. Não recalcula o corte, não gera tampas, não decide onde cortar.
 *
 * Pipeline:
 *   calculateCut → generateCaps → applyCut → refineCut → resultado final
 *
 * Princípios:
 *   CORTE   = forma
 *   TAMPA   = fechamento
 *   REFINAÇÃO = acabamento (micro-fillet sutil + continuidade de borda)
 *
 * Quando intensity = 0 / disabled → retorna a geometria intacta (compatibilidade).
 */

import * as THREE from 'three'
import { computeSmoothNormalsByPosition } from './smart-cut'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CutRefinementOptions {
  /**
   * Intensidade 0..100.
   * 0   = desabilitado (resultado idêntico ao AutoCut atual)
   * 1–30 = micro-acabamento (padrão recomendado)
   * 31–70 = acabamento perceptível
   * 71–100 = mais arredondado, sempre limitado pelo safeRadius
   */
  intensity: number
  /**
   * Segmentos de aproximação do micro-fillet por aresta (2–8).
   * Valores altos geram mais polígonos; o padrão 3 equilibra qualidade/perf.
   */
  segments?: number
  /**
   * Raio solicitado em unidades do modelo (opcional).
   * Se omitido, é derivado automaticamente da escala local + intensity.
   */
  requestedRadius?: number
  /**
   * Vértices / faces marcados como região funcional (encaixe, slot, furo…).
   * O refinamento os respeita e não desloca.
   */
  protectedVertexKeys?: Set<string>
  /**
   * Quantização de soldagem (mesmo valor do pipeline).
   */
  weldQ?: number
}

export const DEFAULT_REFINEMENT: CutRefinementOptions = {
  intensity: 18,
  segments: 3,
  weldQ: 1e4,
}

/** Metadados do corte preservados pelas etapas anteriores. */
export interface CutResultMeta {
  /** Pontos do isocontorno / costura (pares ax,ay,az,bx,by,bz,...). */
  seamPoints?: Float32Array | null
  /** Score de qualidade da costura (menor = melhor). */
  seamScore?: number
  /** Nº aproximado de segmentos da costura. */
  seamSegments?: number
}

export interface RefineResult {
  geometry: THREE.BufferGeometry
  applied: boolean
  safeRadius: number
  boundaryVertexCount: number
  issues: string[]
}

// ─── Helpers de quantização / chave ───────────────────────────────────────────

const Q_DEFAULT = 1e4

function keyOf(x: number, y: number, z: number, Q: number): string {
  return `${Math.round(x * Q)},${Math.round(y * Q)},${Math.round(z * Q)}`
}

function keyFromAttr(pos: THREE.BufferAttribute, i: number, Q: number): string {
  return keyOf(pos.getX(i), pos.getY(i), pos.getZ(i), Q)
}

// ─── Detecção de boundary loops ───────────────────────────────────────────────

interface BoundaryEdge {
  a: number // vertex index
  b: number
  keyA: string
  keyB: string
}

interface BoundaryInfo {
  /** Índices de vértices que pertencem a pelo menos uma aresta de borda. */
  boundaryVerts: Set<number>
  /** Arestas de borda (aparecem em exatamente 1 face). */
  edges: BoundaryEdge[]
  /** Loops ordenados (listas de índices de vértice, fechados quando possível). */
  loops: number[][]
  /** Comprimento médio das arestas de borda (feature size local). */
  meanEdgeLen: number
  /** Comprimento mínimo das arestas de borda. */
  minEdgeLen: number
}

/**
 * Detecta arestas de contorno (boundary) de uma BufferGeometry.
 * Funciona tanto em malhas indexadas quanto non-indexed (pos.length/3 faces).
 */
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
  let sumLen = 0
  let minLen = Infinity
  const tmpA = new THREE.Vector3()
  const tmpB = new THREE.Vector3()

  for (const [k, cnt] of edgeCount) {
    if (cnt !== 1) continue
    const [a, b] = edgeVerts.get(k)!
    boundaryVerts.add(a)
    boundaryVerts.add(b)
    const keyA = keyFromAttr(pos, a, weldQ)
    const keyB = keyFromAttr(pos, b, weldQ)
    edges.push({ a, b, keyA, keyB })
    tmpA.set(pos.getX(a), pos.getY(a), pos.getZ(a))
    tmpB.set(pos.getX(b), pos.getY(b), pos.getZ(b))
    const len = tmpA.distanceTo(tmpB)
    sumLen += len
    if (len > 1e-12) minLen = Math.min(minLen, len)
  }

  const meanEdgeLen = edges.length > 0 ? sumLen / edges.length : 0
  if (!isFinite(minLen)) minLen = meanEdgeLen || 0.01

  // Monta loops contínuos a partir das arestas de borda
  const loops = buildLoops(edges, pos, weldQ)

  return { boundaryVerts, edges, loops, meanEdgeLen, minEdgeLen: minLen }
}

/**
 * Constrói loops ordenados a partir de arestas de borda.
 * Não exige malha half-edge completa — usa mapa de adjacência por chave.
 */
function buildLoops(
  edges: BoundaryEdge[],
  pos: THREE.BufferAttribute,
  weldQ: number,
): number[][] {
  if (edges.length === 0) return []

  // Adjacência: key → lista de (outroKey, vertexIndexDoOutro, vertexIndexDeste)
  const adj = new Map<string, { otherKey: string; otherIdx: number; selfIdx: number }[]>()
  const add = (from: string, to: string, otherIdx: number, selfIdx: number) => {
    let list = adj.get(from)
    if (!list) { list = []; adj.set(from, list) }
    list.push({ otherKey: to, otherIdx, selfIdx })
  }

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
    const maxGuard = edges.length * 2 + 4

    while (guard++ < maxGuard) {
      if (visited.has(cur) && loop.length > 0) break
      visited.add(cur)

      const neighbors = adj.get(cur) ?? []
      // Escolhe o próximo que não seja o anterior
      let next: { otherKey: string; otherIdx: number; selfIdx: number } | null = null
      for (const n of neighbors) {
        if (n.otherKey !== prev) {
          next = n
          break
        }
      }
      if (!next && neighbors.length > 0) next = neighbors[0]
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

/**
 * Amplia o conjunto de vértices de borda com o 1-anel (vértices adjacentes
 * por face). Isso permite suavizar uma faixa estreita ao redor do corte.
 */
function expandBoundaryBand(
  geo: THREE.BufferGeometry,
  boundaryVerts: Set<number>,
  weldQ: number,
): Set<number> {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const idx = geo.index
  const faceCount = idx ? idx.count / 3 : pos.count / 3
  const band = new Set(boundaryVerts)

  // Mapa key → índices de vértice (para lidar com non-indexed)
  const keyToIndices = new Map<string, number[]>()
  for (let i = 0; i < pos.count; i++) {
    const k = keyFromAttr(pos, i, weldQ)
    let arr = keyToIndices.get(k)
    if (!arr) { arr = []; keyToIndices.set(k, arr) }
    arr.push(i)
  }

  const boundaryKeys = new Set<string>()
  for (const vi of boundaryVerts) boundaryKeys.add(keyFromAttr(pos, vi, weldQ))

  for (let f = 0; f < faceCount; f++) {
    const i0 = idx ? idx.getX(f * 3) : f * 3
    const i1 = idx ? idx.getX(f * 3 + 1) : f * 3 + 1
    const i2 = idx ? idx.getX(f * 3 + 2) : f * 3 + 2
    const keys = [
      keyFromAttr(pos, i0, weldQ),
      keyFromAttr(pos, i1, weldQ),
      keyFromAttr(pos, i2, weldQ),
    ]
    const touches = keys.some((k) => boundaryKeys.has(k))
    if (!touches) continue
    for (const vi of [i0, i1, i2]) band.add(vi)
  }

  return band
}

// ─── Safe radius ──────────────────────────────────────────────────────────────

/**
 * Calcula um raio geometricamente seguro a partir da escala local da borda
 * e da intensity. Nunca excede uma fração conservadora do feature size.
 */
function computeSafeRadius(
  info: BoundaryInfo,
  intensity: number,
  requestedRadius?: number,
): number {
  const t = Math.max(0, Math.min(100, intensity)) / 100

  // Feature size conservador: 8–15 % do comprimento médio de aresta de borda
  // e no máximo 40 % do comprimento mínimo (evita colapsar detalhes).
  const fromMean = info.meanEdgeLen * (0.04 + t * 0.10)
  const fromMin = info.minEdgeLen * 0.35
  let safe = Math.min(fromMean, fromMin)

  if (requestedRadius != null && requestedRadius > 0) {
    safe = Math.min(safe, requestedRadius)
  }

  // Escala final pela intensity (0 → 0, 1 → safe)
  // Curva suave: mais conservador nas intensidades baixas
  const scale = t * t * (3 - 2 * t) // smoothstep
  return Math.max(0, safe * scale)
}

// ─── Refinamento geométrico ───────────────────────────────────────────────────

/**
 * Aplica micro-acabamento exclusivamente na faixa de borda do corte.
 *
 * Estratégia (sutil e segura):
 *  1. Identifica boundary + 1-anel.
 *  2. Calcula normal média por vértice de borda (a partir das faces).
 *  3. Desloca os vértices de borda ao longo da normal por uma fração do
 *     safeRadius (efeito de micro-fillet / soft chamfer).
 *  4. Roda 1–2 iterações de Taubin restrito à banda (remove micro-picos).
 *  5. Recalcula normais e valida.
 *
 * Não altera a posição do corte de forma perceptível; não cria bevel óbvio.
 */
function applyMicroRefinement(
  geo: THREE.BufferGeometry,
  info: BoundaryInfo,
  safeRadius: number,
  intensity: number,
  weldQ: number,
  protectedKeys: Set<string> | undefined,
  segments: number,
): { geometry: THREE.BufferGeometry; issues: string[] } {
  const issues: string[] = []
  if (safeRadius <= 1e-12 || info.boundaryVerts.size === 0) {
    return { geometry: geo, issues: ['safeRadius zero ou sem boundary — refinamento ignorado'] }
  }

  // Trabalha em cópia para não mutar a entrada
  const out = geo.clone()
  const pos = out.getAttribute('position') as THREE.BufferAttribute
  const idx = out.index
  const faceCount = idx ? idx.count / 3 : pos.count / 3

  const band = expandBoundaryBand(out, info.boundaryVerts, weldQ)

  // ── Normais por face e acumulação por vértice ────────────────────────────
  const vertNormal = new Map<number, THREE.Vector3>()
  const ab = new THREE.Vector3(), ac = new THREE.Vector3(), fn = new THREE.Vector3()

  for (let f = 0; f < faceCount; f++) {
    const i0 = idx ? idx.getX(f * 3) : f * 3
    const i1 = idx ? idx.getX(f * 3 + 1) : f * 3 + 1
    const i2 = idx ? idx.getX(f * 3 + 2) : f * 3 + 2
    if (!band.has(i0) && !band.has(i1) && !band.has(i2)) continue

    ab.set(
      pos.getX(i1) - pos.getX(i0),
      pos.getY(i1) - pos.getY(i0),
      pos.getZ(i1) - pos.getZ(i0),
    )
    ac.set(
      pos.getX(i2) - pos.getX(i0),
      pos.getY(i2) - pos.getY(i0),
      pos.getZ(i2) - pos.getZ(i0),
    )
    fn.crossVectors(ab, ac)
    if (fn.lengthSq() < 1e-20) continue
    fn.normalize()

    for (const vi of [i0, i1, i2]) {
      if (!band.has(vi)) continue
      let n = vertNormal.get(vi)
      if (!n) { n = new THREE.Vector3(); vertNormal.set(vi, n) }
      n.add(fn)
    }
  }

  for (const n of vertNormal.values()) {
    if (n.lengthSq() > 1e-20) n.normalize()
  }

  // ── Deslocamento sutil ao longo da normal ────────────────────────────────
  // Intensidade baixa → deslocamento muito pequeno (micro).
  // Direção: média das normais das faces adjacentes (abre levemente o dihedral).
  const t = Math.max(0, Math.min(100, intensity)) / 100
  // Fração do safeRadius usada no offset (bem conservadora)
  const offsetScale = 0.35 + t * 0.45 // 0.35..0.80
  const displacement = safeRadius * offsetScale

  const posArr = pos.array as Float32Array
  let moved = 0

  for (const vi of info.boundaryVerts) {
    const k = keyFromAttr(pos, vi, weldQ)
    if (protectedKeys?.has(k)) continue

    const n = vertNormal.get(vi)
    if (!n || n.lengthSq() < 1e-20) continue

    // Offset suave — só na componente normal
    posArr[vi * 3] += n.x * displacement
    posArr[vi * 3 + 1] += n.y * displacement
    posArr[vi * 3 + 2] += n.z * displacement
    moved++
  }

  pos.needsUpdate = true

  // ── Taubin restrito à banda (1–2 iterações conforme intensity) ───────────
  const relaxIters = t < 0.25 ? 1 : t < 0.6 ? 2 : 3
  relaxBoundaryBand(out, band, protectedKeys, weldQ, relaxIters)

  // ── Normais + bounding ───────────────────────────────────────────────────
  try {
    computeSmoothNormalsByPosition(out)
  } catch {
    out.computeVertexNormals()
  }
  out.computeBoundingBox()
  out.computeBoundingSphere()

  // ── Validação leve ───────────────────────────────────────────────────────
  const degenerate = countDegenerateFaces(out)
  if (degenerate > 0) {
    issues.push(`${degenerate} face(s) degenerada(s) após refinamento`)
  }

  if (moved === 0) {
    issues.push('nenhum vértice de borda deslocado (protegidos ou sem normal)')
  }

  return { geometry: out, issues }
}

/**
 * Taubin λ/μ restrito aos vértices da banda de borda.
 * Não toca o restante da malha nem vértices protegidos.
 */
function relaxBoundaryBand(
  geo: THREE.BufferGeometry,
  band: Set<number>,
  protectedKeys: Set<string> | undefined,
  weldQ: number,
  iterations: number,
): void {
  if (iterations <= 0 || band.size === 0) return

  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const idx = geo.index
  const faceCount = idx ? idx.count / 3 : pos.count / 3

  // Solda por chave para operar em UIDs
  const keyToUID = new Map<string, number>()
  const uidOf = (i: number): number => {
    const k = keyFromAttr(pos, i, weldQ)
    let id = keyToUID.get(k)
    if (id === undefined) {
      id = keyToUID.size
      keyToUID.set(k, id)
    }
    return id
  }

  const vertUID = new Int32Array(pos.count)
  for (let i = 0; i < pos.count; i++) vertUID[i] = uidOf(i)
  const uidCount = keyToUID.size

  const uidPos = new Float32Array(uidCount * 3)
  const uidCnt = new Float32Array(uidCount)
  const isBandUID = new Uint8Array(uidCount)
  const isProtectedUID = new Uint8Array(uidCount)

  for (let i = 0; i < pos.count; i++) {
    const u = vertUID[i]
    uidPos[u * 3] += pos.getX(i)
    uidPos[u * 3 + 1] += pos.getY(i)
    uidPos[u * 3 + 2] += pos.getZ(i)
    uidCnt[u]++
    if (band.has(i)) isBandUID[u] = 1
    const k = keyFromAttr(pos, i, weldQ)
    if (protectedKeys?.has(k)) isProtectedUID[u] = 1
  }
  for (let u = 0; u < uidCount; u++) {
    if (uidCnt[u] > 0) {
      uidPos[u * 3] /= uidCnt[u]
      uidPos[u * 3 + 1] /= uidCnt[u]
      uidPos[u * 3 + 2] /= uidCnt[u]
    }
  }

  // Vizinhos por face
  const neighbors: Set<number>[] = Array.from({ length: uidCount }, () => new Set())
  for (let f = 0; f < faceCount; f++) {
    const i0 = idx ? idx.getX(f * 3) : f * 3
    const i1 = idx ? idx.getX(f * 3 + 1) : f * 3 + 1
    const i2 = idx ? idx.getX(f * 3 + 2) : f * 3 + 2
    const u0 = vertUID[i0], u1 = vertUID[i1], u2 = vertUID[i2]
    neighbors[u0].add(u1); neighbors[u0].add(u2)
    neighbors[u1].add(u0); neighbors[u1].add(u2)
    neighbors[u2].add(u0); neighbors[u2].add(u1)
  }

  const LAMBDA = 0.48
  const MU = -0.51
  const buf = new Float32Array(uidCount * 3)

  for (let iter = 0; iter < iterations * 2; iter++) {
    const factor = iter % 2 === 0 ? LAMBDA : MU
    buf.set(uidPos)
    for (let u = 0; u < uidCount; u++) {
      if (!isBandUID[u] || isProtectedUID[u]) continue
      const nb = neighbors[u]
      const n = nb.size
      if (n === 0) continue
      let sx = 0, sy = 0, sz = 0
      for (const v of nb) {
        sx += uidPos[v * 3]
        sy += uidPos[v * 3 + 1]
        sz += uidPos[v * 3 + 2]
      }
      buf[u * 3] = uidPos[u * 3] + factor * (sx / n - uidPos[u * 3])
      buf[u * 3 + 1] = uidPos[u * 3 + 1] + factor * (sy / n - uidPos[u * 3 + 1])
      buf[u * 3 + 2] = uidPos[u * 3 + 2] + factor * (sz / n - uidPos[u * 3 + 2])
    }
    uidPos.set(buf)
  }

  // Escreve de volta
  const arr = pos.array as Float32Array
  for (let i = 0; i < pos.count; i++) {
    const u = vertUID[i]
    if (!isBandUID[u] || isProtectedUID[u]) continue
    arr[i * 3] = uidPos[u * 3]
    arr[i * 3 + 1] = uidPos[u * 3 + 1]
    arr[i * 3 + 2] = uidPos[u * 3 + 2]
  }
  pos.needsUpdate = true
}

function countDegenerateFaces(geo: THREE.BufferGeometry): number {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const idx = geo.index
  const faceCount = idx ? idx.count / 3 : pos.count / 3
  const ab = new THREE.Vector3(), ac = new THREE.Vector3(), cross = new THREE.Vector3()
  let bad = 0
  for (let f = 0; f < faceCount; f++) {
    const i0 = idx ? idx.getX(f * 3) : f * 3
    const i1 = idx ? idx.getX(f * 3 + 1) : f * 3 + 1
    const i2 = idx ? idx.getX(f * 3 + 2) : f * 3 + 2
    ab.set(pos.getX(i1) - pos.getX(i0), pos.getY(i1) - pos.getY(i0), pos.getZ(i1) - pos.getZ(i0))
    ac.set(pos.getX(i2) - pos.getX(i0), pos.getY(i2) - pos.getY(i0), pos.getZ(i2) - pos.getZ(i0))
    cross.crossVectors(ab, ac)
    if (cross.lengthSq() < 1e-12) bad++
  }
  return bad
}

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
export function refineCut(
  geometry: THREE.BufferGeometry,
  meta: CutResultMeta = {},
  options: Partial<CutRefinementOptions> = {},
): RefineResult {
  const opts: CutRefinementOptions = { ...DEFAULT_REFINEMENT, ...options }
  const weldQ = opts.weldQ ?? Q_DEFAULT
  const intensity = Math.max(0, Math.min(100, opts.intensity ?? 0))
  const segments = Math.max(2, Math.min(8, opts.segments ?? 3))

  // Intensity 0 → bypass completo (resultado idêntico ao AutoCut atual)
  if (intensity <= 0) {
    return {
      geometry,
      applied: false,
      safeRadius: 0,
      boundaryVertexCount: 0,
      issues: [],
    }
  }

  const info = detectBoundary(geometry, weldQ)

  // Se temos seamPoints, podemos reforçar a detecção (vértices próximos à costura)
  if (meta.seamPoints && meta.seamPoints.length >= 6) {
    const pos = geometry.getAttribute('position') as THREE.BufferAttribute
    const seamKeys = new Set<string>()
    for (let i = 0; i + 2 < meta.seamPoints.length; i += 3) {
      seamKeys.add(keyOf(meta.seamPoints[i], meta.seamPoints[i + 1], meta.seamPoints[i + 2], weldQ))
    }
    // Marca vértices próximos à costura como boundary (tolerância 1 quanta)
    for (let i = 0; i < pos.count; i++) {
      const k = keyFromAttr(pos, i, weldQ)
      if (seamKeys.has(k)) info.boundaryVerts.add(i)
    }
  }

  const safeRadius = computeSafeRadius(info, intensity, opts.requestedRadius)

  if (info.boundaryVerts.size === 0 || safeRadius <= 1e-12) {
    return {
      geometry,
      applied: false,
      safeRadius,
      boundaryVertexCount: 0,
      issues: ['Nenhuma borda de corte detectada ou raio seguro zero'],
    }
  }

  const { geometry: refined, issues } = applyMicroRefinement(
    geometry,
    info,
    safeRadius,
    intensity,
    weldQ,
    opts.protectedVertexKeys,
    segments,
  )

  return {
    geometry: refined,
    applied: true,
    safeRadius,
    boundaryVertexCount: info.boundaryVerts.size,
    issues,
  }
}

/**
 * Aplica refinamento em um par de peças (selecionada + corpo) de forma
 * simétrica, preservando metadados de costura.
 */
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
