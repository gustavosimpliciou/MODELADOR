/**
 * Smart Refine — Selection Refinement Layer (camada complementar da Smart)
 *
 * A Smart existente (`smart-cut.ts`) continua sendo o núcleo: ela decide
 * "esta área pertence à região que o usuário provavelmente quer selecionar"
 * via Dijkstra com budget de curvatura. Este módulo responde apenas:
 * "como transformar essa região em uma seleção geometricamente limpa?"
 *
 * Arquitetura:
 *   SmartDetector (smart-cut.ts, inalterado)
 *     └── RegionGrower (Dijkstra, inalterado)
 *           └── SelectionRefiner (ESTE ARQUIVO)
 *                 ├── GeometryAnalyzer  (normais robustas + curvatura + áreas)
 *                 ├── NoiseFilter       (voto ponderado por área, histerese)
 *                 ├── BoundaryAnalyzer  (banda de fronteira 1-ring / 2-ring)
 *                 ├── BoundarySmoother  (curvature-flow discreto na máscara)
 *                 ├── SpurNotchCleaner (pontas de 1 face e entalhes estreitos)
 *                 ├── HoleFiller        (micro-furos → dentro)
 *                 ├── ComponentCleaner  (micro-ilhas → fora)
 *                 └── FeatureEdgeProtector (aresta viva nunca é atravessada)
 *   SelectionComposer (viewport: Ctrl/add/subtract — inalterado, refine roda ANTES)
 *
 * Máquina de estados (implementada no viewport + store):
 *   IDLE → HOVERING (preview, recalcula livre) → PREVIEW → COMMIT (clique) →
 *   LOCKED (congelada: mouse/hover/câmera NÃO tocam) → nova ação explícita → PREVIEW.
 * O store garante LOCKED por imutabilidade: todo commit clona o Set, de modo
 * que preview e committed nunca compartilham referência mutável.
 *
 * Regras respeitadas:
 *  - NÃO modifica a malha (só máscaras Uint8 + Sets — puro estado de seleção).
 *  - NÃO substitui a detecção; se o refine falhar, o chamador usa o raw.
 *  - Preserva feature edges reais; remove só ruído de triangulação.
 *  - Rápido no hover: opera só na banda de fronteira (raw ∪ 1-ring),
 *    reutiliza o cache de adjacência da Smart, sem full-scan por frame.
 */

import * as THREE from 'three'
import { getSmartGeometryData, getFaceCentroids } from './smart-cut'
import type { LimitationPlate } from './smart-cut'
import type { SmartGeometryData } from './smart-cut'

// ─── Opções ────────────────────────────────────────────────────────────────────
// Pesos internos — propositalmente NÃO expostos na UI (comportamento deve ser
// "profissional por padrão", sem novas interações obrigatórias).

export interface SmartRefineOptions {
  /** Chave mestra: false = bypass total (retorna a seleção crua). */
  enabled: boolean
  /** Passadas de votação no hover (preview precisa ser ~instantâneo). */
  hoverPasses: number
  /** Passadas de votação no clique (pode refinar um pouco mais). */
  selectPasses: number
  /** Fração de vizinhança fraca discordante p/ ADICIONAR face (0→1). */
  addThreshold: number
  /** Fração p/ REMOVER face (1→0). Maior que add = histerese anti-flicker. */
  removeThreshold: number
  /** Aresta com diedro acima disto (graus) = feature real, resiste ao flip. */
  featureAngle: number
  /** Aresta abaixo disto (graus) = continuidade suave (núcleo protegido). */
  smoothAngle: number
  /** Componentes com área < fração da área total são absorvidos (só no clique). */
  minAreaFraction: number
  /** Nunca remover a face do cursor nem seu núcleo suave (estabilidade). */
  protectSeed: boolean
  /** Nunca adicionar faces de outro componente conexo. */
  respectComponents: boolean
}

export const DEFAULT_REFINE: SmartRefineOptions = {
  enabled: true,
  hoverPasses: 2,
  selectPasses: 3,
  addThreshold: 0.6,
  removeThreshold: 0.68,
  featureAngle: 40,
  smoothAngle: 14,
  minAreaFraction: 0.004,
  protectSeed: true,
  respectComponents: true,
}

// Abaixo disto nem tenta refinar (região minúscula = detalhe intencional).
const MIN_FACES_TO_REFINE = 8

// ─── Áreas de face ─────────────────────────────────────────────────────────────

const fullAreaCache = new WeakMap<THREE.BufferGeometry, Float32Array>()

/** Área de UMA face, sob demanda (acesso direto ao TypedArray — ideal p/ hover). */
function areaOfFace(geometry: THREE.BufferGeometry, f: number): number {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const p = pos.array as Float32Array
  const idx = geometry.index
  const ia = idx ? idx.getX(f * 3) : f * 3
  const ib = idx ? idx.getX(f * 3 + 1) : f * 3 + 1
  const ic = idx ? idx.getX(f * 3 + 2) : f * 3 + 2
  const abx = p[ib * 3] - p[ia * 3]
  const aby = p[ib * 3 + 1] - p[ia * 3 + 1]
  const abz = p[ib * 3 + 2] - p[ia * 3 + 2]
  const acx = p[ic * 3] - p[ia * 3]
  const acy = p[ic * 3 + 1] - p[ia * 3 + 1]
  const acz = p[ic * 3 + 2] - p[ia * 3 + 2]
  const cx = aby * acz - abz * acy
  const cy = abz * acx - abx * acz
  const cz = abx * acy - aby * acx
  return 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz)
}

/** Áreas de TODAS as faces, com cache (só usada no caminho do clique). */
function fullAreas(geometry: THREE.BufferGeometry, faceCount: number): Float32Array {
  const cached = fullAreaCache.get(geometry)
  if (cached && cached.length === faceCount) return cached
  const areas = new Float32Array(faceCount)
  for (let f = 0; f < faceCount; f++) areas[f] = areaOfFace(geometry, f)
  fullAreaCache.set(geometry, areas)
  return areas
}

// ─── Placa de Limitação (teste local, só p/ candidatos a ADIÇÃO) ───────────────
// Espelha a regra de `smart-cut.ts`: a seleção nunca atravessa a barreira.
// Duplicado aqui para não expor internals; opera só em poucas faces da banda.

function segmentCrossesPlateLocal(
  fx: number, fy: number, fz: number,
  nx: number, ny: number, nz: number,
  p: LimitationPlate,
): boolean {
  const dF = (fx - p.center.x) * p.normal.x + (fy - p.center.y) * p.normal.y + (fz - p.center.z) * p.normal.z
  const dN = (nx - p.center.x) * p.normal.x + (ny - p.center.y) * p.normal.y + (nz - p.center.z) * p.normal.z
  if (dF * dN >= 0) return false
  const t = dF / (dF - dN)
  const cx = fx + t * (nx - fx) - p.center.x
  const cy = fy + t * (ny - fy) - p.center.y
  const cz = fz + t * (nz - fz) - p.center.z
  const lx = cx * p.right.x + cy * p.right.y + cz * p.right.z
  const ly = cx * p.up.x + cy * p.up.y + cz * p.up.z
  return Math.abs(lx) <= p.halfWidth && Math.abs(ly) <= p.halfHeight
}

// ─── Núcleo: votação ponderada por área com proteção de features ───────────────

interface BandWorkspace {
  mask: Uint8Array
  /** Faces da banda (raw ∪ 1-ring) — único conjunto varrido nos passes. */
  band: number[]
  /** 1 = sobre relevo real (diedro máximo > featureAngle). */
  isFeature: Uint8Array
  /** Área por face da banda (densidade-adaptativa: sliver pesa menos). */
  bandArea: Map<number, number>
}

/** Monta máscara + banda + feature flags. Tudo O(banda), nunca O(malha). */
function buildBand(
  data: SmartGeometryData,
  raw: Set<number>,
  cosFeature: number,
): BandWorkspace {
  const { adjList, faceNormals, faceCount } = data
  const mask = new Uint8Array(faceCount)
  for (const f of raw) if (f >= 0 && f < faceCount) mask[f] = 1

  const inBand = new Uint8Array(faceCount)
  const band: number[] = []
  const push = (f: number) => {
    if (!inBand[f]) { inBand[f] = 1; band.push(f) }
  }
  for (const f of raw) {
    if (f < 0 || f >= faceCount) continue
    push(f)
    const adj = adjList[f]
    for (let i = 0; i < adj.length; i++) push(adj[i])
  }

  // Feature por face da banda = diedro máximo p/ vizinhos (robusto: usa o PIOR
  // vizinho, não uma normal isolada — um triângulo mal orientado sozinho não
  // cria feature; relevo real aparece em vários vizinhos).
  const isFeature = new Uint8Array(faceCount)
  for (const f of band) {
    const adj = adjList[f]
    const nx = faceNormals[f * 3]
    const ny = faceNormals[f * 3 + 1]
    const nz = faceNormals[f * 3 + 2]
    let minDot = 1
    for (let i = 0; i < adj.length; i++) {
      const nb = adj[i]
      const dot =
        nx * faceNormals[nb * 3] +
        ny * faceNormals[nb * 3 + 1] +
        nz * faceNormals[nb * 3 + 2]
      if (dot < minDot) minDot = dot
    }
    if (minDot < cosFeature) isFeature[f] = 1
  }

  return { mask, band, isFeature, bandArea: new Map() }
}

function bandFaceArea(
  ws: BandWorkspace,
  geometry: THREE.BufferGeometry,
  f: number,
): number {
  let a = ws.bandArea.get(f)
  if (a === undefined) {
    a = areaOfFace(geometry, f)
    // Área zero/degenarada nunca deve decidir a fronteira sozinha.
    if (!(a > 0)) a = 0
    ws.bandArea.set(f, a)
  }
  return a
}

/**
 * Uma passada de curvature-flow discreto sobre a máscara.
 * Para cada face da banda, mede a fração PONDERADA POR ÁREA dos vizinhos que
 * discordam do estado atual — considerando SÓ arestas fracas (continuidade).
 * Arestas fortes (feature) contam como evidência de fronteira real e seguram
 * o flip, a menos que o anel inteiro discorde (>= 0.85).
 *
 * Histerese: limiar de remoção > limiar de adição → a fronteira não oscila
 * entre frames quando o mouse se move sobre a mesma região.
 *
 * Escala média (2-ring): flips candidatos são confirmados contra o 2-ring —
 * se a vizinhança média discorda fortemente do flip, ele é bloqueado. Isso
 * evita que o refine fique "preso" a detalhes de 1 triângulo.
 */
function votePass(
  geometry: THREE.BufferGeometry,
  data: SmartGeometryData,
  ws: BandWorkspace,
  opts: SmartRefineOptions,
  cosFeature: number,
  protectedFaces: Set<number> | null,
  seedComp: number,
  plates: LimitationPlate[],
  centroids: Float32Array | null,
): boolean {
  const { adjList, edgeCost } = data
  void cosFeature
  const next = ws.mask.slice()
  let changed = false

  // 2-ring sob demanda só p/ candidatos (não varre a malha).
  const secondRingSelectedFrac = (f: number): number => {
    const adj = adjList[f]
    let sel = 0
    let tot = 0
    for (let i = 0; i < adj.length; i++) {
      const ring = adjList[adj[i]]
      for (let j = 0; j < ring.length; j++) {
        const g = ring[j]
        if (g === f) continue
        tot++
        if (ws.mask[g]) sel++
      }
    }
    return tot > 0 ? sel / tot : 0.5
  }

  for (const f of ws.band) {
    const cur = ws.mask[f]
    const adj = adjList[f]
    const costs = edgeCost[f]
    const n = adj.length
    if (n === 0) continue

    // Núcleo do cursor: nunca remover (estabilidade do hover).
    if (cur === 1 && protectedFaces?.has(f)) continue
    // Outra ilha: nunca adicionar (não atravessa partes separadas).
    if (cur === 0 && opts.respectComponents && data.compLabel[f] !== seedComp) continue

    let wDiff = 0
    let wTot = 0
    for (let i = 0; i < n; i++) {
      const nb = adj[i]
      const edge = costs[i]
      // Aresta forte = fronteira real em potencial → peso quase zero no voto
      // (só conta se for continuidade suave).
      if (edge >= opts.featureAngle) continue
      const wStrength = 1 - edge / opts.featureAngle // 1 (plano) → 0 (feature)
      const wArea = bandFaceArea(ws, geometry, nb)
      const w = wStrength * (0.25 + wArea)
      wTot += w
      if (ws.mask[nb] !== cur) wDiff += w
    }
    if (wTot <= 0) continue
    const frac = wDiff / wTot

    const threshold = cur === 1 ? opts.removeThreshold : opts.addThreshold
    // Relevo real só inverte sob evidência esmagadora (anel quase unânime).
    const need = ws.isFeature[f] ? Math.max(threshold, 0.85) : threshold
    if (frac < need) continue

    // Confirmação multiescala: o 2-ring precisa concordar com a direção do flip.
    const ring2 = secondRingSelectedFrac(f)
    if (cur === 1 && ring2 > 0.72) continue // cercado de selecionados → mantém
    if (cur === 0 && ring2 < 0.28) continue // cercado de fora → mantém fora

    // Placas: adição que cruzaria a barreira é vetada.
    if (cur === 0 && plates.length > 0 && centroids) {
      let blocked = false
      for (let i = 0; i < n; i++) {
        const nb = adj[i]
        if (!ws.mask[nb]) continue
        const fx = centroids[f * 3]
        const fy = centroids[f * 3 + 1]
        const fz = centroids[f * 3 + 2]
        const nx = centroids[nb * 3]
        const ny = centroids[nb * 3 + 1]
        const nz = centroids[nb * 3 + 2]
        for (let pi = 0; pi < plates.length; pi++) {
          if (segmentCrossesPlateLocal(fx, fy, fz, nx, ny, nz, plates[pi])) {
            blocked = true
            break
          }
        }
        if (blocked) break
      }
      if (blocked) continue
    }

    next[f] = cur ^ 1
    changed = true
  }

  if (changed) ws.mask.set(next)
  return changed
}

// ─── Spur & notch pass (regularização "reta": pontas e entalhes de 1 face) ────
// Remove o zigue-zague que a votação majoritária deixa passar: uma ponta
// selecionada ligada por 1 vizinho (dente) e um entalhe não-selecionado
// cercado por selecionados (degrau). Cada flip aqui REDUZ o comprimento da
// fronteira, empurrando-a para segmentos mais retos/contínuos — sem nunca
// cruzar aresta viva (feature), o núcleo do cursor, outro componente ou placa.
//
// O(n) só na banda — barato o suficiente para hover (1 iteração) e clique.
function spurNotchPass(
  geometry: THREE.BufferGeometry,
  data: SmartGeometryData,
  ws: BandWorkspace,
  opts: SmartRefineOptions,
  protectedFaces: Set<number> | null,
  seedComp: number,
  plates: LimitationPlate[],
  centroids: Float32Array | null,
): boolean {
  const { adjList, edgeCost } = data
  const next = ws.mask.slice()
  let changed = false

  const crossesPlate = (f: number): boolean => {
    if (plates.length === 0 || !centroids) return false
    for (let i = 0; i < adjList[f].length; i++) {
      const nb = adjList[f][i]
      if (!ws.mask[nb]) continue
      for (let pi = 0; pi < plates.length; pi++) {
        if (segmentCrossesPlateLocal(
          centroids[f * 3], centroids[f * 3 + 1], centroids[f * 3 + 2],
          centroids[nb * 3], centroids[nb * 3 + 1], centroids[nb * 3 + 2],
          plates[pi],
        )) return true
      }
    }
    return false
  }

  for (const f of ws.band) {
    const cur = ws.mask[f]
    const adj = adjList[f]
    const costs = edgeCost[f]
    const n = adj.length
    if (n < 2) continue

    let same = 0
    let maxEdgeToSame = 0
    for (let i = 0; i < n; i++) {
      if (ws.mask[adj[i]] === cur) {
        same++
        if (costs[i] > maxEdgeToSame) maxEdgeToSame = costs[i]
      }
    }

    if (cur === 1) {
      // PONTA: 0–1 vizinhos no mesmo estado → dente/serrilhado. Remove, salvo:
      // núcleo do cursor, relevo real (ligação por aresta viva = detalhe fino
      // intencional, ex.: antena), ou ligação forte.
      if (same > 1) continue
      if (protectedFaces?.has(f)) continue
      if (ws.isFeature[f]) continue
      if (maxEdgeToSame >= opts.featureAngle) continue
      next[f] = 0
      changed = true
    } else {
      // ENTALHE: todos os vizinhos menos no máximo 1 no estado oposto →
      // degrau de triangulação. Preenche, salvo: outro componente, placa,
      // ou paredes do entalhe formadas por aresta viva (sulco real).
      if (same > 1) continue
      if (opts.respectComponents && data.compLabel[f] !== seedComp) continue
      if (ws.isFeature[f]) continue
      if (maxEdgeToSame >= opts.featureAngle) continue
      if (crossesPlate(f)) continue
      next[f] = 1
      changed = true
    }
  }

  if (changed) ws.mask.set(next)
  return changed
}

// ─── Boundary Quality Score (métrica interna — §24 do spec) ────────────────────
// Quanto MENOR, mais limpa a fronteira. Componentes:
//  - boundaryPerFace: arestas de fronteira por face (comprimento relativo)
//  - microRate: pontas + entalhes de 1 face por face (serrilhado)
//  - angularMean: diedro médio nas arestas de fronteira (alto = segue feature
//    real ou ruído; interpretado junto com microRate)

export interface BoundaryQuality {
  faces: number
  boundaryEdges: number
  boundaryPerFace: number
  spurs: number
  notches: number
  microRate: number
  angularMean: number
  /** 0..1 aprox.: menor = fronteira mais limpa. */
  score: number
}

export function boundaryQuality(
  geometry: THREE.BufferGeometry,
  sel: Set<number>,
): BoundaryQuality {
  const empty: BoundaryQuality = {
    faces: sel.size, boundaryEdges: 0, boundaryPerFace: 0,
    spurs: 0, notches: 0, microRate: 0, angularMean: 0, score: 0,
  }
  if (sel.size === 0) return empty
  const data = getSmartGeometryData(geometry)
  // Sem adjacência não há métrica (não inventa número).
  if (!data) return empty

  let bEdges = 0
  let angSum = 0
  let spurs = 0
  let notches = 0
  for (const f of sel) {
    const adj = data.adjList[f]
    const costs = data.edgeCost[f]
    let same = 0
    for (let i = 0; i < adj.length; i++) {
      if (sel.has(adj[i])) {
        same++
      } else {
        bEdges++
        angSum += costs[i]
      }
    }
    if (same <= 1 && adj.length >= 2) spurs++
  }
  // Entalhes: varre 1-ring da seleção (fora dela, quase cercados).
  const seen = new Set<number>()
  for (const f of sel) {
    const adj = data.adjList[f]
    for (let i = 0; i < adj.length; i++) {
      const nb = adj[i]
      if (sel.has(nb) || seen.has(nb)) continue
      seen.add(nb)
      const nbAdj = data.adjList[nb]
      let sameOut = 0
      for (let j = 0; j < nbAdj.length; j++) if (sel.has(nbAdj[j])) sameOut++
      if (nbAdj.length >= 2 && sameOut >= nbAdj.length - 1) notches++
    }
  }
  const faces = sel.size
  const boundaryPerFace = bEdges / faces
  const microRate = (spurs + notches) / faces
  const angularMean = bEdges > 0 ? angSum / bEdges : 0
  // Score: fronteira curta + pouco micro-serrilhado. O termo angular entra
  // normalizado (fronteira sobre feature real não é penalizada sozinha —
  // só quando combinada com micro-irregularidade).
  const score = boundaryPerFace * 0.5 + microRate * 4 + (angularMean / 180) * microRate * 2
  return { faces, boundaryEdges: bEdges, boundaryPerFace, spurs, notches, microRate, angularMean, score }
}

// ─── Limpeza por área (só no clique — full-scan O(n), fora do hover) ───────────

function removeSmallComponents(
  mask: Uint8Array,
  value: number,
  adjList: Int32Array[],
  areas: Float32Array,
  minArea: number,
): void {
  if (minArea <= 0) return
  const faceCount = mask.length
  const visited = new Uint8Array(faceCount)
  const stack = new Int32Array(faceCount)
  for (let start = 0; start < faceCount; start++) {
    if (visited[start] || mask[start] !== value) continue
    let sp = 0
    stack[sp++] = start
    visited[start] = 1
    const comp: number[] = []
    let area = 0
    while (sp > 0) {
      const f = stack[--sp]
      comp.push(f)
      area += areas[f]
      const adj = adjList[f]
      for (let i = 0; i < adj.length; i++) {
        const nb = adj[i]
        if (!visited[nb] && mask[nb] === value) {
          visited[nb] = 1
          stack[sp++] = nb
        }
      }
    }
    if (area < minArea) {
      for (const f of comp) mask[f] = value ^ 1
    }
  }
}

// ─── API pública ───────────────────────────────────────────────────────────────

export interface RefineInput {
  geometry: THREE.BufferGeometry
  /** Saída crua da Smart (smartSelect) — NÃO é modificada. */
  raw: Set<number>
  /** Face sob o cursor (seed do raycast). */
  seedFace: number
  /** Placas ativas (respeitadas em adições). */
  plates?: LimitationPlate[]
  options?: Partial<SmartRefineOptions>
}

function refineCore(
  input: RefineInput,
  passes: number,
  withAreaCleanup: boolean,
): Set<number> {
  const { geometry, raw, seedFace } = input
  const opts: SmartRefineOptions = { ...DEFAULT_REFINE, ...input.options }
  const plates = input.plates ?? []

  // Bypass / casos triviais: devolve o raw intocado (zero regressão).
  if (!opts.enabled) return raw
  if (raw.size === 0) return raw
  if (raw.size < MIN_FACES_TO_REFINE) return raw

  const data = getSmartGeometryData(geometry)
  if (!data) return raw
  if (seedFace < 0 || seedFace >= data.faceCount) return raw

  const seedComp = data.compLabel[seedFace]
  // Seleção = ilha inteira → fronteira é a borda real da peça: nada a suavizar.
  if (opts.respectComponents && raw.size >= data.compSize[seedComp]) return raw

  const cosFeature = Math.cos((opts.featureAngle * Math.PI) / 180)
  const ws = buildBand(data, raw, cosFeature)

  // Núcleo protegido: seed + vizinhos em continuidade suave (nunca removidos).
  let protectedFaces: Set<number> | null = null
  if (opts.protectSeed) {
    protectedFaces = new Set<number>([seedFace])
    const adj = data.adjList[seedFace]
    const costs = data.edgeCost[seedFace]
    for (let i = 0; i < adj.length; i++) {
      if (costs[i] <= opts.smoothAngle) protectedFaces.add(adj[i])
    }
  }

  const centroids = plates.length > 0 ? getFaceCentroids(geometry) : null

  for (let p = 0; p < passes; p++) {
    const changed = votePass(
      geometry, data, ws, opts, cosFeature,
      protectedFaces, seedComp, plates, centroids,
    )
    if (!changed) break
  }

  // Regularização "reta": 1 passada de pontas/entalhes APÓS a votação.
  // Remove o dente isolado e fecha o degrau de 1 face que a votação deixa
  // passar — cada flip aqui encurta a fronteira (segmentos mais contínuos).
  // Barato (só banda) → roda no hover e no clique.
  spurNotchPass(geometry, data, ws, opts, protectedFaces, seedComp, plates, centroids)

  if (withAreaCleanup) {
    // Remove Small Components + Fill Small Holes com limiar adaptativo
    // (fração da área total — escala com a malha, sem valor fixo agressivo).
    const areas = fullAreas(geometry, data.faceCount)
    let totalArea = 0
    for (let f = 0; f < data.faceCount; f++) if (ws.mask[f]) totalArea += areas[f]
    const minArea = totalArea * opts.minAreaFraction
    if (minArea > 0) {
      removeSmallComponents(ws.mask, 1, data.adjList, areas, minArea)
      removeSmallComponents(ws.mask, 0, data.adjList, areas, minArea)
    }
    // Re-ancora o seed após a limpeza (seed jamais pode sair da seleção).
    if (opts.protectSeed) ws.mask[seedFace] = 1
  }

  // Sem mudança → devolve o próprio raw (preserva identidade p/ cache do hover).
  let diff = false
  // Checagem barata: tamanhos + amostragem da banda.
  let maskCount = 0
  for (let f = 0; f < data.faceCount; f++) if (ws.mask[f]) maskCount++
  if (maskCount !== raw.size) {
    diff = true
  } else {
    for (const f of ws.band) {
      if (!!ws.mask[f] !== raw.has(f)) { diff = true; break }
    }
  }
  if (!diff) return raw

  const out = new Set<number>()
  for (let f = 0; f < data.faceCount; f++) if (ws.mask[f]) out.add(f)
  return out.size > 0 ? out : raw
}

/**
 * Refine do HOVER (preview do cursor): banda 1-ring + 2 passadas, sem
 * full-scan. Projetado p/ rodar a cada frame de hover sem derrubar o fps.
 * Determinístico no raw → estável durante o movimento do mouse.
 */
export function refineSmartHover(
  geometry: THREE.BufferGeometry,
  raw: Set<number>,
  seedFace: number,
  plates: LimitationPlate[] = [],
  options?: Partial<SmartRefineOptions>,
): Set<number> {
  try {
    const opts = { ...DEFAULT_REFINE, ...options }
    return refineCore({ geometry, raw, seedFace, plates, options: opts }, opts.hoverPasses, false)
  } catch (err) {
    console.warn('[SmartRefine] hover fallback p/ seleção crua:', err)
    return raw
  }
}

/**
 * Refine do CLIQUE (seleção commitada): votação + limpeza de micro-ilhas e
 * micro-furos por área adaptativa. Roda antes da composição Ctrl/add/subtract,
 * que permanece exatamente como está.
 */
export function refineSmartSelection(
  geometry: THREE.BufferGeometry,
  raw: Set<number>,
  seedFace: number,
  plates: LimitationPlate[] = [],
  options?: Partial<SmartRefineOptions>,
): Set<number> {
  try {
    const opts = { ...DEFAULT_REFINE, ...options }
    return refineCore({ geometry, raw, seedFace, plates, options: opts }, opts.selectPasses, true)
  } catch (err) {
    console.warn('[SmartRefine] click fallback p/ seleção crua:', err)
    return raw
  }
}
