"use client"

import { useMemo, useRef, useCallback, useState } from 'react'
import { Scissors, FlipHorizontal2, Square, Infinity as InfinityIcon, Minus, ChevronUp, GripHorizontal, Move, RotateCcw } from 'lucide-react'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'
import { solidPlaneCut, planeFromAxisOffset, type PlaneAxis } from '@/lib/solid-plane-cut'
// plate-cut imports removed — Placa de Limitação não executa cortes
import { cn } from '@/lib/utils'

const AXES: { id: PlaneAxis; label: string; color: string; glow: string }[] = [
  { id: 'x', label: 'X', color: 'oklch(0.65 0.22 25)',  glow: 'oklch(0.65 0.22 25 / 35%)' },
  { id: 'y', label: 'Y', color: 'oklch(0.72 0.20 145)', glow: 'oklch(0.72 0.20 145 / 35%)' },
  { id: 'z', label: 'Z', color: 'oklch(0.65 0.20 250)', glow: 'oklch(0.65 0.20 250 / 35%)' },
]

const RULER_TICKS = 20

// ─── Mini Régua ──────────────────────────────────────────────────────────────

interface RulerProps {
  value: number
  onChange: (v: number) => void
  modelSize: number
  axisColor: string
}

function MiniRuler({ value, onChange, modelSize, axisColor }: RulerProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = trackRef.current!.getBoundingClientRect()
    const clamp = (v: number) => Math.min(0.98, Math.max(0.02, v))
    onChange(clamp((e.clientX - rect.left) / rect.width))
  }, [onChange])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return
    const rect = trackRef.current!.getBoundingClientRect()
    const clamp = (v: number) => Math.min(0.98, Math.max(0.02, v))
    onChange(clamp((e.clientX - rect.left) / rect.width))
  }, [onChange])

  const mmTotal = modelSize || 100
  const mmValue = (value * mmTotal).toFixed(1)

  return (
    <div className="flex flex-col gap-1 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: 'oklch(0.40 0 0)' }}>
          Posição do corte
        </span>
        <span className="text-[10px] font-mono tabular-nums font-medium" style={{ color: axisColor }}>
          {mmValue} mm
        </span>
      </div>

      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="relative h-7 rounded-lg cursor-col-resize"
        style={{
          background: 'oklch(0.12 0 0)',
          border: '1px solid oklch(0.20 0 0)',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {Array.from({ length: RULER_TICKS + 1 }).map((_, i) => {
          const pos = i / RULER_TICKS
          const isMajor = i % 5 === 0
          return (
            <div key={i} className="absolute top-0 w-px" style={{
              left: `${pos * 100}%`,
              height: isMajor ? '60%' : '35%',
              background: isMajor ? 'oklch(0.32 0 0)' : 'oklch(0.22 0 0)',
            }} />
          )
        })}

        {Array.from({ length: 5 }).map((_, i) => {
          const pos = (i / 4) * 100
          const mm = ((i / 4) * mmTotal).toFixed(0)
          return (
            <span key={i} className="absolute bottom-0.5 font-mono text-[6px] -translate-x-1/2"
              style={{ left: `${pos}%`, color: 'oklch(0.30 0 0)', userSelect: 'none' }}>
              {mm}
            </span>
          )
        })}

        <div className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none"
          style={{ left: `${value * 100}%`, transform: 'translateX(-50%)' }}>
          <div className="w-0.5 flex-1 rounded-full" style={{ background: axisColor, boxShadow: `0 0 6px ${axisColor}` }} />
          <svg width="8" height="5" viewBox="0 0 8 5" className="shrink-0">
            <polygon points="4,0 8,5 0,5" fill={axisColor} />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-0.5 rounded-full" style={{ background: 'oklch(0.14 0 0)' }}>
          <div className="h-full rounded-full transition-all duration-75"
            style={{ width: `${value * 100}%`, background: axisColor }} />
        </div>
        <span className="text-[8px] font-mono tabular-nums" style={{ color: 'oklch(0.35 0 0)' }}>
          {Math.round(value * 100)}%
        </span>
      </div>
    </div>
  )
}

// ─── Controle numérico ────────────────────────────────────────────────────────

function NumInput({
  label, value, onChange, unit = 'mm', min = 0.01, step = 0.1,
}: {
  label: string; value: number; onChange: (v: number) => void
  unit?: string; min?: number; step?: number
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: 'oklch(0.40 0 0)' }}>
        {label}
      </span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={parseFloat(value.toFixed(3))}
          min={min}
          step={step}
          onChange={e => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v) && v >= min) onChange(v)
          }}
          className="w-18 px-2 py-0.5 text-[10px] font-mono rounded-lg text-right"
          style={{
            background: 'oklch(0.12 0 0)',
            border: '1px solid oklch(0.20 0 0)',
            color: 'oklch(0.75 0.12 250)',
            outline: 'none',
          }}
        />
        <span className="text-[8px] font-mono" style={{ color: 'oklch(0.35 0 0)' }}>{unit}</span>
      </div>
    </div>
  )
}

// ─── Painel principal ─────────────────────────────────────────────────────────

export function PlaneCutPanel() {
  const {
    activeTool,
    modelMesh,
    modelInfo,
    cutPlaneAxis,
    cutPlaneOffset,
    cutPlaneFlip,
    setCutPlaneAxis,
    setCutPlaneOffset,
    toggleCutPlaneFlip,
    setModelMesh,
    setModelInfo,
    addCutPart,
    cutParts,
    setStatus,
    pushHistory,
    clearSelection,
    planeCutMode,
    setPlaneCutMode,
    plateCutPosition,
    plateCutRotation,
    plateCutWidth,
    plateCutHeight,
    setPlateCutSize,
    setPlateCutRotation,
    plateMoveMode,
    setPlateMoveMode,
    initPlateFromModel,
  } = useAppStore()

  // ─── Estado do painel arrastável ──────────────────────────────────────────────
  const panelRef = useRef<HTMLDivElement>(null)
  const [minimized, setMinimized] = useState(false)
  const [fixedPos, setFixedPos] = useState<{ left: number; top: number } | null>(null)
  const headerDrag = useRef<{ startX: number; startY: number; origLeft: number; origTop: number } | null>(null)

  const onHeaderPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Não inicia drag em cliques em botões filhos
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const panel = panelRef.current!
    const rect = panel.getBoundingClientRect()
    headerDrag.current = {
      startX: e.clientX,
      startY: e.clientY,
      origLeft: rect.left,
      origTop: rect.top,
    }
  }, [])

  const onHeaderPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!headerDrag.current || e.buttons !== 1) return
    const dx = e.clientX - headerDrag.current.startX
    const dy = e.clientY - headerDrag.current.startY
    setFixedPos({
      left: headerDrag.current.origLeft + dx,
      top:  headerDrag.current.origTop  + dy,
    })
  }, [])

  const onHeaderPointerUp = useCallback(() => {
    headerDrag.current = null
  }, [])

  // ─── Tamanho do modelo ────────────────────────────────────────────────────────

  const modelSizeMm = useMemo(() => {
    if (!modelMesh) return 100
    const geo = modelMesh.geometry as THREE.BufferGeometry
    if (!geo.boundingBox) geo.computeBoundingBox()
    const bb = geo.boundingBox!
    const size = new THREE.Vector3()
    bb.getSize(size)
    return cutPlaneAxis === 'x' ? size.x : cutPlaneAxis === 'y' ? size.y : size.z
  }, [modelMesh, cutPlaneAxis])

  if (activeTool !== 'cut' || !modelMesh) return null

  const axisInfo = AXES.find((a) => a.id === cutPlaneAxis)!

  // ─── Executar corte por plano infinito ───────────────────────────────────────

  const handleExecuteInfinite = () => {
    if (!modelMesh) return
    pushHistory()
    setStatus('cutting', 'Executando corte de sólido (watertight)...')

    requestAnimationFrame(() => setTimeout(() => {
      const geo = modelMesh.geometry as THREE.BufferGeometry
      if (!geo.boundingBox) geo.computeBoundingBox()
      const bbox = geo.boundingBox!

      const { normal, point } = planeFromAxisOffset(bbox, cutPlaneAxis, cutPlaneOffset, cutPlaneFlip)

      let result
      try {
        result = solidPlaneCut(geo, normal, point)
      } catch (err) {
        console.error('[PlaneCut] Erro:', err)
        setStatus('error', 'Falha ao cortar o sólido.')
        return
      }

      applyResult(result.positive, result.negative, normal, `Corte concluído — ${result.capLoops} contorno(s) · ${result.capTriangles.toLocaleString()} triângulos de tampa`)
    }, 20))
  }

  // ─── Executar corte por placa finita ─────────────────────────────────────────

  // handleExecutePlate removido — Placa de Limitação não executa cortes.
  // Ela atua como barreira para o SmartCut (ferramenta Smart).

  // ─── Aplica o resultado de qualquer modo de corte ────────────────────────────

  const applyResult = (
    positive: THREE.BufferGeometry,
    negative: THREE.BufferGeometry,
    normal: THREE.Vector3,
    statusMsg: string,
  ) => {
    const posCount = positive.getAttribute('position')?.count ?? 0
    const negCount = negative.getAttribute('position')?.count ?? 0

    if (posCount === 0 || negCount === 0) {
      setStatus('error', 'O plano não intercepta o modelo. Ajuste a posição do corte.')
      return
    }

    const mainMat = (modelMesh!.material as THREE.MeshStandardMaterial).clone()
    mainMat.side = THREE.DoubleSide
    mainMat.needsUpdate = true
    const mainMesh = new THREE.Mesh(positive, mainMat)
    mainMesh.position.copy(modelMesh!.position)
    mainMesh.rotation.copy(modelMesh!.rotation)
    mainMesh.scale.copy(modelMesh!.scale)
    mainMesh.castShadow = true
    mainMesh.receiveShadow = true

    const partMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ff6600'),
      roughness: 0.55,
      metalness: 0.10,
      side: THREE.DoubleSide,
    })
    const partMesh = new THREE.Mesh(negative, partMat)
    partMesh.position.copy(modelMesh!.position)
    partMesh.rotation.copy(modelMesh!.rotation)
    partMesh.scale.copy(modelMesh!.scale)
    partMesh.castShadow = true
    partMesh.receiveShadow = true

    const geo = modelMesh!.geometry as THREE.BufferGeometry
    if (!geo.boundingBox) geo.computeBoundingBox()
    const bb = geo.boundingBox!
    const size = new THREE.Vector3()
    bb.getSize(size)
    const spread = Math.max(size.x, size.y, size.z) * 0.18
    partMesh.position.add(normal.clone().multiplyScalar(-spread))

    setModelMesh(mainMesh)

    if (modelInfo) {
      const newBb = positive.boundingBox
      const s = new THREE.Vector3()
      newBb?.getSize(s)
      setModelInfo({
        ...modelInfo,
        vertices: posCount,
        faces: Math.floor(posCount / 3),
        width:  newBb ? parseFloat(s.x.toFixed(2)) : modelInfo.width,
        height: newBb ? parseFloat(s.y.toFixed(2)) : modelInfo.height,
        depth:  newBb ? parseFloat(s.z.toFixed(2)) : modelInfo.depth,
      })
    }

    addCutPart({
      id: `plane-${Date.now()}`,
      name: `Metade ${cutParts.length + 1}`,
      mesh: partMesh,
      faceIndices: [],
      color: '#ff6600',
    })

    clearSelection()
    setStatus('loaded', statusMsg)
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  const outerStyle: React.CSSProperties = fixedPos
    ? { position: 'fixed', left: fixedPos.left, top: fixedPos.top }
    : { position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)' }

  return (
    <div
      ref={panelRef}
      className="z-20 animate-fade-in pointer-events-auto"
      style={outerStyle}
    >
      <div
        className="flex flex-col rounded-2xl border overflow-hidden"
        style={{
          background: 'oklch(0.09 0 0 / 97%)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          borderColor: 'oklch(0.18 0 0)',
          boxShadow: '0 8px 40px oklch(0 0 0 / 55%), inset 0 1px 0 oklch(1 0 0 / 4%)',
          minWidth: '280px',
          maxWidth: '300px',
        }}
      >
        {/* ── Barra de arrastar ─────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-3 py-2 select-none cursor-grab active:cursor-grabbing"
          style={{ borderBottom: 'none', background: 'oklch(0.11 0 0 / 80%)' }}
          onPointerDown={onHeaderPointerDown}
          onPointerMove={onHeaderPointerMove}
          onPointerUp={onHeaderPointerUp}
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-3 h-3" style={{ color: 'oklch(0.30 0 0)' }} />
            <div className="w-1 h-3.5 rounded-full"
              style={{ background: axisInfo.color, boxShadow: `0 0 6px ${axisInfo.glow}` }} />
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
              Ferramenta de Corte
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[7px] font-mono px-1.5 py-0.5 rounded-md"
              style={{ background: 'oklch(0.14 0 0)', color: 'oklch(0.40 0 0)' }}>
              watertight
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setMinimized(m => !m) }}
              className="w-5 h-5 flex items-center justify-center rounded-md hover:opacity-80 transition-opacity"
              style={{ background: 'oklch(0.16 0 0)', color: 'oklch(0.55 0 0)' }}
              title={minimized ? 'Expandir' : 'Minimizar'}
            >
              {minimized
                ? <ChevronUp className="w-3 h-3" />
                : <Minus className="w-3 h-3" />
              }
            </button>
          </div>
        </div>

        {/* ── Conteúdo (ocultado ao minimizar) ─────────────────────────────── */}
        {!minimized && (
          <div className="flex flex-col gap-2 p-2.5">
            {/* Toggle de modo: Plano Infinito | Placa de Corte */}
            <div className="flex gap-1">
              <button
                onClick={() => setPlaneCutMode('infinite')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 rounded-xl py-1.5 text-[9px] font-mono transition-all duration-150',
                  planeCutMode === 'infinite'
                    ? 'text-background font-semibold'
                    : 'border text-muted-foreground/50 hover:text-muted-foreground',
                )}
                style={
                  planeCutMode === 'infinite'
                    ? { background: 'oklch(0.45 0.12 250)', borderColor: 'transparent' }
                    : { borderColor: 'oklch(0.18 0 0)' }
                }
              >
                <InfinityIcon className="w-2.5 h-2.5" />
                Plano Infinito
              </button>
              <button
                onClick={() => {
                  setPlaneCutMode('plate')
                  initPlateFromModel()
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 rounded-xl py-1.5 text-[9px] font-mono transition-all duration-150',
                  planeCutMode === 'plate'
                    ? 'text-background font-semibold'
                    : 'border text-muted-foreground/50 hover:text-muted-foreground',
                )}
                style={
                  planeCutMode === 'plate'
                    ? { background: 'oklch(0.55 0.18 42)', borderColor: 'transparent', boxShadow: '0 0 10px oklch(0.55 0.18 42 / 40%)' }
                    : { borderColor: 'oklch(0.18 0 0)' }
                }
              >
                <Square className="w-2.5 h-2.5" />
                Placa de Limitação
              </button>
            </div>

            {/* ── Modo: Plano Infinito ─────────────────────────────────────────── */}
            {planeCutMode === 'infinite' && (
              <>
                {/* Seletor de eixo */}
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono uppercase tracking-widest w-7" style={{ color: 'oklch(0.35 0 0)' }}>
                    Eixo
                  </span>
                  <div className="flex gap-1 flex-1">
                    {AXES.map((ax) => (
                      <button
                        key={ax.id}
                        onClick={() => setCutPlaneAxis(ax.id)}
                        className={cn(
                          'flex-1 rounded-xl py-1 text-xs font-mono font-semibold transition-all duration-150',
                          cutPlaneAxis === ax.id
                            ? 'text-background'
                            : 'border text-muted-foreground/50 hover:text-muted-foreground',
                        )}
                        style={
                          cutPlaneAxis === ax.id
                            ? { background: ax.color, boxShadow: `0 0 10px ${ax.glow}`, borderColor: 'transparent' }
                            : { borderColor: 'oklch(0.18 0 0)' }
                        }
                        aria-pressed={cutPlaneAxis === ax.id}
                      >
                        {ax.label}
                      </button>
                    ))}
                  </div>
                </div>

                <MiniRuler
                  value={cutPlaneOffset}
                  onChange={setCutPlaneOffset}
                  modelSize={modelSizeMm}
                  axisColor={axisInfo.color}
                />

                <div className="flex items-center gap-1.5 pt-0.5">
                  <button
                    onClick={toggleCutPlaneFlip}
                    title="Inverte qual metade fica com o modelo principal"
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-mono transition-all duration-150',
                      cutPlaneFlip
                        ? 'text-background'
                        : 'border text-muted-foreground/50 hover:text-muted-foreground',
                    )}
                    style={
                      cutPlaneFlip
                        ? { background: 'oklch(0.45 0.05 250)', borderColor: 'transparent' }
                        : { borderColor: 'oklch(0.18 0 0)' }
                    }
                  >
                    <FlipHorizontal2 className="w-3 h-3" />
                    Inverter
                  </button>

                  <button
                    onClick={handleExecuteInfinite}
                    className="flex items-center justify-center gap-1.5 flex-1 px-3 py-1.5 rounded-xl text-[11px] font-mono font-semibold text-background hover:opacity-90 transition-all duration-150"
                    style={{ background: axisInfo.color, boxShadow: `0 0 14px ${axisInfo.glow}` }}
                  >
                    <Scissors className="w-3 h-3" />
                    Cortar
                  </button>
                </div>
              </>
            )}

            {/* ── Modo: Placa de Limitação ─────────────────────────────────────── */}
            {planeCutMode === 'plate' && (
              <>
                {/* Toggle Mover / Editar */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setPlateMoveMode(true)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[9px] font-mono font-semibold transition-all duration-150',
                      plateMoveMode
                        ? 'text-black'
                        : 'border text-muted-foreground/50 hover:text-muted-foreground',
                    )}
                    style={
                      plateMoveMode
                        ? { background: '#ff9900', borderColor: 'transparent', boxShadow: '0 0 12px #ff990066' }
                        : { borderColor: 'oklch(0.18 0 0)' }
                    }
                    title="Arraste a placa livremente na cena"
                  >
                    <Move className="w-3 h-3" />
                    Mover
                  </button>
                  <button
                    onClick={() => setPlateMoveMode(false)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[9px] font-mono font-semibold transition-all duration-150',
                      !plateMoveMode
                        ? 'text-background'
                        : 'border text-muted-foreground/50 hover:text-muted-foreground',
                    )}
                    style={
                      !plateMoveMode
                        ? { background: 'oklch(0.45 0.12 250)', borderColor: 'transparent', boxShadow: '0 0 10px oklch(0.45 0.12 250 / 40%)' }
                        : { borderColor: 'oklch(0.18 0 0)' }
                    }
                    title="Girar e redimensionar a placa"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Editar
                  </button>
                </div>

                {/* Dica contextual */}
                <div className="rounded-lg px-2.5 py-1.5 text-[8px] font-mono leading-relaxed"
                  style={{ background: 'oklch(0.12 0 0)', color: 'oklch(0.50 0 0)', border: '1px solid oklch(0.16 0 0)' }}>
                  {plateMoveMode
                    ? <>
                        <span style={{ color: '#ff9900' }}>●</span>{' '}
                        Arraste a placa <span style={{ color: 'oklch(0.65 0 0)' }}>ou</span>{' '}
                        <span style={{ color: '#ff9900' }}>clique em qualquer ponto da peça</span> para posicioná-la.
                      </>
                    : <><span style={{ color: 'oklch(0.70 0.18 42)' }}>●</span>{' '}
                        <span style={{ color: '#ff4444' }}>Setas</span> transladam ·{' '}
                        <span style={{ color: '#44ff88' }}>Arcos</span> rotacionam ·{' '}
                        <span style={{ color: '#ffaa00' }}>□</span> redimensionam</>
                  }
                </div>

                {/* Posição atual — visível em ambos os modos */}
                <div className="flex flex-col gap-1">
                  <span className="text-[7px] font-mono uppercase tracking-widest" style={{ color: 'oklch(0.35 0 0)' }}>
                    Posição (X · Y · Z)
                  </span>
                  <div className="flex gap-1 font-mono text-[8px] tabular-nums">
                    {plateCutPosition.map((v, i) => (
                      <span key={i} className="flex-1 rounded px-1 py-1 text-center"
                        style={{ background: 'oklch(0.12 0 0)', color: 'oklch(0.50 0 0)' }}>
                        {['X', 'Y', 'Z'][i]}: {v.toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dimensões e Rotação — só no modo Editar */}
                {!plateMoveMode && (
                  <>
                    {/* Dimensões */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[7px] font-mono uppercase tracking-widest" style={{ color: 'oklch(0.35 0 0)' }}>
                        Dimensões
                      </span>
                      <NumInput
                        label="Largura"
                        value={plateCutWidth}
                        onChange={w => setPlateCutSize(w, plateCutHeight)}
                      />
                      <NumInput
                        label="Altura"
                        value={plateCutHeight}
                        onChange={h => setPlateCutSize(plateCutWidth, h)}
                      />
                    </div>

                    {/* Rotação */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[7px] font-mono uppercase tracking-widest" style={{ color: 'oklch(0.35 0 0)' }}>
                        Rotação (graus)
                      </span>
                      {[
                        { label: 'X', color: '#ff3333', idx: 0 },
                        { label: 'Y', color: '#33dd55', idx: 1 },
                        { label: 'Z', color: '#3388ff', idx: 2 },
                      ].map(({ label, color, idx }) => (
                        <div key={label} className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-mono font-bold w-4" style={{ color }}>
                            {label}
                          </span>
                          <input
                            type="number"
                            value={parseFloat((plateCutRotation[idx] * (180 / Math.PI)).toFixed(1))}
                            step={1}
                            onChange={e => {
                              const deg = parseFloat(e.target.value)
                              if (isNaN(deg)) return
                              const rad = deg * (Math.PI / 180)
                              const next = [...plateCutRotation] as [number, number, number]
                              next[idx] = rad
                              setPlateCutRotation(next)
                            }}
                            className="flex-1 px-2 py-0.5 text-[10px] font-mono rounded-lg text-right"
                            style={{
                              background: 'oklch(0.12 0 0)',
                              border: `1px solid ${color}44`,
                              color: color,
                              outline: 'none',
                            }}
                          />
                          <span className="text-[8px] font-mono w-3" style={{ color: 'oklch(0.35 0 0)' }}>°</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Barreira ativa — informativo */}
                <div
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl"
                  style={{
                    background: 'oklch(0.13 0.04 145 / 80%)',
                    border: '1px solid oklch(0.28 0.10 145 / 60%)',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: 'oklch(0.72 0.20 145)', boxShadow: '0 0 6px oklch(0.72 0.20 145 / 70%)' }}
                  />
                  <span className="text-[9px] font-mono leading-relaxed" style={{ color: 'oklch(0.65 0.12 145)' }}>
                    Barreira ativa — o SmartCut nunca atravessa esta placa
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
