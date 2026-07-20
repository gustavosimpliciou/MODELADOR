"use client"

import { useState, useRef, useEffect } from 'react'
import { Trash2, ChevronDown, ChevronRight, Box, Layers, Eye, EyeOff, Lock, Unlock } from 'lucide-react'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Part } from '@/lib/parts-manager'
import { useT } from '@/lib/lang-store'

export function RightPanel() {
  const t = useT()
  const {
    modelInfo, modelMesh, selectedFaceIndices, selectionState, unit, setUnit,
    parts, activePartId, setActivePartId, togglePartVisibility, togglePartLocked,
    renamePart, removePart, setCutParts, setModelMesh, pushHistory, setStatus,
  } = useAppStore()

  const [infoOpen, setInfoOpen] = useState(true)
  const [selectionOpen, setSelectionOpen] = useState(true)
  const [partsOpen, setPartsOpen] = useState(true)

  const hasSelection = selectedFaceIndices.size > 0 && selectionState === 'selected'
  const unitMultiplier = unit === 'cm' ? 0.1 : unit === 'm' ? 0.001 : unit === 'in' ? 0.0393701 : 1
  const fmt = (val: number) => (val * unitMultiplier).toFixed(2)

  return (
    <aside
      className="flex flex-col w-60 border-l border-border overflow-y-auto shrink-0"
      style={{ background: 'oklch(0.09 0 0)' }}
      aria-label={t.properties}
    >
      <div className="section-header flex items-center justify-between">
        <span>{t.properties}</span>
        {modelInfo && (
          <span className="text-[9px] text-foreground/40 font-mono normal-case tracking-normal truncate max-w-28" title={modelInfo.name}>
            {modelInfo.name}
          </span>
        )}
      </div>

      {!modelMesh && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 p-6 text-center">
          <Box className="w-8 h-8 text-muted-foreground/20" />
          <p className="text-xs text-muted-foreground/40 font-mono leading-relaxed">
            {t.no_model_line1}<br />{t.no_model_line2}
          </p>
        </div>
      )}

      {modelInfo && (
        <Section title={t.model_section} open={infoOpen} onToggle={() => setInfoOpen(!infoOpen)}>
          <StatRow label={t.vertices} value={modelInfo.vertices.toLocaleString()} />
          <StatRow label={t.faces} value={modelInfo.faces.toLocaleString()} />
          <StatRow label={t.file_size} value={modelInfo.fileSize} />
          <div className="stat-row">
            <span className="stat-label">{t.unit}</span>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as any)}
              className="text-xs font-mono bg-transparent text-foreground border-none outline-none cursor-pointer"
              aria-label={t.unit}
            >
              <option value="mm">mm</option>
              <option value="cm">cm</option>
              <option value="m">m</option>
              <option value="in">in</option>
            </select>
          </div>
          <div className="pt-1 mt-1">
            <p className="stat-label mb-2">{t.dimensions}</p>
            <DimensionBar axis="X" value={fmt(modelInfo.width)} unit={unit} color="#ff3333" />
            <DimensionBar axis="Y" value={fmt(modelInfo.height)} unit={unit} color="#33ff66" />
            <DimensionBar axis="Z" value={fmt(modelInfo.depth)} unit={unit} color="#3366ff" />
          </div>
        </Section>
      )}

      {modelMesh && (
        <Section
          title={t.smartcut_selection}
          open={selectionOpen}
          onToggle={() => setSelectionOpen(!selectionOpen)}
          badge={hasSelection ? selectedFaceIndices.size.toLocaleString() : undefined}
          badgeColor="orange"
        >
          {!hasSelection ? (
            <p className="text-[11px] text-muted-foreground/40 font-mono py-2">{t.click_to_select}</p>
          ) : (
            <>
              <StatRow label={t.triangles} value={selectedFaceIndices.size.toLocaleString()} highlight />
              <StatRow label={t.pct_of_model} value={`${((selectedFaceIndices.size / (modelInfo?.faces ?? 1)) * 100).toFixed(1)}%`} />
            </>
          )}
        </Section>
      )}

      {parts.length > 0 && (
        <Section
          title={t.parts}
          open={partsOpen}
          onToggle={() => setPartsOpen(!partsOpen)}
          badge={String(parts.length)}
        >
          <div className="flex flex-col gap-0.5">
            {parts.map((part) => (
              <PartRow
                key={part.id}
                part={part}
                isActive={part.id === activePartId}
                onSelect={() => setActivePartId(part.id === activePartId ? null : part.id)}
                onToggleVisible={(e) => { e.stopPropagation(); togglePartVisibility(part.id) }}
                onToggleLocked={(e) => { e.stopPropagation(); togglePartLocked(part.id) }}
                onRename={(name) => renamePart(part.id, name)}
                onDelete={(e) => {
                  e.stopPropagation()
                  pushHistory()
                  removePart(part.id)
                  setStatus('loaded', `"${part.name}" removida.`)
                }}
              />
            ))}
          </div>
          {activePartId && (
            <p className="text-[10px] text-muted-foreground/40 font-mono mt-2 leading-relaxed">
              {t.isolation_hint}
            </p>
          )}
        </Section>
      )}

      <div className="flex-1" />

      <div className="px-3 py-2 border-t border-border flex items-center gap-2" style={{ background: 'oklch(0.08 0 0)' }}>
        <Layers className="w-3 h-3 text-muted-foreground/30" />
        <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">
          Nativos Cut v1.0
        </span>
      </div>
    </aside>
  )
}

// ─── PartRow ─────────────────────────────────────────────────────────────────

interface PartRowProps {
  part: Part; isActive: boolean
  onSelect: () => void; onToggleVisible: (e: React.MouseEvent) => void
  onToggleLocked: (e: React.MouseEvent) => void; onRename: (name: string) => void
  onDelete: (e: React.MouseEvent) => void
}

function PartRow({ part, isActive, onSelect, onToggleVisible, onToggleLocked, onRename, onDelete }: PartRowProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(part.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select() } }, [editing])

  const commitRename = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== part.name) onRename(trimmed)
    else setEditValue(part.name)
    setEditing(false)
  }

  const isMainPart = part.parentId === null
  const swatchColor = isMainPart ? 'oklch(0.50 0 0)' : 'oklch(0.70 0.22 42)'

  return (
    <div
      onClick={onSelect}
      className={cn('group flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors', isActive ? 'bg-secondary' : 'hover:bg-secondary/40', !part.visible && 'opacity-40')}
      style={isActive ? { borderLeft: `2px solid oklch(0.70 0.22 42)`, paddingLeft: '6px' } : { borderLeft: '2px solid transparent', paddingLeft: '6px' }}
      title={part.locked ? `${part.name} (bloqueada)` : part.name}
    >
      <button onClick={onToggleVisible} className="shrink-0 text-muted-foreground/40 hover:text-foreground transition-colors" aria-label={part.visible ? 'Ocultar' : 'Exibir'}>
        {part.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
      </button>
      <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: swatchColor }} aria-hidden="true" />
      {editing ? (
        <input
          ref={inputRef} value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setEditValue(part.name); setEditing(false) }; e.stopPropagation() }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 min-w-0 bg-transparent text-[11px] font-mono text-foreground border-b border-foreground/30 outline-none"
        />
      ) : (
        <span className={cn('flex-1 min-w-0 truncate text-[11px] font-mono', isActive ? 'text-foreground' : 'text-foreground/70')} onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); setEditValue(part.name) }} title="Duplo clique para renomear">
          {part.name}
        </span>
      )}
      <button onClick={onToggleLocked} className={cn('shrink-0 transition-colors', part.locked ? 'text-foreground/60' : 'text-muted-foreground/20 hover:text-muted-foreground/50 opacity-0 group-hover:opacity-100')} aria-label={part.locked ? 'Desbloquear' : 'Bloquear'}>
        {part.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
      </button>
      {!part.locked && (
        <button onClick={onDelete} className="shrink-0 text-muted-foreground/20 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100" aria-label={`Remover ${part.name}`}>
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

interface SectionProps {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode
  badge?: string; badgeColor?: 'orange' | 'default'
}

function Section({ title, open, onToggle, children, badge, badgeColor = 'default' }: SectionProps) {
  return (
    <div className="border-b border-border/50">
      <button onClick={onToggle} className="flex items-center justify-between w-full px-3 py-2 hover:bg-secondary/30 transition-colors" aria-expanded={open}>
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="w-3 h-3 text-muted-foreground/50" /> : <ChevronRight className="w-3 h-3 text-muted-foreground/50" />}
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{title}</span>
        </div>
        {badge && (
          <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded', badgeColor === 'orange' ? 'text-background' : 'bg-secondary text-muted-foreground')} style={badgeColor === 'orange' ? { background: 'oklch(0.70 0.22 42)' } : undefined}>
            {badge}
          </span>
        )}
      </button>
      {open && <div className="px-3 pb-3 animate-fade-in">{children}</div>}
    </div>
  )
}

interface StatRowProps { label: string; value: string; highlight?: boolean }
function StatRow({ label, value, highlight }: StatRowProps) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className={cn('stat-value', highlight && 'font-bold')} style={highlight ? { color: 'oklch(0.70 0.22 42)' } : undefined}>{value}</span>
    </div>
  )
}

interface DimensionBarProps { axis: string; value: string; unit: string; color: string }
function DimensionBar({ axis, value, unit, color }: DimensionBarProps) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="text-[10px] font-mono font-bold w-3 shrink-0" style={{ color }}>{axis}</span>
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] font-mono text-foreground">{value}<span className="text-muted-foreground ml-0.5">{unit}</span></span>
    </div>
  )
}
