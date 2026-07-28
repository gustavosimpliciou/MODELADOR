/**
 * Plate Cut (Placa de Limitação) — Barreira finita retangular para o SmartCut
 * ─────────────────────────────────────────────────────────────────
 * Algoritmo de corte usando Sutherland-Hodgman com 5 planos:
 *   Plano 0: plano de corte principal (normal da placa)
 *   Planos 1-4: bordas laterais da placa (esquerda, direita, baixo, cima)
 *
 * Apenas a região da malha que intercepta a área da placa é cortada.
 * O resto permanece intacto no lado positivo.
 *
 * As tampas reutilizam exatamente o sistema existente (generateCap / generateCapWithHoles).
 */

import * as THREE from 'three'
import { generateCap, generateCapWithHoles } from './cap-generation'

// ─── Tipos públicos ─────────────────────────────────────────────────────────

export interface PlateCutParams {
  /** Centro da placa no espaço mundo */
  center: THREE.Vector3
  /** Normal da placa — lado positivo = peça que fica */
  normal: THREE.Vector3
  /** Eixo X local da placa (direção da largura) */
  right: THREE.Vector3
  /** Eixo Y local da placa (direção da altura) */
  up: THREE.Vector3
  /** Largura total da placa */
  width: number
  /** Altura total da placa */
  height: number
}

export interface PlateCutResult {
  positive: THREE.BufferGeometry
  negative: THREE.BufferGeometry
  capTriangles: number
}

// ─── Tipos internos ─────────────────────────────────────────────────────────

interface Vtx {
  p: THREE.Vector3
  n: THREE.Vector3
}

class SideBuilder {
  pos: number[] = []
  nrm: number[] = []

  pushPoly(poly: Vtx[]): void {
    if (poly.length < 3) return
    for (let i = 1; i + 1 < poly.length; i++) {
      this.pushTri(poly[0], poly[i], poly[i + 1])
    }
  }

  pushTri(a: Vtx, b: Vtx, c: Vtx): void {
    this.pos.push(a.p.x, a.p.y, a.p.z, b.p.x, b.p.y, b.p.z, c.p.x, c.p.y, c.p.z)
    this.nrm.push(a.n.x, a.n.y, a.n.z, b.n.x, b.n.y, b.n.z, c.n.x, c.n.y, c.n.z)
  }

  pushCapData(pos: Float32Array, nrm: Float32Array): void {
    for (let i = 0; i < pos.length; i++) this.pos.push(pos[i])
    for (let i = 0; i < nrm.length; i++) this.nrm.push(nrm[i])
  }

  toGeometry(): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3))
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3))
    geo.computeBoundingBox()
    geo.computeBoundingSphere()
    return geo
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function lerpVtx(a: Vtx, b: Vtx, t: number): Vtx {
  const p = new THREE.Vector3().lerpVectors(a.p, b.p, t)
  const nm = new THREE.Vector3().lerpVectors(a.n, b.n, t)
  if (nm.lengthSq() > 1e-12) nm.normalize()
  return { p, n: nm }
}

function planeBasis(n: THREE.Vector3): { u: THREE.Vector3; v: THREE.Vector3 } {
  const a = Math.abs(n.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
  const u = new THREE.Vector3().crossVectors(a, n).normalize()
  const v = new THREE.Vector3().crossVectors(n, u).normalize()
  return { u, v }
}

// ─── Clip de um polígono por um único plano ──────────────────────────────────
// "neg" = lado com (p − planeP)·planeN ≤ 0 (interior do volume de corte)
// "pos" = lado com (p − planeP)·planeN > 0 (exterior → saída positiva)
function clipPolyByPlane(
  poly: Vtx[],
  planeN: THREE.Vector3,
  planeP: THREE.Vector3,
  EPS: number,
): { neg: Vtx[]; pos: Vtx[]; negOn: boolean[] } {
  const neg: Vtx[] = []
  const pos: Vtx[] = []
  const negOn: boolean[] = []

  const n = poly.length
  if (n === 0) return { neg, pos, negOn }

  const d = poly.map(v => v.p.clone().sub(planeP).dot(planeN))
  const s = d.map(di => (di > EPS ? 1 : di < -EPS ? -1 : 0))

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const vi = poly[i], vj = poly[j]
    const si = s[i], sj = s[j]
    const di = d[i], dj = d[j]

    if (si >= 0) pos.push(vi)
    if (si <= 0) { neg.push(vi); negOn.push(si === 0) }

    if ((si > 0 && sj < 0) || (si < 0 && sj > 0)) {
      const t = di / (di - dj)
      const ip = lerpVtx(vi, vj, t)
      pos.push(ip)
      neg.push(ip)
      negOn.push(true)
    }
  }

  return { neg, pos, negOn }
}

// ─── Coleta segmentos de juntura a partir do polígono negativo ───────────────
// Extrai arestas on-plane do negPoly em ordem CCW → negativo à esquerda (visto de +planeN)
function collectSeam(
  negPoly: Vtx[],
  negOn: boolean[],
  EPS: number,
  segFlat: number[],
): void {
  const m = negPoly.length
  for (let k = 0; k < m; k++) {
    const k2 = (k + 1) % m
    if (negOn[k] && negOn[k2]) {
      const a = negPoly[k].p, b = negPoly[k2].p
      if (a.distanceToSquared(b) > EPS * EPS) {
        segFlat.push(a.x, a.y, a.z, b.x, b.y, b.z)
      }
    }
  }
}

// ─── buildLoops (mesmo algoritmo de solid-plane-cut.ts) ─────────────────────

interface Loop { pts: THREE.Vector3[] }

function buildLoops(segFlat: number[], scale: number, EPS: number): Loop[] {
  const segCount = segFlat.length / 6
  if (segCount === 0) return []

  const Q = 1 / Math.max(scale * 1e-4, 1e-9)
  const keyToId = new Map<string, number>()
  const idPos: THREE.Vector3[] = []

  const idOf = (x: number, y: number, z: number): number => {
    const k = `${Math.round(x * Q)},${Math.round(y * Q)},${Math.round(z * Q)}`
    let id = keyToId.get(k)
    if (id === undefined) {
      id = idPos.length
      keyToId.set(k, id)
      idPos.push(new THREE.Vector3(x, y, z))
    }
    return id
  }

  const outEdges = new Map<number, number[]>()
  const seen = new Set<string>()

  for (let s = 0; s < segCount; s++) {
    const o = s * 6
    const a = idOf(segFlat[o], segFlat[o + 1], segFlat[o + 2])
    const b = idOf(segFlat[o + 3], segFlat[o + 4], segFlat[o + 5])
    if (a === b) continue
    const key = `${a}>${b}`
    if (seen.has(key)) continue
    seen.add(key)
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
      const maxSteps = idPos.length + 4
      let steps = 0
      let closed = false

      while (steps++ < maxSteps) {
        const curPtr = nextPtr.get(cur) ?? 0
        const curOuts = outEdges.get(cur)
        if (!curOuts || curPtr >= curOuts.length) break

        chain.push(cur)
        const next = curOuts[curPtr]
        nextPtr.set(cur, curPtr + 1)

        if (next === startNode) { closed = true; break }
        cur = next
      }

      if (closed && chain.length >= 3) {
        loops.push({ pts: chain.map(id => idPos[id]) })
      }
    }
  }

  return loops
}

// ─── Geração de tampas (reutiliza o sistema existente) ───────────────────────

function signedArea2D(pts: THREE.Vector2[]): number {
  let a = 0
  const n = pts.length
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n]
    a += p.x * q.y - q.x * p.y
  }
  return a * 0.5
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

function buildCapsForPlane(
  loops: Loop[],
  planeNormal: THREE.Vector3,
  planePoint: THREE.Vector3,
  positive: SideBuilder,
  negative: SideBuilder,
): number {
  if (loops.length === 0) return 0

  const { u, v } = planeBasis(planeNormal)

  const L = loops.map(lp => {
    const pts2d = lp.pts.map(p => {
      const rel = p.clone().sub(planePoint)
      return new THREE.Vector2(rel.dot(u), rel.dot(v))
    })
    return { pts3d: lp.pts, pts2d, area: signedArea2D(pts2d) }
  })

  const depth = L.map((li, i) => {
    const rep = li.pts2d[0]
    let d = 0
    for (let j = 0; j < L.length; j++) {
      if (j === i) continue
      if (Math.abs(L[j].area) <= Math.abs(li.area)) continue
      if (pointInPoly(rep, L[j].pts2d)) d++
    }
    return d
  })

  const outers: number[] = []
  const holesOf = new Map<number, number[]>()
  L.forEach((_, i) => {
    if (depth[i] % 2 === 0) { outers.push(i); holesOf.set(i, []) }
  })
  L.forEach((li, i) => {
    if (depth[i] % 2 === 1) {
      let best = -1, bestArea = Infinity
      for (const oi of outers) {
        const outerArea = Math.abs(L[oi].area)
        if (outerArea < Math.abs(li.area)) continue
        if (pointInPoly(li.pts2d[0], L[oi].pts2d) && outerArea < bestArea) {
          best = oi; bestArea = outerArea
        }
      }
      if (best >= 0) holesOf.get(best)!.push(i)
    }
  })

  const plane = { normal: planeNormal, point: planePoint }
  let capTriangles = 0

  for (const oi of outers) {
    const outer = L[oi]
    const holeLoops = holesOf.get(oi)!.map(hi => L[hi].pts3d)
    const outerPts = outer.area >= 0 ? outer.pts3d.slice() : outer.pts3d.slice().reverse()

    let negCap: { pos: Float32Array; nrm: Float32Array }
    let posCap: { pos: Float32Array; nrm: Float32Array }

    if (holeLoops.length === 0) {
      negCap = generateCap(outerPts, { plane, flipped: false })
      posCap = generateCap(outerPts, { plane, flipped: true })
    } else {
      negCap = generateCapWithHoles(outerPts, holeLoops, planeNormal, u, v, planePoint, false)
      posCap = generateCapWithHoles(outerPts, holeLoops, planeNormal, u, v, planePoint, true)
    }

    negative.pushCapData(negCap.pos, negCap.nrm)
    positive.pushCapData(posCap.pos, posCap.nrm)
    capTriangles += negCap.pos.length / 9 + posCap.pos.length / 9
  }

  return capTriangles
}

// ─── Algoritmo principal ────────────────────────────────────────────────────

export function plateCut(
  geometry: THREE.BufferGeometry,
  params: PlateCutParams,
): PlateCutResult {
  const { center, normal: pN, right: pR, up: pU, width: W, height: H } = params

  if (!geometry.boundingSphere) geometry.computeBoundingSphere()
  const scale = geometry.boundingSphere?.radius ?? 1
  const EPS = Math.max(1e-9, scale * 1e-6)

  // 5 planos de corte.
  // Para cada plano, "neg side" = (p − planeP)·planeN ≤ 0 = DENTRO do volume de corte.
  //
  // Plano 0 (corte principal):  planeN = +normal, "neg" = abaixo do plano de corte
  // Plano 1 (borda esquerda):   planeN = −plateRight, "neg" = à direita da borda (dentro da largura)
  // Plano 2 (borda direita):    planeN = +plateRight, "neg" = à esquerda da borda (dentro da largura)
  // Plano 3 (borda inferior):   planeN = −plateUp, "neg" = acima da borda (dentro da altura)
  // Plano 4 (borda superior):   planeN = +plateUp, "neg" = abaixo da borda (dentro da altura)
  const clipPlanes: { n: THREE.Vector3; p: THREE.Vector3 }[] = [
    { n: pN.clone().normalize(),                    p: center.clone() },
    { n: pR.clone().negate().normalize(),            p: center.clone().sub(pR.clone().normalize().multiplyScalar(W / 2)) },
    { n: pR.clone().normalize(),                    p: center.clone().add(pR.clone().normalize().multiplyScalar(W / 2)) },
    { n: pU.clone().negate().normalize(),            p: center.clone().sub(pU.clone().normalize().multiplyScalar(H / 2)) },
    { n: pU.clone().normalize(),                    p: center.clone().add(pU.clone().normalize().multiplyScalar(H / 2)) },
  ]

  const posB = new SideBuilder()
  const negB = new SideBuilder()

  // Segmentos de juntura separados por plano → usados para geração de tampas
  const segFlats: number[][] = [[], [], [], [], []]

  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute
  const nrmAttr = geometry.getAttribute('normal') as THREE.BufferAttribute | null
  const idxAttr = geometry.index
  const triCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3
  const idxA = idxAttr ? (idxAttr.array as ArrayLike<number>) : null
  const tmpFaceN = new THREE.Vector3()
  const va_ = new THREE.Vector3(), vb_ = new THREE.Vector3(), vc_ = new THREE.Vector3()

  const readVtx = (vi: number, faceN: THREE.Vector3): Vtx => {
    const p = new THREE.Vector3(posAttr.getX(vi), posAttr.getY(vi), posAttr.getZ(vi))
    let n: THREE.Vector3
    if (nrmAttr) {
      n = new THREE.Vector3(nrmAttr.getX(vi), nrmAttr.getY(vi), nrmAttr.getZ(vi))
      if (n.lengthSq() < 1e-12) n.copy(faceN)
    } else {
      n = faceN.clone()
    }
    return { p, n }
  }

  for (let f = 0; f < triCount; f++) {
    const i0 = idxA ? idxA[f * 3]     : f * 3
    const i1 = idxA ? idxA[f * 3 + 1] : f * 3 + 1
    const i2 = idxA ? idxA[f * 3 + 2] : f * 3 + 2

    va_.set(posAttr.getX(i0), posAttr.getY(i0), posAttr.getZ(i0))
    vb_.set(posAttr.getX(i1), posAttr.getY(i1), posAttr.getZ(i1))
    vc_.set(posAttr.getX(i2), posAttr.getY(i2), posAttr.getZ(i2))

    tmpFaceN.crossVectors(vb_.clone().sub(va_), vc_.clone().sub(va_))
    if (tmpFaceN.lengthSq() > 1e-20) tmpFaceN.normalize()

    const V: Vtx[] = [readVtx(i0, tmpFaceN), readVtx(i1, tmpFaceN), readVtx(i2, tmpFaceN)]

    // ── Passo 1: clip pelo plano de corte principal ──────────────────────────
    const { neg: below, pos: above, negOn: aboveNegOn } = clipPolyByPlane(
      V, clipPlanes[0].n, clipPlanes[0].p, EPS,
    )

    // Parte acima → sempre vai para o positivo
    posB.pushPoly(above)

    if (below.length < 3) continue

    // Coletar juntura do plano 0 (será refinada abaixo)
    const seg0Before = segFlats[0].length
    collectSeam(below, aboveNegOn, EPS, segFlats[0])
    // Se não coletou nada aqui, pode ser que a juntura seja entre dois vértices on-plane
    // que ainda não foram filtrados pelos planos laterais; será recoletado abaixo.

    // ── Passo 2–5: clip pelos 4 planos laterais ──────────────────────────────
    let current: Vtx[] = below
    let currentNegOn: boolean[] = aboveNegOn

    // Para a juntura do plano 0, precisamos refinar: coletar APENAS a parte
    // que vai acabar no negativo final. Então, reset seg0 e re-coletar depois.
    // Remove o que foi coletado do plano 0 antes de terminar todos os clips.
    segFlats[0].length = seg0Before

    const sideNegOns: boolean[][] = [currentNegOn]

    for (let pi = 1; pi <= 4; pi++) {
      if (current.length < 3) break
      const { neg: inside, pos: outside, negOn: inNegOn } = clipPolyByPlane(
        current, clipPlanes[pi].n, clipPlanes[pi].p, EPS,
      )
      // Parte fora do plano lateral → vai para o positivo
      posB.pushPoly(outside)
      // Coletar juntura do plano lateral
      collectSeam(inside, inNegOn, EPS, segFlats[pi])
      current = inside
      currentNegOn = inNegOn
      sideNegOns.push(inNegOn)
    }

    if (current.length < 3) continue

    // ── Parte final do negative output ───────────────────────────────────────
    negB.pushPoly(current)

    // ── Coletar juntura do plano 0 a partir do polígono final ─────────────────
    // Verificamos quais vértices do polígono final estão sobre o plano 0.
    {
      const m = current.length
      const onPlane0: boolean[] = current.map(vtx => {
        const d = vtx.p.clone().sub(clipPlanes[0].p).dot(clipPlanes[0].n)
        return Math.abs(d) <= EPS * 50
      })
      for (let k = 0; k < m; k++) {
        const k2 = (k + 1) % m
        if (onPlane0[k] && onPlane0[k2]) {
          const a = current[k].p, b = current[k2].p
          if (a.distanceToSquared(b) > EPS * EPS) {
            segFlats[0].push(a.x, a.y, a.z, b.x, b.y, b.z)
          }
        }
      }
    }
  }

  // ── Gerar tampas para cada plano de clip ─────────────────────────────────
  let capTriangles = 0
  for (let pi = 0; pi <= 4; pi++) {
    const loops = buildLoops(segFlats[pi], scale, EPS)
    if (loops.length > 0) {
      capTriangles += buildCapsForPlane(
        loops, clipPlanes[pi].n, clipPlanes[pi].p, posB, negB,
      )
    }
  }

  return {
    positive: posB.toGeometry(),
    negative: negB.toGeometry(),
    capTriangles,
  }
}

// ─── Helper: construir PlateCutParams a partir de posição + quaternion ────────

export function plateCutParamsFromTransform(
  center: THREE.Vector3,
  quaternion: THREE.Quaternion,
  width: number,
  height: number,
): PlateCutParams {
  const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion).normalize()
  const right  = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion).normalize()
  const up     = new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion).normalize()
  return { center, normal, right, up, width, height }
}
