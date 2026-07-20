/**
 * Encaixe Quadrado — Geração de encaixe de quadrado tipo pino/furo
 * -----------------------------------------------------------------
 * Workflow separado do corte: o usuário seleciona com SmartCut a região
 * onde quer o encaixe (ex: pescoço), clica "Gerar Encaixe" e o sistema:
 *
 *   1. Analisa a costura da seleção para encontrar o plano de encaixe.
 *   2. Detecta automaticamente a peça complementar (aquela que foi
 *      descolada naquele ponto — ex: cabeça, mão).
 *   3. Subtrai o furo nas DUAS peças (pino vai por fora como peça solta).
 *   4. Cria o pino quadrado como cutPart separado (para impressão avulsa).
 *
 * Tamanho proporcional à seção transversal da costura.
 */

import * as THREE from 'three'
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg'
import { analyzeSelection } from './smart-autocut'
import type { CutPart } from './store'

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type EncaixeSize = 'xs' | 's' | 'm'

export interface EncaixeParams {
  size: EncaixeSize
  /** Folga (mm) adicionada ao furo em relação ao pino. Padrão 0.2. */
  tolerance: number
}

/** Dados de planejamento calculados antes de aplicar o encaixe. */
export interface EncaixePlan {
  /** Centro do plano de encaixe (espaço local da geometria). */
  seamCenter: THREE.Vector3
  /**
   * Normal do plano orientada da peça selecionada (fonte/pino) para a
   * peça complementar (furo/buraco). Usada para orientar o pino.
   */
  seamNormal: THREE.Vector3
  /** Lado do pino quadrado em unidades do modelo. */
  side: number
  /**
   * Profundidade total do conjunto furo+pino. Cada peça recebe
   * um furo de depth/2; o pino mede depth - folga.
   */
  depth: number
  /** Folga acrescentada ao furo. */
  tolerance: number
  /**
   * Índice em `cutParts[]` do complemento detectado.
   * -1 se nenhum complemento foi encontrado.
   */
  complementIndex: number
  /** Nome descritivo do complemento (para exibição na UI). */
  complementName: string
}

export interface EncaixeResult {
  /** Geometria atualizada da peça fonte (com furo subtraído). */
  sourceGeo: THREE.BufferGeometry
  /**
   * Geometria atualizada da peça complementar (com furo subtraído).
   * `null` quando não há peça cortada complementar — encaixe só na fonte.
   */
  complementGeo: THREE.BufferGeometry | null
  /** Geometria do pino quadrado (peça solta para impressão separada). */
  pegGeo: THREE.BufferGeometry
  /** Posição central do pino (espaço local do modelo). */
  pegPosition: THREE.Vector3
  /** Quaternion que alinha Y → seamNormal (orientação do pino). */
  pegQuaternion: THREE.Quaternion
}

// ─── Planejamento ─────────────────────────────────────────────────────────────

const SIZE_FRACTION: Record<EncaixeSize, number> = {
  xs: 0.08,
  s:  0.13,
  m:  0.20,
}
const MIN_SIDE_MM = 0.8
const MAX_SIDE_MM = 10.0

/**
 * Analisa a seleção e planeja os parâmetros do encaixe quadrado.
 * Não modifica nenhuma geometria — só faz cálculos.
 */
export function planEncaixe(
  geometry: THREE.BufferGeometry,
  selectedFaces: Set<number>,
  cutParts: CutPart[],
  params: EncaixeParams,
): EncaixePlan | null {
  if (selectedFaces.size === 0) return null

  const ana = analyzeSelection(geometry, selectedFaces)

  // ── Normal orientada da seleção para o complemento ───────────────────────
  const seamNormal = ana.fitNormal.clone().normalize()
  const sourceOffset = ana.selectionCenter.clone().sub(ana.seamCenter).dot(seamNormal)
  // Se a seleção está no lado positivo da normal, a normal já aponta
  // para longe da seleção (em direção ao complemento). Caso contrário, inverte.
  if (sourceOffset > 0) seamNormal.negate()

  // ── Tamanho proporcional à seção mínima da costura ───────────────────────
  const minSectionDim = Math.min(ana.halfU, ana.halfV) * 2
  const fraction = SIZE_FRACTION[params.size]
  let side = minSectionDim * fraction
  // Fallback: seção muito pequena ou inválida → usa escala global
  if (!isFinite(side) || side < MIN_SIDE_MM) {
    side = Math.max(MIN_SIDE_MM, ana.modelDiagonal * 0.012 * fraction / 0.13)
  }
  side = Math.min(side, MAX_SIDE_MM)
  const depth = side * 2.2 // profundidade total ≈ 2× a largura

  // ── Detecta peça complementar (opcional) ─────────────────────────────────
  const seamCenter = ana.seamCenter.clone()
  let bestIdx = -1
  let bestDist = Infinity

  for (let i = 0; i < cutParts.length; i++) {
    const geo = cutParts[i].mesh.geometry
    if (!geo.boundingBox) geo.computeBoundingBox()
    const center = new THREE.Vector3()
    geo.boundingBox!.getCenter(center)

    // Prefere peças do lado oposto ao da seleção (lado do complemento)
    const sideSign = center.clone().sub(seamCenter).dot(seamNormal)
    // Pontuação: peças no lado certo (sideSign > 0) e próximas ao seam têm prioridade
    const penaltyWrongSide = sideSign < 0 ? 1e6 : 0
    const score = center.distanceTo(seamCenter) + penaltyWrongSide
    if (score < bestDist) { bestDist = score; bestIdx = i }
  }

  // bestIdx === -1 quando não há peças cortadas — encaixe só na peça fonte
  return {
    seamCenter,
    seamNormal,
    side,
    depth,
    tolerance: params.tolerance,
    complementIndex: bestIdx,
    complementName: bestIdx >= 0 ? cutParts[bestIdx].name : '',
  }
}

// ─── Aplicação ────────────────────────────────────────────────────────────────

/**
 * Subtrai os furos das duas peças e retorna as geometrias atualizadas
 * junto com o pino quadrado para ser adicionado como cutPart separado.
 *
 * Pode lançar — envolva em try/catch no chamador.
 */
/** Cria um novo Brush do furo posicionado na costura. Recriado a cada operação
 *  para evitar estado acumulado no three-bvh-csg entre chamadas consecutivas. */
function makeHoleBrush(
  holeGeo: THREE.BoxGeometry,
  seamCenter: THREE.Vector3,
  quat: THREE.Quaternion,
): Brush {
  const b = new Brush(holeGeo.clone())
  b.position.copy(seamCenter)
  b.quaternion.copy(quat)
  b.updateMatrixWorld()
  return b
}

export function applyEncaixe(
  sourceMesh: THREE.Mesh,
  complementMesh: THREE.Mesh | null,
  plan: EncaixePlan,
): EncaixeResult {
  // ── Geometria do furo (maior que o pino pela tolerância) ─────────────────
  const hs = plan.side + plan.tolerance * 2
  const hd = plan.depth + plan.tolerance
  const holeGeo = new THREE.BoxGeometry(hs, hd, hs)

  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    plan.seamNormal.clone().normalize(),
  )

  // ── Subtrai furo da peça fonte — avaliador independente ──────────────────
  let sourceGeo: THREE.BufferGeometry
  try {
    const ev = new Evaluator()
    ev.attributes = ['position', 'normal']
    const srcBrush = new Brush(sourceMesh.geometry.clone())
    srcBrush.updateMatrixWorld()
    const holeSrc = makeHoleBrush(holeGeo, plan.seamCenter, quat)
    sourceGeo = ev.evaluate(srcBrush, holeSrc, SUBTRACTION).geometry
  } catch (e) {
    console.error('[Encaixe] CSG falhou na peça fonte:', e)
    sourceGeo = sourceMesh.geometry.clone()
  }

  // ── Subtrai furo da peça complementar — avaliador independente ───────────
  // null quando não existe peça cortada — encaixe só na fonte
  let complementGeo: THREE.BufferGeometry | null = null
  if (complementMesh) {
    try {
      const ev = new Evaluator()
      ev.attributes = ['position', 'normal']
      const compBrush = new Brush(complementMesh.geometry.clone())
      compBrush.updateMatrixWorld()
      const holeComp = makeHoleBrush(holeGeo, plan.seamCenter, quat)
      complementGeo = ev.evaluate(compBrush, holeComp, SUBTRACTION).geometry
    } catch (e) {
      console.error('[Encaixe] CSG falhou na peça complementar:', e)
      complementGeo = complementMesh.geometry.clone()
    }
  }

  // ── Geometria do pino (levemente menor que o furo) ───────────────────────
  const ps = Math.max(0.3, plan.side - plan.tolerance * 0.5)
  const pd = Math.max(0.5, plan.depth - plan.tolerance * 1.0)
  const pegGeo = new THREE.BoxGeometry(ps, pd, ps)

  // ── Finaliza ─────────────────────────────────────────────────────────────
  for (const g of [sourceGeo, complementGeo, pegGeo]) {
    if (!g) continue
    g.computeVertexNormals()
    g.computeBoundingBox()
    g.computeBoundingSphere()
  }

  holeGeo.dispose()

  return {
    sourceGeo,
    complementGeo,
    pegGeo,
    pegPosition: plan.seamCenter.clone(),
    pegQuaternion: quat.clone(),
  }
}
