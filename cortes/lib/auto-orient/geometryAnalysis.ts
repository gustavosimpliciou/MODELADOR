/**
 * geometryAnalysis — coleta e PCA de vértices
 */

import * as THREE from 'three'
import type { PCAResult } from './types'

/**
 * Coleta posições em WORLD SPACE de todos os Meshes sob o objeto.
 * Não modifica a geometria original.
 */
export function collectWorldPositions(
  object: THREE.Object3D,
  maxSamples?: number,
): Float32Array {
  object.updateMatrixWorld(true)

  const positions: number[] = []
  let totalVerts = 0

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    const geo = child.geometry as THREE.BufferGeometry | null
    if (!geo) return
    const pos = geo.getAttribute('position') as THREE.BufferAttribute | null
    if (!pos) return

    const count = pos.count
    totalVerts += count
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i))
      v.applyMatrix4(child.matrixWorld)
      positions.push(v.x, v.y, v.z)
    }
  })

  let arr = new Float32Array(positions)

  // Sampling adaptativo
  if (maxSamples && arr.length / 3 > maxSamples) {
    const step = Math.ceil(arr.length / 3 / maxSamples)
    const sampled: number[] = []
    for (let i = 0; i < arr.length / 3; i += step) {
      sampled.push(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2])
    }
    arr = new Float32Array(sampled)
  }

  return arr
}

export function computeBoundingBox(object: THREE.Object3D): THREE.Box3 {
  object.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(object)
  // Fallback para objetos sem geometria válida
  if (box.isEmpty()) {
    box.min.set(0, 0, 0)
    box.max.set(1, 1, 1)
  }
  return box
}

/**
 * PCA via matriz de covariância 3x3 + decomposição de Jacobi.
 * Retorna eigenvectors ordenados por eigenvalue decrescente.
 */
export function computePCA(positions: Float32Array): Omit<PCAResult, 'bbox'> {
  const n = positions.length / 3
  if (n === 0) {
    return {
      centroid: new THREE.Vector3(),
      eigenvectors: [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)],
      eigenvalues: [1, 1, 1],
    }
  }

  // Centroide
  let cx = 0, cy = 0, cz = 0
  for (let i = 0; i < positions.length; i += 3) {
    cx += positions[i]; cy += positions[i + 1]; cz += positions[i + 2]
  }
  cx /= n; cy /= n; cz /= n
  const centroid = new THREE.Vector3(cx, cy, cz)

  // Covariância 3x3 simétrica
  let cxx = 0, cyy = 0, czz = 0, cxy = 0, cxz = 0, cyz = 0
  for (let i = 0; i < positions.length; i += 3) {
    const dx = positions[i] - cx
    const dy = positions[i + 1] - cy
    const dz = positions[i + 2] - cz
    cxx += dx * dx; cyy += dy * dy; czz += dz * dz
    cxy += dx * dy; cxz += dx * dz; cyz += dy * dz
  }
  cxx /= n; cyy /= n; czz /= n; cxy /= n; cxz /= n; cyz /= n

  // Matriz 3x3 em array 9: [cxx cxy cxz; cxy cyy cyz; cxz cyz czz]
  const m: number[] = [cxx, cxy, cxz, cxy, cyy, cyz, cxz, cyz, czz]
  const { eigenvalues, eigenvectors } = jacobiEigen3x3(m)

  // Ordena por eigenvalue decrescente
  const order = [0, 1, 2].sort((a, b) => eigenvalues[b] - eigenvalues[a])
  const ev = order.map((i) => eigenvectors[i]) as [THREE.Vector3, THREE.Vector3, THREE.Vector3]
  const evals = order.map((i) => eigenvalues[i]) as [number, number, number]

  return { centroid, eigenvectors: ev, eigenvalues: evals }
}

/**
 * Jacobi para matriz 3x3 simétrica. Retorna eigenvalues e eigenvectors (colunas).
 * Implementação clássica iterativa, suficiente para 3x3.
 */
function jacobiEigen3x3(m: number[]): { eigenvalues: number[]; eigenvectors: THREE.Vector3[] } {
  // Inicializa V como identidade
  let V = [1, 0, 0, 0, 1, 0, 0, 0, 1]
  let A = m.slice()

  const maxIter = 50
  const eps = 1e-12

  for (let iter = 0; iter < maxIter; iter++) {
    // Encontra maior off-diagonal
    let p = 0, q = 1, max = Math.abs(A[1])
    if (Math.abs(A[2]) > max) { max = Math.abs(A[2]); p = 0; q = 2 }
    if (Math.abs(A[5]) > max) { max = Math.abs(A[5]); p = 1; q = 2 }
    if (max < eps) break

    const app = A[p * 3 + p]
    const aqq = A[q * 3 + q]
    const apq = A[p * 3 + q]

    const theta = 0.5 * Math.atan2(2 * apq, aqq - app)
    const c = Math.cos(theta), s = Math.sin(theta)

    // Rotação de Jacobi
    const newA = A.slice()
    for (let r = 0; r < 3; r++) {
      if (r !== p && r !== q) {
        const arp = A[r * 3 + p]
        const arq = A[r * 3 + q]
        newA[r * 3 + p] = c * arp - s * arq
        newA[p * 3 + r] = newA[r * 3 + p]
        newA[r * 3 + q] = s * arp + c * arq
        newA[q * 3 + r] = newA[r * 3 + q]
      }
    }
    newA[p * 3 + p] = c * c * app - 2 * s * c * apq + s * s * aqq
    newA[q * 3 + q] = s * s * app + 2 * s * c * apq + c * c * aqq
    newA[p * 3 + q] = 0; newA[q * 3 + p] = 0
    A = newA

    // Atualiza V
    const newV = V.slice()
    for (let r = 0; r < 3; r++) {
      const vip = V[r * 3 + p]
      const viq = V[r * 3 + q]
      newV[r * 3 + p] = c * vip - s * viq
      newV[r * 3 + q] = s * vip + c * viq
    }
    V = newV
  }

  const eigenvalues = [A[0], A[4], A[8]]
  // Colunas de V são eigenvectors
  const eigenvectors = [
    new THREE.Vector3(V[0], V[3], V[6]).normalize(),
    new THREE.Vector3(V[1], V[4], V[7]).normalize(),
    new THREE.Vector3(V[2], V[5], V[8]).normalize(),
  ]

  return { eigenvalues, eigenvectors }
}

export function getAdaptiveSampleCount(totalVerts: number): number {
  if (totalVerts <= 10000) return Math.min(totalVerts, 10000)
  if (totalVerts <= 100000) return 20000
  return 20000 // limite máximo para pesados
}
