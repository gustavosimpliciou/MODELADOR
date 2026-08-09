"use client"

/**
 * ACAB Panel — Acabamento localizado da região de corte
 * Painel com todos os parâmetros ajustáveis de suavização/refino.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { X, Sparkles, Eye, Check } from 'lucide-react'
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
  type CutRegionResult,
} from '@/lib/acabamento'

export function AcabPanel() {
  const activeTool = useAppStore((s) => s.activeTool)
  const setActiveTool = useAppStore((s) => s.setActiveTool)
  const parts = useAppStore((s) => s.parts)
  const activePartId = useAppStore((s) => s.activePartId)
  const setActivePartId = useAppStore((s) => s.setActivePartId)
  const updatePart = useAppStore((s) => s.updatePart)
  const pushHistory = useAppStore((s) => s.pushHistory)
  const setStatus = useAppStore((s) => s.setStatus)

  // Abre quando a ferramenta ACAB está ativa
  const open = String(activeTool) === 'acab'

  const [settings, setSettings] = useState<AcabSettings>(() => settingsFromPreset('premium'))
  const [showOriginal, setShowOriginal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [regionInfo, setRegionInfo] = useState<CutRegionResult | null>(null)
  const [previewGeo, setPreviewGeo] = useState<THREE.BufferGeometry | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [statusLine, setStatusLine] = useState('')

  const originalGeoRef = useRef<THREE.BufferGeometry | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedPart = useMemo(
    () => parts.find((p) => p.id === activePartId) ?? null,
    [parts, activePartId],
  )

  const availableParts = useMemo(() => parts.filter((p) => !p.locked), [parts])

  // Cleanup ao sair do modo ACAB
  useEffect(() => {
    if (!open) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      setPreviewGeo((g) => {
        g?.dispose()
        return null
      })
      setRegionInfo(null)
      setErrorMsg(null)
      setShowOriginal(false)
      originalGeoRef.current = null
      parts.forEach((p) => {
        if (!p.visible) {
          try {
            updatePart(p.id, { visible: true })
          } catch {
            /* ignore */
          }
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const isolatePart = useCallback(
    (partId: string) => {
      const part = parts.find((p) => p.id === partId)
      if (!part) return

      parts.forEach((p) => {
        try {
          updatePart(p.id, { visible: p.id === partId })
        } catch {
          /* ignore */
        }
      })

      const geo = part.mesh.geometry as THREE.BufferGeometry
      originalGeoRef.current = geo.clone()

      const tagged = (part as { cutFaceIndices?: number[] }).cutFaceIndices
      const region = identifyCutRegion(geo, { taggedFaceIndices: tagged })
      setRegionInfo(region)
      setPreviewGeo((g) => {
        g?.dispose()
        return null
      })
      setErrorMsg(null)
      setShowOriginal(false)

      if (region.method === 'fallback-none') {
        setStatusLine('Nenhuma região de corte detectada — ajuste os parâmetros e teste mesmo assim.')
      } else {
        setStatusLine(
          `Região: ${region.method} · ${region.cutFaceIndices.length || 0} faces`,
        )
      }

      try {
        window.dispatchEvent(new CustomEvent('acab:fit-part', { detail: { partId } }))
      } catch {
        /* ignore */
      }
    },
    [parts, updatePart],
  )

  useEffect(() => {
    if (!open) return
    if (activePartId) {
      isolatePart(activePartId)
    } else if (availableParts.length === 1) {
      setActivePartId(availableParts[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activePartId])

  const runPreview = useCallback(() => {
    if (!originalGeoRef.current) return
    setProcessing(true)
    setErrorMsg(null)

    const geo = originalGeoRef.current
    const s = clampAcabSettings(settings)
    const tagged = selectedPart
      ? (selectedPart as { cutFaceIndices?: number[] }).cutFaceIndices
      : undefined

    const schedule = (cb: () => void) => {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => cb(), { timeout: 250 })
      } else {
        setTimeout(cb, 0)
      }
    }

    schedule(() => {
      try {
        const result = runAcabamento(geo, s, { taggedFaceIndices: tagged })
        if (!result.valid) {
          setErrorMsg(
            result.issues[0] ||
              'Não foi possível aplicar com segurança. Reduza a intensidade ou o raio.',
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
            result.issues.length
              ? result.issues[0]
              : `Δ volume ${result.volumeDeltaPct >= 0 ? '+' : ''}${result.volumeDeltaPct.toFixed(2)}%`,
          )
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro no processamento'
        setErrorMsg(msg)
        setPreviewGeo((g) => {
          g?.dispose()
          return null
        })
      } finally {
        setProcessing(false)
      }
    })
  }, [settings, selectedPart])

  useEffect(() => {
    if (!open || !originalGeoRef.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runPreview(), 180)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [settings, open, runPreview])

  useEffect(() => {
    if (!selectedPart || !originalGeoRef.current) return
    const mesh = selectedPart.mesh
    if (showOriginal || !previewGeo) {
      mesh.geometry = originalGeoRef.current
    } else {
      mesh.geometry = previewGeo
    }
    if (mesh.geometry.attributes.position) {
      mesh.geometry.attributes.position.needsUpdate = true
    }
  }, [previewGeo, showOriginal, selectedPart])

  const handlePreset = (id: AcabPresetId) => {
    setSettings(settingsFromPreset(id))
  }

  const handleApply = () => {
    if (!selectedPart || !previewGeo || !originalGeoRef.current) return
    if (errorMsg) return

    try {
      pushHistory()
    } catch {
      /* ignore */
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
      /* ignore */
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
      /* ignore */
    }
    setStatusLine('Acabamento aplicado com sucesso')
  }

  const handleCancel = () => {
    if (selectedPart && originalGeoRef.current) {
      selectedPart.mesh.geometry = originalGeoRef.current
    }
    parts.forEach((p) => {
      try {
        updatePart(p.id, { visible: true })
      } catch {
        /* ignore */
      }
    })
    setActiveTool('select' as never)
  }

  const handlePartChange = (partId: string) => {
    if (selectedPart && originalGeoRef.current) {
      selectedPart.mesh.geometry = originalGeoRef.current
    }
    setActivePartId(partId)
  }

  if (!open) return null

  return (
    <div
      className="absolute left-16 top-4 z-50 w-80 rounded-xl border shadow-2xl overflow-hidden"
      style={{
        background: 'oklch(0.11 0 0)',
        borderColor: 'oklch(0.22 0 0)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
      }}
      role="dialog"
      aria-label="Acabamento"
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'oklch(0.18 0 0)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'oklch(0.70 0.22 42)' }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'oklch(0.12 0 0)' }} />
          </div>
          <div>
            <h2 className="text-xs font-mono font-semibold tracking-widest uppercase text-foreground">
              Acabamento
            </h2>
            <p className="text-[10px] text-muted-foreground/60 font-mono">
              Refine o contorno do corte
            </p>
          </div>
        </div>
        <button
          onClick={handleCancel}
          className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1.5 block">
            Peça selecionada
          </label>
          {availableParts.length === 0 ? (
            <p className="text-[11px] text-muted-foreground/50 font-mono leading-relaxed">
              Nenhuma peça disponível. Execute um <strong>CORTE</strong> antes de usar o ACAB.
            </p>
          ) : (
            <select
              value={activePartId ?? ''}
              onChange={(e) => handlePartChange(e.target.value)}
              className="w-full rounded-lg border bg-black/30 px-3 py-2.5 text-xs font-mono text-foreground outline-none focus:border-orange-500/50"
              style={{ borderColor: 'oklch(0.22 0 0)' }}
            >
              <option value="" disabled>
                Selecione uma peça…
              </option>
              {availableParts.map((p, i) => (
                <option key={p.id} value={p.id}>
                  {p.name || `Peça ${String(i + 1).padStart(2, '0')}`}
                </option>
              ))}
            </select>
          )}
          <p className="mt-1.5 text-[9px] text-muted-foreground/40 font-mono">
            Uma peça por vez · demais ficam ocultas
          </p>
        </div>

        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1.5 block">
            Predefinições
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {ACAB_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePreset(p.id)}
                className={cn(
                  'rounded-lg py-2.5 px-2 text-[10px] font-mono uppercase tracking-wider transition-all border',
                  settings.preset === p.id
                    ? 'text-background font-semibold'
                    : 'text-muted-foreground/70 hover:text-foreground',
                )}
                style={
                  settings.preset === p.id
                    ? { background: 'oklch(0.70 0.22 42)', borderColor: 'transparent' }
                    : { borderColor: 'oklch(0.20 0 0)' }
                }
                title={p.description}
              >
                {p.label}
                {p.recommended && settings.preset !== p.id && (
                  <span className="block text-[8px] opacity-50 normal-case tracking-normal mt-0.5">
                    recomendado
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px" style={{ background: 'oklch(0.18 0 0)' }} />

        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-2 block">
            Parâmetros
          </label>

          <SliderRow
            label="Suavização"
            value={Math.round(settings.intensity * 100)}
            display={`${Math.round(settings.intensity * 100)}%`}
            min={0}
            max={Math.round(ACAB_LIMITS.intensityMax * 100)}
            onChange={(v) =>
              setSettings((s) => ({ ...s, intensity: v / 100, preset: 'custom' }))
            }
          />

          <div className="mt-3">
            <SliderRow
              label="Raio de influência"
              value={settings.radiusMm}
              display={`${settings.radiusMm.toFixed(2)} mm`}
              min={ACAB_LIMITS.radiusMmMin}
              max={ACAB_LIMITS.radiusMmMax}
              step={0.05}
              onChange={(v) =>
                setSettings((s) => ({ ...s, radiusMm: v, preset: 'custom' }))
              }
            />
          </div>

          <div className="mt-3">
            <SliderRow
              label="Iterações"
              value={settings.iterations}
              display={String(settings.iterations)}
              min={ACAB_LIMITS.iterationsMin}
              max={ACAB_LIMITS.iterationsMax}
              step={1}
              onChange={(v) =>
                setSettings((s) => ({ ...s, iterations: v, preset: 'custom' }))
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <Toggle
            checked={settings.preserveDetails}
            onChange={(v) =>
              setSettings((s) => ({ ...s, preserveDetails: v, preset: 'custom' }))
            }
            label="Preservar detalhes"
          />
          <Toggle
            checked={settings.preserveVolume}
            onChange={(v) =>
              setSettings((s) => ({ ...s, preserveVolume: v, preset: 'custom' }))
            }
            label="Preservar volume"
          />
        </div>

        {(statusLine || errorMsg || processing) && (
          <div
            className="rounded-lg px-3 py-2.5 text-[10px] font-mono leading-relaxed"
            style={{
              background: errorMsg ? 'oklch(0.18 0.05 25)' : 'oklch(0.14 0 0)',
              color: errorMsg ? 'oklch(0.75 0.12 25)' : 'oklch(0.60 0 0)',
            }}
          >
            {processing ? 'Processando preview…' : errorMsg || statusLine}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowOriginal((v) => !v)}
          disabled={!previewGeo}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg py-2.5 text-[10px] font-mono uppercase tracking-wider border transition-all',
            !previewGeo && 'opacity-40 cursor-not-allowed',
          )}
          style={{ borderColor: 'oklch(0.22 0 0)' }}
        >
          <Eye className="w-3.5 h-3.5" />
          {showOriginal ? 'Ver com acabamento' : 'Ver original'}
        </button>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 rounded-lg py-3 text-[10px] font-mono uppercase tracking-wider border text-muted-foreground hover:text-foreground transition-all"
            style={{ borderColor: 'oklch(0.22 0 0)' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!previewGeo || !!errorMsg || processing || !selectedPart}
            className={cn(
              'flex-1 rounded-lg py-3 text-[10px] font-mono uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5',
              (!previewGeo || errorMsg || processing || !selectedPart) &&
                'opacity-40 cursor-not-allowed',
            )}
            style={{
              background: 'oklch(0.70 0.22 42)',
              color: 'oklch(0.12 0 0)',
            }}
          >
            <Check className="w-3.5 h-3.5" />
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}

function SliderRow({
  label,
  value,
  display,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  display: string
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono text-muted-foreground/70">{label}</span>
        <span
          className="text-[11px] font-mono font-medium tabular-nums"
          style={{ color: 'oklch(0.70 0.22 42)' }}
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
        className="w-full h-1.5 cursor-pointer rounded-full"
        style={{ accentColor: 'oklch(0.70 0.22 42)' }}
      />
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-3.5 h-3.5 rounded"
        style={{ accentColor: 'oklch(0.70 0.22 42)' }}
      />
      <span className="text-[11px] font-mono text-muted-foreground/80">{label}</span>
    </label>
  )
}
