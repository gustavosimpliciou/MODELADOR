/**
 * Web Worker — Pipeline de Geometria 3D Simples e Robusto
 * 
 * Parse → Sanitize → Index → Normals → Retorna
 * Sem otimizações complexas, sem timeouts, sem falhas.
 */

import * as THREE from 'three'

// ─── helpers ──────────────────────────────────────────────────────────────────
function progress(stage: string, percent: number) {
  self.postMessage({ type: 'progress', stage, percent })
}

// Parse STL binário direto (rápido, sem three.js loader)
function parseSTLDirect(buffer: ArrayBuffer): { positions: Float32Array; faceCount: number } {
  const view = new DataView(buffer)
  const triCount = view.getUint32(80, true)
  const positions = new Float32Array(triCount * 9)
  let offset = 84
  let dst = 0

  for (let f = 0; f < triCount; f++) {
    offset += 12 // pula normal
    for (let vi = 0; vi < 3; vi++) {
      positions[dst++] = view.getFloat32(offset, true); offset += 4
      positions[dst++] = view.getFloat32(offset, true); offset += 4
      positions[dst++] = view.getFloat32(offset, true); offset += 4
    }
    offset += 2 // attribute byte count
  }
  return { positions: positions.subarray(0, dst), faceCount: triCount }
}

// Sanitização simples (remove NaN/Inf, vértices coincidentes, área zero)
function sanitizePositions(positions: Float32Array): Float32Array {
  const faceCount = positions.length / 9
  const valid = new Uint8Array(faceCount)
  let validCount = 0

  const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3()
  const ab = new THREE.Vector3(), ac = new THREE.Vector3()

  for (let f = 0; f < faceCount; f++) {
    const i0 = f * 9
    va.set(positions[i0], positions[i0 + 1], positions[i0 + 2])
    vb.set(positions[i0 + 3], positions[i0 + 4], positions[i0 + 5])
    vc.set(positions[i0 + 6], positions[i0 + 7], positions[i0 + 8])

    if (!isFinite(va.x) || !isFinite(vb.x) || !isFinite(vc.x) ||
        !isFinite(va.y) || !isFinite(vb.y) || !isFinite(vc.y) ||
        !isFinite(va.z) || !isFinite(vb.z) || !isFinite(vc.z)) continue
    if (va.equals(vb) || vb.equals(vc) || va.equals(vc)) continue

    ab.subVectors(vb, va)
    ac.subVectors(vc, va)
    const cx = ab.y * ac.z - ab.z * ac.y
    const cy = ab.z * ac.x - ab.x * ac.z
    const cz = ab.x * ac.y - ab.y * ac.x
    if (cx * cx + cy * cy + cz * cz < 1e-24) continue

    valid[f] = 1
    validCount++
  }

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

// Normais por face (rápido)
function computeFaceNormals(positions: Float32Array): Float32Array {
  const normals = new Float32Array(positions.length)
  const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3()
  const ab = new THREE.Vector3(), ac = new THREE.Vector3()

  for (let i = 0; i < positions.length; i += 9) {
    va.set(positions[i], positions[i + 1], positions[i + 2])
    vb.set(positions[i + 3], positions[i + 4], positions[i + 5])
    vc.set(positions[i + 6], positions[i + 7], positions[i + 8])
    ab.subVectors(vb, va)
    ac.subVectors(vc, va)
    const nx = ab.y * ac.z - ab.z * ac.y
    const ny = ab.z * ac.x - ab.x * ac.z
    const nz = ab.x * ac.y - ab.y * ac.x
    const len = Math.hypot(nx, ny, nz) || 1
    for (let vi = 0; vi < 3; vi++) {
      const o = i + vi * 3
      normals[o] = nx / len; normals[o + 1] = ny / len; normals[o + 2] = nz / len
    }
  }
  return normals
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
  if (maxDim > 0 && maxDim < 5) {
    const scale = 10
    for (let i = 0; i < positions.length; i++) positions[i] *= scale
    console.log(`[worker] Auto-unidade: ×${scale} (maxDim=${maxDim.toFixed(2)})`)
  }
}

// Merge OBJ helper
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

// ─── Main handler ─────────────────────────────────────────────────────────────
self.onmessage = async function (e: MessageEvent) {
  const { type, buffer, ext } = e.data as { type: string; buffer: ArrayBuffer; ext: string }
  if (type !== 'load') return

  try {
    // ── Preview instantâneo (STL binário) ────────────────────────────────────
    if (ext === 'stl') {
      progress('Preview...', 5)
      const view = new DataView(buffer)
      const triCount = view.getUint32(80, true)
      if (triCount > 50000) {
        const sampleRate = Math.max(1, Math.floor(triCount / 30000))
        const positions = new Float32Array(Math.ceil(triCount / sampleRate) * 9)
        let dst = 0
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

    // ── Parse completo ───────────────────────────────────────────────────────
    progress('Lendo arquivo...', 15)
    let positions: Float32Array
    let faceCount: number

    if (ext === 'stl') {
      const parsed = parseSTLDirect(buffer)
      positions = parsed.positions
      faceCount = parsed.faceCount
    } else if (ext === 'obj') {
      progress('Parseando OBJ...', 20)
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
    } else if (ext === 'ply') {
      progress('Parseando PLY...', 20)
      const { PLYLoader } = require('three/examples/jsm/loaders/PLYLoader.js')
      const raw = new PLYLoader().parse(buffer)
      const posAttr = raw.getAttribute('position') as THREE.BufferAttribute
      positions = new Float32Array(posAttr.array)
      faceCount = raw.index ? raw.index.count / 3 : posAttr.count / 3
      raw.dispose()
    } else {
      throw new Error(`Formato .${ext} não suportado.`)
    }

    progress('Sanitizando...', 30)
    positions = sanitizePositions(positions)
    if (positions.length === 0) throw new Error('Geometria vazia após sanitização.')

    progress('Indexando vértices...', 50)
    const { positions: iPos, indices } = indexGeometry(positions)

    progress('Calculando normais...', 70)
    const normals = computeFaceNormals(iPos)

    // Auto-unidade (cm/m → mm)
    normalizeUnits(iPos)

    progress('Finalizando...', 90)

    // Normais finais
    const finalNormals = computeFaceNormals(iPos)

    // ── Resultado final ──────────────────────────────────────────────────────
    const transferList: Transferable[] = [iPos.buffer, indices.buffer, finalNormals.buffer]

    ;(self as any).postMessage({
      type: 'done',
      positions: iPos,
      normals: finalNormals,
      indices,
      faceCount: indices.length / 3,
      vertexCount: iPos.length / 3,
      ext,
      previewSent: ext === 'stl' && faceCount > 50000,
    }, transferList)

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    self.postMessage({ type: 'error', message: msg })
  }
}