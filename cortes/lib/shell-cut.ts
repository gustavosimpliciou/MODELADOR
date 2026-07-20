"use client"

/**
 * Shell Cut — Extração de Casca / Peruca
 *
 * Transforma a região selecionada (ex: cabelo, barba, roupa) em uma peça sólida
 * com espessura configurável (peruca removível), e reconstrói o corpo sem buracos.
 *
 * Algoritmo — Peruca (watertight shell):
 *   1. Extrai a superfície externa selecionada
 *   2. Calcula normais suaves por posição
 *   3. Gera superfície interna: cada vértice deslocado por -(normal * totalOffset)
 *   4. Detecta arestas de borda (aresta sem espelho invertido na triangulação)
 *   5. Cria "paredes" conectando borda externa à borda interna
 *   6. Mescla tudo → malha fechada (watertight)
 *   7. Recalcula normais suaves no resultado final
 *
 * Algoritmo — Corpo Careca:
 *   removeSubMesh() já chama buildCap() internamente, fechando o buraco com
 *   uma tampa plana na região da costura — personagem sem buracos.
 */

import * as THREE from 'three'
import { extractSubMesh, removeSubMesh, computeSmoothNormalsByPosition } from './smart-cut'
import type { ValidationIssue } from './quality-cut'

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ShellCutOptions {
  /** Espessura da parede da peruca, em unidades do modelo. */
  thickness: number
  /** Folga de encaixe — espaço adicional entre peruca e couro cabeludo. */
  clearance: number
  /** Parâmetro de quantização (weldQ) — igual ao usado no resto do sistema. */
  weldQ?: number
}

export interface ShellCutResult {
  ok: boolean
  /** Peruca — malha fechada (watertight) com espessura uniforme, pronta para impressão 3D. */
  wigGeometry: THREE.BufferGeometry
  /** Corpo reconstruído — personagem careca, sem buracos. */
  bodyGeometry: THREE.BufferGeometry
  validationIssues: ValidationIssue[]
  error?: string
}

// ─── Entry point ───────────────────────────────────────────────────────────────

/**
 * Gera o Shell Cut: extrai a seleção como peruca sólida e reconstrói o corpo.
 */
export function shellCut(
  geo: THREE.BufferGeometry,
  selectedFaceIndices: Set<number>,
  options: ShellCutOptions,
): ShellCutResult {
  const { thickness, clearance, weldQ = 1e4 } = options
  const totalOffset = Math.max(thickness + clearance, 0.001)
  const issues: ValidationIssue[] = []

  if (selectedFaceIndices.size === 0) {
    return {
      ok: false,
      wigGeometry: new THREE.BufferGeometry(),
      bodyGeometry: new THREE.BufferGeometry(),
      validationIssues: [],
      error: 'Nenhuma face selecionada.',
    }
  }

  try {
    // ── Corpo careca ─────────────────────────────────────────────────────────
    // removeSubMesh already calls buildCap() internally, closing the hole.
    const bodyGeo = removeSubMesh(geo, selectedFaceIndices, weldQ)
    computeSmoothNormalsByPosition(bodyGeo)

    // ── Peruca (shell watertight) ─────────────────────────────────────────────
    // cap=false → get only the raw outer surface, no artificial flat closing cap.
    const outerGeo = extractSubMesh(geo, selectedFaceIndices, false, weldQ)
    computeSmoothNormalsByPosition(outerGeo)

    const wigGeo = buildShell(outerGeo, totalOffset)

    const wigVertCount = (wigGeo.getAttribute('position') as THREE.BufferAttribute | null)?.count ?? 0
    if (wigVertCount === 0) {
      issues.push({
        type: 'warning',
        message: 'Nenhuma geometria gerada para a peruca. Verifique a seleção.',
      })
    }

    if (totalOffset <= 0.01) {
      issues.push({
        type: 'warning',
        message: 'Espessura muito pequena — pode gerar artefatos na impressão 3D.',
      })
    }

    return {
      ok: true,
      wigGeometry: wigGeo,
      bodyGeometry: bodyGeo,
      validationIssues: issues,
    }
  } catch (err) {
    return {
      ok: false,
      wigGeometry: new THREE.BufferGeometry(),
      bodyGeometry: new THREE.BufferGeometry(),
      validationIssues: [],
      error: err instanceof Error ? err.message : 'Erro desconhecido no Shell Cut',
    }
  }
}

// ─── Construção da casca (watertight shell) ────────────────────────────────────

/**
 * Dado uma superfície aberta (outerGeo, possivelmente indexada), gera uma
 * malha fechada com três camadas:
 *   • Superfície externa: triângulos originais (normais apontando para fora)
 *   • Superfície interna: triângulos espelhados com winding invertido,
 *     cada vértice deslocado por −(normal × totalOffset)
 *   • Paredes: quads conectando as arestas de borda externa às internas
 */
function buildShell(
  outerGeo: THREE.BufferGeometry,
  totalOffset: number,
): THREE.BufferGeometry {
  const posAttr = outerGeo.getAttribute('position') as THREE.BufferAttribute | null
  const nrmAttr = outerGeo.getAttribute('normal') as THREE.BufferAttribute | null
  const idxAttr = outerGeo.index

  if (!posAttr || posAttr.count === 0) return new THREE.BufferGeometry()

  const vertCount = posAttr.count
  const faceCount = idxAttr ? idxAttr.count / 3 : vertCount / 3

  // Helper: get vertex index for face f, corner c
  const getIdx = (f: number, c: number): number =>
    idxAttr ? idxAttr.getX(f * 3 + c) : f * 3 + c

  // ── 1. Cache positions and normals ─────────────────────────────────────────
  const outerPos = new Float32Array(vertCount * 3)
  const innerPos = new Float32Array(vertCount * 3)

  for (let v = 0; v < vertCount; v++) {
    const px = posAttr.getX(v), py = posAttr.getY(v), pz = posAttr.getZ(v)
    outerPos[v * 3]     = px
    outerPos[v * 3 + 1] = py
    outerPos[v * 3 + 2] = pz

    // Inner vertex = outer vertex shifted inward along inverted normal
    const nx = nrmAttr ? nrmAttr.getX(v) : 0
    const ny = nrmAttr ? nrmAttr.getY(v) : 1
    const nz = nrmAttr ? nrmAttr.getZ(v) : 0
    innerPos[v * 3]     = px - nx * totalOffset
    innerPos[v * 3 + 1] = py - ny * totalOffset
    innerPos[v * 3 + 2] = pz - nz * totalOffset
  }

  // ── 2. Detect boundary edges ────────────────────────────────────────────────
  // A directed edge (a→b) is a boundary edge if its reverse (b→a) is absent.
  // This works on properly welded (indexed) geometry where shared verts share indices.
  const directedEdges = new Map<string, [number, number]>()
  for (let f = 0; f < faceCount; f++) {
    const a = getIdx(f, 0), b = getIdx(f, 1), c = getIdx(f, 2)
    directedEdges.set(`${a},${b}`, [a, b])
    directedEdges.set(`${b},${c}`, [b, c])
    directedEdges.set(`${c},${a}`, [c, a])
  }
  const boundaryEdges: Array<[number, number]> = []
  for (const [key, [a, b]] of directedEdges) {
    if (!directedEdges.has(`${b},${a}`)) {
      boundaryEdges.push([a, b])
    }
  }

  // ── 3. Build output positions (non-indexed, 9 floats per triangle) ──────────
  const positions: number[] = []

  // Outer triangles: original winding (normals point outward from model)
  for (let f = 0; f < faceCount; f++) {
    const a = getIdx(f, 0), b = getIdx(f, 1), c = getIdx(f, 2)
    positions.push(
      outerPos[a * 3], outerPos[a * 3 + 1], outerPos[a * 3 + 2],
      outerPos[b * 3], outerPos[b * 3 + 1], outerPos[b * 3 + 2],
      outerPos[c * 3], outerPos[c * 3 + 1], outerPos[c * 3 + 2],
    )
  }

  // Inner triangles: winding A,C,B (flipped) so normals point toward body center,
  // i.e. outward from the wig's inner cavity.
  for (let f = 0; f < faceCount; f++) {
    const a = getIdx(f, 0), b = getIdx(f, 1), c = getIdx(f, 2)
    positions.push(
      innerPos[a * 3], innerPos[a * 3 + 1], innerPos[a * 3 + 2],
      innerPos[c * 3], innerPos[c * 3 + 1], innerPos[c * 3 + 2],
      innerPos[b * 3], innerPos[b * 3 + 1], innerPos[b * 3 + 2],
    )
  }

  // Wall quads: for each boundary edge (a→b), connect outer to inner.
  // Quad (outer-a, outer-b, inner-b, inner-a) as 2 triangles, CCW from outside.
  for (const [a, b] of boundaryEdges) {
    const ax = outerPos[a * 3], ay = outerPos[a * 3 + 1], az = outerPos[a * 3 + 2]
    const bx = outerPos[b * 3], by = outerPos[b * 3 + 1], bz = outerPos[b * 3 + 2]
    const ax_ = innerPos[a * 3], ay_ = innerPos[a * 3 + 1], az_ = innerPos[a * 3 + 2]
    const bx_ = innerPos[b * 3], by_ = innerPos[b * 3 + 1], bz_ = innerPos[b * 3 + 2]

    // Triangle 1: outer-a, outer-b, inner-b
    positions.push(ax, ay, az,  bx, by, bz,  bx_, by_, bz_)
    // Triangle 2: outer-a, inner-b, inner-a
    positions.push(ax, ay, az,  bx_, by_, bz_,  ax_, ay_, az_)
  }

  // ── 4. Build geometry and compute smooth normals ────────────────────────────
  const result = new THREE.BufferGeometry()
  result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  // computeSmoothNormalsByPosition averages face normals by position → smooth appearance
  computeSmoothNormalsByPosition(result)
  result.computeBoundingBox()
  result.computeBoundingSphere()
  return result
}
