/**
 * baseDetection — pontuação e clustering de superfícies candidatas a base
 */

import * as THREE from 'three'
import type { ClusterInfo, BaseCandidate } from './types'

// Pesos configuráveis — somam 1.0
const WEIGHTS = {
  area: 0.30,
  normal: 0.25,
  planar: 0.20,
  contact: 0.15,
  height: 0.10,
}

export interface FaceInfo {
  normal: THREE.Vector3
  area: number
  centroid: THREE.Vector3
  vertices: [THREE.Vector3, THREE.Vector3, THREE.Vector3]
}

export function collectFaces(object: THREE.Object3D): FaceInfo[] {
  object.updateMatrixWorld(true)
  const faces: FaceInfo[] = []

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    const geo = child.geometry as THREE.BufferGeometry | null
    if (!geo) return
    const pos = geo.getAttribute('position') as THREE.BufferAttribute | null
    if (!pos) return
    const idx = geo.index
    const count = idx ? idx.count / 3 : pos.count / 3

    for (let f = 0; f < count; f++) {
      const a = idx ? idx.getX(f * 3) : f * 3
      const b = idx ? idx.getX(f * 3 + 1) : f * 3 + 1
      const c = idx ? idx.getX(f * 3 + 2) : f * 3 + 2

      const va = new THREE.Vector3(pos.getX(a), pos.getY(a), pos.getZ(a)).applyMatrix4(child.matrixWorld)
      const vb = new THREE.Vector3(pos.getX(b), pos.getY(b), pos.getZ(b)).applyMatrix4(child.matrixWorld)
      const vc = new THREE.Vector3(pos.getX(c), pos.getY(c), pos.getZ(c)).applyMatrix4(child.matrixWorld)

      const ab = new THREE.Vector3().subVectors(vb, va)
      const ac = new THREE.Vector3().subVectors(vc, va)
      const n = new THREE.Vector3().crossVectors(ab, ac)
      const area = n.length() * 0.5
      if (area < 1e-8) continue
      n.normalize()

      const centroid = new THREE.Vector3().addVectors(va, vb).add(vc).multiplyScalar(1 / 3)

      faces.push({ normal: n, area, centroid, vertices: [va, vb, vc] })
    }
  })

  return faces
}

export function clusterByNormal(faces: FaceInfo[], threshold = 0.95): ClusterInfo[] {
  const clusters: ClusterInfo[] = []
  const assigned = new Array(faces.length).fill(false)

  for (let i = 0; i < faces.length; i++) {
    if (assigned[i]) continue

    const base = faces[i]
    const clusterFaces: number[] = [i]
    assigned[i] = true

    let sumNormal = base.normal.clone()
    let totalArea = base.area
    let sumCentroid = base.centroid.clone().multiplyScalar(base.area)

    for (let j = i + 1; j < faces.length; j++) {
      if (assigned[j]) continue
      const dot = base.normal.dot(faces[j].normal)
      if (dot > threshold) {
        // Checa proximidade espacial: centroides não muito distantes (evita agrupar faces opostas)
        // Usa distância relativa ao tamanho do objeto — simplificado: sempre agrupa por normal
        assigned[j] = true
        clusterFaces.push(j)
        sumNormal.add(faces[j].normal)
        totalArea += faces[j].area
        sumCentroid.add(faces[j].centroid.clone().multiplyScalar(faces[j].area))
      }
    }

    if (clusterFaces.length === 0) continue

    sumNormal.normalize()
    sumCentroid.multiplyScalar(1 / totalArea)

    // Altura média = Y médio
    const avgHeight = sumCentroid.y

    // Calcula planaridade: variância das distâncias ao plano médio
    // Simplificado: usa desvio das normais (já filtrado) como proxy
    clusters.push({
      normal: sumNormal,
      area: totalArea,
      centroid: sumCentroid,
      height: avgHeight,
      faceCount: clusterFaces.length,
      faceIndices: clusterFaces,
    })
  }

  // Ordena por área decrescente
  clusters.sort((a, b) => b.area - a.area)
  return clusters
}

export function scoreCluster(
  cluster: ClusterInfo,
  bbox: THREE.Box3,
  allClusters: ClusterInfo[],
): number {
  const size = new THREE.Vector3()
  bbox.getSize(size)
  const maxDim = Math.max(size.x, size.y, size.z) || 1

  // 1. Área — maior área = mais provável ser base
  const maxArea = Math.max(...allClusters.map((c) => c.area), 1)
  const areaScore = cluster.area / maxArea

  // 2. Normal — quão horizontal é (dot com Y)
  // Base ideal tem normal ≈ ±Y (horizontal). Pega valor absoluto
  const up = new THREE.Vector3(0, 1, 0)
  const normalScore = Math.abs(cluster.normal.dot(up))

  // 3. Planaridade — cluster grande e coerente já é plano; usa faceCount/area como proxy
  // Clusters com muitas faces mas área pequena são fragmentados → menos planos
  const avgFaceArea = cluster.area / Math.max(1, cluster.faceCount)
  const planarScore = Math.min(1, avgFaceArea * 100) // heurística

  // 4. Contato potencial — extensão X/Z (base larga = mais contato)
  // Aproxima por área projetada no plano XZ
  const contactScore = Math.min(1, cluster.area / (maxDim * maxDim))

  // 5. Altura — quão próximo da extremidade inferior
  const heightScore = 1 - (cluster.centroid.y - bbox.min.y) / (Math.max(1e-6, size.y))
  const clampedHeight = Math.max(0, Math.min(1, heightScore))

  return (
    areaScore * WEIGHTS.area +
    normalScore * WEIGHTS.normal +
    planarScore * WEIGHTS.planar +
    contactScore * WEIGHTS.contact +
    clampedHeight * WEIGHTS.height
  )
}

export function detectBase(
  object: THREE.Object3D,
  bbox: THREE.Box3,
): { candidate: BaseCandidate | null; confidence: number; clusters: ClusterInfo[] } {
  const faces = collectFaces(object)
  if (faces.length === 0) return { candidate: null, confidence: 0, clusters: [] }

  const clusters = clusterByNormal(faces, 0.92)
  if (clusters.length === 0) return { candidate: null, confidence: 0, clusters: [] }

  let best: ClusterInfo | null = null
  let bestScore = -1

  for (const c of clusters) {
    const s = scoreCluster(c, bbox, clusters)
    if (s > bestScore) {
      bestScore = s
      best = c
    }
  }

  if (!best) return { candidate: null, confidence: 0, clusters }

  // Considera também a direção oposta da normal para decidir UP
  // A baseNormal deve apontar para fora; o UP é o oposto
  const candidate: BaseCandidate = {
    normal: best.normal.clone(),
    area: best.area,
    centroid: best.centroid.clone(),
    height: best.height,
    faceCount: best.faceCount,
    score: bestScore,
  }

  // Confiança baseada no score e na separação do segundo melhor
  const sortedScores = clusters.map((c) => scoreCluster(c, bbox, clusters)).sort((a, b) => b - a)
  const gap = sortedScores.length > 1 ? sortedScores[0] - sortedScores[1] : 0.5
  const confidence = Math.min(1, bestScore * 0.7 + gap * 0.5 + (best.area / (bbox.getSize(new THREE.Vector3()).x * bbox.getSize(new THREE.Vector3()).z)) * 0.1)

  return { candidate, confidence: Math.max(0, Math.min(1, confidence)), clusters }
}

/**
 * Fallback PCA quando não há base plana clara.
 * Usa o menor eigenvector (menor variância) como candidato a eixo vertical.
 */
export function fallbackBaseFromPCA(
  eigenvectors: [THREE.Vector3, THREE.Vector3, THREE.Vector3],
  bbox: THREE.Box3,
): BaseCandidate {
  // Menor eigenvalue = eixo de menor espessura → provável vertical para objetos achatados
  // Mas para objetos orgânicos (personagem em pé), o eixo vertical é o de MAIOR extensão
  // Heurística: se a altura da bbox é a maior dimensão, usa o eixo mais alinhado com Y
  const size = new THREE.Vector3()
  bbox.getSize(size)
  const maxDim = Math.max(size.x, size.y, size.z)

  // Escolhe o eigenvector mais próximo de Y como vertical
  let best = eigenvectors[0]
  let bestDot = Math.abs(best.dot(new THREE.Vector3(0, 1, 0)))
  for (let i = 1; i < 3; i++) {
    const d = Math.abs(eigenvectors[i].dot(new THREE.Vector3(0, 1, 0)))
    if (d > bestDot) {
      bestDot = d
      best = eigenvectors[i]
    }
  }

  // Se nenhum está próximo de Y (<0.3), usa o eixo de maior tamanho da bbox
  if (bestDot < 0.3) {
    if (size.y >= size.x && size.y >= size.z) best = new THREE.Vector3(0, 1, 0)
    else if (size.x >= size.z) best = new THREE.Vector3(1, 0, 0)
    else best = new THREE.Vector3(0, 0, 1)
  }

  const centroid = new THREE.Vector3()
  bbox.getCenter(centroid)

  return {
    normal: best.clone().normalize(),
    area: maxDim * maxDim * 0.1,
    centroid,
    height: bbox.min.y,
    faceCount: 1,
    score: 0.3,
  }
}
