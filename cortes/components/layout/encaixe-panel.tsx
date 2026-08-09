"use client"

/**
 * EncaixePanel — Encaixe circular integrado macho/fêmea paramétrico.
 *
 * Controla o EncaixeGizmo via encaixePreview (diâmetro, altura, folga e
 * inversão). Aplica a geometria definitiva via CSG em ambas as peças do
 * corte (macho por união, fêmea por subtração).
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Box, AlertTriangle, Loader2, X, GripHorizontal } from 'lucide-react'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'
import { analyzeEncaixe, applyEncaixe, type EncaixeMode } from '@/lib/encaixe'
import { analyzeSelection } from '@/lib/smart-autocut'
import { cloneMeshTransform } from '@/lib/parts-manager'
import { useT } from '@/lib/lang-store'
import { useDraggable } from '@/lib/use-draggable'

const HEIGHT_MIN = 0.5
const HEIGHT_MAX = 8
const RADIUS_MIN = 0.8
// Folga radial da fêmea (cavidade maior que o pino): 0,15–0,2 mm é o ideal
// para impressão 3D — folga de montagem sem folga visual.
const TOL_MIN = 0.15
const TOL_MAX = 0.2
const TOL_STEP = 0.01

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
    parts, cutParts, setCutParts,
    setModelMesh, setActivePartId, updatePart, addPart,
    setStatus, pushHistory, clearSelection,
  } = useAppStore()

  const visible = encaixeOpen && !!modelMesh
  const hasSelection = selectedFaceIndices.size > 0 && selectionState === 'selected'

  // Peças opostas do corte: todas as partes + peças cortadas, EXCETO a ativa.
  // Garante que a fêmea/macho sempre tenha uma peça-alvo no mesmo corte.
  const candidates = useMemo(() => {
    const byId = new Map<string, { id: string; name: string; mesh: THREE.Mesh }>()
    for (const p of parts) {
      if (p.mesh && p.mesh !== modelMesh) byId.set(p.id, { id: p.id, name: p.name, mesh: p.mesh })
    }
    for (const cp of cutParts) {
      if (cp.mesh && cp.mesh !== modelMesh && !byId.has(cp.id)) {
        byId.set(cp.id, { id: cp.id, name: cp.name, mesh: cp.mesh })
      }
    }
    return [...byId.values()]
  }, [parts, cutParts, modelMesh])

  // Análise da costura (centro/normal) — usada para escolher o membro do
  // grupo de corte mais próximo da região de contato.
  const seamAnalysis = useMemo(() => {
    if (!visible || !modelMesh || !hasSelection) return null
    try {
      const ana = analyzeSelection(modelMesh.geometry as THREE.BufferGeometry, selectedFaceIndices)
      return ana && ana.hasSeam ? ana : null
    } catch {
      return null
    }
  }, [visible, modelMesh, selectedFaceIndices, hasSelection])

  // Complemento DETERMINÍSTICO: a peça do MESMO corte (mesmo conjunto).
  // A relação vem do pipeline de corte — cada peça cortada guarda `parentId`
  // (a peça que foi dividida). Grupo:
  //   · peça ativa é um corte → pai + irmãos (mesma operação de corte);
  //   · peça ativa é base     → ela + os cortes derivados dela.
  // Dentro do grupo, escolhe o membro mais próximo do centro da costura.
  // Fallback: peça cortada mais recente. Isso garante que NUNCA falta par.
  const compPart = useMemo(() => {
    if (!seamAnalysis) return null
    const active = parts.find((p) => p.mesh === modelMesh)
    if (!active) return null
    const group = active.parentId
      ? parts.filter((p) => p.id === active.parentId || p.parentId === active.parentId)
      : parts.filter((p) => p.id === active.id || p.parentId === active.id)
    const members = group.filter((p) => p.id !== active.id && p.mesh)
    let best: { id: string; name: string; mesh: THREE.Mesh } | null = null
    if (members.length === 1) {
      best = { id: members[0].id, name: members[0].name, mesh: members[0].mesh }
    } else if (members.length > 1) {
      let bestD = Infinity
      for (const m of members) {
        const g = m.mesh.geometry
        if (!g.boundingBox) g.computeBoundingBox()
        const c = new THREE.Vector3()
        g.boundingBox!.getCenter(c)
        const d = c.distanceTo(seamAnalysis.seamCenter)
        if (d < bestD) { bestD = d; best = { id: m.id, name: m.name, mesh: m.mesh } }
      }
    }
    if (!best) {
      const fallback = [...cutParts].reverse().find((cp) => cp.mesh && cp.mesh !== modelMesh)
      if (fallback) best = { id: fallback.id, name: fallback.name, mesh: fallback.mesh }
    }
    return best
  }, [parts, modelMesh, seamAnalysis, cutParts])

  // Limites inteligentes da seleção (costura + complemento). Passa o
  // complemento determinístico para que a altura máxima seja medida contra a
  // peça certa.
  const limits = useMemo(() => {
    if (!visible || !modelMesh || !hasSelection) return null
    try {
      return analyzeEncaixe(
        modelMesh.geometry as THREE.BufferGeometry,
        selectedFaceIndices,
        candidates,
        compPart?.id ?? null,
      )
    } catch {
      return null
    }
  }, [visible, modelMesh, selectedFaceIndices, candidates, compPart, hasSelection])

  // Inicializa (ou reinicializa) o preview quando abre / troca de seleção.
  // Mantém os ajustes do usuário enquanto a seleção não muda.
  const lastKeyRef = useRef('')
  useEffect(() => {
    if (!visible || !limits) {
      setEncaixePreview(null)
      return
    }
    const key = [
      limits.center.x.toFixed(2), limits.center.y.toFixed(2), limits.center.z.toFixed(2),
      compPart ? compPart.id : 'none',
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
      complementIndex: compPart ? candidates.indexOf(compPart) : -1,
      complementName: compPart ? compPart.name : '',
      // Sem complemento (peça sem corte), o padrão é gerar um pino na peça.
      mode: compPart ? 'both' : 'male',
      inverted: false,
    })
  }, [visible, limits, encaixePreview, setEncaixePreview, compPart, candidates])

  const [busy, setBusy] = useState(false)
  const computeRef = useRef(0)

  const handleApply = useCallback(() => {
    const p = encaixePreview
    if (!modelMesh || !p) return

    // ── REGRA RÍGIDA ────────────────────────────────────────────────────────
    // Sempre que houver peça cortada (complemento), o encaixe cria os DOIS
    // conectores ao mesmo tempo e vinculados pelo mesmo diâmetro:
    //   · Macho / Ambos → pino na peça atual + furo na peça cortada.
    //   · Fêmea         → furo na peça atual + pino na peça cortada.
    const hasComp = !!compPart
    const activeMesh = modelMesh
    const normal = new THREE.Vector3(...p.normal).normalize()

    let mode: EncaixeMode
    let direction: THREE.Vector3
    let maleMesh: THREE.Mesh
    let femaleMesh: THREE.Mesh

    if (hasComp && compPart) {
      if (p.mode === 'female') {
        mode = 'both'
        direction = normal.clone().negate()
        maleMesh = compPart.mesh
        femaleMesh = activeMesh
      } else {
        mode = 'both'
        direction = normal.clone()
        maleMesh = activeMesh
        femaleMesh = compPart.mesh
      }
    } else {
      // Peça sem corte: gera apenas o tipo escolhido na peça atual.
      mode = p.mode === 'female' ? 'female' : 'male'
      direction = mode === 'female' ? normal.clone().negate() : normal.clone()
      maleMesh = activeMesh
      femaleMesh = activeMesh
    }

    const myVersion = ++computeRef.current
    setBusy(true)
    setStatus('cutting', t.encaixe_generating)

    setTimeout(() => {
      if (myVersion !== computeRef.current) { setBusy(false); return }
      try {
        pushHistory()

        const result = applyEncaixe({
          center: new THREE.Vector3(...p.center),
          direction,
          radius: p.radius,
          height: p.height,
          tolerance: p.tolerance,
          mode,
          sourceMesh: activeMesh,
          maleMesh,
          femaleMesh,
        })

        if (compPart) {
          if (!result.maleGeo || !result.femaleGeo) throw new Error('encaixe vazio')
          if (result.maleGeo.attributes.position.count === 0 || result.femaleGeo.attributes.position.count === 0) {
            throw new Error('a geometria do encaixe ficou vazia')
          }
          // A peça atual recebe um conector e a peça cortada recebe o outro.
          const maleIsActive = maleMesh === activeMesh
          const newActive = cloneMeshTransform(activeMesh, maleIsActive ? result.maleGeo : result.femaleGeo)
          const newComp = cloneMeshTransform(compPart.mesh, maleIsActive ? result.femaleGeo : result.maleGeo)
          setModelMesh(newActive)
          // setModelMesh sincroniza a peça ativa em parts; setCutParts +
          // updatePart sincronizam a malha da peça cortada em parts.
          setCutParts(cutParts.map((cp) => (cp.id === compPart!.id ? { ...cp, mesh: newComp } : cp)))
          // Rede de segurança: se a peça oposta estiver apenas em cutParts,
          // registra também em parts para que ela seja renderizada.
          if (!parts.some((pt) => pt.id === compPart!.id)) {
            addPart({
              id: compPart!.id,
              name: compPart!.name,
              mesh: newComp,
              visible: true,
              selected: false,
              locked: false,
              parentId: null,
              cutHistory: [],
            })
          } else {
            updatePart(compPart!.id, { mesh: newComp })
          }
          setActivePartId(null) // sai do isolamento e mostra as duas peças
          setStatus(
            'loaded',
            maleIsActive
              ? `${t.encaixe_generated((p.radius * 2).toFixed(1), p.height.toFixed(1))} · ${t.male_label}: ${t.piece_current} + ${t.female_label}: ${compPart.name}`
              : `${t.encaixe_generated((p.radius * 2).toFixed(1), p.height.toFixed(1))} · ${t.female_label}: ${t.piece_current} + ${t.male_label}: ${compPart.name}`,
          )
        } else {
          const geo = mode === 'male' ? result.maleGeo : result.femaleGeo
          if (!geo || geo.attributes.position.count === 0) throw new Error('a geometria do encaixe ficou vazia')
          const newActive = cloneMeshTransform(activeMesh, geo)
          setModelMesh(newActive)
          // Garantia extra: sincroniza a parte ativa também quando activePartId
          // estiver nulo, localizando-a pela referência da malha.
          const activeRef = parts.find((part) => part.mesh === activeMesh)
          if (activeRef) updatePart(activeRef.id, { mesh: newActive })
          setStatus('loaded', t.encaixe_generated((p.radius * 2).toFixed(1), p.height.toFixed(1)))
        }

        clearSelection()
        setEncaixePreview(null)
        setEncaixeOpen(false)
      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        setStatus('error', msg ? `${t.encaixe_error} — ${msg}` : t.encaixe_error)
        console.error('[Encaixe] Erro:', err)
      } finally {
        setBusy(false)
      }
    }, 60)
  }, [
    encaixePreview, modelMesh, parts, cutParts, compPart,
    pushHistory, setModelMesh, setActivePartId, setCutParts, updatePart, addPart,
    setStatus, clearSelection, setEncaixePreview, setEncaixeOpen, t,
  ])

  if (!visible) return null

  const p = encaixePreview
  const hasComp = !!compPart
  const effMode = p?.mode ?? 'male'
  const canApply = !!p && (effMode !== 'both' || hasComp)
  const needsCut = !!p && effMode === 'both' && !hasComp

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

        {/* Tipo: Macho / Fêmea / Ambos */}
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">{t.mode_label}</span>
          <div className="flex gap-0.5 rounded-lg p-0.5" style={{ background: 'oklch(1 0 0 / 4%)', border: '1px solid oklch(1 0 0 / 6%)' }}>
            {(['both', 'male', 'female'] as const).map((m) => {
              const active = effMode === m
              const disabled = !!p && m === 'both' && !hasComp
              return (
                <button
                  key={m}
                  onClick={() => patchEncaixePreview({ mode: m })}
                  disabled={disabled}
                  title={
                    m === 'both' ? t.encaixe_both_hint
                      : m === 'male' ? t.encaixe_male_hint
                        : t.encaixe_female_hint
                  }
                  className="flex-1 rounded-md py-1 text-[9px] font-mono uppercase tracking-wider transition-colors"
                  style={{
                    background: active ? 'oklch(0.55 0.15 260 / 30%)' : 'transparent',
                    color: active ? 'oklch(0.80 0.14 260)' : 'var(--text-secondary)',
                    border: active ? '1px solid oklch(0.55 0.15 260 / 45%)' : '1px solid transparent',
                    opacity: disabled ? 0.35 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  {m === 'both' ? t.mode_both : m === 'male' ? t.male_label : t.female_label}
                </button>
              )
            })}
          </div>
          {/* Onde cada um será criado */}
          <p className="m-0 text-[8px] font-mono text-muted-foreground/60 leading-relaxed">
            {hasComp
              ? effMode === 'female'
                ? `${t.female_label}: ${t.piece_current} · ${t.male_label}: ${compPart?.name || '?'}`
                : `${t.male_label}: ${t.piece_current} · ${t.female_label}: ${compPart?.name || '?'}`
              : effMode === 'female'
                ? `${t.female_label}: ${t.piece_current}`
                : `${t.male_label}: ${t.piece_current}`}
          </p>
          {hasComp && (
            <p className="m-0 text-[8px] font-mono leading-relaxed" style={{ color: 'oklch(0.75 0.14 20 / 80%)' }}>
              {t.encaixe_auto_pair}
            </p>
          )}
        </div>

        {/* Preview resumido do que será gerado */}
        {p && canApply && (
          <div className="flex flex-col gap-0.5 rounded-lg px-2 py-1.5" style={{ background: 'oklch(0.55 0.15 260 / 10%)' }}>
            {hasComp || effMode !== 'female' ? (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2fd6b0' }} />
                  {t.male_label}
                </span>
                <span className="text-[8px] font-mono text-foreground/70">{hasComp && effMode === 'female' ? compPart?.name : t.piece_current}</span>
              </div>
            ) : null}
            {hasComp || effMode !== 'male' ? (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff8a3d' }} />
                  {t.female_label}
                </span>
                <span className="text-[8px] font-mono text-foreground/70">{hasComp ? (effMode === 'female' ? t.piece_current : compPart?.name) : t.piece_current}</span>
              </div>
            ) : null}
            {hasComp && (
              <div className="text-[8px] font-mono text-muted-foreground/50">
                {t.female_label}: ∅{((p.radius + p.tolerance) * 2).toFixed(1)}mm {t.female_bore_plus}
              </div>
            )}
          </div>
        )}

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
