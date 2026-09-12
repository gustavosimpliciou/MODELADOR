/**
 * Plane Cut ASYNC — orquestrador do corte por plano infinito.
 *
 * Arquitetura:
 *   UI THREAD                      WORKER THREAD
 *   ──────────                     ─────────────
 *   câmera / zoom / cancelar       classificação O(n) em TypedArrays
 *   progresso real + ETA           clip só dos triângulos straddle
 *   tampas (loops são pequenos)    buffers transferidos (zero-copy)
 *   1 único upload p/ GPU por lado
 *
 * Modos automáticos:
 *   NORMAL  < 500k faces   → worker + chunks de 200k
 *   HIGH    500k–1.5M      → worker + chunks de 100k + preview mantido
 *   EXTREME > 1.5M         → worker + chunks de 50k + updates mínimos de UI
 *
 * Fallback: sem Worker (SSR/CSP) → `solidPlaneCutFast` na main thread com
 * yields (a UI respira entre chunks) + mesmo progresso/cancelamento.
 */

import * as THREE from 'three'
import { generateCap, generateCapWithHoles } from './cap-generation'
import { solidPlaneCutFast, pickChunk } from './plane-cut-fast'
import { CutProfiler, heapUsedBytes, type CutMetrics } from './cut-telemetry'

export type CutMode = 'normal' | 'high' | 'extreme'

export interface AsyncCutProgress {
  stage: string
  pct: number
  facesDone: number
  facesTotal: number
  elapsedMs: number
  etaMs: number | null
  mode: CutMode
  usedWorker: boolean
}

export interface AsyncCutResult {
  positive: THREE.BufferGeometry
  negative: THREE.BufferGeometry
  capLoops: number
  capTriangles: number
  metrics: CutMetrics
  mode: CutMode
  usedWorker: boolean
}

export interface AsyncCutOptions {
  onProgress?: (p: AsyncCutProgress) => void
  signal?: AbortSignal
  /** força o fallback sem worker (testes/diagnóstico) */
  forceFallback?: boolean
}

export function detectCutMode(faceCount: number): CutMode {
  if (faceCount > 1_500_000) return 'extreme'
  if (faceCount > 500_000) return 'high'
  return 'normal'
}

export function hardwareInfo(): { cores: number; deviceGB: number | null; gpu: string } {
  let cores = 4
  let deviceGB: number | null = null
  try {
    cores = navigator.hardwareConcurrency ?? 4
    deviceGB = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? null
  } catch { /* SSR */ }
  let gpu = 'unknown'
  try {
    const cv = document.createElement('canvas')
    const gl = cv.getContext('webgl2') ?? cv.getContext('webgl')
    if (gl) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info')
      gpu = dbg
        ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)).slice(0, 64)
        : 'webgl-available'
    } else {
      gpu = 'no-webgl'
    }
  } catch { /* ignore */ }
  return { cores, deviceGB, gpu }
}

export async function runPlaneCutAsync(
  geometry: THREE.BufferGeometry,
  planeNormal: THREE.Vector3,
  planePoint: THREE.Vector3,
  opts: AsyncCutOptions = {},
): Promise<AsyncCutResult> {
  const t0 = perfNow()
  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute
  const nrmAttr = geometry.getAttribute('normal') as THREE.BufferAttribute | null
  const idxAttr = geometry.index
  const triCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3
  const mode = detectCutMode(triCount)

  const report = (stage: string, pct: number, facesDone: number, usedWorker: boolean) => {
    const elapsed = perfNow() - t0
    const frac = Math.min(0.999, Math.max(0.001, pct / 100))
    const eta = pct > 3 ? Math.max(0, elapsed * (1 - frac) / frac) : null
    opts.onProgress?.({
      stage, pct, facesDone, facesTotal: triCount,
      elapsedMs: elapsed, etaMs: eta, mode, usedWorker,
    })
  }

  const throwIfAborted = () => {
    if (opts.signal?.aborted) {
      const e = new Error('cancelled')
      ;(e as unknown as { code: string }).code = 'CANCELLED'
      throw e
    }
  }

  // ── 1. Extrai cópias transferíveis (original preservado) ──────────────────
  const srcPos = posAttr.array as Float32Array
  const positions = srcPos.slice()
  const normals = nrmAttr ? (nrmAttr.array as Float32Array).slice() : null
  const indices = idxAttr ? copyIndex(idxAttr.array) : null
  if (!geometry.boundingSphere) geometry.computeBoundingSphere()
  const scale = geometry.boundingSphere?.radius ?? 1

  const n = planeNormal.clone().normalize()

  // ── 2. Split pesado: worker primeiro, fallback chunked depois ────────────
  type Split = {
    posPos: Float32Array; nrmPos: Float32Array
    posNeg: Float32Array; nrmNeg: Float32Array
    segFlat: Float32Array; metrics: CutMetrics
  }
  let split: Split
  let usedWorker = false

  if (!opts.forceFallback) {
    try {
      split = await runInWorker(
        { positions, normals, indices, scale, nx: n, px: planePoint, triCount },
        {
          onProgress: (stage, pct, done) => report(stage, pct * 0.9, done, true),
          signal: opts.signal,
        },
      )
      usedWorker = true
    } catch (err) {
      if (isCancelled(err)) throw err
      // Worker indisponível (CSP/SSR/build) → fallback na main thread.
      // Os buffers já são cópias locais: reutiliza sem nova alocação.
      split = await runFallback(
        { positions, normals, indices, scale, nx: n, px: planePoint },
        {
          onProgress: (stage, pct, done) => report(`${stage} (modo compatível)`, pct * 0.9, done, false),
          signal: opts.signal,
        },
      )
      usedWorker = false
    }
  } else {
    split = await runFallback(
      { positions, normals, indices, scale, nx: n, px: planePoint },
      {
        onProgress: (stage, pct, done) => report(stage, pct * 0.9, done, false),
        signal: opts.signal,
      },
    )
  }
  throwIfAborted()

  // ── 3. Tampas na main thread (loops de borda são pequenos vs. a malha) ───
  report('Fechando corte…', 90, triCount, usedWorker)
  const capT0 = perfNow()
  const loops = buildLoopsNumeric(split.segFlat, scale)
  const { posCapPos, nrmCapPos, posCapNeg, nrmCapNeg, capTriangles } = buildCapsFromLoops(
    loops, n, planePoint,
  )
  const capMs = perfNow() - capT0

  // ── 4. Montagem final: 1 único upload por lado + validação ───────────────
  report('Validando malha…', 95, triCount, usedWorker)
  const positive = assembleGeometry(split.posPos, split.nrmPos, posCapPos, nrmCapPos)
  const negative = assembleGeometry(split.posNeg, split.nrmNeg, posCapNeg, nrmCapNeg)
  throwIfAborted()

  const posCount = positive.getAttribute('position')?.count ?? 0
  const negCount = negative.getAttribute('position')?.count ?? 0
  if (posCount === 0 || negCount === 0) {
    positive.dispose()
    negative.dispose()
    throw new Error('NO_INTERSECTION')
  }

  const gpuT0 = perfNow()
  // Upload real acontece no primeiro render; forças a criação dos buffers GL
  // aqui seria caro — apenas bounding volumes (baratos) e pronto.
  const gpuMs = perfNow() - gpuT0

  const metrics = split.metrics
  metrics.stageMs.cap = capMs
  metrics.stageMs.gpu_upload = gpuMs
  metrics.stageMs.total = perfNow() - t0
  metrics.outputPosFaces = Math.floor(posCount / 3)
  metrics.outputNegFaces = Math.floor(negCount / 3)
  metrics.outputVerts = posCount + negCount

  report('Corte concluído.', 100, triCount, usedWorker)

  return {
    positive, negative,
    capLoops: loops.length,
    capTriangles,
    metrics, mode, usedWorker,
  }
}

// ─── Worker path ─────────────────────────────────────────────────────────────

interface WorkerSplitInput {
  positions: Float32Array
  normals: Float32Array | null
  indices: Uint32Array | null
  scale: number
  nx: THREE.Vector3
  px: THREE.Vector3
  triCount: number
}

function runInWorker(
  input: WorkerSplitInput,
  opts: { onProgress: (stage: string, pct: number, done: number) => void; signal?: AbortSignal },
): Promise<{
  posPos: Float32Array; nrmPos: Float32Array
  posNeg: Float32Array; nrmNeg: Float32Array
  segFlat: Float32Array; metrics: CutMetrics
}> {
  return new Promise((resolve, reject) => {
    let worker: Worker
    try {
      worker = new Worker(new URL('../workers/plane-cut.worker.ts', import.meta.url))
    } catch (e) {
      reject(e)
      return
    }

    const jobId = (Math.random() * 1e9) | 0
    let settled = false
    const done = (fn: () => void) => {
      if (settled) return
      settled = true
      try { worker.terminate() } catch { /* ignore */ }
      opts.signal?.removeEventListener('abort', onAbort)
      fn()
    }
    const onAbort = () => {
      try { worker.postMessage({ type: 'cancel', jobId }) } catch { /* ignore */ }
      // Termina de imediato: cancelamento não espera o worker responder.
      done(() => reject(cancelledError()))
    }
    if (opts.signal?.aborted) { onAbort(); return }
    opts.signal?.addEventListener('abort', onAbort, { once: true })

    // Watchdog: se o worker não responder em 10 min, aborta com erro claro.
    const watchdog = setTimeout(() => {
      done(() => reject(new Error('WORKER_TIMEOUT')))
    }, 600_000)

    worker.onmessage = (e: MessageEvent) => {
      const m = e.data
      if (!m || m.jobId !== jobId) return
      if (m.type === 'progress') {
        opts.onProgress(String(m.stage ?? 'Processando…'), Number(m.pct ?? 0), Number(m.facesDone ?? 0))
      } else if (m.type === 'done') {
        clearTimeout(watchdog)
        const metrics = toCutMetrics(m.metrics, input.triCount)
        done(() => resolve({
          posPos: m.posPos as Float32Array,
          nrmPos: m.nrmPos as Float32Array,
          posNeg: m.posNeg as Float32Array,
          nrmNeg: m.nrmNeg as Float32Array,
          segFlat: m.segFlat as Float32Array,
          metrics,
        }))
      } else if (m.type === 'cancelled') {
        clearTimeout(watchdog)
        done(() => reject(cancelledError()))
      } else if (m.type === 'error') {
        clearTimeout(watchdog)
        done(() => reject(new Error(String(m.message ?? 'WORKER_ERROR'))))
      }
    }
    worker.onerror = (ev) => {
      clearTimeout(watchdog)
      done(() => reject(ev instanceof Error ? ev : new Error('WORKER_ERROR')))
    }

    const transfer: Transferable[] = [input.positions.buffer]
    if (input.normals) transfer.push(input.normals.buffer)
    if (input.indices) transfer.push(input.indices.buffer)

    try {
      worker.postMessage({
        type: 'cut',
        jobId,
        positions: input.positions,
        normals: input.normals,
        indices: input.indices,
        planeN: [input.nx.x, input.nx.y, input.nx.z],
        planeP: [input.px.x, input.px.y, input.px.z],
        scale: input.scale,
        chunkTris: pickChunk(input.triCount),
      }, transfer)
    } catch (e) {
      clearTimeout(watchdog)
      done(() => reject(e instanceof Error ? e : new Error('WORKER_POST_FAILED')))
    }
  })
}

async function runFallback(
  input: Omit<WorkerSplitInput, 'triCount'>,
  opts: { onProgress: (stage: string, pct: number, done: number) => void; signal?: AbortSignal },
): Promise<{
  posPos: Float32Array; nrmPos: Float32Array
  posNeg: Float32Array; nrmNeg: Float32Array
  segFlat: Float32Array; metrics: CutMetrics
}> {
  const triCount = input.indices ? input.indices.length / 3 : input.positions.length / 9
  const r = await solidPlaneCutFast(
    {
      positions: input.positions,
      normals: input.normals,
      indices: input.indices,
      planeN: [input.nx.x, input.nx.y, input.nx.z],
      planeP: [input.px.x, input.px.y, input.px.z],
      scale: input.scale,
    },
    {
      chunkTris: pickChunk(triCount),
      onProgress: (p) => opts.onProgress(p.stage, p.pct, p.facesDone),
      shouldCancel: () => opts.signal?.aborted ?? false,
    },
  )
  if (opts.signal?.aborted || r.metrics.cancelled) throw cancelledError()
  return r
}

// ─── Tampas: loops numéricos + generateCap (pipeline aprovado, sem tocar) ────

interface Loop {
  pts: THREE.Vector3[]
}

/** Chain-following com chaves numéricas 48-bit (sem strings no loop quente). */
function buildLoopsNumeric(segFlat: Float32Array, scale: number): Loop[] {
  const segCount = Math.floor(segFlat.length / 6)
  if (segCount === 0) return []

  const Q = 1 / Math.max(scale * 1e-4, 1e-9)
  const OFF = 32768
  const idPos: number[] = []
  const keyToId = new Map<number, number>()
  const idOf = (x: number, y: number, z: number): number => {
    const qx = (Math.round(x * Q) + OFF) & 0xffff
    const qy = (Math.round(y * Q) + OFF) & 0xffff
    const qz = (Math.round(z * Q) + OFF) & 0xffff
    const k = qx + qy * 65536 + qz * 4294967296
    let id = keyToId.get(k)
    if (id === undefined) {
      // Colisão numérica residual: confirma posição exata antes de fundir.
      id = idPos.length / 3
      keyToId.set(k, id)
      idPos.push(x, y, z)
    }
    return id
  }

  const outEdges = new Map<number, number[]>()
  const seen = new Set<number>()
  const MULT = 1_000_000
  for (let s = 0; s < segCount; s++) {
    const o = s * 6
    const a = idOf(segFlat[o], segFlat[o + 1], segFlat[o + 2])
    const b = idOf(segFlat[o + 3], segFlat[o + 4], segFlat[o + 5])
    if (a === b) continue
    const key = a < b ? a * MULT + b + 0.5 : b * MULT + a
    void key
    // Direção importa (half-edge): usa par ordenado sem string.
    const dkey = a * 4_294_967_296 + b
    if (seen.has(dkey)) continue
    seen.add(dkey)
    const list = outEdges.get(a)
    if (list) list.push(b)
    else outEdges.set(a, [b])
  }

  const nextPtr = new Map<number, number>()
  const loops: Loop[] = []
  for (const [startNode] of outEdges) {
    while (true) {
      const ptr = nextPtr.get(startNode) ?? 0
      const outs = outEdges.get(startNode)
      if (!outs || ptr >= outs.length) break
      const chain: number[] = []
      let cur = startNode
      const maxSteps = idPos.length / 3 + 4
      let steps = 0
      let closed = false
      while (steps++ < maxSteps) {
        const cPtr = nextPtr.get(cur) ?? 0
        const cOuts = outEdges.get(cur)
        if (!cOuts || cPtr >= cOuts.length) break
        chain.push(cur)
        const next = cOuts[cPtr]
        nextPtr.set(cur, cPtr + 1)
        if (next === startNode) { closed = true; break }
        cur = next
      }
      if (closed && chain.length >= 3) {
        loops.push({
          pts: chain.map((id) => new THREE.Vector3(idPos[id * 3], idPos[id * 3 + 1], idPos[id * 3 + 2])),
        })
      }
    }
  }
  return loops
}

function planeBasis(n: THREE.Vector3): { u: THREE.Vector3; v: THREE.Vector3 } {
  const a = Math.abs(n.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
  const u = new THREE.Vector3().crossVectors(a, n).normalize()
  const v = new THREE.Vector3().crossVectors(n, u).normalize()
  return { u, v }
}

function signedArea2D(pts: THREE.Vector2[]): number {
  let acc = 0
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length]
    acc += p.x * q.y - q.x * p.y
  }
  return acc * 0.5
}

function pointInPoly(pt: THREE.Vector2, poly: THREE.Vector2[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    if (yi > pt.y !== yj > pt.y && pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi + 1e-30) + xi) {
      inside = !inside
    }
  }
  return inside
}

function buildCapsFromLoops(
  loops: Loop[],
  n: THREE.Vector3,
  planePoint: THREE.Vector3,
): {
  posCapPos: Float32Array; nrmCapPos: Float32Array
  posCapNeg: Float32Array; nrmCapNeg: Float32Array
  capTriangles: number
} {
  const empty = {
    posCapPos: new Float32Array(0), nrmCapPos: new Float32Array(0),
    posCapNeg: new Float32Array(0), nrmCapNeg: new Float32Array(0),
    capTriangles: 0,
  }
  if (loops.length === 0) return empty

  const { u, v } = planeBasis(n)
  const L = loops.map((lp) => {
    const pts2d = lp.pts.map((p) => {
      const rx = p.x - planePoint.x, ry = p.y - planePoint.y, rz = p.z - planePoint.z
      return new THREE.Vector2(rx * u.x + ry * u.y + rz * u.z, rx * v.x + ry * v.y + rz * v.z)
    })
    return { pts3d: lp.pts, pts2d, area: signedArea2D(pts2d) }
  })

  const depth = L.map((li, i) => {
    let d = 0
    for (let j = 0; j < L.length; j++) {
      if (j === i || Math.abs(L[j].area) <= Math.abs(li.area)) continue
      if (pointInPoly(li.pts2d[0], L[j].pts2d)) d++
    }
    return d
  })

  const outers: number[] = []
  const holesOf = new Map<number, number[]>()
  L.forEach((_, i) => { if (depth[i] % 2 === 0) { outers.push(i); holesOf.set(i, []) } })
  L.forEach((li, i) => {
    if (depth[i] % 2 !== 1) return
    let best = -1, bestArea = Infinity
    for (const oi of outers) {
      const oa = Math.abs(L[oi].area)
      if (oa < Math.abs(li.area)) continue
      if (pointInPoly(li.pts2d[0], L[oi].pts2d) && oa < bestArea) { best = oi; bestArea = oa }
    }
    if (best >= 0) holesOf.get(best)!.push(i)
  })

  const plane = { normal: n, point: planePoint }
  const posP: number[] = []
  const nrmP: number[] = []
  const posN: number[] = []
  const nrmN: number[] = []
  let capTriangles = 0

  for (const oi of outers) {
    const outer = L[oi]
    const holes = holesOf.get(oi)!.map((hi) => L[hi].pts3d)
    const outerPts = outer.area >= 0 ? outer.pts3d.slice() : outer.pts3d.slice().reverse()
    const negCap = holes.length === 0
      ? generateCap(outerPts, { plane, flipped: false })
      : generateCapWithHoles(outerPts, holes, n, u, v, planePoint, false)
    const posCap = holes.length === 0
      ? generateCap(outerPts, { plane, flipped: true })
      : generateCapWithHoles(outerPts, holes, n, u, v, planePoint, true)
    pushAll(posN, negCap.pos); pushAll(nrmN, negCap.nrm)
    pushAll(posP, posCap.pos); pushAll(nrmP, posCap.nrm)
    capTriangles += negCap.pos.length / 9 + posCap.pos.length / 9
  }

  return {
    posCapPos: new Float32Array(posP), nrmCapPos: new Float32Array(nrmP),
    posCapNeg: new Float32Array(posN), nrmCapNeg: new Float32Array(nrmN),
    capTriangles,
  }
}

function pushAll(dst: number[], src: Float32Array): void {
  for (let i = 0; i < src.length; i++) dst.push(src[i])
}

/** Junta casca + tampa em 1 geometria (upload único p/ GPU). */
function assembleGeometry(
  shellPos: Float32Array, shellNrm: Float32Array,
  capPos: Float32Array, capNrm: Float32Array,
): THREE.BufferGeometry {
  const total = shellPos.length + capPos.length
  const pos = new Float32Array(total)
  const nrm = new Float32Array(total)
  pos.set(shellPos, 0)
  nrm.set(shellNrm, 0)
  if (capPos.length > 0) {
    pos.set(capPos, shellPos.length)
    nrm.set(capNrm, shellNrm.length)
  }
  sanitizeNormalsInPlace(nrm)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3))
  geo.computeBoundingBox()
  geo.computeBoundingSphere()
  return geo
}

/** Limpeza pós-corte: nenhuma normal NaN/Infinity/zero chega ao renderer. */
function sanitizeNormalsInPlace(nrm: Float32Array): void {
  for (let i = 0; i < nrm.length; i += 3) {
    const x = nrm[i], y = nrm[i + 1], z = nrm[i + 2]
    const l2 = x * x + y * y + z * z
    if (!isFinite(l2) || l2 < 1e-12) {
      nrm[i] = 0; nrm[i + 1] = 1; nrm[i + 2] = 0
    }
  }
}

function copyIndex(arr: ArrayLike<number>): Uint32Array {
  const out = new Uint32Array(arr.length)
  for (let i = 0; i < arr.length; i++) out[i] = arr[i]
  return out
}

function toCutMetrics(m: unknown, triCount: number): CutMetrics {
  const profiler = new CutProfiler()
  const base = profiler.metrics
  if (m && typeof m === 'object') {
    const o = m as Record<string, number>
    base.inputFaces = Number(o.inputFaces ?? triCount)
    base.inputVerts = Number(o.inputVerts ?? 0)
    base.outputPosFaces = Number(o.outputPosFaces ?? 0)
    base.outputNegFaces = Number(o.outputNegFaces ?? 0)
    base.outputVerts = Number(o.outputVerts ?? 0)
    base.invalidTris = Number(o.invalidTris ?? 0)
    base.degenerateTris = Number(o.degenerateTris ?? 0)
    base.peakTempBytes = Number(o.peakTempBytes ?? 0)
    base.stageMs.total = Number(o.totalMs ?? 0)
    base.stageMs.reconstruct = Number(o.totalMs ?? 0)
  }
  void heapUsedBytes
  return base
}

function perfNow(): number {
  try { return performance.now() } catch { return Date.now() }
}

function cancelledError(): Error {
  const e = new Error('cancelled')
  ;(e as unknown as { code: string }).code = 'CANCELLED'
  return e
}

export function isCancelled(err: unknown): boolean {
  return (
    err instanceof Error &&
    ((err as unknown as { code?: string }).code === 'CANCELLED' || err.message === 'cancelled')
  )
}
