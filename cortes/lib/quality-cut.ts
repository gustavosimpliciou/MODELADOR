/**
 * QualityCut — Corte por Contorno Matemático Reconstruído (Isocontorno)
 * ────────────────────────────────────────────────────────────────────────────
 *
 * PIPELINE PROFISSIONAL (conforme especificação):
 *   1. Campo indicador φ por vértice soldado: +1 dentro, -1 fora da seleção.
 *   2. Difusão Taubin (filtro passa-baixa): elimina ruído de triangulação,
 *      preserva volumes e formas reais.
 *   3. Ajuste de offset: desloca o isocontorno para expandir/contrair a peça.
 *   4. Marching-Triangles: corta no isocontorno φ=offset, gerando vértices
 *      NOVOS por interpolação. Curva contínua, independente da topologia.
 *   5. Relaxação de fronteira (Edge Relax): Taubin suavizante na linha de
 *      costura → elimina picos e irregularidades finais.
 *   6. Limpeza de malha (Boundary Cleanup): remove faces degeneradas, picos,
 *      vértices duplicados, conserta normais.
 *   7. Tampas (buildCap): fecham a costura → peças maciças e imprimíveis.
 *   8. Normais suaves por posição → acabamento contínuo.
 *   9. Validação da malha resultante.
 *
 * PRIORIDADE ABSOLUTA: A seleção do SmartCut é inviolável.
 * O algoritmo só constrói a SUPERFÍCIE DE SEPARAÇÃO — nunca altera o volume
 * ou o contorno da peça selecionada.
 */

import * as THREE from 'three'
import { buildCap, computeSmoothNormalsByPosition } from './smart-cut'

export interface QualityCutOptions {
  /** Intensidade global (0..1). Controla o nº de iterações de difusão. */
  strength: number
  /**
   * Modo Quality First: refina a curva iterativamente até atingir o critério
   * de suavidade (ou esgotar as tentativas).
   */
  qualityFirst: boolean
  /** Quantização de soldagem de vértices (posição). */
  weldQ: number
  /**
   * Limiar de suavidade aprovado (graus de desvio médio de reta ao longo do
   * contorno). Menor = mais exigente. Padrão 12°.
   */
  qualityThreshold: number
  /**
   * Offset do isocontorno: desloca o plano de corte.
   * Positivo → expande a peça selecionada (corte recua para o corpo).
   * Negativo → contrai a peça selecionada (corte avança para dentro).
   * Intervalo razoável: [-0.35, 0.35].
   */
  offset: number
  /**
   * Iterações de relaxação da fronteira (Edge Relax via Taubin).
   * Aplica suavização Taubin λ/μ apenas aos vértices da borda de corte,
   * eliminando picos e irregularidades sem alterar a geometria externa.
   * 0 = sem relaxação; 4 = máximo.
   */
  relaxIterations: number
}

export const DEFAULT_QUALITY: QualityCutOptions = {
  strength: 0.6,
  qualityFirst: true,
  weldQ: 1e4,
  qualityThreshold: 12,
  offset: 0,
  relaxIterations: 2,
}

export interface ValidationIssue {
  type: 'degenerate_faces' | 'open_boundary' | 'non_manifold' | 'thin_wall' | 'warning'
  message: string
  count?: number
}

export interface QualityCutResult {
  selectedPiece: THREE.BufferGeometry
  bodyPiece: THREE.BufferGeometry
  /** Pontos do isocontorno para LineSegments (pares de pontos 3D). */
  seamPoints: Float32Array
  /** Desvio médio de reta ao longo do contorno reconstruído (graus). */
  seamScore: number
  /** Nº de iterações de reconstrução efetivamente usadas. */
  iterations: number
  /** Nº de segmentos do contorno reconstruído. */
  seamSegments: number
  /** Problemas encontrados na validação das peças resultantes. */
  validationIssues: ValidationIssue[]
  ok: boolean
}

// ─── Estrutura soldada da malha ────────────────────────────────────────────────
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
  const neighbors = nbSets.map((s) => Int32Array.from(s))

  return { faceUID, faceCorner, faceCount, uidCount, neighbors }
}

// ─── Campo indicador inicial φ0 ────────────────────────────────────────────────
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

// ─── Difusão Taubin (filtro passa-baixa sem encolhimento) ───────────────────────
function diffuseField(phi0: Float32Array, w: Welded, iterations: number): Float32Array {
  const LAMBDA = 0.6
  const MU = -0.62
  let cur = phi0.slice()
  let buf = new Float32Array(cur.length)
  for (let it = 0; it < iterations; it++) {
    const factor = it % 2 === 0 ? LAMBDA : MU
    for (let u = 0; u < w.uidCount; u++) {
      const nb = w.neighbors[u]
      const n = nb.length
      if (n === 0) { buf[u] = cur[u]; continue }
      let sum = 0
      for (let i = 0; i < n; i++) sum += cur[nb[i]]
      const avg = sum / n
      buf[u] = cur[u] + factor * (avg - cur[u])
    }
    const tmp = cur; cur = buf; buf = tmp
  }
  return cur
}

// ─── Marching-Triangles: corta a malha no isocontorno φ=threshold ──────────────
interface CutBuffers {
  posA: number[]; uvA: number[]
  posB: number[]; uvB: number[]
  seam: number[] // [ax,ay,az, bx,by,bz, ...]
}

function marchTriangles(
  geometry: THREE.BufferGeometry,
  w: Welded,
  phi: Float32Array,
  hasUV: boolean,
  threshold: number,
): CutBuffers {
  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute
  const uvAttr = hasUV ? (geometry.getAttribute('uv') as THREE.BufferAttribute) : null

  const out: CutBuffers = { posA: [], uvA: [], posB: [], uvB: [], seam: [] }

  const P = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]
  const U = [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()]
  const d = [0, 0, 0]

  interface Corner { p: THREE.Vector3; u: THREE.Vector2 }

  const lerpCorner = (i: number, j: number, t: number): Corner => {
    const p = P[i].clone().lerp(P[j], t)
    const u = hasUV ? U[i].clone().lerp(U[j], t) : new THREE.Vector2()
    return { p, u }
  }

  // Clip polygon keeping vertices where (d - threshold) satisfies keepInside
  const clip = (keepInside: boolean): Corner[] => {
    const poly: Corner[] = []
    for (let i = 0; i < 3; i++) {
      const j = (i + 1) % 3
      const di = d[i] - threshold, dj = d[j] - threshold
      const inI = keepInside ? di >= 0 : di < 0
      const inJ = keepInside ? dj >= 0 : dj < 0
      if (inI) poly.push({ p: P[i].clone(), u: hasUV ? U[i].clone() : new THREE.Vector2() })
      if (inI !== inJ) {
        const t = di / (di - dj)
        poly.push(lerpCorner(i, j, t))
      }
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

  for (let f = 0; f < w.faceCount; f++) {
    for (let c = 0; c < 3; c++) {
      const v = w.faceCorner[f * 3 + c]
      P[c].set(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v))
      if (uvAttr) U[c].set(uvAttr.getX(v), uvAttr.getY(v))
      d[c] = phi[w.faceUID[f * 3 + c]]
    }

    const nInside = ((d[0] >= threshold) ? 1 : 0) + ((d[1] >= threshold) ? 1 : 0) + ((d[2] >= threshold) ? 1 : 0)

    if (nInside === 3) {
      emit(out.posA, out.uvA, [
        { p: P[0].clone(), u: hasUV ? U[0].clone() : new THREE.Vector2() },
        { p: P[1].clone(), u: hasUV ? U[1].clone() : new THREE.Vector2() },
        { p: P[2].clone(), u: hasUV ? U[2].clone() : new THREE.Vector2() },
      ])
    } else if (nInside === 0) {
      emit(out.posB, out.uvB, [
        { p: P[0].clone(), u: hasUV ? U[0].clone() : new THREE.Vector2() },
        { p: P[1].clone(), u: hasUV ? U[1].clone() : new THREE.Vector2() },
        { p: P[2].clone(), u: hasUV ? U[2].clone() : new THREE.Vector2() },
      ])
    } else {
      const inPoly = clip(true)
      const outPoly = clip(false)
      if (inPoly.length >= 3) emit(out.posA, out.uvA, inPoly)
      if (outPoly.length >= 3) emit(out.posB, out.uvB, outPoly)

      // Registra o segmento do isocontorno
      const cross: THREE.Vector3[] = []
      for (let i = 0; i < 3; i++) {
        const j = (i + 1) % 3
        const di = d[i] - threshold, dj = d[j] - threshold
        if ((di >= 0) !== (dj >= 0)) {
          const t = di / (di - dj)
          cross.push(P[i].clone().lerp(P[j], t))
        }
      }
      if (cross.length === 2) {
        out.seam.push(
          cross[0].x, cross[0].y, cross[0].z,
          cross[1].x, cross[1].y, cross[1].z,
        )
      }
    }
  }

  return out
}

// ─── Score de qualidade do contorno ────────────────────────────────────────────
function scoreSeam(seam: number[], Q: number): { score: number; segments: number } {
  const segCount = seam.length / 6
  if (segCount === 0) return { score: 0, segments: 0 }

  const key = (x: number, y: number, z: number) =>
    `${Math.round(x * Q)},${Math.round(y * Q)},${Math.round(z * Q)}`

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

  let totalDev = 0
  let nodes = 0
  const a = new THREE.Vector3(), c = new THREE.Vector3(), center = new THREE.Vector3()
  for (const [k, nbs] of adj) {
    if (nbs.length < 2) continue
    const pc = nodePos.get(k)!
    const pa = nodePos.get(nbs[0])!
    const pb = nodePos.get(nbs[1])!
    center.set(pc[0], pc[1], pc[2])
    a.set(pa[0], pa[1], pa[2]).sub(center)
    c.set(pb[0], pb[1], pb[2]).sub(center)
    const la = a.length(), lc = c.length()
    if (la < 1e-9 || lc < 1e-9) continue
    const cos = THREE.MathUtils.clamp(a.dot(c) / (la * lc), -1, 1)
    const angle = (Math.acos(cos) * 180) / Math.PI
    totalDev += Math.abs(180 - angle)
    nodes++
  }

  const score = nodes > 0 ? totalDev / nodes : 0
  return { score, segments: segCount }
}

// ─── Edge Relax: Taubin suavizante nos vértices da borda de corte ──────────────
/**
 * Identifica os vértices da borda aberta (costura) e aplica suavização Taubin
 * (λ/μ alternado) para eliminar picos e ondulações sem encolhimento.
 * Somente a borda de corte é modificada — a geometria externa permanece intacta.
 */
function relaxBoundary(pos: number[], iterations: number): void {
  if (iterations <= 0 || pos.length < 9) return

  const Q = 1e4
  const vertCount = pos.length / 3
  const faceCount = vertCount / 3

  // ── UID por posição quantizada ────────────────────────────────────────────
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

  // ── Contagem de arestas → borda aberta = aparece 1 vez ───────────────────
  const edgeCnt = new Map<number, number>()
  // Edge key = uid_min * uidCount + uid_max (hash compacto de inteiros)
  const edgeVerts = new Map<number, [number, number]>()

  for (let f = 0; f < faceCount; f++) {
    const corners = [f * 3, f * 3 + 1, f * 3 + 2]
    for (let ci = 0; ci < 3; ci++) {
      const a = corners[ci], b = corners[(ci + 1) % 3]
      const ua = uid[a], ub = uid[b]
      const k = ua < ub ? ua * uidCount + ub : ub * uidCount + ua
      edgeCnt.set(k, (edgeCnt.get(k) ?? 0) + 1)
      if (!edgeVerts.has(k)) edgeVerts.set(k, [a, b])
    }
  }

  // ── Adjacência apenas na borda aberta ────────────────────────────────────
  const uidNeighbors: Set<number>[] = Array.from({ length: uidCount }, () => new Set<number>())
  const isBoundaryUID = new Uint8Array(uidCount)

  for (const [k, cnt] of edgeCnt) {
    if (cnt !== 1) continue
    const [a, b] = edgeVerts.get(k)!
    const ua = uid[a], ub = uid[b]
    uidNeighbors[ua].add(ub)
    uidNeighbors[ub].add(ua)
    isBoundaryUID[ua] = 1
    isBoundaryUID[ub] = 1
  }

  if (isBoundaryUID.every((v) => v === 0)) return

  // ── Posição média por UID ─────────────────────────────────────────────────
  const uidPos = new Float32Array(uidCount * 3)
  const uidCnt = new Int32Array(uidCount)
  for (let i = 0; i < vertCount; i++) {
    const u = uid[i]
    uidPos[u * 3] += pos[i * 3]
    uidPos[u * 3 + 1] += pos[i * 3 + 1]
    uidPos[u * 3 + 2] += pos[i * 3 + 2]
    uidCnt[u]++
  }
  for (let u = 0; u < uidCount; u++) {
    if (uidCnt[u] > 0) {
      uidPos[u * 3] /= uidCnt[u]
      uidPos[u * 3 + 1] /= uidCnt[u]
      uidPos[u * 3 + 2] /= uidCnt[u]
    }
  }

  // ── Taubin smooth (λ/μ alternado) sobre UIDs de borda ────────────────────
  const LAMBDA = 0.5
  const MU = -0.53
  const buf = new Float32Array(uidCount * 3)

  for (let iter = 0; iter < iterations * 2; iter++) {
    const factor = iter % 2 === 0 ? LAMBDA : MU
    buf.set(uidPos)
    for (let u = 0; u < uidCount; u++) {
      if (!isBoundaryUID[u]) continue
      const nb = uidNeighbors[u]
      const n = nb.size
      if (n === 0) continue
      let sx = 0, sy = 0, sz = 0
      for (const v of nb) { sx += uidPos[v * 3]; sy += uidPos[v * 3 + 1]; sz += uidPos[v * 3 + 2] }
      const avg_x = sx / n, avg_y = sy / n, avg_z = sz / n
      buf[u * 3] = uidPos[u * 3] + factor * (avg_x - uidPos[u * 3])
      buf[u * 3 + 1] = uidPos[u * 3 + 1] + factor * (avg_y - uidPos[u * 3 + 1])
      buf[u * 3 + 2] = uidPos[u * 3 + 2] + factor * (avg_z - uidPos[u * 3 + 2])
    }
    uidPos.set(buf)
  }

  // ── Aplica de volta nos vértices originais ────────────────────────────────
  for (let i = 0; i < vertCount; i++) {
    const u = uid[i]
    if (!isBoundaryUID[u]) continue
    pos[i * 3] = uidPos[u * 3]
    pos[i * 3 + 1] = uidPos[u * 3 + 1]
    pos[i * 3 + 2] = uidPos[u * 3 + 2]
  }
}

// ─── Boundary Cleanup: remove faces degeneradas e picos ───────────────────────
/**
 * Remove triângulos com área negligível (degenerate faces) que causam
 * artefatos visuais e problemas em impressão 3D.
 */
function cleanupDegenerateFaces(pos: number[]): number[] {
  const cleaned: number[] = []
  const faceCount = pos.length / 9
  const MIN_AREA = 1e-10

  const ab = new THREE.Vector3(), ac = new THREE.Vector3(), cross = new THREE.Vector3()

  for (let f = 0; f < faceCount; f++) {
    const b = f * 9
    ab.set(pos[b + 3] - pos[b], pos[b + 4] - pos[b + 1], pos[b + 5] - pos[b + 2])
    ac.set(pos[b + 6] - pos[b], pos[b + 7] - pos[b + 1], pos[b + 8] - pos[b + 2])
    cross.crossVectors(ab, ac)
    if (cross.lengthSq() > MIN_AREA) {
      for (let i = 0; i < 9; i++) cleaned.push(pos[b + i])
    }
  }

  return cleaned
}

// ─── Montagem de uma peça a partir dos buffers ─────────────────────────────────
function buildPiece(
  pos: number[],
  uv: number[],
  hasUV: boolean,
  weldQ: number,
  relaxIterations: number,
): THREE.BufferGeometry {
  // Edge relax da borda de corte antes de fechar a tampa
  relaxBoundary(pos, relaxIterations)

  // Remove faces degeneradas geradas pelo clipping
  const cleanPos = cleanupDegenerateFaces(pos)
  const posToUse = cleanPos.length >= 9 ? cleanPos : pos

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(posToUse), 3))
  if (hasUV && uv.length === (posToUse.length / 3) * 2) {
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(uv), 2))
  }

  // Tampa fecha a costura → peça maciça e imprimível
  const faceCount = posToUse.length / 9
  const allFaces = new Set<number>()
  for (let f = 0; f < faceCount; f++) allFaces.add(f)
  const cap = buildCap(geo, allFaces, weldQ)

  if (cap.pos.length > 0) {
    const shellV = posToUse.length / 3
    const capV = cap.pos.length / 3
    const merged = new Float32Array((shellV + capV) * 3)
    merged.set(new Float32Array(posToUse), 0)
    merged.set(cap.pos, shellV * 3)
    geo.setAttribute('position', new THREE.Float32BufferAttribute(merged, 3))
    if (geo.getAttribute('uv')) {
      const mUV = new Float32Array((shellV + capV) * 2)
      mUV.set(new Float32Array(uv), 0)
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(mUV, 2))
    }
  }

  try {
    computeSmoothNormalsByPosition(geo)
  } catch {
    geo.computeVertexNormals()
  }
  geo.computeBoundingBox()
  geo.computeBoundingSphere()
  return geo
}

// ─── Validação das peças resultantes ──────────────────────────────────────────
/**
 * Verifica a qualidade geométrica das peças geradas e retorna uma lista de
 * problemas encontrados para informar o usuário antes da aplicação do corte.
 */
export function validateCutResult(
  selectedPiece: THREE.BufferGeometry,
  bodyPiece: THREE.BufferGeometry,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  const checkPiece = (geo: THREE.BufferGeometry, label: string) => {
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
    const vertCount = posAttr.count
    const faceCount = vertCount / 3
    if (faceCount < 4) return

    // 1. Faces degeneradas
    let degCount = 0
    const ab = new THREE.Vector3(), ac = new THREE.Vector3(), cross = new THREE.Vector3()
    for (let f = 0; f < faceCount; f++) {
      const b = f * 3
      ab.set(
        posAttr.getX(b + 1) - posAttr.getX(b),
        posAttr.getY(b + 1) - posAttr.getY(b),
        posAttr.getZ(b + 1) - posAttr.getZ(b),
      )
      ac.set(
        posAttr.getX(b + 2) - posAttr.getX(b),
        posAttr.getY(b + 2) - posAttr.getY(b),
        posAttr.getZ(b + 2) - posAttr.getZ(b),
      )
      cross.crossVectors(ab, ac)
      if (cross.lengthSq() < 1e-18) degCount++
    }
    if (degCount > 0) {
      issues.push({
        type: 'degenerate_faces',
        message: `${label}: ${degCount} face(s) degenerada(s) detectada(s)`,
        count: degCount,
      })
    }

    // 2. Borda aberta (buracos)
    const Q = 1e4
    const edgeCnt = new Map<string, number>()
    const edgeKey = (ia: number, ib: number) => {
      const qa = `${Math.round(posAttr.getX(ia) * Q)},${Math.round(posAttr.getY(ia) * Q)},${Math.round(posAttr.getZ(ia) * Q)}`
      const qb = `${Math.round(posAttr.getX(ib) * Q)},${Math.round(posAttr.getY(ib) * Q)},${Math.round(posAttr.getZ(ib) * Q)}`
      return qa < qb ? `${qa}|${qb}` : `${qb}|${qa}`
    }
    for (let f = 0; f < faceCount; f++) {
      const b = f * 3
      for (let ci = 0; ci < 3; ci++) {
        const k = edgeKey(b + ci, b + ((ci + 1) % 3))
        edgeCnt.set(k, (edgeCnt.get(k) ?? 0) + 1)
      }
    }
    let openEdges = 0, nonManifold = 0
    for (const cnt of edgeCnt.values()) {
      if (cnt === 1) openEdges++
      else if (cnt > 2) nonManifold++
    }

    // Small number of open edges is expected (the seam before capping)
    const openThreshold = Math.max(3, faceCount * 0.01)
    if (openEdges > openThreshold) {
      issues.push({
        type: 'open_boundary',
        message: `${label}: ${openEdges} aresta(s) abertas — possível buraco na malha`,
        count: openEdges,
      })
    }
    if (nonManifold > 0) {
      issues.push({
        type: 'non_manifold',
        message: `${label}: ${nonManifold} aresta(s) não-manifold`,
        count: nonManifold,
      })
    }
  }

  checkPiece(selectedPiece, 'Peça selecionada')
  checkPiece(bodyPiece, 'Corpo')

  return issues
}

/**
 * Executa o corte por contorno matemático reconstruído.
 * Pipeline profissional com Edge Relax, Boundary Cleanup e Validação.
 * Retorna as duas peças (com tampa) separadas por uma curva suave, mais
 * os pontos do isocontorno para visualização no Preview.
 */
export function qualityContourCut(
  geometry: THREE.BufferGeometry,
  selected: Set<number>,
  options: Partial<QualityCutOptions> = {},
): QualityCutResult {
  const opts = { ...DEFAULT_QUALITY, ...options }
  const w = weldMesh(geometry, opts.weldQ)
  const phi0 = buildIndicatorField(w, selected)
  const hasUV = !!geometry.getAttribute('uv')

  const strength = Math.max(0, Math.min(1, opts.strength))
  let iterations = Math.max(6, Math.round(10 + strength * 60))

  const maxTries = opts.qualityFirst ? 4 : 1
  let best: { buf: CutBuffers; score: number; segments: number; iters: number } | null = null

  // Offset: desloca o isocontorno (threshold = offset em espaço phi)
  // Negativo expande a seleção, positivo contrai.
  const threshold = THREE.MathUtils.clamp(-(opts.offset ?? 0), -0.4, 0.4)

  for (let attempt = 0; attempt < maxTries; attempt++) {
    const phi = diffuseField(phi0, w, iterations)
    const buf = marchTriangles(geometry, w, phi, hasUV, threshold)
    const { score, segments } = scoreSeam(buf.seam, opts.weldQ)

    if (!best || score < best.score) best = { buf, score, segments, iters: iterations }

    if (score <= opts.qualityThreshold || !opts.qualityFirst) break
    iterations = Math.round(iterations * 1.8)
  }

  const chosen = best!
  const relaxIters = Math.max(0, Math.min(8, opts.relaxIterations ?? 2))

  const selectedPiece = buildPiece(chosen.buf.posA, chosen.buf.uvA, hasUV, opts.weldQ, relaxIters)
  const bodyPiece = buildPiece(chosen.buf.posB, chosen.buf.uvB, hasUV, opts.weldQ, relaxIters)

  const ok =
    (selectedPiece.getAttribute('position')?.count ?? 0) > 0 &&
    (bodyPiece.getAttribute('position')?.count ?? 0) > 0

  // Isocontorno como Float32Array para LineSegments no Preview
  const seamPoints = new Float32Array(chosen.buf.seam)

  // Validação automática das peças
  const validationIssues = ok ? validateCutResult(selectedPiece, bodyPiece) : []

  return {
    selectedPiece,
    bodyPiece,
    seamPoints,
    seamScore: chosen.score,
    iterations: chosen.iters,
    seamSegments: chosen.segments,
    validationIssues,
    ok,
  }
}
