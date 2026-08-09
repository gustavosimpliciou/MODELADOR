"use client"

/**
 * ACAB Panel — popup no mesmo estilo do PlaneCutPanel
 * Abre quando activeTool === 'acab'
 * Posição: centro inferior do viewport (igual ao painel de Corte)
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Sparkles,
  GripHorizontal,
  Minus,
  ChevronUp,
  Eye,
  Check,
  X,
} from 'lucide-react'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  ACAB_PRESETS,
  ACAB_LIMITS,
  settingsFromPreset,
  clampAcabSettings,
  runAcabamento,
  identifyCutRegion,
  type AcabSettings,
  type AcabPresetId,
} from '@/lib/acabamento'

const ACCENT = 'oklch(0.70 0.22 42)'
const ACCENT_GLOW = 'oklch(0.70 0.22 42 / 40%)'

export function AcabPanel() {
  const activeTool = useAppStore((s) => s.activeTool)
  const setActiveTool = useAppStore((s) => s.setActiveTool)
  const parts = useAppStore((s) => s.parts)
  const activePartId = useAppStore((s) => s.activePartId)
  const setActivePartId = useAppStore((s) => s.setActivePartId)
  const updatePart = useAppStore((s) => s.updatePart)
  const pushHistory = useAppStore((s) => s.pushHistory)
  const setStatus = useAppStore((s) => s.setStatus)

  const open = String(activeTool) === 'acab'

  const [minimized, setMinimized] = useState(false)
  const [settings, setSettings] = useState<AcabSettings>(() => settingsFromPreset('premium'))
  const [showOriginal, setShowOriginal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [previewGeo, setPreviewGeo] = useState<THREE.BufferGeometry | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [statusLine, setStatusLine] = useState('Ajuste os parâmetros e veja o preview')
  const [fixedPos, setFixedPos] = useState<{ left: number; top: number } | null>(null)
  const [cloneTick, setCloneTick] = useState(0)

  const originalGeoRef = useRef<THREE.BufferGeometry | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const headerDrag = useRef<{
    startX: number
    startY: number
    origLeft: number
    origTop: number
  } | null>(null)

  const selectedPart = useMemo(
    () => parts.find((p) => p.id === activePartId) ?? null,
    [parts, activePartId],
  )
  const availableParts = useMemo(() => parts.filter((p) => !p.locked), [parts])

  // ── Drag do painel (igual PlaneCut) ────────────────────────────────────────
  const onHeaderPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!panelRef.current) return
    const rect = panelRef.current.getBoundingClientRect()
    headerDrag.current = {
      startX: e.clientX,
      startY: e.clientY,
      origLeft: rect.left,
      origTop: rect.top,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onHeaderPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!headerDrag.current || e.buttons !== 1) return
    const dx = e.clientX - headerDrag.current.startX
    const dy = e.clientY - headerDrag.current.startY
    setFixedPos({
      left: headerDrag.current.origLeft + dx,
      top: headerDrag.current.origTop + dy,
    })
  }, [])

  const onHeaderPointerUp = useCallback(() => {
    headerDrag.current = null
  }, [])

  // ── Cleanup ao sair ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      setPreviewGeo((g) => {
        g?.dispose()
        return null
      })
      setErrorMsg(null)
      setShowOriginal(false)
      setMinimized(false)
      setFixedPos(null)
      originalGeoRef.current = null
      parts.forEach((p) => {
        if (!p.visible) {
          try {
            updatePart(p.id, { visible: true })
          } catch {
            /* */
          }
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const isolatePart = useCallback(
    (partId: string) => {
      const part = parts.find((p) => p.id === partId)
      if (!part?.mesh?.geometry) return

      // PERFORMANCE: não dispara N updates no Zustand.
      // Só altera mesh.visible localmente — o renderer já respeita part.visible
      // e isolation via activePartId.
      parts.forEach((p) => {
        try {
          p.mesh.visible = p.id === partId
        } catch {
          /* */
        }
      })

      // Cancela preview anterior imediatamente (evita freeze empilhado)
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      setPreviewGeo((g) => {
        g?.dispose()
        return null
      })
      setProcessing(false)

      const geo = part.mesh.geometry as THREE.BufferGeometry
      // Clone em idle para não travar o clique
      originalGeoRef.current = null
      const doClone = () => {
        try {
          originalGeoRef.current = geo.clone()
        } catch {
          originalGeoRef.current = geo
        }
        setCloneTick((t) => t + 1)
      }
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(doClone, { timeout: 120 })
      } else {
        setTimeout(doClone, 0)
      }

      setErrorMsg(null)
      setShowOriginal(false)
      setStatusLine('Peça carregada · ajuste os parâmetros para o preview')

      // Identificação leve em idle (não bloqueia o clique)
      const tagged = (part as { cutFaceIndices?: number[] }).cutFaceIndices
      const idWork = () => {
        try {
          const region = identifyCutRegion(geo, { taggedFaceIndices: tagged })
          if (region.method === 'fallback-none') {
            setStatusLine('Região não detectada · preview usará borda/curvatura')
          } else {
            setStatusLine(`Região: ${region.method} · ${region.cutFaceIndices.length || 0} faces`)
          }
        } catch {
          setStatusLine('Peça pronta · ajuste os parâmetros')
        }
      }
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(idWork, { timeout: 200 })
      } else {
        setTimeout(idWork, 0)
      }
    },
    [parts, updatePart],
  )

  useEffect(() => {
    if (!open) return
    if (activePartId) {
      isolatePart(activePartId)
    } else if (availableParts.length >= 1) {
      setActivePartId(availableParts[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activePartId])

  // ── Preview ────────────────────────────────────────────────────────────────
  const runPreview = useCallback(() => {
    if (!originalGeoRef.current) return
    setProcessing(true)
    setErrorMsg(null)

    const geo = originalGeoRef.current
    const s = clampAcabSettings(settings)
    const tagged = selectedPart
      ? (selectedPart as { cutFaceIndices?: number[] }).cutFaceIndices
      : undefined

    const run = () => {
      try {
        const result = runAcabamento(geo, s, { taggedFaceIndices: tagged })
        if (!result.valid) {
          setErrorMsg(
            result.issues[0] ||
              'Não foi possível aplicar com segurança. Reduza suavização ou raio.',
          )
          setPreviewGeo((g) => {
            g?.dispose()
            return null
          })
        } else {
          setPreviewGeo((g) => {
            g?.dispose()
            return result.geometry
          })
          setStatusLine(
            `Preview pronto · Δ volume ${result.volumeDeltaPct >= 0 ? '+' : ''}${result.volumeDeltaPct.toFixed(2)}%`,
          )
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Erro no processamento')
        setPreviewGeo((g) => {
          g?.dispose()
          return null
        })
      } finally {
        setProcessing(false)
      }
    }

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(run, { timeout: 300 })
    } else {
      setTimeout(run, 0)
    }
  }, [settings, selectedPart])

  useEffect(() => {
    if (!open || !originalGeoRef.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(runPreview, 280)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [settings, open, runPreview, cloneTick])

  useEffect(() => {
    if (!selectedPart?.mesh || !originalGeoRef.current) return
    const mesh = selectedPart.mesh
    mesh.geometry =
      showOriginal || !previewGeo ? originalGeoRef.current : previewGeo
    if (mesh.geometry.attributes?.position) {
      mesh.geometry.attributes.position.needsUpdate = true
    }
  }, [previewGeo, showOriginal, selectedPart])

  const handlePreset = (id: AcabPresetId) => setSettings(settingsFromPreset(id))

  const handleApply = () => {
    if (!selectedPart || !previewGeo || !originalGeoRef.current || errorMsg) return
    try {
      pushHistory()
    } catch {
      /* */
    }

    const finalGeo = previewGeo.clone()
    const mesh = selectedPart.mesh
    const oldGeo = mesh.geometry as THREE.BufferGeometry
    mesh.geometry = finalGeo
    oldGeo.dispose()

    try {
      updatePart(selectedPart.id, {
        mesh,
        cutHistory: [...(selectedPart.cutHistory || []), 'ACAB'],
      })
    } catch {
      /* */
    }

    originalGeoRef.current?.dispose()
    originalGeoRef.current = finalGeo.clone()
    setPreviewGeo((g) => {
      g?.dispose()
      return null
    })
    try {
      setStatus('idle', 'Acabamento aplicado')
    } catch {
      /* */
    }
    setStatusLine('✓ Acabamento aplicado')
  }

  const handleClose = () => {
    if (selectedPart && originalGeoRef.current) {
      selectedPart.mesh.geometry = originalGeoRef.current
    }
    parts.forEach((p) => {
      try {
        updatePart(p.id, { visible: true })
      } catch {
        /* */
      }
    })
    setActiveTool('select' as never)
  }

  // ── Não renderiza se ferramenta errada ─────────────────────────────────────
  if (!open) return null

  const outerStyle: React.CSSProperties = fixedPos
    ? { position: 'fixed', left: fixedPos.left, top: fixedPos.top }
    : {
        position: 'absolute',
        bottom: '2.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
      }

  return (
    <div
      ref={panelRef}
      className="z-30 animate-fade-in pointer-events-auto"
      style={outerStyle}
    >
      <div
        className="flex flex-col rounded-2xl border overflow-hidden"
        style={{
          background: 'oklch(0.09 0 0 / 97%)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          borderColor: 'oklch(0.18 0 0)',
          boxShadow:
            '0 8px 40px oklch(0 0 0 / 55%), inset 0 1px 0 oklch(1 0 0 / 4%)',
          minWidth: '300px',
          maxWidth: '320px',
        }}
      >
        {/* Header arrastável */}
        <div
          className="flex items-center justify-between px-3 py-2 select-none cursor-grab active:cursor-grabbing"
          style={{ background: 'oklch(0.11 0 0 / 80%)' }}
          onPointerDown={onHeaderPointerDown}
          onPointerMove={onHeaderPointerMove}
          onPointerUp={onHeaderPointerUp}
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-3 h-3" style={{ color: 'oklch(0.30 0 0)' }} />
            <div
              className="w-1 h-3.5 rounded-full"
              style={{ background: ACCENT, boxShadow: `0 0 6px ${ACCENT_GLOW}` }}
            />
            <Sparkles className="w-3 h-3" style={{ color: ACCENT }} />
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
              Acabamento
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="text-[7px] font-mono px-1.5 py-0.5 rounded-md"
              style={{ background: 'oklch(0.14 0 0)', color: 'oklch(0.40 0 0)' }}
            >
              localizado
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setMinimized((m) => !m)
              }}
              className="w-5 h-5 flex items-center justify-center rounded-md hover:opacity-80"
              style={{ background: 'oklch(0.16 0 0)', color: 'oklch(0.50 0 0)' }}
            >
              {minimized ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleClose()
              }}
              className="w-5 h-5 flex items-center justify-center rounded-md hover:opacity-80"
              style={{ background: 'oklch(0.16 0 0)', color: 'oklch(0.50 0 0)' }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {!minimized && (
          <div className="flex flex-col gap-2.5 p-2.5">
            {/* Peça */}
            <div>
              <span
                className="text-[8px] font-mono uppercase tracking-widest block mb-1"
                style={{ color: 'oklch(0.40 0 0)' }}
              >
                Peça
              </span>
              {availableParts.length === 0 ? (
                <p className="text-[10px] font-mono" style={{ color: 'oklch(0.45 0 0)' }}>
                  Faça um CORTE antes de usar o ACAB.
                </p>
              ) : (
                <select
                  value={activePartId ?? ''}
                  onChange={(e) => {
                    if (selectedPart && originalGeoRef.current) {
                      selectedPart.mesh.geometry = originalGeoRef.current
                    }
                    setActivePartId(e.target.value)
                  }}
                  className="w-full rounded-xl border px-2.5 py-1.5 text-[10px] font-mono outline-none"
                  style={{
                    background: 'oklch(0.12 0 0)',
                    borderColor: 'oklch(0.20 0 0)',
                    color: 'oklch(0.85 0 0)',
                  }}
                >
                  <option value="" disabled>
                    Selecione…
                  </option>
                  {availableParts.map((p, i) => (
                    <option key={p.id} value={p.id}>
                      {p.name || `Peça ${String(i + 1).padStart(2, '0')}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-1">
              {ACAB_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePreset(p.id)}
                  className={cn(
                    'rounded-xl py-1.5 text-[8px] font-mono uppercase tracking-wider transition-all',
                    settings.preset === p.id
                      ? 'text-background font-semibold'
                      : 'border text-muted-foreground/50 hover:text-muted-foreground',
                  )}
                  style={
                    settings.preset === p.id
                      ? {
                          background: ACCENT,
                          borderColor: 'transparent',
                          boxShadow: `0 0 10px ${ACCENT_GLOW}`,
                        }
                      : { borderColor: 'oklch(0.18 0 0)' }
                  }
                  title={p.description}
                >
                  {p.label === 'PERSONALIZADO' ? 'CUSTOM' : p.label}
                </button>
              ))}
            </div>

            {/* Suavização */}
            <SliderBlock
              label="Suavização"
              display={`${Math.round(settings.intensity * 100)}%`}
              value={Math.round(settings.intensity * 100)}
              min={0}
              max={Math.round(ACAB_LIMITS.intensityMax * 100)}
              onChange={(v) =>
                setSettings((s) => ({ ...s, intensity: v / 100, preset: 'custom' }))
              }
            />

            {/* Raio */}
            <SliderBlock
              label="Raio do contorno"
              display={`${settings.radiusMm.toFixed(2)} mm`}
              value={settings.radiusMm}
              min={ACAB_LIMITS.radiusMmMin}
              max={ACAB_LIMITS.radiusMmMax}
              step={0.05}
              onChange={(v) =>
                setSettings((s) => ({ ...s, radiusMm: v, preset: 'custom' }))
              }
            />

            {/* Iterações */}
            <SliderBlock
              label="Iterações"
              display={String(settings.iterations)}
              value={settings.iterations}
              min={ACAB_LIMITS.iterationsMin}
              max={ACAB_LIMITS.iterationsMax}
              step={1}
              onChange={(v) =>
                setSettings((s) => ({ ...s, iterations: v, preset: 'custom' }))
              }
            />

            {/* Toggles */}
            <div className="flex gap-3 px-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.preserveDetails}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      preserveDetails: e.target.checked,
                      preset: 'custom',
                    }))
                  }
                  style={{ accentColor: ACCENT }}
                />
                <span className="text-[9px] font-mono" style={{ color: 'oklch(0.55 0 0)' }}>
                  Detalhes
                </span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.preserveVolume}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      preserveVolume: e.target.checked,
                      preset: 'custom',
                    }))
                  }
                  style={{ accentColor: ACCENT }}
                />
                <span className="text-[9px] font-mono" style={{ color: 'oklch(0.55 0 0)' }}>
                  Volume
                </span>
              </label>
            </div>

            {/* Status */}
            <div
              className="rounded-xl px-2.5 py-1.5 text-[9px] font-mono"
              style={{
                background: errorMsg ? 'oklch(0.18 0.05 25)' : 'oklch(0.12 0 0)',
                color: errorMsg ? 'oklch(0.75 0.12 25)' : 'oklch(0.50 0 0)',
              }}
            >
              {processing ? 'Processando…' : errorMsg || statusLine}
            </div>

            {/* Ações */}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setShowOriginal((v) => !v)}
                disabled={!previewGeo}
                className={cn(
                  'flex items-center justify-center gap-1 rounded-xl py-2 px-2 text-[9px] font-mono uppercase tracking-wider border transition-all',
                  !previewGeo && 'opacity-40',
                )}
                style={{ borderColor: 'oklch(0.20 0 0)', color: 'oklch(0.60 0 0)' }}
              >
                <Eye className="w-3 h-3" />
                {showOriginal ? 'ACAB' : 'Orig'}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-xl py-2 text-[9px] font-mono uppercase tracking-wider border transition-all"
                style={{ borderColor: 'oklch(0.20 0 0)', color: 'oklch(0.55 0 0)' }}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleApply}
                disabled={!previewGeo || !!errorMsg || processing || !selectedPart}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 rounded-xl py-2 text-[9px] font-mono uppercase tracking-wider font-semibold transition-all',
                  (!previewGeo || errorMsg || processing || !selectedPart) &&
                    'opacity-40 cursor-not-allowed',
                )}
                style={{ background: ACCENT, color: 'oklch(0.12 0 0)' }}
              >
                <Check className="w-3 h-3" />
                Aplicar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SliderBlock({
  label,
  display,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  display: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span
          className="text-[8px] font-mono uppercase tracking-widest"
          style={{ color: 'oklch(0.40 0 0)' }}
        >
          {label}
        </span>
        <span
          className="text-[10px] font-mono tabular-nums font-medium"
          style={{ color: ACCENT }}
        >
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 cursor-pointer"
        style={{ accentColor: ACCENT }}
      />
    </div>
  )
}
