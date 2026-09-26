/**
 * Deep Cut — Corte Profundo com alojamento + encaixe complementar de precisão.
 *
 * Extensão OPCIONAL do AutoCut: quando desligado, nada aqui é executado e o
 * pipeline normal (CALCULAR → TAMPAS → APLICAR) funciona exatamente como antes.
 *
 * Quando ligado, entra a etapa CALCULAR INTERFACE PROFUNDA entre o corte e as
 * tampas, produzindo a partir da MESMA referência geométrica (master):
 *
 *   Selection Boundary (contorno preservado, sem reinterpretar a seleção)
 *        ↓
 *   Master Interface (loops 3D + direção de assentamento local)
 *       ↙ ↘
 *   Cavidade (negativo, na peça principal)   Encaixe (plug, na peça removida)
 *
 * Regras garantidas:
 *  - Direção SEGUE A SUPERFÍCIE LOCAL (mold pull direction do seam), nunca
 *    eixo global X/Y/Z — correto em superfícies curvas e inclinadas.
 *  - Profundidade EXATA (tradução geométrica precisa, verificada por medição).
 *  - Clearance lateral configurável SÓ no plug (visual principal intacto) +
 *    folga axial interna fixa; nunca misturados com a profundidade.
 *  - Tampa considera a nova geometria (pisos da cavidade e do plug).
 *  - Espessura disponível ≥ profundidade + parede, senão erro claro.
 *  - Geometria protegida é READ-ONLY (teste de coluna antes de aplicar).
 *  - Peças resultantes SEMPRE fechadas (gate watertight interno).
 */

import * as THREE from 'three'
import { generateCap } from './cap-generation'
import { countOpenEdges } from './quality-cut'
import { computeSmoothNormalsByPosition, buildCap } from './smart-cut'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { orientOutward, measureThickness } from './encaixe'
import type { ProtectedArtifact } from './protection'

// ─── Parâmetros ─────────────────────────────────────────────────────────────────

export interface DeepCutParams {
  /** Profundidade do alojamento (mm). Exata por construção. */
  depth: number
  /** Folga lateral do plug (mm). Só no encaixe, nunca na cavidade. */
  clearance: number
}

export const DEEP_MIN_DEPTH = 0.5
export const DEEP_MAX_DEPTH = 5
export const DEEP_MIN_CLEARANCE = 0
export const DEEP_MAX_CLEARANCE = 0.3
export const DEEP_DEFAULT_DEPTH = 1.5
export const DEEP_DEFAULT_CLEARANCE = 0.1
/** Folga axial interna (fundo do plug × piso da cavidade). Fixa, não é UI. */
const AXIAL_CLEAR = 0.1
/** Parede mínima de material sob a cavidade. */
const MIN_WALL = 0.5

export function sanitizeDeepParams(p: Partial<DeepCutParams>): DeepCutParams {
  const depth = Number.isFinite(p.depth)
    ? Math.max(DEEP_MIN_DEPTH, Math.min(DEEP_MAX_DEPTH, p.depth!))
    : DEEP_DEFAULT_DEPTH
  const clearance = Number.isFinite(p.clearance)
    ? Math.max(DEEP_MIN_CLEARANCE, Math.min(DEEP_MAX_CLEARANCE, p.clearance!))
    : DEEP_DEFAULT_CLEARANCE
  return { depth, clearance }
}

// ─── CutDefinition (§17): representação comum ───────────────────────────────────

export interface DeepCutDefinition {
  /** Loops 3D da borda (rim) — referência mestra compartilhada. */
  loopsSel: THREE.Vector3[][]
  loopsBody: THREE.Vector3[][]
  /** Direção de assentamento (para DENTRO do corpo). Segue a superfície local. */
  seatingDir: THREE.Vector3
  depth: number
  clearance: number
  weldQ: number
  /** Centroide do rim mestre (peça) — referência das medições do plug. */
  rimCentroid: THREE.Vector3
  /** Centroide do rim do corpo (boca da cavidade) — referência da cavidade. */
  bodyCentroid: THREE.Vector3
}

// ─── Extração de loops de borda ─────────────────────────────────────────────────

function loopKey(x: number, y: number, z: number, Q: number): string {
  return `${Math.round(x * Q)},${Math.round(y * Q)},${Math.round(z * Q)}`
}

/**
 * Extrai os loops fechados de borda de uma casca aberta (arestas usadas 1×),
 * ordenados do maior para o menor (nº de vértices). Suporta indexado e soup.
 *
 * `anchor` (opcional): geometria de referência (a outra casca). Em bifurcações
 * o passeio prefere arestas próximas da âncora — ancora o loop na boca que
 * realmente acasala, em vez de vagar por slits/cracks internos. É o que
 * separa a boca verdadeira (compartilhada, dist ~0) de um detour interior.
 */
export function extractBoundaryLoops(
  geo: THREE.BufferGeometry,
  weldQ: number,
  anchor?: THREE.BufferGeometry,
): THREE.Vector3[][] {
  const posAttr = geo.getAttribute('position') as THREE.BufferAttribute | null
  if (!posAttr || posAttr.count < 3) return []
  const idx = geo.index
  const Q = weldQ
  const vPos = (vi: number): [number, number, number] => [posAttr.getX(vi), posAttr.getY(vi), posAttr.getZ(vi)]
  const vOf = (f: number, c: number): number => (idx ? idx.getX(f * 3 + c) : f * 3 + c)
  const faceCount = idx ? idx.count / 3 : Math.floor(posAttr.count / 3)

  // Arestas → contagem (quantizadas) + representante.
  // ANTES de contar: union-find de vértices coincidentes (tol de poeira
  // float). Malhas reais têm vértices DUPLICADOS na mesma posição (costura
  // UV de esferas/cilindros, splits de exportação): sem unificar, cada lado
  // da costura vira "borda" fantasma e o extrator segue a costura em vez da
  // fronteira real. IDs canônicos = representativos do union-find.
  const vertCount = posAttr.count
  const parent = new Int32Array(vertCount)
  for (let i = 0; i < vertCount; i++) parent[i] = i
  const find = (a: number): number => {
    let r = a
    while (parent[r] !== r) r = parent[r]
    while (parent[a] !== a) { const t = parent[a]; parent[a] = r; a = t }
    return r
  }
  const union = (a: number, b: number): void => {
    const ra = find(a), rb = find(b)
    if (ra !== rb) parent[rb] = ra
  }
  {
    const tolU = 3 / Q // poeira float + duplicatas exatas — NUNCA features reais
    const cellU = Math.max(tolU, 1e-9)
    const kU = (vi: number): string => {
      const [x, y, z] = vPos(vi)
      return `${Math.floor(x / cellU)},${Math.floor(y / cellU)},${Math.floor(z / cellU)}`
    }
    const gridU = new Map<string, number[]>()
    for (let i = 0; i < vertCount; i++) {
      const k = kU(i)
      let arr = gridU.get(k)
      if (!arr) { arr = []; gridU.set(k, arr) }
      arr.push(i)
    }
    const tolU2 = tolU * tolU
    const pv = new THREE.Vector3()
    const qv = new THREE.Vector3()
    for (let i = 0; i < vertCount; i++) {
      const [x, y, z] = vPos(i)
      const cx = Math.floor(x / cellU), cy = Math.floor(y / cellU), cz = Math.floor(z / cellU)
      for (let ix = cx - 1; ix <= cx + 1; ix++) {
        for (let iy = cy - 1; iy <= cy + 1; iy++) {
          for (let iz = cz - 1; iz <= cz + 1; iz++) {
            const arr = gridU.get(`${ix},${iy},${iz}`)
            if (!arr) continue
            pv.set(x, y, z)
            for (const j of arr) {
              if (j <= i) continue
              if (find(i) === find(j)) continue
              const [jx, jy, jz] = vPos(j)
              qv.set(jx, jy, jz)
              if (pv.distanceToSquared(qv) <= tolU2) union(i, j)
            }
          }
        }
      }
    }
  }
  const edgeCnt = new Map<string, number>()
  const edgeRep = new Map<string, [number, number]>()
  for (let f = 0; f < faceCount; f++) {
    const vs = [vOf(f, 0), vOf(f, 1), vOf(f, 2)]
    if (vs[0] === vs[1] || vs[1] === vs[2] || vs[0] === vs[2]) continue
    // Chaves pelos IDs canônicos (costura unificada)
    const ck = vs.map((vi) => find(vi))
    if (ck[0] === ck[1] || ck[1] === ck[2] || ck[0] === ck[2]) continue // degenerada pós-union
    const ks = ck.map((ci) => {
      // Posição representativa do canônico: primeiro vértice do grupo
      const [x, y, z] = vPos(ci)
      return loopKey(x, y, z, Q)
    })
    const edges: [string, [number, number]][] = [
      [ks[0] < ks[1] ? `${ks[0]}|${ks[1]}` : `${ks[1]}|${ks[0]}`, [vs[0], vs[1]]],
      [ks[1] < ks[2] ? `${ks[1]}|${ks[2]}` : `${ks[2]}|${ks[1]}`, [vs[1], vs[2]]],
      [ks[0] < ks[2] ? `${ks[0]}|${ks[2]}` : `${ks[2]}|${ks[0]}`, [vs[0], vs[2]]],
    ]
    for (const [k, rep] of edges) {
      edgeCnt.set(k, (edgeCnt.get(k) ?? 0) + 1)
      if (!edgeRep.has(k)) edgeRep.set(k, rep)
    }
  }

  // Grafo NÃO-dirigido das arestas de borda (ambas as direções: o winding da
  // casca pode variar e o chain-following precisa fechar de qualquer jeito;
  // duplicatas reversas são removidas depois por assinatura).
  const keyToId = new Map<string, number>()
  const idPos: THREE.Vector3[] = []
  const idOf = (k: string, vi: number): number => {
    let id = keyToId.get(k)
    if (id === undefined) {
      id = idPos.length
      keyToId.set(k, id)
      const [x, y, z] = vPos(vi)
      idPos.push(new THREE.Vector3(x, y, z))
    }
    return id
  }
  // Posição canônica por key — remove o canon confuso; idOf já guarda a
  // posição do primeiro vértice visto (todos coincidem no quantum).
  const outEdges = new Map<number, number[]>()
  const link = (a: number, b: number) => {
    if (a === b) return
    const la = outEdges.get(a)
    if (la) { if (!la.includes(b)) la.push(b) }
    else outEdges.set(a, [b])
  }
  for (const [k, cnt] of edgeCnt) {
    if (cnt !== 1) continue
    const [ka, kb] = k.split('|')
    const rep = edgeRep.get(k)!
    // Descobre qual vértice original corresponde a cada key (recalcula).
    const rk0 = loopKey(...vPos(rep[0]), Q)
    const vka = rk0 === ka ? rep[0] : rep[1]
    const vkb = vka === rep[0] ? rep[1] : rep[0]
    const a = idOf(ka, vka)
    const b = idOf(kb, vkb)
    link(a, b)
    link(b, a)
  }

  // Chain-following: de cada aresta dirigida ainda livre, passeia escolhendo
  // sempre a continuação MAIS RETA (menor ângulo de virada). Em bocas limpas
  // (grau 2 em todo nó) é determinístico e nunca falha; em bifurcações de
  // cracks, preserva o loop suave em vez de vagar pela malha. Sem voltar ao
  // anterior, sem revisitar nó; só fecha voltando ao início com ≥3 nós.
  // Arestas usadas (sucesso ou beco) são marcadas globalmente → termina.
  // Duplicatas reversas caem no dedupe por assinatura abaixo.
  const usedEdge = new Set<string>()
  const loops: THREE.Vector3[][] = []
  const edgeKey = (a: number, b: number) => `${a}>${b}`
  // Ordem determinística: nós e vizinhos crescentes
  const nodes = [...outEdges.keys()].sort((a, b) => a - b)
  for (const n of nodes) outEdges.get(n)!.sort((a, b) => a - b)
  const posOf = (id: number): THREE.Vector3 => idPos[id]
  // Grade da âncora (outra casca): distância de um candidato à boca real.
  let anchorDist: ((p: THREE.Vector3) => number) | null = null
  if (anchor) {
    const ap = anchor.getAttribute('position') as THREE.BufferAttribute | null
    if (ap && ap.count > 0) {
      const cell = 0.5
      const grid = new Map<string, number[]>()
      const kk = (x: number, y: number, z: number) =>
        `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`
      for (let i = 0; i < ap.count; i++) {
        const k = kk(ap.getX(i), ap.getY(i), ap.getZ(i))
        let arr = grid.get(k)
        if (!arr) { arr = []; grid.set(k, arr) }
        arr.push(i)
      }
      anchorDist = (p: THREE.Vector3): number => {
        const cx = Math.floor(p.x / cell)
        const cy = Math.floor(p.y / cell)
        const cz = Math.floor(p.z / cell)
        // Expande o raio até 4mm; além disso, retorna 4 (longe).
        for (let r = 0; r <= 8; r++) {
          let best = Infinity
          for (let ix = cx - r; ix <= cx + r; ix++) {
            for (let iy = cy - r; iy <= cy + r; iy++) {
              for (let iz = cz - r; iz <= cz + r; iz++) {
                if (r > 0 && ix > cx - r && ix < cx + r && iy > cy - r && iy < cy + r && iz > cz - r && iz < cz + r) continue
                const arr = grid.get(`${ix},${iy},${iz}`)
                if (!arr) continue
                for (const vi of arr) {
                  const dx = ap.getX(vi) - p.x
                  const dy = ap.getY(vi) - p.y
                  const dz = ap.getZ(vi) - p.z
                  const d2 = dx * dx + dy * dy + dz * dz
                  if (d2 < best) best = d2
                }
              }
            }
          }
          if (best < Infinity) return Math.sqrt(best)
        }
        return 4
      }
    }
  }
  for (const startNode of nodes) {
    for (const first of outEdges.get(startNode)!) {
      if (usedEdge.has(edgeKey(startNode, first))) continue
      const chain: number[] = [startNode, first]
      const visited = new Set<number>([startNode, first])
      const walked: [number, number][] = [[startNode, first]]
      let cur = first
      let prev = startNode
      let closed = false
      const maxSteps = idPos.length + 4
      let steps = 0
      while (steps++ < maxSteps) {
        const inDir = posOf(cur).clone().sub(posOf(prev))
        const inLen2 = inDir.lengthSq()
        let best: number | null = null
        let bestScore = Infinity
        let closes = false
        for (const nxt of outEdges.get(cur) ?? []) {
          if (nxt === prev) continue // nunca volta imediatamente
          const k = edgeKey(cur, nxt)
          if (usedEdge.has(k)) continue
          if (nxt === startNode) {
            if (chain.length >= 3) {
              closes = true
              best = nxt
              break // fechar tem prioridade máxima
            }
            continue // fecha degenerado: ignora esta aresta
          }
          if (visited.has(nxt)) continue // beco: revisita
          const outDir = posOf(nxt).clone().sub(posOf(cur))
          // 0 = reto; âncora puxa para a boca real (longe da âncora = caro).
          const turn = inLen2 < 1e-18 || outDir.lengthSq() < 1e-18
            ? 0
            : 1 - inDir.clone().normalize().dot(outDir.normalize())
          const prox = anchorDist ? Math.min(1.5, anchorDist(posOf(nxt)) / 2) : 0
          const score = turn * 0.5 + prox
          if (score < bestScore) {
            bestScore = score
            best = nxt
          }
        }
        if (closes && best === startNode) {
          walked.push([cur, best])
          closed = true
          break
        }
        if (best === null || best === startNode) break // beco
        walked.push([cur, best])
        visited.add(best)
        chain.push(best)
        prev = cur
        cur = best
      }
      for (const [a, b] of walked) usedEdge.add(edgeKey(a, b))
      if (closed && chain.length >= 3) loops.push(chain.map((id) => idPos[id].clone()))
    }
  }
  // Dedupe: chain bidirecional gera o mesmo loop 2× (normal e reverso).
  // Assinatura = conjunto de pontos quantizados (ordem-independente).
  const seen = new Set<string>()
  const uniq: THREE.Vector3[][] = []
  for (const loop of loops) {
    const sig = loop
      .map((p) => loopKey(p.x, p.y, p.z, Q))
      .sort()
      .join(';')
    if (seen.has(sig)) continue
    seen.add(sig)
    uniq.push(loop)
  }
  uniq.sort((a, b) => b.length - a.length)
  return uniq
}

// ─── Direção de assentamento (segue a superfície local) ─────────────────────────

export interface SeatingInput {
  geometry: THREE.BufferGeometry
  selectedFaces: Set<number>
  seamCenter: THREE.Vector3
  fitNormal: THREE.Vector3
  planeU: THREE.Vector3
  planeV: THREE.Vector3
  seamHalfMin: number
}

/**
 * Mold pull direction: normal externa da superfície na costura (via voto
 * multi-sonda do encaixe) NEGADA = direção de entrada do plug na cavidade.
 * Derivada da geometria local — nunca eixo global.
 */
export function computeSeatingDirection(input: SeatingInput): THREE.Vector3 {
  const probeR = Math.max(0.5, Math.min(3, input.seamHalfMin * 0.25))
  const outward = orientOutward(
    input.geometry,
    input.seamCenter,
    input.fitNormal,
    input.selectedFaces,
    input.planeU,
    input.planeV,
    probeR,
  )
  return outward.negate().normalize()
}

// ─── Construção das paredes + pisos ─────────────────────────────────────────────

function loopCentroid(loop: THREE.Vector3[]): THREE.Vector3 {
  const c = new THREE.Vector3()
  for (const p of loop) c.add(p)
  return c.multiplyScalar(1 / Math.max(1, loop.length))
}

function loopPlaneMinDim(loop: THREE.Vector3[], d: THREE.Vector3): number {
  // Menor dimensão do loop no plano ⊥ d (para sanidade do clearance).
  const c = loopCentroid(loop)
  let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity
  const up = Math.abs(d.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)
  const u = new THREE.Vector3().crossVectors(up, d).normalize()
  const v = new THREE.Vector3().crossVectors(d, u).normalize()
  for (const p of loop) {
    const r = p.clone().sub(c)
    const a = r.dot(u), b = r.dot(v)
    if (a < minU) minU = a
    if (a > maxU) maxU = a
    if (b < minV) minV = b
    if (b > maxV) maxV = b
  }
  return Math.min(maxU - minU, maxV - minV)
}

/**
 * Projeta o rim na casca do corpo: cada vértice ancora no vértice mais
 * próximo do corpo — ESTRITAMENTE dentro da tolerância. Fora dela = null
 * (erro honesto, nunca par esticado que colidiria na montagem).
 * Vértices coincidentes por construção → vedação exata (watertight).
 */
function snapLoopToMesh(
  loop: THREE.Vector3[],
  targetGeo: THREE.BufferGeometry,
  tol: number,
): { pts: THREE.Vector3[]; maxDist: number } | null {
  const posAttr = targetGeo.getAttribute('position') as THREE.BufferAttribute | null
  if (!posAttr || posAttr.count === 0 || loop.length < 3) return null
  const cell = Math.max(tol / 2, 1e-3)
  const R = 3 // cobre a tolerância com folga (3 células de tol/2)
  const keyOf = (x: number, y: number, z: number) =>
    `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`
  const grid = new Map<string, number[]>()
  for (let i = 0; i < posAttr.count; i++) {
    const k = keyOf(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i))
    let arr = grid.get(k)
    if (!arr) { arr = []; grid.set(k, arr) }
    arr.push(i)
  }
  const tol2 = tol * tol
  const out: THREE.Vector3[] = []
  let maxD2 = 0
  for (const p of loop) {
    const cx = Math.floor(p.x / cell)
    const cy = Math.floor(p.y / cell)
    const cz = Math.floor(p.z / cell)
    let best = -1
    let bestD2 = tol2
    for (let ix = cx - R; ix <= cx + R; ix++) {
      for (let iy = cy - R; iy <= cy + R; iy++) {
        for (let iz = cz - R; iz <= cz + R; iz++) {
          const arr = grid.get(`${ix},${iy},${iz}`)
          if (!arr) continue
          for (const vi of arr) {
            const dx = posAttr.getX(vi) - p.x
            const dy = posAttr.getY(vi) - p.y
            const dz = posAttr.getZ(vi) - p.z
            const d2 = dx * dx + dy * dy + dz * dz
            if (d2 < bestD2) { bestD2 = d2; best = vi }
          }
        }
      }
    }
    if (best < 0) return null
    if (bestD2 > maxD2) maxD2 = bestD2
    out.push(new THREE.Vector3(posAttr.getX(best), posAttr.getY(best), posAttr.getZ(best)))
  }
  return { pts: out, maxDist: Math.sqrt(maxD2) }
}

/**
 * Pavimenta bordas residuais (cracks/slits da difusão, contornos extras) com
 * o sistema de tampas existente — mesma resiliência do modo normal. Tenta
 * vários quanta e fica com o melhor fechamento. Se não há borda, devolve a
 * malha intacta.
 */
function sealRemaining(geo: THREE.BufferGeometry, weldQ: number): THREE.BufferGeometry {
  const posAttr = geo.getAttribute('position') as THREE.BufferAttribute | null
  if (!posAttr || posAttr.count === 0) return geo
  const tries = [weldQ, 1e4, 1e5, 1e3].filter((v, i, a) => a.indexOf(v) === i)
  let bestOpen = countOpenEdges(geo, weldQ)
  if (bestOpen === 0) return geo
  // Acumula melhorias sobre o array corrente (nunca sobre base obsoleta)
  let cur = posAttr.array as Float32Array
  for (const q of tries) {
    const trialGeo = new THREE.BufferGeometry()
    trialGeo.setAttribute('position', new THREE.Float32BufferAttribute(cur.slice(), 3))
    const allTrial = new Set<number>()
    const faceTotal = Math.floor(cur.length / 9)
    for (let f = 0; f < faceTotal; f++) allTrial.add(f)
    let cap: { pos: Float32Array; nrm: Float32Array }
    try {
      cap = buildCap(trialGeo, allTrial, q)
    } catch {
      try { trialGeo.dispose() } catch { /* noop */ }
      continue
    }
    try { trialGeo.dispose() } catch { /* noop */ }
    if (cap.pos.length === 0) continue
    const merged = new Float32Array(cur.length + cap.pos.length)
    merged.set(cur, 0)
    merged.set(cap.pos, cur.length)
    const trial = new THREE.BufferGeometry()
    trial.setAttribute('position', new THREE.Float32BufferAttribute(merged, 3))
    const open = countOpenEdges(trial, weldQ)
    try { trial.dispose() } catch { /* noop */ }
    if (open < bestOpen) {
      cur = merged
      bestOpen = open
      if (bestOpen === 0) break
    }
  }
  if (cur !== (posAttr.array as Float32Array)) {
    geo.setAttribute('position', new THREE.Float32BufferAttribute(cur, 3))
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
function insetLoop(loop: THREE.Vector3[], centroid: THREE.Vector3, d: THREE.Vector3, clearance: number): THREE.Vector3[] {
  if (clearance <= 0) return loop.map((p) => p.clone())
  return loop.map((p) => {
    const radial = p.clone().sub(centroid)
    radial.addScaledVector(d, -radial.dot(d))
    const len = radial.length()
    if (len < 1e-9) return p.clone()
    return p.clone().addScaledVector(radial.multiplyScalar(1 / len), -clearance)
  })
}

/**
 * Paredes entre anel superior e inferior. Orientação auto-corrigida: a normal
 * média das paredes deve apontar para FORA do volume (radial+); se apontar
 * para dentro, regenera com winding invertido.
 */
function buildWalls(top: THREE.Vector3[], bottom: THREE.Vector3[]): number[] {
  const emit = (flip: boolean): number[] => {
    const pos: number[] = []
    const n = top.length
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      const t0 = top[i], t1 = top[j], b0 = bottom[i], b1 = bottom[j]
      // Quad degenerado (vértices duplicados pelo snap): pula sem deixar fresta
      if (t0.distanceToSquared(t1) < 1e-12 && b0.distanceToSquared(b1) < 1e-12) continue
      const tris = flip
        ? [t0, b0, b1, t0, b1, t1]
        : [t0, t1, b1, t0, b1, b0]
      for (const p of tris) pos.push(p.x, p.y, p.z)
    }
    return pos
  }
  let pos = emit(false)
  // Checa orientação: normal da 1ª parede × radial deve ser > 0 (para fora)
  const a = new THREE.Vector3(pos[0], pos[1], pos[2])
  const b = new THREE.Vector3(pos[3], pos[4], pos[5])
  const cc = new THREE.Vector3(pos[6], pos[7], pos[8])
  const nrm = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(cc, a))
  const mid = new THREE.Vector3().add(a).add(b).add(cc).multiplyScalar(1 / 3)
  const cen = loopCentroid(top)
  const radial = mid.sub(cen)
  if (nrm.dot(radial) < 0) pos = emit(true)
  return pos
}

/** Piso via generateCap com orientação automática (normal média → desejada). */
function buildFloor(ring: THREE.Vector3[], wantNormal: THREE.Vector3): Float32Array {
  if (ring.length < 3) return new Float32Array(0)
  const plain = generateCap(ring.map((p) => p.clone()), {})
  const mean = new THREE.Vector3()
  for (let i = 0; i < plain.nrm.length; i += 3) {
    mean.x += plain.nrm[i]
    mean.y += plain.nrm[i + 1]
    mean.z += plain.nrm[i + 2]
  }
  if (mean.dot(wantNormal) < 0) {
    const flipped = generateCap(ring.map((p) => p.clone()), { flipped: true })
    return flipped.pos
  }
  return plain.pos
}

// ─── Solda de casca (dust + duplicatas, nunca features) ─────────────────────────

/**
 * Indexa a sopa soldando vértices coincidentes (tolerância ≪ quantum).
 * Espelha o extractSubMesh: elimina slits degenerados e costuras duplicadas
 * para extração de loops limpa. Posições movem no máximo `tol` (invisível).
 * Em falha, devolve a geometria original (extrator decide sozinho).
 */
function weldClosed(geo: THREE.BufferGeometry, tol: number): THREE.BufferGeometry {
  try {
    const pos = geo.getAttribute('position') as THREE.BufferAttribute | null
    if (!pos || pos.count === 0) return geo
    if (geo.index) return geo // já soldada
    const welded = mergeVertices(geo, tol)
    return welded.index ? welded : geo
  } catch {
    return geo
  }
}

// ─── Interface profunda (master compartilhado) ───────────────────────────────────

export interface DeepInterfaceResult {
  deepSelected: THREE.BufferGeometry
  deepBody: THREE.BufferGeometry
  definition: DeepCutDefinition
  /** Profundidade real medida (cavidade e plug). */
  measuredCavity: number
  measuredPlug: number
  warnings: string[]
}

/**
 * CALCULAR INTERFACE PROFUNDA: a partir das cascas abertas do corte,
 * constrói cavidade (corpo) + plug (peça) da MESMA referência (loops + d).
 * Lança erro claro quando inviável (sem loop, sem espessura, clearance
 * excessivo, auto-interseção). Nunca devolve peça aberta.
 */
export function buildDeepInterface(
  openSelected: THREE.BufferGeometry,
  openBody: THREE.BufferGeometry,
  /** Malha original FECHADA (para medir espessura disponível). */
  origBodyGeo: THREE.BufferGeometry,
  def: Omit<DeepCutDefinition, 'loopsSel' | 'loopsBody' | 'rimCentroid' | 'bodyCentroid'>,
): DeepInterfaceResult {
  const { seatingDir, depth, clearance, weldQ } = def
  const d = seatingDir.clone().normalize()
  const warnings: string[] = []

  // ── Solda as cascas (poeira float + duplicatas exatas, nunca features) ────
  // Mesma prática do extractSubMesh: slits degenerados e costuras duplicadas
  // somem; a topologia da borda fica limpa para extração. Tol ≪ quantum.
  const weldTol = 0.5 / weldQ
  const selWelded = weldClosed(openSelected, weldTol)
  const bodyWelded = weldClosed(openBody, weldTol)

  // Rims da peça ancorados na boca real: a extração prefere arestas próximas
  // à casca do corpo (com quem vão acasalar), evitando detours por slits
  // internos. A boca do corpo nunca é caminhada — só seus vértices (snap).
  const loopsSelAll = extractBoundaryLoops(selWelded, weldQ, bodyWelded).filter((l) => l.length >= 3)
  if (loopsSelAll.length === 0) {
    throw new Error('interface profunda: borda da peça selecionada não encontrada — recalcule o corte')
  }
  {
    const bp = bodyWelded.getAttribute('position') as THREE.BufferAttribute | null
    if (!bp || bp.count === 0) {
      throw new Error('interface profunda: casca do corpo vazia — recalcule o corte')
    }
  }

  // ── Rims da peça: um alojamento por contorno significativo ─────────────────
  // Cada lobo da seleção (olho pinçado em 8, ilhas) ganha sua cavidade + plug
  // com a MESMA direção de assentamento. Micro-loops (<4 nós) são ruído e vão
  // para pavimentação plana como no modo normal (gate final decide).
  // Fidelidade à seleção §6: os rims vêm da casca selecionada, sem reinterpretar.
  const significantSel = loopsSelAll.filter((l) => l.length >= 4)
  const masters = (significantSel.length > 0 ? significantSel : loopsSelAll.slice(0, 1))
    .slice()
    .sort((a, b) => b.length - a.length)
  const master = masters[0]
  const rimCentroid = loopCentroid(master)
  if (masters.length > 1) {
    warnings.push(`${masters.length} contornos: um alojamento por contorno, mesma direção`)
  }
  const loopsSel = masters

  // ── Bocas das cavidades = cada rim projetado na casca do corpo ────────────
  // Em vez de caminhar a borda da casca do corpo (frágil a slits/cracks da
  // difusão), ancora cada vértice de cada rim no vértice mais próximo do
  // corpo. Vértices coincidentes por construção → vedação exata (watertight)
  // sem depender da tesselação do outro lado. Sem vértice próximo = erro honesto.
  // Tolerância do snap: cobre a deriva da difusão/relax entre as cascas
  // (tipicamente <0.3mm); deriva maior vira aviso visível, não erro mudo.
  const snapTol = Math.max(1.0, 8 / weldQ)
  const mouths: THREE.Vector3[][] = []
  for (const rim of masters) {
    const snapped = snapLoopToMesh(rim, bodyWelded, snapTol)
    if (!snapped) {
      throw new Error(
        'interface profunda: bocas incompatíveis entre peça e corpo — recalcule o corte (tente o modo Exato)',
      )
    }
    if (snapped.maxDist > 0.3) {
      warnings.push(`bocas com deriva de ${snapped.maxDist.toFixed(2)}mm — encaixe aproximado (tente o modo Exato para precisão máxima)`)
    }
    mouths.push(snapped.pts)
  }
  const loopsBody = mouths
  const biggestMouth = mouths.slice().sort((a, b) => b.length - a.length)[0]
  const bodyCentroid = loopCentroid(biggestMouth)

  // Sanidade do clearance contra o menor loop (evita auto-interseção do inset).
  if (clearance > 0) {
    for (const loop of loopsSel) {
      const minDim = loopPlaneMinDim(loop, d)
      if (minDim < clearance * 4) {
        throw new Error(
          `clearance de ${clearance.toFixed(2)}mm grande demais para o contorno (menor dimensão ${minDim.toFixed(2)}mm) — reduza o clearance`,
        )
      }
    }
  }

  // Espessura disponível (na malha original, ao longo do assentamento,
  // medida na boca da cavidade). measureThickness recebe Mesh (sonda interna).
  const thickness = measureThickness(new THREE.Mesh(origBodyGeo), bodyCentroid, d)
  if (thickness > 0 && thickness < depth + MIN_WALL) {
    throw new Error(
      `sem material para ${depth.toFixed(2)}mm de profundidade (disponível ~${Math.max(0, thickness - MIN_WALL).toFixed(2)}mm) — reduza a profundidade`,
    )
  }
  if (thickness <= 0) {
    warnings.push('espessura não mensurável — verifique o fechamento final no preview')
  }

  // ── Cavidade (corpo): paredes nominais + piso ──────────────────────────
  const bodyPos = readPositions(bodyWelded)
  for (const loop of loopsBody) {
    const bottom = loop.map((p) => p.clone().addScaledVector(d, depth))
    bodyPos.push(...buildWalls(loop.map((p) => p.clone()), bottom))
    const floor = buildFloor(bottom, d.clone().negate())
    for (let i = 0; i < floor.length; i++) bodyPos.push(floor[i])
  }
  const deepBody = sealRemaining(assembleClosed(bodyPos), weldQ)

  // ── Plug (peça): paredes com inset + fundo ─────────────────────────────
  // Paredes CÔNICAS (draft de moldagem): topo EXATO (coincide com o rim da
  // casca → fecha sem fresta e preserva o visual) afunilando até o inset na
  // base. O clearance nominal vale na base; na boca o ajuste é justo.
  const plugLen = Math.max(0.2, depth - AXIAL_CLEAR)
  const selPos = readPositions(selWelded)
  for (const loop of loopsSel) {
    const cen = loopCentroid(loop)
    const topExact = loop.map((p) => p.clone())
    const botIn = insetLoop(loop, cen, d, clearance).map((p) => p.clone().addScaledVector(d, plugLen))
    selPos.push(...buildWalls(topExact, botIn))
    const endCap = buildFloor(botIn, d.clone())
    for (let i = 0; i < endCap.length; i++) selPos.push(endCap[i])
  }
  const deepSelected = sealRemaining(assembleClosed(selPos), weldQ)

  // ── Gates internos: fechamento + profundidade real ─────────────────────
  // Cada lado medido no SEU rim (as bocas divergem na tolerância da difusão).
  const openB = countOpenEdges(deepBody, weldQ)
  const openS = countOpenEdges(deepSelected, weldQ)
  if (openB > 0 || openS > 0) {
    try { deepBody.dispose() } catch { /* noop */ }
    try { deepSelected.dispose() } catch { /* noop */ }
    throw new Error(
      `interface profunda não fechou (corpo: ${openB}, peça: ${openS} arestas) — ajuste a seleção`,
    )
  }
  const measuredCavity = measureDepth(deepBody, bodyCentroid, d)
  const measuredPlug = measurePlug(deepSelected, rimCentroid, d)
  // Tolerância de medição (loops não-planares + fairing do piso): desvio
  // pequeno vira aviso visível, não erro — o bloqueio é só por não-fechar.
  const tol = 0.2
  if (Math.abs(measuredCavity - depth) > tol) {
    warnings.push(`profundidade da cavidade medida ${measuredCavity.toFixed(2)}mm (pedida ${depth.toFixed(2)}mm)`)
  }

  return {
    deepSelected,
    deepBody,
    definition: { loopsSel, loopsBody, seatingDir: d, depth, clearance, weldQ, rimCentroid, bodyCentroid },
    measuredCavity,
    measuredPlug,
    warnings,
  }
}

function readPositions(geo: THREE.BufferGeometry): number[] {
  const attr = geo.getAttribute('position') as THREE.BufferAttribute
  const idx = geo.index
  // Expande por índice quando soldada (sopa com os mesmos triângulos).
  const triCount = idx ? idx.count / 3 : Math.floor(attr.count / 3)
  const out: number[] = new Array(triCount * 9)
  for (let f = 0; f < triCount; f++) {
    for (let c = 0; c < 3; c++) {
      const vi = idx ? idx.getX(f * 3 + c) : f * 3 + c
      out[(f * 3 + c) * 3] = attr.getX(vi)
      out[(f * 3 + c) * 3 + 1] = attr.getY(vi)
      out[(f * 3 + c) * 3 + 2] = attr.getZ(vi)
    }
  }
  return out
}

function assembleClosed(pos: number[]): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(pos), 3))
  try {
    computeSmoothNormalsByPosition(geo)
  } catch {
    geo.computeVertexNormals()
  }
  geo.computeBoundingBox()
  geo.computeBoundingSphere()
  return geo
}

/** Profundidade da cavidade: do plano do rim ao piso, ao longo de d. */
function measureDepth(cavityGeo: THREE.BufferGeometry, rimCentroid: THREE.Vector3, d: THREE.Vector3): number {
  const probe = new THREE.Mesh(cavityGeo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
  // Origem 0.3mm dentro da boca (vazio), ao longo de d; piso a `depth`.
  const origin = rimCentroid.clone().addScaledVector(d, 0.3)
  const ray = new THREE.Raycaster(origin, d.clone())
  ray.near = 1e-4
  ray.far = 1e5
  const hits = ray.intersectObject(probe, false)
  if (hits.length === 0) return 0
  return hits[0].distance + 0.3
}

/** Comprimento do plug: do plano do rim ao fundo, ao longo de d. */
function measurePlug(plugGeo: THREE.BufferGeometry, rimCentroid: THREE.Vector3, d: THREE.Vector3): number {
  // O plug pende para o lado +d do rim; 10mm além é ar (peça isolada).
  // Raio voltando (−d): primeiro impacto = fundo do plug.
  const dd = d.clone().normalize()
  const probe = new THREE.Mesh(plugGeo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
  const FAR = 10
  const origin = rimCentroid.clone().addScaledVector(dd, FAR)
  const ray = new THREE.Raycaster(origin, dd.clone().negate())
  ray.near = 1e-4
  ray.far = 1e5
  const hits = ray.intersectObject(probe, false)
  if (hits.length === 0) return 0
  return FAR - hits[0].distance
}

// ─── Validação antes do corte (§25) ─────────────────────────────────────────────

export interface DeepValidation {
  ok: boolean
  issues: { type: string; message: string }[]
  measuredCavity: number
  measuredPlug: number
}

export function validateDeepCut(
  deepSelected: THREE.BufferGeometry,
  deepBody: THREE.BufferGeometry,
  definition: DeepCutDefinition,
): DeepValidation {
  const issues: { type: string; message: string }[] = []
  // Profundidade com tolerância de medição (aviso transparente); o bloqueio
  // duro é só por peça aberta — ver buildDeepInterface e o gate do apply.
  const tol = 0.2

  const openS = countOpenEdges(deepSelected, definition.weldQ)
  const openB = countOpenEdges(deepBody, definition.weldQ)
  if (openS > 0) issues.push({ type: 'open_boundary', message: `Peça com ${openS} arestas abertas` })
  if (openB > 0) issues.push({ type: 'open_boundary', message: `Corpo com ${openB} arestas abertas` })

  const measuredCavity = measureDepth(deepBody, definition.bodyCentroid, definition.seatingDir)
  const measuredPlug = measurePlug(deepSelected, definition.rimCentroid, definition.seatingDir)
  if (Math.abs(measuredCavity - definition.depth) > tol) {
    issues.push({
      type: 'depth_mismatch',
      message: `Cavidade com ${measuredCavity.toFixed(2)}mm (pedido ${definition.depth.toFixed(2)}mm)`,
    })
  }
  const expectedPlug = Math.max(0.2, definition.depth - AXIAL_CLEAR)
  if (Math.abs(measuredPlug - expectedPlug) > tol) {
    issues.push({
      type: 'depth_mismatch',
      message: `Plug com ${measuredPlug.toFixed(2)}mm (esperado ~${expectedPlug.toFixed(2)}mm)`,
    })
  }

  for (const [geo, label] of [
    [deepSelected, 'peça'],
    [deepBody, 'corpo'],
  ] as const) {
    const pos = geo.getAttribute('position') as THREE.BufferAttribute | null
    const vCount = pos?.count ?? 0
    if (vCount === 0) issues.push({ type: 'empty', message: `${label} vazia` })
    if (!isFinite(vCount)) issues.push({ type: 'invalid', message: `${label} inválida` })
  }

  return { ok: issues.length === 0, issues, measuredCavity, measuredPlug }
}

// ─── Proteção de cortes existentes (§21): coluna × proteções ────────────────────

export function checkDeepVsProtected(
  geometry: THREE.BufferGeometry,
  loops: THREE.Vector3[][],
  seatingDir: THREE.Vector3,
  depth: number,
  artifacts: ProtectedArtifact[],
): string[] {
  if (artifacts.length === 0 || loops.length === 0) return []
  const d = seatingDir.clone().normalize()
  const colBox = new THREE.Box3()
  for (const loop of loops) {
    for (const p of loop) {
      colBox.expandByPoint(p)
      colBox.expandByPoint(p.clone().addScaledVector(d, depth))
    }
  }
  const uuid = (geometry as THREE.BufferGeometry).uuid
  const names: string[] = []
  for (const a of artifacts) {
    if (a.state !== 'PROTECTED' && a.state !== 'COMMITTED') continue
    if (a.meshUuid !== uuid) continue
    const m = a.safeMargin
    const ab = new THREE.Box3(
      new THREE.Vector3(a.boxMin[0] - m, a.boxMin[1] - m, a.boxMin[2] - m),
      new THREE.Vector3(a.boxMax[0] + m, a.boxMax[1] + m, a.boxMax[2] + m),
    )
    if (ab.intersectsBox(colBox)) names.push(a.label)
  }
  return names
}
