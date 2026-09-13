/**
 * Plane Cut Caps — fechamento das regiões cortadas (loops + tampas).
 *
 * Módulo compartilhado entre a thread principal (fallback sem Worker) e o
 * Worker de corte (caminho principal). NÃO importa nada de DOM — roda nos
 * dois ambientes. O pipeline de tampa em si (`generateCap`, aprovado) não
 * foi alterado; aqui há apenas organização dos loops + chamadas.
 */

import * as THREE from 'three'
import { generateCap, generateCapWithHoles } from './cap-generation'

export interface CapLoop {
  pts: THREE.Vector3[]
}

export interface CapsResult {
  posCapPos: Float32Array
  nrmCapPos: Float32Array
  posCapNeg: Float32Array
  nrmCapNeg: Float32Array
  capLoops: number
  capTriangles: number
}

/** Chain-following com chaves numéricas 48-bit (sem strings no loop quente). */
export function buildLoopsNumeric(segFlat: Float32Array, scale: number): CapLoop[] {
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
      id = idPos.length / 3
      keyToId.set(k, id)
      idPos.push(x, y, z)
    }
    return id
  }

  const outEdges = new Map<number, number[]>()
  const seen = new Set<number>()
  for (let s = 0; s < segCount; s++) {
    const o = s * 6
    const a = idOf(segFlat[o], segFlat[o + 1], segFlat[o + 2])
    const b = idOf(segFlat[o + 3], segFlat[o + 4], segFlat[o + 5])
    if (a === b) continue
    // Half-edge direcionada (a→b ≠ b→a): chave ordenada sem string.
    const dkey = a * 4294967296 + b
    if (seen.has(dkey)) continue
    seen.add(dkey)
    const list = outEdges.get(a)
    if (list) list.push(b)
    else outEdges.set(a, [b])
  }

  const nextPtr = new Map<number, number>()
  const loops: CapLoop[] = []
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

function pushAll(dst: number[], src: Float32Array): void {
  for (let i = 0; i < src.length; i++) dst.push(src[i])
}

/**
 * Gera as tampas dos loops via pipeline aprovado (generateCap).
 * `onLoop` é chamado entre loops para progresso/cancelamento no Worker.
 */
export function buildCapsFromLoops(
  loops: CapLoop[],
  n: THREE.Vector3,
  planePoint: THREE.Vector3,
  onLoop?: (done: number, total: number) => void,
): CapsResult {
  const empty: CapsResult = {
    posCapPos: new Float32Array(0), nrmCapPos: new Float32Array(0),
    posCapNeg: new Float32Array(0), nrmCapNeg: new Float32Array(0),
    capLoops: loops.length, capTriangles: 0,
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

  let done = 0
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
    done++
    onLoop?.(done, outers.length)
  }

  return {
    posCapPos: new Float32Array(posP), nrmCapPos: new Float32Array(nrmP),
    posCapNeg: new Float32Array(posN), nrmCapNeg: new Float32Array(nrmN),
    capLoops: loops.length, capTriangles,
  }
}
