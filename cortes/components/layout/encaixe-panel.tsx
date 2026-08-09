"use client"

/**
 * EncaixePanel — Encaixe circular integrado macho/fêmea paramétrico.
 *
 * Controla o EncaixeGizmo via encaixePreview (diâmetro, altura, folga e
 * inversão). Aplica a geometria definitiva via CSG em ambas as peças do
 * corte (macho por união, fêmea por subtração).
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Box, AlertTriangle, Loader2, X, GripHorizontal, ArrowLeftRight } from 'lucide-react'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'
import { analyzeEncaixe, applyEncaixe } from '@/lib/encaixe'
import { cloneMeshTransform } from '@/lib/parts-manager'
import { useT } from '@/lib/lang-store'
import { useDraggable } from '@/lib/use-draggable'

const HEIGHT_MIN = 3
const HEIGHT_MAX = 8
const RADIUS_MIN = 0.8
const TOL_MIN = 0.1
const TOL_MAX = 0.5
const TOL_STEP = 0.05

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const round = (v: number, d = 1) => Number(v.toFixed(d))

interface StepperProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  accent?: string
  decimals?: number
  onChange: (v: number) => void
}

function StepperField({ label, value, min, max, step, unit, accent, decimals = 1, onChange }: StepperProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/60 p-1.5">
      <span className="flex items-center justify-between text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">
        {label}
        <span className="normal-case tracking-normal text-muted-foreground/35">max {max.toFixed(decimals)}{unit ?? ''}</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(round(clamp(value - step, min, max), decimals))}
          className="w-6 h-5 rounded border border-border/70 text-[11px] font-mono leading-none text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          −
        </button>
        <span
          className="flex-1 text-center text-[11px] font-mono font-medium tabular-nums"
          style={{ color: accent ?? 'oklch(0.75 0.12 260)' }}
        >
          {value.toFixed(decimals)}{unit ?? ''}
        </span>
        <button
          onClick={() => onChange(round(clamp(value + step, min, max), decimals))}
          className="w-6 h-5 rounded border border-border/70 text-[11px] font-mono leading-none text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          +
        </button>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(round(clamp(Number(e.target.value), min, max), decimals))}
        className="w-full cursor-pointer"
        style={{ height: 12, accentColor: accent ?? 'oklch(0.55 0.15 260)' }}
        aria-label={label}
      />
    </div>
  )
}

export function EncaixePanel() {
  const t = useT()
  const { pos, onHandleMouseDown } = useDraggable()

  const {
    encaixeOpen, setEncaixeOpen,
    encaixePreview, setEncaixePreview, patchEncaixePreview,
    modelMesh, selectedFaceIndices, selectionState,
    cutParts, setCutParts,
    setModelMesh, setStatus, pushHistory, clearSelection,
  } = useAppStore()

  const visible = encaixeOpen && !!modelMesh
  const hasSelection = selectedFaceIndices.size > 0 && selectionState === 'selected'

  // Limites inteligentes da seleção (costura + complemento).
  const limits = useMemo(() => {
    if (!visible || !modelMesh || !hasSelection) return null
    try {
      return analyzeEncaixe(modelMesh.geometry as THREE.BufferGeometry, selectedFaceIndices, cutParts)
    } catch {
      return null
    }
  }, [visible, modelMesh, selectedFaceIndices, cutParts, hasSelection])

  // Inicializa (ou reinicializa) o preview quando abre / troca de seleção.
  // Mantém os ajustes do usuário enquanto a seleção não muda.
  const lastKeyRef = useRef('')
  useEffect(() => {
    if (!visible || !limits || limits.complementIndex < 0) {
      setEncaixePreview(null)
      return
    }
    const key = [
      limits.center.x.toFixed(2), limits.center.y.toFixed(2), limits.center.z.toFixed(2),
      limits.complementIndex,
    ].join('|')
    if (key === lastKeyRef.current && encaixePreview) return
    lastKeyRef.current = key
    const radius = round(clamp(limits.maxRadius * 0.5, RADIUS_MIN, limits.maxRadius), 1)
    const height = round(clamp(5, HEIGHT_MIN, limits.maxHeight), 1)
    setEncaixePreview({
      seamCenter: [limits.center.x, limits.center.y, limits.center.z],
      center: [limits.center.x, limits.center.y, limits.center.z],
      normal: [limits.normal.x, limits.normal.y, limits.normal.z],
      planeU: [limits.planeU.x, limits.planeU.y, limits.planeU.z],
      planeV: [limits.planeV.x, limits.planeV.y, limits.planeV.z],
      radius,
      height,
      tolerance: 0.2,
      maxRadius: limits.maxRadius,
      maxHeight: limits.maxHeight,
      complementIndex: limits.complementIndex,
      complementName: limits.complementName,
      inverted: false,
    })
  }, [visible, limits, encaixePreview, setEncaixePreview])

  const [busy, setBusy] = useState(false)
  const computeRef = useRef(0)

  const handleApply = useCallback(() => {
    const p = encaixePreview
    if (!modelMesh || !p || p.complementIndex < 0) return
    const compPart = cutParts[p.complementIndex]
    if (!compPart) return

    const myVersion = ++computeRef.current
    setBusy(true)
    setStatus('cutting', t.encaixe_generating)

    setTimeout(() => {
      if (myVersion !== computeRef.current) { setBusy(false); return }
      try {
        pushHistory()

        const direction = new THREE.Vector3(...p.normal)
          .normalize()
          .multiplyScalar(p.inverted ? -1 : 1)

        // Macho = união na peça ativa; Fêmea = cavidade no complemento.
        const maleMesh = p.inverted ? compPart.mesh : modelMesh
        const femaleMesh = p.inverted ? modelMesh : compPart.mesh

        const { maleGeo, femaleGeo } = applyEncaixe({
          center: new THREE.Vector3(...p.center),
          direction,
          radius: p.radius,
          height: p.height,
          tolerance: p.tolerance,
          maleMesh,
          femaleMesh,
        })

        const newMaleMesh = cloneMeshTransform(maleMesh, maleGeo)
        const newFemaleMesh = cloneMeshTransform(femaleMesh, femaleGeo)

        // Atualiza a parte ativa (modelMesh) e sincroniza o complemento.
        const activeMesh = p.inverted ? newFemaleMesh : newMaleMesh
        const compMesh = p.inverted ? newMaleMesh : newFemaleMesh
        setModelMesh(activeMesh)
        setCutParts(cutParts.map((cp) => (cp.id === compPart.id ? { ...cp, mesh: compMesh } : cp)))

        clearSelection()
        setEncaixePreview(null)
        setEncaixeOpen(false)
        setStatus('loaded', t.encaixe_generated((p.radius * 2).toFixed(1), p.height.toFixed(1)))
      } catch (err) {
        setStatus('error', t.encaixe_error)
        console.error('[Encaixe] Erro:', err)
      } finally {
        setBusy(false)
      }
    }, 60)
  }, [
    encaixePreview, modelMesh, cutParts,
    pushHistory, setModelMesh, setCutParts,
    setStatus, clearSelection, setEncaixePreview, setEncaixeOpen, t,
  ])

  if (!visible) return null

  const p = encaixePreview
  const canApply = !!p && p.complementIndex >= 0
  const needsCut = hasSelection && !!limits && limits.complementIndex < 0

  return (
    <div
      data-draggable
      className={pos ? '' : 'absolute bottom-28 left-1/2 -translate-x-1/2 z-20 animate-fade-in pointer-events-auto'}
      style={pos ? { position: 'fixed', left: pos.x, top: pos.y, zIndex: 20 } : {}}
    >
      <div
        className="flex flex-col gap-2 p-3 rounded-2xl border w-[248px]"
        style={{
          background: 'oklch(0.09 0 0 / 97%)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          borderColor: 'oklch(0.38 0.08 260 / 70%)',
          boxShadow: '0 8px 40px oklch(0 0 0 / 55%), inset 0 1px 0 oklch(1 0 0 / 4%)',
        }}
      >
        {/* Drag handle + header */}
        <div
          className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={onHandleMouseDown}
          title={t.drag_to_move}
        >
          <GripHorizontal className="w-3 h-3 shrink-0 text-muted-foreground/30" />
          <Box className="w-3 h-3 shrink-0" style={{ color: 'oklch(0.65 0.18 260)' }} />
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex-1">
            {t.encaixe_circular_title}
          </span>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setEncaixeOpen(false)}
            className="p-0.5 rounded text-muted-foreground/50 hover:text-foreground hover:bg-secondary/50 transition-colors"
            title={t.close}
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Macho / Fêmea */}
        {p && canApply ? (
          <div className="flex flex-col gap-0.5 rounded-lg px-2 py-1.5" style={{ background: 'oklch(0.55 0.15 260 / 10%)' }}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2fd6b0' }} />
                {t.male_label}
              </span>
              <span className="text-[8px] font-mono text-foreground/70">{p.inverted ? p.complementName : t.piece_current}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff8a3d' }} />
                {t.female_label}
              </span>
              <span className="text-[8px] font-mono text-foreground/70">{p.inverted ? t.piece_current : p.complementName}</span>
            </div>
          </div>
        ) : null}

        {/* Parâmetros */}
        {p && canApply ? (
          <div className="flex flex-col gap-1.5">
            <StepperField
              label={t.diameter_label}
              value={p.radius * 2}
              min={Math.min(RADIUS_MIN * 2, p.maxRadius * 2)}
              max={p.maxRadius * 2}
              step={0.5}
              unit="mm"
              onChange={(d) => patchEncaixePreview({ radius: round(clamp(d / 2, RADIUS_MIN, p.maxRadius), 1) })}
            />
            <StepperField
              label={t.height_label}
              value={p.height}
              min={HEIGHT_MIN}
              max={Math.min(HEIGHT_MAX, p.maxHeight)}
              step={0.5}
              unit="mm"
              accent="oklch(0.85 0.05 80)"
              onChange={(h) => patchEncaixePreview({ height: round(clamp(h, HEIGHT_MIN, Math.min(HEIGHT_MAX, p.maxHeight)), 1) })}
            />
            <StepperField
              label={t.tolerance_label}
              value={p.tolerance}
              min={TOL_MIN}
              max={TOL_MAX}
              step={TOL_STEP}
              unit="mm"
              decimals={2}
              accent="oklch(0.75 0.14 20)"
              onChange={(tol) => patchEncaixePreview({ tolerance: round(clamp(tol, TOL_MIN, TOL_MAX), 2) })}
            />
          </div>
        ) : null}

        {/* Inverter */}
        {p && canApply ? (
          <button
            onClick={() => patchEncaixePreview({ inverted: !p.inverted })}
            title={t.invert_hint}
            className="flex items-center justify-center gap-1.5 w-full px-2 py-1.5 rounded-lg border border-border/60 text-[9px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
          >
            <ArrowLeftRight className="w-3 h-3" />
            {t.invert_label}
          </button>
        ) : null}

        {/* Avisos */}
        {!hasSelection ? (
          <div className="flex items-start gap-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-1">
            <AlertTriangle className="w-2.5 h-2.5 mt-0.5 shrink-0 text-yellow-400" />
            <span className="text-[8px] font-mono text-yellow-200/70 leading-relaxed">{t.select_faces_hint}</span>
          </div>
        ) : needsCut ? (
          <div className="flex items-start gap-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-1">
            <AlertTriangle className="w-2.5 h-2.5 mt-0.5 shrink-0 text-yellow-400" />
            <span className="text-[8px] font-mono text-yellow-200/70 leading-relaxed">{t.needs_cut_hint}</span>
          </div>
        ) : hasSelection && !limits ? (
          <div className="flex items-start gap-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-1">
            <AlertTriangle className="w-2.5 h-2.5 mt-0.5 shrink-0 text-yellow-400" />
            <span className="text-[8px] font-mono text-yellow-200/70 leading-relaxed">{t.analysis_error}</span>
          </div>
        ) : null}

        {/* Aplicar */}
        <button
          onClick={handleApply}
          disabled={busy || !canApply}
          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50"
          style={{ background: 'oklch(0.55 0.15 260)' }}
        >
          {busy
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{t.generating_enc}</>
            : <><Box className="w-3.5 h-3.5" />{t.apply_encaixe}</>}
        </button>
      </div>
    </div>
  )
}
