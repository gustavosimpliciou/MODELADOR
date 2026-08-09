"use client"

/**
 * ACAB Panel — Acabamento localizado da região de corte
 *
 * Regras absolutas:
 *  - Uma peça por vez
 *  - Só a região de corte é modificada
 *  - Original preservado até APLICAR
 *  - Sutil por padrão
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { X, Sparkles, Eye, RotateCcw, Check } from 'lucide-react'
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
  expandInfluenceMask,
  type AcabSettings,
  type AcabPresetId,
  type CutRegionResult,
} from '@/lib/acabamento'
import { createPart } from '@/lib/parts-manager'

export function AcabPanel() {
  const {
    activeTool,
    setActiveTool,
    parts,
    activePartId,
    setActivePartId,
    updatePart,
    pushHistory,
    setStatus,
  } = useAppStore()

  const open = activeTool === 'acab'

  // ─── Estado local do ACAB ────────────────────────────────────────────────
  const [settings, setSettings] = useState<AcabSettings>(() => settingsFromPreset('premium'))
  const [showOriginal, setShowOriginal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [regionInfo, setRegionInfo] = useState<CutRegionResult | null>(null)
  const [previewGeo, setPreviewGeo] = useState<THREE.BufferGeometry | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [statusLine, setStatusLine] = useState('')

  // Snapshot do original da peça selecionada (nunca modificado até APLICAR)
  const originalGeoRef = useRef<THREE.BufferGeometry | null>(null)
  const originalMeshRef = useRef<THREE.Mesh | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedPart = useMemo(
    () => parts.find((p) => p.id === activePartId) ?? null,
    [parts, activePartId],
  )

  // Peças disponíveis (não-locked)
  const availableParts = useMemo(
    () => parts.filter((p) => !p.locked),
    [parts],
  )

  // ─── Entrada no modo ACAB ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      // Cleanup ao sair
      if (debounceRef.current) clearTimeout(debounceRef.current)
      setPreviewGeo((g) => { g?.dispose(); return null })
      setRegionInfo(null)
      setErrorMsg(null)
      setShowOriginal(false)
      originalGeoRef.current = null
      originalMeshRef.current = null
      // Restaura visibilidade de todas as peças
      parts.forEach((p) => {
        if (!p.visible) updatePart(p.id, { visible: true })
      })
      return
    }

    // Ao entrar: se há activePartId, isola; senão pede seleção
    if (activePartId) {
      isolatePart(activePartId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Quando muda a peça ativa dentro do ACAB
  useEffect(() => {
    if (!open || !activePartId) return
    isolatePart(activePartId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePartId, open])

  const isolatePart = useCallback((partId: string) => {
    const part = parts.find((p) => p.id === partId)
    if (!part) return

    // Oculta todas as outras
    parts.forEach((p) => {
      updatePart(p.id, { visible: p.id === partId })
    })

    // Snapshot do original
    originalMeshRef.current = part.mesh
    const geo = part.mesh.geometry as THREE.BufferGeometry
    originalGeoRef.current = geo.clone()

    // Identifica região de corte
    const tagged = (part as any).cutFaceIndices as number[] | undefined
    const region = identifyCutRegion(geo, { taggedFaceIndices: tagged })
    setRegionInfo(region)
    setPreviewGeo((g) => { g?.dispose(); return null })
    setErrorMsg(null)
    setShowOriginal(false)

    if (region.method === 'fallback-none') {
      setStatusLine('Nenhuma região de corte detectada nesta peça.')
    } else {
      setStatusLine(`Região identificada (${region.method}) · ${region.cutFaceIndices.length || '—'} faces`)
    }

    // Fit camera suave — despacha evento para o viewport escutar
    try {
      window.dispatchEvent(new CustomEvent('acab:fit-part', { detail: { partId } }))
    } catch { /* ignore */ }
  }, [parts, updatePart])

  // ─── Preview com debounce ────────────────────────────────────────────────
  const runPreview = useCallback(() => {
    if (!originalGeoRef.current) return
    setProcessing(true)
    setErrorMsg(null)

    // Processa de forma assíncrona para não travar a UI
    const geo = originalGeoRef.current
    const s = clampAcabSettings(settings)
    const tagged = selectedPart ? (selectedPart as any).cutFaceIndices as number[] | undefined : undefined

    // requestIdleCallback ou setTimeout para sair do frame atual
    const schedule = (cb: () => void) => {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => cb(), { timeout: 200 })
      } else {
        setTimeout(cb, 0)
      }
    }

    schedule(() => {
      try {
        const result = runAcabamento(geo, s, { taggedFaceIndices: tagged })
        if (!result.valid) {
          setErrorMsg(result.issues[0] || 'Não foi possível aplicar este acabamento com segurança. Reduza a intensidade ou o raio.')
          setPreviewGeo((g) => { g?.dispose(); return null })
        } else {
          setPreviewGeo((g) => { g?.dispose(); return result.geometry })
          setStatusLine(
            result.issues.length
              ? result.issues[0]
              : `Δ volume ${result.volumeDeltaPct >= 0 ? '+' : ''}${result.volumeDeltaPct.toFixed(2)}%`,
          )
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Erro no processamento')
        setPreviewGeo((g) => { g?.dispose(); return null })
      } finally {
        setProcessing(false)
      }
    })
  }, [settings, selectedPart])

  // Debounce ao mudar settings
  useEffect(() => {
    if (!open || !originalGeoRef.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runPreview(), 180)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [settings, open, runPreview])

  // ─── Aplicar preview na mesh (temporário) ────────────────────────────────
  useEffect(() => {
    if (!selectedPart || !originalGeoRef.current) return
    const mesh = selectedPart.mesh
    if (showOriginal || !previewGeo) {
      mesh.geometry = originalGeoRef.current
    } else {
      mesh.geometry = previewGeo
    }
    // Força update
    mesh.geometry.attributes.position.needsUpdate = true
  }, [previewGeo, showOriginal, selectedPart])

  // ─── Ações ───────────────────────────────────────────────────────────────
  const handlePreset = (id: AcabPresetId) => {
    setSettings(settingsFromPreset(id))
  }

  const handleApply = () => {
    if (!selectedPart || !previewGeo || !originalGeoRef.current) return
    if (errorMsg) return

    pushHistory()

    // Aplica definitivamente: clona a geo de preview para a peça
    const finalGeo = previewGeo.clone()
    const mesh = selectedPart.mesh
    const oldGeo = mesh.geometry as THREE.BufferGeometry
    mesh.geometry = finalGeo
    oldGeo.dispose()

    // Atualiza part no store
    updatePart(selectedPart.id, {
      mesh,
      cutHistory: [...(selectedPart.cutHistory || []), 'ACAB'],
    } as any)

    // Limpa snapshot — o novo original passa a ser o resultado
    originalGeoRef.current?.dispose()
    originalGeoRef.current = finalGeo.clone()
    setPreviewGeo((g) => { g?.dispose(); return null })
    setStatus('idle', 'Acabamento aplicado')
    setStatusLine('Acabamento aplicado com sucesso')
  }

  const handleCancel = () => {
    // Restaura original
    if (selectedPart && originalGeoRef.current) {
      selectedPart.mesh.geometry = originalGeoRef.current
    }
    // Restaura visibilidade
    parts.forEach((p) => updatePart(p.id, { visible: true }))
    setActiveTool('select')
  }

  const handlePartChange = (partId: string) => {
    // Restaura geo da peça anterior se havia preview
    if (selectedPart && originalGeoRef.current) {
      selectedPart.mesh.geometry = originalGeoRef.current
    }
    setActivePartId(partId)
  }

  if (!open) return null

  return (
    <div
      className="absolute left-16 top-4 z-40 w-72 rounded-xl border shadow-2xl overflow-hidden"
      style={{
        background: 'oklch(0.10 0 0)',
        borderColor: 'oklch(0.18 0 0)',
      }}
      role="dialog"
      aria-label="Acabamento"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'oklch(0.16 0 0)' }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: 'oklch(0.70 0.22 42)' }} />
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
          className="p-1 rounded hover:bg-white/5 text-muted-foreground"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
        {/* Seletor de peça — UMA por vez */}
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1.5 block">
            Peça selecionada
          </label>
          {availableParts.length === 0 ? (
            <p className="text-[11px] text-muted-foreground/40 font-mono">
              Nenhuma peça disponível. Execute um CORTE primeiro.
            </p>
          ) : (
            <select
              value={activePartId ?? ''}
              onChange={(e) => handlePartChange(e.target.value)}
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-xs font-mono text-foreground outline-none"
              style={{ borderColor: 'oklch(0.20 0 0)' }}
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
          <p className="mt-1 text-[9px] text-muted-foreground/40 font-mono">
            Apenas uma peça por vez · demais ocultas
          </p>
        </div>

        {/* Predefinições */}
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1.5 block">
            Predefinições
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {ACAB_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePreset(p.id)}
                className={cn(
                  'rounded-lg py-2 px-2 text-[10px] font-mono uppercase tracking-wider transition-all border',
                  settings.preset === p.id
                    ? 'text-background font-semibold'
                    : 'text-muted-foreground/70 hover:text-foreground',
                )}
                style={
                  settings.preset === p.id
                    ? { background: 'oklch(0.70 0.22 42)', borderColor: 'transparent' }
                    : { borderColor: 'oklch(0.18 0 0)' }
                }
                title={p.description}
              >
                {p.label}
                {p.recommended && settings.preset !== p.id && (
                  <span className="block text-[8px] opacity-50 normal-case tracking-normal">recomendado</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px" style={{ background: 'oklch(0.16 0 0)' }} />

        {/* Controles */}
        <SliderRow
          label="Intensidade"
          value={Math.round(settings.intensity * 100)}
          display={`${Math.round(settings.intensity * 100)}%`}
          min={0}
          max={Math.round(ACAB_LIMITS.intensityMax * 100)}
          onChange={(v) => setSettings((s) => ({ ...s, intensity: v / 100, preset: 'custom' }))}
        />
        <SliderRow
          label="Raio"
          value={settings.radiusMm}
          display={`${settings.radiusMm.toFixed(2)} mm`}
          min={ACAB_LIMITS.radiusMmMin}
          max={ACAB_LIMITS.radiusMmMax}
          step={0.05}
          onChange={(v) => setSettings((s) => ({ ...s, radiusMm: v, preset: 'custom' }))}
        />
        <SliderRow
          label="Iterações"
          value={settings.iterations}
          display={String(settings.iterations)}
          min={ACAB_LIMITS.iterationsMin}
          max={ACAB_LIMITS.iterationsMax}
          step={1}
          onChange={(v) => setSettings((s) => ({ ...s, iterations: v, preset: 'custom' }))}
        />

        {/* Toggles */}
        <div className="flex flex-col gap-2">
          <Toggle
            checked={settings.preserveDetails}
            onChange={(v) => setSettings((s) => ({ ...s, preserveDetails: v, preset: 'custom' }))}
            label="Preservar detalhes"
          />
          <Toggle
            checked={settings.preserveVolume}
            onChange={(v) => setSettings((s) => ({ ...s, preserveVolume: v, preset: 'custom' }))}
            label="Preservar volume"
          />
        </div>

        {/* Status / erro */}
        {(statusLine || errorMsg || processing) && (
          <div
            className="rounded-lg px-3 py-2 text-[10px] font-mono"
            style={{
              background: errorMsg ? 'oklch(0.18 0.05 25)' : 'oklch(0.12 0 0)',
              color: errorMsg ? 'oklch(0.75 0.12 25)' : 'oklch(0.55 0 0)',
            }}
          >
            {processing ? 'Processando…' : errorMsg || statusLine}
          </div>
        )}

        {/* Antes / Depois */}
        <button
          onClick={() => setShowOriginal((v) => !v)}
          disabled={!previewGeo}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg py-2 text-[10px] font-mono uppercase tracking-wider border transition-all',
            !previewGeo && 'opacity-40 cursor-not-allowed',
          )}
          style={{ borderColor: 'oklch(0.20 0 0)' }}
        >
          <Eye className="w-3.5 h-3.5" />
          {showOriginal ? 'Ver acabamento' : 'Ver original'}
        </button>

        {/* Ações */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleCancel}
            className="flex-1 rounded-lg py-2.5 text-[10px] font-mono uppercase tracking-wider border text-muted-foreground hover:text-foreground transition-all"
            style={{ borderColor: 'oklch(0.20 0 0)' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={!previewGeo || !!errorMsg || processing || !selectedPart}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-[10px] font-mono uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5',
              (!previewGeo || errorMsg || processing) && 'opacity-40 cursor-not-allowed',
            )}
            style={{ background: 'oklch(0.70 0.22 42)', color: 'oklch(0.12 0 0)' }}
          >
            <Check className="w-3.5 h-3.5" />
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── UI atoms ────────────────────────────────────────────────────────────────

function SliderRow({
  label, value, display, min, max, step = 1, onChange,
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
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50">
          {label}
        </span>
        <span className="text-[10px] font-mono text-foreground/80">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 cursor-pointer"
        style={{ accentColor: 'oklch(0.70 0.22 42)' }}
      />
    </div>
  )
}

function Toggle({
  checked, onChange, label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded"
        style={{ accentColor: 'oklch(0.70 0.22 42)' }}
      />
      <span className="text-[11px] font-mono text-muted-foreground/80">{label}</span>
    </label>
  )
}
