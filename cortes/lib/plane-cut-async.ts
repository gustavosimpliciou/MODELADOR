/**
 * Plane Cut ASYNC — orquestrador do corte por plano infinito.
 *
 * Arquitetura:
 *   UI THREAD                      WORKER THREAD
 *   ──────────                     ─────────────
 *   câmera / zoom / cancelar       classificação O(n) em TypedArrays
 *   progresso real + ETA           clip só dos triângulos straddle
 *   memcpy + deserialize + upload  loops + tampas (generateCap)
 *   1 único upload p/ GPU por lado BVH + serialize (pronto p/ uso)
 *
 * REGRA DE OURO: a main thread nunca executa processamento pesado. Split,
 * tampas (Taubin 30 iterações sobre objetos) e BVH rodam 100% no Worker.
 * Cancelar = worker.terminate() → imediato, mesmo no meio do cálculo.
 *
 * Modos automáticos:
 *   NORMAL  < 500k faces   → worker + chunks de 200k
 *   HIGH    500k–1.5M      → worker + chunks de 100k + preview mantido
 *   EXTREME > 1.5M         → worker + chunks de 50k + updates mínimos de UI
 *
 * Fallback: sem Worker (SSR/CSP) → pipeline completo na main thread com
 * yields (a UI respira entre chunks) + mesmo progresso/cancelamento.
 */

import * as THREE from 'three'
import { MeshBVH, type SerializedBVH } from 'three-mesh-bvh'
import { buildLoopsNumeric, buildCapsFromLoops } from './plane-cut-caps'
import { buildBoundsTreeSafe } from './geo-index'
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

  // ── 2. Pipeline pesado: worker (completo, fora da UI) ou fallback ────────
  // O worker devolve geometria FINAL + BVH serializado. A main thread só faz
  // memcpy + deserialize + upload — nunca bloqueia, em nenhuma etapa.
  type Final = {
    pos: Float32Array; nrm: Float32Array
    neg: Float32Array; nrmNeg: Float32Array
    bvhPos: SerializedBVH | null; bvhNeg: SerializedBVH | null
    needMainBVH: boolean
    capLoops: number; capTriangles: number; metrics: CutMetrics
  }
  let final: Final
  let usedWorker = false

  if (!opts.forceFallback) {
    try {
      final = await runInWorker(
        { positions, normals, indices, scale, nx: n, px: planePoint, triCount },
        {
          onProgress: (stage, pct, done) => report(stage, pct, done, true),
          signal: opts.signal,
        },
      )
      usedWorker = true
    } catch (err) {
      if (isCancelled(err)) throw err
      // Worker indisponível (CSP/SSR/build) → fallback na main thread.
      // Os buffers já são cópias locais: reutiliza sem nova alocação.
      final = await runFallbackMain(
        { positions, normals, indices, scale, nx: n, px: planePoint },
        {
          onProgress: (stage, pct, done) => report(`${stage} (modo compatível)`, pct, done, false),
          signal: opts.signal,
        },
      )
      usedWorker = false
    }
  } else {
    final = await runFallbackMain(
      { positions, normals, indices, scale, nx: n, px: planePoint },
      {
        onProgress: (stage, pct, done) => report(stage, pct, done, false),
        signal: opts.signal,
      },
    )
  }
  throwIfAborted()

  // ── 3. Montagem final: memcpy + BVH + validação (rápido, não trava) ───────
  report('Montando resultado…', 96, triCount, usedWorker)
  const positive = geometryFromArrays(final.pos, final.nrm)
  const negative = geometryFromArrays(final.neg, final.nrmNeg)
  if (final.bvhPos) {
    positive.boundsTree = MeshBVH.deserialize(final.bvhPos, positive, { setIndex: true })
  }
  if (final.bvhNeg) {
    negative.boundsTree = MeshBVH.deserialize(final.bvhNeg, negative, { setIndex: true })
  }
  if (final.needMainBVH) {
    // Só no fallback sem Worker: indexa aqui (único ponto que ainda pode
    // bloquear alguns segundos — inexistente no caminho principal).
    buildBoundsTreeSafe(positive)
    throwIfAborted()
    buildBoundsTreeSafe(negative)
  }
  throwIfAborted()

  const posCount = positive.getAttribute('position')?.count ?? 0
  const negCount = negative.getAttribute('position')?.count ?? 0
  if (posCount === 0 || negCount === 0) {
    positive.dispose()
    negative.dispose()
    throw new Error('NO_INTERSECTION')
  }

  const metrics = final.metrics
  metrics.stageMs.gpu_upload = 0
  metrics.stageMs.total = perfNow() - t0
  metrics.outputPosFaces = Math.floor(posCount / 3)
  metrics.outputNegFaces = Math.floor(negCount / 3)
  metrics.outputVerts = posCount + negCount

  report('Corte concluído.', 100, triCount, usedWorker)

  return {
    positive, negative,
    capLoops: final.capLoops,
    capTriangles: final.capTriangles,
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

interface WorkerFinal {
  pos: Float32Array; nrm: Float32Array
  neg: Float32Array; nrmNeg: Float32Array
  bvhPos: SerializedBVH | null; bvhNeg: SerializedBVH | null
  needMainBVH: boolean
  capLoops: number; capTriangles: number; metrics: CutMetrics
}

function runInWorker(
  input: WorkerSplitInput,
  opts: { onProgress: (stage: string, pct: number, done: number) => void; signal?: AbortSignal },
): Promise<WorkerFinal> {
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
    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      try { worker.terminate() } catch { /* ignore */ }
      opts.signal?.removeEventListener('abort', onAbort)
      fn()
    }
    // Cancelamento IMEDIATO: terminate() mata o worker no meio de qualquer
    // cálculo (inclusive Taubin/BVH) — não espera resposta cooperativa.
    const onAbort = () => {
      finish(() => reject(cancelledError()))
    }
    if (opts.signal?.aborted) { onAbort(); return }
    opts.signal?.addEventListener('abort', onAbort, { once: true })

    // Watchdog: se o worker não responder em 10 min, aborta com erro claro.
    const watchdog = setTimeout(() => {
      finish(() => reject(new Error('WORKER_TIMEOUT')))
    }, 600_000)

    worker.onmessage = (e: MessageEvent) => {
      const m = e.data
      if (!m || m.jobId !== jobId) return
      if (m.type === 'progress') {
        opts.onProgress(String(m.stage ?? 'Processando…'), Number(m.pct ?? 0), Number(m.facesDone ?? 0))
      } else if (m.type === 'done') {
        clearTimeout(watchdog)
        const metrics = toCutMetrics(m.metrics, input.triCount)
        finish(() => resolve({
          pos: m.pos as Float32Array,
          nrm: m.nrm as Float32Array,
          neg: m.neg as Float32Array,
          nrmNeg: m.nrmNeg as Float32Array,
          bvhPos: (m.bvhPos ?? null) as SerializedBVH | null,
          bvhNeg: (m.bvhNeg ?? null) as SerializedBVH | null,
          needMainBVH: false,
          capLoops: Number(m.capLoops ?? 0),
          capTriangles: Number(m.capTriangles ?? 0),
          metrics,
        }))
      } else if (m.type === 'cancelled') {
        clearTimeout(watchdog)
        finish(() => reject(cancelledError()))
      } else if (m.type === 'error') {
        clearTimeout(watchdog)
        finish(() => reject(new Error(String(m.message ?? 'WORKER_ERROR'))))
      }
    }
    worker.onerror = (ev) => {
      clearTimeout(watchdog)
      finish(() => reject(ev instanceof Error ? ev : new Error('WORKER_ERROR')))
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
      finish(() => reject(e instanceof Error ? e : new Error('WORKER_POST_FAILED')))
    }
  })
}

// ─── Fallback sem Worker (main thread com yields — só em ambientes sem Worker)

async function runFallbackMain(
  input: Omit<WorkerSplitInput, 'triCount'>,
  opts: { onProgress: (stage: string, pct: number, done: number) => void; signal?: AbortSignal },
): Promise<WorkerFinal> {
  const triCount = input.indices ? input.indices.length / 3 : input.positions.length / 9
  const split = await solidPlaneCutFast(
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
      onProgress: (p) => opts.onProgress(p.stage, 4 + p.pct * 0.62, p.facesDone),
      shouldCancel: () => opts.signal?.aborted ?? false,
    },
  )
  if (opts.signal?.aborted || split.metrics.cancelled) throw cancelledError()
  opts.onProgress('Fechando corte…', 70, triCount)
  await new Promise((res) => setTimeout(res, 0))
  const loops = buildLoopsNumeric(split.segFlat, input.scale)
  const capT0 = perfNow()
  const caps = buildCapsFromLoops(loops, input.nx, input.px)
  split.metrics.stageMs.cap = perfNow() - capT0
  if (opts.signal?.aborted) throw cancelledError()
  opts.onProgress('Montando resultado…', 88, triCount)
  await new Promise((res) => setTimeout(res, 0))
  const pos = concatPair(split.posPos, caps.posCapPos)
  const nrm = concatPair(split.nrmPos, caps.nrmCapPos)
  const neg = concatPair(split.posNeg, caps.posCapNeg)
  const nrmNeg = concatPair(split.nrmNeg, caps.nrmCapNeg)
  split.metrics.outputPosFaces = Math.floor(pos.length / 9)
  split.metrics.outputNegFaces = Math.floor(neg.length / 9)
  split.metrics.outputVerts = Math.floor(pos.length / 3) + Math.floor(neg.length / 3)
  return {
    pos, nrm, neg, nrmNeg,
    bvhPos: null, bvhNeg: null, needMainBVH: true,
    capLoops: loops.length, capTriangles: caps.capTriangles,
    metrics: split.metrics,
  }
}

// ─── Montagem (memcpy puro — microssegundos, nunca trava) ────────────────────

function concatPair(a: Float32Array, b: Float32Array): Float32Array {
  if (b.length === 0) return a
  if (a.length === 0) return b
  const out = new Float32Array(a.length + b.length)
  out.set(a, 0)
  out.set(b, a.length)
  return out
}

/** Cria a geometria final (upload único p/ GPU no primeiro render). */
function geometryFromArrays(pos: Float32Array, nrm: Float32Array): THREE.BufferGeometry {
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
    base.stageMs.classify = Number(o.classifyMs ?? 0)
    base.stageMs.intersect = Number(o.splitMs ?? 0)
    base.stageMs.reconstruct = Number(o.splitMs ?? 0)
    base.stageMs.cap = Number(o.capMs ?? 0)
    base.stageMs.cleanup = Number(o.bvhMs ?? 0)
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
