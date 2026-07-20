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
import { computeOpenCut, generateCaps, addCapsToShell } from '@/lib/smartcut-pipeline'
import { analyzeSelection } from '@/lib/smart-autocut'
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
    }
    return () => { if (recalcTimerRef.current) clearTimeout(recalcTimerRef.current) }
  }, [visible, cancelPendingCompute])

  // ─── Etapa 1–3: Calcular Corte (cascas abertas) ─────────────────────────────
  const handleCalculateCut = useCallback(() => {
    if (!modelMesh || !analysis) return
    const myVersion = ++computeVersionRef.current
    setBusy(true)
    setCapsGenerated(false)
    setStatus('cutting', 'Calculando corte — extraindo cascas...')

    setTimeout(() => {
      if (myVersion !== computeVersionRef.current) { setBusy(false); return }
      try {
        const geo = modelMesh.geometry as THREE.BufferGeometry

        // ── Auto-fill micro-fragmentos ──────────────────────────────────────
        // Antes de qualquer cálculo, absorve pequenas partículas não-selecionadas
        // que ficaram de fora do SmartCut e descarta cacos selecionados isolados.
        // Usa apenas limpeza por área — não altera o contorno da seleção principal.
        const { cleaned: effectiveSelection, addedFaces, removedFaces } =
          autoFillMicroFragments(geo, selectedFaceIndices)
        if (addedFaces + removedFaces > 0) {
          setSelectedFaceIndices(effectiveSelection)
          if (addedFaces > 0) {
            setStatus('cutting',
              `Ajustando seleção — ${addedFaces} face(s) absorvida(s)${removedFaces > 0 ? `, ${removedFaces} caco(s) removido(s)` : ''}...`)
          }
        }

        let openResult
        if (contourMode === 'exact') {
          // Modo exato: separa pelo contorno da malha sem reconstrução
          const selGeo = extractSubMesh(geo, effectiveSelection, true, weldQ)
          const bodyGeo = removeSubMesh(geo, effectiveSelection, weldQ)
          openResult = {
            openSelectedGeometry: selGeo,
            openBodyGeometry: bodyGeo,
            seamPoints: new Float32Array(0),
            seamScore: 0, seamSegments: 0, iterations: 0, ok: true,
          }
        } else {
          openResult = computeOpenCut(geo, effectiveSelection, {
            strength: smoothStrength,
            weldQ,
            offset,
            relaxIterations,
          })
        }

        if (myVersion !== computeVersionRef.current) {
          openResult.openSelectedGeometry.dispose()
          openResult.openBodyGeometry.dispose()
          setBusy(false); return
        }

        if (!openResult.ok) {
          setStatus('error', 'Seleção inválida para corte. Ajuste e tente novamente.')
          setBusy(false); return
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
        setBusy(false)
      }
    }, 60)
  }, [
    modelMesh, analysis, contourMode, selectedFaceIndices, weldQ, smoothStrength,
    offset, relaxIterations, setStatus, setOpenCutData, setAutoCutPipelineStage,
    setAutoCutPreviewMode, setCutPreview, disposeOpenCutGeos, disposePreviewGeos,
  ])

  // ─── Etapa 4–6: Gerar Tampas ────────────────────────────────────────────────
  const handleGenerateCaps = useCallback(() => {
    const currentOpenData = useAppStore.getState().openCutData
    if (!currentOpenData) return
    const myVersion = ++computeVersionRef.current
    setBusy(true)
    setStatus('cutting', 'Gerando tampas — triangulação e validação...')

    setTimeout(() => {
      if (myVersion !== computeVersionRef.current) { setBusy(false); return }
      try {
        const capResult = generateCaps(currentOpenData, weldQ)

        if (myVersion !== computeVersionRef.current) {
          capResult.cappedSelectedGeometry.dispose()
          capResult.cappedBodyGeometry.dispose()
          setBusy(false); return
        }

        if (!capResult.ok) {
          setStatus('error', 'Falha ao gerar tampas. Tente aumentar a precisão.')
          setBusy(false); return
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
        setBusy(false)
      }
    }, 60)
  }, [weldQ, smoothStrength, offset, relaxIterations, setStatus, setCutPreview,
    setAutoCutPipelineStage, setAutoCutPreviewMode, disposePreviewGeos])

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
    setBusy(true)
    pushHistory()
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
        addCutPart({
          id: `autocut-${Date.now()}`, name: `Peça ${cutParts.length + 1}`,
          mesh: partMesh, faceIndices: [], color: '#ff6600',
        })

        setAutoCutPreview(null)
        setAutoCutOpen(false)
        clearSelection()
        setStatus('loaded', 'AutoCut V2 concluído')
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
              onClick={() => { setAutoCutOpen(false); setAutoCutPreview(null); setCutPreview(null); setOpenCutData(null); setAutoCutPipelineStage('idle'); setPhase('configure'); setCapsGenerated(false) }}
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
              <button onClick={() => setNoCap((v) => !v)} className="flex items-center justify-between w-full">
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
              {autoCutPipelineStage === 'cut_done' && !noCap && (
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
