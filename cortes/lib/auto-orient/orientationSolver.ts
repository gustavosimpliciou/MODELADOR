/**
 * orientationSolver — cálculo de quaternion, yaw e ground offset
 */

import * as THREE from 'three'

export function solveUpQuaternion(
  detectedUp: THREE.Vector3,
  targetUp: THREE.Vector3 = new THREE.Vector3(0, 1, 0),
): THREE.Quaternion {
  const from = detectedUp.clone().normalize()
  const to = targetUp.clone().normalize()
  const q = new THREE.Quaternion()
  q.setFromUnitVectors(from, to)
  return q
}

/**
 * Corrige o YAW após alinhar o UP, projetando o principal eixo horizontal no plano XZ.
 * Só deve ser usado se alignFront for true.
 */
export function solveYawQuaternion(
  object: THREE.Object3D,
  pcaX: THREE.Vector3,
  pcaZ: THREE.Vector3,
): THREE.Quaternion {
  // Projeta o principal eixo horizontal (maior eigenvalue entre X/Z) no plano XZ
  const horizontal = pcaX.lengthSq() > pcaZ.lengthSq() ? pcaX.clone() : pcaZ.clone()
  horizontal.y = 0
  if (horizontal.lengthSq() < 1e-6) return new THREE.Quaternion()
  horizontal.normalize()

  const targetFront = new THREE.Vector3(0, 0, 1)
  const angle = Math.atan2(horizontal.x, horizontal.z) - Math.atan2(targetFront.x, targetFront.z)

  const q = new THREE.Quaternion()
  q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle)
  return q
}

export function computeGroundOffset(
  object: THREE.Object3D,
  groundY = 0,
): number {
  object.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(object)
  if (box.isEmpty()) return 0
  return groundY - box.min.y
}

export function applyGroundOffset(
  object: THREE.Object3D,
  groundY = 0,
): number {
  const offset = computeGroundOffset(object, groundY)
  object.position.y += offset
  object.updateMatrixWorld(true)
  return offset
}

/**
 * Manual: dois pontos clicados no modelo — A = topo, B = base.
 * Calcula quaternion que alinha o vetor B→A com o UP do mundo.
 */
export function solveManualQuaternion(
  pointA: THREE.Vector3,
  pointB: THREE.Vector3,
  targetUp: THREE.Vector3 = new THREE.Vector3(0, 1, 0),
): THREE.Quaternion {
  const up = new THREE.Vector3().subVectors(pointA, pointB)
  if (up.lengthSq() < 1e-6) return new THREE.Quaternion()
  up.normalize()
  return solveUpQuaternion(up, targetUp)
}
