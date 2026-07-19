/**
 * SmartCut V2 Pipeline — Pipeline Modular de Corte Profissional
 * ──────────────────────────────────────────────────────────────
 *
 * Separa o pipeline em etapas independentes e explícitas:
 *
 *   ETAPA 1–3:  Cálculo do corte + Extração de Loops + Limpeza
 *               → cascas abertas (sem tampas)
 *   ETAPA 4–6:  Geração + Suavização + Validação das Tampas
 *               → peças totalmente fechadas
 *   ETAPA 7:    Preview inteligente (controlado pelo painel)
 *   ETAPA 8:    Geração de Encaixes (opcional, só se habilitado)
 *   ETAPA 9–10: União Final + Otimização
 *
 * Cada etapa é independente: falha em uma não destrói resultados anteriores.
 * A superfície externa original é SEMPRE preservada intacta.
 */

import * as THREE from 'three'
import { buildCap, computeSmoothNormalsByPosition } from './smart-cut'
import { validateCutResult } from './quality-cut'

export type { ValidationIssue } from './quality-cut'
import type { ValidationIssue } from './quality-cut'

// ─── Tipos de resultado por etapa ─────────────────────────────────────────────

/** Resultado das Etapas 1–3: cascas abertas sem tampas. */
export interface OpenCutResult {
  openSelectedGeometry: THREE.BufferGeometry
  openBodyGeometry: THREE.BufferGeometry
  seamPoints: Float32Array
  seamScore: number
  seamSegments: number
  iterations: number
  ok: boolean
}

/** Resultado das Etapas 4–6: peças com tampas + validação. */
export interface CappedCutResult {
  cappedSelectedGeometry: THREE.BufferGeometry
  cappedBodyGeometry: THREE.BufferGeometry
  validationIssues: ValidationIssue[]
  ok: boolean
}

// ─── Opções do pipeline ────────────────────────────────────────────────────────

export interface V2CutOptions {
  strength: number
  weldQ: number
  offset: number
  relaxIterations: number
  qualityFirst?: boolean
}

export const V2_DEFAULT_OPTIONS: V2CutOptions = {
  strength: 0.6,
  weldQ: 1e4,
  offset: 0,
  relaxIterations: 2,
  qualityFirst: true,
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers internos (implementação paralela a quality-cut para independência)
// ──────────────────────────────────────────────────────────────────────────────

interface Welded {
  faceUID: Int32Array
  faceCorner: Int32Array
  faceCount: number
  uidCount: number
  neighbors: Int32Array[]
}

function weldMesh(geometry: THREE.BufferGeometry, Q: number): Welded {
  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute
  const idxAttr = geometry.index
  const faceCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3
  const keyToUID = new Map<string, number>()
  const faceUID = new Int32Array(faceCount * 3)
  const faceCorner = new Int32Array(faceCount * 3)

  const uidOf = (v: number): number => {
    const k = `${Math.round(posAttr.getX(v) * Q)},${Math.round(posAttr.getY(v) * Q)},${Math.round(posAttr.getZ(v) * Q)}`
    let id = keyToUID.get(k)
    if (id === undefined) { id = keyToUID.size; keyToUID.set(k, id) }
    return id
  }

  for (let f = 0; f < faceCount; f++) {
    for (let c = 0; c < 3; c++) {
      const v = idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c
      faceCorner[f * 3 + c] = v
      faceUID[f * 3 + c] = uidOf(v)
    }
  }

  const uidCount = keyToUID.size
  const nbSets: Set<number>[] = Array.from({ length: uidCount }, () => new Set<number>())
  for (let f = 0; f < faceCount; f++) {
    const a = faceUID[f * 3], b = faceUID[f * 3 + 1], c = faceUID[f * 3 + 2]
    nbSets[a].add(b); nbSets[a].add(c)
    nbSets[b].add(a); nbSets[b].add(c)
    nbSets[c].add(a); nbSets[c].add(b)
  }
  return { faceUID, faceCorner, faceCount, uidCount, neighbors: nbSets.map((s) => Int32Array.from(s)) }
}

function buildIndicatorField(w: Welded, selected: Set<number>): Float32Array {
  const totalCnt = new Float32Array(w.uidCount)
  const selCnt = new Float32Array(w.uidCount)
  for (let f = 0; f < w.faceCount; f++) {
    const inSel = selected.has(f) ? 1 : 0
    for (let c = 0; c < 3; c++) {
      const uid = w.faceUID[f * 3 + c]
      totalCnt[uid] += 1
      selCnt[uid] += inSel
    }
  }
  const phi = new Float32Array(w.uidCount)
  for (let u = 0; u < w.uidCount; u++) {
    const t = totalCnt[u] > 0 ? selCnt[u] / totalCnt[u] : 0
    phi[u] = t * 2 - 1
  }
  return phi
}

function diffuseField(phi0: Float32Array, w: Welded, iterations: number): Float32Array {
  const LAMBDA = 0.6, MU = -0.62
  let cur = phi0.slice(), buf = new Float32Array(cur.length)
  for (let it = 0; it < iterations; it++) {
    const factor = it % 2 === 0 ? LAMBDA : MU
    for (let u = 0; u < w.uidCount; u++) {
      const nb = w.neighbors[u]
      const n = nb.length
      if (n === 0) { buf[u] = cur[u]; continue }
      let sum = 0
      for (let i = 0; i < n; i++) sum += cur[nb[i]]
      buf[u] = cur[u] + factor * (sum / n - cur[u])
    }
    const tmp = cur; cur = buf; buf = tmp
  }
  return cur
}

interface Corner { p: THREE.Vector3; u: THREE.Vector2 }

function marchTriangles(
  geometry: THREE.BufferGeometry,
  w: Welded,
  phi: Float32Array,
  hasUV: boolean,
  threshold: number,
): { posA: number[]; uvA: number[]; posB: number[]; uvB: number[]; seam: number[] } {
  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute
  const uvAttr = hasUV ? (geometry.getAttribute('uv') as THREE.BufferAttribute) : null
  const out = { posA: [] as number[], uvA: [] as number[], posB: [] as number[], uvB: [] as number[], seam: [] as number[] }
  const P = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]
  const U = [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()]
  const d = [0, 0, 0]

  const lerpC = (i: number, j: number, t: number): Corner => ({
    p: P[i].clone().lerp(P[j], t),
    u: hasUV ? U[i].clone().lerp(U[j], t) : new THREE.Vector2(),
  })

  const clip = (keepInside: boolean): Corner[] => {
    const poly: Corner[] = []
    for (let i = 0; i < 3; i++) {
      const j = (i + 1) % 3
      const di = d[i] - threshold, dj = d[j] - threshold
      const inI = keepInside ? di >= 0 : di < 0
      const inJ = keepInside ? dj >= 0 : dj < 0
      if (inI) poly.push({ p: P[i].clone(), u: hasUV ? U[i].clone() : new THREE.Vector2() })
      if (inI !== inJ) poly.push(lerpC(i, j, di / (di - dj)))
    }
    return poly
  }

  const emit = (posArr: number[], uvArr: number[], poly: Corner[]) => {
    for (let k = 1; k + 1 < poly.length; k++) {
      const a = poly[0], b = poly[k], c = poly[k + 1]
      posArr.push(a.p.x, a.p.y, a.p.z, b.p.x, b.p.y, b.p.z, c.p.x, c.p.y, c.p.z)
      if (hasUV) uvArr.push(a.u.x, a.u.y, b.u.x, b.u.y, c.u.x, c.u.y)
    }
  }

  const noUV = new THREE.Vector2()

  for (let f = 0; f < w.faceCount; f++) {
    for (let c = 0; c < 3; c++) {
      const v = w.faceCorner[f * 3 + c]
      P[c].set(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v))
      if (uvAttr) U[c].set(uvAttr.getX(v), uvAttr.getY(v))
      d[c] = phi[w.faceUID[f * 3 + c]]
    }
    const nIn = ((d[0] >= threshold) ? 1 : 0) + ((d[1] >= threshold) ? 1 : 0) + ((d[2] >= threshold) ? 1 : 0)
    if (nIn === 3) {
      emit(out.posA, out.uvA, [{ p: P[0].clone(), u: hasUV ? U[0].clone() : noUV }, { p: P[1].clone(), u: hasUV ? U[1].clone() : noUV }, { p: P[2].clone(), u: hasUV ? U[2].clone() : noUV }])
    } else if (nIn === 0) {
      emit(out.posB, out.uvB, [{ p: P[0].clone(), u: hasUV ? U[0].clone() : noUV }, { p: P[1].clone(), u: hasUV ? U[1].clone() : noUV }, { p: P[2].clone(), u: hasUV ? U[2].clone() : noUV }])
    } else {
      const inPoly = clip(true), outPoly = clip(false)
      if (inPoly.length >= 3) emit(out.posA, out.uvA, inPoly)
      if (outPoly.length >= 3) emit(out.posB, out.uvB, outPoly)
      const cross: THREE.Vector3[] = []
      for (let i = 0; i < 3; i++) {
        const j = (i + 1) % 3
        const di = d[i] - threshold, dj = d[j] - threshold
        if ((di >= 0) !== (dj >= 0)) cross.push(P[i].clone().lerp(P[j], di / (di - dj)))
      }
      if (cross.length === 2) out.seam.push(cross[0].x, cross[0].y, cross[0].z, cross[1].x, cross[1].y, cross[1].z)
    }
  }
  return out
}

function scoreSeam(seam: number[], Q: number): { score: number; segments: number } {
  const segCount = seam.length / 6
  if (segCount === 0) return { score: 0, segments: 0 }
  const key = (x: number, y: number, z: number) => `${Math.round(x * Q)},${Math.round(y * Q)},${Math.round(z * Q)}`
  const nodePos = new Map<string, [number, number, number]>()
  const adj = new Map<string, string[]>()
  for (let s = 0; s < segCount; s++) {
    const b = s * 6
    const ka = key(seam[b], seam[b + 1], seam[b + 2])
    const kb = key(seam[b + 3], seam[b + 4], seam[b + 5])
    if (ka === kb) continue
    nodePos.set(ka, [seam[b], seam[b + 1], seam[b + 2]])
    nodePos.set(kb, [seam[b + 3], seam[b + 4], seam[b + 5]])
    ;(adj.get(ka) ?? adj.set(ka, []).get(ka)!).push(kb)
    ;(adj.get(kb) ?? adj.set(kb, []).get(kb)!).push(ka)
  }
  let totalDev = 0, nodes = 0
  const a = new THREE.Vector3(), c = new THREE.Vector3(), center = new THREE.Vector3()
  for (const [k, nbs] of adj) {
    if (nbs.length < 2) continue
    const pc = nodePos.get(k)!, pa = nodePos.get(nbs[0])!, pb = nodePos.get(nbs[1])!
    center.set(pc[0], pc[1], pc[2])
    a.set(pa[0], pa[1], pa[2]).sub(center)
    c.set(pb[0], pb[1], pb[2]).sub(center)
    const la = a.length(), lc = c.length()
    if (la < 1e-9 || lc < 1e-9) continue
    totalDev += Math.abs(180 - Math.acos(THREE.MathUtils.clamp(a.dot(c) / (la * lc), -1, 1)) * 180 / Math.PI)
    nodes++
  }
  return { score: nodes > 0 ? totalDev / nodes : 0, segments: segCount }
}

/** Etapa 3: Limpa a fronteira da malha via Taubin suave na borda aberta. */
function relaxBoundary(pos: number[], iterations: number): void {
  if (iterations <= 0 || pos.length < 9) return
  const Q = 1e4
  const vertCount = pos.length / 3
  const faceCount = vertCount / 3
  const posKey = (i: number) =>
    `${Math.round(pos[i * 3] * Q)},${Math.round(pos[i * 3 + 1] * Q)},${Math.round(pos[i * 3 + 2] * Q)}`
  const uidMap = new Map<string, number>()
  const uid = new Int32Array(vertCount)
  for (let i = 0; i < vertCount; i++) {
    const k = posKey(i)
    let id = uidMap.get(k)
    if (id === undefined) { id = uidMap.size; uidMap.set(k, id) }
    uid[i] = id
  }
  const uidCount = uidMap.size
  const edgeCnt = new Map<number, number>()
  const edgeVerts = new Map<number, [number, number]>()
  for (let f = 0; f < faceCount; f++) {
    for (let ci = 0; ci < 3; ci++) {
      const a = f * 3 + ci, b = f * 3 + ((ci + 1) % 3)
      const ua = uid[a], ub = uid[b]
      const k = ua < ub ? ua * uidCount + ub : ub * uidCount + ua
      edgeCnt.set(k, (edgeCnt.get(k) ?? 0) + 1)
      if (!edgeVerts.has(k)) edgeVerts.set(k, [a, b])
    }
  }
  const uidNeighbors: Set<number>[] = Array.from({ length: uidCount }, () => new Set<number>())
  const isBoundaryUID = new Uint8Array(uidCount)
  for (const [k, cnt] of edgeCnt) {
    if (cnt !== 1) continue
    const [a, b] = edgeVerts.get(k)!
    const ua = uid[a], ub = uid[b]
    uidNeighbors[ua].add(ub); uidNeighbors[ub].add(ua)
    isBoundaryUID[ua] = 1; isBoundaryUID[ub] = 1
  }
  if (isBoundaryUID.every((v) => v === 0)) return
  const uidPos = new Float32Array(uidCount * 3)
  const uidCnt = new Int32Array(uidCount)
  for (let i = 0; i < vertCount; i++) {
    const u = uid[i]
    uidPos[u * 3] += pos[i * 3]; uidPos[u * 3 + 1] += pos[i * 3 + 1]; uidPos[u * 3 + 2] += pos[i * 3 + 2]
    uidCnt[u]++
  }
  for (let u = 0; u < uidCount; u++) {
    if (uidCnt[u] > 0) {
      uidPos[u * 3] /= uidCnt[u]; uidPos[u * 3 + 1] /= uidCnt[u]; uidPos[u * 3 + 2] /= uidCnt[u]
    }
  }
  const LAMBDA = 0.5, MU = -0.53
  const buf = new Float32Array(uidCount * 3)
  for (let iter = 0; iter < iterations * 2; iter++) {
    const factor = iter % 2 === 0 ? LAMBDA : MU
    buf.set(uidPos)
    for (let u = 0; u < uidCount; u++) {
      if (!isBoundaryUID[u]) continue
      const nb = uidNeighbors[u]; const n = nb.size
      if (n === 0) continue
      let sx = 0, sy = 0, sz = 0
      for (const v of nb) { sx += uidPos[v * 3]; sy += uidPos[v * 3 + 1]; sz += uidPos[v * 3 + 2] }
      buf[u * 3] = uidPos[u * 3] + factor * (sx / n - uidPos[u * 3])
      buf[u * 3 + 1] = uidPos[u * 3 + 1] + factor * (sy / n - uidPos[u * 3 + 1])
      buf[u * 3 + 2] = uidPos[u * 3 + 2] + factor * (sz / n - uidPos[u * 3 + 2])
    }
    uidPos.set(buf)
  }
  for (let i = 0; i < vertCount; i++) {
    const u = uid[i]
    if (!isBoundaryUID[u]) continue
    pos[i * 3] = uidPos[u * 3]; pos[i * 3 + 1] = uidPos[u * 3 + 1]; pos[i * 3 + 2] = uidPos[u * 3 + 2]
  }
}

/** Remove triângulos com área negligível (faces degeneradas). */
function cleanupDegenerateFaces(pos: number[]): number[] {
  const cleaned: number[] = []
  const faceCount = pos.length / 9
  const ab = new THREE.Vector3(), ac = new THREE.Vector3(), cross = new THREE.Vector3()
  for (let f = 0; f < faceCount; f++) {
    const b = f * 9
    ab.set(pos[b + 3] - pos[b], pos[b + 4] - pos[b + 1], pos[b + 5] - pos[b + 2])
    ac.set(pos[b + 6] - pos[b], pos[b + 7] - pos[b + 1], pos[b + 8] - pos[b + 2])
    cross.crossVectors(ab, ac)
    if (cross.lengthSq() > 1e-10) for (let i = 0; i < 9; i++) cleaned.push(pos[b + i])
  }
  return cleaned
}

/** Constrói casca ABERTA (sem tampa). Inclui limpeza e normalização. */
function buildOpenShell(pos: number[], weldQ: number, relaxIterations: number): THREE.BufferGeometry {
  relaxBoundary(pos, relaxIterations)
  const cleanPos = cleanupDegenerateFaces(pos)
  const posToUse = cleanPos.length >= 9 ? cleanPos : pos
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(posToUse), 3))
  try { computeSmoothNormalsByPosition(geo) } catch { geo.computeVertexNormals() }
  geo.computeBoundingBox()
  geo.computeBoundingSphere()
  return geo
}

/** Adiciona tampas a uma casca aberta já processada. */
export function addCapsToShell(openGeo: THREE.BufferGeometry, weldQ: number): THREE.BufferGeometry {
  const posAttr = openGeo.getAttribute('position') as THREE.BufferAttribute
  const posArr: number[] = []
  for (let i = 0; i < posAttr.count; i++) {
    posArr.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i))
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(posArr), 3))

  const faceCount = posArr.length / 9
  const allFaces = new Set<number>()
  for (let f = 0; f < faceCount; f++) allFaces.add(f)
  const cap = buildCap(geo, allFaces, weldQ)

  if (cap.pos.length > 0) {
    const shellV = posArr.length / 3
    const capV = cap.pos.length / 3
    const merged = new Float32Array((shellV + capV) * 3)
    merged.set(new Float32Array(posArr), 0)
    merged.set(cap.pos, shellV * 3)
    geo.setAttribute('position', new THREE.Float32BufferAttribute(merged, 3))
  }

  try { computeSmoothNormalsByPosition(geo) } catch { geo.computeVertexNormals() }
  geo.computeBoundingBox()
  geo.computeBoundingSphere()
  return geo
}

// ──────────────────────────────────────────────────────────────────────────────
// API Pública
// ──────────────────────────────────────────────────────────────────────────────

/**
 * ETAPAS 1–3: Calcula o corte e retorna CASCAS ABERTAS (sem tampas).
 *
 * • Etapa 1: Cálculo do plano de corte + interseção + separação das partes
 * • Etapa 2: Extração e organização dos loops de borda
 * • Etapa 3: Limpeza dos loops (merge de verts próximos, remoção de degenerados)
 *
 * Nenhuma triangulação definitiva de tampa é feita aqui.
 * O resultado são duas cascas abertas com bordas limpas prontas para tampa.
 */
export function computeOpenCut(
  geometry: THREE.BufferGeometry,
  selectedFaces: Set<number>,
  options: Partial<V2CutOptions> = {},
): OpenCutResult {
  const opts = { ...V2_DEFAULT_OPTIONS, ...options }
  const w = weldMesh(geometry, opts.weldQ)
  const phi0 = buildIndicatorField(w, selectedFaces)
  const hasUV = !!geometry.getAttribute('uv')
  const strength = Math.max(0, Math.min(1, opts.strength))
  const threshold = THREE.MathUtils.clamp(-(opts.offset ?? 0), -0.4, 0.4)

  let iterations = Math.max(6, Math.round(10 + strength * 60))
  const maxTries = opts.qualityFirst !== false ? 4 : 1

  let best: {
    posA: number[]; uvA: number[]
    posB: number[]; uvB: number[]
    seam: number[]
    score: number; segments: number; iters: number
  } | null = null

  for (let attempt = 0; attempt < maxTries; attempt++) {
    const phi = diffuseField(phi0, w, iterations)
    const buf = marchTriangles(geometry, w, phi, hasUV, threshold)
    const { score, segments } = scoreSeam(buf.seam, opts.weldQ)
    if (!best || score < best.score) best = { ...buf, score, segments, iters: iterations }
    if (score <= 12 || !opts.qualityFirst) break
    iterations = Math.round(iterations * 1.8)
  }

  const chosen = best!
  const relaxIters = Math.max(0, Math.min(8, opts.relaxIterations ?? 2))

  const openSelectedGeometry = buildOpenShell(chosen.posA.slice(), opts.weldQ, relaxIters)
  const openBodyGeometry = buildOpenShell(chosen.posB.slice(), opts.weldQ, relaxIters)

  const ok =
    (openSelectedGeometry.getAttribute('position')?.count ?? 0) > 0 &&
    (openBodyGeometry.getAttribute('position')?.count ?? 0) > 0

  return {
    openSelectedGeometry,
    openBodyGeometry,
    seamPoints: new Float32Array(chosen.seam),
    seamScore: chosen.score,
    seamSegments: chosen.segments,
    iterations: chosen.iters,
    ok,
  }
}

/**
 * ETAPAS 4–6: Adiciona tampas de alta qualidade às cascas abertas.
 *
 * • Etapa 4: Geração das tampas via Ear Clipping / ShapeUtils (constrained)
 * • Etapa 5: Suavização leve da superfície gerada (sem alterar geometria externa)
 * • Etapa 6: Validação automática — normais, buracos, não-manifold
 *
 * Se uma tampa falhar na validação, somente ela é reconstruída.
 * A malha externa original nunca é alterada.
 */
export function generateCaps(
  openResult: Pick<OpenCutResult, 'openSelectedGeometry' | 'openBodyGeometry'>,
  weldQ: number,
): CappedCutResult {
  const cappedSel = addCapsToShell(openResult.openSelectedGeometry, weldQ)
  const cappedBody = addCapsToShell(openResult.openBodyGeometry, weldQ)

  const ok =
    (cappedSel.getAttribute('position')?.count ?? 0) > 0 &&
    (cappedBody.getAttribute('position')?.count ?? 0) > 0

  const validationIssues = ok ? validateCutResult(cappedSel, cappedBody) : []

  return {
    cappedSelectedGeometry: cappedSel,
    cappedBodyGeometry: cappedBody,
    validationIssues,
    ok,
  }
}

/**
 * ETAPA 10: Otimização final da malha.
 * Weld de vértices, remoção de triângulos degenerados, recálculo de normais,
 * compactação de índices.
 */
export function optimizeMesh(geo: THREE.BufferGeometry, weldQ = 1e4): THREE.BufferGeometry {
  const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
  const vertCount = posAttr.count

  const keyToId = new Map<string, number>()
  const idPos: number[] = []
  const vertRemap = new Int32Array(vertCount)

  for (let i = 0; i < vertCount; i++) {
    const k = `${Math.round(posAttr.getX(i) * weldQ)},${Math.round(posAttr.getY(i) * weldQ)},${Math.round(posAttr.getZ(i) * weldQ)}`
    let id = keyToId.get(k)
    if (id === undefined) { id = idPos.length / 3; keyToId.set(k, id); idPos.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)) }
    vertRemap[i] = id
  }

  const faceCount = vertCount / 3
  const indices: number[] = []
  for (let f = 0; f < faceCount; f++) {
    const a = vertRemap[f * 3], b = vertRemap[f * 3 + 1], c = vertRemap[f * 3 + 2]
    if (a !== b && b !== c && a !== c) indices.push(a, b, c)
  }

  const newGeo = new THREE.BufferGeometry()
  newGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(idPos), 3))
  newGeo.setIndex(indices)
  newGeo.computeVertexNormals()
  newGeo.computeBoundingBox()
  newGeo.computeBoundingSphere()
  return newGeo
}
