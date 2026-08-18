/**
 * Web Worker — Pipeline de Geometria 3D Progressivo (Zero Travamento)
 *
 * Estratégia: 3 estágios não-bloqueantes
 *   1. INSTANTÂNEO (≤100ms): amostragem 1/50 do STL → ~30k faces → render IMEDIATO
 *   2. RÁPIDO (background): parse completo + meshoptimizer WASM → ~100k faces
 *   3. SWAP SUAVE: troca geometria no main thread sem piscar
 *
 * Formatos: STL (binário/ASCII), OBJ, PLY
 * GLB/GLTF → thread principal (usa FileLoader)
 */

// Carrega meshoptimizer dinamicamente (WASM)
let meshopt: any = null
async function loadMeshopt() {
  if (meshopt) return meshopt
  const mod = await import('meshoptimizer')
  meshopt = mod.default ?? mod
  return meshopt
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function progress(stage: string, percent: number) {
  self.postMessage({ type: 'progress', stage, percent })
}

// Sanitização otimizada (TypedArray, 1 pass com contagem inline)
function sanitizeGeometry(geo: THREE.BufferGeometry): {
  positions: Float32Array
  normals: Float32Array | null
  uvs: Float32Array | null
  removedFaces: number
  totalFaces: number
} {
  const working = geo.index ? geo.toNonIndexed() : geo
  const posAttr = working.getAttribute('position') as THREE.BufferAttribute
  const normAttr = working.getAttribute('normal') as THREE.BufferAttribute | undefined
  const uvAttr = working.getAttribute('uv') as THREE.BufferAttribute | undefined
  const totalFaces = Math.floor(posAttr.count / 3)

  const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3()
  const ab = new THREE.Vector3(), ac = new THREE.Vector3()

  // Pass 1: marcar faces válidas
  const valid = new Uint8Array(totalFaces)
  let validCount = 0
  for (let f = 0; f < totalFaces; f++) {
    const i0 = f * 3
    va.fromBufferAttribute(posAttr, i0)
    vb.fromBufferAttribute(posAttr, i0 + 1)
    vc.fromBufferAttribute(posAttr, i0 + 2)

    if (!isFinite(va.x) || !isFinite(vb.x) || !isFinite(vc.x) ||
        !isFinite(va.y) || !isFinite(vb.y) || !isFinite(vc.y) ||
        !isFinite(va.z) || !isFinite(vb.z) || !isFinite(vc.z)) continue
    if (va.equals(vb) || vb.equals(vc) || va.equals(vc)) continue
    ab.subVectors(vb, va); ac.subVectors(vc, va)
    const cx = ab.y * ac.z - ab.z * ac.y
    const cy = ab.z * ac.x - ab.x * ac.z
    const cz = ab.x * ac.y - ab.y * ac.x
    if (cx * cx + cy * cy + cz * cz < 1e-24) continue
    valid[f] = 1; validCount++
  }

  // Pass 2: preencher buffers exatos (sem push)
  const positions = new Float32Array(validCount * 9)
  const normals = normAttr ? new Float32Array(validCount * 9) : null
  const uvs = uvAttr ? new Float32Array(validCount * 6) : null
  let vOff = 0
  for (let f = 0; f < totalFaces; f++) {
    if (!valid[f]) continue
    const i0 = f * 3
    for (let vi = 0; vi < 3; vi++) {
      const src = i0 + vi, dst = vOff * 3
      positions[dst] = posAttr.getX(src); positions[dst + 1] = posAttr.getY(src); positions[dst + 2] = posAttr.getZ(src)
      if (normals) { const nx = normAttr!.getX(src), ny = normAttr!.getY(src), nz = normAttr!.getZ(src); normals[dst] = isFinite(nx) ? nx : 0; normals[dst + 1] = isFinite(ny) ? ny : 0; normals[dst + 2] = isFinite(nz) ? nz : 0 }
      if (uvs) { const ud = vOff * 2; uvs[ud] = uvAttr!.getX(src); uvs[ud + 1] = uvAttr!.getY(src) }
      vOff++
    }
  }
  return { positions, normals, uvs, removedFaces: totalFaces - validCount, totalFaces }
}

// Amostragem rápida para preview instantâneo (1 em cada N triângulos)
function sampleGeometry(positions: Float32Array, normals: Float32Array | null, uvs: Float32Array | null, sampleRate: number): {
  positions: Float32Array; normals: Float32Array | null; uvs: Float32Array | null
} {
  const faceCount = positions.length / 9
  const sampledFaces = Math.max(1, Math.floor(faceCount / sampleRate))
  const newPos = new Float32Array(sampledFaces * 9)
  const newNor = normals ? new Float32Array(sampledFaces * 9) : null
  const newUV = uvs ? new Float32Array(sampledFaces * 6) : null
  let dst = 0
  for (let f = 0; f < faceCount; f += sampleRate) {
    const src = f * 9
    newPos[dst] = positions[src]; newPos[dst + 1] = positions[src + 1]; newPos[dst + 2] = positions[src + 2]
    newPos[dst + 3] = positions[src + 3]; newPos[dst + 4] = positions[src + 4]; newPos[dst + 5] = positions[src + 5]
    newPos[dst + 6] = positions[src + 6]; newPos[dst + 7] = positions[src + 7]; newPos[dst + 8] = positions[src + 8]
    if (newNor) { newNor[dst] = normals![src]; newNor[dst + 1] = normals![src + 1]; newNor[dst + 2] = normals![src + 2]; newNor[dst + 3] = normals![src + 3]; newNor[dst + 4] = normals![src + 4]; newNor[dst + 5] = normals![src + 5]; newNor[dst + 6] = normals![src + 6]; newNor[dst + 7] = normals![src + 7]; newNor[dst + 8] = normals![src + 8] }
    if (newUV) { const s = f * 6, d = dst / 9 * 6; newUV[d] = uvs![s]; newUV[d + 1] = uvs![s + 1]; newUV[d + 2] = uvs![s + 2]; newUV[d + 3] = uvs![s + 3]; newUV[d + 4] = uvs![s + 4]; newUV[d + 5] = uvs![s + 5] }
    dst += 9
  }
  return { positions: newPos, normals: newNor, uvs: newUV }
}

// Decimação meshoptimizer (WASM, ~10x mais rápido que SimplifyModifier)
async function decimateMeshopt(
  positions: Float32Array, normals: Float32Array | null, uvs: Float32Array | null, indices: Uint32Array, targetFaces: number
): Promise<{ positions: Float32Array; normals: Float32Array | null; uvs: Float32Array | null; indices: Uint32Array } | null> {
  try {
    await loadMeshopt()
    const vertexCount = positions.length / 3
    const currentFaces = indices.length / 3
    if (currentFaces <= targetFaces) return null

    // simplify() retorna novo index buffer simplificado
    const simplifiedIdx = meshopt.simplify(
      new Uint32Array(indices), positions, vertexCount, targetFaces, 1e-2
    )
    if (!simplifiedIdx || simplifiedIdx.length / 3 >= currentFaces) return null

    // Remapear vertex buffers pro novo índice
    const newPos = meshopt.remapVertexBuffer(positions, simplifiedIdx)
    const newNor = normals ? meshopt.remapVertexBuffer(normals, simplifiedIdx) : null
    const newUV = uvs ? meshopt.remapVertexBuffer(uvs, simplifiedIdx) : null
    const optIdx = meshopt.optimizeVertexCache(simplifiedIdx)

    return { positions: newPos, normals: newNor, uvs: newUV, indices: optIdx }
  } catch (e) {
    console.warn('[worker] meshoptimizer falhou, fallback SimplifyModifier:', e)
    return null
  }
}

// Fallback SimplifyModifier (three.js) se meshoptimizer falhar
function simplifyFallback(
  positions: Float32Array, normals: Float32Array | null, uvs: Float32Array | null, indices: Uint32Array, targetFaces: number
): { positions: Float32Array; normals: Float32Array | null; uvs: Float32Array | null; indices: Uint32Array } | null {
  try {
    const { SimplifyModifier } = require('three/examples/jsm/modifiers/SimplifyModifier.js')
    const { mergeVertices } = require('three/examples/jsm/utils/BufferGeometryUtils.js')
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    if (normals) geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
    if (uvs) geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geo.setIndex(new THREE.BufferAttribute(indices, 1))
    const currentFaces = indices.length / 3
    if (currentFaces <= targetFaces) { geo.dispose(); return null }
    const simplified = new SimplifyModifier().modify(geo, Math.round(targetFaces))
    if (!simplified) { geo.dispose(); return null }
    const outPos = (simplified.getAttribute('position') as THREE.BufferAttribute).array as Float32Array
    const outNorm = simplified.getAttribute('normal') ? (simplified.getAttribute('normal') as THREE.BufferAttribute).array as Float32Array : null
    const outUV = simplified.getAttribute('uv') ? (simplified.getAttribute('uv') as THREE.BufferAttribute).array as Float32Array : null
    const outIdx = simplified.index ? (simplified.index as THREE.BufferAttribute).array as Uint32Array : null
    geo.dispose(); simplified.dispose()
    if (!outIdx) return null
    return { positions: outPos, normals: outNorm, uvs: outUV, indices: outIdx }
  } catch { return null }
}

// mergeVertices via THREE (indexação robusta Uint32)
function indexGeometry(positions: Float32Array, normals: Float32Array | null, uvs: Float32Array | null, tolerance = 1e-6): {
  positions: Float32Array; normals: Float32Array | null; uvs: Float32Array | null; indices: Uint32Array
} {
  const { mergeVertices } = require('three/examples/jsm/utils/BufferGeometryUtils.js')
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  if (normals) geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  if (uvs) geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  const indexed = mergeVertices(geo, tolerance)
  const outPos = (indexed.getAttribute('position') as THREE.BufferAttribute).array as Float32Array
  const outNorm = indexed.getAttribute('normal') ? (indexed.getAttribute('normal') as THREE.BufferAttribute).array as Float32Array : null
  const outUVs = indexed.getAttribute('uv') ? (indexed.getAttribute('uv') as THREE.BufferAttribute).array as Float32Array : null
  const outIdx = indexed.index!.array as Uint32Array
  geo.dispose(); indexed.dispose()
  return { positions: outPos, normals: outNorm, uvs: outUVs, indices: outIdx }
}

// Normal check
function hasValidNormals(normAttr: THREE.BufferAttribute | null): boolean {
  if (!normAttr || normAttr.count === 0) return false
  const step = Math.max(1, Math.floor(normAttr.count / 64))
  for (let i = 0; i < normAttr.count; i += step) {
    const nx = normAttr.getX(i), ny = normAttr.getY(i), nz = normAttr.getZ(i)
    if (isFinite(nx) && isFinite(ny) && isFinite(nz) && (nx * nx + ny * ny + nz * nz) > 0.25) return true
  }
  return false
}

// ─── Main handler ─────────────────────────────────────────────────────────────
self.onmessage = async function (e: MessageEvent) {
  const { type, buffer, ext } = e.data as { type: string; buffer: ArrayBuffer; ext: string }
  if (type !== 'load') return

  try {
    // ── ESTÁGIO 0: Preview instantâneo (amostragem direta do buffer STL) ──────
    if (ext === 'stl') {
      progress('Preview instantâneo...', 3)
      const view = new DataView(buffer)
      const triCount = view.getUint32(80, true)
      if (triCount > 50000) {
        // Amostra 1 em 50 triângulos direto do buffer binário (sem parsers pesados)
        const sampleRate = Math.max(1, Math.floor(triCount / 30000))
        const positions = new Float32Array(Math.ceil(triCount / sampleRate) * 9)
        let dst = 0
        for (let f = 0; f < triCount; f += sampleRate) {
          const offset = 84 + f * 50 + 12 // pula normal
          for (let vi = 0; vi < 3; vi++) {
            const vo = offset + vi * 12
            positions[dst++] = view.getFloat32(vo, true)
            positions[dst++] = view.getFloat32(vo + 4, true)
            positions[dst++] = view.getFloat32(vo + 8, true)
          }
        }
        // Envia preview IMEDIATO (tipo 'preview')
        self.postMessage({
          type: 'preview',
          positions: positions.subarray(0, dst),
          normals: null,
          uvs: null,
          faceCount: dst / 9,
          vertexCount: dst / 3,
          ext,
        }, [positions.buffer])
      }
    }

    // ── ESTÁGIO 1: Parse completo no worker ───────────────────────────────────
    progress('Lendo arquivo...', 10)
    const arrayBuffer = buffer
    let rawGeo: THREE.BufferGeometry

    if (ext === 'stl') {
      const { STLLoader } = require('three/examples/jsm/loaders/STLLoader.js')
      rawGeo = new STLLoader().parse(arrayBuffer)
    } else if (ext === 'obj') {
      const { OBJLoader } = require('three/examples/jsm/loaders/OBJLoader.js')
      const text = new TextDecoder().decode(arrayBuffer)
      const obj = new OBJLoader().parse(text)
      obj.updateMatrixWorld(true)
      const geos: THREE.BufferGeometry[] = []
      obj.traverse((child: any) => {
        if (child.isMesh) {
          const g = child.geometry.clone()
          g.applyMatrix4(child.matrixWorld)
          geos.push(g)
        }
      })
      if (!geos.length) throw new Error('Nenhuma geometria no OBJ.')
      rawGeo = geos.length === 1 ? geos[0] : mergeGeos(geos)
      geos.forEach(g => g.dispose())
    } else if (ext === 'ply') {
      const { PLYLoader } = require('three/examples/jsm/loaders/PLYLoader.js')
      rawGeo = new PLYLoader().parse(arrayBuffer)
    } else {
      throw new Error(`Formato .${ext} não suportado.`)
    }

    progress('Sanitizando...', 25)
    const { positions, normals: rawNormals, uvs, removedFaces, totalFaces } = sanitizeGeometry(rawGeo)
    rawGeo.dispose()
    if (removedFaces > 0) console.warn(`[worker] Sanitização: ${removedFaces}/${totalFaces} faces removidas`)
    if (positions.length === 0) throw new Error('Geometria vazia.')

    progress('Indexando vértices...', 45)
    const { mergeVertices } = require('three/examples/jsm/utils/BufferGeometryUtils.js')
    const { positions: iPos, normals: iNorm, uvs: iUVs, indices } = indexGeometry(positions, rawNormals, uvs)

    // Normais
    const hadNormals = hasValidNormals(iNorm ? new THREE.BufferAttribute(iNorm, 3) : null)
    let finalNormals = hadNormals ? iNorm : null
    if (!hadNormals) {
      progress('Calculando normais...', 60)
      const tmpGeo = new THREE.BufferGeometry()
      tmpGeo.setAttribute('position', new THREE.BufferAttribute(iPos, 3))
      tmpGeo.setIndex(new THREE.BufferAttribute(indices, 1))
      tmpGeo.computeVertexNormals()
      finalNormals = (tmpGeo.getAttribute('normal') as THREE.BufferAttribute).array as Float32Array
      tmpGeo.dispose()
    }

    // ── ESTÁGIO 2: Decimação meshoptimizer (background) ──────────────────────
    let finalPositions = iPos, finalNormalsArr = finalNormals, finalUVs = iUVs, finalIndices = indices
    const faceCount = indices.length / 3

    if (faceCount > 200000) {
      progress(`Otimizando (${faceCount.toLocaleString()} → ~100k faces)...`, 70)
      const targetFaces = Math.min(100000, Math.max(50000, Math.floor(faceCount * 0.07)))
      let simplified = await decimateMeshopt(iPos, finalNormals, iUVs, indices, targetFaces)
      if (!simplified) simplified = simplifyFallback(iPos, finalNormals, iUVs, indices, targetFaces)
      if (simplified) {
        finalPositions = simplified.positions
        finalNormalsArr = simplified.normals
        finalUVs = simplified.uvs
        finalIndices = simplified.indices
        console.log(`[worker] Decimação: ${faceCount} → ${finalIndices.length / 3} faces`)
      }
    }

    // Auto-unidade: se modelo < 5mm → provavelmente cm → ×10
    const box = computeBounds(finalPositions)
    const maxDim = Math.max(box.maxX - box.minX, box.maxY - box.minY, box.maxZ - box.minZ)
    if (maxDim < 5 && maxDim > 0) {
      const scale = 10
      for (let i = 0; i < finalPositions.length; i++) finalPositions[i] *= scale
      console.log(`[worker] Auto-unidade: ×${scale} (maxDim=${maxDim.toFixed(2)})`)
    }

    progress('Finalizando...', 95)

    const finalFaceCount = finalIndices.length / 3
    const finalVertexCount = finalPositions.length / 3

    // ── ESTÁGIO 3: Envia geometria final (swap suave no main) ────────────────
    const transferList: Transferable[] = [finalPositions.buffer, finalIndices.buffer]
    if (finalNormalsArr) transferList.push(finalNormalsArr.buffer)
    if (finalUVs) transferList.push(finalUVs.buffer)

    ;(self as any).postMessage({
      type: 'done',
      positions: finalPositions,
      normals: finalNormalsArr,
      uvs: finalUVs,
      indices: finalIndices,
      faceCount: finalFaceCount,
      vertexCount: finalVertexCount,
      hadNormals,
      ext,
      previewSent: triCount > 50000,
    }, transferList)

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    self.postMessage({ type: 'error', message: msg })
  }
}

// Helpers locais
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

function computeBounds(positions: Float32Array) {
  let minX = Infinity, minY = Infinity, minZ = Infinity
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2]
    if (x < minX) minX = x; if (x > maxX) maxX = x
    if (y < minY) minY = y; if (y > maxY) maxY = y
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z
  }
  return { minX, minY, minZ, maxX, maxY, maxZ }
}