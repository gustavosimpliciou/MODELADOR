"use client"

import { create } from 'zustand'
import type * as THREE from 'three'
import type { AutoSplitPlan } from './auto-split'
import { type Part, createPart } from './parts-manager'

export type Tool = 'select' | 'erase' | 'cut' | 'autosplit' | 'measure' | 'reset'
export type SelectionState = 'idle' | 'hovering' | 'selected' | 'cutting'
export type AppStatus = 'idle' | 'loading' | 'loaded' | 'selecting' | 'cutting' | 'exporting' | 'error'
export type SelectionMode = 'new' | 'add' | 'subtract'
/** Método de seleção do SmartCut: peça inteira (ilha) ou por curvatura */
export type CutMode = 'island' | 'curvature'
/** Modo de visualização do Preview interativo do corte (renderização 3D) */
export type PreviewViewMode = 'solid' | 'wireframe' | 'xray'
/** Estágio atual do pipeline V2 do SmartCut */
export type AutoCutPipelineStage = 'idle' | 'cut_done' | 'caps_done'
/** Modo de visualização semântico do AutoCut V2 (qual etapa está sendo exibida) */
export type AutoCutPreviewMode = 'plane' | 'shell' | 'caps' | 'connectors' | 'final'

export interface ModelInfo {
  name: string
  vertices: number
  faces: number
  width: number
  height: number
  depth: number
  fileSize: string
}

export interface CutPart {
  id: string
  name: string
  mesh: THREE.Mesh
  faceIndices: number[]
  color: string
  /** true quando a peça é um encaixe (pino/dowel) gerado automaticamente. */
  isConnector?: boolean
}

/** Dados das cascas abertas (Etapas 1–3 do SmartCut V2, sem tampas). */
export interface OpenCutData {
  openSelectedGeometry: THREE.BufferGeometry
  openBodyGeometry: THREE.BufferGeometry
  seamPoints: Float32Array
  seamScore: number
  seamSegments: number
  iterations: number
}

/** Dados do Preview interativo do corte (antes da aplicação definitiva). */
export interface CutPreviewData {
  /** Geometria da peça selecionada (será separada) — vermelho transparente no preview. */
  selectedGeometry: THREE.BufferGeometry
  /** Geometria do corpo restante — cinza no preview. */
  bodyGeometry: THREE.BufferGeometry
  /** Pontos do isocontorno para LineSegments (linha de separação branca). */
  seamPoints: Float32Array
  seamScore: number
  seamSegments: number
  iterations: number
  validationIssues: import('./quality-cut').ValidationIssue[]
  /** Parâmetros que geraram este preview (para re-calcular ao mudar). */
  params: {
    strength: number
    weldQ: number
    offset: number
    relaxIterations: number
    /** Tipo de corte: tradicional (isocontorno) ou shell (peruca com espessura). */
    cutType?: 'traditional' | 'shell'
    /** Espessura da parede da peruca (Shell Cut). */
    shellThickness?: number
    /** Folga de encaixe da peruca (Shell Cut). */
    shellClearance?: number
  }
}

// Snapshot do estado versionável para desfazer/refazer
export interface HistorySnapshot {
  selectedFaceIndices: Set<number>
  cutParts: CutPart[]
  selectionState: SelectionState
  activeCutPartId: string | null
  modelMesh: THREE.Mesh | null
  modelInfo: ModelInfo | null
  parts: Part[]
  activePartId: string | null
}

export interface AppState {
  // Status geral
  status: AppStatus
  statusMessage: string
  fps: number

  // Arquivo e modelo
  modelInfo: ModelInfo | null
  modelMesh: THREE.Mesh | null
  originalGeometry: THREE.BufferGeometry | null

  // ─── Sistema de Partes Independentes ─────────────────────────────────────────
  /** Todas as partes presentes na cena. A peça original sempre é a primeira. */
  parts: Part[]
  /** ID da parte atualmente ativa (selecionada no painel de Partes). */
  activePartId: string | null

  // Ferramentas
  activeTool: Tool
  unit: 'mm' | 'cm' | 'm' | 'in'

  // Seleção SmartCut
  selectionState: SelectionState
  selectionMode: SelectionMode
  selectedFaceIndices: Set<number>
  hoveredFaceIndices: Set<number>
  cutParts: CutPart[]
  activeCutPartId: string | null

  // Configurações de visualização
  showGrid: boolean
  showAxes: boolean
  showWireframe: boolean

  allowCutPartSelection: boolean

  // Configurações SmartCut
  sharpAngle: number
  cutMode: CutMode

  // Borracha (raio do pincel em % do tamanho do modelo)
  eraserSize: number

  // Corte por plano (Solid Plane Cut)
  cutPlaneAxis: 'x' | 'y' | 'z'
  cutPlaneOffset: number
  cutPlaneFlip: boolean

  // Auto Split — plano de cortes sugeridos por geometria
  autoSplitPlan: AutoSplitPlan | null

  // AutoCut na Seleção (SmartCut → AutoCut)
  autoCutOpen: boolean
  autoCutPreview: { normal: [number, number, number]; point: [number, number, number] } | null

  // Encaixe — painel de pino/furo (abre só pelo botão)
  encaixeOpen: boolean

  // ─── Pipeline V2 do SmartCut ──────────────────────────────────────────────
  openCutData: OpenCutData | null
  autoCutPipelineStage: AutoCutPipelineStage
  autoCutPreviewMode: AutoCutPreviewMode

  // ─── Preview interativo do corte ──────────────────────────────────────────
  cutPreview: CutPreviewData | null
  previewViewMode: PreviewViewMode

  // Histórico (desfazer/refazer)
  past: HistorySnapshot[]
  future: HistorySnapshot[]

  // ── Ações do sistema de Partes ────────────────────────────────────────────
  /**
   * Registra um modelo recém-importado como a primeira Parte da cena.
   * Limpa quaisquer partes anteriores.
   */
  registerModelAsPart: (mesh: THREE.Mesh, name: string) => void
  /** Adiciona uma nova Parte à lista (uso interno do pipeline de corte). */
  addPart: (part: Part) => void
  /** Atualiza campos de uma Parte existente (exceto o id). */
  updatePart: (id: string, updates: Partial<Omit<Part, 'id'>>) => void
  /** Remove uma Parte da lista. */
  removePart: (id: string) => void
  /**
   * Define a Parte ativa (selecionada no painel).
   * Atualiza modelMesh para a malha desta parte (compatibilidade com SmartCut).
   */
  setActivePartId: (id: string | null) => void
  /** Alterna a visibilidade de uma Parte. */
  togglePartVisibility: (id: string) => void
  /** Alterna o bloqueio de uma Parte. */
  togglePartLocked: (id: string) => void
  /** Renomeia uma Parte. */
  renamePart: (id: string, name: string) => void

  // Ações
  setStatus: (status: AppStatus, message?: string) => void
  setFps: (fps: number) => void
  setModelInfo: (info: ModelInfo | null) => void
  /**
   * Define o mesh principal.
   * Se houver uma parte ativa, também sincroniza a malha dela em `parts`.
   */
  setModelMesh: (mesh: THREE.Mesh | null) => void
  setOriginalGeometry: (geo: THREE.BufferGeometry | null) => void
  setActiveTool: (tool: Tool) => void
  setUnit: (unit: 'mm' | 'cm' | 'm' | 'in') => void
  setSelectionState: (state: SelectionState) => void
  setSelectionMode: (mode: SelectionMode) => void
  setSelectedFaceIndices: (indices: Set<number>) => void
  setHoveredFaceIndices: (indices: Set<number>) => void
  /**
   * Adiciona uma peça cortada.
   * Também adiciona a entrada correspondente em `parts`.
   */
  addCutPart: (part: CutPart) => void
  /**
   * Remove uma peça cortada.
   * Também remove a entrada correspondente em `parts`.
   */
  removeCutPart: (id: string) => void
  setCutParts: (parts: CutPart[]) => void
  setActiveCutPartId: (id: string | null) => void
  setSharpAngle: (angle: number) => void
  setCutMode: (mode: CutMode) => void
  setEraserSize: (size: number) => void
  setCutPlaneAxis: (axis: 'x' | 'y' | 'z') => void
  setCutPlaneOffset: (offset: number) => void
  toggleCutPlaneFlip: () => void
  setAutoSplitPlan: (plan: AutoSplitPlan | null) => void
  setAutoCutOpen: (open: boolean) => void
  setEncaixeOpen: (open: boolean) => void
  setAutoCutPreview: (
    preview: { normal: [number, number, number]; point: [number, number, number] } | null,
  ) => void
  setOpenCutData: (data: OpenCutData | null) => void
  setAutoCutPipelineStage: (stage: AutoCutPipelineStage) => void
  setAutoCutPreviewMode: (mode: AutoCutPreviewMode) => void
  setCutPreview: (preview: CutPreviewData | null) => void
  setPreviewViewMode: (mode: PreviewViewMode) => void
  toggleGrid: () => void
  toggleAxes: () => void
  toggleWireframe: () => void
  toggleCutPartSelection: () => void
  clearSelection: () => void
  resetAll: () => void

  // Histórico
  pushHistory: () => void
  undo: () => void
  redo: () => void
}

const MAX_HISTORY = 50

function disposeOpenCutData(data: OpenCutData | null): void {
  if (!data) return
  try { data.openSelectedGeometry.dispose() } catch {}
  try { data.openBodyGeometry.dispose() } catch {}
}

function disposeCutPreview(preview: CutPreviewData | null): void {
  if (!preview) return
  try { preview.selectedGeometry.dispose() } catch {}
  try { preview.bodyGeometry.dispose() } catch {}
}

export const useAppStore = create<AppState>((set, get) => ({
  status: 'idle',
  statusMessage: 'Pronto. Abra um modelo 3D para começar.',
  fps: 60,

  modelInfo: null,
  modelMesh: null,
  originalGeometry: null,

  parts: [],
  activePartId: null,

  activeTool: 'select',
  unit: 'mm',

  selectionState: 'idle',
  selectionMode: 'new',
  selectedFaceIndices: new Set(),
  hoveredFaceIndices: new Set(),
  cutParts: [],
  activeCutPartId: null,

  showGrid: true,
  showAxes: true,
  showWireframe: false,

  allowCutPartSelection: false,

  sharpAngle: 10,
  cutMode: 'island',

  eraserSize: 5,

  cutPlaneAxis: 'y',
  cutPlaneOffset: 0.5,
  cutPlaneFlip: false,

  autoSplitPlan: null,

  autoCutOpen: false,
  autoCutPreview: null,
  encaixeOpen: false,

  openCutData: null,
  autoCutPipelineStage: 'idle',
  autoCutPreviewMode: 'shell',

  cutPreview: null,
  previewViewMode: 'solid',

  past: [],
  future: [],

  // ── Sistema de Partes ──────────────────────────────────────────────────────

  registerModelAsPart: (mesh, name) =>
    set((state) => {
      const part = createPart(mesh, name.replace(/\.[^.]+$/, '') || 'Corpo Principal')
      return {
        parts: [part],
        activePartId: part.id,
        modelMesh: mesh,
        cutParts: [],
        activeCutPartId: null,
        selectedFaceIndices: new Set(),
        hoveredFaceIndices: new Set(),
        selectionState: 'idle',
        autoCutOpen: false,
        encaixeOpen: false,
        autoCutPreview: null,
        cutPreview: null,
        openCutData: null,
        autoCutPipelineStage: 'idle',
        autoCutPreviewMode: 'shell',
      }
    }),

  addPart: (part) =>
    set((state) => ({ parts: [...state.parts, part] })),

  updatePart: (id, updates) =>
    set((state) => ({
      parts: state.parts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  removePart: (id) =>
    set((state) => {
      const newParts = state.parts.filter((p) => p.id !== id)
      const newActiveId =
        state.activePartId === id
          ? (newParts[0]?.id ?? null)
          : state.activePartId
      const newModelMesh =
        newActiveId !== state.activePartId
          ? (newParts.find((p) => p.id === newActiveId)?.mesh ?? null)
          : state.modelMesh
      return {
        parts: newParts,
        activePartId: newActiveId,
        modelMesh: newModelMesh,
        // Keep cutParts in sync
        cutParts: state.cutParts.filter((cp) => cp.id !== id),
      }
    }),

  setActivePartId: (id) =>
    set((state) => {
      if (id === null) {
        return { activePartId: null }
      }
      const part = state.parts.find((p) => p.id === id)
      return {
        activePartId: id,
        // Redirect modelMesh so SmartCut operates on the active part
        modelMesh: part?.mesh ?? state.modelMesh,
        // Reset selection when switching parts
        selectedFaceIndices: new Set(),
        hoveredFaceIndices: new Set(),
        selectionState: 'idle',
        autoCutOpen: false,
      }
    }),

  togglePartVisibility: (id) =>
    set((state) => ({
      parts: state.parts.map((p) =>
        p.id === id ? { ...p, visible: !p.visible } : p,
      ),
    })),

  togglePartLocked: (id) =>
    set((state) => ({
      parts: state.parts.map((p) =>
        p.id === id ? { ...p, locked: !p.locked } : p,
      ),
    })),

  renamePart: (id, name) =>
    set((state) => ({
      parts: state.parts.map((p) => (p.id === id ? { ...p, name } : p)),
      // Keep cutParts name in sync
      cutParts: state.cutParts.map((cp) =>
        cp.id === id ? { ...cp, name } : cp,
      ),
    })),

  // ── Ações legadas (mantidas para compatibilidade) ─────────────────────────

  setStatus: (status, message) =>
    set({ status, statusMessage: message ?? getDefaultMessage(status) }),

  setFps: (fps) => set({ fps }),

  setModelInfo: (info) => set({ modelInfo: info }),

  /**
   * Atualiza modelMesh E sincroniza a malha da parte ativa em `parts`.
   */
  setModelMesh: (mesh) =>
    set((state) => {
      if (mesh === null) return { modelMesh: null }
      const newParts = state.activePartId
        ? state.parts.map((p) =>
            p.id === state.activePartId ? { ...p, mesh } : p,
          )
        : state.parts
      return { modelMesh: mesh, parts: newParts }
    }),

  setOriginalGeometry: (geo) => set({ originalGeometry: geo }),

  setActiveTool: (tool) => set({ activeTool: tool }),

  setUnit: (unit) => set({ unit }),

  setSelectionState: (selectionState) => set({ selectionState }),

  setSelectionMode: (selectionMode) => set({ selectionMode }),

  setSelectedFaceIndices: (selectedFaceIndices) => set({ selectedFaceIndices }),

  setHoveredFaceIndices: (hoveredFaceIndices) => set({ hoveredFaceIndices }),

  /**
   * Adiciona uma peça cortada ao sistema legado E também ao array de Partes.
   */
  addCutPart: (cutPart) =>
    set((state) => {
      const newPart = createPart(
        cutPart.mesh,
        cutPart.name,
        state.activePartId,
      )
      // Use the same id as cutPart so removals stay in sync
      newPart.id = cutPart.id
      return {
        cutParts: [...state.cutParts, cutPart],
        parts: [...state.parts, newPart],
      }
    }),

  /**
   * Remove uma peça cortada do sistema legado E também do array de Partes.
   */
  removeCutPart: (id) =>
    set((state) => ({
      cutParts: state.cutParts.filter((p) => p.id !== id),
      parts: state.parts.filter((p) => p.id !== id),
      activeCutPartId:
        state.activeCutPartId === id ? null : state.activeCutPartId,
      activePartId:
        state.activePartId === id
          ? (state.parts.find((p) => p.id !== id)?.id ?? null)
          : state.activePartId,
    })),

  setCutParts: (cutParts) =>
    set((state) => {
      // Sincroniza as malhas atualizadas em `parts` para que o ModelRenderer
      // re-renderize as peças cortadas com a nova geometria (ex: furo de encaixe).
      const cutById = new Map(cutParts.map((cp) => [cp.id, cp]))
      const parts = state.parts.map((p) => {
        const updated = cutById.get(p.id)
        if (!updated) return p
        return { ...p, mesh: updated.mesh }
      })
      return { cutParts, parts }
    }),

  setActiveCutPartId: (id) => set({ activeCutPartId: id }),

  setSharpAngle: (sharpAngle) => set({ sharpAngle }),

  setCutMode: (cutMode) => set({ cutMode }),

  setEraserSize: (eraserSize) => set({ eraserSize }),

  setCutPlaneAxis: (cutPlaneAxis) => set({ cutPlaneAxis }),

  setCutPlaneOffset: (cutPlaneOffset) => set({ cutPlaneOffset }),

  toggleCutPlaneFlip: () => set((state) => ({ cutPlaneFlip: !state.cutPlaneFlip })),

  setAutoSplitPlan: (autoSplitPlan) => set({ autoSplitPlan }),

  setAutoCutOpen: (autoCutOpen) => set({ autoCutOpen }),

  setEncaixeOpen: (encaixeOpen) => set({ encaixeOpen }),

  setAutoCutPreview: (autoCutPreview) => set({ autoCutPreview }),

  setOpenCutData: (openCutData) =>
    set((state) => {
      if (state.openCutData && state.openCutData !== openCutData) disposeOpenCutData(state.openCutData)
      return { openCutData }
    }),

  setAutoCutPipelineStage: (autoCutPipelineStage) => set({ autoCutPipelineStage }),

  setAutoCutPreviewMode: (autoCutPreviewMode) => set({ autoCutPreviewMode }),

  setCutPreview: (cutPreview) =>
    set((state) => {
      if (state.cutPreview && state.cutPreview !== cutPreview) disposeCutPreview(state.cutPreview)
      return { cutPreview }
    }),

  setPreviewViewMode: (previewViewMode) => set({ previewViewMode }),

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  toggleAxes: () => set((state) => ({ showAxes: !state.showAxes })),

  toggleWireframe: () => set((state) => ({ showWireframe: !state.showWireframe })),

  toggleCutPartSelection: () =>
    set((state) => ({
      allowCutPartSelection: !state.allowCutPartSelection,
      activeCutPartId: !state.allowCutPartSelection ? state.activeCutPartId : null,
    })),

  clearSelection: () =>
    set((state) => {
      disposeCutPreview(state.cutPreview)
      disposeOpenCutData(state.openCutData)
      return {
        selectedFaceIndices: new Set(),
        hoveredFaceIndices: new Set(),
        selectionState: 'idle',
        autoCutOpen: false,
        encaixeOpen: false,
        autoCutPreview: null,
        cutPreview: null,
        openCutData: null,
        autoCutPipelineStage: 'idle',
        autoCutPreviewMode: 'shell',
      }
    }),

  resetAll: () =>
    set((state) => {
      disposeCutPreview(state.cutPreview)
      disposeOpenCutData(state.openCutData)
      return {
        past: pushSnapshot(state.past, snapshotOf(state)),
        future: [],
        selectionState: 'idle',
        selectedFaceIndices: new Set(),
        hoveredFaceIndices: new Set(),
        activeCutPartId: null,
        autoCutOpen: false,
        encaixeOpen: false,
        autoCutPreview: null,
        cutPreview: null,
        openCutData: null,
        autoCutPipelineStage: 'idle' as AutoCutPipelineStage,
        autoCutPreviewMode: 'shell' as AutoCutPreviewMode,
        status: 'loaded',
        statusMessage: 'Seleção resetada.',
      }
    }),

  pushHistory: () =>
    set((state) => ({
      past: pushSnapshot(state.past, snapshotOf(state)),
      future: [],
    })),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return {}
      const previous = state.past[state.past.length - 1]
      const newPast = state.past.slice(0, -1)
      disposeCutPreview(state.cutPreview)
      return {
        past: newPast,
        future: [snapshotOf(state), ...state.future].slice(0, MAX_HISTORY),
        selectedFaceIndices: previous.selectedFaceIndices,
        cutParts: previous.cutParts,
        selectionState: previous.selectionState,
        activeCutPartId: previous.activeCutPartId,
        modelMesh: previous.modelMesh,
        modelInfo: previous.modelInfo,
        parts: previous.parts,
        activePartId: previous.activePartId,
        hoveredFaceIndices: new Set(),
        cutPreview: null,
        status: 'loaded',
        statusMessage: 'Ação desfeita.',
      }
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return {}
      const next = state.future[0]
      const newFuture = state.future.slice(1)
      disposeCutPreview(state.cutPreview)
      return {
        past: pushSnapshot(state.past, snapshotOf(state)),
        future: newFuture,
        selectedFaceIndices: next.selectedFaceIndices,
        cutParts: next.cutParts,
        selectionState: next.selectionState,
        activeCutPartId: next.activeCutPartId,
        modelMesh: next.modelMesh,
        modelInfo: next.modelInfo,
        parts: next.parts,
        activePartId: next.activePartId,
        hoveredFaceIndices: new Set(),
        cutPreview: null,
        status: 'loaded',
        statusMessage: 'Ação refeita.',
      }
    }),
}))

// ── Helpers de histórico ──────────────────────────────────────────────────────
function snapshotOf(state: AppState): HistorySnapshot {
  return {
    selectedFaceIndices: new Set(state.selectedFaceIndices),
    cutParts: [...state.cutParts],
    selectionState: state.selectionState,
    activeCutPartId: state.activeCutPartId,
    modelMesh: state.modelMesh,
    modelInfo: state.modelInfo,
    parts: [...state.parts],
    activePartId: state.activePartId,
  }
}

function pushSnapshot(past: HistorySnapshot[], snap: HistorySnapshot): HistorySnapshot[] {
  const next = [...past, snap]
  return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next
}

function getDefaultMessage(status: AppStatus): string {
  // Use lang store if available (lazy import to avoid circular deps at module load time)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getT } = require('./lang-store') as typeof import('./lang-store')
    const t = getT()
    switch (status) {
      case 'idle':      return t.status_idle
      case 'loading':   return t.status_loading
      case 'loaded':    return t.status_loaded
      case 'selecting': return t.status_selecting
      case 'cutting':   return t.status_cutting
      case 'exporting': return t.status_exporting
      case 'error':     return t.status_error
      default:          return ''
    }
  } catch {
    switch (status) {
      case 'idle': return 'Pronto. Abra um modelo 3D para começar.'
      case 'loading': return 'Carregando modelo...'
      case 'loaded': return 'Modelo carregado. Clique em uma região para selecionar.'
      case 'selecting': return 'Selecionando... SmartCut analisando geometria.'
      case 'cutting': return 'Processando corte...'
      case 'exporting': return 'Exportando...'
      case 'error': return 'Erro ao processar.'
      default: return ''
    }
  }
}
