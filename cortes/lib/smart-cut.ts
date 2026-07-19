/**
 * SmartCut — Segmentação por Curvatura Acumulada (Dijkstra Budget)
 *
 * Problema dos algoritmos BFS simples: param em cada aresta afiada,
 * quebrando a seleção no meio de uma peça orgânica.
 *
 * Solução: Dijkstra com "budget" de curvatura total.
 * - Cada aresta tem custo = ângulo diedro entre as normais das faces.
 * - O algoritmo expande faces em ordem de custo acumulado.
 * - Quando o custo acumulado de uma face ultrapassa o budget, ela é bloqueada.
 * - Isso fecha peças inteiras (óculos, cabelo) mesmo com bordas suaves.
 *
 * Para modelos STL binários (não-indexados), a adjacência é construída
 * via hash de posição (quantização 1e4) — resolve o problema de vértices
 * duplicados com posições iguais.
 */

import * as THREE from 'three'
import { generateCap } from './cap-generation'

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type SelectionMode = 'island' | 'curvature'

export interface SmartCutOptions {
  /** Budget total de curvatura em graus. Menor = mais restrito. Padrão: 30 */
  sharpAngle: number
  maxFaces: number
  /**
   * 'island'   → seleciona a peça inteira (componente conexo) clicada.
   *              Ideal para modelos com partes separadas (cabelo, óculos, roupa).
   * 'curvature'→ expande por budget de curvatura, sem sair da peça clicada.
   */
  mode: SelectionMode
}

export const DEFAULT_OPTIONS: SmartCutOptions = {
  sharpAngle: 30,
  maxFaces: 2_000_000,
  mode: 'island',
}

// ─── Cache de adjacência ──────────────────────────────────────────────────────
interface GeomCache {
  /** adjList[f] = índices das faces vizinhas */
  adjList: Int32Array[]
  /** edgeCost[f][i] = custo em graus de atravessar a aresta para adjList[f][i] */
  edgeCost: Float32Array[]
  faceNormals: Float32Array
  faceCount: number
  /** compLabel[f] = id da ilha (componente conexo) a que a face pertence */
  compLabel: Int32Array
  /** compSize[label] = número de faces na ilha */
  compSize: Int32Array
  /** número total de ilhas */
  compCount: number
  built: boolean
}

const geomCache = new WeakMap<THREE.BufferGeometry, GeomCache>()

export function invalidateAdjacencyCache(geo: THREE.BufferGeometry): void {
  geomCache.delete(geo)
}

// ─── Construção do grafo de adjacência por posição ────────────────────────────
export function buildAdjacencyCache(
  geometry: THREE.BufferGeometry,
  _sharpAngle = 30 // mantido para compatibilidade mas não usado aqui
): void {
  if (geomCache.get(geometry)?.built) return

  const posAttr  = geometry.getAttribute('position') as THREE.BufferAttribute
  const idxAttr  = geometry.index
  const pos      = posAttr.array as Float32Array
  const faceCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3

  // ── Normais por face ──────────────────────────────────────────────────────
  const faceNormals = new Float32Array(faceCount * 3)
  for (let f = 0; f < faceCount; f++) {
    const b3 = f * 3
    const ai = idxAttr ? idxAttr.getX(b3)     : b3
    const bi = idxAttr ? idxAttr.getX(b3 + 1) : b3 + 1
    const ci = idxAttr ? idxAttr.getX(b3 + 2) : b3 + 2

    const ax = pos[ai*3], ay = pos[ai*3+1], az = pos[ai*3+2]
    const bx = pos[bi*3], by = pos[bi*3+1], bz = pos[bi*3+2]
    const cx = pos[ci*3], cy = pos[ci*3+1], cz = pos[ci*3+2]

    let nx = (by-ay)*(cz-az) - (bz-az)*(cy-ay)
    let ny = (bz-az)*(cx-ax) - (bx-ax)*(cz-az)
    let nz = (bx-ax)*(cy-ay) - (by-ay)*(cx-ax)
    const len = Math.sqrt(nx*nx + ny*ny + nz*nz)
    if (len > 1e-10) { nx/=len; ny/=len; nz/=len }
    faceNormals[f*3] = nx; faceNormals[f*3+1] = ny; faceNormals[f*3+2] = nz
  }

  // ── Hash de posição numérico para fundir vértices duplicados (STL binário) ─
  // Empacota 3 coordenadas quantizadas em 16-bit em um inteiro de 48 bits que
  // cabe em float64 (< 2^53). Elimina string allocation e GC pressure vs strings.
  const Q   = 10       // resolução 0.1 unidade ≈ 0.1 mm — suficiente
  const OFF = 32768    // 2^15 — desloca negativos para o intervalo positivo
  const posKeyNum = (vi: number): number => {
    const x = (Math.round(pos[vi*3]   * Q) + OFF) & 0xFFFF
    const y = (Math.round(pos[vi*3+1] * Q) + OFF) & 0xFFFF
    const z = (Math.round(pos[vi*3+2] * Q) + OFF) & 0xFFFF
    return x + y * 65536 + z * 65536 * 65536
  }

  const posToUID  = new Map<number, number>()
  const faceVerts = new Int32Array(faceCount * 3)

  for (let f = 0; f < faceCount; f++) {
    for (let c = 0; c < 3; c++) {
      const raw = idxAttr ? idxAttr.getX(f*3+c) : f*3+c
      const key = posKeyNum(raw)
      let uid = posToUID.get(key)
      if (uid === undefined) { uid = posToUID.size; posToUID.set(key, uid) }
      faceVerts[f*3+c] = uid
    }
  }

  // ── vertFaces: lista invertida uid→[faces] ────────────────────────────────
  const uniq = posToUID.size
  const vfCnt = new Int32Array(uniq)
  for (let i = 0; i < faceCount*3; i++) vfCnt[faceVerts[i]]++
  const vfOff = new Int32Array(uniq+1)
  for (let v = 0; v < uniq; v++) vfOff[v+1] = vfOff[v] + vfCnt[v]
  const vfList = new Int32Array(vfOff[uniq])
  const vfPtr  = new Int32Array(uniq)
  for (let f = 0; f < faceCount; f++) {
    for (let c = 0; c < 3; c++) {
      const v = faceVerts[f*3+c]
      vfList[vfOff[v] + vfPtr[v]++] = f
    }
  }

  // ── Construir adjList e edgeCost ──────────────────────────────────────────
  const adjList:  Int32Array[]   = new Array(faceCount)
  const edgeCost: Float32Array[] = new Array(faceCount)
  const tmp   = new Int32Array(512)
  // Scratch Uint8Array para deduplicação O(1) — substitui inner loop O(n)
  const seen  = new Uint8Array(faceCount)
  const RAD2DEG = 180 / Math.PI

  for (let f = 0; f < faceCount; f++) {
    let cnt = 0
    for (let c = 0; c < 3; c++) {
      const v = faceVerts[f*3+c]
      for (let j = vfOff[v]; j < vfOff[v+1]; j++) {
        const nb = vfList[j]
        if (nb === f || seen[nb]) continue
        seen[nb] = 1
        if (cnt < tmp.length) tmp[cnt++] = nb
      }
    }
    // Limpa seen apenas nas entradas que escrevemos — O(k) não O(n)
    for (let k = 0; k < cnt; k++) seen[tmp[k]] = 0

    adjList[f]  = new Int32Array(cnt)
    edgeCost[f] = new Float32Array(cnt)

    const fnx = faceNormals[f*3], fny = faceNormals[f*3+1], fnz = faceNormals[f*3+2]

    for (let k = 0; k < cnt; k++) {
      const nb  = tmp[k]
      adjList[f][k] = nb
      const dot = Math.max(-1, Math.min(1,
        fnx*faceNormals[nb*3] + fny*faceNormals[nb*3+1] + fnz*faceNormals[nb*3+2]
      ))
      // custo = ângulo em graus entre as normais (0=plano, 180=opostas)
      edgeCost[f][k] = Math.acos(dot) * RAD2DEG
    }
  }

  // ── Rotular ilhas (componentes conexos) via BFS ───────────────────────────
  // Duas faces estão na mesma ilha se compartilham posição (vértice soldado),
  // independente da curvatura. Isso identifica peças fisicamente separadas
  // como cabelo, óculos e roupa em modelos exportados/mesclados.
  const compLabel = new Int32Array(faceCount).fill(-1)
  const compSizeArr: number[] = []
  const stack = new Int32Array(faceCount)
  let compCount = 0

  for (let start = 0; start < faceCount; start++) {
    if (compLabel[start] !== -1) continue
    const label = compCount++
    let size = 0
    let sp = 0
    stack[sp++] = start
    compLabel[start] = label
    while (sp > 0) {
      const f = stack[--sp]
      size++
      const adj = adjList[f]
      for (let i = 0; i < adj.length; i++) {
        const nb = adj[i]
        if (compLabel[nb] === -1) {
          compLabel[nb] = label
          stack[sp++] = nb
        }
      }
    }
    compSizeArr.push(size)
  }

  const compSize = Int32Array.from(compSizeArr)

  geomCache.set(geometry, {
    adjList, edgeCost, faceNormals, faceCount,
    compLabel, compSize, compCount, built: true,
  })
}

// ─── Dijkstra com budget de curvatura ────────────────────────────────────────
/**
 * Expande a seleção a partir de clickedFaceIndex usando custo acumulado.
 * Faces com custo acumulado <= budget são incluídas.
 * Isso fecha peças inteiras mesmo com bordas suaves.
 */
export function smartSelect(
  geometry: THREE.BufferGeometry,
  clickedFaceIndex: number,
  options: Partial<SmartCutOptions> = {}
): Set<number> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  buildAdjacencyCache(geometry, opts.sharpAngle)
  const cache = geomCache.get(geometry)!
  const { adjList, edgeCost, faceCount, compLabel, compCount } = cache

  if (clickedFaceIndex < 0 || clickedFaceIndex >= faceCount) return new Set()

  const clickedIsland = compLabel[clickedFaceIndex]

  // ── Modo ILHA: seleciona a peça inteira (componente conexo) ────────────────
  // Se o modelo tem partes separadas, isto captura exatamente a peça clicada
  // (só o cabelo, só os óculos, só a roupa) sem vazar para nada mais.
  // Fallback: se o modelo é uma única malha soldada (1 ilha), não faz sentido
  // "selecionar tudo", então caímos no modo curvatura automaticamente.
  if (opts.mode === 'island' && compCount > 1) {
    const selected = new Set<number>()
    for (let f = 0; f < faceCount; f++) {
      if (compLabel[f] === clickedIsland) selected.add(f)
    }
    return selected
  }

  // ── Modo CURVATURA: Dijkstra com budget, restrito à ilha clicada ───────────
  // Nunca cruza a fronteira para outra peça (compLabel diferente), evitando
  // vazamento entre partes fisicamente separadas.
  const budget = opts.sharpAngle       // budget = o sharpAngle (graus acumulados)
  const INF    = 1e9

  const dist    = new Float32Array(faceCount).fill(INF)
  const visited = new Uint8Array(faceCount)
  dist[clickedFaceIndex] = 0

  // Heap binário mínimo real — O(log n) push/pop vs O(n) splice anterior
  const heap = new BinaryMinHeap(Math.min(faceCount * 2, 131072))
  heap.push(0, clickedFaceIndex)

  const selected = new Set<number>()
  selected.add(clickedFaceIndex)

  while (!heap.empty && selected.size < opts.maxFaces) {
    const cost = heap.popCost()
    const f    = heap.lastFace

    if (visited[f]) continue
    visited[f] = 1

    const adj   = adjList[f]
    const costs = edgeCost[f]

    for (let i = 0; i < adj.length; i++) {
      const nb = adj[i]
      if (visited[nb]) continue
      // Não sai da peça clicada
      if (compLabel[nb] !== clickedIsland) continue

      const newCost = cost + costs[i]
      if (newCost <= budget && newCost < dist[nb]) {
        dist[nb] = newCost
        selected.add(nb)
        heap.push(newCost, nb)
      }
    }
  }

  return selected
}

// ── Heap binário mínimo — O(log n) push/pop ───────────────────────────────────
// Armazena pares [custo, face] em Float64Array intercalado.
// Float64 mantém custo (float32) e face (int ≤ 2M) sem perda em um único word.
class BinaryMinHeap {
  private buf: Float64Array
  private _size = 0
  lastFace = 0          // preenchido por popCost(), lido pelo caller

  constructor(initialCapacity = 4096) {
    this.buf = new Float64Array(Math.max(initialCapacity, 64) * 2)
  }

  get empty() { return this._size === 0 }

  push(cost: number, face: number): void {
    if (this._size * 2 >= this.buf.length) {
      const next = new Float64Array(this.buf.length * 2)
      next.set(this.buf)
      this.buf = next
    }
    let i = this._size++
    this.buf[i * 2]     = cost
    this.buf[i * 2 + 1] = face
    // Sobe na árvore até ordenar
    while (i > 0) {
      const p = (i - 1) >> 1
      if (this.buf[p * 2] <= this.buf[i * 2]) break
      this._swap(p, i)
      i = p
    }
  }

  /** Retorna o custo mínimo e guarda a face correspondente em `lastFace`. */
  popCost(): number {
    const cost = this.buf[0]
    this.lastFace = this.buf[1]
    const last = --this._size
    if (last > 0) {
      this.buf[0] = this.buf[last * 2]
      this.buf[1] = this.buf[last * 2 + 1]
      // Desce na árvore
      let i = 0
      while (true) {
        const l = i * 2 + 1, r = l + 1
        let m = i
        if (l < this._size && this.buf[l * 2] < this.buf[m * 2]) m = l
        if (r < this._size && this.buf[r * 2] < this.buf[m * 2]) m = r
        if (m === i) break
        this._swap(i, m)
        i = m
      }
    }
    return cost
  }

  private _swap(a: number, b: number): void {
    const tc = this.buf[a * 2], tf = this.buf[a * 2 + 1]
    this.buf[a * 2]     = this.buf[b * 2]
    this.buf[a * 2 + 1] = this.buf[b * 2 + 1]
    this.buf[b * 2]     = tc
    this.buf[b * 2 + 1] = tf
  }
}

// ─── Centróides de face (cache) ───────────────────────────────────────────────
// Usado pela borracha para testar quais faces caem dentro do raio do pincel.
const centroidCache = new WeakMap<THREE.BufferGeometry, Float32Array>()

export function getFaceCentroids(geometry: THREE.BufferGeometry): Float32Array {
  const cached = centroidCache.get(geometry)
  if (cached) return cached

  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const idx = geometry.index
  const faceCount = idx ? idx.count / 3 : pos.count / 3
  const centroids = new Float32Array(faceCount * 3)

  for (let f = 0; f < faceCount; f++) {
    const a = idx ? idx.getX(f * 3)     : f * 3
    const b = idx ? idx.getX(f * 3 + 1) : f * 3 + 1
    const c = idx ? idx.getX(f * 3 + 2) : f * 3 + 2
    centroids[f * 3]     = (pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3
    centroids[f * 3 + 1] = (pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3
    centroids[f * 3 + 2] = (pos.getZ(a) + pos.getZ(b) + pos.getZ(c)) / 3
  }

  centroidCache.set(geometry, centroids)
  return centroids
}

// ═══════════════════════════════════════════════════════════════════════════
//  SMART CONTOUR — refinação inteligente do conjunto de faces (AutoCut AI)
// ═══════════════════════════════════════════════════════════════════════════
//
//  Problema: usar o boundary loop cru da seleção reproduz cada micro-triângulo
//  da malha → corte serrilhado, dentes, pontas finas, paredes frágeis.
//
//  Solução: em vez de suavizar a *linha* (o que exigiria re-cortar triângulos e
//  quebraria o watertight), refinamos o *conjunto de faces* que define o corte.
//  Trabalhando sobre a topologia (arestas reais) o corte continua seguindo a
//  malha — logo permanece estanque — mas a fronteira fica limpa e contínua.
//
//  Pipeline:
//   1. Relaxação morfológica por votação majoritária no 1-ring (remove dentes,
//      preenche entalhes, suaviza escadinhas de triangulação).
//   2. Guarda por curvatura: faces sobre relevos/mechas reais (aresta viva)
//      resistem à inversão — só ruído verdadeiramente isolado é absorvido.
//   3. Limpeza de ilhas e buracos por área: componentes minúsculos (abaixo de
//      uma fração da área total) são absorvidos → sem cacos nem furos.
// ═══════════════════════════════════════════════════════════════════════════

export interface ContourRefineOptions {
  /**
   * Intensidade global do Smart Contour (0..1). Controla o raio morfológico e o
   * número de passadas de suavização. 0 ≈ contorno quase cru; 1 = máximo alisamento.
   */
  strength: number
  /** Passadas de curvature-flow (suavização por votação de vizinhança). */
  smoothIterations: number
  /** Fração do 1-ring na outra margem para inverter uma face de fronteira (0.5–0.85). */
  flipRatio: number
  /** Ilhas/buracos com área < fração da área total da seleção são absorvidos. */
  minAreaFraction: number
  /** Arestas mais vivas que isto (graus) são relevo real e resistem à suavização. */
  featureAngle: number
  /**
   * Guarda de imprimibilidade: remove pontes/pescoços de 1 face de largura
   * (paredes finas demais para FDM/resina). true por padrão.
   */
  printGuard: boolean
}

export const DEFAULT_CONTOUR: ContourRefineOptions = {
  strength: 0.6,
  smoothIterations: 4,
  flipRatio: 0.6,
  minAreaFraction: 0.003,
  featureAngle: 42,
  printGuard: true,
}

/** Área de cada triângulo da malha (metade do módulo do produto vetorial). */
function computeFaceAreas(geometry: THREE.BufferGeometry): Float32Array {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const idx = geometry.index
  const p   = pos.array as Float32Array
  const faceCount = idx ? idx.count / 3 : pos.count / 3
  const areas = new Float32Array(faceCount)

  for (let f = 0; f < faceCount; f++) {
    const a = idx ? idx.getX(f*3)   : f*3
    const b = idx ? idx.getX(f*3+1) : f*3+1
    const c = idx ? idx.getX(f*3+2) : f*3+2
    const abx = p[b*3]-p[a*3], aby = p[b*3+1]-p[a*3+1], abz = p[b*3+2]-p[a*3+2]
    const acx = p[c*3]-p[a*3], acy = p[c*3+1]-p[a*3+1], acz = p[c*3+2]-p[a*3+2]
    const cx = aby*acz - abz*acy
    const cy = abz*acx - abx*acz
    const cz = abx*acy - aby*acx
    areas[f] = 0.5 * Math.sqrt(cx*cx + cy*cy + cz*cz)
  }
  return areas
}

/**
 * Dilata a seleção `k` vezes: toda face vizinha a uma face selecionada entra.
 * (Operador morfológico de crescimento sobre o grafo 1-ring da malha.)
 */
function dilateSelection(inSel: Uint8Array, k: number, adjList: Int32Array[]): void {
  const faceCount = inSel.length
  for (let it = 0; it < k; it++) {
    const add: number[] = []
    for (let f = 0; f < faceCount; f++) {
      if (inSel[f]) continue
      const adj = adjList[f]
      for (let i = 0; i < adj.length; i++) {
        if (inSel[adj[i]]) { add.push(f); break }
      }
    }
    if (add.length === 0) break
    for (const f of add) inSel[f] = 1
  }
}

/**
 * Erode a seleção `k` vezes: toda face selecionada com vizinho de fora sai.
 * Se `isFeature` for passado, faces sobre relevo real (mecha/ponta) resistem —
 * é o que impede o Smart Contour de "comer" os fios de cabelo ao alisar.
 */
function erodeSelection(
  inSel: Uint8Array,
  k: number,
  adjList: Int32Array[],
  isFeature?: Uint8Array,
): void {
  const faceCount = inSel.length
  for (let it = 0; it < k; it++) {
    const rem: number[] = []
    for (let f = 0; f < faceCount; f++) {
      if (!inSel[f]) continue
      if (isFeature && isFeature[f]) continue // relevo real preservado
      const adj = adjList[f]
      for (let i = 0; i < adj.length; i++) {
        if (!inSel[adj[i]]) { rem.push(f); break }
      }
    }
    if (rem.length === 0) break
    for (const f of rem) inSel[f] = 0
  }
}

/**
 * Reconstrói um contorno de corte limpo, suave e imprimível a partir da seleção
 * crua do SmartCut. Este é o coração do modo "AutoCut AI – Smart Contour".
 *
 * Filosofia: NÃO copiar a triangulação. Interpretar a forma. O algoritmo opera
 * sobre o CONJUNTO de faces (topologia real da malha) — logo o corte continua
 * caminhando por arestas reais e permanece estanque (watertight) — mas a
 * fronteira é reconstruída para ficar contínua, sem serrilhado nem dentes.
 *
 * Pipeline:
 *   0. Detecção de relevo (curvatura) → protege mechas/pontas/volumes reais.
 *   1. Fechamento morfológico (dilata→erode): preenche entalhes, vales de
 *      serrilhado e micro-buracos de triangulação.
 *   2. Abertura morfológica (erode→dilata) protegida por relevo: remove dentes,
 *      farpas e pontas artificiais — sem apagar os fios de cabelo verdadeiros.
 *   3. Curvature-flow (votação de vizinhança) protegida: alisa a fronteira
 *      restante como um fluxo de curvatura discreto.
 *   4. Limpeza por área: cacos soltos saem, furos minúsculos são tapados.
 *   5. Guarda de imprimibilidade: elimina pescoços/pontes de 1 face (paredes
 *      finas demais para FDM/resina).
 */
export function refineSelectionForPrint(
  geometry: THREE.BufferGeometry,
  selected: Set<number>,
  options: Partial<ContourRefineOptions> = {}
): Set<number> {
  const opts = { ...DEFAULT_CONTOUR, ...options }
  if (selected.size === 0) return new Set(selected)

  buildAdjacencyCache(geometry)
  const cache = geomCache.get(geometry)
  if (!cache) return new Set(selected)
  const { adjList, faceNormals, faceCount } = cache

  const areas = computeFaceAreas(geometry)
  let totalArea = 0
  for (const f of selected) totalArea += areas[f]
  const minArea = Math.max(totalArea * opts.minAreaFraction, 0)
  const cosFeature = Math.cos((opts.featureAngle * Math.PI) / 180)

  // Raio morfológico adaptativo pela intensidade (1..4 faces).
  const strength = Math.max(0, Math.min(1, opts.strength))
  const k = Math.max(1, Math.round(1 + strength * 3))
  const smoothIters = Math.max(0, Math.round(opts.smoothIterations * (0.4 + strength)))

  // ── 0. Curvatura local por face = desvio máximo de normal p/ vizinhos ───────
  // Faces com curvatura alta ficam sobre relevo real (mecha, ponta, volume) e
  // são protegidas da erosão — o que preserva os detalhes que importam.
  const isFeature = new Uint8Array(faceCount)
  for (let f = 0; f < faceCount; f++) {
    const adj = adjList[f]
    const nx = faceNormals[f*3], ny = faceNormals[f*3+1], nz = faceNormals[f*3+2]
    let minDot = 1
    for (let i = 0; i < adj.length; i++) {
      const nb = adj[i]
      const dot = nx*faceNormals[nb*3] + ny*faceNormals[nb*3+1] + nz*faceNormals[nb*3+2]
      if (dot < minDot) minDot = dot
    }
    if (minDot < cosFeature) isFeature[f] = 1
  }

  const inSel = new Uint8Array(faceCount)
  for (const f of selected) inSel[f] = 1

  // ── 1. Fechamento morfológico: preenche entalhes e vales de serrilhado ──────
  dilateSelection(inSel, k, adjList)
  erodeSelection(inSel, k, adjList, isFeature)

  // ── 2. Abertura morfológica: remove dentes e farpas (relevo preservado) ─────
  erodeSelection(inSel, k, adjList, isFeature)
  dilateSelection(inSel, k, adjList)

  // ── 3. Curvature-flow: alisa a fronteira remanescente por votação ──────────
  let cur = inSel
  for (let it = 0; it < smoothIters; it++) {
    const next = cur.slice()
    let changed = false
    for (let f = 0; f < faceCount; f++) {
      const adj = adjList[f]
      const n = adj.length
      if (n === 0) continue
      let diff = 0
      for (let i = 0; i < n; i++) if (cur[adj[i]] !== cur[f]) diff++
      const frac = diff / n
      if (frac < opts.flipRatio) continue
      // relevo real só inverte se o anel inteiro discordar (ruído gritante)
      if (isFeature[f] && frac < 0.85) continue
      next[f] = cur[f] ^ 1
      changed = true
    }
    cur = next
    if (!changed) break
  }
  cur.forEach((v, f) => { inSel[f] = v })

  // ── 4. Limpeza de ilhas e buracos por área ─────────────────────────────────
  removeSmallComponents(inSel, 1, adjList, areas, minArea) // cacos soltos → fora
  removeSmallComponents(inSel, 0, adjList, areas, minArea) // furos pequenos → dentro

  // ── 5. Guarda de imprimibilidade: elimina pescoços/pontes de 1 face ─────────
  if (opts.printGuard) {
    for (let pass = 0; pass < 2; pass++) {
      const rem: number[] = []
      for (let f = 0; f < faceCount; f++) {
        if (!inSel[f] || isFeature[f]) continue
        const adj = adjList[f]
        const n = adj.length
        if (n === 0) continue
        let selN = 0
        for (let i = 0; i < n; i++) if (inSel[adj[i]]) selN++
        // Menos de 1/3 do anel dentro → parede fina / ponta frágil → remove
        if (selN <= 1 || selN / n < 0.34) rem.push(f)
      }
      if (rem.length === 0) break
      for (const f of rem) inSel[f] = 0
    }
    // Rebalanceia buracos criados pela guarda
    removeSmallComponents(inSel, 0, adjList, areas, minArea)
  }

  const out = new Set<number>()
  for (let f = 0; f < faceCount; f++) if (inSel[f]) out.add(f)
  // segurança: nunca devolver vazio
  return out.size > 0 ? out : new Set(selected)
}

/**
 * Inverte a rotulação (value → value^1) de componentes conexos do lado `value`
 * cuja área total seja menor que `minArea`. Usa a adjacência 1-ring da malha.
 */
function removeSmallComponents(
  inSel: Uint8Array,
  value: number,
  adjList: Int32Array[],
  areas: Float32Array,
  minArea: number
): void {
  if (minArea <= 0) return
  const faceCount = inSel.length
  const visited = new Uint8Array(faceCount)
  const stack = new Int32Array(faceCount)

  for (let start = 0; start < faceCount; start++) {
    if (visited[start] || inSel[start] !== value) continue
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
        if (!visited[nb] && inSel[nb] === value) {
          visited[nb] = 1
          stack[sp++] = nb
        }
      }
    }
    if (area < minArea) {
      for (const f of comp) inSel[f] = value ^ 1
    }
  }
}

// ─── Auto-preenchimento de micro-fragmentos ───────────────────────────────────

export interface AutoFillResult {
  /** Seleção limpa: micro-partículas absorvidas, cacos soltos removidos. */
  cleaned: Set<number>
  /** Faces anteriormente não selecionadas que foram absorvidas. */
  addedFaces: number
  /** Faces anteriormente selecionadas que foram descartadas (cacos soltos). */
  removedFaces: number
}

/**
 * Absorve automaticamente pequenos fragmentos não-selecionados que ficaram de
 * fora da seleção do SmartCut (micro-partículas), e remove cacos selecionados
 * insignificantes isolados do corpo principal.
 *
 * Critério: componentes com área < `minAreaFraction` × área_selecionada total.
 *   • Valor não-selecionado pequeno → absorvido (fill-in)
 *   • Valor selecionado pequeno    → descartado (cleanup)
 *
 * É intencionalmente leve: usa só a limpeza por área (sem morfologia nem
 * suavização) para não alterar o contorno do corte — apenas fecha buracos
 * minúsculos e remove cacos que tornariam o corte não-manifold.
 */
export function autoFillMicroFragments(
  geometry: THREE.BufferGeometry,
  selected: Set<number>,
  minAreaFraction = 0.005,
): AutoFillResult {
  if (selected.size === 0) return { cleaned: new Set(), addedFaces: 0, removedFaces: 0 }

  buildAdjacencyCache(geometry)
  const cache = geomCache.get(geometry)
  if (!cache) return { cleaned: new Set(selected), addedFaces: 0, removedFaces: 0 }
  const { adjList, faceCount } = cache

  const areas = computeFaceAreas(geometry)

  // Área total da seleção → define a escala do limiar
  let selectedArea = 0
  for (const f of selected) selectedArea += areas[f]
  if (selectedArea <= 0) return { cleaned: new Set(selected), addedFaces: 0, removedFaces: 0 }

  const minArea = selectedArea * minAreaFraction

  const inSel = new Uint8Array(faceCount)
  for (const f of selected) inSel[f] = 1

  // 1. Absorve ilhas não-selecionadas pequenas (buracos minúsculos → dentro)
  removeSmallComponents(inSel, 0, adjList, areas, minArea)
  // 2. Remove cacos selecionados pequenos isolados do corpo principal
  removeSmallComponents(inSel, 1, adjList, areas, minArea)

  // Conta diferenças
  let addedFaces = 0, removedFaces = 0
  for (let f = 0; f < faceCount; f++) {
    if (inSel[f]) { if (!selected.has(f)) addedFaces++ }
    else          { if (selected.has(f))  removedFaces++ }
  }

  const cleaned = new Set<number>()
  for (let f = 0; f < faceCount; f++) if (inSel[f]) cleaned.add(f)

  // Segurança: nunca retornar seleção vazia
  return {
    cleaned: cleaned.size > 0 ? cleaned : new Set(selected),
    addedFaces,
    removedFaces,
  }
}

// ─── Pintura de vertex colors ─────────────────────────────────────────────────
const C_SELECTED  : [number, number, number] = [1.00, 0.38, 0.00]  // laranja vivo
const C_HOVER     : [number, number, number] = [1.00, 0.65, 0.10]  // laranja hover
const C_HOVER_SUB : [number, number, number] = [0.20, 0.50, 1.00]  // azul subtract
const C_BASE      : [number, number, number] = [0.50, 0.50, 0.52]  // cinza neutro
const C_DIMMED    : [number, number, number] = [0.10, 0.10, 0.11]  // quase preto

export function ensureColorAttribute(
  geometry: THREE.BufferGeometry,
  material: THREE.MeshStandardMaterial
): THREE.BufferAttribute {
  material.color.set(0xffffff)
  material.vertexColors = true
  material.needsUpdate  = true

  let attr = geometry.getAttribute('color') as THREE.BufferAttribute | null
  if (attr) return attr

  const vertCount = (geometry.getAttribute('position') as THREE.BufferAttribute).count
  const colors    = new Float32Array(vertCount * 3)
  for (let i = 0; i < vertCount; i++) {
    colors[i*3] = C_BASE[0]; colors[i*3+1] = C_BASE[1]; colors[i*3+2] = C_BASE[2]
  }

  attr = new THREE.BufferAttribute(colors, 3)
  attr.setUsage(THREE.DynamicDrawUsage)
  geometry.setAttribute('color', attr)
  return attr
}

function vertexOf(geometry: THREE.BufferGeometry, face: number, corner: number): number {
  const idx  = geometry.index
  const base = face * 3 + corner
  return idx ? idx.getX(base) : base
}

export function paintFaces(
  geometry: THREE.BufferGeometry,
  colorAttr: THREE.BufferAttribute,
  selected: Set<number>,
  hovered: Set<number>,
  mode: 'new' | 'add' | 'subtract'
): void {
  const posAttr   = geometry.getAttribute('position') as THREE.BufferAttribute
  const idxAttr   = geometry.index
  const faceCount = idxAttr ? idxAttr.count / 3 : posAttr.count / 3
  const colors    = colorAttr.array as Float32Array
  const hasSel    = selected.size > 0

  for (let f = 0; f < faceCount; f++) {
    const isSel = selected.has(f)
    const isHov = hovered.has(f)

    let col: [number, number, number]
    if (isSel && isHov && mode === 'subtract') col = C_HOVER_SUB
    else if (isSel)       col = C_SELECTED
    else if (isHov)       col = mode === 'subtract' ? C_BASE : C_HOVER
    else if (hasSel)      col = C_DIMMED
    else                  col = C_BASE

    for (let c = 0; c < 3; c++) {
      const vi = vertexOf(geometry, f, c)
      colors[vi*3] = col[0]; colors[vi*3+1] = col[1]; colors[vi*3+2] = col[2]
    }
  }
  colorAttr.needsUpdate = true
}

export function paintFacesDelta(
  geometry: THREE.BufferGeometry,
  colorAttr: THREE.BufferAttribute,
  prevSelected: Set<number>,
  nextSelected: Set<number>,
  mode: 'new' | 'add' | 'subtract'
): void {
  const colors  = colorAttr.array as Float32Array
  const hasNext = nextSelected.size > 0
  const hadPrev = prevSelected.size > 0

  // Transição entre "sem seleção" e "com seleção": bulk-fill TypedArray em loop
  // compacto (~10× mais rápido que iterar faceCount faces com Set.has()), depois
  // apenas as faces selecionadas recebem a cor laranja por cima.
  if (hadPrev !== hasNext) {
    const [br, bg, bb] = hasNext ? C_DIMMED : C_BASE
    for (let i = 0; i < colors.length; i += 3) {
      colors[i] = br; colors[i + 1] = bg; colors[i + 2] = bb
    }
    const [sr, sg, sb] = C_SELECTED
    for (const f of nextSelected) {
      for (let c = 0; c < 3; c++) {
        const vi = vertexOf(geometry, f, c)
        colors[vi*3] = sr; colors[vi*3+1] = sg; colors[vi*3+2] = sb
      }
    }
    colorAttr.needsUpdate = true
    return
  }

  // Mesmo estado de seleção (ambos vazios ou ambos com faces): pintar só o diff
  const [dr, dg, db] = hasNext ? C_DIMMED : C_BASE
  const [sr, sg, sb] = C_SELECTED
  for (const f of prevSelected) {
    if (nextSelected.has(f)) continue
    for (let c = 0; c < 3; c++) {
      const vi = vertexOf(geometry, f, c)
      colors[vi*3] = dr; colors[vi*3+1] = dg; colors[vi*3+2] = db
    }
  }
  for (const f of nextSelected) {
    if (prevSelected.has(f)) continue
    for (let c = 0; c < 3; c++) {
      const vi = vertexOf(geometry, f, c)
      colors[vi*3] = sr; colors[vi*3+1] = sg; colors[vi*3+2] = sb
    }
  }

  colorAttr.needsUpdate = true
}

export function paintHoverDelta(
  geometry: THREE.BufferGeometry,
  colorAttr: THREE.BufferAttribute,
  selected: Set<number>,
  prevHover: Set<number>,
  nextHover: Set<number>,
  mode: 'new' | 'add' | 'subtract'
): void {
  const colors  = colorAttr.array as Float32Array
  const hasSel  = selected.size > 0

  const paint = (f: number, col: [number, number, number]) => {
    for (let c = 0; c < 3; c++) {
      const vi = vertexOf(geometry, f, c)
      colors[vi*3] = col[0]; colors[vi*3+1] = col[1]; colors[vi*3+2] = col[2]
    }
  }

  for (const f of prevHover) {
    if (nextHover.has(f)) continue
    paint(f, selected.has(f) ? C_SELECTED : hasSel ? C_DIMMED : C_BASE)
  }

  for (const f of nextHover) {
    if (prevHover.has(f)) continue
    if (selected.has(f) && mode !== 'subtract') continue // já laranja
    let col: [number, number, number]
    if (selected.has(f) && mode === 'subtract') col = C_HOVER_SUB
    else col = mode === 'subtract' ? C_BASE : C_HOVER
    paint(f, col)
  }

  colorAttr.needsUpdate = true
}

// ─── Normais suaves por POSIÇÃO (superfície lisa, sem facetas) ─────────────────
/**
 * Recalcula as normais suavizando por posição do vértice.
 *
 * Modelos STL/OBJ costumam ter vértices duplicados (um por triângulo). Com
 * `computeVertexNormals` cada face fica com sua própria normal → aparência
 * facetada (todos os triângulos visíveis, parecendo "só a malha").
 *
 * Aqui somamos as normais de todas as faces que compartilham a MESMA posição
 * e atribuímos a média a cada vértice. Resultado: superfície lisa, mantendo os
 * vértices independentes que o sistema de pintura por face precisa.
 */
export function computeSmoothNormalsByPosition(geometry: THREE.BufferGeometry): void {
  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute
  const idxAttr = geometry.index
  const vertCount = posAttr.count
  const faceCount = idxAttr ? idxAttr.count / 3 : vertCount / 3

  // Hash numérico 48-bit — elimina string allocation vs versão anterior
  const QN = 10, OFFN = 32768
  const keyN = (v: number): number => {
    const x = (Math.round(posAttr.getX(v) * QN) + OFFN) & 0xFFFF
    const y = (Math.round(posAttr.getY(v) * QN) + OFFN) & 0xFFFF
    const z = (Math.round(posAttr.getZ(v) * QN) + OFFN) & 0xFFFF
    return x + y * 65536 + z * 65536 * 65536
  }

  // Acumula a normal (ponderada por área) por posição
  const accum = new Map<number, [number, number, number]>()

  for (let f = 0; f < faceCount; f++) {
    const a = idxAttr ? idxAttr.getX(f * 3)     : f * 3
    const b = idxAttr ? idxAttr.getX(f * 3 + 1) : f * 3 + 1
    const c = idxAttr ? idxAttr.getX(f * 3 + 2) : f * 3 + 2

    const ax = posAttr.getX(a), ay = posAttr.getY(a), az = posAttr.getZ(a)
    const bx = posAttr.getX(b), by = posAttr.getY(b), bz = posAttr.getZ(b)
    const cx = posAttr.getX(c), cy = posAttr.getY(c), cz = posAttr.getZ(c)

    const nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay)
    const ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az)
    const nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)

    for (const v of [a, b, c]) {
      const k = keyN(v)
      const cur = accum.get(k)
      if (cur) { cur[0] += nx; cur[1] += ny; cur[2] += nz }
      else accum.set(k, [nx, ny, nz])
    }
  }

  const normals = new Float32Array(vertCount * 3)
  for (let v = 0; v < vertCount; v++) {
    const n = accum.get(keyN(v))
    if (n) {
      const len = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]) || 1
      normals[v * 3]     = n[0] / len
      normals[v * 3 + 1] = n[1] / len
      normals[v * 3 + 2] = n[2] / len
    }
  }

  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  ;(geometry.getAttribute('normal') as THREE.BufferAttribute).needsUpdate = true
}

// ─── Tampa do corte (preenche a seção → peça maciça) ──────────────────────────
/**
 * Gera triângulos que fecham o contorno aberto de um conjunto de faces.
 *
 * Algoritmo robusto:
 *  1. Quantiza vértices e solda duplicados (STL binário tem verts duplicados).
 *  2. Encontra arestas de borda: aresta presente em só uma direção.
 *  3. Monta loops fechados via chain-following com um nextPtr por nó.
 *  4. Delega para generateCap (high-quality 11-step pipeline):
 *       Catmull-Rom reconstruction → contour fairing → concentric rings
 *       → Taubin solver → adaptive fairing → per-vertex smooth normals.
 */
export function buildCap(
  geometry: THREE.BufferGeometry,
  faceSet: Set<number> | number[],
  weldQ = 1e4
): { pos: Float32Array; nrm: Float32Array } {
  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute
  const idxAttr = geometry.index
  const faces = Array.isArray(faceSet) ? faceSet : Array.from(faceSet)
  if (faces.length === 0) return { pos: new Float32Array(0), nrm: new Float32Array(0) }

  // ── 1. Quantização e soldagem de vértices ──────────────────────────────────
  const Q = weldQ
  const keyToId = new Map<string, number>()
  const idPx: number[] = [] // posição x,y,z por ID

  const vId = (v: number): number => {
    const k = `${Math.round(posAttr.getX(v) * Q)},${Math.round(posAttr.getY(v) * Q)},${Math.round(posAttr.getZ(v) * Q)}`
    let id = keyToId.get(k)
    if (id === undefined) {
      id = idPx.length / 3
      keyToId.set(k, id)
      idPx.push(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v))
    }
    return id
  }

  // ── 2. Arestas direcionadas — borda = aresta sem reverso ───────────────────
  // Usa string-key para evitar colisão numérica com modelos grandes
  const dirEdgeSet = new Set<string>()
  const facesIds: Array<[number, number, number]> = []

  for (const f of faces) {
    const a = vId(idxAttr ? idxAttr.getX(f * 3)     : f * 3)
    const b = vId(idxAttr ? idxAttr.getX(f * 3 + 1) : f * 3 + 1)
    const c = vId(idxAttr ? idxAttr.getX(f * 3 + 2) : f * 3 + 2)
    facesIds.push([a, b, c])
    dirEdgeSet.add(`${a}>${b}`)
    dirEdgeSet.add(`${b}>${c}`)
    dirEdgeSet.add(`${c}>${a}`)
  }

  // Grafo direcionado de arestas de borda: para cada nó, lista de saídas
  const outEdges = new Map<number, number[]>()
  for (const [a, b, c] of facesIds) {
    for (const [x, y] of [[a, b], [b, c], [c, a]] as [number, number][]) {
      // Aresta de borda: x→y existe mas y→x não existe
      if (!dirEdgeSet.has(`${y}>${x}`)) {
        // Tampa: percorremos y→x (inverso) para orientar a face "para fora"
        let list = outEdges.get(y)
        if (!list) { list = []; outEdges.set(y, list) }
        if (!list.includes(x)) list.push(x)
      }
    }
  }

  if (outEdges.size === 0) return { pos: new Float32Array(0), nrm: new Float32Array(0) }

  // ── 3. Chain-following: extrai loops fechados ──────────────────────────────
  const nextPtr = new Map<number, number>()
  interface RawLoop { ids: number[] }
  const rawLoops: RawLoop[] = []

  for (const [startNode] of outEdges) {
    while (true) {
      const ptr = nextPtr.get(startNode) ?? 0
      const outs = outEdges.get(startNode)
      if (!outs || ptr >= outs.length) break

      const chain: number[] = []
      let cur = startNode
      const maxSteps = idPx.length / 3 + 4
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

      if (closed && chain.length >= 3) rawLoops.push({ ids: chain })
    }
  }

  if (rawLoops.length === 0) return { pos: new Float32Array(0), nrm: new Float32Array(0) }

  // ── 4. High-quality cap generation via generateCap pipeline ───────────────
  const allPos: number[] = []
  const allNrm: number[] = []

  for (const { ids } of rawLoops) {
    const pts3d = ids.map(id => new THREE.Vector3(idPx[id * 3], idPx[id * 3 + 1], idPx[id * 3 + 2]))
    if (pts3d.length < 3) continue

    const { pos, nrm } = generateCap(pts3d)
    for (let i = 0; i < pos.length; i++) allPos.push(pos[i])
    for (let i = 0; i < nrm.length; i++) allNrm.push(nrm[i])
  }

  return { pos: new Float32Array(allPos), nrm: new Float32Array(allNrm) }
}

// ─── Remoção de faces (a parte cortada "some") ────────────────────────────────
/**
 * Gera uma nova geometria contendo TODAS as faces EXCETO as selecionadas.
 * Usada pelo botão "Cortar": a parte selecionada desaparece do modelo.
 *
 * A seção do corte é fechada com uma tampa (buildCap) para a peça restante
 * ficar maciça em vez de oca.
 */
export function removeSubMesh(
  geometry: THREE.BufferGeometry,
  facesToRemove: Set<number>,
  weldQ = 1e4
): THREE.BufferGeometry {
  const posAttr    = geometry.getAttribute('position') as THREE.BufferAttribute
  const normalAttr = geometry.getAttribute('normal')   as THREE.BufferAttribute | null
  const uvAttr     = geometry.getAttribute('uv')       as THREE.BufferAttribute | null
  const idxAttr    = geometry.index
  const faceCount  = idxAttr ? idxAttr.count / 3 : posAttr.count / 3

  // Faces que permanecem
  const keepFaces: number[] = []
  for (let f = 0; f < faceCount; f++) {
    if (!facesToRemove.has(f)) keepFaces.push(f)
  }

  // Tampa que fecha a seção do corte (contorno aberto das faces mantidas)
  const cap = buildCap(geometry, keepFaces, weldQ)
  const capVerts = cap.pos.length / 3

  const shellVerts = keepFaces.length * 3
  const vCount     = shellVerts + capVerts
  const newPos     = new Float32Array(vCount * 3)
  const newNormal  = new Float32Array(vCount * 3)
  const newUV      = uvAttr ? new Float32Array(vCount * 2) : null

  let w = 0
  for (const f of keepFaces) {
    for (let c = 0; c < 3; c++) {
      const v = idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c
      newPos[w * 3]     = posAttr.getX(v)
      newPos[w * 3 + 1] = posAttr.getY(v)
      newPos[w * 3 + 2] = posAttr.getZ(v)
      if (normalAttr) {
        newNormal[w * 3]     = normalAttr.getX(v)
        newNormal[w * 3 + 1] = normalAttr.getY(v)
        newNormal[w * 3 + 2] = normalAttr.getZ(v)
      }
      if (newUV) {
        newUV[w * 2]     = uvAttr!.getX(v)
        newUV[w * 2 + 1] = uvAttr!.getY(v)
      }
      w++
    }
  }

  // Anexa os vértices da tampa
  if (capVerts > 0) {
    newPos.set(cap.pos, shellVerts * 3)
    newNormal.set(cap.nrm, shellVerts * 3)
    // UV da tampa fica em (0,0) — o array já vem zerado
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(newPos, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(newNormal, 3))
  if (newUV) geo.setAttribute('uv', new THREE.Float32BufferAttribute(newUV, 2))
  // Sempre recalcula normais para garantir consistência com a nova tampa
  geo.computeVertexNormals()
  geo.computeBoundingBox()
  geo.computeBoundingSphere()
  return geo
}

// ─── Extração de sub-malha com smoothing de normais ───────────────────────────
/**
 * Extrai as faces selecionadas e reconstrói normais suaves por posição.
 * Elimina o efeito de "triângulos soltos" na exportação.
 *
 * A seção aberta do corte é FECHADA com uma tampa (buildCap), tornando a peça
 * um volume fechado (watertight) → o fatiador a imprime MACIÇA (com preenchimento),
 * e não como uma casca oca. Passe `cap = false` para obter só a casca.
 */
export function extractSubMesh(
  geometry: THREE.BufferGeometry,
  selectedFaces: Set<number>,
  cap = true,
  weldQ = 1e5
): THREE.BufferGeometry {
  const posAttr  = geometry.getAttribute('position') as THREE.BufferAttribute
  const uvAttr   = geometry.getAttribute('uv')       as THREE.BufferAttribute | null
  const idxAttr  = geometry.index
  const faceArr  = Array.from(selectedFaces)
  const maxV     = faceArr.length * 3

  // ── Coletar vértices únicos por posição para soldagem ──────────────────────
  const Q = weldQ
  const posKey = (v: number) => {
    const x = Math.round(posAttr.getX(v) * Q)
    const y = Math.round(posAttr.getY(v) * Q)
    const z = Math.round(posAttr.getZ(v) * Q)
    return `${x},${y},${z}`
  }

  // uid unificado por posição → novo índice
  const uidToNew = new Map<string, number>()
  const newPos: number[] = []
  const newUV:  number[] = []

  const faceRaw: number[] = [] // [a0,b0,c0, a1,b1,c1 ...] raw indices originais

  for (const fi of faceArr) {
    const b3 = fi * 3
    const a  = idxAttr ? idxAttr.getX(b3)   : b3
    const b  = idxAttr ? idxAttr.getX(b3+1) : b3+1
    const c  = idxAttr ? idxAttr.getX(b3+2) : b3+2
    faceRaw.push(a, b, c)
  }

  const rawToNew = new Int32Array(faceRaw.length)
  for (let i = 0; i < faceRaw.length; i++) {
    const v   = faceRaw[i]
    const key = posKey(v)
    let nv    = uidToNew.get(key)
    if (nv === undefined) {
      nv = newPos.length / 3
      uidToNew.set(key, nv)
      newPos.push(posAttr.getX(v), posAttr.getY(v), posAttr.getZ(v))
      if (uvAttr) newUV.push(uvAttr.getX(v), uvAttr.getY(v))
    }
    rawToNew[i] = nv
  }

  const vertCount = newPos.length / 3
  const newIdx    = new Uint32Array(faceRaw.length)
  for (let i = 0; i < faceRaw.length; i++) newIdx[i] = rawToNew[i]

  // ── Normais suaves: acumular contribuição de cada face em cada vértice ──────
  const normals = new Float32Array(vertCount * 3) // zero init

  for (let fi = 0; fi < faceArr.length; fi++) {
    const ia = newIdx[fi*3], ib = newIdx[fi*3+1], ic = newIdx[fi*3+2]

    const ax = newPos[ia*3], ay = newPos[ia*3+1], az = newPos[ia*3+2]
    const bx = newPos[ib*3], by = newPos[ib*3+1], bz = newPos[ib*3+2]
    const cx = newPos[ic*3], cy = newPos[ic*3+1], cz = newPos[ic*3+2]

    // Normal da face (não normalizada = peso pela área)
    const nx = (by-ay)*(cz-az) - (bz-az)*(cy-ay)
    const ny = (bz-az)*(cx-ax) - (bx-ax)*(cz-az)
    const nz = (bx-ax)*(cy-ay) - (by-ay)*(cx-ax)

    for (const vi of [ia, ib, ic]) {
      normals[vi*3]   += nx
      normals[vi*3+1] += ny
      normals[vi*3+2] += nz
    }
  }

  // Normalizar
  for (let v = 0; v < vertCount; v++) {
    const len = Math.sqrt(
      normals[v*3]**2 + normals[v*3+1]**2 + normals[v*3+2]**2
    )
    if (len > 1e-10) {
      normals[v*3]   /= len
      normals[v*3+1] /= len
      normals[v*3+2] /= len
    }
  }

  // ── Tampa: fecha a seção do corte → peça MACIÇA (volume fechado) ────────────
  // Sem a tampa, a peça é uma casca aberta e o fatiador não consegue preenchê-la.
  // buildCap gera os triângulos que tapam o(s) contorno(s) aberto(s) da seleção,
  // com orientação autoconsistente para este conjunto de faces.
  const capData = cap
    ? buildCap(geometry, selectedFaces, weldQ)
    : { pos: new Float32Array(0), nrm: new Float32Array(0) }
  const capVertCount = capData.pos.length / 3

  const shellVertCount = vertCount                    // vértices soldados da casca
  const totalVertCount = shellVertCount + capVertCount

  // Posições: casca soldada + vértices da tampa (sopa de triângulos)
  const finalPos = new Float32Array(totalVertCount * 3)
  finalPos.set(newPos, 0)
  if (capVertCount > 0) finalPos.set(capData.pos, shellVertCount * 3)

  // Normais: casca (suaves) + tampa (planas)
  const finalNrm = new Float32Array(totalVertCount * 3)
  finalNrm.set(normals, 0)
  if (capVertCount > 0) finalNrm.set(capData.nrm, shellVertCount * 3)

  // Índices: casca (indexada) + tampa (índices sequenciais)
  const finalIdx = new Uint32Array(newIdx.length + capVertCount)
  finalIdx.set(newIdx, 0)
  for (let i = 0; i < capVertCount; i++) finalIdx[newIdx.length + i] = shellVertCount + i

  // UV: tampa fica em (0,0) — array já vem zerado
  let finalUV: Float32Array | null = null
  if (uvAttr) {
    finalUV = new Float32Array(totalVertCount * 2)
    finalUV.set(newUV, 0)
  }

  // ── Montar geometria final ─────────────────────────────────────────────────
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(finalPos, 3))
  geo.setAttribute('normal',   new THREE.BufferAttribute(finalNrm, 3))
  if (finalUV) geo.setAttribute('uv', new THREE.Float32BufferAttribute(finalUV, 2))
  geo.setIndex(new THREE.BufferAttribute(finalIdx, 1))
  geo.computeBoundingBox()
  geo.computeBoundingSphere()
  return geo
}
