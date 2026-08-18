/**
 * Model Loader — Pipeline de Geometria 3D de Alta Performance
 *
 * Suporte: STL (ASCII + Binário), OBJ, PLY, GLB, GLTF
 *
 * Arquitetura:
 *   • STL / OBJ / PLY → Web Worker (thread separada, não bloqueia UI)
 *   • GLB / GLTF       → Thread principal (GLTFLoader usa FileLoader)
 *
 * Pipeline:
 *   1. Parse do formato original (sem modificações)
 *   2. Sanitização: remove apenas faces com NaN/Infinity/área-zero
 *      (dois passes sobre TypedArrays — zero cópias desnecessárias)
 *   3. mergeVertices (tolerância 1e-6) → BufferGeometry indexada Uint32
 *   4. Normais: preserva as do arquivo se válidas, recalcula se ausentes
 *   5. Correção Z-up→Y-up (STL/PLY)
 *   6. Centralização + bounding box/sphere
 *   7. BVH via three-mesh-bvh (raycasting O(log n) em vez de O(n))
 *
 * Sem decimação — geometria 100% idêntica ao arquivo original.
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh'
import type { ModelInfo } from './store'

// Habilitar raycast acelerado globalmente (uma vez)
if (!('_bvhPatched' in THREE.Mesh)) {
  THREE.Mesh.prototype.raycast = acceleratedRaycast
  ;(THREE.Mesh as unknown as Record<string, boolean>)._bvhPatched = true
}

// Tolerância de welding de vértices (mergeVertices)
const MERGE_TOLERANCE = 1e-6

export interface LoadResult {
  mesh: THREE.Mesh
  info: ModelInfo
  /** true se o arquivo tinha normais válidas preservadas */
  hadNormals: boolean
}

export interface LoadProgress {
  stage: string
  percent: number
}

export type ProgressCallback = (p: LoadProgress) => void

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function loadModel(
  file: File,
  onProgress?: ProgressCallback,
): Promise<LoadResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

  const report = (stage: string, percent: number) =>
    onProgress?.({ stage, percent })

  report('Lendo arquivo...', 5)
  const buffer = await file.arrayBuffer()
  report('Arquivo lido.', 10)

  let geometry: THREE.BufferGeometry
  let hadNormals = false

  if (ext === 'stl' || ext === 'obj' || ext === 'ply') {
    // ── Worker path: parsing + sanitização + indexação no worker ───────────
    const result = await loadViaWorker(buffer, ext, (p) => {
      // Worker reporta 5%→90%, mapeamos para 10%→85%
      report(p.stage, 10 + Math.round(p.percent * 0.75))
    })
    geometry   = result.geometry
    hadNormals = result.hadNormals

    // Correção Z-up → Y-up (STL e PLY são Z-up por convenção de impressão 3D)
    if (ext === 'stl' || ext === 'ply') {
      geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2))
      // Após rotação a geometria indexada tem normais erradas → recomputar
      geometry.computeVertexNormals()
    }
  } else if (ext === 'glb' || ext === 'gltf') {
    // ── Thread principal: GLTFLoader ────────────────────────────────────────
    report('Carregando GLTF/GLB...', 20)
    geometry = await loadGLTF(buffer, file.name, (p) => report('Carregando GLTF/GLB...', 20 + Math.round(p * 0.5)))
    hadNormals = hasValidNormals(geometry.getAttribute('normal') as THREE.BufferAttribute | null)

    // Garantir indexação robusta em GLB/GLTF também
    if (!geometry.index) {
      report('Indexando geometria...', 72)
      geometry = mergeVertices(geometry, MERGE_TOLERANCE)
    }
    if (!hadNormals) {
      geometry.computeVertexNormals()
    }
  } else {
    throw new Error(`Formato .${ext} não suportado.`)
  }

  // ── Bounding box + centralização ─────────────────────────────────────────
  report('Calculando dimensões...', 87)
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()

  const box    = geometry.boundingBox!
  const center = new THREE.Vector3()
  box.getCenter(center)
  geometry.translate(-center.x, -center.y, -center.z)

  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()

  // ── BVH — O(log n) para raycast/seleção/corte ────────────────────────────
  report('Construindo BVH...', 91)
  if (geometry.index) {
    ;(geometry as THREE.BufferGeometry & { boundsTree?: MeshBVH }).boundsTree =
      new MeshBVH(geometry, {
        maxLeafSize: 10,
        strategy: 0, // SAH
      })
  }

  // ── Material ─────────────────────────────────────────────────────────────
  const material = new THREE.MeshStandardMaterial({
    color:      new THREE.Color(0x888888),
    roughness:  0.6,
    metalness:  0.1,
    side:       THREE.DoubleSide, // modelos com winding inconsistente não mostram buracos
    flatShading: true,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name  = file.name

  // ── Info ─────────────────────────────────────────────────────────────────
  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute
  const faceCount = geometry.index
    ? geometry.index.count / 3
    : posAttr.count / 3

  const size = new THREE.Vector3()
  geometry.boundingBox!.getSize(size)

  const info: ModelInfo = {
    name:     file.name,
    vertices: posAttr.count,
    faces:    Math.round(faceCount),
    width:    parseFloat(size.x.toFixed(2)),
    height:   parseFloat(size.y.toFixed(2)),
    depth:    parseFloat(size.z.toFixed(2)),
    fileSize: formatFileSize(file.size),
  }

  report('Pronto.', 100)

  return { mesh, info, hadNormals }
}

// ─── Worker path ──────────────────────────────────────────────────────────────

interface WorkerResult {
  geometry:   THREE.BufferGeometry
  hadNormals: boolean
}

interface PreviewResult {
  geometry:   THREE.BufferGeometry
  isPreview:  true
}

function loadViaWorker(
  buffer: ArrayBuffer,
  ext: string,
  onProgress?: (p: LoadProgress) => void,
): Promise<WorkerResult> {
  return new Promise((resolve, reject) => {
    let worker: Worker
    let previewMesh: THREE.Mesh | null = null

    try {
      worker = new Worker(
        new URL('../workers/model-loader.worker.ts', import.meta.url),
      )
    } catch {
      resolve(loadSyncFallback(buffer, ext))
      return
    }

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data

      // ── Preview instantâneo (chega em ~50-100ms) ──
      if (msg.type === 'preview') {
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(msg.positions as Float32Array, 3))
        if (msg.normals) geo.setAttribute('normal', new THREE.BufferAttribute(msg.normals as Float32Array, 3))
        if (msg.uvs) geo.setAttribute('uv', new THREE.BufferAttribute(msg.uvs as Float32Array, 2))
        // preview sem índice (non-indexed é OK para render rápido)
        geo.computeBoundingBox()
        geo.computeBoundingSphere()

        // Material leve para preview
        const previewMat = new THREE.MeshStandardMaterial({
          color: 0x888888, roughness: 0.6, metalness: 0.1,
          side: THREE.DoubleSide, flatShading: true,
        })
        previewMesh = new THREE.Mesh(geo, previewMat)
        previewMesh.name = 'preview'

        // Callback especial: preview pronto
        onProgress?.({ stage: 'Preview pronto', percent: 15 })
        ;(onProgress as any)?.({ type: 'preview', mesh: previewMesh })
        return
      }

      if (msg.type === 'progress') {
        onProgress?.({ stage: msg.stage, percent: msg.percent })
        return
      }

      if (msg.type === 'error') {
        worker.terminate()
        if (previewMesh) { previewMesh.geometry.dispose(); previewMesh.material.dispose() }
        reject(new Error(msg.message))
        return
      }

      if (msg.type === 'done') {
        worker.terminate()

        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(msg.positions as Float32Array, 3))
        if (msg.normals) geo.setAttribute('normal', new THREE.BufferAttribute(msg.normals as Float32Array, 3))
        if (msg.uvs) geo.setAttribute('uv', new THREE.BufferAttribute(msg.uvs as Float32Array, 2))
        if (msg.indices) geo.setIndex(new THREE.BufferAttribute(msg.indices as Uint32Array, 1))

        // Swap suave: se tinha preview, descarta e usa geometria final
        if (previewMesh) {
          previewMesh.geometry.dispose()
          previewMesh.material.dispose()
          previewMesh = null
        }

        resolve({ geometry: geo, hadNormals: !!msg.hadNormals })
      }
    }

    worker.onerror = (err) => {
      worker.terminate()
      if (previewMesh) { previewMesh.geometry.dispose(); previewMesh.material.dispose() }
      try { resolve(loadSyncFallback(buffer, ext)) } catch (fallbackErr) { reject(fallbackErr) }
    }

    worker.postMessage({ type: 'load', buffer, ext }, [buffer])
  })
}

// ─── Fallback síncrono (thread principal) ─────────────────────────────────────
// Usado quando workers não estão disponíveis (SSR, CSP, etc.)

function loadSyncFallback(buffer: ArrayBuffer, ext: string): WorkerResult {
  const { STLLoader } = require('three/examples/jsm/loaders/STLLoader.js') as typeof import('three/examples/jsm/loaders/STLLoader.js')
  const { OBJLoader } = require('three/examples/jsm/loaders/OBJLoader.js') as typeof import('three/examples/jsm/loaders/OBJLoader.js')
  const { PLYLoader } = require('three/examples/jsm/loaders/PLYLoader.js') as typeof import('three/examples/jsm/loaders/PLYLoader.js')

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
    rawGeo = geos.length === 1 ? geos[0] : mergeGeosFallback(geos)
  } else if (ext === 'ply') {
    rawGeo = new PLYLoader().parse(buffer)
  } else {
    throw new Error(`Formato .${ext} não suportado.`)
  }

  const geo = rawGeo.index ? rawGeo.toNonIndexed() : rawGeo
  const merged = mergeVertices(geo, MERGE_TOLERANCE)
  const hadNormals = hasValidNormals(merged.getAttribute('normal') as THREE.BufferAttribute | null)
  if (!hadNormals) merged.computeVertexNormals()

  return { geometry: merged, hadNormals }
}

function mergeGeosFallback(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const nonIndexed = geos.map((g) => (g.index ? g.toNonIndexed() : g))
  let total = 0
  for (const g of nonIndexed) total += (g.getAttribute('position') as THREE.BufferAttribute).count
  const pos = new Float32Array(total * 3)
  let off = 0
  for (const g of nonIndexed) {
    const p = g.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      pos[off++] = p.getX(i); pos[off++] = p.getY(i); pos[off++] = p.getZ(i)
    }
  }
  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return merged
}

// ─── GLTF / GLB (thread principal) ───────────────────────────────────────────

async function loadGLTF(
  buffer: ArrayBuffer,
  filename: string,
  onProgress?: (p: number) => void,
): Promise<THREE.BufferGeometry> {
  return new Promise((resolve, reject) => {
    new GLTFLoader().parse(
      buffer,
      '',
      (gltf) => {
        onProgress?.(80)
        const geometries: THREE.BufferGeometry[] = []
        gltf.scene.updateMatrixWorld(true)
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh
            const g = (m.geometry as THREE.BufferGeometry).clone()
            g.applyMatrix4(child.matrixWorld)
            geometries.push(g)
          }
        })

        if (geometries.length === 0) {
          reject(new Error('Nenhuma geometria encontrada no arquivo GLTF/GLB.'))
          return
        }

        if (geometries.length === 1) {
          resolve(geometries[0])
          return
        }

        // Múltiplas malhas → merge
        const nonIndexed = geometries.map((g) => (g.index ? g.toNonIndexed() : g))
        let total = 0
        for (const g of nonIndexed) total += (g.getAttribute('position') as THREE.BufferAttribute).count

        const positions = new Float32Array(total * 3)
        const hasNorms  = nonIndexed.every((g) => g.getAttribute('normal') !== null)
        const normals   = hasNorms ? new Float32Array(total * 3) : null
        const hasUVs    = nonIndexed.every((g) => g.getAttribute('uv') !== null)
        const uvs       = hasUVs ? new Float32Array(total * 2) : null

        let vOff = 0
        for (const g of nonIndexed) {
          const p = g.getAttribute('position') as THREE.BufferAttribute
          const n = g.getAttribute('normal')   as THREE.BufferAttribute | null
          const u = g.getAttribute('uv')       as THREE.BufferAttribute | null
          for (let i = 0; i < p.count; i++) {
            const d3 = (vOff + i) * 3
            positions[d3]     = p.getX(i)
            positions[d3 + 1] = p.getY(i)
            positions[d3 + 2] = p.getZ(i)
            if (normals && n) {
              normals[d3]     = n.getX(i)
              normals[d3 + 1] = n.getY(i)
              normals[d3 + 2] = n.getZ(i)
            }
            if (uvs && u) {
              const d2 = (vOff + i) * 2
              uvs[d2]     = u.getX(i)
              uvs[d2 + 1] = u.getY(i)
            }
          }
          vOff += p.count
        }

        for (const g of geometries) g.dispose()

        const merged = new THREE.BufferGeometry()
        merged.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        if (normals) merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
        if (uvs)     merged.setAttribute('uv',     new THREE.BufferAttribute(uvs, 2))

        resolve(merged)
      },
      (err) => reject(err instanceof Error ? err : new Error(String(err))),
    )
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function formatFileSize(bytes: number): string {
  if (bytes < 1024)           return `${bytes} B`
  if (bytes < 1024 * 1024)    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Exportação ───────────────────────────────────────────────────────────────

export async function exportMesh(
  mesh: THREE.Mesh,
  format: 'stl' | 'obj' = 'stl',
  filename: string = 'model',
): Promise<void> {
  if (format === 'stl') {
    const { STLExporter } = await import('three/examples/jsm/exporters/STLExporter.js')
    const result = new STLExporter().parse(mesh, { binary: true })
    downloadBlob(new Blob([result], { type: 'application/octet-stream' }), `${filename}.stl`)
  } else {
    const { OBJExporter } = await import('three/examples/jsm/exporters/OBJExporter.js')
    const result = new OBJExporter().parse(mesh)
    downloadBlob(new Blob([result], { type: 'text/plain' }), `${filename}.obj`)
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
