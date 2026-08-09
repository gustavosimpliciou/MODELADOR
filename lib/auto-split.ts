/**
 * Auto Split Engine — Sugestão automática de cortes por geometria
 * ---------------------------------------------------------------
 * Analisa a malha e sugere planos de corte nas SEÇÕES TRANSVERSAIS MÍNIMAS
 * (pescoços / junções naturais), onde a costura de impressão fica discreta e
 * a peça é fisicamente mais fácil de dividir.
 *
 * Pipeline:
 *   1. Escolhe o eixo de corte (automático = eixo mais longo).
 *   2. Varre a bounding box em N fatias e estima a área da seção transversal
 *      de cada fatia (envelope varrido dos triângulos que a cruzam).
 *   3. Suaviza o perfil e detecta vales (mínimos locais de área).
 *   4. Classifica os vales por "proeminência" (quão profundo é o pescoço) e
 *      seleciona os melhores respeitando separação mínima e sensibilidade.
 *   5. Para cada corte, calcula o centro sólido da seção (para posicionar os
 *      pinos de alinhamento) e a meia-extensão perpendicular.
 *
 * O corte físico watertight reaproveita `solidPlaneCut`.
 */

import * as THREE from 'three'
import { solidPlaneCut } from './solid-plane-cut'

export type SplitAxis = 'x' | 'y' | 'z'

export interface SplitCut {
  /** Posição normalizada 0..1 ao longo do eixo na bounding box original. */
  offset: number
  /** Coordenada do plano no espaço local da geometria. */
  coord: number
  /** Área estimada da seção transversal (unidades²). */
  area: number
  /** Proeminência normalizada 0..1 (profundidade relativa do pescoço). */
  prominence: number
  /** Centro sólido da seção no espaço local — usado para posicionar pinos. */
  center: [number, number, number]
  /** Meia-extensão da seção nos dois eixos perpendiculares. */
  halfU: number
  halfV: number
}

export interface AxisProfilePoint {
  coord: number
  area: number
}

export interface AutoSplitPlan {
  axis: SplitAxis
  /** Normal do plano de corte (eixo unitário) no espaço local. */
  normal: [number, number, number]
  cuts: SplitCut[]
  profile: AxisProfilePoint[]
  maxArea: number
}

export interface AutoSplitOptions {
  axis: SplitAxis | 'auto'
  /** Número máximo de cortes sugeridos. */
  maxCuts: number
  /** 0..1 — quanto maior, mais cortes (pescoços mais sutis são aceitos). */
  sensitivity: number
  /** Número de fatias amostradas ao longo do eixo. */
  samples?: number
}

const PERP: Record<SplitAxis, [SplitAxis, SplitAxis]> = {
  x: ['y', 'z'],
  y: ['x', 'z'],
  z: ['x', 'y'],
}
const AXIS_IDX: Record<SplitAxis, 0 | 1 | 2> = { x: 0, y: 1, z: 2 }

function comp(attr: THREE.BufferAttribute, i: number, c: 0 | 1 | 2): number {
  return c === 0 ? attr.getX(i) : c === 1 ? attr.getY(i) : attr.getZ(i)
}

/** Retorna o eixo com a maior extensão da bounding box. */
export function pickLongestAxis(bbox: THREE.Box3): SplitAxis {
  const s = new THREE.Vector3()
  bbox.getSize(s)
  if (s.x >= s.y && s.x >= s.z) return 'x'
  if (s.y >= s.x && s.y >= s.z) return 'y'
  return 'z'
}

/**
 * Analisa a geometria e devolve um plano de cortes sugeridos.
 */
export function planAutoSplit(
  geometry: THREE.BufferGeometry,
  opts: AutoSplitOptions,
): AutoSplitPlan {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  if (!geometry.boundingBox) geometry.computeBoundingBox()
  const bbox = geometry.boundingBox!.clone()

  const axis = opts.axis === 'auto' ? pickLongestAxis(bbox) : opts.axis
  const ai = AXIS_IDX[axis]
  const [ua, va] = PERP[axis]
  const ui = AXIS_IDX[ua]
  const vi = AXIS_IDX[va]

  const size = new THREE.Vector3()
  bbox.getSize(size)
  const axisMin = comp3(bbox.min, ai)
  const axisLen = size.getComponent(ai) || 1

  const samples = Math.max(48, Math.min(opts.samples ?? 220, 400))

  // Envelope perpendicular varrido por triângulo (silhueta do sólido por fatia)
  const uMinB = new Float64Array(samples).fill(Infinity)
  const uMaxB = new Float64Array(samples).fill(-Infinity)
  const vMinB = new Float64Array(samples).fill(Infinity)
  const vMaxB = new Float64Array(samples).fill(-Infinity)
  // Centroide sólido por fatia (média dos vértices)
  const sumU = new Float64Array(samples)
  const sumV = new Float64Array(samples)
  const cnt = new Float64Array(samples)

  const idx = geometry.index
  const triCount = idx ? idx.count / 3 : pos.count / 3
  const idxArr = idx ? (idx.array as ArrayLike<number>) : null

  const binOf = (coord: number) => {
    const t = (coord - axisMin) / axisLen
    let b = Math.floor(t * samples)
    if (b < 0) b = 0
    if (b >= samples) b = samples - 1
    return b
  }

  // ── Passo 2: varredura de triângulos ─────────────────────────────────────
  for (let f = 0; f < triCount; f++) {
    const i0 = idxArr ? idxArr[f * 3] : f * 3
    const i1 = idxArr ? idxArr[f * 3 + 1] : f * 3 + 1
    const i2 = idxArr ? idxArr[f * 3 + 2] : f * 3 + 2

    const a0 = comp(pos, i0, ai), a1 = comp(pos, i1, ai), a2 = comp(pos, i2, ai)
    const u0 = comp(pos, i0, ui), u1 = comp(pos, i1, ui), u2 = comp(pos, i2, ui)
    const v0 = comp(pos, i0, vi), v1 = comp(pos, i1, vi), v2 = comp(pos, i2, vi)

    const tmin = Math.min(a0, a1, a2)
    const tmax = Math.max(a0, a1, a2)
    const uLo = Math.min(u0, u1, u2), uHi = Math.max(u0, u1, u2)
    const vLo = Math.min(v0, v1, v2), vHi = Math.max(v0, v1, v2)

    const b0 = binOf(tmin)
    const b1 = binOf(tmax)
    for (let b = b0; b <= b1; b++) {
      if (uLo < uMinB[b]) uMinB[b] = uLo
      if (uHi > uMaxB[b]) uMaxB[b] = uHi
      if (vLo < vMinB[b]) vMinB[b] = vLo
      if (vHi > vMaxB[b]) vMaxB[b] = vHi
    }
  }

  // ── Centroide sólido por fatia (loop de vértices) ────────────────────────
  for (let i = 0; i < pos.count; i++) {
    const b = binOf(comp(pos, i, ai))
    sumU[b] += comp(pos, i, ui)
    sumV[b] += comp(pos, i, vi)
    cnt[b] += 1
  }

  // ── Perfil de área (com preenchimento de fatias vazias) ──────────────────
  const rawArea = new Float64Array(samples)
  for (let b = 0; b < samples; b++) {
    if (uMaxB[b] > uMinB[b] && vMaxB[b] > vMinB[b]) {
      rawArea[b] = (uMaxB[b] - uMinB[b]) * (vMaxB[b] - vMinB[b])
    } else {
      rawArea[b] = NaN
    }
  }
  fillGaps(rawArea)

  // ── Suavização (média móvel) ─────────────────────────────────────────────
  const smoothWin = Math.max(1, Math.round(samples * 0.02))
  const area = movingAverage(rawArea, smoothWin)

  let maxArea = 0
  for (let b = 0; b < samples; b++) if (area[b] > maxArea) maxArea = area[b]
  if (maxArea <= 0) maxArea = 1

  // ── Passo 3-4: detecta vales e calcula proeminência ──────────────────────
  const edge = Math.round(samples * 0.06)
  const r = Math.max(2, Math.round(samples * 0.025))
  const promWin = Math.max(4, Math.round(samples * 0.18))

  interface Valley { b: number; area: number; prom: number }
  const valleys: Valley[] = []

  for (let b = edge; b < samples - edge; b++) {
    let isMin = true
    for (let k = b - r; k <= b + r; k++) {
      if (k < 0 || k >= samples) continue
      if (area[k] < area[b] - 1e-9) { isMin = false; break }
    }
    if (!isMin) continue
    // Evita duplicar platôs: exige que seja o início do vale
    if (b > 0 && area[b - 1] < area[b] - 1e-9) continue

    let leftPeak = area[b]
    for (let k = b; k >= Math.max(0, b - promWin); k--) if (area[k] > leftPeak) leftPeak = area[k]
    let rightPeak = area[b]
    for (let k = b; k <= Math.min(samples - 1, b + promWin); k++) if (area[k] > rightPeak) rightPeak = area[k]

    const prom = Math.min(leftPeak, rightPeak) - area[b]
    valleys.push({ b, area: area[b], prom: prom / maxArea })
  }

  // Ordena por proeminência (pescoços mais fundos primeiro)
  valleys.sort((p, q) => q.prom - p.prom)

  const threshold = lerp(0.12, 0.004, clamp01(opts.sensitivity))
  const minGap = Math.max(3, Math.round(samples * 0.08))

  const chosen: Valley[] = []
  const accept = (v: Valley) => {
    for (const c of chosen) if (Math.abs(c.b - v.b) < minGap) return false
    return true
  }

  for (const v of valleys) {
    if (chosen.length >= opts.maxCuts) break
    if (v.prom < threshold) continue
    if (accept(v)) chosen.push(v)
  }

  // Garante ao menos uma sugestão (o mínimo global) mesmo em peças uniformes
  if (chosen.length === 0 && valleys.length > 0) {
    // valleys[0] já é o de maior proeminência; se todos forem baixos, pega o
    // de menor área absoluta como fallback do "mínimo global".
    let best = valleys[0]
    for (const v of valleys) if (v.area < best.area) best = v
    chosen.push(best)
  }

  // Ordena os cortes escolhidos ao longo do eixo
  chosen.sort((p, q) => p.b - q.b)

  const centerAt = (b: number): [number, number, number] => {
    let cu: number, cv: number
    if (cnt[b] > 0) {
      cu = sumU[b] / cnt[b]
      cv = sumV[b] / cnt[b]
    } else {
      cu = (uMinB[b] + uMaxB[b]) / 2
      cv = (vMinB[b] + vMaxB[b]) / 2
    }
    const coord = axisMin + ((b + 0.5) / samples) * axisLen
    const out: [number, number, number] = [0, 0, 0]
    out[ai] = coord
    out[ui] = Number.isFinite(cu) ? cu : comp3(bboxCenter(bbox), ui)
    out[vi] = Number.isFinite(cv) ? cv : comp3(bboxCenter(bbox), vi)
    return out
  }

  const cuts: SplitCut[] = chosen.map((v) => {
    const coord = axisMin + ((v.b + 0.5) / samples) * axisLen
    const halfU = Number.isFinite(uMaxB[v.b]) ? (uMaxB[v.b] - uMinB[v.b]) / 2 : 0
    const halfV = Number.isFinite(vMaxB[v.b]) ? (vMaxB[v.b] - vMinB[v.b]) / 2 : 0
    return {
      offset: (coord - axisMin) / axisLen,
      coord,
      area: v.area,
      prominence: v.prom,
      center: centerAt(v.b),
      halfU,
      halfV,
    }
  })

  const profile: AxisProfilePoint[] = []
  for (let b = 0; b < samples; b++) {
    profile.push({ coord: axisMin + ((b + 0.5) / samples) * axisLen, area: area[b] })
  }

  const normal: [number, number, number] = [0, 0, 0]
  normal[ai] = 1

  return { axis, normal, cuts, profile, maxArea }
}

/**
 * Executa a divisão física da geometria nos planos do plano de cortes.
 * Devolve as peças ordenadas do menor ao maior valor do eixo (base → topo).
 */
export function performSplit(
  geometry: THREE.BufferGeometry,
  plan: AutoSplitPlan,
): THREE.BufferGeometry[] {
  const normal = new THREE.Vector3(plan.normal[0], plan.normal[1], plan.normal[2])
  const cuts = [...plan.cuts].sort((a, b) => a.coord - b.coord)

  const pieces: THREE.BufferGeometry[] = []
  let remaining = geometry

  for (const cut of cuts) {
    const point = new THREE.Vector3(cut.center[0], cut.center[1], cut.center[2])
    let res
    try {
      res = solidPlaneCut(remaining, normal, point)
    } catch {
      continue
    }
    const negCount = res.negative.getAttribute('position')?.count ?? 0
    const posCount = res.positive.getAttribute('position')?.count ?? 0
    if (negCount === 0 || posCount === 0) continue
    pieces.push(res.negative)
    remaining = res.positive
  }

  pieces.push(remaining)
  return pieces
}

/**
 * Calcula as posições dos pinos de alinhamento de um corte (espaço local).
 * Com 2 pinos, distribui ao longo do eixo perpendicular mais largo para
 * impedir rotação relativa entre as peças.
 */
export function makePinPositions(
  plan: AutoSplitPlan,
  cut: SplitCut,
  count: number,
): THREE.Vector3[] {
  const base = new THREE.Vector3(cut.center[0], cut.center[1], cut.center[2])
  if (count <= 1) return [base]

  const [ua, va] = PERP[plan.axis]
  const useU = cut.halfU >= cut.halfV
  const alongIdx = AXIS_IDX[useU ? ua : va]
  const half = useU ? cut.halfU : cut.halfV
  const d = Math.max(half * 0.45, 0)

  const p1 = base.clone()
  p1.setComponent(alongIdx, base.getComponent(alongIdx) - d)
  const p2 = base.clone()
  p2.setComponent(alongIdx, base.getComponent(alongIdx) + d)
  return [p1, p2]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function comp3(v: THREE.Vector3, c: 0 | 1 | 2): number {
  return c === 0 ? v.x : c === 1 ? v.y : v.z
}

function bboxCenter(b: THREE.Box3): THREE.Vector3 {
  const c = new THREE.Vector3()
  b.getCenter(c)
  return c
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Preenche valores NaN por interpolação linear com vizinhos válidos. */
function fillGaps(arr: Float64Array): void {
  const n = arr.length
  let i = 0
  while (i < n) {
    if (!Number.isNaN(arr[i])) { i++; continue }
    let j = i
    while (j < n && Number.isNaN(arr[j])) j++
    const left = i - 1 >= 0 ? arr[i - 1] : (j < n ? arr[j] : 0)
    const right = j < n ? arr[j] : left
    const span = j - i + 1
    for (let k = i; k < j; k++) {
      const t = (k - i + 1) / span
      arr[k] = left + (right - left) * t
    }
    i = j
  }
}

function movingAverage(arr: Float64Array, win: number): Float64Array {
  const n = arr.length
  const out = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    let s = 0
    let c = 0
    for (let k = i - win; k <= i + win; k++) {
      if (k < 0 || k >= n) continue
      s += arr[k]
      c++
    }
    out[i] = c > 0 ? s / c : arr[i]
  }
  return out
}
