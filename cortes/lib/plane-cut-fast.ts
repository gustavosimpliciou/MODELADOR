/**
 * Plane Cut FAST — núcleo otimizado do corte por plano infinito.
 *
 * Gargalos eliminados em relação ao `solid-plane-cut.ts` original:
 *  - ZERO `new THREE.Vector3` / `.clone()` no loop quente (matemática escalar
 *    direta sobre TypedArrays) → sem GC thrash em 1–3M de faces.
 *  - ETAPA A (classificação) separada da ETAPA B (reconstrução): triângulos
 *    100% de um lado são copiados com `memcpy` escalar barato; só os que
 *    cruzam o plano passam pelo Sutherland-Hodgman caro.
 *  - Distância vértice→plano calculada UMA vez (cache Float32Array) e
 *    reutilizada na classificação e no clip.
 *  - Buffers de saída pré-alocados com tamanho exato (contagem prévia) —
 *    sem `number[]` crescendo por push, sem cópias intermediárias.
 *  - Processamento em chunks com `yield` + verificação de cancelamento →
 *    a UI respira mesmo no fallback sem Worker.
 *  - Uma única passada de normais; limpeza (degenerados/NaN) inline.
 *
 * Entrada e saída são TypedArrays transferíveis (zero-copy para o Worker).
 */

import { CutProfiler, heapUsedBytes, type CutMetrics } from './cut-telemetry'

export interface FastCutInput {
  positions: Float32Array
  normals?: Float32Array | null
  indices?: Uint32Array | Uint16Array | null
  planeN: [number, number, number]
  planeP: [number, number, number]
  eps?: number
  /** raio da bounding sphere (para EPS adaptativo); calculado se ausente */
  scale?: number
}

export interface FastCutProgress {
  stage: string
  /** 0..100 */
  pct: number
  facesDone: number
  facesTotal: number
}

export interface FastCutResult {
  posPos: Float32Array
  nrmPos: Float32Array
  posNeg: Float32Array
  nrmNeg: Float32Array
  /** segmentos de interseção [ax,ay,az,bx,by,bz, ...] */
  segFlat: Float32Array
  posTris: number
  negTris: number
  metrics: CutMetrics
}

export interface FastCutOptions {
  /** triângulos por chunk (adaptativo por padrão) */
  chunkTris?: number
  onProgress?: (p: FastCutProgress) => void
  shouldCancel?: () => boolean
}

const yieldToMain = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0))

function normalize3(x: number, y: number, z: number): [number, number, number] {
  const l = Math.sqrt(x * x + y * y + z * z) || 1
  return [x / l, y / l, z / l]
}

export async function solidPlaneCutFast(
  input: FastCutInput,
  opts: FastCutOptions = {},
): Promise<FastCutResult> {
  const profiler = new CutProfiler()
  profiler.begin()
  const heap0 = heapUsedBytes()

  const { positions: P, indices: IDX } = input
  const N = input.normals && input.normals.length >= P.length ? input.normals : null
  const triCount = IDX ? IDX.length / 3 : P.length / 9
  const vertCount = P.length / 3

  let [nx, ny, nz] = normalize3(input.planeN[0], input.planeN[1], input.planeN[2])
  const [px, py, pz] = input.planeP

  // Escala para EPS adaptativo (calculada em 1 passada amostral — O(v) barato)
  let scale = input.scale ?? 0
  if (!scale || !(scale > 0)) {
    let mnx = Infinity, mny = Infinity, mnz = Infinity
    let mxx = -Infinity, mxy = -Infinity, mxz = -Infinity
    const step = Math.max(1, Math.floor(vertCount / 4096))
    for (let v = 0; v < vertCount; v += step) {
      const x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2]
      if (!isFinite(x + y + z)) continue
      if (x < mnx) mnx = x; if (x > mxx) mxx = x
      if (y < mny) mny = y; if (y > mxy) mxy = y
      if (z < mnz) mnz = z; if (z > mxz) mxz = z
    }
    scale = 0.5 * Math.sqrt((mxx - mnx) ** 2 + (mxy - mny) ** 2 + (mxz - mnz) ** 2) || 1
  }
  const EPS = input.eps ?? Math.max(1e-9, scale * 1e-6)
  const AREA2_MIN = Math.max(1e-20, scale * scale * 1e-12)

  const chunk = opts.chunkTris ?? pickChunk(triCount)
  const onProgress = opts.onProgress
  const shouldCancel = opts.shouldCancel
  const cancelled = () => (shouldCancel ? shouldCancel() : false)

  const metrics = profiler.metrics
  metrics.inputFaces = triCount
  metrics.inputVerts = vertCount

  // ── ETAPA A — distâncias por vértice (1 passada, reutilizada depois) ──────
  profiler.start('classify')
  const distV = new Float32Array(vertCount)
  for (let v0 = 0; v0 < vertCount; v0 += chunk * 3) {
    if (cancelled()) {
      metrics.cancelled = true
      profiler.end('classify')
      profiler.finish()
      return emptyResult(metrics)
    }
    const v1 = Math.min(vertCount, v0 + chunk * 3)
    for (let v = v0; v < v1; v++) {
      distV[v] = (P[v * 3] - px) * nx + (P[v * 3 + 1] - py) * ny + (P[v * 3 + 2] - pz) * nz
    }
    onProgress?.({ stage: 'Classificando malha…', pct: 4 + (30 * v1) / vertCount, facesDone: Math.min(triCount, Math.floor(v1 / 3)), facesTotal: triCount })
    if (v1 < vertCount) await yieldToMain()
  }

  // ── Contagem prévia: dimensiona buffers de saída SEM superalocação ─────────
  let nPosOnly = 0, nNegOnly = 0, nSpan = 0
  let invalid = 0
  for (let f0 = 0; f0 < triCount; f0 += chunk) {
    if (cancelled()) {
      metrics.cancelled = true
      profiler.end('classify')
      profiler.finish()
      return emptyResult(metrics)
    }
    const f1 = Math.min(triCount, f0 + chunk)
    for (let f = f0; f < f1; f++) {
      const a = IDX ? IDX[f * 3] : f * 3
      const b = IDX ? IDX[f * 3 + 1] : f * 3 + 1
      const c = IDX ? IDX[f * 3 + 2] : f * 3 + 2
      if (a >= vertCount || b >= vertCount || c >= vertCount) { invalid++; continue }
      const d0 = distV[a], d1 = distV[b], d2 = distV[c]
      if (!isFinite(d0 + d1 + d2)) { invalid++; continue }
      const mn = d0 < d1 ? (d0 < d2 ? d0 : d2) : d1 < d2 ? d1 : d2
      const mx = d0 > d1 ? (d0 > d2 ? d0 : d2) : d1 > d2 ? d1 : d2
      if (mn >= -EPS) nPosOnly++
      else if (mx <= EPS) nNegOnly++
      else nSpan++
    }
    if (f1 < triCount) await yieldToMain()
  }
  profiler.end('classify')

  // Cada triângulo straddle gera no máx. 2 tris por lado.
  const posCap = (nPosOnly + nSpan * 2 + 8) * 9
  const negCap = (nNegOnly + nSpan * 2 + 8) * 9
  const posPos = new Float32Array(posCap)
  const nrmPos = new Float32Array(posCap)
  const posNeg = new Float32Array(negCap)
  const nrmNeg = new Float32Array(negCap)
  // Segmentos: 1 por tri straddle (raros casos com 2) + coplanares.
  const segCap = (nSpan * 2 + nPosOnly + nNegOnly > 0 ? nSpan * 2 + 1024 : 1024) * 6
  let seg = new Float32Array(Math.max(1024 * 6, segCap))
  let segLen = 0
  const pushSeg = (ax: number, ay: number, az: number, bx: number, by: number, bz: number) => {
    if (segLen + 6 > seg.length) {
      const next = new Float32Array(seg.length * 2)
      next.set(seg)
      seg = next
    }
    seg[segLen++] = ax; seg[segLen++] = ay; seg[segLen++] = az
    seg[segLen++] = bx; seg[segLen++] = by; seg[segLen++] = bz
  }

  let wPos = 0, wNeg = 0
  let degenerate = 0

  // ── ETAPA B — reconstrução (só straddle passa pelo clip caro) ─────────────
  profiler.start('intersect')
  profiler.start('reconstruct')
  for (let f0 = 0; f0 < triCount; f0 += chunk) {
    if (cancelled()) {
      metrics.cancelled = true
      break
    }
    const f1 = Math.min(triCount, f0 + chunk)
    for (let f = f0; f < f1; f++) {
      const a = IDX ? IDX[f * 3] : f * 3
      const b = IDX ? IDX[f * 3 + 1] : f * 3 + 1
      const c = IDX ? IDX[f * 3 + 2] : f * 3 + 2
      if (a >= vertCount || b >= vertCount || c >= vertCount) continue
      const d0 = distV[a], d1 = distV[b], d2 = distV[c]
      if (!isFinite(d0 + d1 + d2)) continue

      const ax = P[a * 3], ay = P[a * 3 + 1], az = P[a * 3 + 2]
      const bx = P[b * 3], by = P[b * 3 + 1], bz = P[b * 3 + 2]
      const cx = P[c * 3], cy = P[c * 3 + 1], cz = P[c * 3 + 2]
      if (!isFinite(ax + ay + az + bx + by + bz + cx + cy + cz)) { continue }

      // Normal da face (para fallback quando não há normais de entrada)
      const e1x = bx - ax, e1y = by - ay, e1z = bz - az
      const e2x = cx - ax, e2y = cy - ay, e2z = cz - az
      const fnx = e1y * e2z - e1z * e2y
      const fny = e1z * e2x - e1x * e2z
      const fnz = e1x * e2y - e1y * e2x
      const area2 = fnx * fnx + fny * fny + fnz * fnz
      if (area2 < AREA2_MIN) { degenerate++; continue }

      const mn = d0 < d1 ? (d0 < d2 ? d0 : d2) : d1 < d2 ? d1 : d2
      const mx = d0 > d1 ? (d0 > d2 ? d0 : d2) : d1 > d2 ? d1 : d2

      if (mn >= -EPS) {
        wPos = emitTri(posPos, nrmPos, wPos, ax, ay, az, bx, by, bz, cx, cy, cz,
          N, a, b, c, fnx, fny, fnz)
        emitCoplanarSeg(pushSeg, ax, ay, az, bx, by, bz, cx, cy, cz, d0, d1, d2, EPS, true)
        continue
      }
      if (mx <= EPS) {
        wNeg = emitTri(posNeg, nrmNeg, wNeg, ax, ay, az, bx, by, bz, cx, cy, cz,
          N, a, b, c, fnx, fny, fnz)
        emitCoplanarSeg(pushSeg, ax, ay, az, bx, by, bz, cx, cy, cz, d0, d1, d2, EPS, false)
        continue
      }

      // Straddle: clip de Sutherland-Hodgman escalar, sem objetos.
      // Vértices com sinal; pontos de interseção por lerp paramétrico.
      const s0 = d0 > EPS ? 1 : d1 < -EPS ? 0 : 0 // placeholder (recomputado abaixo)
      void s0
      // Monta polígonos positivo/negativo como listas planas [x,y,z,nx,ny,nz,on]*.
      // Triângulo → no máx. 4 vértices por lado (quadrilátero).
      const px2 = clipSide(ax, ay, az, bx, by, bz, cx, cy, cz, d0, d1, d2,
        N, a, b, c, fnx, fny, fnz, true, EPS)
      const nx2 = clipSide(ax, ay, az, bx, by, bz, cx, cy, cz, d0, d1, d2,
        N, a, b, c, fnx, fny, fnz, false, EPS)
      if (px2.n >= 3) wPos = fanEmit(posPos, nrmPos, wPos, px2)
      if (nx2.n >= 3) {
        wNeg = fanEmit(posNeg, nrmNeg, wNeg, nx2)
        // Segmento de interseção: aresta do polígono negativo com ambos on-plane.
        for (let k = 0; k < nx2.n; k++) {
          const k2 = (k + 1) % nx2.n
          if (nx2.on[k] && nx2.on[k2]) {
            const o1 = k * 7, o2 = k2 * 7
            const ddx = nx2.buf[o1] - nx2.buf[o2]
            const ddy = nx2.buf[o1 + 1] - nx2.buf[o2 + 1]
            const ddz = nx2.buf[o1 + 2] - nx2.buf[o2 + 2]
            if (ddx * ddx + ddy * ddy + ddz * ddz > EPS * EPS) {
              pushSeg(nx2.buf[o1], nx2.buf[o1 + 1], nx2.buf[o1 + 2],
                nx2.buf[o2], nx2.buf[o2 + 1], nx2.buf[o2 + 2])
            }
          }
        }
      }
    }
    onProgress?.({
      stage: 'Recortando triângulos…',
      pct: 34 + (56 * f1) / triCount,
      facesDone: f1,
      facesTotal: triCount,
    })
    if (f1 < triCount) await yieldToMain()
  }
  profiler.end('intersect')
  profiler.end('reconstruct')

  metrics.invalidTris = invalid
  metrics.degenerateTris = degenerate
  metrics.outputPosFaces = Math.floor(wPos / 9)
  metrics.outputNegFaces = Math.floor(wNeg / 9)
  metrics.outputVerts = metrics.outputPosFaces * 3 + metrics.outputNegFaces * 3
  const heap1 = heapUsedBytes()
  metrics.peakTempBytes = Math.max(
    distV.byteLength + posPos.byteLength + nrmPos.byteLength + posNeg.byteLength + nrmNeg.byteLength,
    heap1 > heap0 ? heap1 - heap0 : 0,
  )
  profiler.finish()

  return {
    posPos: posPos.subarray(0, wPos),
    nrmPos: nrmPos.subarray(0, wPos),
    posNeg: posNeg.subarray(0, wNeg),
    nrmNeg: nrmNeg.subarray(0, wNeg),
    segFlat: seg.subarray(0, segLen),
    posTris: Math.floor(wPos / 9),
    negTris: Math.floor(wNeg / 9),
    metrics,
  }
}

/** Chunk adaptativo: equilibra velocidade × memória × responsividade. */
export function pickChunk(triCount: number): number {
  if (triCount > 1_500_000) return 50_000   // EXTREME
  if (triCount > 500_000) return 100_000    // HIGH
  return 200_000                            // NORMAL
}

function emptyResult(metrics: CutMetrics): FastCutResult {
  return {
    posPos: new Float32Array(0), nrmPos: new Float32Array(0),
    posNeg: new Float32Array(0), nrmNeg: new Float32Array(0),
    segFlat: new Float32Array(0), posTris: 0, negTris: 0, metrics,
  }
}

function emitTri(
  P: Float32Array, Nrm: Float32Array, w: number,
  ax: number, ay: number, az: number, bx: number, by: number, bz: number,
  cx: number, cy: number, cz: number,
  N: Float32Array | null, ia: number, ib: number, ic: number,
  fnx: number, fny: number, fnz: number,
): number {
  P[w] = ax; P[w + 1] = ay; P[w + 2] = az
  P[w + 3] = bx; P[w + 4] = by; P[w + 5] = bz
  P[w + 6] = cx; P[w + 7] = cy; P[w + 8] = cz
  if (N) {
    Nrm[w] = N[ia * 3]; Nrm[w + 1] = N[ia * 3 + 1]; Nrm[w + 2] = N[ia * 3 + 2]
    Nrm[w + 3] = N[ib * 3]; Nrm[w + 4] = N[ib * 3 + 1]; Nrm[w + 5] = N[ib * 3 + 2]
    Nrm[w + 6] = N[ic * 3]; Nrm[w + 7] = N[ic * 3 + 1]; Nrm[w + 8] = N[ic * 3 + 2]
  } else {
    const l = Math.sqrt(fnx * fnx + fny * fny + fnz * fnz) || 1
    const ux = fnx / l, uy = fny / l, uz = fnz / l
    for (let k = 0; k < 3; k++) {
      Nrm[w + k * 3] = ux; Nrm[w + k * 3 + 1] = uy; Nrm[w + k * 3 + 2] = uz
    }
  }
  return w + 9
}

/** Aresta coplanar (2 vértices sobre o plano): emite segmento com direção
 *  consistente — negativo à esquerda visto de +n. */
function emitCoplanarSeg(
  push: (ax: number, ay: number, az: number, bx: number, by: number, bz: number) => void,
  ax: number, ay: number, az: number, bx: number, by: number, bz: number,
  cx: number, cy: number, cz: number,
  d0: number, d1: number, d2: number, EPS: number, above: boolean,
): void {
  const s = [d0, d1, d2].map((d) => (d > EPS ? 1 : d < -EPS ? -1 : 0))
  const P = [ax, ay, az, bx, by, bz, cx, cy, cz]
  for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3, k = (i + 2) % 3
    if (s[i] === 0 && s[j] === 0 && (above ? s[k] >= 0 : s[k] <= 0)) {
      const aOff = i * 3, bOff = j * 3
      const ddx = P[aOff] - P[bOff], ddy = P[aOff + 1] - P[bOff + 1], ddz = P[aOff + 2] - P[bOff + 2]
      if (ddx * ddx + ddy * ddy + ddz * ddz > EPS * EPS) {
        if (above) push(P[bOff], P[bOff + 1], P[bOff + 2], P[aOff], P[aOff + 1], P[aOff + 2])
        else push(P[aOff], P[aOff + 1], P[aOff + 2], P[bOff], P[bOff + 1], P[bOff + 2])
      }
    }
  }
}

interface Poly {
  /** [x,y,z,nx,ny,nz,on] × n */
  buf: Float64Array
  n: number
  on: boolean[]
}

const _polyA: Poly = { buf: new Float64Array(4 * 7), n: 0, on: [false, false, false, false] }
const _polyB: Poly = { buf: new Float64Array(4 * 7), n: 0, on: [false, false, false, false] }

/** Clip escalar de 1 triângulo. Reutiliza buffers scratch (sem alocação). */
function clipSide(
  ax: number, ay: number, az: number, bx: number, by: number, bz: number,
  cx: number, cy: number, cz: number, d0: number, d1: number, d2: number,
  N: Float32Array | null, ia: number, ib: number, ic: number,
  fnx: number, fny: number, fnz: number, keepPositive: boolean, EPS: number,
): Poly {
  const poly = keepPositive ? _polyA : _polyB
  const fl = Math.sqrt(fnx * fnx + fny * fny + fnz * fnz) || 1
  const ux = fnx / fl, uy = fny / fl, uz = fnz / fl
  const nax = N ? N[ia * 3] : ux, nay = N ? N[ia * 3 + 1] : uy, naz = N ? N[ia * 3 + 2] : uz
  const nbx = N ? N[ib * 3] : ux, nby = N ? N[ib * 3 + 1] : uy, nbz = N ? N[ib * 3 + 2] : uz
  const ncx = N ? N[ic * 3] : ux, ncy = N ? N[ic * 3 + 1] : uy, ncz = N ? N[ic * 3 + 2] : uz

  const vx = [ax, bx, cx], vy = [ay, by, cy], vz = [az, bz, cz]
  const vn = [[nax, nay, naz], [nbx, nby, nbz], [ncx, ncy, ncz]]
  const dd = [d0, d1, d2]
  const ss = dd.map((d) => (d > EPS ? 1 : d < -EPS ? -1 : 0))

  let n = 0
  const buf = poly.buf
  for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3
    const si = ss[i], sj = ss[j]
    const inI = keepPositive ? si >= 0 : si <= 0
    if (inI) {
      const o = n * 7
      buf[o] = vx[i]; buf[o + 1] = vy[i]; buf[o + 2] = vz[i]
      buf[o + 3] = vn[i][0]; buf[o + 4] = vn[i][1]; buf[o + 5] = vn[i][2]
      buf[o + 6] = si === 0 ? 1 : 0
      poly.on[n] = si === 0
      n++
    }
    if ((si > 0 && sj < 0) || (si < 0 && sj > 0)) {
      const t = dd[i] / (dd[i] - dd[j])
      const o = n * 7
      buf[o] = vx[i] + t * (vx[j] - vx[i])
      buf[o + 1] = vy[i] + t * (vy[j] - vy[i])
      buf[o + 2] = vz[i] + t * (vz[j] - vz[i])
      buf[o + 3] = vn[i][0] + t * (vn[j][0] - vn[i][0])
      buf[o + 4] = vn[i][1] + t * (vn[j][1] - vn[i][1])
      buf[o + 5] = vn[i][2] + t * (vn[j][2] - vn[i][2])
      buf[o + 6] = 1
      // Normaliza a normal interpolada
      const lx = buf[o + 3], ly = buf[o + 4], lz = buf[o + 5]
      const ll = Math.sqrt(lx * lx + ly * ly + lz * lz)
      if (ll > 1e-12) { buf[o + 3] = lx / ll; buf[o + 4] = ly / ll; buf[o + 5] = lz / ll }
      poly.on[n] = true
      n++
    }
  }
  poly.n = n
  return poly
}

function fanEmit(P: Float32Array, Nrm: Float32Array, w: number, poly: Poly): number {
  // Leque: (0, k, k+1). Polígono do clip tem no máx. 4 vértices.
  for (let k = 1; k + 1 < poly.n; k++) {
    const o0 = 0, o1 = k * 7, o2 = (k + 1) * 7
    P[w] = poly.buf[o0]; P[w + 1] = poly.buf[o0 + 1]; P[w + 2] = poly.buf[o0 + 2]
    P[w + 3] = poly.buf[o1]; P[w + 4] = poly.buf[o1 + 1]; P[w + 5] = poly.buf[o1 + 2]
    P[w + 6] = poly.buf[o2]; P[w + 7] = poly.buf[o2 + 1]; P[w + 8] = poly.buf[o2 + 2]
    Nrm[w] = poly.buf[o0 + 3]; Nrm[w + 1] = poly.buf[o0 + 4]; Nrm[w + 2] = poly.buf[o0 + 5]
    Nrm[w + 3] = poly.buf[o1 + 3]; Nrm[w + 4] = poly.buf[o1 + 4]; Nrm[w + 5] = poly.buf[o1 + 5]
    Nrm[w + 6] = poly.buf[o2 + 3]; Nrm[w + 7] = poly.buf[o2 + 4]; Nrm[w + 8] = poly.buf[o2 + 5]
    w += 9
  }
  return w
}
