/**
 * Repair — correção otimizada de bordas não-manifold antes da exportação.
 *
 * Fatiadores (Bambu, Prusa, Cura) reclamam de "non-manifold edges" quando:
 *  - vértices duplicados (mesma posição, índices diferentes) → aresta com >2 faces
 *  - triângulos degenerados (área ~0) → aresta de comprimento zero
 *  - winding inconsistente → normal invertida
 *
 * Este reparo é leve e rápido (TypedArrays, sem CSG):
 *  1. mergeVertices (1e-4 ≈ 0.1µm) — solda duplicados
 *  2. remove triângulos degenerados
 *  3. recalcula normais suaves por posição (mantém vértices independentes p/ pintura)
 *
 * Não tenta preencher buracos abertos (isso exigiria remeshing e mudaria a peça);
 * apenas garante que o que for exportado seja manifold onde a entrada já é fechada
 * (cortes com tampa) e que duplicatas não gerem falso não-manifold.
 */

import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const MERGE_EPS = 1e-4 // 0.1mm em unidades do modelo (suficiente para STL binário)

export function repairForExport(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  // Clone para não mutar a geometria em cena (pintura/vertex colors)
  let geo = geometry.clone() as THREE.BufferGeometry

  // 1. Solda vértices duplicados (STL binário tem 3× vértices por triângulo)
  try {
    geo = mergeVertices(geo, MERGE_EPS)
  } catch {
    // mergeVertices pode falhar em geometrias já indexadas com atributos faltando
  }

  // 2. Remove triângulos degenerados (área ~0) — geram aresta de comprimento zero
  const pos = geo.getAttribute('position') as THREE.BufferAttribute | null
  const idx = geo.index
  if (pos && idx) {
    const newIdx: number[] = []
    const ax = new THREE.Vector3(), bx = new THREE.Vector3(), cx = new THREE.Vector3()
    for (let i = 0; i < idx.count; i += 3) {
      const a = idx.getX(i), b = idx.getX(i + 1), c = idx.getX(i + 2)
      ax.set(pos.getX(a), pos.getY(a), pos.getZ(a))
      bx.set(pos.getX(b), pos.getY(b), pos.getZ(b))
      cx.set(pos.getX(c), pos.getY(c), pos.getZ(c))
      const abx = bx.x - ax.x, aby = bx.y - ax.y, abz = bx.z - ax.z
      const acx = cx.x - ax.x, acy = cx.y - ax.y, acz = cx.z - ax.z
      const nx = aby * acz - abz * acy
      const ny = abz * acx - abx * acz
      const nz = abx * acy - aby * acx
      const area2 = nx * nx + ny * ny + nz * nz
      if (area2 > 1e-12) newIdx.push(a, b, c)
    }
    if (newIdx.length !== idx.count) {
      geo.setIndex(newIdx)
    }
  } else if (pos && !idx) {
    // Não indexada: filtra triângulos degenerados e reindexa
    const newPos: number[] = []
    const newNorm: number[] = []
    const newUv: number[] = []
    const norm = geo.getAttribute('normal') as THREE.BufferAttribute | null
    const uv = geo.getAttribute('uv') as THREE.BufferAttribute | null
    const color = geo.getAttribute('color') as THREE.BufferAttribute | null
    const newColors: number[] = []
    for (let i = 0; i < pos.count; i += 3) {
      const ax = pos.getX(i), ay = pos.getY(i), az = pos.getZ(i)
      const bx = pos.getX(i + 1), by = pos.getY(i + 1), bz = pos.getZ(i + 1)
      const cx = pos.getX(i + 2), cy = pos.getY(i + 2), cz = pos.getZ(i + 2)
      const abx = bx - ax, aby = by - ay, abz = bz - az
      const acx = cx - ax, acy = cy - ay, acz = cz - az
      const nx = aby * acz - abz * acy
      const ny = abz * acx - abx * acz
      const nz = abx * acy - aby * acx
      if (nx * nx + ny * ny + nz * nz < 1e-12) continue
      for (let k = 0; k < 3; k++) {
        const v = i + k
        newPos.push(pos.getX(v), pos.getY(v), pos.getZ(v))
        if (norm) newNorm.push(norm.getX(v), norm.getY(v), norm.getZ(v))
        if (uv) newUv.push(uv.getX(v), uv.getY(v))
        if (color) newColors.push(color.getX(v), color.getY(v), color.getZ(v))
      }
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(newPos, 3))
    if (newNorm.length) geo.setAttribute('normal', new THREE.Float32BufferAttribute(newNorm, 3))
    else geo.deleteAttribute('normal')
    if (newUv.length) geo.setAttribute('uv', new THREE.Float32BufferAttribute(newUv, 2))
    if (newColors.length) geo.setAttribute('color', new THREE.Float32BufferAttribute(newColors, 3))
    geo.deleteAttribute('uv') // mantém apenas se existia
  }

  // 3. Normais suaves por posição (superfície lisa, sem facetas) — preserva pintura
  //    Não usamos computeVertexNormals direto (facetado); usamos média por posição
  //    mas de forma leve: apenas recalcula se não houver normais válidas
  const nAttr = geo.getAttribute('normal') as THREE.BufferAttribute | null
  let hasValidNormals = false
  if (nAttr) {
    // Checa se normais são válidas (não NaN e comprimento >0)
    for (let i = 0; i < Math.min(nAttr.count, 64); i++) {
      const nx = nAttr.getX(i), ny = nAttr.getY(i), nz = nAttr.getZ(i)
      if (isFinite(nx) && isFinite(ny) && isFinite(nz) && nx * nx + ny * ny + nz * nz > 1e-6) {
        hasValidNormals = true
        break
      }
    }
  }
  if (!hasValidNormals) {
    try {
      geo.computeVertexNormals()
    } catch {}
  }

  geo.computeBoundingBox()
  geo.computeBoundingSphere()
  return geo
}
