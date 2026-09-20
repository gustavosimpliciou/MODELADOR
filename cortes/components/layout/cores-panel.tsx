"use client"

import { useState, useCallback, useRef, useMemo } from 'react'
import { Palette, Paintbrush, Eraser, Trash2, Download, GripHorizontal, Eye, RotateCcw, Ban } from 'lucide-react'
import { invalidate } from '@react-three/fiber'
import { useAppStore } from '@/lib/store'
import { trackEvent } from '@/lib/events'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/lang-store'

const PRESET_COLORS = [
  '#ff2e2e', '#ff7a00', '#ffcc00', '#2ecc71',
  '#00c2ff', '#0066ff', '#7c3aed', '#ff2e8b',
  '#ffffff', '#8a8a8a', '#2b2b2b', '#964B00',
]

export function CoresPanel() {
  const {
    activeTool,
    modelMesh,
    selectedFaceIndices,
    selectionState,
    paintColor,
    setPaintColor,
    paintSelection,
    clearPaintSelection,
    getActivePaintedMap,
    pushHistory,
    setStatus,
    clearSelection,
  } = useAppStore()

  const t = useT()
  const tAny = t as unknown as Record<string, string>

  // Estado do painel arrastável (igual ao PlaneCutPanel)
  const panelRef = useRef<HTMLDivElement>(null)
  const [fixedPos, setFixedPos] = useState<{ left: number; top: number } | null>(null)
  const headerDrag = useRef<{ startX: number; startY: number; origLeft: number; origTop: number } | null>(null)

  const onHeaderPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = panelRef.current!.getBoundingClientRect()
    headerDrag.current = { startX: e.clientX, startY: e.clientY, origLeft: rect.left, origTop: rect.top }
  }, [])
  const onHeaderPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!headerDrag.current || e.buttons !== 1) return
    const dx = e.clientX - headerDrag.current.startX
    const dy = e.clientY - headerDrag.current.startY
    setFixedPos({ left: headerDrag.current.origLeft + dx, top: headerDrag.current.origTop + dy })
  }, [])
  const onHeaderPointerUp = useCallback(() => { headerDrag.current = null }, [])

  const hasSelection = selectedFaceIndices.size > 0 && selectionState === 'selected'
  const paintedMap = getActivePaintedMap()
  const paintedCount = paintedMap?.size ?? 0
  const isNone = paintColor === 'none'

  const handlePaint = useCallback(() => {
    if (!hasSelection) {
      setStatus('error', tAny['cores_no_selection'] ?? 'Selecione uma região para pintar')
      return
    }
    pushHistory()
    let n = 0
    let label = paintColor
    if (isNone) {
      n = clearPaintSelection(false)
      label = 'nenhuma'
      trackEvent('paint_cleared', { faces: n, mode: 'selection', color: 'none' })
    } else {
      n = paintSelection()
      label = paintColor
      trackEvent('paint_created', { faces: n, color: paintColor, part: modelMesh?.name ?? null })
    }
    // Limpa seleção para revelar a pintura e força re-render demand
    clearSelection()
    invalidate()
    setStatus('loaded', (tAny['cores_painted'] ?? 'Pintado') + ` — ${n} faces → ${label}`)
  }, [hasSelection, paintSelection, clearPaintSelection, clearSelection, pushHistory, setStatus, paintColor, isNone, tAny, modelMesh])

  const handleClearSelection = useCallback(() => {
    if (!hasSelection) return
    pushHistory()
    const n = clearPaintSelection(false)
    invalidate()
    if (n > 0) trackEvent('paint_cleared', { faces: n, mode: 'selection' })
    setStatus('loaded', n > 0 ? `Pintura removida — ${n} faces` : 'Nenhuma pintura na seleção')
  }, [hasSelection, clearPaintSelection, pushHistory, setStatus])

  const handleClearAll = useCallback(() => {
    if (paintedCount === 0) return
    pushHistory()
    const n = clearPaintSelection(true)
    invalidate()
    if (n > 0) trackEvent('paint_cleared', { faces: n, mode: 'all' })
    setStatus('loaded', `Toda a pintura removida — ${n} faces`)
  }, [paintedCount, clearPaintSelection, pushHistory, setStatus])

  // Só exibe quando a ferramenta de pintura está ativa (ou quando há modelo e seleção)
  // Para ficar "abaixo do menu Corte", mostramos apenas em `paint`
  if (activeTool !== 'paint' || !modelMesh) return null

  const outerStyle: React.CSSProperties = fixedPos
    ? { position: 'fixed', left: fixedPos.left, top: fixedPos.top }
    : { position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)' }

  return (
    <div ref={panelRef} className="z-20 animate-fade-in pointer-events-auto" style={outerStyle}>
      <div
        className="flex flex-col rounded-2xl border overflow-hidden"
        style={{
          background: 'oklch(0.09 0 0 / 97%)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          borderColor: 'oklch(0.38 0.08 260 / 60%)',
          boxShadow: '0 8px 40px oklch(0 0 0 / 55%), inset 0 1px 0 oklch(1 0 0 / 4%)',
          minWidth: '300px',
          maxWidth: '340px',
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
            <div className="w-1 h-3.5 rounded-full" style={{ background: isNone ? 'transparent' : paintColor, boxShadow: isNone ? 'none' : `0 0 6px ${paintColor}`, border: isNone ? '1px dashed oklch(0.40 0 0)' : 'none' }} />
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Cores</span>
            {paintedCount > 0 && (
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full" style={{ background: 'oklch(0.55 0.15 260 / 20%)', color: 'oklch(0.75 0.14 260)' }}>
                {paintedCount} faces
              </span>
            )}
          </div>
          <Palette className="w-3.5 h-3.5" style={{ color: 'oklch(0.55 0.15 260)' }} />
        </div>

        <div className="flex flex-col gap-3 p-3">
          {/* Seleção info */}
          <div className="flex items-center justify-between rounded-lg px-2.5 py-2" style={{ background: 'oklch(0.12 0 0)', border: '1px solid oklch(0.16 0 0)' }}>
            <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: 'oklch(0.40 0 0)' }}>
              Seleção
            </span>
            <span className="text-[11px] font-mono font-medium tabular-nums" style={{ color: hasSelection ? 'oklch(0.70 0.22 42)' : 'oklch(0.35 0 0)' }}>
              {hasSelection ? `${selectedFaceIndices.size.toLocaleString()} faces` : 'Nada selecionado'}
            </span>
          </div>

          {/* Paleta */}
          <div className="flex flex-col gap-2">
            <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: 'oklch(0.35 0 0)' }}>
              Cor
            </span>
            <div className="grid grid-cols-6 gap-1.5">
              {PRESET_COLORS.map((hex) => (
                <button
                  key={hex}
                  onClick={() => setPaintColor(hex)}
                  className={cn('w-full aspect-square rounded-lg border-2 transition-all', !isNone && paintColor.toLowerCase() === hex.toLowerCase() ? 'scale-105' : 'hover:scale-102')}
                  style={{
                    background: hex,
                    borderColor: !isNone && paintColor.toLowerCase() === hex.toLowerCase() ? 'oklch(0.75 0.14 260)' : 'oklch(0.18 0 0)',
                    boxShadow: !isNone && paintColor.toLowerCase() === hex.toLowerCase() ? `0 0 8px ${hex}` : 'none',
                  }}
                  title={hex}
                  aria-label={`Cor ${hex}`}
                />
              ))}
            </div>

            {/* Nenhuma (sem cor) */}
            <button
              onClick={() => setPaintColor('none')}
              className={cn('w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[10px] font-mono transition-all', isNone ? 'scale-[1.01]' : 'hover:opacity-90')}
              style={{
                background: isNone ? 'oklch(0.55 0.15 260 / 20%)' : 'oklch(0.12 0 0)',
                borderColor: isNone ? 'oklch(0.75 0.14 260)' : 'oklch(0.18 0 0)',
                color: isNone ? 'oklch(0.75 0.14 260)' : 'oklch(0.45 0 0)',
                boxShadow: isNone ? '0 0 8px oklch(0.55 0.15 260 / 30%)' : 'none',
              }}
            >
              <Ban className="w-3 h-3" />
              Nenhuma (sem cor)
            </button>

            {/* Custom color */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="color"
                  value={isNone ? '#ff2e2e' : paintColor}
                  onChange={(e) => setPaintColor(e.target.value)}
                  disabled={isNone}
                  className="w-full h-8 rounded-lg border cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: 'oklch(0.12 0 0)', borderColor: 'oklch(0.18 0 0)', padding: '2px' }}
                  aria-label="Escolher cor"
                />
              </div>
              <div className="flex-1 flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'oklch(0.12 0 0)', border: '1px solid oklch(0.18 0 0)', opacity: isNone ? 0.4 : 1 }}>
                <div className="w-4 h-4 rounded-full border" style={{ background: isNone ? 'transparent' : paintColor, borderColor: 'oklch(0.25 0 0)', borderStyle: isNone ? 'dashed' : 'solid' }} />
                <input
                  type="text"
                  value={isNone ? 'nenhuma' : paintColor}
                  onChange={(e) => {
                    const v = e.target.value.trim()
                    if (v.toLowerCase() === 'nenhuma' || v.toLowerCase() === 'none') { setPaintColor('none'); return }
                    if (/^#?[0-9a-fA-F]{3,6}$/.test(v)) {
                      setPaintColor(v.startsWith('#') ? v : `#${v}`)
                    }
                  }}
                  className="flex-1 bg-transparent text-[11px] font-mono outline-none"
                  style={{ color: 'oklch(0.75 0 0)' }}
                  placeholder="#ff2e2e"
                  readOnly={isNone}
                />
              </div>
            </div>

            <p className="text-[8px] font-mono leading-relaxed" style={{ color: 'oklch(0.35 0 0)' }}>
              Selecione com a ferramenta <span style={{ color: 'oklch(0.70 0.22 42)' }}>Smart</span> (mesma seleção do corte) e clique em <span style={{ color: paintColor }}>Pintar</span>.
            </p>
          </div>

          {/* Ações */}
          <div className="flex gap-1.5">
            <button
              onClick={handlePaint}
              disabled={!hasSelection}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-mono font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: isNone ? 'oklch(0.18 0 0)' : hasSelection ? paintColor : 'oklch(0.18 0 0)', color: isNone ? 'oklch(0.75 0.14 260)' : hasSelection ? '#000' : 'oklch(0.35 0 0)', boxShadow: isNone || !hasSelection ? 'none' : `0 0 12px ${paintColor}55`, border: isNone ? '1px solid oklch(0.55 0.15 260)' : 'none' }}
            >
              {isNone ? <Ban className="w-3.5 h-3.5" /> : <Paintbrush className="w-3.5 h-3.5" />}
              {isNone ? 'Remover cor' : 'Pintar seleção'}
            </button>
            <button
              onClick={handleClearSelection}
              disabled={!hasSelection || paintedCount === 0}
              className="px-3 py-2 rounded-xl border text-[10px] font-mono transition-colors disabled:opacity-30"
              style={{ borderColor: 'oklch(0.18 0 0)', color: 'oklch(0.65 0 0)' }}
              title="Limpar pintura da seleção"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Limpar tudo / Info */}
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-mono" style={{ color: 'oklch(0.35 0 0)' }}>
              {paintedCount > 0 ? `${paintedCount} faces pintadas nesta peça` : 'Nenhuma face pintada'}
            </span>
            <button
              onClick={handleClearAll}
              disabled={paintedCount === 0}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-mono border transition-colors disabled:opacity-30"
              style={{ borderColor: 'oklch(0.25 0.08 25)', color: 'oklch(0.75 0.15 25)', background: 'oklch(0.20 0.05 25 / 40%)' }}
            >
              <Trash2 className="w-3 h-3" />
              Limpar tudo
            </button>
          </div>

          {/* Dica export */}
          <div className="rounded-xl px-3 py-2 flex items-center gap-2" style={{ background: 'oklch(0.12 0.12 260 / 20%)', border: '1px solid oklch(0.55 0.15 260 / 30%)' }}>
            <Download className="w-3.5 h-3.5 shrink-0" style={{ color: 'oklch(0.65 0.14 260)' }} />
            <span className="text-[8px] font-mono leading-relaxed" style={{ color: 'oklch(0.65 0.14 260)' }}>
              Exporte em <b>3MF colorido</b> no painel Exportar — cores salvas por triângulo.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
