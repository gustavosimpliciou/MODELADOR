"use client"

import React from 'react'
import { MousePointerClick, Scissors, RotateCcw } from 'lucide-react'
import { useAppStore, type Tool } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/lang-store'

export function LeftPanel() {
  const t = useT()
  const {
    activeTool,
    setActiveTool,
    modelMesh,
    resetAll,
    sharpAngle,
    setSharpAngle,
    cutMode,
    setCutMode,
  } = useAppStore()

  const TOOLS: { id: Tool; icon: React.ReactNode; label: string; description: string }[] = [
    { id: 'select', icon: <MousePointerClick className="w-4 h-4" />, label: 'Smart', description: t.tool_smart_desc },
    { id: 'cut',    icon: <Scissors className="w-4 h-4" />,          label: t.reset /* Corte label via i18n would be "Corte" but it's always English-ish "CORTE" */, description: t.tool_cut_desc },
  ]

  // Recalculate tools with translated descriptions
  const tools: { id: Tool; icon: React.ReactNode; label: string; description: string }[] = [
    { id: 'select', icon: <MousePointerClick className="w-4 h-4" />, label: 'Smart', description: t.tool_smart_desc },
    { id: 'cut',    icon: <Scissors className="w-4 h-4" />,          label: 'Corte',  description: t.tool_cut_desc },
  ]

  const sensLabel =
    sharpAngle <= 5 ? t.sens_ultra :
    sharpAngle < 15 ? t.sens_restricted :
    sharpAngle < 35 ? t.sens_standard :
    sharpAngle < 55 ? t.sens_wide : t.sens_max

  return (
    <aside
      className="flex flex-col items-center w-14 border-r py-3 gap-1 shrink-0"
      style={{ background: 'oklch(0.08 0 0)', borderColor: 'oklch(0.14 0 0)' }}
      aria-label="Ferramentas"
    >
      {/* Tools */}
      {tools.map((tool) => (
        <ToolButton
          key={tool.id}
          id={tool.id}
          icon={tool.icon}
          label={tool.label}
          description={tool.description}
          active={activeTool === tool.id}
          onClick={() => setActiveTool(tool.id)}
          disabled={tool.id !== 'select' && !modelMesh}
        />
      ))}

      {/* Separator */}
      <div className="w-8 h-px my-1" style={{ background: 'oklch(0.16 0 0)' }} />

      {/* SmartCut mode — only in select tool */}
      {activeTool === 'select' && (
        <div className="flex flex-col items-center gap-1 w-full px-1.5">
          <span className="text-[7px] font-mono uppercase tracking-widest" style={{ color: 'oklch(0.40 0 0)' }}>
            {t.mode}
          </span>
          <div className="flex flex-col gap-0.5 w-full">
            {(['island', 'curvature'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCutMode(mode)}
                className={cn(
                  'w-full rounded-lg py-1 text-[8px] font-mono uppercase tracking-wider transition-all duration-150',
                  cutMode === mode
                    ? 'text-background font-semibold'
                    : 'border text-muted-foreground/60 hover:text-muted-foreground',
                )}
                style={
                  cutMode === mode
                    ? { background: 'oklch(0.70 0.22 42)', borderColor: 'transparent' }
                    : { borderColor: 'oklch(0.18 0 0)' }
                }
                aria-pressed={cutMode === mode}
              >
                {mode === 'island' ? t.part_mode : t.curv_mode}
              </button>
            ))}
          </div>

          <div className="w-8 h-px my-1" style={{ background: 'oklch(0.16 0 0)' }} />

          {/* Sensitivity slider */}
          <div className="flex flex-col items-center gap-1.5 w-full">
            <span className="text-[7px] font-mono uppercase tracking-widest" style={{ color: 'oklch(0.40 0 0)' }}>
              {t.sensitivity}
            </span>
            <div className="relative group flex flex-col items-center">
              <input
                type="range"
                min={1}
                max={150}
                step={1}
                value={sharpAngle}
                onChange={(e) => setSharpAngle(Number(e.target.value))}
                className="cursor-pointer"
                style={{
                  writingMode: 'vertical-lr',
                  direction: 'rtl',
                  height: '64px',
                  width: '4px',
                  accentColor: 'oklch(0.70 0.22 42)',
                } as React.CSSProperties}
                aria-label={`${t.sensitivity} ${sharpAngle}°`}
              />
              <div className="tool-tooltip whitespace-nowrap">
                {t.sensitivity}: {sharpAngle}°
                <br />
                <span className="text-muted-foreground/60 text-[9px]">{sensLabel}</span>
              </div>
            </div>
            <span className="text-[9px] font-mono tabular-nums font-medium" style={{ color: 'oklch(0.70 0.22 42)' }}>
              {sharpAngle}°
            </span>
          </div>

          <div className="w-8 h-px my-1" style={{ background: 'oklch(0.16 0 0)' }} />
        </div>
      )}

      <div className="flex-1" />

      {/* Reset */}
      <div className="relative group">
        <button
          onClick={resetAll}
          className="flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl text-muted-foreground/50 hover:text-foreground hover:bg-secondary/30 transition-all duration-150"
          aria-label={t.reset_tooltip}
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-[8px] font-mono uppercase tracking-wider leading-none">{t.reset}</span>
        </button>
        <div className="tool-tooltip whitespace-nowrap">{t.reset_tooltip}</div>
      </div>
    </aside>
  )
}

interface ToolButtonProps {
  id: string
  icon: React.ReactNode
  label: string
  description: string
  active: boolean
  onClick: () => void
  disabled?: boolean
}

function ToolButton({ icon, label, description, active, onClick, disabled }: ToolButtonProps) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn('tool-btn', active && 'active', disabled && 'opacity-25 cursor-not-allowed')}
        aria-label={description}
        aria-pressed={active}
      >
        {icon}
        <span className="text-[8px] font-mono uppercase tracking-wider leading-none">{label}</span>
        {active && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
            style={{ background: 'oklch(0.70 0.22 42)' }}
            aria-hidden="true"
          />
        )}
      </button>
      <div className="tool-tooltip" role="tooltip">{description}</div>
    </div>
  )
}
