/**
 * Worker — Corte por plano infinito (pipeline completo fora da UI thread).
 *
 * Etapas (todas aqui dentro — a main thread só monta e envia p/ GPU):
 *   1. classificação + clip em chunks (TypedArrays, zero-copy)
 *   2. loops de borda + tampas (generateCap, pipeline aprovado)
 *   3. BVH das duas metades + serialize (pronto p/ deserialize na main)
 *
 * Protocolo:
 *  main → worker: { type: 'cut', jobId, positions, normals?, indices?,
 *                    planeN: [x,y,z], planeP: [x,y,z], eps?, scale?, chunkTris? }
 *                   (buffers transferidos — zero-copy)
 *  worker → main:  { type: 'progress', jobId, stage, pct, facesDone, facesTotal }
 *  worker → main:  { type: 'done', jobId, pos, nrm, neg, nrmNeg,
 *                    bvhPos: {roots, index}, bvhNeg: {roots, index},
 *                    capLoops, capTriangles, metrics }
 *                   (buffers transferidos de volta)
 *  worker → main:  { type: 'error' | 'cancelled', jobId, message? }
 *  main → worker:  { type: 'cancel', jobId }
 *
 * Cancelamento também pode ser imediato via worker.terminate() — o worker
 * verifica a flag entre chunks/loops para o cancelamento cooperativo.
 */

import * as THREE from 'three'
import { MeshBVH } from 'three-mesh-bvh'
import { buildLoopsNumeric, buildCapsFromLoops } from '../lib/plane-cut-caps'

interface CutMsg {
  type: string
  jobId: number
  positions?: Float32Array
  normals?: Float32Array | null
  indices?: Uint32Array | null
  planeN?: [number, number, number]
  planeP?: [number, number, number]
  eps?: number
  scale?: number
  chunkTris?: number
}

let cancelledJob = -1

self.onmessage = async function (e: MessageEvent) {
  const msg = e.data as CutMsg
  if (msg.type === 'cancel') {
    cancelledJob = msg.jobId
    return
  }
  if (msg.type !== 'cut') return

  const jobId = msg.jobId
  const t0 = performance.now()
  try {
    const P = msg.positions!
    const N = msg.normals && msg.normals.length >= P.length ? msg.normals : null
    const IDX = msg.indices ?? null
    const triCount = IDX ? IDX.length / 3 : P.length / 9
    const vertCount = P.length / 3

    let nx = msg.planeN![0], ny = msg.planeN![1], nz = msg.planeN![2]
    const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
    nx /= nl; ny /= nl; nz /= nl
    const px = msg.planeP![0], py = msg.planeP![1], pz = msg.planeP![2]

    let scale = msg.scale ?? 0
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
    const EPS = msg.eps ?? Math.max(1e-9, scale * 1e-6)
    const AREA2_MIN = Math.max(1e-20, scale * scale * 1e-12)
    const chunk = msg.chunkTris ?? (triCount > 1_500_000 ? 50_000 : triCount > 500_000 ? 100_000 : 200_000)

    const isCancelled = () => cancelledJob === jobId
    const post = (m: unknown, t?: Transferable[]) => (self as unknown as { postMessage: (m: unknown, t?: Transferable[]) => void }).postMessage(m, t ?? [])

    // ── ETAPA A: distâncias por vértice ────────────────────────────────────
    post({ type: 'progress', jobId, stage: 'Classificando malha…', pct: 4, facesDone: 0, facesTotal: triCount })
    const distV = new Float32Array(vertCount)
    for (let v0 = 0; v0 < vertCount; v0 += chunk * 3) {
      if (isCancelled()) { post({ type: 'cancelled', jobId }); return }
      const v1 = Math.min(vertCount, v0 + chunk * 3)
      for (let v = v0; v < v1; v++) {
        distV[v] = (P[v * 3] - px) * nx + (P[v * 3 + 1] - py) * ny + (P[v * 3 + 2] - pz) * nz
      }
      if ((v0 / (chunk * 3)) % 4 === 0) {
        post({
          type: 'progress', jobId, stage: 'Classificando malha…',
          pct: 4 + (26 * v1) / vertCount,
          facesDone: Math.min(triCount, Math.floor(v1 / 3)), facesTotal: triCount,
        })
      }
    }

    // ── Contagem prévia ────────────────────────────────────────────────────
    let nPosOnly = 0, nNegOnly = 0, nSpan = 0, invalid = 0
    for (let f = 0; f < triCount; f++) {
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
      if ((f % (chunk * 2)) === 0 && f > 0) {
        if (isCancelled()) { post({ type: 'cancelled', jobId }); return }
      }
    }
    post({ type: 'progress', jobId, stage: 'Analisando interseções…', pct: 34, facesDone: 0, facesTotal: triCount })

    const posPos = new Float32Array((nPosOnly + nSpan * 2 + 8) * 9)
    const nrmPos = new Float32Array((nPosOnly + nSpan * 2 + 8) * 9)
    const posNeg = new Float32Array((nNegOnly + nSpan * 2 + 8) * 9)
    const nrmNeg = new Float32Array((nNegOnly + nSpan * 2 + 8) * 9)
    let seg = new Float32Array(Math.max(6144, (nSpan * 2 + 1024) * 6))
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

    // scratch para clip (2 polígonos × 4 vértices × 7 campos)
    const bufA = new Float64Array(28)
    const bufB = new Float64Array(28)
    const onA = [false, false, false, false]
    const onB = [false, false, false, false]

    let wPos = 0, wNeg = 0, degenerate = 0

    const emitOne = (
      P_: Float32Array, Nr: Float32Array, w: number,
      ax: number, ay: number, az: number, bx: number, by: number, bz: number,
      cx: number, cy: number, cz: number,
      ia: number, ib: number, ic: number, fnx: number, fny: number, fnz: number,
    ): number => {
      P_[w] = ax; P_[w + 1] = ay; P_[w + 2] = az
      P_[w + 3] = bx; P_[w + 4] = by; P_[w + 5] = bz
      P_[w + 6] = cx; P_[w + 7] = cy; P_[w + 8] = cz
      if (N) {
        Nr[w] = N[ia * 3]; Nr[w + 1] = N[ia * 3 + 1]; Nr[w + 2] = N[ia * 3 + 2]
        Nr[w + 3] = N[ib * 3]; Nr[w + 4] = N[ib * 3 + 1]; Nr[w + 5] = N[ib * 3 + 2]
        Nr[w + 6] = N[ic * 3]; Nr[w + 7] = N[ic * 3 + 1]; Nr[w + 8] = N[ic * 3 + 2]
      } else {
        const l = Math.sqrt(fnx * fnx + fny * fny + fnz * fnz) || 1
        const ux = fnx / l, uy = fny / l, uz = fnz / l
        Nr[w] = ux; Nr[w + 1] = uy; Nr[w + 2] = uz
        Nr[w + 3] = ux; Nr[w + 4] = uy; Nr[w + 5] = uz
        Nr[w + 6] = ux; Nr[w + 7] = uy; Nr[w + 8] = uz
      }
      return w + 9
    }

    // ── ETAPA B: reconstrução ──────────────────────────────────────────────
    for (let f0 = 0; f0 < triCount; f0 += chunk) {
      if (isCancelled()) { post({ type: 'cancelled', jobId }); return }
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
        if (!isFinite(ax + ay + az + bx + by + bz + cx + cy + cz)) continue

        const e1x = bx - ax, e1y = by - ay, e1z = bz - az
        const e2x = cx - ax, e2y = cy - ay, e2z = cz - az
        const fnx = e1y * e2z - e1z * e2y
        const fny = e1z * e2x - e1x * e2z
        const fnz = e1x * e2y - e1y * e2x
        if (fnx * fnx + fny * fny + fnz * fnz < AREA2_MIN) { degenerate++; continue }

        const mn = d0 < d1 ? (d0 < d2 ? d0 : d2) : d1 < d2 ? d1 : d2
        const mx = d0 > d1 ? (d0 > d2 ? d0 : d2) : d1 > d2 ? d1 : d2

        if (mn >= -EPS) {
          wPos = emitOne(posPos, nrmPos, wPos, ax, ay, az, bx, by, bz, cx, cy, cz, a, b, c, fnx, fny, fnz)
          // coplanar: 2 vértices sobre o plano → segmento invertido (neg à esquerda)
          const s0 = d0 > EPS ? 1 : d0 < -EPS ? -1 : 0
          const s1 = d1 > EPS ? 1 : d1 < -EPS ? -1 : 0
          const s2 = d2 > EPS ? 1 : d2 < -EPS ? -1 : 0
          const ss = [s0, s1, s2]
          const vv = [ax, ay, az, bx, by, bz, cx, cy, cz]
          for (let i = 0; i < 3; i++) {
            const j = (i + 1) % 3, k = (i + 2) % 3
            if (ss[i] === 0 && ss[j] === 0 && ss[k] >= 0) {
              const ao = i * 3, bo = j * 3
              pushSeg(vv[bo], vv[bo + 1], vv[bo + 2], vv[ao], vv[ao + 1], vv[ao + 2])
            }
          }
          continue
        }
        if (mx <= EPS) {
          wNeg = emitOne(posNeg, nrmNeg, wNeg, ax, ay, az, bx, by, bz, cx, cy, cz, a, b, c, fnx, fny, fnz)
          const s0 = d0 > EPS ? 1 : d0 < -EPS ? -1 : 0
          const s1 = d1 > EPS ? 1 : d1 < -EPS ? -1 : 0
          const s2 = d2 > EPS ? 1 : d2 < -EPS ? -1 : 0
          const ss = [s0, s1, s2]
          const vv = [ax, ay, az, bx, by, bz, cx, cy, cz]
          for (let i = 0; i < 3; i++) {
            const j = (i + 1) % 3, k = (i + 2) % 3
            if (ss[i] === 0 && ss[j] === 0 && ss[k] <= 0) {
              const ao = i * 3, bo = j * 3
              pushSeg(vv[ao], vv[ao + 1], vv[ao + 2], vv[bo], vv[bo + 1], vv[bo + 2])
            }
          }
          continue
        }

        // Straddle — clip escalar inline (2 lados)
        const fl = Math.sqrt(fnx * fnx + fny * fny + fnz * fnz) || 1
        const ux = fnx / fl, uy = fny / fl, uz = fnz / fl
        const nax = N ? N[a * 3] : ux, nay = N ? N[a * 3 + 1] : uy, naz = N ? N[a * 3 + 2] : uz
        const nbx = N ? N[b * 3] : ux, nby = N ? N[b * 3 + 1] : uy, nbz = N ? N[b * 3 + 2] : uz
        const ncx = N ? N[c * 3] : ux, ncy = N ? N[c * 3 + 1] : uy, ncz = N ? N[c * 3 + 2] : uz
        const vx = [ax, bx, cx], vy = [ay, by, cy], vz = [az, bz, cz]
        const vnx = [nax, nbx, ncx], vny = [nay, nby, ncy], vnz = [naz, nbz, ncz]
        const dd = [d0, d1, d2]
        const sgn = dd.map((d) => (d > EPS ? 1 : d < -EPS ? -1 : 0))

        for (let side = 0; side < 2; side++) {
          const keepPos = side === 0
          const buf = keepPos ? bufA : bufB
          const on = keepPos ? onA : onB
          let n = 0
          for (let i = 0; i < 3; i++) {
            const j = (i + 1) % 3
            const si = sgn[i], sj = sgn[j]
            const inI = keepPos ? si >= 0 : si <= 0
            if (inI) {
              const o = n * 7
              buf[o] = vx[i]; buf[o + 1] = vy[i]; buf[o + 2] = vz[i]
              buf[o + 3] = vnx[i]; buf[o + 4] = vny[i]; buf[o + 5] = vnz[i]
              on[n] = si === 0
              n++
            }
            if ((si > 0 && sj < 0) || (si < 0 && sj > 0)) {
              const t = dd[i] / (dd[i] - dd[j])
              const o = n * 7
              buf[o] = vx[i] + t * (vx[j] - vx[i])
              buf[o + 1] = vy[i] + t * (vy[j] - vy[i])
              buf[o + 2] = vz[i] + t * (vz[j] - vz[i])
              let lx = vnx[i] + t * (vnx[j] - vnx[i])
              let ly = vny[i] + t * (vny[j] - vny[i])
              let lz = vnz[i] + t * (vnz[j] - vnz[i])
              const ll = Math.sqrt(lx * lx + ly * ly + lz * lz)
              if (ll > 1e-12) { lx /= ll; ly /= ll; lz /= ll }
              buf[o + 3] = lx; buf[o + 4] = ly; buf[o + 5] = lz
              on[n] = true
              n++
            }
          }
          if (n >= 3) {
            for (let k = 1; k + 1 < n; k++) {
              const o0 = 0, o1 = k * 7, o2 = (k + 1) * 7
              if (keepPos) {
                posPos[wPos] = buf[o0]; posPos[wPos + 1] = buf[o0 + 1]; posPos[wPos + 2] = buf[o0 + 2]
                posPos[wPos + 3] = buf[o1]; posPos[wPos + 4] = buf[o1 + 1]; posPos[wPos + 5] = buf[o1 + 2]
                posPos[wPos + 6] = buf[o2]; posPos[wPos + 7] = buf[o2 + 1]; posPos[wPos + 8] = buf[o2 + 2]
                nrmPos[wPos] = buf[o0 + 3]; nrmPos[wPos + 1] = buf[o0 + 4]; nrmPos[wPos + 2] = buf[o0 + 5]
                nrmPos[wPos + 3] = buf[o1 + 3]; nrmPos[wPos + 4] = buf[o1 + 4]; nrmPos[wPos + 5] = buf[o1 + 5]
                nrmPos[wPos + 6] = buf[o2 + 3]; nrmPos[wPos + 7] = buf[o2 + 4]; nrmPos[wPos + 8] = buf[o2 + 5]
                wPos += 9
              } else {
                posNeg[wNeg] = buf[o0]; posNeg[wNeg + 1] = buf[o0 + 1]; posNeg[wNeg + 2] = buf[o0 + 2]
                posNeg[wNeg + 3] = buf[o1]; posNeg[wNeg + 4] = buf[o1 + 1]; posNeg[wNeg + 5] = buf[o1 + 2]
                posNeg[wNeg + 6] = buf[o2]; posNeg[wNeg + 7] = buf[o2 + 1]; posNeg[wNeg + 8] = buf[o2 + 2]
                nrmNeg[wNeg] = buf[o0 + 3]; nrmNeg[wNeg + 1] = buf[o0 + 4]; nrmNeg[wNeg + 2] = buf[o0 + 5]
                nrmNeg[wNeg + 3] = buf[o1 + 3]; nrmNeg[wNeg + 4] = buf[o1 + 4]; nrmNeg[wNeg + 5] = buf[o1 + 5]
                nrmNeg[wNeg + 6] = buf[o2 + 3]; nrmNeg[wNeg + 7] = buf[o2 + 4]; nrmNeg[wNeg + 8] = buf[o2 + 5]
                wNeg += 9
              }
            }
            if (!keepPos) {
              for (let k = 0; k < n; k++) {
                const k2 = (k + 1) % n
                if (on[k] && on[k2]) {
                  const o1 = k * 7, o2 = k2 * 7
                  pushSeg(buf[o1], buf[o1 + 1], buf[o1 + 2], buf[o2], buf[o2 + 1], buf[o2 + 2])
                }
              }
            }
          }
        }
      }
      post({
        type: 'progress', jobId,
        stage: f1 < triCount ? 'Recortando triângulos…' : 'Reconstruindo geometria…',
        pct: 34 + (36 * f1) / triCount,
        facesDone: f1, facesTotal: triCount,
      })
    }

    const tSplitEnd = performance.now()
    if (isCancelled()) { post({ type: 'cancelled', jobId }); return }

    // ── ETAPA C: loops de borda + tampas (o estágio que travava a UI) ───────
    post({ type: 'progress', jobId, stage: 'Fechando corte…', pct: 72, facesDone: triCount, facesTotal: triCount })
    const tCaps0 = performance.now()
    const loops = buildLoopsNumeric(seg.subarray(0, segLen), scale)
    if (isCancelled()) { post({ type: 'cancelled', jobId }); return }
    const planeNrm = new THREE.Vector3(nx, ny, nz)
    const planePt = new THREE.Vector3(px, py, pz)
    const caps = buildCapsFromLoops(loops, planeNrm, planePt, (d, t) => {
      post({
        type: 'progress', jobId, stage: `Gerando tampa ${d}/${t}…`,
        pct: 74 + (12 * d) / Math.max(1, t), facesDone: triCount, facesTotal: triCount,
      })
    })
    if (isCancelled()) { post({ type: 'cancelled', jobId }); return }
    const tCapsEnd = performance.now()

    // ── Monta geometria final por lado (casca + tampa, cópia exata) ─────────
    const finalPos = new Float32Array(wPos + caps.posCapPos.length)
    const finalNrm = new Float32Array(wPos + caps.nrmCapPos.length)
    finalPos.set(posPos.subarray(0, wPos), 0)
    finalNrm.set(nrmPos.subarray(0, wPos), 0)
    finalPos.set(caps.posCapPos, wPos)
    finalNrm.set(caps.nrmCapPos, wPos)
    const finalNeg = new Float32Array(wNeg + caps.posCapNeg.length)
    const finalNrmNeg = new Float32Array(wNeg + caps.nrmCapNeg.length)
    finalNeg.set(posNeg.subarray(0, wNeg), 0)
    finalNrmNeg.set(nrmNeg.subarray(0, wNeg), 0)
    // Libera referências grandes p/ GC do worker
    // (os buffers de entrada já foram transferidos/neutered na origem)

    // ── ETAPA D: BVH das metades + serialize (deserialize rápido na main) ───
    post({ type: 'progress', jobId, stage: 'Indexando malha para seleção…', pct: 88, facesDone: triCount, facesTotal: triCount })
    const tBvh0 = performance.now()
    const buildSerializedBVH = (pos: Float32Array) => {
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const bvh = new MeshBVH(g, { maxLeafSize: 10 })
      const s = MeshBVH.serialize(bvh, { cloneBuffers: true }) as {
        version: number
        roots: ArrayBuffer[]
        index: Int32Array | Uint32Array | Uint16Array | null
        indirectBuffer: null
      }
      g.dispose()
      return s
    }
    const sPos = buildSerializedBVH(finalPos)
    if (isCancelled()) { post({ type: 'cancelled', jobId }); return }
    post({ type: 'progress', jobId, stage: 'Indexando malha para seleção…', pct: 93, facesDone: triCount, facesTotal: triCount })
    const sNeg = buildSerializedBVH(finalNeg)
    if (isCancelled()) { post({ type: 'cancelled', jobId }); return }
    const tBvhEnd = performance.now()

    const totalMs = performance.now() - t0
    const posTris = Math.floor(finalPos.length / 9)
    const negTris = Math.floor(finalNeg.length / 9)
    const transfer: Transferable[] = [
      finalPos.buffer, finalNrm.buffer, finalNeg.buffer, finalNrmNeg.buffer,
      ...sPos.roots, ...sNeg.roots,
    ]
    if (sPos.index) transfer.push(sPos.index.buffer as ArrayBuffer)
    if (sNeg.index) transfer.push(sNeg.index.buffer as ArrayBuffer)

    post({
      type: 'done', jobId,
      pos: finalPos, nrm: finalNrm, neg: finalNeg, nrmNeg: finalNrmNeg,
      bvhPos: { version: sPos.version, roots: sPos.roots, index: sPos.index, indirectBuffer: null },
      bvhNeg: { version: sNeg.version, roots: sNeg.roots, index: sNeg.index, indirectBuffer: null },
      capLoops: caps.capLoops, capTriangles: caps.capTriangles,
      posTris, negTris,
      metrics: {
        inputFaces: triCount, inputVerts: vertCount,
        outputPosFaces: posTris, outputNegFaces: negTris,
        outputVerts: Math.floor(finalPos.length / 3) + Math.floor(finalNeg.length / 3),
        invalidTris: invalid, degenerateTris: degenerate,
        totalMs,
        splitMs: tSplitEnd - t0,
        capMs: tCapsEnd - tCaps0,
        bvhMs: tBvhEnd - tBvh0,
        peakTempBytes: distV.byteLength + posPos.byteLength + nrmPos.byteLength + posNeg.byteLength + nrmNeg.byteLength
          + finalPos.byteLength + finalNrm.byteLength + finalNeg.byteLength + finalNrmNeg.byteLength,
        cancelled: false,
      },
    }, transfer)
  } catch (err) {
    const post = (self as unknown as { postMessage: (m: unknown) => void }).postMessage
    post({ type: 'error', jobId, message: err instanceof Error ? err.message : String(err) })
  }
}

export {}
