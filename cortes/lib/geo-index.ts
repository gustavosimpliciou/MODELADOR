/**
 * Geo Index — fonte única de verdade sobre o índice espacial (BVH) das malhas.
 *
 * O SmartCut depende do BVH para raycast O(log n) no hover/clique. Sem ele,
 * o raycast cai em brute-force O(n) e congela a aba em malhas grandes.
 * TODA malha que entra na cena por QUALQUER caminho (upload, corte, projeto
 * salvo, undo) precisa passar por `ensureBoundsTree` — o viewport ainda tem
 * uma auto-cura que indexa sob demanda se algum caminho esquecer.
 */

import * as THREE from 'three'
import { MeshBVH } from 'three-mesh-bvh'

export type IndexedGeometry = THREE.BufferGeometry & { boundsTree?: MeshBVH }

/** Acima disto, raycast sem BVH é proibido (trava a aba). */
export const BIG_MESH_FACES = 200_000

export function faceCountOf(geo: THREE.BufferGeometry): number {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute | null
  if (!pos) return 0
  return geo.index ? geo.index.count / 3 : pos.count / 3
}

export function hasBoundsTree(geo: THREE.BufferGeometry): boolean {
  return !!(geo as IndexedGeometry).boundsTree
}

/** true quando a malha precisa de índice para seleção fluida e ainda não tem. */
export function needsSpatialIndex(geo: THREE.BufferGeometry | null | undefined): boolean {
  if (!geo) return false
  return !hasBoundsTree(geo) && faceCountOf(geo) > BIG_MESH_FACES
}

/**
 * Constrói o BVH com tolerância a falha. Retorna true se indexado.
 * Síncrono (construção é TypedArrays — rápida); chame após um yield para
 * a UI pintar o status antes, em malhas grandes.
 */
export function buildBoundsTreeSafe(geo: THREE.BufferGeometry): boolean {
  try {
    ;(geo as IndexedGeometry).boundsTree = new MeshBVH(geo, { maxLeafSize: 10, strategy: 0 })
    return true
  } catch (err) {
    console.warn('[GeoIndex] BVH indisponível nesta malha:', err)
    return false
  }
}

/** Garante o índice (constrói se ausente). Libera a UI antes de construir. */
export async function ensureBoundsTree(geo: THREE.BufferGeometry): Promise<boolean> {
  if (hasBoundsTree(geo)) return true
  await new Promise((res) => setTimeout(res, 0))
  return buildBoundsTreeSafe(geo)
}
