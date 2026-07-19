"use client"

import { memo, useRef, useEffect, useMemo } from 'react'
import { invalidate } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'
import type { Part } from '@/lib/parts-manager'
import { planeFromAxisOffset } from '@/lib/solid-plane-cut'
import { CutPreviewOverlay } from './cut-preview-overlay'

// Geometrias de plano pré-alocadas fora do ciclo de render — reutilizadas por
// todas as instâncias de preview, evitando criação de objeto a cada render.
const _PLANE_GEO_CACHE = new Map<number, THREE.PlaneGeometry>()
function getPlaneGeo(size: number): THREE.PlaneGeometry {
  // Arredonda para 2 casas decimais para maximizar cache hits
  const key = Math.round(size * 100)
  let geo = _PLANE_GEO_CACHE.get(key)
  if (!geo) {
    geo = new THREE.PlaneGeometry(size, size)
    _PLANE_GEO_CACHE.set(key, geo)
  }
  return geo
}

/**
 * Verdadeiro quando o CutPreviewOverlay está exibindo geometria de peça
 * (casca, tampas ou preview legado) — nesses casos o modelo original e as
 * peças já cortadas devem ficar ocultos para não sobrepor o overlay.
 * No modo 'plane' o overlay mostra apenas a linha de corte, então o
 * modelo permanece visível.
 */
function useCutOverlayActive() {
  const cutPreview = useAppStore((s) => s.cutPreview)
  const openCutData = useAppStore((s) => s.openCutData)
  const autoCutPreviewMode = useAppStore((s) => s.autoCutPreviewMode)
  const autoCutPipelineStage = useAppStore((s) => s.autoCutPipelineStage)

  const showShell = autoCutPreviewMode === 'shell' && autoCutPipelineStage !== 'idle' && !!openCutData
  const showCaps =
    (autoCutPreviewMode === 'caps' || autoCutPreviewMode === 'connectors' || autoCutPreviewMode === 'final') &&
    !!cutPreview
  const legacyMode = autoCutPipelineStage === 'idle' && !!cutPreview

  return showShell || showCaps || legacyMode
}

export function ModelRenderer() {
  const parts = useAppStore((s) => s.parts)
  const activePartId = useAppStore((s) => s.activePartId)
  const modelMesh = useAppStore((s) => s.modelMesh)

  if (parts.length === 0 && !modelMesh) return null

  return (
    <group>
      {parts.map((part) => (
        <PartMesh
          key={part.id}
          part={part}
          isActive={part.id === activePartId}
          isolate={activePartId !== null}
        />
      ))}
      {/* Previews operate on modelMesh (always the active part's mesh) */}
      {modelMesh && <PlaneCutPreview mesh={modelMesh} />}
      {modelMesh && <AutoSplitPreview mesh={modelMesh} />}
      {modelMesh && <AutoCutPreview mesh={modelMesh} />}
      {/* Preview interativo do corte (sobrepõe o modelo quando ativo) */}
      <CutPreviewOverlay />
    </group>
  )
}

// ── PartMesh ─────────────────────────────────────────────────────────────────

interface PartMeshProps {
  part: Part
  isActive: boolean
  /** When true, only the active part is visible (isolation mode). */
  isolate: boolean
}

const PartMesh = memo(function PartMesh({ part, isActive, isolate }: PartMeshProps) {
  const overlayActive = useCutOverlayActive()
  const { showWireframe } = useAppStore()

  // Visibility rules:
  // 1. If overlay is active, hide everything (CutPreviewOverlay replaces the view)
  // 2. If in isolation mode and this is not the active part → hidden
  // 3. Respect the part's own visibility flag
  const visible = !overlayActive && (!isolate || isActive) && part.visible

  // Sync visibility directly on the underlying Three.js object so raycasters
  // (which bypass React props and read the object directly) always see the
  // correct flag.  matrixWorld is kept current by R3F because the object is
  // actually in the scene graph via <primitive>.
  useEffect(() => {
    part.mesh.visible = visible
    invalidate()
  }, [part.mesh, visible])

  useEffect(() => { invalidate() }, [showWireframe])

  // Use <primitive> so part.mesh IS the actual scene object.
  // This is critical: raycaster.intersectObject(modelMesh) uses matrixWorld,
  // which Three.js only updates for objects that live in the scene graph.
  // With a separate <mesh geometry={...}> the store's modelMesh reference is
  // never in the scene, so its matrixWorld stays at identity regardless of
  // any transforms — causing mismatched raycasts.
  return (
    <primitive object={part.mesh} visible={visible} castShadow receiveShadow>
      {/* Active part highlight overlay (wireframe tint).
          geometry compartilhada — filho herda matrixWorld correto via primitive. */}
      {isActive && visible && (
        <mesh geometry={part.mesh.geometry}>
          <meshBasicMaterial
            color="#ffffff"
            wireframe
            transparent
            opacity={0.06}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
            depthWrite={false}
          />
        </mesh>
      )}
    </primitive>
  )
})

// ── Plano de corte AutoCut ────────────────────────────────────────────────────

function AutoCutPreview({ mesh }: { mesh: THREE.Mesh }) {
  const preview = useAppStore((s) => s.autoCutPreview)
  const overlayActive = useCutOverlayActive()

  const data = useMemo(() => {
    if (!preview || overlayActive) return null
    const geo = mesh.geometry as THREE.BufferGeometry
    if (!geo.boundingBox) geo.computeBoundingBox()
    const size = new THREE.Vector3()
    geo.boundingBox!.getSize(size)
    const diag = Math.max(size.x, size.y, size.z) * 1.35 || 1
    const normal = new THREE.Vector3(preview.normal[0], preview.normal[1], preview.normal[2]).normalize()
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
    const point = new THREE.Vector3(preview.point[0], preview.point[1], preview.point[2])
    return { point, quat, diag }
  }, [preview, mesh, overlayActive])

  useEffect(() => { invalidate() }, [data])
  if (!data) return null

  return (
    <group
      position={data.point.toArray()}
      quaternion={data.quat.toArray() as [number, number, number, number]}
    >
      <mesh renderOrder={999}>
        <planeGeometry args={[data.diag, data.diag]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments renderOrder={1000}>
        <primitive object={new THREE.EdgesGeometry(getPlaneGeo(data.diag))} attach="geometry" />
        <lineBasicMaterial color="#ff6600" transparent opacity={0.85} depthTest={false} />
      </lineSegments>
    </group>
  )
}

// ── Preview do plano de corte ─────────────────────────────────────────────────

function PlaneCutPreview({ mesh }: { mesh: THREE.Mesh }) {
  const { cutPlaneAxis, cutPlaneOffset, cutPlaneFlip, activeTool } = useAppStore()
  const overlayActive = useCutOverlayActive()

  const data = useMemo(() => {
    if (activeTool !== 'cut' || overlayActive) return null
    const geo = mesh.geometry as THREE.BufferGeometry
    if (!geo.boundingBox) geo.computeBoundingBox()
    const bb = geo.boundingBox!
    const size = new THREE.Vector3()
    bb.getSize(size)
    const diag = Math.max(size.x, size.y, size.z) * 1.35 || 1
    const { normal, point } = planeFromAxisOffset(bb, cutPlaneAxis, cutPlaneOffset, cutPlaneFlip)
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
    return { point, quat, diag }
  }, [activeTool, mesh, cutPlaneAxis, cutPlaneOffset, cutPlaneFlip, overlayActive])

  useEffect(() => { invalidate() }, [data])
  if (!data) return null

  return (
    <group
      position={data.point.toArray()}
      quaternion={data.quat.toArray() as [number, number, number, number]}
    >
      <mesh renderOrder={2}>
        <planeGeometry args={[data.diag, data.diag]} />
        <meshBasicMaterial color={0x4488ff} transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments renderOrder={3}>
        <primitive object={new THREE.EdgesGeometry(getPlaneGeo(data.diag))} attach="geometry" />
        <lineBasicMaterial color={0x4488ff} transparent opacity={0.7} depthTest={false} />
      </lineSegments>
    </group>
  )
}

// ── Preview dos planos de divisão automática ──────────────────────────────────

function AutoSplitPreview({ mesh }: { mesh: THREE.Mesh }) {
  const { autoSplitPlan, activeTool } = useAppStore()
  const overlayActive = useCutOverlayActive()

  const cuts = useMemo(() => {
    if (activeTool !== 'autosplit' || !autoSplitPlan || overlayActive) return []
    const geo = mesh.geometry as THREE.BufferGeometry
    if (!geo.boundingBox) geo.computeBoundingBox()
    const size = new THREE.Vector3()
    geo.boundingBox!.getSize(size)
    const diag = Math.max(size.x, size.y, size.z) * 1.35 || 1

    const planNormal = new THREE.Vector3(...autoSplitPlan.normal)
    return autoSplitPlan.cuts.map((cut) => {
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), planNormal)
      const point = new THREE.Vector3(...cut.center)
      return { point, quat, diag }
    })
  }, [activeTool, mesh, autoSplitPlan, overlayActive])

  useEffect(() => { invalidate() }, [cuts])
  if (cuts.length === 0) return null

  return (
    <>
      {cuts.map((c, i) => (
        <group key={i} position={c.point.toArray()} quaternion={c.quat.toArray() as [number, number, number, number]}>
          <mesh renderOrder={2}>
            <planeGeometry args={[c.diag, c.diag]} />
            <meshBasicMaterial color={0x44cc88} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <lineSegments renderOrder={3}>
            <primitive object={new THREE.EdgesGeometry(getPlaneGeo(c.diag))} attach="geometry" />
            <lineBasicMaterial color={0x44cc88} transparent opacity={0.7} depthTest={false} />
          </lineSegments>
        </group>
      ))}
    </>
  )
}
