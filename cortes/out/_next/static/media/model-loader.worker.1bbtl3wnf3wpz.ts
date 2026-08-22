/**
 * Web Worker — Pipeline de Geometria 3D Ultra-Rápido (Zero Travamento)
 *
 * Estratégia: 3 estágios não-bloqueantes
 *   1. INSTANTÂNEO (~50ms): amostragem direta do buffer STL binário → ~30k faces → render IMEDIATO
 *   2. PARSE RÁPIDO (~500ms): parse STL binário direto (sem three.js) + sanitização vetorizada
 *   3. DECIMAÇÃO WASM (~300ms): meshoptimizer pré-carregado → 1.5M → ~100k faces
 *   4. SWAP SUAVE: troca geometria no main thread sem piscar
 *
 * Formatos: STL (binário), OBJ, PLY
 * GLB/GLTF → thread principal
 */

import * as THREE from 'three'

// ─── meshoptimizer pré-carregado (WASM) ───────────────────────────────────────
let meshopt: any = null
const meshoptPromise = import('meshoptimizer').then(mod => { meshopt = mod.default ?? mod; return meshopt })

// ─── helpers ──────────────────────────────────────────────────────────────────
function progress(stage: string, percent: number) {
  self.postMessage({ type: 'progress', stage, percent })
}

// Vetores reutilizados (evita alocação no loop)
const VA = new THREE.Vector3(), VB = new THREE.Vector3(), VC = new THREE.Vector3()
const AB = new THREE.Vector3(), AC = new THREE.Vector3()

// Parse STL binário DIRETO (sem three.js STLLoader) — ultra-rápido
function parseSTLDirect(buffer: ArrayBuffer): { positions: Float32Array; faceCount: number } {
  const view = new DataView(buffer)
  const triCount = view.getUint32(80, true)
  const positions = new Float32Array(triCount * 9) // 3 verts × 3 floats
  let offset = 84
  let dst = 0

  for (let f = 0; f < triCount; f++) {
    offset += 12 // pula normal (12 bytes)
    // 3 vértices
    for (let vi = 0; vi < 3; vi++) {
      positions[dst++] = view.getFloat32(offset, true); offset += 4
      positions[dst++] = view.getFloat32(offset, true); offset += 4
      positions[dst++] = view.getFloat32(offset, true); offset += 4
    }
    offset += 2 // attribute byte count
  }

  return { positions: positions.subarray(0, dst), faceCount: triCount }
}

// Sanitização vetorizada (reutiliza vetores, 1 pass com contagem inline)
function sanitizePositions(positions: Float32Array): Float32Array {
  const faceCount = positions.length / 9
  const valid = new Uint8Array(faceCount)
  let validCount = 0

  for (let f = 0; f < faceCount; f++) {
    const i0 = f * 9
    VA.set(positions[i0], positions[i0 + 1], positions[i0 + 2])
    VB.set(positions[i0 + 3], positions[i0 + 4], positions[i0 + 5])
    VC.set(positions[i0 + 6], positions[i0 + 7], positions[i0 + 8])

    // NaN/Inf check
    if (!isFinite(VA.x) || !isFinite(VA.y) || !isFinite(VA.z) ||
        !isFinite(VB.x) || !isFinite(VB.y) || !isFinite(VB.z) ||
        !isFinite(VC.x) || !isFinite(VC.y) || !isFinite(VC.z)) continue

    // Vértices coincidentes
    if (VA.equals(VB) || VB.equals(VC) || VA.equals(VC)) continue

    // Área zero (cross product length²)
    AB.subVectors(VB, VA)
    AC.subVectors(VC, VA)
    const cx = AB.y * AC.z - AB.z * AC.y
    const cy = AB.z * AC.x - AB.x * AC.z
    const cz = AB.x * AC.y - AB.y * AC.x
    if (cx * cx + cy * cy + cz * cz < 1e-24) continue

    valid[f] = 1
    validCount++
  }

  // Pass 2: compactar
  const clean = new Float32Array(validCount * 9)
  let dst = 0
  for (let f = 0; f < faceCount; f++) {
    if (!valid[f]) continue
    const src = f * 9
    clean[dst++] = positions[src]; clean[dst++] = positions[src + 1]; clean[dst++] = positions[src + 2]
    clean[dst++] = positions[src + 3]; clean[dst++] = positions[src + 4]; clean[dst++] = positions[src + 5]
    clean[dst++] = positions[src + 6]; clean[dst++] = positions[src + 7]; clean[dst++] = positions[src + 8]
  }
  return clean
}

// Amostragem para preview instantâneo (1 em N triângulos)
function samplePositions(positions: Float32Array, sampleRate: number): Float32Array {
  const faceCount = positions.length / 9
  const sampledFaces = Math.max(1, Math.floor(faceCount / sampleRate))
  const sampled = new Float32Array(sampledFaces * 9)
  let dst = 0
  for (let f = 0; f < faceCount; f += sampleRate) {
    const src = f * 9
    sampled[dst++] = positions[src]; sampled[dst++] = positions[src + 1]; sampled[dst++] = positions[src + 2]
    sampled[dst++] = positions[src + 3]; sampled[dst++] = positions[src + 4]; sampled[dst++] = positions[src + 5]
    sampled[dst++] = positions[src + 6]; sampled[dst++] = positions[src + 7]; sampled[dst++] = positions[src + 8]
  }
  return sampled.subarray(0, dst)
}

// mergeVertices via THREE (indexação robusta Uint32)
function indexGeometry(positions: Float32Array): { positions: Float32Array; indices: Uint32Array } {
  const { mergeVertices } = require('three/examples/jsm/utils/BufferGeometryUtils.js')
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const indexed = mergeVertices(geo, 1e-6)
  const outPos = (indexed.getAttribute('position') as THREE.BufferAttribute).array as Float32Array
  const outIdx = indexed.index!.array as Uint32Array
  geo.dispose(); indexed.dispose()
  return { positions: outPos, indices: outIdx }
}

// Normais por face (rápido, sem three.js)
function computeFaceNormals(positions: Float32Array): Float32Array {
  const normals = new Float32Array(positions.length)
  for (let i = 0; i < positions.length; i += 9) {
    VA.set(positions[i], positions[i + 1], positions[i + 2])
    VB.set(positions[i + 3], positions[i + 4], positions[i + 5])
    VC.set(positions[i + 6], positions[i + 7], positions[i + 8])
    AB.subVectors(VB, VA)
    AC.subVectors(VC, VA)
    const nx = AB.y * AC.z - AB.z * AC.y
    const ny = AB.z * AC.x - AB.x * AC.z
    const nz = AB.x * AC.y - AB.y * AC.x
    const len = Math.hypot(nx, ny, nz) || 1
    for (let vi = 0; vi < 3; vi++) {
      const o = i + vi * 3
      normals[o] = nx / len; normals[o + 1] = ny / len; normals[o + 2] = nz / len
    }
  }
  return normals
}

// Decimação meshoptimizer (WASM pré-carregado)
async function decimateMeshopt(
  positions: Float32Array, indices: Uint32Array, targetFaces: number
): Promise<{ positions: Float32Array; indices: Uint32Array } | null> {
  try {
    await meshoptPromise
    const vertexCount = positions.length / 3
    const currentFaces = indices.length / 3
    if (currentFaces <= targetFaces) return null

    const simplifiedIdx = meshopt.simplify(
      new Uint32Array(indices), positions, vertexCount, targetFaces, 1e-2
    )
    if (!simplifiedIdx || simplifiedIdx.length / 3 >= currentFaces) return null

    const newPos = meshopt.remapVertexBuffer(positions, simplifiedIdx)
    const optIdx = meshopt.optimizeVertexCache(simplifiedIdx)
    return { positions: newPos, indices: optIdx }
  } catch (e) {
    console.warn('[worker] meshoptimizer falhou, fallback SimplifyModifier:', e)
    return null
  }
}

// Fallback SimplifyModifier (three.js)
function simplifyFallback(positions: Float32Array, indices: Uint32Array, targetFaces: number) {
  try {
    const { SimplifyModifier } = require('three/examples/jsm/modifiers/SimplifyModifier.js')
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setIndex(new THREE.BufferAttribute(indices, 1))
    const currentFaces = indices.length / 3
    if (currentFaces <= targetFaces) { geo.dispose(); return null }
    const simplified = new SimplifyModifier().modify(geo, Math.round(targetFaces))
    if (!simplified) { geo.dispose(); return null }
    const outPos = (simplified.getAttribute('position') as THREE.BufferAttribute).array as Float32Array
    const outIdx = simplified.index ? (simplified.index as THREE.BufferAttribute).array as Uint32Array : null
    geo.dispose(); simplified.dispose()
    if (!outIdx) return null
    return { positions: outPos, indices: outIdx }
  } catch { return null }
}

// Auto-unidade: detecta cm/m → normaliza para mm
function normalizeUnits(positions: Float32Array): void {
  let minX = Infinity, minY = Infinity, minZ = Infinity
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2]
    if (x < minX) minX = x; if (x > maxX) maxX = x
    if (y < minY) minY = y; if (y > maxY) maxY = y
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z
  }
  const maxDim = Math.max(maxX - minX, maxY - minY, maxZ - minZ)
  if (maxDim > 0 && maxDim < 5) { // provavelmente cm
    const scale = 10
    for (let i = 0; i < positions.length; i++) positions[i] *= scale
    console.log(`[worker] Auto-unidade: ×${scale} (maxDim=${maxDim.toFixed(2)})`)
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
self.onmessage = async function (e: MessageEvent) {
  const { type, buffer, ext } = e.data as { type: string; buffer: ArrayBuffer; ext: string }
  if (type !== 'load') return

  try {
    // ── ESTÁGIO 0: Preview instantâneo direto do buffer STL ─────────────────
    if (ext === 'stl') {
      progress('Preview instantâneo...', 5)
      const view = new DataView(buffer)
      const triCount = view.getUint32(80, true)
      if (triCount > 50000) {
        const sampleRate = Math.max(1, Math.floor(triCount / 30000))
        const positions = new Float32Array(Math.ceil(triCount / sampleRate) * 9)
        let dst = 0, offset = 84
        for (let f = 0; f < triCount; f += sampleRate) {
          const baseOffset = 84 + f * 50 + 12
          for (let vi = 0; vi < 3; vi++) {
            const vo = baseOffset + vi * 12
            positions[dst++] = view.getFloat32(vo, true)
            positions[dst++] = view.getFloat32(vo + 4, true)
            positions[dst++] = view.getFloat32(vo + 8, true)
          }
        }
        self.postMessage({
          type: 'preview',
          positions: positions.subarray(0, dst),
          faceCount: dst / 9,
          ext,
        }, [positions.buffer])
      }
    }

    // ── ESTÁGIO 1: Parse completo ───────────────────────────────────────────
    progress('Parseando STL...', 15)
    let positions: Float32Array
    let faceCount: number

    if (ext === 'stl') {
      const parsed = parseSTLDirect(buffer)
      positions = parsed.positions
      faceCount = parsed.faceCount
    } else if (ext === 'obj' || ext === 'ply') {
      // Fallback three.js para OBJ/PLY (raro)
      progress('Parseando via three.js...', 20)
      if (ext === 'obj') {
        const { OBJLoader } = require('three/examples/jsm/loaders/OBJLoader.js')
        const text = new TextDecoder().decode(buffer)
        const obj = new OBJLoader().parse(text)
        obj.updateMatrixWorld(true)
        const geos: THREE.BufferGeometry[] = []
        obj.traverse((child: any) => { if (child.isMesh) { const g = child.geometry.clone(); g.applyMatrix4(child.matrixWorld); geos.push(g) } })
        if (!geos.length) throw new Error('Nenhuma geometria no OBJ.')
        const merged = geos.length === 1 ? geos[0] : mergeGeos(geos)
        geos.forEach(g => g.dispose())
        const posAttr = merged.getAttribute('position') as THREE.BufferAttribute
        positions = new Float32Array(posAttr.array)
        faceCount = merged.index ? merged.index.count / 3 : posAttr.count / 3
        merged.dispose()
      } else {
        const { PLYLoader } = require('three/examples/jsm/loaders/PLYLoader.js')
        const raw = new PLYLoader().parse(buffer)
        const posAttr = raw.getAttribute('position') as THREE.BufferAttribute
        positions = new Float32Array(posAttr.array)
        faceCount = raw.index ? raw.index.count / 3 : posAttr.count / 3
        raw.dispose()
      }
    } else {
      throw new Error(`Formato .${ext} não suportado.`)
    }

    progress('Sanitizando...', 30)
    positions = sanitizePositions(positions)
    if (positions.length === 0) throw new Error('Geometria vazia após sanitização.')

    progress('Indexando vértices...', 50)
    const { positions: iPos, indices } = indexGeometry(positions)

    progress('Calculando normais...', 60)
    const normals = computeFaceNormals(iPos)

    // ── ESTÁGIO 2: Decimação meshoptimizer ──────────────────────────────────
    let finalPositions = iPos, finalIndices = indices
    if (indices.length / 3 > 200000) {
      progress('Otimizando (meshoptimizer WASM)...', 70)
      const targetFaces = Math.min(100000, Math.max(50000, Math.floor(indices.length / 3 * 0.07)))
      let simplified = await decimateMeshopt(iPos, indices, targetFaces)
      if (!simplified) simplified = simplifyFallback(iPos, indices, targetFaces)
      if (simplified) {
        finalPositions = simplified.positions
        finalIndices = simplified.indices
        console.log(`[worker] Decimação: ${indices.length / 3} → ${finalIndices.length / 3} faces`)
      }
    }

    // Auto-unidade
    normalizeUnits(finalPositions)

    progress('Finalizando...', 95)

    // Normais finais para geometria indexada
    const finalNormals = computeFaceNormals(finalPositions)

    // ── ESTÁGIO 3: Resultado final ──────────────────────────────────────────
    const transferList: Transferable[] = [finalPositions.buffer, finalIndices.buffer, finalNormals.buffer]

    ;(self as any).postMessage({
      type: 'done',
      positions: finalPositions,
      normals: finalNormals,
      indices: finalIndices,
      faceCount: finalIndices.length / 3,
      vertexCount: finalPositions.length / 3,
      ext,
      previewSent: ext === 'stl' && faceCount > 50000,
    }, transferList)

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    self.postMessage({ type: 'error', message: msg })
  }
}

// Helper para merge OBJ
function mergeGeos(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let totalVerts = 0
  const nonIndexed = geos.map(g => g.index ? g.toNonIndexed() : g)
  for (const g of nonIndexed) totalVerts += (g.getAttribute('position') as THREE.BufferAttribute).count
  const pos = new Float32Array(totalVerts * 3)
  let off = 0
  for (const g of nonIndexed) {
    const p = g.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) { pos[off++] = p.getX(i); pos[off++] = p.getY(i); pos[off++] = p.getZ(i) }
  }
  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return merged
}