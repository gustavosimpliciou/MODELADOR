"use client"

/**
 * EncaixePanel — Gerar encaixe quadrado pino/furo em peças já cortadas
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import { Box, AlertTriangle, Loader2, X, GripHorizontal } from 'lucide-react'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'
import { analyzeSelection } from '@/lib/smart-autocut'
import { planEncaixe, applyEncaixe, type EncaixeSize } from '@/lib/encaixe'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/lang-store'
import { useDraggable } from '@/lib/use-draggable'

const TOLERANCES = [0.10, 0.15, 0.20, 0.25]

export function EncaixePanel() {
  const t = useT()
  const { pos, onHandleMouseDown } = useDraggable()

  const {
    encaixeOpen, setEncaixeOpen,
    modelMesh, selectedFaceIndices, selectionState,
    cutParts, setCutParts, addCutPart,
    setModelMesh, setStatus, pushHistory, clearSelection,
  } = useAppStore()

  type SizeId = 'xs' | 's' | 'm'
  const SIZES: { id: SizeId; label: string; desc: string }[] = [
    { id: 'xs', label: t.size_xs_label, desc: t.size_xs_desc },
    { id: 's',  label: t.size_s_label,  desc: t.size_s_desc },
    { id: 'm',  label: t.size_m_label,  desc: t.size_m_desc },
  ]

  const [size, setSize] = useState<EncaixeSize>('s')
  const [tolerance, setTolerance] = useState(0.15)
  const [busy, setBusy] = useState(false)
  const computeRef = useRef(0)

  const hasSelection = selectedFaceIndices.size > 0 && selectionState === 'selected'
  const visible = encaixeOpen && !!modelMesh

  const plan = useMemo(() => {
    if (!visible || !modelMesh || !hasSelection) return null
    try {
      return planEncaixe(
        modelMesh.geometry as THREE.BufferGeometry,
        selectedFaceIndices,
        cutParts,
        { size, tolerance },
      )
    } catch { return null }
  }, [visible, modelMesh, selectedFaceIndices, cutParts, size, tolerance])

  const handleApply = useCallback(() => {
    if (!modelMesh || !plan) return
    const myVersion = ++computeRef.current
    setBusy(true)

    const hasComplement = plan.complementIndex >= 0
    setStatus('cutting',
      hasComplement
        ? 'Gerando encaixe — furando peça atual e peça removida...'
        : 'Gerando encaixe — furando peça selecionada...',
    )

    setTimeout(() => {
      if (myVersion !== computeRef.current) { setBusy(false); return }
      try {
        pushHistory()
        const complementPart = hasComplement ? cutParts[plan.complementIndex] : null
        const { sourceGeo, complementGeo, pegGeo, pegPosition, pegQuaternion } =
          applyEncaixe(modelMesh, complementPart?.mesh ?? null, plan)

        const newSourceMesh = new THREE.Mesh(sourceGeo, (modelMesh.material as THREE.Material).clone())
        newSourceMesh.castShadow = true
        newSourceMesh.receiveShadow = true
        newSourceMesh.position.copy(modelMesh.position)
        newSourceMesh.rotation.copy(modelMesh.rotation)
        newSourceMesh.scale.copy(modelMesh.scale)
        newSourceMesh.userData = { ...modelMesh.userData }
        setModelMesh(newSourceMesh)

        if (complementPart && complementGeo) {
          const newCompMesh = new THREE.Mesh(complementGeo, complementPart.mesh.material)
          newCompMesh.castShadow = true
          newCompMesh.receiveShadow = true
          newCompMesh.position.copy(complementPart.mesh.position)
          newCompMesh.rotation.copy(complementPart.mesh.rotation)
          newCompMesh.scale.copy(complementPart.mesh.scale)
          newCompMesh.userData = { ...complementPart.mesh.userData }
          const updatedParts = cutParts.map((cp, i) => i === plan.complementIndex ? { ...cp, mesh: newCompMesh } : cp)
          setCutParts(updatedParts)
        }

        const pegM = new THREE.Matrix4().compose(pegPosition, pegQuaternion, new THREE.Vector3(1, 1, 1))
        pegGeo.applyMatrix4(pegM)
        pegGeo.computeVertexNormals()

        const pegMat = new THREE.MeshStandardMaterial({ color: '#c8ccd4', roughness: 0.3, metalness: 0.55, side: THREE.DoubleSide })
        const pegMesh = new THREE.Mesh(pegGeo, pegMat)
        pegMesh.castShadow = true
        pegMesh.receiveShadow = true
        pegMesh.position.copy(modelMesh.position)
        pegMesh.rotation.copy(modelMesh.rotation)
        pegMesh.scale.copy(modelMesh.scale)

        addCutPart({
          id: `encaixe-pino-${Date.now()}`,
          name: `Pino (${plan.side.toFixed(1)}×${plan.side.toFixed(1)})`,
          mesh: pegMesh, faceIndices: [], color: '#c8ccd4', isConnector: true,
        })

        clearSelection()
        setEncaixeOpen(false)
        setStatus('loaded',
          hasComplement
            ? `Encaixe gerado · pino ${plan.side.toFixed(1)}×${plan.depth.toFixed(1)}mm`
            : `Encaixe gerado · pino ${plan.side.toFixed(1)}×${plan.depth.toFixed(1)}mm`,
        )
      } catch (err) {
        setStatus('error', 'Falha ao gerar encaixe. Tente nova seleção.')
        console.error('[Encaixe] Erro:', err)
      } finally { setBusy(false) }
    }, 60)
  }, [modelMesh, plan, cutParts, pushHistory, setModelMesh, setCutParts, addCutPart, setStatus, clearSelection, setEncaixeOpen])

  if (!visible) return null

  const sizeLabel = plan ? `${plan.side.toFixed(1)} × ${plan.side.toFixed(1)} × ${plan.depth.toFixed(1)} mm` : '—'

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
          title="Arraste para mover"
        >
          <GripHorizontal className="w-3 h-3 shrink-0 text-muted-foreground/30" />
          <Box className="w-3 h-3 shrink-0" style={{ color: 'oklch(0.65 0.18 260)' }} />
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex-1">
            {t.encaixe_title}
          </span>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setEncaixeOpen(false)}
            className="p-0.5 rounded text-muted-foreground/50 hover:text-foreground hover:bg-secondary/50 transition-colors"
            title="Fechar"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Pin size */}
        <div className="flex flex-col gap-1 rounded-lg border border-border/60 p-1.5">
          <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">
            {t.pin_size_label}
          </span>
          <div className="flex gap-0.5">
            {SIZES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSize(s.id)}
                title={s.desc}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 rounded py-1 transition-all',
                  size === s.id ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground',
                )}
                style={size === s.id ? { background: 'oklch(0.55 0.15 260)' } : undefined}
              >
                <span className="text-[10px] font-mono font-medium">{s.label}</span>
                <span className="text-[7px] font-mono opacity-70">{s.desc}</span>
              </button>
            ))}
          </div>
          {plan && (
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="text-[8px] font-mono text-muted-foreground/50">{t.pin_suffix}</span>
              <span className="text-[8px] font-mono" style={{ color: 'oklch(0.75 0.12 260)' }}>{sizeLabel}</span>
            </div>
          )}
        </div>

        {/* Tolerance */}
        <div className="flex flex-col gap-1 rounded-lg border border-border/60 p-1.5">
          <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">
            {t.hole_clearance_label}
          </span>
          <div className="flex gap-0.5">
            {TOLERANCES.map((tol) => (
              <button
                key={tol}
                onClick={() => setTolerance(tol)}
                className={cn(
                  'flex-1 rounded py-0.5 text-[9px] font-mono transition-all',
                  tolerance === tol ? 'text-background' : 'border border-border text-muted-foreground hover:text-foreground',
                )}
                style={tolerance === tol ? { background: 'oklch(0.55 0.15 260)' } : undefined}
              >
                {tol.toFixed(2)}
              </button>
            ))}
          </div>
        </div>

        {/* Plan info */}
        {!hasSelection ? (
          <div className="flex items-start gap-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-1">
            <AlertTriangle className="w-2.5 h-2.5 mt-0.5 shrink-0 text-yellow-400" />
            <span className="text-[8px] font-mono text-yellow-200/70 leading-relaxed">{t.select_faces_hint}</span>
          </div>
        ) : plan ? (
          <div className="flex flex-col gap-0.5 rounded-lg px-2 py-1.5" style={{ background: 'oklch(0.55 0.15 260 / 10%)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono text-muted-foreground/50">{t.hole_in}</span>
              <span className="text-[8px] font-mono text-foreground/70">{t.piece_current}</span>
            </div>
            {plan.complementIndex >= 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono text-muted-foreground/50">{t.hole_also_in}</span>
                <span className="text-[8px] font-mono" style={{ color: 'oklch(0.75 0.15 260)' }}>{plan.complementName}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono text-muted-foreground/50">{t.hole_also_in}</span>
                <span className="text-[8px] font-mono text-muted-foreground/40 italic">{t.no_complement}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-1">
            <AlertTriangle className="w-2.5 h-2.5 mt-0.5 shrink-0 text-yellow-400" />
            <span className="text-[8px] font-mono text-yellow-200/70 leading-relaxed">{t.analysis_error}</span>
          </div>
        )}

        {/* Apply button */}
        <button
          onClick={handleApply}
          disabled={busy || !plan}
          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-mono font-medium text-background hover:opacity-90 transition-all disabled:opacity-50"
          style={{ background: 'oklch(0.55 0.15 260)' }}
        >
          {busy
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{t.generating_enc}</>
            : <><Box className="w-3.5 h-3.5" />{t.apply_encaixe}</>}
        </button>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[7px] font-mono text-muted-foreground/40">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-sm bg-gray-400" />{t.legend_hole_in}</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-sm" style={{ background: 'oklch(0.65 0.18 260)' }} />{t.legend_pin_loose}</span>
        </div>
      </div>
    </div>
  )
}
