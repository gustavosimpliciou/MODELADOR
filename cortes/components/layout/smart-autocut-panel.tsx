"use client"

/**
 * SmartAutoCutPanel V2 — Pipeline Modular de Corte
 *
 * Novo fluxo (SmartCut V2):
 *   Configurar → Calcular Corte (cascas abertas) →
 *   Gerar Tampas → [Gerar Encaixes] → Aplicar Corte Final
 *
 * REGRA ABSOLUTA: A seleção do SmartCut é inviolável.
 * O AutoCut age SOMENTE na superfície de separação.
 */

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import {
  Sparkles, Scissors, X, AlertTriangle, Settings2,
  Waypoints, Brain, Waves, Eye, ChevronRight,
  Sliders, Check, RotateCcw, Zap, Layers, BoxSelect, GripHorizontal,
} from 'lucide-react'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'
import { extractSubMesh, removeSubMesh, autoFillMicroFragments } from '@/lib/smart-cut'
import {
  createCutArtifact, artifactCentroids, rebaseArtifactWithCentroids,
  queryProtectedIntersection,
} from '@/lib/protection'
import { computeOpenCut, generateCaps, addCapsToShell } from '@/lib/smartcut-pipeline'
import { countOpenEdges } from '@/lib/quality-cut'
import {
  sanitizeDeepParams, computeSeatingDirection, buildDeepInterface,
  validateDeepCut, checkDeepVsProtected,
  DEEP_MIN_DEPTH, DEEP_MAX_DEPTH, DEEP_MIN_CLEARANCE, DEEP_MAX_CLEARANCE,
} from '@/lib/deep-cut'
import { analyzeSelection } from '@/lib/smart-autocut'
import { trackEvent } from '@/lib/events'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/lang-store'
import { useDraggable } from '@/lib/use-draggable'

// ─── Constantes ────────────────────────────────────────────────────────────────

interface CutPreset {
  id: string; label: string; icon: string
  strength: number; offset: number; relaxIterations: number; weldQ: number
  description: string
}

const PRESETS: CutPreset[] = [
  { id: 'hair', label: 'Cabelo', icon: '✦', strength: 0.85, offset: 0, relaxIterations: 3, weldQ: 1e4, description: 'Contorno suave para mechas e detalhes finos' },
  { id: 'arm', label: 'Braço', icon: '⬡', strength: 0.65, offset: 0, relaxIterations: 2, weldQ: 1e4, description: 'Separação de membros e partes orgânicas' },
  { id: 'head', label: 'Cabeça', icon: '◉', strength: 0.7, offset: 0, relaxIterations: 2, weldQ: 1e4, description: 'Destacar cabeça, chapéu ou acessório' },
  { id: 'mini', label: 'Mini', icon: '◈', strength: 0.75, offset: 0, relaxIterations: 3, weldQ: 1e5, description: 'Alta precisão para miniaturas e peças pequenas' },
  { id: 'fdm', label: 'FDM', icon: '◆', strength: 1.0, offset: 0, relaxIterations: 4, weldQ: 1e5, description: 'Qualidade máxima para impressão 3D' },
]

const OFFSET_STEPS = [
  { value: -0.3, label: '−3' }, { value: -0.15, label: '−1' },
  { value: 0, label: '0' }, { value: 0.15, label: '+1' }, { value: 0.3, label: '+3' },
]

const RELAX_STEPS = [
  { value: 0, label: 'Sem' }, { value: 1, label: 'Leve' },
  { value: 2, label: 'Méd' }, { value: 3, label: 'Fort' }, { value: 4, label: 'Máx' },
]

const SMOOTH_LEVELS = [
  { id: 'subtle', label: 'Sutil', strength: 0.3 },
  { id: 'balanced', label: 'Equil.', strength: 0.6 },
  { id: 'strong', label: 'Forte', strength: 0.85 },
  { id: 'max', label: 'Máx', strength: 1 },
]

type CutPrecision = 'low' | 'medium' | 'high' | 'ultra'
const PRECISION: { id: CutPrecision; label: string; weldQ: number }[] = [
  { id: 'low', label: 'Baixa', weldQ: 1e3 },
  { id: 'medium', label: 'Média', weldQ: 1e4 },
  { id: 'high', label: 'Alta', weldQ: 1e5 },
  { id: 'ultra', label: 'Ultra', weldQ: 1e6 },
]


type ContourMode = 'ai' | 'exact'
type PanelPhase = 'configure' | 'preview'

// ─── Stepper numérico compacto (Corte Profundo) ────────────────────────────────

function DeepStepper({ label, value, min, max, step, unit, decimals = 1, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit?: string; decimals?: number; onChange: (v: number) => void
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, Math.round(v * 100) / 100))
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center justify-between text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">
        {label}
        <span className="tabular-nums font-medium" style={{ color: 'oklch(0.70 0.22 42)' }}>
          {value.toFixed(decimals)}{unit ?? ''}
        </span>
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(clamp(value - step))}
          className="w-6 h-5 rounded border border-border/70 text-[11px] font-mono leading-none text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          −
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          className="flex-1 cursor-pointer"
          style={{ height: 12, accentColor: 'oklch(0.70 0.22 42)' }}
          aria-label={label}
        />
        <button
          onClick={() => onChange(clamp(value + step))}
          className="w-6 h-5 rounded border border-border/70 text-[11px] font-mono leading-none text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  )
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function SmartAutoCutPanel() {
  const t = useT()
  const { pos, onHandleMouseDown } = useDraggable()
  const {
    activeTool, autoCutOpen, setAutoCutOpen,
    modelMesh, modelInfo, selectedFaceIndices, selectionState,
    setModelMesh, setModelInfo, addCutPart, cutParts, setStatus, pushHistory, clearSelection,
    setAutoCutPreview, unit, cutPreview, setCutPreview, previewViewMode, setPreviewViewMode,
    openCutData, setOpenCutData, autoCutPipelineStage, setAutoCutPipelineStage,
    autoCutPreviewMode, setAutoCutPreviewMode, setSelectedFaceIndices,
    operations, registerArtifact, updateArtifacts, parts,
  } = useAppStore()

  const [phase, setPhase] = useState<PanelPhase>('configure')
  const [contourMode, setContourMode] = useState<ContourMode>('ai')
  const [smoothLevel, setSmoothLevel] = useState('balanced')
  const [offset, setOffset] = useState(0)
  const [relaxIterations, setRelaxIterations] = useState(2)
  const [precision, setPrecision] = useState<CutPrecision>('high')
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [noCap, setNoCap] = useState(false)
  const [busy, setBusy] = useState(false)
  // ── Corte Profundo (extensão opcional; OFF = pipeline normal intacto) ─────
  const [deepEnabled, setDeepEnabled] = useState(false)
  const [deepDepth, setDeepDepth] = useState(1.5)
  const [deepClearance, setDeepClearance] = useState(0.1)
  const [deepMeasured, setDeepMeasured] = useState<{ cavity: number; plug: number } | null>(null)
  const [capsGenerated, setCapsGenerated] = useState(false)
  const recalcTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const computeVersionRef = useRef(0)

  const smoothStrength = SMOOTH_LEVELS.find((l) => l.id === smoothLevel)?.strength ?? 0.6
  const weldQ = PRECISION.find((p) => p.id === precision)!.weldQ

  const hasSelection = selectedFaceIndices.size > 0 && selectionState === 'selected'
  const visible = activeTool === 'select' && autoCutOpen && hasSelection && !!modelMesh

  const analysis = useMemo(() => {
    if (!visible || !modelMesh) return null
    try { return analyzeSelection(modelMesh.geometry as THREE.BufferGeometry, selectedFaceIndices) }
    catch { return null }
  }, [visible, modelMesh, selectedFaceIndices])

  const disposePreviewGeos = useCallback((preview: typeof cutPreview) => {
    if (!preview) return
    try { preview.selectedGeometry.dispose() } catch {}
    try { preview.bodyGeometry.dispose() } catch {}
  }, [])

  const disposeOpenCutGeos = useCallback((data: typeof openCutData) => {
    if (!data) return
    try { data.openSelectedGeometry.dispose() } catch {}
    try { data.openBodyGeometry.dispose() } catch {}
  }, [])

  const cancelPendingCompute = useCallback(() => {
    if (recalcTimerRef.current) { clearTimeout(recalcTimerRef.current); recalcTimerRef.current = null }
    computeVersionRef.current++
  }, [])

  useEffect(() => {
    if (!visible) {
      cancelPendingCompute()
      setPhase('configure')
      setCapsGenerated(false)
      setDeepMeasured(null)
    }
    return () => { if (recalcTimerRef.current) clearTimeout(recalcTimerRef.current) }
  }, [visible, cancelPendingCompute])

  // ─── Etapa 1–3: Calcular Corte (cascas abertas) ─────────────────────────────
  const handleCalculateCut = useCallback(async () => {
    if (!modelMesh || !analysis) return
    const myVersion = ++computeVersionRef.current
    setBusy(true)
    setCapsGenerated(false)
    setDeepMeasured(null)
    setStatus('cutting', 'Calculando corte — extraindo cascas...')

    try {
      const geo = modelMesh.geometry as THREE.BufferGeometry

      // ── Seleção como FONTE ABSOLUTA DA VERDADE ───────────────────────────
      // Em modo EXATO, a seleção original do usuário NÃO pode ser alterada.
      // Nenhuma absorção, suavização ou simplificação é permitida.
      let effectiveSelection: Set<number>
      if (contourMode === 'exact') {
        effectiveSelection = new Set(selectedFaceIndices)
      } else {
        // Modo AI: limpeza leve por área apenas para micro-fragmentos
        const { cleaned, addedFaces, removedFaces } = autoFillMicroFragments(geo, selectedFaceIndices)
        effectiveSelection = cleaned
        if (addedFaces + removedFaces > 0) {
          setSelectedFaceIndices(effectiveSelection)
          if (addedFaces > 0) {
            setStatus('cutting',
              `Ajustando seleção — ${addedFaces} face(s) absorvida(s)${removedFaces > 0 ? `, ${removedFaces} caco(s) removido(s)` : ''}...`)
          }
        }
      }

      let openResult
      if (contourMode === 'exact') {
        // Modo exato: respeita EXATAMENTE a borda da seleção original
        // Sem diffuseField, sem march, sem relax — apenas separação por faces + tampa como constrained loop
        // Usa weldQ máximo (1e6) para preservar precisão sub-milimétrica
        const exactWeldQ = Math.max(weldQ, 1e6)
        const selGeo = extractSubMesh(geo, effectiveSelection, true, exactWeldQ)
        const bodyGeo = removeSubMesh(geo, effectiveSelection, exactWeldQ)
        openResult = {
          openSelectedGeometry: selGeo,
          openBodyGeometry: bodyGeo,
          seamPoints: new Float32Array(0),
          seamScore: 0, seamSegments: 0, iterations: 0, ok: true,
        }
      } else {
        // Pipeline AI: reconstrução com campo difuso e isocontorno suavizado
        openResult = await computeOpenCut(
          geo,
          effectiveSelection,
          { strength: smoothStrength, weldQ, offset, relaxIterations },
          (stage, _pct) => {
            if (myVersion === computeVersionRef.current) setStatus('cutting', stage)
          },
        )
      }

      if (myVersion !== computeVersionRef.current) {
        openResult.openSelectedGeometry.dispose()
        openResult.openBodyGeometry.dispose()
        return
      }

      if (!openResult.ok) {
        setStatus('error', 'Seleção inválida para corte. Ajuste e tente novamente.')
        return
      }

      disposeOpenCutGeos(useAppStore.getState().openCutData)
      disposePreviewGeos(useAppStore.getState().cutPreview)
      setCutPreview(null)

      setOpenCutData(openResult)
      setAutoCutPipelineStage('cut_done')
      setAutoCutPreviewMode('shell')
      setPhase('preview')

      const scoreLabel = openResult.seamScore < 8 ? 'Excelente' : openResult.seamScore < 15 ? 'Boa' : 'Razoável'
      setStatus('loaded', `Cascas calculadas — qualidade ${scoreLabel} · ${openResult.seamSegments} segmentos`)
    } catch (err) {
      setStatus('error', 'Erro ao calcular corte.')
      console.error('[SmartCut V2] Cut error:', err)
    } finally {
      if (myVersion === computeVersionRef.current) setBusy(false)
    }
  }, [
    modelMesh, analysis, contourMode, selectedFaceIndices, weldQ, smoothStrength,
    offset, relaxIterations, setStatus, setOpenCutData, setAutoCutPipelineStage,
    setAutoCutPreviewMode, setCutPreview, disposeOpenCutGeos, disposePreviewGeos,
  ])

  // ─── Etapa 4–6: Gerar Tampas ────────────────────────────────────────────────
  const handleGenerateCaps = useCallback(async () => {
    const currentOpenData = useAppStore.getState().openCutData
    if (!currentOpenData) return
    // Corte Profundo tem tampas próprias (cavidade + plug já fechados na
    // interface) — Gerar Tampas aqui seria redundante e errado.
    if (deepEnabled) {
      setStatus('error', 'Com Corte Profundo, use CALCULAR INTERFACE em vez de Gerar Tampas.')
      return
    }
    const myVersion = ++computeVersionRef.current
    setBusy(true)
    setStatus('cutting', 'Gerando tampas — triangulação e validação...')

    try {
      // Pipeline assíncrono — não bloqueia a UI
      const capResult = await generateCaps(
        currentOpenData,
        weldQ,
        (stage, _pct) => {
          if (myVersion === computeVersionRef.current) setStatus('cutting', stage)
        },
      )

      if (myVersion !== computeVersionRef.current) {
        capResult.cappedSelectedGeometry.dispose()
        capResult.cappedBodyGeometry.dispose()
        return
      }

      if (!capResult.ok) {
        const side = capResult.failedSide === 'body'
          ? 'do corpo'
          : capResult.failedSide === 'selected'
            ? 'da peça selecionada'
            : 'das peças'
        setStatus('error', `A tampa ${side} não fechou. Ajuste a seleção ou aumente a precisão.`)
        return
      }

      disposePreviewGeos(useAppStore.getState().cutPreview)
      setCutPreview({
        selectedGeometry: capResult.cappedSelectedGeometry,
        bodyGeometry: capResult.cappedBodyGeometry,
        seamPoints: currentOpenData.seamPoints,
        seamScore: currentOpenData.seamScore,
        seamSegments: currentOpenData.seamSegments,
        iterations: currentOpenData.iterations,
        validationIssues: capResult.validationIssues,
        params: { strength: smoothStrength, weldQ, offset, relaxIterations },
      })
      setAutoCutPipelineStage('caps_done')
      setAutoCutPreviewMode('caps')
      setCapsGenerated(true)

      const issues = capResult.validationIssues.length
      setStatus('loaded', `Tampas geradas${issues > 0 ? ` · ${issues} aviso(s)` : ' — malha fechada ✓'}`)
    } catch (err) {
      setStatus('error', 'Erro ao gerar tampas.')
      console.error('[SmartCut V2] Caps error:', err)
    } finally {
      if (myVersion === computeVersionRef.current) setBusy(false)
    }
  }, [weldQ, smoothStrength, offset, relaxIterations, setStatus, setCutPreview,
    setAutoCutPipelineStage, setAutoCutPreviewMode, disposePreviewGeos])

  // ─── Corte Profundo: CALCULAR INTERFACE PROFUNDA ───────────────────────────
  // Etapa nova e modular, executada SOMENTE com deepEnabled. Entrada: cascas
  // abertas do corte normal. Saída: peças fechadas (cavidade + plug) que
  // seguem pelo fluxo existente (preview → tampas-ok → aplicar → validar).
  const handleDeepInterface = useCallback(async () => {
    const st = useAppStore.getState()
    const data = st.openCutData
    if (!modelMesh || !analysis || !data) return
    const myVersion = ++computeVersionRef.current
    setBusy(true)
    setDeepMeasured(null)
    setStatus('cutting', 'Calculando interface profunda — alojamento + encaixe...')
    try {
      const geo = modelMesh.geometry as THREE.BufferGeometry
      const { depth, clearance } = sanitizeDeepParams({ depth: deepDepth, clearance: deepClearance })
      const seatingDir = computeSeatingDirection({
        geometry: geo,
        selectedFaces: new Set(st.selectedFaceIndices),
        seamCenter: analysis.seamCenter,
        fitNormal: analysis.fitNormal,
        planeU: analysis.planeU,
        planeV: analysis.planeV,
        seamHalfMin: Math.min(analysis.halfU, analysis.halfV),
      })
      const deep = buildDeepInterface(
        data.openSelectedGeometry,
        data.openBodyGeometry,
        geo,
        { seatingDir, depth, clearance, weldQ },
      )
      if (myVersion !== computeVersionRef.current) {
        try { deep.deepSelected.dispose() } catch {}
        try { deep.deepBody.dispose() } catch {}
        return
      }
      // Proteção de cortes existentes: a coluna da cavidade é READ-ONLY
      // sobre geometria protegida (§21).
      const conflicts = checkDeepVsProtected(
        geo, deep.definition.loopsBody, deep.definition.seatingDir,
        deep.definition.depth, st.operations,
      )
      if (conflicts.length > 0) {
        try { deep.deepSelected.dispose() } catch {}
        try { deep.deepBody.dispose() } catch {}
        setStatus('error', `A cavidade atravessaria o corte protegido ${conflicts.map((n) => `"${n}"`).join(', ')}.`)
        return
      }
      const validation = validateDeepCut(deep.deepSelected, deep.deepBody, deep.definition)
      const issues: ValidationIssue[] = validation.issues.map((i) => ({
        type: i.type === 'open_boundary' ? 'open_boundary' : 'warning',
        message: i.message,
      }))
      for (const w of deep.warnings) issues.push({ type: 'warning', message: w })

      disposePreviewGeos(useAppStore.getState().cutPreview)
      setCutPreview({
        selectedGeometry: deep.deepSelected,
        bodyGeometry: deep.deepBody,
        seamPoints: data.seamPoints,
        seamScore: data.seamScore,
        seamSegments: data.seamSegments,
        iterations: data.iterations,
        validationIssues: issues,
        params: { strength: smoothStrength, weldQ, offset, relaxIterations },
      })
      setAutoCutPipelineStage('caps_done')
      setAutoCutPreviewMode('caps')
      setCapsGenerated(true)
      setDeepMeasured({ cavity: deep.measuredCavity, plug: deep.measuredPlug })
      setStatus(
        'loaded',
        `Interface profunda — cavidade ${deep.measuredCavity.toFixed(2)}mm · plug ${deep.measuredPlug.toFixed(2)}mm · folga ${clearance.toFixed(2)}mm` +
        (issues.length > 0 ? ` · ${issues.length} aviso(s)` : ''),
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'desconhecido'
      setStatus('error', `Interface profunda: ${msg}`)
      console.error('[DeepCut] interface error:', err)
    } finally {
      if (myVersion === computeVersionRef.current) setBusy(false)
    }
  }, [
    modelMesh, analysis, weldQ, smoothStrength, offset, relaxIterations,
    deepDepth, deepClearance, setStatus, setCutPreview,
    setAutoCutPipelineStage, setAutoCutPreviewMode, disposePreviewGeos,
  ])

  // ─── Recalcular quando parâmetros mudam no preview ─────────────────────────
  const scheduleRecalc = useCallback(() => {
    if (phase !== 'preview') return
    if (recalcTimerRef.current) clearTimeout(recalcTimerRef.current)
    recalcTimerRef.current = setTimeout(() => {
      recalcTimerRef.current = null
      handleCalculateCut()
    }, 350)
  }, [phase, handleCalculateCut])

  useEffect(() => {
    if (phase === 'preview') scheduleRecalc()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smoothLevel, offset, relaxIterations, precision])

  if (!visible) return null

  // ─── Aplicar preset ─────────────────────────────────────────────────────────
  const applyPreset = (preset: CutPreset) => {
    setActivePreset(preset.id)
    setSmoothLevel(
      preset.strength <= 0.3 ? 'subtle' : preset.strength <= 0.65 ? 'balanced' :
      preset.strength <= 0.85 ? 'strong' : 'max',
    )
    setOffset(preset.offset)
    setRelaxIterations(preset.relaxIterations)
    const p = PRECISION.find((pr) => pr.weldQ === preset.weldQ) ?? PRECISION[2]
    setPrecision(p.id)
  }

  // ─── Aplicar corte definitivamente ─────────────────────────────────────────
  const handleApplyCut = () => {
    // Modo Sem Tampa: usa cascas abertas diretamente (sem caps)
    const currentOpenData = useAppStore.getState().openCutData
    if (noCap) {
      if (!modelMesh || !currentOpenData || !analysis) return
    } else {
      if (!modelMesh || !cutPreview || !analysis) return
    }
    // ── Protection Manager: a nova seleção não pode engolir faces de um
    // corte/encaixe já protegido na MESMA malha (ownership direto = BLOCK).
    // Exceção §29 (edição direta explícita): se a MAIORIA da seleção já é
    // protegida, o usuário está claramente editando aquela região → permite.
    // Proximidade (safe zone) nunca bloqueia — só é registrada no log.
    const st0 = useAppStore.getState()
    const selFaces0 = new Set(st0.selectedFaceIndices)
    if (selFaces0.size > 0) {
      const geo0 = modelMesh!.geometry as THREE.BufferGeometry
      const owned = new Set<number>()
      for (const a of st0.operations) {
        if ((a.state === 'PROTECTED' || a.state === 'COMMITTED') && a.meshUuid === geo0.uuid) {
          for (const f of a.faces) owned.add(f)
        }
      }
      let ownedCount = 0
      for (const f of selFaces0) if (owned.has(f)) ownedCount++
      const hits = queryProtectedIntersection(geo0, selFaces0, st0.operations)
      const direct = hits.filter((h) => h.directFaces > 0)
      if (direct.length > 0 && ownedCount / selFaces0.size <= 0.5) {
        const names = direct.map((h) => `"${h.artifact.label}"`).join(', ')
        setStatus('error', `A seleção toca o corte protegido ${names} — selecione a peça dele para editar diretamente.`)
        return
      }
    }
    setBusy(true)
    setStatus('cutting', 'Aplicando corte final...')

    setTimeout(() => {
      try {
        // Escolhe a fonte da geometria:
        // - noCap: peça selecionada = aberta (sem cap); corpo = fechado (cap gerado agora)
        // - normal: ambas as peças com tampas (geradas previamente)
        let selectedPiece: THREE.BufferGeometry
        let bodyPiece: THREE.BufferGeometry
        if (noCap) {
          // Peça extraída: sem tampa (casca aberta)
          selectedPiece = currentOpenData!.openSelectedGeometry.clone()
          // Corpo: tampa gerada agora para selar o buraco no modelo principal
          bodyPiece = addCapsToShell(currentOpenData!.openBodyGeometry.clone(), weldQ)
        } else {
          selectedPiece = cutPreview!.selectedGeometry.clone()
          bodyPiece = cutPreview!.bodyGeometry.clone()
        }
        // ── GATE FINAL: peça cortada SEMPRE fechada ─────────────────────
        // Nenhuma peça vai para a cena com buraco. Exceção única: modo Sem
        // Tampa, onde a peça selecionada é aberta por escolha explícita.
        {
          const openBody = countOpenEdges(bodyPiece, weldQ)
          if (openBody > 0) {
            try { selectedPiece.dispose() } catch {}
            try { bodyPiece.dispose() } catch {}
            setStatus('error', `O corpo ficou com buraco (${openBody} arestas abertas). Ajuste a seleção ou aumente a precisão.`)
            return
          }
          if (!noCap) {
            const openSel = countOpenEdges(selectedPiece, weldQ)
            if (openSel > 0) {
              try { selectedPiece.dispose() } catch {}
              try { bodyPiece.dispose() } catch {}
              setStatus('error', `A peça selecionada ficou com buraco (${openSel} arestas abertas). Ajuste a seleção ou aumente a precisão.`)
              return
            }
          }
        }
        pushHistory()
        const cleanBody = bodyPiece.clone()
        const cleanSel = selectedPiece.clone()

        const seamNormal = analysis.fitNormal.clone().normalize()
        const sideDot = analysis.selectionCenter.clone().sub(analysis.seamCenter).dot(seamNormal)

        for (const g of [bodyPiece, selectedPiece]) {
          g.computeVertexNormals()
          g.computeBoundingBox()
          g.computeBoundingSphere()
        }

        const mainMat = (modelMesh.material as THREE.MeshStandardMaterial).clone()
        mainMat.side = THREE.DoubleSide
        mainMat.vertexColors = false
        mainMat.color = new THREE.Color(0x9a9a9d)
        mainMat.needsUpdate = true
        const mainMesh = new THREE.Mesh(bodyPiece, mainMat)
        mainMesh.castShadow = true
        mainMesh.receiveShadow = true
        mainMesh.position.copy(modelMesh.position)
        mainMesh.rotation.copy(modelMesh.rotation)
        mainMesh.scale.copy(modelMesh.scale)
        mainMesh.userData.cleanGeometry = cleanBody
        setModelMesh(mainMesh)

        if (modelInfo) {
          const bb = bodyPiece.boundingBox
          const s = new THREE.Vector3()
          bb?.getSize(s)
          const vCount = bodyPiece.getAttribute('position')?.count ?? 0
          setModelInfo({
            ...modelInfo, vertices: vCount, faces: Math.floor(vCount / 3),
            width: bb ? parseFloat(s.x.toFixed(2)) : modelInfo.width,
            height: bb ? parseFloat(s.y.toFixed(2)) : modelInfo.height,
            depth: bb ? parseFloat(s.z.toFixed(2)) : modelInfo.depth,
          })
        }

        const geo = modelMesh.geometry as THREE.BufferGeometry
        const box = new THREE.Box3().setFromBufferAttribute(geo.getAttribute('position') as THREE.BufferAttribute)
        const size = new THREE.Vector3(); box.getSize(size)
        const spread = (Math.max(size.x, size.y, size.z) || 1) * 0.28
        const dir = seamNormal.clone().multiplyScalar(sideDot >= 0 ? spread : -spread)

        const partMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#ff6600'), roughness: 0.55, metalness: 0.12, side: THREE.DoubleSide,
        })
        const partMesh = new THREE.Mesh(selectedPiece, partMat)
        partMesh.castShadow = true; partMesh.receiveShadow = true
        partMesh.position.copy(modelMesh.position)
        partMesh.rotation.copy(modelMesh.rotation)
        partMesh.scale.copy(modelMesh.scale)
        partMesh.userData.cleanGeometry = cleanSel
        partMesh.position.add(dir)
        const newPieceId = `autocut-${Date.now()}`
        const newPieceName = `Peça ${cutParts.length + 1}`
        addCutPart({
          id: newPieceId, name: newPieceName,
          mesh: partMesh, faceIndices: [], color: '#ff6600',
        })

        // ── Protection Manager: COMMIT → PROTECTED ──────────────────────
        // 1. Rebase: proteções da malha consumida sobrevivem no corpo novo
        //    (remapeamento por centroides — índices antigos morrem no rebuild).
        // 2. Registra o corte (ownership das faces selecionadas na malha velha
        //    + vínculo com as peças criadas). A partir daqui, o Olho A é
        //    intocável por operações indiretas.
        try {
          const st1 = useAppStore.getState()
          const oldBodyGeo = geo as THREE.BufferGeometry
          const activePartIdNow = st1.parts.find((p) => p.mesh === modelMesh)?.id ?? null
          const bb0 = oldBodyGeo.boundingBox
          const sz0 = new THREE.Vector3()
          bb0?.getSize(sz0)
          const maxDim0 = Math.max(sz0.x, sz0.y, sz0.z) || 1
          updateArtifacts((prev) => prev.map((a) =>
            a.meshUuid === oldBodyGeo.uuid
              ? rebaseArtifactWithCentroids(
                  bodyPiece, a, artifactCentroids(oldBodyGeo, a),
                )
              : a,
          ))
          registerArtifact(createCutArtifact({
            geometry: oldBodyGeo,
            selectedFaces: selFaces0,
            partId: activePartIdNow,
            newPartIds: [activePartIdNow ?? '', newPieceId],
            label: `Corte ${newPieceName}`,
            modelMaxDim: maxDim0,
          }))
        } catch (e) { console.warn('[AutoCut] registro de proteção falhou (não bloqueante):', e) }

        setAutoCutPreview(null)
        setAutoCutOpen(false)
        clearSelection()
        setStatus('loaded', 'AutoCut V2 concluído')
        trackEvent('cut_created', {
          tool: 'smart_autocut',
          mode: noCap ? 'no_cap' : 'cap',
          parts: cutParts.length + 1,
        })
      } catch (err) {
        setStatus('error', 'Falha ao aplicar o AutoCut.')
        console.error('[AutoCut V2] Apply error:', err)
      } finally { setBusy(false) }
    }, 60)
  }

  const handleResetToConfig = () => {
    setCutPreview(null)
    setOpenCutData(null)
    setAutoCutPipelineStage('idle')
    setAutoCutPreviewMode('shell')
    setCapsGenerated(false)
    setDeepMeasured(null)
    setPhase('configure')
    setStatus('loaded', 'Reconfigurar parâmetros e recalcular.')
  }

  // ─── Qualidade do corte ─────────────────────────────────────────────────────
  const seamScore = cutPreview?.seamScore ?? openCutData?.seamScore ?? null
  const qualityLabel = seamScore !== null
    ? seamScore < 8 ? t.quality_excellent : seamScore < 15 ? t.quality_good : seamScore < 25 ? t.quality_fair : t.quality_low
    : null
  const qualityColor = seamScore !== null
    ? seamScore < 8 ? '#4ade80' : seamScore < 15 ? '#facc15' : seamScore < 25 ? '#fb923c' : '#f87171'
    : '#ffffff'

  // ─── Preview mode disponíveis de acordo com o estágio ──────────────────────
  const previewModes = [
    { id: 'plane' as const, label: t.vis_plane },
    { id: 'shell' as const, label: t.vis_shell, disabled: autoCutPipelineStage === 'idle' },
    { id: 'caps' as const, label: t.vis_caps, disabled: !capsGenerated },
    { id: 'final' as const, label: t.vis_final, disabled: !capsGenerated },
  ]

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      data-draggable
      className={pos ? '' : 'absolute bottom-28 left-1/2 -translate-x-1/2 z-20 animate-fade-in pointer-events-auto'}
      style={pos ? { position: 'fixed', left: pos.x, top: pos.y, zIndex: 20 } : {}}
    >
      <div
        className="flex flex-col gap-2 p-3 rounded-2xl border w-[268px]"
        style={{
          background: 'oklch(0.09 0 0 / 97%)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          borderColor: phase === 'preview' ? 'oklch(0.42 0.10 250 / 80%)' : 'oklch(0.18 0 0)',
          boxShadow: '0 8px 40px oklch(0 0 0 / 55%), inset 0 1px 0 oklch(1 0 0 / 4%)',
        }}
      >
        {/* ─── Cabeçalho ──────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
          onMouseDown={onHandleMouseDown}
          title="Arraste para mover"
        >
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <GripHorizontal className="w-3 h-3 text-muted-foreground/30" />
            <Sparkles className="w-3 h-3" style={{ color: 'oklch(0.70 0.22 42)' }} />
            {phase === 'preview' ? t.autocut_header : t.autocut_on_selection}
          </span>
          <div className="flex items-center gap-2">
            {phase === 'preview' && (
              <span
                className="text-[8px] font-mono px-1 py-0.5 rounded"
                style={
                  noCap
                    ? { background: 'oklch(0.70 0.22 42 / 20%)', color: 'oklch(0.80 0.20 42)' }
                    : { background: 'oklch(0.55 0.15 250 / 20%)', color: 'oklch(0.75 0.15 250)' }
                }
              >
                {noCap ? t.badge_no_cap : autoCutPipelineStage === 'caps_done' ? t.badge_caps_ok : t.badge_shells}
              </span>
            )}
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => { setAutoCutOpen(false); setAutoCutPreview(null); setCutPreview(null); setOpenCutData(null); setAutoCutPipelineStage('idle'); setPhase('configure'); setCapsGenerated(false); setDeepMeasured(null) }}
              className="text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ─── FASE 1: Configurar ─────────────────────────────────────────── */}
        {phase === 'configure' && (
          <>
            {/* Modo de corte */}
            <div className="grid grid-cols-2 gap-1">
              {([['ai', Brain, t.contour_ai, t.contour_ai_sub] as const, ['exact', Waypoints, t.contour_exact, t.contour_exact_sub] as const]).map(([mode, Icon, title, sub]) => (
                <button
                  key={mode}
                  onClick={() => setContourMode(mode)}
                  className={cn('flex flex-col items-start gap-0.5 rounded-lg border px-2 py-1.5 text-left transition-all', contourMode === mode ? 'border-transparent' : 'border-border text-muted-foreground hover:text-foreground')}
                  style={contourMode === mode ? { background: 'oklch(0.70 0.22 42 / 16%)', borderColor: 'oklch(0.70 0.22 42 / 60%)' } : undefined}
                >
                  <span className="flex items-center gap-1 text-[10px] font-mono font-medium">
                    <Icon className="w-3 h-3" style={contourMode === mode ? { color: 'oklch(0.70 0.22 42)' } : undefined} />
                    {title}
                  </span>
                  <span className="text-[8px] font-mono text-muted-foreground/70">{sub}</span>
                </button>
              ))}
            </div>

            {/* Presets (só para modo AI) */}
            {contourMode === 'ai' && (
              <div className="flex flex-col gap-1 rounded-lg border border-border/60 p-1.5">
                <span className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">
                  <Zap className="w-2.5 h-2.5" />{t.presets_label}
                </span>
                <div className="grid grid-cols-5 gap-0.5">
                  {PRESETS.map((p) => {
                    const presetLabel = p.id === 'hair' ? t.preset_hair : p.id === 'arm' ? t.preset_arm : p.id === 'head' ? t.preset_head : p.id === 'mini' ? t.preset_mini : t.preset_fdm
                    const presetDesc = p.id === 'hair' ? t.preset_hair_desc : p.id === 'arm' ? t.preset_arm_desc : p.id === 'head' ? t.preset_head_desc : p.id === 'mini' ? t.preset_mini_desc : t.preset_fdm_desc
                    return (
                      <button key={p.id} onClick={() => applyPreset(p)} title={presetDesc}
                        className={cn('flex flex-col items-center gap-0.5 rounded py-1 text-[9px] font-mono transition-all', activePreset === p.id ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground')}
                        style={activePreset === p.id ? { background: 'oklch(0.70 0.22 42)' } : undefined}
                      >
                        <span className="text-sm leading-none">{p.icon}</span>
                        <span className="text-[8px]">{presetLabel}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Suavização (só para modo AI) */}
            {contourMode === 'ai' && (
              <div className="flex flex-col gap-1 rounded-lg border border-border/60 p-1.5">
                <span className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">
                  <Waves className="w-2.5 h-2.5" />{t.smooth_label}
                </span>
                <div className="flex gap-0.5">
                  {SMOOTH_LEVELS.map((l) => {
                    const smoothLabel = l.id === 'subtle' ? t.smooth_subtle : l.id === 'balanced' ? t.smooth_balanced : l.id === 'strong' ? t.smooth_strong : t.smooth_max
                    return (
                      <button key={l.id} onClick={() => { setSmoothLevel(l.id); setActivePreset(null) }}
                        className={cn('flex-1 rounded py-1 text-[9px] font-mono transition-all', smoothLevel === l.id ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground')}
                        style={smoothLevel === l.id ? { background: 'oklch(0.70 0.22 42)' } : undefined}
                      >{smoothLabel}</button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tampa / Sem Tampa */}
            <div className="rounded-lg border border-border/60 p-1.5">
              <button
                onClick={() => {
                  const next = !noCap
                  setNoCap(next)
                  if (next) setDeepEnabled(false) // Sem Tampa × Corte Profundo: excludentes
                }}
                className="flex items-center justify-between w-full"
              >
                <span className="flex flex-col items-start gap-0.5">
                  <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                    <BoxSelect className="w-2.5 h-2.5" />{t.no_cap_label}
                  </span>
                  <span className="text-[8px] font-mono text-muted-foreground/50">
                    {noCap ? t.no_cap_open_desc : t.no_cap_closed_desc}
                  </span>
                </span>
                <span
                  className={cn('relative w-7 h-3.5 rounded-full transition-colors shrink-0', noCap ? '' : 'bg-secondary')}
                  style={noCap ? { background: 'oklch(0.70 0.22 42)' } : undefined}
                >
                  <span className={cn('absolute top-0.5 w-2.5 h-2.5 rounded-full bg-background transition-all', noCap ? 'left-3.5' : 'left-0.5')} />
                </span>
              </button>
            </div>

            {/* Corte Profundo (alojamento + encaixe de precisão) */}
            <div className="rounded-lg border border-border/60 p-1.5">
              <button
                onClick={() => {
                  const next = !deepEnabled
                  setDeepEnabled(next)
                  if (next) setNoCap(false) // precisa de tampas (cavidade + plug)
                  setDeepMeasured(null)
                }}
                className="flex items-center justify-between w-full"
              >
                <span className="flex flex-col items-start gap-0.5">
                  <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                    <Layers className="w-2.5 h-2.5" />{t.deep_cut_label}
                  </span>
                  <span className="text-[8px] font-mono text-muted-foreground/50">
                    {deepEnabled ? t.deep_cut_on_desc : t.deep_cut_off_desc}
                  </span>
                </span>
                <span
                  className={cn('relative w-7 h-3.5 rounded-full transition-colors shrink-0', deepEnabled ? '' : 'bg-secondary')}
                  style={deepEnabled ? { background: 'oklch(0.70 0.22 42)' } : undefined}
                >
                  <span className={cn('absolute top-0.5 w-2.5 h-2.5 rounded-full bg-background transition-all', deepEnabled ? 'left-3.5' : 'left-0.5')} />
                </span>
              </button>
              {deepEnabled && (
                <div className="flex flex-col gap-1.5 pt-1.5 animate-fade-in">
                  <DeepStepper
                    label={t.deep_depth_label}
                    value={deepDepth}
                    min={DEEP_MIN_DEPTH}
                    max={DEEP_MAX_DEPTH}
                    step={0.1}
                    unit="mm"
                    decimals={1}
                    onChange={(v) => { setDeepDepth(v); setDeepMeasured(null) }}
                  />
                  <DeepStepper
                    label={t.deep_clearance_label}
                    value={deepClearance}
                    min={DEEP_MIN_CLEARANCE}
                    max={DEEP_MAX_CLEARANCE}
                    step={0.05}
                    unit="mm"
                    decimals={2}
                    onChange={(v) => { setDeepClearance(v); setDeepMeasured(null) }}
                  />
                </div>
              )}
            </div>
            {/* Avançado */}
            <div className="flex flex-col gap-1.5 rounded-lg border border-border/60 p-1.5">
              <button onClick={() => setAdvancedOpen((v) => !v)} className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                <Settings2 className="w-2.5 h-2.5" />{t.advanced_label}
                <ChevronRight className={cn('w-2.5 h-2.5 ml-auto transition-transform', advancedOpen && 'rotate-90')} />
              </button>
              {advancedOpen && (
                <div className="flex flex-col gap-2 pt-0.5 animate-fade-in">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">{t.precision_label}</span>
                    <div className="flex gap-0.5">
                      {PRECISION.map((p) => {
                        const precLabel = p.id === 'low' ? t.prec_low : p.id === 'medium' ? t.prec_med : p.id === 'high' ? t.prec_high : t.prec_ultra
                        return (
                          <button key={p.id} onClick={() => setPrecision(p.id)}
                            className={cn('flex-1 rounded py-0.5 text-[9px] font-mono transition-all', precision === p.id ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground')}
                            style={precision === p.id ? { background: 'oklch(0.55 0.02 250)' } : undefined}
                          >{precLabel}</button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">{t.edge_relax_label}</span>
                    <div className="flex gap-0.5">
                      {RELAX_STEPS.map((r, i) => {
                        const relaxLabel = i === 0 ? t.relax_none : i === 1 ? t.relax_light : i === 2 ? t.relax_med : i === 3 ? t.relax_strong : t.relax_max
                        return (
                          <button key={r.value} onClick={() => setRelaxIterations(r.value)}
                            className={cn('flex-1 rounded py-0.5 text-[9px] font-mono transition-all', relaxIterations === r.value ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground')}
                            style={relaxIterations === r.value ? { background: 'oklch(0.55 0.02 250)' } : undefined}
                          >{relaxLabel}</button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">{t.offset_label}</span>
                    <div className="flex gap-0.5">
                      {OFFSET_STEPS.map((o) => (
                        <button key={o.value} onClick={() => setOffset(o.value)}
                          className={cn('flex-1 rounded py-0.5 text-[9px] font-mono transition-all', offset === o.value ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground')}
                          style={offset === o.value ? { background: 'oklch(0.55 0.02 250)' } : undefined}
                        >{o.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Diagnóstico */}
            {analysis && (
              <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground/50">
                <span>{t.boundary_label}: <span className="text-foreground/70">{analysis.hasSeam ? t.boundary_seam(analysis.seamEdges) : t.boundary_island}</span></span>
              </div>
            )}

            {/* Botão: Calcular Corte */}
            <button
              onClick={handleCalculateCut}
              disabled={busy || !analysis}
              className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50"
              style={{ background: 'oklch(0.70 0.22 42)' }}
            >
              <Scissors className="w-3.5 h-3.5" />
              {busy ? t.calculating : t.calc_cut}
            </button>
          </>
        )}

        {/* ─── FASE 2: Preview do pipeline ────────────────────────────────── */}
        {phase === 'preview' && (
          <>
            {/* Seletor de visualização */}
            <div className="flex flex-col gap-1 rounded-lg border border-border/60 p-1.5">
              <span className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">
                <Eye className="w-2.5 h-2.5" />{t.visualization_label}
              </span>
              <div className="flex gap-0.5">
                {previewModes.map(({ id, label, disabled }) => (
                  <button key={id} onClick={() => !disabled && setAutoCutPreviewMode(id)} disabled={disabled}
                    className={cn('flex-1 rounded py-1 text-[9px] font-mono transition-all', autoCutPreviewMode === id ? 'text-background' : 'border border-border text-muted-foreground', disabled ? 'opacity-30 cursor-not-allowed' : 'hover:text-foreground')}
                    style={autoCutPreviewMode === id ? { background: 'oklch(0.55 0.02 250)' } : undefined}
                  >{label}</button>
                ))}
              </div>
            </div>

            {/* Qualidade */}
            {qualityLabel && (
              <div className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{ background: 'oklch(0.55 0.15 250 / 10%)' }}>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-mono uppercase text-muted-foreground/60">{t.quality_label}</span>
                  <span className="text-xs font-mono font-medium" style={{ color: qualityColor }}>{qualityLabel}</span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[8px] font-mono text-muted-foreground/50">
                    {(openCutData?.seamSegments ?? cutPreview?.seamSegments ?? 0)} {t.seg_suffix}
                  </span>
                  <span className="text-[8px] font-mono" style={{ color: qualityColor }}>
                    {(seamScore ?? 0).toFixed(1)}°
                  </span>
                </div>
              </div>
            )}

            {/* Alertas de validação */}
            {cutPreview?.validationIssues && cutPreview.validationIssues.length > 0 && (
              <div className="flex flex-col gap-0.5">
                {cutPreview.validationIssues.slice(0, 2).map((issue, i) => (
                  <div key={i} className="flex items-start gap-1 rounded bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-1">
                    <AlertTriangle className="w-2.5 h-2.5 mt-0.5 shrink-0" style={{ color: '#facc15' }} />
                    <span className="text-[8px] font-mono text-yellow-200/80 leading-relaxed">{issue.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Visualização 3D modo */}
            <div className="flex flex-col gap-1 rounded-lg border border-border/60 p-1.5">
              <span className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">
                <Layers className="w-2.5 h-2.5" />{t.rendering_label}
              </span>
              <div className="flex gap-0.5">
                {([['solid', t.render_solid], ['wireframe', t.render_wire], ['xray', t.render_xray]] as const).map(([mode, label]) => (
                  <button key={mode} onClick={() => setPreviewViewMode(mode)}
                    className={cn('flex-1 rounded py-0.5 text-[9px] font-mono transition-all', previewViewMode === mode ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground')}
                    style={previewViewMode === mode ? { background: 'oklch(0.35 0.02 250)' } : undefined}
                  >{label}</button>
                ))}
              </div>
            </div>

            {busy && (
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground/60">
                <span className="animate-spin w-2.5 h-2.5 border border-t-foreground/60 rounded-full" />
                {t.processing}
              </div>
            )}

            {/* Botões de estágio */}
            <div className="flex flex-col gap-1.5 pt-0.5">

              {/* ── Modo SEM TAMPA: cascas calculadas → aplicar direto ── */}
              {autoCutPipelineStage === 'cut_done' && noCap && (
                <>
                  {/* Badge informativo */}
                  <div className="flex items-center gap-1 rounded-lg px-2 py-1.5"
                    style={{ background: 'oklch(0.70 0.22 42 / 12%)', border: '1px solid oklch(0.70 0.22 42 / 30%)' }}>
                    <BoxSelect className="w-3 h-3 shrink-0" style={{ color: 'oklch(0.70 0.22 42)' }} />
                    <span className="text-[9px] font-mono" style={{ color: 'oklch(0.80 0.15 42)' }}>
                      {t.no_cap_open_msg}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={handleResetToConfig}
                      disabled={busy}
                      className="flex items-center justify-center gap-1 flex-1 px-2 py-1.5 rounded-lg text-xs font-mono font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all disabled:opacity-40"
                    >
                      <RotateCcw className="w-3 h-3" />{t.reconfig}
                    </button>
                    <button
                      onClick={handleApplyCut}
                      disabled={busy}
                      className="flex items-center justify-center gap-1.5 flex-[2] px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50"
                      style={{ background: 'oklch(0.70 0.22 42)' }}
                    >
                      <Check className="w-3 h-3" />
                      <Scissors className="w-3 h-3" />
                      {busy ? t.applying : t.apply_no_cap}
                    </button>
                  </div>
                </>
              )}

              {/* ── Modo COM TAMPA: etapa normal ── */}
              {autoCutPipelineStage === 'cut_done' && !noCap && !deepEnabled && (
                <button
                  onClick={handleGenerateCaps}
                  disabled={busy}
                  className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50"
                  style={{ background: 'oklch(0.70 0.22 42)' }}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {busy ? t.generating : t.gen_caps}
                </button>
              )}

              {/* ── Corte Profundo: calcular interface (cavidade + plug) ── */}
              {autoCutPipelineStage === 'cut_done' && !noCap && deepEnabled && (
                <>
                  <button
                    onClick={handleDeepInterface}
                    disabled={busy}
                    className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50"
                    style={{ background: 'oklch(0.70 0.22 42)' }}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {busy ? t.processing : t.deep_calc_interface}
                  </button>
                  {deepMeasured && (
                    <div className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{ background: 'oklch(0.70 0.22 42 / 10%)' }}>
                      <span className="text-[8px] font-mono uppercase text-muted-foreground/60">{t.deep_measured_label}</span>
                      <span className="text-[10px] font-mono tabular-nums" style={{ color: 'oklch(0.80 0.20 42)' }}>
                        {t.deep_measured_values(deepMeasured.cavity.toFixed(2), deepMeasured.plug.toFixed(2))}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Botões finais: após tampas (modo com tampa) */}
              {autoCutPipelineStage === 'caps_done' && (
                <div className="flex gap-1.5">
                  <button
                    onClick={handleResetToConfig}
                    disabled={busy}
                    className="flex items-center justify-center gap-1 flex-1 px-2 py-1.5 rounded-lg text-xs font-mono font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all disabled:opacity-40"
                  >
                    <RotateCcw className="w-3 h-3" />{t.reconfig}
                  </button>
                  <button
                    onClick={handleApplyCut}
                    disabled={busy}
                    className="flex items-center justify-center gap-1.5 flex-[2] px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50"
                    style={{ background: 'oklch(0.70 0.22 42)' }}
                  >
                    <Check className="w-3 h-3" />
                    <Scissors className="w-3 h-3" />
                    {busy ? t.applying : t.apply_cut}
                  </button>
                </div>
              )}

              {/* Reconfig disponível no modo com tampa após cascas calculadas */}
              {autoCutPipelineStage === 'cut_done' && !noCap && (
                <button
                  onClick={handleResetToConfig}
                  disabled={busy}
                  className="flex items-center justify-center gap-1 w-full px-2 py-1 rounded-lg text-[10px] font-mono font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all disabled:opacity-40"
                >
                  <RotateCcw className="w-2.5 h-2.5" />{t.reconfigure}
                </button>
              )}
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-2 text-[8px] font-mono text-muted-foreground/40">
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-sm bg-gray-400" />{t.legend_body}</span>
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-sm" style={{ background: autoCutPreviewMode === 'shell' ? '#f97316' : '#ef4444' }} />{t.legend_part}</span>
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-sm bg-white" />{t.legend_seam}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
