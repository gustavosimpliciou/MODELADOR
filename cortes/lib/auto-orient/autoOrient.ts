/**
 * autoOrient — função principal Auto Orientar
 */

import * as THREE from 'three'
import { collectWorldPositions, computeBoundingBox, computePCA, getAdaptiveSampleCount } from './geometryAnalysis'
import { detectBase, fallbackBaseFromPCA } from './baseDetection'
import { solveUpQuaternion, solveYawQuaternion, applyGroundOffset } from './orientationSolver'
import type { AutoOrientResult, AutoOrientOptions, ProgressCallback } from './types'

const DEFAULT_THRESHOLD = 0.45

export async function autoOrientObject(
  object: THREE.Object3D,
  options: AutoOrientOptions = {},
  onProgress?: ProgressCallback,
): Promise<AutoOrientResult> {
  const {
    alignFront = false,
    putOnGround = true,
    groundY = 0,
    confidenceThreshold = DEFAULT_THRESHOLD,
    maxSamples,
    useWorker = true,
  } = options

  const report = (stage: string, pct: number) => onProgress?.(stage, pct)

  // Para modelos muito pesados, delega para Web Worker
  const totalVerts = countVertices(object)
  const shouldUseWorker = useWorker && totalVerts > 50000 && typeof Worker !== 'undefined'

  if (shouldUseWorker) {
    try {
      return await autoOrientViaWorker(object, options, onProgress)
    } catch (e) {
      console.warn('[AutoOrient] Worker falhou, fallback para main thread:', e)
      // cai para execução na thread principal
    }
  }

  return autoOrientSync(object, { alignFront, putOnGround, groundY, confidenceThreshold, maxSamples }, onProgress)
}

function countVertices(object: THREE.Object3D): number {
  let n = 0
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const pos = (child.geometry as THREE.BufferGeometry)?.getAttribute('position') as THREE.BufferAttribute | null
      if (pos) n += pos.count
    }
  })
  return n
}

function autoOrientSync(
  object: THREE.Object3D,
  options: Required<Pick<AutoOrientOptions, 'alignFront' | 'putOnGround' | 'groundY' | 'confidenceThreshold'>> & { maxSamples?: number },
  onProgress?: ProgressCallback,
): AutoOrientResult {
  const report = (s: string, p: number) => onProgress?.(s, p)

  report('Analisando modelo...', 10)
  object.updateMatrixWorld(true)
  const bbox = computeBoundingBox(object)
  const size = new THREE.Vector3(); bbox.getSize(size)
  const center = new THREE.Vector3(); bbox.getCenter(center)

  // Sampling e PCA
  report('Detectando orientação...', 30)
  const totalVerts = countVertices(object)
  const sampleCount = options.maxSamples ?? getAdaptiveSampleCount(totalVerts)
  const positions = collectWorldPositions(object, sampleCount)
  const pca = computePCA(positions)

  // Detecção da base
  report('Detectando base...', 60)
  let baseResult = detectBase(object, bbox)
  let baseNormal: THREE.Vector3
  let confidence = baseResult.confidence
  let method: AutoOrientResult['method'] = 'surface'

  if (!baseResult.candidate || confidence < 0.35) {
    // Fallback PCA/bbox
    const fallback = fallbackBaseFromPCA(pca.eigenvectors, bbox)
    baseNormal = fallback.normal.clone()
    confidence = Math.max(confidence, 0.3)
    method = 'pca'
    // Se ainda muito baixa, usa bbox
    if (confidence < 0.25) {
      method = 'bbox'
      // Maior face da bbox como base
      if (size.x * size.z >= size.x * size.y && size.x * size.z >= size.y * size.z) {
        baseNormal = new THREE.Vector3(0, 1, 0)
      } else if (size.x * size.y >= size.z * size.y) {
        baseNormal = new THREE.Vector3(0, 0, 1)
      } else {
        baseNormal = new THREE.Vector3(1, 0, 0)
      }
    }
  } else {
    baseNormal = baseResult.candidate.normal.clone()
  }

  // Determina UP — oposto da baseNormal, validado por distribuição de vértices
  report('Calculando rotação...', 80)
  let up = baseNormal.clone().negate()
  // Valida se o UP aponta para o interior (centroide acima da base)
  const baseHeight = baseResult.candidate ? baseResult.candidate.height : bbox.min.y
  const centroidY = pca.centroid.y
  if (centroidY < baseHeight) {
    // Centroide abaixo da base → inverte
    up.negate()
    baseNormal.negate()
  }

  // Se a baseNormal aponta muito para baixo e o UP resultante aponta para baixo, corrige
  if (up.y < -0.5) {
    up.negate()
    baseNormal.negate()
  }

  const targetUp = new THREE.Vector3(0, 1, 0)
  let quaternion = solveUpQuaternion(up, targetUp)

  // Yaw opcional
  if (options.alignFront) {
    const yawQ = solveYawQuaternion(object, pca.eigenvectors[0], pca.eigenvectors[2])
    quaternion.premultiply(yawQ)
  }

  // Aplica rotação — retorna delta para que o chamador possa aplicar a cada mesh quando for um Group
  report('Orientando modelo...', 90)

  // Salva para undo via store (chamador deve fazer pushHistory antes)
  const deltaQuat = quaternion.clone()
  object.quaternion.premultiply(deltaQuat)
  object.updateMatrixWorld(true)

  // Ground
  let groundOffset = 0
  if (options.putOnGround) {
    groundOffset = applyGroundOffset(object, options.groundY)
  }

  const rotation = new THREE.Euler().setFromQuaternion(deltaQuat)

  const success = confidence >= options.confidenceThreshold

  report('Concluído', 100)

  return {
    success,
    rotation,
    quaternion: deltaQuat.clone(),
    upDirection: up.clone(),
    baseNormal: baseNormal.clone(),
    confidence,
    groundOffset,
    method,
  }
}

// ─── Web Worker ───────────────────────────────────────────────────────────────

async function autoOrientViaWorker(
  object: THREE.Object3D,
  options: AutoOrientOptions,
  onProgress?: ProgressCallback,
): Promise<AutoOrientResult> {
  // Coleta posições em arrays transferíveis
  const positions = collectWorldPositions(object, options.maxSamples ?? 20000)
  const bbox = computeBoundingBox(object)

  return new Promise((resolve, reject) => {
    let worker: Worker
    try {
      worker = new Worker(new URL('./autoOrient.worker.ts', import.meta.url))
    } catch (e) {
      reject(e)
      return
    }

    const timeout = setTimeout(() => {
      try { worker.terminate() } catch {}
      reject(new Error('Worker timeout'))
    }, 30000)

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data
      if (msg.type === 'progress') {
        onProgress?.(msg.stage, msg.pct)
      } else if (msg.type === 'done') {
        clearTimeout(timeout)
        worker.terminate()
        // Aplica rotação e ground no objeto original
        const q = new THREE.Quaternion(msg.quaternion[0], msg.quaternion[1], msg.quaternion[2], msg.quaternion[3])
        object.quaternion.premultiply(q)
        object.updateMatrixWorld(true)
        let groundOffset = 0
        if (options.putOnGround ?? true) {
          const { applyGroundOffset } = require('./orientationSolver') as typeof import('./orientationSolver')
          groundOffset = applyGroundOffset(object, options.groundY ?? 0)
        }
        resolve({
          success: msg.success,
          rotation: new THREE.Euler().setFromQuaternion(object.quaternion),
          quaternion: object.quaternion.clone(),
          upDirection: new THREE.Vector3().fromArray(msg.upDirection),
          baseNormal: new THREE.Vector3().fromArray(msg.baseNormal),
          confidence: msg.confidence,
          groundOffset,
          method: msg.method,
        })
      } else if (msg.type === 'error') {
        clearTimeout(timeout)
        worker.terminate()
        reject(new Error(msg.message))
      }
    }

    worker.onerror = (err) => {
      clearTimeout(timeout)
      worker.terminate()
      reject(err)
    }

    // Envia bbox e posições
    worker.postMessage({
      type: 'analyze',
      positions: positions.buffer,
      bbox: { min: bbox.min.toArray(), max: bbox.max.toArray() },
      options: {
        alignFront: options.alignFront ?? false,
        confidenceThreshold: options.confidenceThreshold ?? DEFAULT_THRESHOLD,
      },
    }, [positions.buffer])
  })
}
