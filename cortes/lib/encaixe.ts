/**
 * Encaixe Circular Integrado — Macho/Fêmea paramétrico
 * -----------------------------------------------------------------
 * Substitui o antigo sistema de pino solto + furos. Agora o encaixe
 * faz parte da geometria das duas peças resultantes do corte:
 *
 *   Peça A (selecionada)  → MACHO  (protuberância cilíndrica integrada)
 *   Peça B (complemento)  → FÊMEA  (cavidade cilíndrica integrada)
 *
 * - O eixo segue a normal da costura da seleção (auto-orientação).
 * - Macho e fêmea são parametricamente vinculados: a fêmea deriva do
 *   macho + tolerância de impressão 3D.
 * - Limites inteligentes: o encaixe nunca ultrapassa a região da
 *   costura (diâmetro) nem atravessa a peça receptora (altura).
 * - Nenhum pino separado é gerado — o STL final tem só as duas peças.
 *
 * Tolerância: a cavidade da fêmea é maior que o macho por `tolerance`
 * (radial), garantindo folga de impressão sem folga visual.
 */

import * as THREE from 'three'
import { Evaluator, Brush, ADDITION as UNION, SUBTRACTION } from 'three-bvh-csg'
import { analyzeSelection } from './smart-autocut'
import type { CutPart } from './store'

// ─── Tipos públicos ────────────────────────────────────────────────────────────

/** Limites calculados a partir da seleção + geometria da peça. */
export interface EncaixeLimits {
  /** Centro do encaixe no espaço local da peça ativa. */
  center: THREE.Vector3
  /**
   * Normal da costura orientada da peça selecionada (ativa) em direção
   * ao complemento. Usada para o eixo e para a orientação automática.
   */
  normal: THREE.Vector3
  /** Base ortonormal do plano da costura (para reposicionar no plano). */
  planeU: THREE.Vector3
  planeV: THREE.Vector3
  /** Maior raio do macho permitido pela região da costura. */
  maxRadius: number
  /** Maior altura do macho permitida pela peça receptora (≤ 8). */
  maxHeight: number
  /** Índice em cutParts[] da peça complementar. -1 se não há complemento. */
  complementIndex: number
  /** Nome descritivo da peça complementar. */
  complementName: string
}

/** Parâmetros finais para gerar as geometrias. */
export interface EncaixeApplyParams {
  /** Centro do encaixe (espaço local das peças). */
  center: THREE.Vector3
  /**
   * Direção do eixo APONTANDO da peça macho → peça fêmea. Macho e
   * cavidade da fêmea se estendem ao longo dela a partir do plano.
   */
  direction: THREE.Vector3
  /** Raio do macho (mm). */
  radius: number
  /** Altura/protrusão do macho (mm). */
  height: number
  /** Folga radial da cavidade da fêmea (mm). */
  tolerance: number
  /** Malha da peça que recebe o MACHO (integrado por união). */
  maleMesh: THREE.Mesh
  /** Malha da peça que recebe a FÊMEA (cavidade por subtração). */
  femaleMesh: THREE.Mesh
}

export interface EncaixeResult {
  /** Geometria da peça com o macho integrado. */
  maleGeo: THREE.BufferGeometry
  /** Geometria da peça com a cavidade fêmea integrada. */
  femaleGeo: THREE.BufferGeometry
  /** Profundidade efetiva da cavidade (≤ espessura da peça). */
  femaleDepth: number
}

// ─── Planejamento / limites inteligentes ───────────────────────────────────────

const HEIGHT_MIN = 3
const HEIGHT_MAX = 8
const RADIUS_MM_MIN = 0.8
const FEMALE_WALL_MM = 0.5

/**
 * Analisa a seleção e calcula os limites do encaixe. Não modifica nada.
 * Retorna `null` quando a seleção não tem costura utilizável.
 */
export function analyzeEncaixe(
  geometry: THREE.BufferGeometry,
  selectedFaces: Set<number>,
  cutParts: CutPart[],
): EncaixeLimits | null {
  if (!selectedFaces || selectedFaces.size === 0) return null

  const ana = analyzeSelection(geometry, selectedFaces)
  if (!ana || !ana.hasSeam) return null

  // Normal orientada da peça ativa em direção ao complemento
  const normal = ana.fitNormal.clone().normalize()
  const sourceOffset = ana.selectionCenter.clone().sub(ana.seamCenter).dot(normal)
  if (sourceOffset > 0) normal.negate()

  const center = ana.seamCenter.clone()

  // Diâmetro máximo = região da costura (com margem de segurança).
  // Região menor que o mínimo → não dá para encaixar com segurança.
  const maxRadius = Math.min(ana.halfU, ana.halfV) * 0.95
  if (maxRadius < RADIUS_MM_MIN) return null

  // Complemento: peça cortada no lado da normal e mais próxima do centro
  let complementIndex = -1
  let bestDist = Infinity
  for (let i = 0; i < cutParts.length; i++) {
    const geo = cutParts[i].mesh.geometry
    if (!geo.boundingBox) geo.computeBoundingBox()
    const bbCenter = new THREE.Vector3()
    geo.boundingBox!.getCenter(bbCenter)
    const sideSign = bbCenter.clone().sub(center).dot(normal)
    const penalty = sideSign < 0 ? 1e6 : 0
    const score = bbCenter.distanceTo(center) + penalty
    if (score < bestDist) {
      bestDist = score
      complementIndex = i
    }
  }

  // Altura máxima limitada pela espessura da peça receptora (não atravessar)
  let maxHeight = HEIGHT_MAX
  if (complementIndex >= 0) {
    const thickness = measureThickness(cutParts[complementIndex].mesh, center, normal)
    if (thickness > 0) {
      maxHeight = Math.min(HEIGHT_MAX, thickness - FEMALE_WALL_MM - 1)
    }
  }
  maxHeight = Math.max(HEIGHT_MIN, Math.min(HEIGHT_MAX, maxHeight))

  return {
    center,
    normal,
    planeU: ana.planeU.clone().normalize(),
    planeV: ana.planeV.clone().normalize(),
    maxRadius,
    maxHeight,
    complementIndex,
    complementName: complementIndex >= 0 ? cutParts[complementIndex].name : '',
  }
}

// ─── Aplicação (CSG) ───────────────────────────────────────────────────────────

/**
 * Gera as geometrias definitivas:
 *  - macho  = UNIÃO da peça com um cilindro (boss integrado);
 *  - fêmea  = SUBTRAÇÃO da peça com um cilindro maior (cavidade).
 * Pode lançar — envolva em try/catch no chamador.
 */
export function applyEncaixe(params: EncaixeApplyParams): EncaixeResult {
  const { center, direction, radius, height, tolerance, maleMesh, femaleMesh } = params

  const maleBrush = makeCylinderBrush(radius, height, center, direction)
  const femaleDepth = computeFemaleDepth(femaleMesh, center, direction, height, tolerance)
  const femaleBrush = makeCylinderBrush(radius + tolerance, femaleDepth, center, direction)

  const maleGeo = csgUnion(maleMesh.geometry, maleBrush)
  const femaleGeo = csgSubtract(femaleMesh.geometry, femaleBrush)

  disposeBrush(maleBrush)
  disposeBrush(femaleBrush)

  for (const g of [maleGeo, femaleGeo]) {
    g.computeVertexNormals()
    g.computeBoundingBox()
    g.computeBoundingSphere()
  }

  return { maleGeo, femaleGeo, femaleDepth }
}

/** Cilindro com base no plano da costura (local) estendendo ao longo de `dir`. */
function makeCylinderBrush(
  radius: number,
  length: number,
  center: THREE.Vector3,
  dir: THREE.Vector3,
): Brush {
  const geo = new THREE.CylinderGeometry(radius, radius, length, 48, 1, false)
  geo.translate(0, length / 2, 0)
  const b = new Brush(geo)
  b.position.copy(center)
  b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
  b.updateMatrixWorld()
  return b
}

function csgUnion(a: THREE.BufferGeometry, b: Brush): THREE.BufferGeometry {
  const ev = new Evaluator()
  ev.attributes = ['position', 'normal']
  const ba = new Brush(a.clone())
  ba.updateMatrixWorld()
  return ev.evaluate(ba, b, UNION).geometry
}

function csgSubtract(a: THREE.BufferGeometry, b: Brush): THREE.BufferGeometry {
  const ev = new Evaluator()
  ev.attributes = ['position', 'normal']
  const ba = new Brush(a.clone())
  ba.updateMatrixWorld()
  return ev.evaluate(ba, b, SUBTRACTION).geometry
}

function disposeBrush(b: Brush): void {
  try { b.geometry?.dispose() } catch {}
}

/**
 * Profundidade da cavidade da fêmea: suficiente para receber o macho
 * (height + tolerance + folga), mas nunca atravessando a peça.
 */
function computeFemaleDepth(
  mesh: THREE.Mesh,
  center: THREE.Vector3,
  direction: THREE.Vector3,
  height: number,
  tolerance: number,
): number {
  const thickness = measureThickness(mesh, center, direction)
  const ideal = height + tolerance + 1
  if (thickness <= 0) return Math.max(1, ideal)
  return Math.max(0.8, Math.min(ideal, thickness - FEMALE_WALL_MM))
}

/**
 * Mede a espessura da peça ao longo de `dir` a partir do centro do encaixe.
 * O centro/normal estão no espaço local da peça ativa; aqui são convertidos
 * para o frame da malha alvo (geralmente o mesmo frame das peças do corte).
 */
export function measureThickness(
  mesh: THREE.Mesh,
  center: THREE.Vector3,
  dir: THREE.Vector3,
): number {
  try {
    const inv = new THREE.Matrix4().copy(mesh.matrixWorld).invert()
    const origin = center.clone().applyMatrix4(inv)
    const axis = dir.clone().transformDirection(inv).normalize()

    const ray = new THREE.Raycaster()
    ray.near = 1e-4
    ray.far = 1e5
    ray.set(origin.clone().addScaledVector(axis, 0.02), axis)
    const hits = ray.intersectObject(mesh, false)
    if (hits.length < 2) return 0
    return Math.max(0, hits[hits.length - 1].distance - hits[0].distance)
  } catch {
    return 0
  }
}
