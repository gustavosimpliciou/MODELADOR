/**
 * Parts Manager — Independent Parts System
 *
 * Each Part is a fully independent object with its own mesh, transform,
 * visibility, selection, lock state, and cut history.
 */

import * as THREE from 'three'

export interface Part {
  id: string
  name: string
  mesh: THREE.Mesh
  /** Whether this part is visible in the viewport. */
  visible: boolean
  /** Whether this part is currently selected (active) in the Parts panel. */
  selected: boolean
  /** When locked, the part cannot be cut or moved. */
  locked: boolean
  /** ID of the parent part this was derived from via a cut. */
  parentId: string | null
  /** History of operations that produced this part (display names). */
  cutHistory: string[]
}

let _partCounter = 1

/** Generate a stable unique Part ID. */
function newPartId(): string {
  return `part-${Date.now()}-${(_partCounter++).toString(36)}`
}

/** Create a new Part from an existing Three.js Mesh. */
export function createPart(
  mesh: THREE.Mesh,
  name: string,
  parentId: string | null = null,
  historyEntry?: string,
): Part {
  return {
    id: newPartId(),
    name,
    mesh,
    visible: true,
    selected: false,
    locked: false,
    parentId,
    cutHistory: historyEntry ? [historyEntry] : [],
  }
}

/** Build a standard orange MeshStandardMaterial used for cut-part meshes. */
export function makeCutPartMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ff6600'),
    roughness: 0.6,
    metalness: 0.1,
    side: THREE.DoubleSide,
    flatShading: false,
  })
}

/** Clone a Three.js Mesh preserving position/rotation/scale. */
export function cloneMeshTransform(
  src: THREE.Mesh,
  newGeo: THREE.BufferGeometry,
  newMat?: THREE.Material,
): THREE.Mesh {
  const m = new THREE.Mesh(newGeo, newMat ?? src.material)
  m.castShadow = src.castShadow
  m.receiveShadow = src.receiveShadow
  m.position.copy(src.position)
  m.rotation.copy(src.rotation)
  m.scale.copy(src.scale)
  return m
}
