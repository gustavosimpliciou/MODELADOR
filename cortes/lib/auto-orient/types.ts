import * as THREE from 'three'

export interface AutoOrientResult {
  success: boolean
  rotation: THREE.Euler
  quaternion: THREE.Quaternion
  upDirection: THREE.Vector3
  baseNormal: THREE.Vector3
  confidence: number
  groundOffset: number
  /** Informativo: qual estratégia foi usada */
  method: 'surface' | 'pca' | 'bbox' | 'none'
}

export interface AutoOrientOptions {
  /** Alinhar frente automaticamente (yaw) — padrão false */
  alignFront?: boolean
  /** Colocar base no Ground Plane — padrão true */
  putOnGround?: boolean
  /** Altura do Ground Plane — padrão 0 */
  groundY?: number
  /** Threshold de confiança para aplicar — padrão 0.45 */
  confidenceThreshold?: number
  /** Número máximo de vértices para PCA sampling */
  maxSamples?: number
  /** Se true, usa Web Worker para modelos pesados */
  useWorker?: boolean
}

export interface PCAResult {
  centroid: THREE.Vector3
  eigenvectors: [THREE.Vector3, THREE.Vector3, THREE.Vector3] // ordenados por eigenvalue decrescente
  eigenvalues: [number, number, number]
  /** Tamanho da bounding box para referência */
  bbox: THREE.Box3
}

export interface BaseCandidate {
  normal: THREE.Vector3
  area: number
  centroid: THREE.Vector3
  height: number // Y médio do cluster
  faceCount: number
  score: number
}

export interface ClusterInfo {
  normal: THREE.Vector3
  area: number
  centroid: THREE.Vector3
  height: number
  faceCount: number
  faceIndices: number[]
}

export interface GeometrySample {
  positions: Float32Array // world space positions amostradas
  normals: Float32Array // world space normals por face amostrada
  faceCount: number
  vertexCount: number
}

export type ProgressCallback = (stage: string, pct: number) => void
