"use client"

import { Sparkles, Box, X } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function CutActions() {
  const {
    selectionState,
    selectedFaceIndices,
    modelMesh,
    clearSelection,
    autoCutOpen,
    setAutoCutOpen,
    encaixeOpen,
    setEncaixeOpen,
  } = useAppStore()

  const hasSelection = selectedFaceIndices.size > 0 && selectionState === 'selected'

  if (!hasSelection || !modelMesh) return null

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-fade-in pointer-events-auto">
      <div
        className="flex items-center gap-1.5 p-1.5 rounded-2xl border"
        style={{
          background: 'oklch(0.09 0 0 / 97%)',
          backdropFilter: 'blur(24px) saturate(1.5)',
          borderColor: 'oklch(0.20 0 0)',
          boxShadow: '0 4px 24px oklch(0 0 0 / 55%), inset 0 1px 0 oklch(1 0 0 / 5%)',
        }}
      >
        {/* AutoCut */}
        <ActionChip
          icon={<Sparkles className="w-3.5 h-3.5" />}
          label="AutoCut"
          active={autoCutOpen}
          accent="oklch(0.70 0.22 42)"
          onClick={() => { setAutoCutOpen(!autoCutOpen); if (encaixeOpen) setEncaixeOpen(false) }}
          title="Corte inteligente com contorno automático"
        />

        {/* Encaixe */}
        <ActionChip
          icon={<Box className="w-3.5 h-3.5" />}
          label="Encaixe"
          active={encaixeOpen}
          accent="oklch(0.62 0.15 260)"
          onClick={() => { setEncaixeOpen(!encaixeOpen); if (autoCutOpen) setAutoCutOpen(false) }}
          title="Gerar pino/furo de encaixe na costura"
        />

        {/* Divisor */}
        <div className="w-px h-5 mx-0.5" style={{ background: 'oklch(0.22 0 0)' }} />

        {/* Cancelar */}
        <button
          onClick={clearSelection}
          title="Cancelar seleção"
          className="flex items-center justify-center w-7 h-7 rounded-xl text-muted-foreground/50 hover:text-foreground hover:bg-secondary/50 transition-all duration-150"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

interface ActionChipProps {
  icon: React.ReactNode
  label: string
  active: boolean
  accent: string
  onClick: () => void
  title?: string
}

function ActionChip({ icon, label, active, accent, onClick, title }: ActionChipProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-mono font-medium transition-all duration-150',
        active
          ? 'text-background'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40',
      )}
      style={active ? { background: accent, boxShadow: `0 0 12px ${accent}55` } : undefined}
    >
      {icon}
      {label}
    </button>
  )
}
