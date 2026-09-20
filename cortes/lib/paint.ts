/**
 * Paint — pintura persistente por face com cores escolhidas pelo usuário.
 *
 * Reutiliza a mesma infra de vertex colors da seleção (smart-cut.ts) para
 * não duplicar atributos. O `color` attribute é a única fonte de verdade
 * para o renderer; a camada de seleção (laranja/hover) é sobreposta
 * temporariamente e restaurada ao limpar a seleção.
 *
 * Armazenamento: `paintedFaceColors` é um Map<faceIndex, hex> por parte,
 * guardado no store (por partId). A geometria reflete esse mapa via
 * `color` attribute. Ao trocar de peça, o mapa da peça ativa é reaplicado.
 */

import * as THREE from 'three'
import { ensureColorAttribute } from './smart-cut'

// ─── Conversão ───────────────────────────────────────────────────────────────

export function hexToRgbNorm(hex: string): [number, number, number] {
  const h = hex.replace('#', '').trim()
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  if (isNaN(n)) return [0.5, 0.5, 0.52]
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export function rgbNormToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Base cinza neutro (igual ao smart-cut C_BASE)
const BASE_RGB: [number, number, number] = [0.5, 0.5, 0.52]

function vertexOf(geometry: THREE.BufferGeometry, face: number, corner: number): number {
  const idx = geometry.index
  const base = face * 3 + corner
  return idx ? idx.getX(base) : base
}

/**
 * Garante que a geometria tenha atributo `color` e que ele reflita o mapa
 * de faces pintadas (se fornecido). Chamado ao trocar de peça ativa ou
 * após undo/redo.
 */
export function syncPaintedColors(
  geometry: THREE.BufferGeometry,
  material: THREE.MeshStandardMaterial,
  paintedMap: Map<number, string> | null,
): void {
  const colorAttr = ensureColorAttribute(geometry, material)
  const colors = colorAttr.array as Float32Array
  const vertCount = (geometry.getAttribute('position') as THREE.BufferAttribute).count

  // Reset para base
  for (let i = 0; i < vertCount; i++) {
    colors[i * 3] = BASE_RGB[0]
    colors[i * 3 + 1] = BASE_RGB[1]
    colors[i * 3 + 2] = BASE_RGB[2]
  }

  if (!paintedMap || paintedMap.size === 0) {
    colorAttr.needsUpdate = true
    return
  }

  for (const [face, hex] of paintedMap) {
    const [r, g, b] = hexToRgbNorm(hex)
    for (let c = 0; c < 3; c++) {
      const vi = vertexOf(geometry, face, c)
      colors[vi * 3] = r
      colors[vi * 3 + 1] = g
      colors[vi * 3 + 2] = b
    }
  }
  colorAttr.needsUpdate = true
}

/**
 * Pinta as faces selecionadas com a cor escolhida. Atualiza o mapa e o
 * atributo `color` da geometria. Retorna número de faces pintadas.
 */
export function paintSelectedFaces(
  geometry: THREE.BufferGeometry,
  material: THREE.MeshStandardMaterial,
  selectedFaces: Set<number>,
  colorHex: string,
  paintedMap: Map<number, string>,
): number {
  if (selectedFaces.size === 0) return 0
  const colorAttr = ensureColorAttribute(geometry, material)
  const colors = colorAttr.array as Float32Array
  const [r, g, b] = hexToRgbNorm(colorHex)

  let count = 0
  for (const f of selectedFaces) {
    paintedMap.set(f, colorHex)
    for (let c = 0; c < 3; c++) {
      const vi = vertexOf(geometry, f, c)
      colors[vi * 3] = r
      colors[vi * 3 + 1] = g
      colors[vi * 3 + 2] = b
    }
    count++
  }
  colorAttr.needsUpdate = true
  return count
}

/**
 * Limpa a pintura das faces selecionadas (volta ao cinza base). Se
 * `selectedFaces` estiver vazio e `all` for true, limpa tudo.
 */
export function clearPaintedFaces(
  geometry: THREE.BufferGeometry,
  material: THREE.MeshStandardMaterial,
  selectedFaces: Set<number>,
  paintedMap: Map<number, string>,
  all = false,
): number {
  const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute | null
  if (!colorAttr) return 0
  const colors = colorAttr.array as Float32Array

  let cleared = 0
  if (all) {
    cleared = paintedMap.size
    paintedMap.clear()
    // Reset all vertices to base
    const vertCount = (geometry.getAttribute('position') as THREE.BufferAttribute).count
    for (let i = 0; i < vertCount; i++) {
      colors[i * 3] = BASE_RGB[0]
      colors[i * 3 + 1] = BASE_RGB[1]
      colors[i * 3 + 2] = BASE_RGB[2]
    }
  } else {
    for (const f of selectedFaces) {
      if (!paintedMap.has(f)) continue
      paintedMap.delete(f)
      for (let c = 0; c < 3; c++) {
        const vi = vertexOf(geometry, f, c)
        colors[vi * 3] = BASE_RGB[0]
        colors[vi * 3 + 1] = BASE_RGB[1]
        colors[vi * 3 + 2] = BASE_RGB[2]
      }
      cleared++
    }
  }
  colorAttr.needsUpdate = true
  return cleared
}

/**
 * Lê a cor pintada de uma face (para export). Retorna hex ou null (base).
 */
export function getFacePaintColor(
  geometry: THREE.BufferGeometry,
  faceIndex: number,
  paintedMap: Map<number, string> | null,
): string | null {
  if (paintedMap && paintedMap.has(faceIndex)) return paintedMap.get(faceIndex)!
  // Fallback: tenta ler do atributo color (útil para geometrias já com vertex colors)
  const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute | null
  if (!colorAttr) return null
  const vi = vertexOf(geometry, faceIndex, 0)
  const r = colorAttr.getX(vi)
  const g = colorAttr.getY(vi)
  const b = colorAttr.getZ(vi)
  const isBase = Math.abs(r - BASE_RGB[0]) < 0.01 && Math.abs(g - BASE_RGB[1]) < 0.01 && Math.abs(b - BASE_RGB[2]) < 0.01
  if (isBase) return null
  return rgbNormToHex(r, g, b)
}
