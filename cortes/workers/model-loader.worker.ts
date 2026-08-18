/**
 * Web Worker — Pipeline de Geometria 3D
 *
 * Executa fora da thread principal para nunca bloquear a UI.
 *
 * Formatos suportados: STL (binário e ASCII), OBJ, PLY
 * (GLB/GLTF é tratado na thread principal por usar FileLoader)
 *
 * Protocolo:
 *   IN  { type: 'load', buffer: ArrayBuffer, ext: string }
 *   OUT { type: 'progress', stage: string, percent: number }
 *   OUT { type: 'done', positions: Float32Array, normals: Float32Array | null,
 *                       indices: Uint32Array | null, uvs: Float32Array | null,
 *                       faceCount: number, vertexCount: number, hadNormals: boolean }
 *   OUT { type: 'error', message: string }
 */

import * as THREE from 'three'
import { STLLoader }  from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader }  from 'three/examples/jsm/loaders/OBJLoader.js'
import { PLYLoader }  from 'three/examples/jsm/loaders/PLYLoader.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier.js'

// ─── helpers ──────────────────────────────────────────────────────────────────

function progress(stage: string, percent: number) {
  self.postMessage({ type: 'progress', stage, percent })
}

// Sanitização de alta performance com TypedArrays (sem push de arrays JS).
// Dois-passes: primeiro conta faces válidas, depois preenche buffers exatos.
function sanitizeGeometry(geo: THREE.BufferGeometry): {
  positions: Float32Array
  normals: Float32Array | null
  uvs: Float32Array | null
  removedFaces: number
  totalFaces: number
} {
  const working = geo.index ? geo.toNonIndexed() : geo

  const posAttr  = working.getAttribute('position') as THREE.BufferAttribute
  const normAttr = working.getAttribute('normal')   as THREE.BufferAttribute | undefined
  const uvAttr   = working.getAttribute('uv')       as THREE.BufferAttribute | undefined

  const totalFaces = Math.floor(posAttr.count / 3)

  const va = new THREE.Vector3()
  const vb = new THREE.Vector3()
  const vc = new THREE.Vector3()
  const ab = new THREE.Vector3()
  const ac = new THREE.Vector3()

  // ── Pass 1: marcar faces válidas ─────────────────────────────────────────
  const valid = new Uint8Array(totalFaces)
  let validCount = 0

  for (let f = 0; f < totalFaces; f++) {
    const i0 = f * 3
    va.fromBufferAttribute(posAttr, i0)
    vb.fromBufferAttribute(posAttr, i0 + 1)
    vc.fromBufferAttribute(posAttr, i0 + 2)

    if (
      !isFinite(va.x) || !isFinite(va.y) || !isFinite(va.z) ||
      !isFinite(vb.x) || !isFinite(vb.y) || !isFinite(vb.z) ||
      !isFinite(vc.x) || !isFinite(vc.y) || !isFinite(vc.z)
    ) continue

    if (va.equals(vb) || vb.equals(vc) || va.equals(vc)) continue

    ab.subVectors(vb, va)
    ac.subVectors(vc, va)
    // cross product length² — area zero
    const cx = ab.y * ac.z - ab.z * ac.y
    const cy = ab.z * ac.x - ab.x * ac.z
    const cz = ab.x * ac.y - ab.y * ac.x
    if (cx * cx + cy * cy + cz * cz < 1e-24) continue

    valid[f] = 1
    validCount++
  }

  const removedFaces = totalFaces - validCount

  // ── Pass 2: preencher TypedArrays de tamanho exato ───────────────────────
  const positions = new Float32Array(validCount * 9) // 3 verts × 3 floats
  const normals   = normAttr ? new Float32Array(validCount * 9) : null
  const uvs       = uvAttr   ? new Float32Array(validCount * 6) : null // 3 verts × 2 floats

  let vOff = 0
  for (let f = 0; f < totalFaces; f++) {
    if (!valid[f]) continue
    const i0 = f * 3

    for (let vi = 0; vi < 3; vi++) {
      const src = i0 + vi
      const dst = vOff * 3
      positions[dst]     = posAttr.getX(src)
      positions[dst + 1] = posAttr.getY(src)
      positions[dst + 2] = posAttr.getZ(src)

      if (normals && normAttr) {
        const nx = normAttr.getX(src)
        const ny = normAttr.getY(src)
        const nz = normAttr.getZ(src)
        normals[dst]     = isFinite(nx) ? nx : 0
        normals[dst + 1] = isFinite(ny) ? ny : 0
        normals[dst + 2] = isFinite(nz) ? nz : 0
      }

      if (uvs && uvAttr) {
        const ud = vOff * 2
        uvs[ud]     = uvAttr.getX(src)
        uvs[ud + 1] = uvAttr.getY(src)
      }

      vOff++
    }
  }

  return { positions, normals, uvs, removedFaces, totalFaces }
}

function hasValidNormals(normAttr: THREE.BufferAttribute | null): boolean {
  if (!normAttr || normAttr.count === 0) return false
  const step = Math.max(1, Math.floor(normAttr.count / 64))
  for (let i = 0; i < normAttr.count; i += step) {
    const nx = normAttr.getX(i), ny = normAttr.getY(i), nz = normAttr.getZ(i)
    if (isFinite(nx) && isFinite(ny) && isFinite(nz) && (nx * nx + ny * ny + nz * nz) > 0.25)
      return true
  }
  return false
}

// Computa normais por face em TypedArray (sem criar THREE.BufferGeometry)
function computeFaceNormals(positions: Float32Array): Float32Array {
  const normals = new Float32Array(positions.length)
  const va = new THREE.Vector3()
  const vb = new THREE.Vector3()
  const vc = new THREE.Vector3()
  const ab = new THREE.Vector3()
  const ac = new THREE.Vector3()
  const n  = new THREE.Vector3()

  for (let i = 0; i < positions.length; i += 9) {
    va.set(positions[i],     positions[i + 1], positions[i + 2])
    vb.set(positions[i + 3], positions[i + 4], positions[i + 5])
    vc.set(positions[i + 6], positions[i + 7], positions[i + 8])
    ab.subVectors(vb, va)
    ac.subVectors(vc, va)
    n.crossVectors(ab, ac).normalize()
    for (let vi = 0; vi < 3; vi++) {
      normals[i + vi * 3]     = n.x
      normals[i + vi * 3 + 1] = n.y
      normals[i + vi * 3 + 2] = n.z
    }
  }
  return normals
}

// ─── Decimação (SimplifyModifier) ────────────────────────────────────────────
function simplifyGeometry(
  positions: Float32Array,
  normals: Float32Array | null,
  uvs: Float32Array | null,
  indices: Uint32Array,
  targetFaceCount: number
): { positions: Float32Array; normals: Float32Array | null; uvs: Float32Array | null; indices: Uint32Array } | null {
  try {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    if (normals) geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
    if (uvs)     geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geo.setIndex(new THREE.BufferAttribute(indices, 1))

    const currentFaces = indices.length / 3
    if (currentFaces <= targetFaceCount) {
      geo.dispose()
      return null
    }

    const modifier = new SimplifyModifier()
    const simplified = modifier.modify(geo, Math.round(targetFaceCount))

    if (!simplified) {
      geo.dispose()
      return null
    }

    const outPos = (simplified.getAttribute('position') as THREE.BufferAttribute).array as Float32Array
    const outNorm = simplified.getAttribute('normal')
      ? (simplified.getAttribute('normal') as THREE.BufferAttribute).array as Float32Array
      : null
    const outUV = simplified.getAttribute('uv')
      ? (simplified.getAttribute('uv') as THREE.BufferAttribute).array as Float32Array
      : null
    const outIdx = simplified.index!
      ? (simplified.index as THREE.BufferAttribute).array as Uint32Array
      : null

    geo.dispose()
    simplified.dispose()

    if (!outIdx) return null

    return { positions: outPos, normals: outNorm, uvs: outUV, indices: outIdx }
  } catch (e) {
    console.warn('[worker] Falha na decimação:', e)
    return null
  }
}

// mergeVertices via THREE para criar índice Uint32 correto
function indexGeometry(positions: Float32Array, normals: Float32Array | null, uvs: Float32Array | null, tolerance = 1e-6): {
  positions: Float32Array
  normals: Float32Array | null
  uvs: Float32Array | null
  indices: Uint32Array
} {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  if (normals) geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  if (uvs)     geo.setAttribute('uv',     new THREE.BufferAttribute(uvs, 2))

  const indexed = mergeVertices(geo, tolerance)

  const outPos    = (indexed.getAttribute('position') as THREE.BufferAttribute).array as Float32Array
  const outNorm   = indexed.getAttribute('normal')   ? (indexed.getAttribute('normal')   as THREE.BufferAttribute).array as Float32Array : null
  const outUVs    = indexed.getAttribute('uv')       ? (indexed.getAttribute('uv')       as THREE.BufferAttribute).array as Float32Array : null
  const outIdx    = indexed.index!.array as Uint32Array

  // Liberar geometria temporária
  geo.dispose()
  indexed.dispose()

  return { positions: outPos, normals: outNorm, uvs: outUVs, indices: outIdx }
}

// ─── Main message handler ─────────────────────────────────────────────────────

self.onmessage = function (e: MessageEvent) {
  const { type, buffer, ext } = e.data as { type: string; buffer: ArrayBuffer; ext: string }
  if (type !== 'load') return

  try {
    // ── 1. Parse ──────────────────────────────────────────────────────────
    progress('Lendo arquivo...', 5)

    let rawGeo: THREE.BufferGeometry

    if (ext === 'stl') {
      rawGeo = new STLLoader().parse(buffer)
    } else if (ext === 'obj') {
      const text = new TextDecoder().decode(buffer)
      const obj  = new OBJLoader().parse(text)
      obj.updateMatrixWorld(true)
      const geos: THREE.BufferGeometry[] = []
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh
          const g = (m.geometry as THREE.BufferGeometry).clone()
          g.applyMatrix4(m.matrixWorld)
          geos.push(g)
        }
      })
      if (geos.length === 0) throw new Error('Nenhuma geometria encontrada no OBJ.')
      if (geos.length === 1) {
        rawGeo = geos[0]
      } else {
        // Merge múltiplas sub-malhas
        let totalVerts = 0
        const nonIndexed = geos.map((g) => (g.index ? g.toNonIndexed() : g))
        for (const g of nonIndexed) totalVerts += (g.getAttribute('position') as THREE.BufferAttribute).count
        const pos = new Float32Array(totalVerts * 3)
        let off = 0
        for (const g of nonIndexed) {
          const p = g.getAttribute('position') as THREE.BufferAttribute
          for (let i = 0; i < p.count; i++) {
            pos[off++] = p.getX(i); pos[off++] = p.getY(i); pos[off++] = p.getZ(i)
          }
        }
        rawGeo = new THREE.BufferGeometry()
        rawGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        for (const g of geos) g.dispose()
      }
    } else if (ext === 'ply') {
      rawGeo = new PLYLoader().parse(buffer)
    } else {
      throw new Error(`Formato .${ext} não suportado no worker.`)
    }

    progress('Validando geometria...', 25)

    // ── 2. Sanitização — TypedArray, dois passes ─────────────────────────
    const { positions, normals: rawNormals, uvs, removedFaces, totalFaces } = sanitizeGeometry(rawGeo)
    rawGeo.dispose()

    if (removedFaces > 0) {
      console.warn(`[worker] Sanitização: ${removedFaces}/${totalFaces} faces inválidas removidas`)
    }

    if (positions.length === 0) throw new Error('Geometria vazia após sanitização.')

    progress('Fundindo vértices duplicados...', 45)

    // ── 3. Normais antes de indexar (mergeVertices pode perder normais) ───
    const normAttr = rawNormals
      ? new THREE.BufferAttribute(rawNormals, 3)
      : null
    const hadNormals = hasValidNormals(normAttr)
    const normsForIndex = hadNormals ? rawNormals : null

    // ── 4. Indexação robusta (mergeVertices) → Uint32 para grandes malhas ─
    const { positions: iPos, normals: iNorm, uvs: iUVs, indices } = indexGeometry(positions, normsForIndex, uvs)

    progress('Calculando normais...', 70)

    // ── 5. Normais — recalcular apenas se o arquivo não tinha normais válidas
    let finalNormals: Float32Array | null = iNorm
    if (!hadNormals) {
      // Reconstruir geometria indexada para computeVertexNormals() do Three.js
      const tmpGeo = new THREE.BufferGeometry()
      tmpGeo.setAttribute('position', new THREE.BufferAttribute(iPos, 3))
      tmpGeo.setIndex(new THREE.BufferAttribute(indices, 1))
      tmpGeo.computeVertexNormals()
      finalNormals = (tmpGeo.getAttribute('normal') as THREE.BufferAttribute).array as Float32Array
      tmpGeo.dispose()
    }

    // ── 6. Decimação opcional para malhas muito pesadas (> 200k faces) ──
    const faceCount = indices.length / 3
    let finalPositions = iPos
    let finalNormalsArr = finalNormals
    let finalUVs = iUVs
    let finalIndices = indices

    if (faceCount > 200000) {
      progress(`Simplificando malha (${faceCount.toLocaleString()} → ~100k faces)...`, 75)
      const simplified = simplifyGeometry(iPos, finalNormals, iUVs, indices, 100000)
      if (simplified) {
        finalPositions = simplified.positions
        finalNormalsArr = simplified.normals
        finalUVs = simplified.uvs
        finalIndices = simplified.indices
        console.log(`[worker] Decimação: ${faceCount} → ${finalIndices.length / 3} faces`)
      }
    }

    progress('Finalizando...', 90)

    const finalFaceCount   = finalIndices.length / 3
    const finalVertexCount = finalPositions.length / 3

    // ── 7. Transferir buffers (zero-copy) ─────────────────────────────────
    const transferList: Transferable[] = [finalPositions.buffer, finalIndices.buffer]
    if (finalNormalsArr) transferList.push(finalNormalsArr.buffer)
    if (finalUVs)         transferList.push(finalUVs.buffer)

    // postMessage with transfer list — cast away Window overload conflict
    ;(self as unknown as { postMessage(data: unknown, transfer: Transferable[]): void }).postMessage(
      {
        type: 'done',
        positions: finalPositions,
        normals: finalNormalsArr,
        uvs: finalUVs,
        indices: finalIndices,
        faceCount: finalFaceCount,
        vertexCount: finalVertexCount,
        hadNormals,
        ext,
      },
      transferList,
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    self.postMessage({ type: 'error', message: msg })
  }
}
