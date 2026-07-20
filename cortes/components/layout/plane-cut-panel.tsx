"use client"

import { useMemo, useRef, useCallback } from 'react'
import { Scissors, FlipHorizontal2 } from 'lucide-react'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'
import { solidPlaneCut, planeFromAxisOffset, type PlaneAxis } from '@/lib/solid-plane-cut'
import { cn } from '@/lib/utils'

const AXES: { id: PlaneAxis; label: string; color: string; glow: string }[] = [
  { id: 'x', label: 'X', color: 'oklch(0.65 0.22 25)',  glow: 'oklch(0.65 0.22 25 / 35%)' },
  { id: 'y', label: 'Y', color: 'oklch(0.72 0.20 145)', glow: 'oklch(0.72 0.20 145 / 35%)' },
  { id: 'z', label: 'Z', color: 'oklch(0.65 0.20 250)', glow: 'oklch(0.65 0.20 250 / 35%)' },
]

const RULER_TICKS = 20 // divisões da régua

// ─── Mini Régua ──────────────────────────────────────────────────────────────

interface RulerProps {
  value: number // 0..1
  onChange: (v: number) => void
  modelSize: number // mm — comprimento total no eixo
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
  const tickSpacing = 1 / RULER_TICKS

  return (
    <div className="flex flex-col gap-1 select-none">
      {/* Rótulo + valor */}
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: 'oklch(0.40 0 0)' }}>
          Posição do corte
        </span>
        <span className="text-[10px] font-mono tabular-nums font-medium" style={{ color: axisColor }}>
          {mmValue} mm
        </span>
      </div>

      {/* Trilho da régua */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="relative h-8 rounded-lg cursor-col-resize"
        style={{
          background: 'oklch(0.12 0 0)',
          border: '1px solid oklch(0.20 0 0)',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* Graduações */}
        {Array.from({ length: RULER_TICKS + 1 }).map((_, i) => {
          const pos = i / RULER_TICKS
          const isMajor = i % 5 === 0
          return (
            <div
              key={i}
              className="absolute top-0 w-px"
              style={{
                left: `${pos * 100}%`,
                height: isMajor ? '60%' : '35%',
                background: isMajor ? 'oklch(0.32 0 0)' : 'oklch(0.22 0 0)',
              }}
            />
          )
        })}

        {/* Label de MM nos maiores */}
        {Array.from({ length: 5 }).map((_, i) => {
          const pos = (i / 4) * 100
          const mm = ((i / 4) * mmTotal).toFixed(0)
          return (
            <span
              key={i}
              className="absolute bottom-0.5 font-mono text-[6px] -translate-x-1/2"
              style={{ left: `${pos}%`, color: 'oklch(0.30 0 0)', userSelect: 'none' }}
            >
              {mm}
            </span>
          )
        })}

        {/* Cursor / thumb */}
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none"
          style={{ left: `${value * 100}%`, transform: 'translateX(-50%)' }}
        >
          {/* Linha */}
          <div
            className="w-0.5 flex-1 rounded-full"
            style={{ background: axisColor, boxShadow: `0 0 6px ${axisColor}` }}
          />
          {/* Triângulo inferior */}
          <svg width="8" height="5" viewBox="0 0 8 5" className="shrink-0">
            <polygon points="4,0 8,5 0,5" fill={axisColor} />
          </svg>
        </div>
      </div>

      {/* Barra de progresso fina */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-0.5 rounded-full" style={{ background: 'oklch(0.14 0 0)' }}>
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{ width: `${value * 100}%`, background: axisColor }}
          />
        </div>
        <span className="text-[8px] font-mono tabular-nums" style={{ color: 'oklch(0.35 0 0)' }}>
          {Math.round(value * 100)}%
        </span>
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
  } = useAppStore()

  // Tamanho do modelo no eixo selecionado para a régua — deve estar antes de qualquer return
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

  const handleExecute = () => {
    if (!modelMesh) return
    pushHistory()
    setStatus('cutting', 'Executando corte de sólido (watertight)...')

    // rAF para não travar o frame corrente
    requestAnimationFrame(() => setTimeout(() => {
      const geo = modelMesh.geometry as THREE.BufferGeometry
      if (!geo.boundingBox) geo.computeBoundingBox()
      const bbox = geo.boundingBox!

      const { normal, point } = planeFromAxisOffset(bbox, cutPlaneAxis, cutPlaneOffset, cutPlaneFlip)

      let result
      try {
        result = solidPlaneCut(geo, normal, point)
      } catch (err) {
        console.error('[PlaneCut] Erro no corte de sólido:', err)
        setStatus('error', 'Falha ao cortar o sólido.')
        return
      }

      const { positive, negative, capLoops, capTriangles } = result
      const posCount = positive.getAttribute('position')?.count ?? 0
      const negCount = negative.getAttribute('position')?.count ?? 0

      if (posCount === 0 || negCount === 0) {
        setStatus('error', 'O plano não intercepta o modelo. Ajuste a posição do corte.')
        return
      }

      const mainMat = (modelMesh.material as THREE.MeshStandardMaterial).clone()
      mainMat.side = THREE.DoubleSide
      mainMat.needsUpdate = true
      const mainMesh = new THREE.Mesh(positive, mainMat)
      mainMesh.position.copy(modelMesh.position)
      mainMesh.rotation.copy(modelMesh.rotation)
      mainMesh.scale.copy(modelMesh.scale)
      mainMesh.castShadow = true
      mainMesh.receiveShadow = true

      const partMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ff6600'),
        roughness: 0.55,
        metalness: 0.10,
        side: THREE.DoubleSide,
      })
      const partMesh = new THREE.Mesh(negative, partMat)
      partMesh.position.copy(modelMesh.position)
      partMesh.rotation.copy(modelMesh.rotation)
      partMesh.scale.copy(modelMesh.scale)
      partMesh.castShadow = true
      partMesh.receiveShadow = true

      const size = new THREE.Vector3()
      bbox.getSize(size)
      const spread = Math.max(size.x, size.y, size.z) * 0.18
      partMesh.position.add(normal.clone().multiplyScalar(-spread))

      setModelMesh(mainMesh)

      if (modelInfo) {
        const bb = positive.boundingBox
        const s = new THREE.Vector3()
        bb?.getSize(s)
        setModelInfo({
          ...modelInfo,
          vertices: posCount,
          faces: Math.floor(posCount / 3),
          width:  bb ? parseFloat(s.x.toFixed(2)) : modelInfo.width,
          height: bb ? parseFloat(s.y.toFixed(2)) : modelInfo.height,
          depth:  bb ? parseFloat(s.z.toFixed(2)) : modelInfo.depth,
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
      setStatus('loaded',
        `Corte concluído — 2 peças fechadas · ${capLoops} contorno(s) · ${capTriangles.toLocaleString()} triângulos de tampa`,
      )
    }, 20))
  }

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-fade-in pointer-events-auto">
      <div
        className="flex flex-col gap-3 p-3.5 rounded-2xl border"
        style={{
          background: 'oklch(0.09 0 0 / 97%)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          borderColor: 'oklch(0.18 0 0)',
          boxShadow: '0 8px 40px oklch(0 0 0 / 55%), inset 0 1px 0 oklch(1 0 0 / 4%)',
          minWidth: '340px',
        }}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-4 rounded-full"
              style={{ background: axisInfo.color, boxShadow: `0 0 8px ${axisInfo.glow}` }}
            />
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Corte por plano
            </span>
          </div>
          <span
            className="text-[8px] font-mono px-1.5 py-0.5 rounded-md"
            style={{ background: 'oklch(0.14 0 0)', color: 'oklch(0.40 0 0)' }}
          >
            watertight
          </span>
        </div>

        {/* Seletor de eixo */}
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono uppercase tracking-widest w-8" style={{ color: 'oklch(0.35 0 0)' }}>
            Eixo
          </span>
          <div className="flex gap-1 flex-1">
            {AXES.map((ax) => (
              <button
                key={ax.id}
                onClick={() => setCutPlaneAxis(ax.id)}
                className={cn(
                  'flex-1 rounded-xl py-1.5 text-xs font-mono font-semibold transition-all duration-150',
                  cutPlaneAxis === ax.id
                    ? 'text-background'
                    : 'border text-muted-foreground/50 hover:text-muted-foreground',
                )}
                style={
                  cutPlaneAxis === ax.id
                    ? { background: ax.color, boxShadow: `0 0 12px ${ax.glow}`, borderColor: 'transparent' }
                    : { borderColor: 'oklch(0.18 0 0)' }
                }
                aria-pressed={cutPlaneAxis === ax.id}
              >
                {ax.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mini Régua */}
        <MiniRuler
          value={cutPlaneOffset}
          onChange={setCutPlaneOffset}
          modelSize={modelSizeMm}
          axisColor={axisInfo.color}
        />

        {/* Ações */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={toggleCutPlaneFlip}
            title="Inverte qual metade fica com o modelo principal"
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-mono transition-all duration-150',
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
            <FlipHorizontal2 className="w-3.5 h-3.5" />
            Inverter
          </button>

          <button
            onClick={handleExecute}
            className="flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-xl text-[12px] font-mono font-semibold text-background hover:opacity-90 transition-all duration-150"
            style={{
              background: axisInfo.color,
              boxShadow: `0 0 16px ${axisInfo.glow}`,
            }}
          >
            <Scissors className="w-3.5 h-3.5" />
            Executar corte
          </button>
        </div>
      </div>
    </div>
  )
}
