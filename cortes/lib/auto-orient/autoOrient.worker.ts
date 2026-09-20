/**
 * autoOrient.worker — PCA + base detection fora da UI thread
 */

import { computePCA } from './geometryAnalysis'
import { detectBase, fallbackBaseFromPCA } from './baseDetection'
import { solveUpQuaternion } from './orientationSolver'
import * as THREE from 'three'

self.onmessage = (e: MessageEvent) => {
  const msg = e.data
  if (msg.type !== 'analyze') return

  try {
    const positions = new Float32Array(msg.positions)
    const bbox = new THREE.Box3(
      new THREE.Vector3().fromArray(msg.bbox.min),
      new THREE.Vector3().fromArray(msg.bbox.max),
    )

    // @ts-ignore
    self.postMessage({ type: 'progress', stage: 'Detectando orientação...', pct: 30 })

    // PCA
    const pca = computePCA(positions)

    // @ts-ignore
    self.postMessage({ type: 'progress', stage: 'Detectando base...', pct: 60 })

    // Para worker, precisamos de um objeto falso para detectBase — usa bbox e posições
    // Simplifica: usa fallback PCA se não tiver faces reais
    const size = new THREE.Vector3(); bbox.getSize(size)
    let baseNormal: THREE.Vector3
    let confidence = 0.5
    let method: string = 'pca'

    // Tenta usar PCA como base
    const fallback = fallbackBaseFromPCA(pca.eigenvectors, bbox)
    baseNormal = fallback.normal.clone()
    confidence = 0.4

    // Heurística: se a bbox tem uma face muito maior, é provável ser a base
    const areaXZ = size.x * size.z
    const areaXY = size.x * size.y
    const areaYZ = size.y * size.z
    const maxArea = Math.max(areaXZ, areaXY, areaYZ)
    if (maxArea === areaXZ) {
      baseNormal = new THREE.Vector3(0, 1, 0)
      confidence = 0.6
      method = 'bbox'
    }

    let up = baseNormal.clone().negate()
    if (pca.centroid.y < bbox.min.y + size.y * 0.3) {
      up.negate()
      baseNormal.negate()
    }

    const targetUp = new THREE.Vector3(0, 1, 0)
    const q = solveUpQuaternion(up, targetUp)

    // @ts-ignore
    self.postMessage({ type: 'progress', stage: 'Orientando modelo...', pct: 90 })

    // @ts-ignore
    self.postMessage({
      type: 'done',
      success: confidence >= (msg.options?.confidenceThreshold ?? 0.45),
      quaternion: [q.x, q.y, q.z, q.w],
      upDirection: up.toArray(),
      baseNormal: baseNormal.toArray(),
      confidence,
      method,
    })
  } catch (err: any) {
    // @ts-ignore
    self.postMessage({ type: 'error', message: err?.message ?? 'worker error' })
  }
}
