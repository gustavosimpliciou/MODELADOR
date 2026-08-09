"use client"

/**
 * EncaixeGizmo — Gizmo 3D do encaixe circular integrado macho/fêmea.
 *
 * Aparece no centro da costura da seleção, orientado pela normal da
 * superfície. Handles arrastáveis:
 *   - anel/esfera na borda → diâmetro (limitado por maxRadius);
 *   - esfera no topo do eixo → altura (limitada por maxHeight);
 *   - esfera central → reposicionar no plano da costura.
 *
 * O preview é 100% visual (cilindros translúcidos); a geometria real
 * só é gerada via CSG quando o usuário confirma no painel.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useAppStore } from '@/lib/store'

const COL = {
  male: '#2fd6b0',
  female: '#ff8a3d',
  maxRing: '#ff4757',
  axis: '#ffffff',
  center: '#ffd54a',
  seam: 'rgba(255,255,255,0.85)',
}

const HEIGHT_MIN = 3
const RADIUS_MIN = 0.8
const CYL_SEG = 48

type DragType = 'center' | 'radius' | 'height'

interface DragState {
  type: DragType
  plane: THREE.Plane
  startHitLocal: THREE.Vector3
  startRadius: number
  startHeight: number
  startCenter: THREE.Vector3
  groupInv: THREE.Matrix4
  dirLocal: THREE.Vector3
  u: THREE.Vector3
  v: THREE.Vector3
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

export function EncaixeGizmo() {
  const preview = useAppStore((s) => s.encaixePreview)
  const modelMesh = useAppStore((s) => s.modelMesh)
  const setEncaixeDragging = useAppStore((s) => s.setEncaixeDragging)
  const patch = useAppStore((s) => s.patchEncaixePreview)

  const { camera, gl } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const dragRef = useRef<DragState | null>(null)
  const handleScaleRef = useRef(1)

  // Refs para os handlers de janela enxergarem o estado mais recente
  const patchRef = useRef(patch)
  patchRef.current = patch
  const previewRef = useRef(preview)
  previewRef.current = preview
  const cameraRef = useRef(camera)
  cameraRef.current = camera
  const glRef = useRef(gl)
  glRef.current = gl

  const visible = !!preview && !!modelMesh

  const dirLocal = useMemo(
    () => preview
      ? new THREE.Vector3(...preview.normal).multiplyScalar(preview.inverted ? -1 : 1).normalize()
      : new THREE.Vector3(0, 0, 1),
    [preview],
  )
  const u = useMemo(() => preview ? new THREE.Vector3(...preview.planeU).normalize() : new THREE.Vector3(1, 0, 0), [preview])
  const v = useMemo(() => preview ? new THREE.Vector3(...preview.planeV).normalize() : new THREE.Vector3(0, 1, 0), [preview])

  const seamCenter = useMemo(
    () => preview ? new THREE.Vector3(...preview.seamCenter) : new THREE.Vector3(),
    [preview],
  )
  const center = useMemo(
    () => preview ? new THREE.Vector3(...preview.center) : new THREE.Vector3(),
    [preview],
  )

  // Escala dos handles proporcional à distância câmera→centro
  useFrame(() => {
    const p = previewRef.current
    if (!p) return
    const worldC = center.clone().applyMatrix4(groupRef.current?.matrixWorld ?? new THREE.Matrix4())
    const dist = cameraRef.current.position.distanceTo(worldC)
    handleScaleRef.current = Math.max(0.2, dist * 0.055)
  })

  const getWorldRay = useCallback((clientX: number, clientY: number) => {
    const rect = glRef.current.domElement.getBoundingClientRect()
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(ndc, cameraRef.current)
    return raycaster.ray
  }, [])

  const beginDrag = useCallback(
    (type: DragType, e: ThreeEvent<PointerEvent>) => {
      const p = previewRef.current
      if (!p) return
      e.stopPropagation()
      const ray = getWorldRay(e.nativeEvent.clientX, e.nativeEvent.clientY)
      const planeNormal = cameraRef.current.getWorldDirection(new THREE.Vector3()).negate()
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, e.point.clone())
      const hit = new THREE.Vector3()
      if (!ray.intersectPlane(plane, hit)) return

      const inv = groupRef.current?.matrixWorld.clone().invert() ?? new THREE.Matrix4()
      dragRef.current = {
        type,
        plane,
        startHitLocal: hit.clone().applyMatrix4(inv),
        startRadius: p.radius,
        startHeight: p.height,
        startCenter: new THREE.Vector3(...p.center),
        groupInv: inv,
        dirLocal: new THREE.Vector3(...p.normal).multiplyScalar(p.inverted ? -1 : 1).normalize(),
        u: new THREE.Vector3(...p.planeU).normalize(),
        v: new THREE.Vector3(...p.planeV).normalize(),
      }
      setEncaixeDragging(true)
    },
    [getWorldRay, setEncaixeDragging],
  )

  useEffect(() => {
    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current
      const p = previewRef.current
      if (!d || !p) return
      const ray = getWorldRay(ev.clientX, ev.clientY)
      const hit = new THREE.Vector3()
      if (!ray.intersectPlane(d.plane, hit)) return
      const local = hit.applyMatrix4(d.groupInv)

      if (d.type === 'radius') {
        const rel = local.clone().sub(d.startCenter)
        const rad = Math.hypot(rel.dot(d.u), rel.dot(d.v))
        patchRef.current({ radius: clamp(rad, Math.min(RADIUS_MIN, p.maxRadius), p.maxRadius) })
      } else if (d.type === 'height') {
        const h = d.startHeight + local.clone().sub(d.startCenter).dot(d.dirLocal)
        patchRef.current({ height: clamp(h, HEIGHT_MIN, p.maxHeight) })
      } else if (d.type === 'center') {
        const delta = local.clone().sub(d.startHitLocal)
        const du = delta.dot(d.u)
        const dv = delta.dot(d.v)
        const next = d.startCenter.clone().addScaledVector(d.u, du).addScaledVector(d.v, dv)
        // Mantém o círculo dentro da região permitida (maxRadius ao redor da costura)
        const rel = next.clone().sub(seamCenter)
        const limit = Math.max(0, p.maxRadius - p.radius)
        if (rel.lengthSq() > limit * limit) {
          rel.setLength(limit)
          next.copy(seamCenter).add(rel)
        }
        patchRef.current({ center: [next.x, next.y, next.z] })
      }
    }
    const onUp = () => {
      if (dragRef.current) setEncaixeDragging(false)
      dragRef.current = null
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [getWorldRay, setEncaixeDragging, seamCenter])

  if (!visible) return null

  const s = handleScaleRef.current
  const { radius, height, tolerance, maxRadius, maxHeight } = preview!
  const femaleDepth = Math.min(height + tolerance + 1, maxHeight + tolerance + 1)
  const atLimit = radius >= maxRadius * 0.98
  const quatY = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirLocal)
  const quatZ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dirLocal)

  const radiusKnob = center.clone().addScaledVector(u, radius)
  const heightKnob = center.clone().addScaledVector(dirLocal, height)

  return (
    <group
      ref={groupRef}
      position={modelMesh!.position.toArray()}
      quaternion={modelMesh!.quaternion.toArray() as [number, number, number, number]}
      scale={modelMesh!.scale.toArray()}
    >
      {/* ── Preview do MACHO (boss integrado) ─────────────────────────────── */}
      <mesh position={center.clone().addScaledVector(dirLocal, height / 2).toArray()} quaternion={quatY.toArray() as [number, number, number, number]}>
        <cylinderGeometry args={[radius, radius, height, CYL_SEG, 1, true]} />
        <meshBasicMaterial color={COL.male} transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* ── Preview da FÊMEA (cavidade) ───────────────────────────────────── */}
      <mesh position={center.clone().addScaledVector(dirLocal, femaleDepth / 2).toArray()} quaternion={quatY.toArray() as [number, number, number, number]}>
        <cylinderGeometry args={[radius + tolerance, radius + tolerance, femaleDepth, CYL_SEG, 1, true]} />
        <meshBasicMaterial color={COL.female} transparent opacity={0.32} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* ── Eixo ──────────────────────────────────────────────────────────── */}
      <mesh position={center.clone().addScaledVector(dirLocal, height / 2).toArray()} quaternion={quatY.toArray() as [number, number, number, number]}>
        <cylinderGeometry args={[s * 0.05, s * 0.05, height, 6, 1, true]} />
        <meshBasicMaterial color={COL.axis} transparent opacity={0.55} depthWrite={false} />
      </mesh>

      {/* ── Disco da base (boca do encaixe) ───────────────────────────────── */}
      <mesh position={center.toArray()} quaternion={quatZ.toArray() as [number, number, number, number]}>
        <circleGeometry args={[radius, CYL_SEG]} />
        <meshBasicMaterial color={COL.seam} transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* ── Anel de limite máximo (região da costura) ─────────────────────── */}
      <mesh position={seamCenter.toArray()} quaternion={quatZ.toArray() as [number, number, number, number]}>
        <ringGeometry args={[maxRadius - s * 0.07, maxRadius + s * 0.02, CYL_SEG]} />
        <meshBasicMaterial
          color={COL.maxRing}
          transparent
          opacity={atLimit ? 0.9 : 0.45}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* ── Anel de diâmetro (arrastável) ─────────────────────────────────── */}
      <mesh position={center.toArray()} quaternion={quatZ.toArray() as [number, number, number, number]}>
        <ringGeometry args={[radius - s * 0.09, radius + s * 0.05, CYL_SEG]} />
        <meshBasicMaterial color={COL.male} transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* ── Handles ───────────────────────────────────────────────────────── */}
      <mesh
        position={radiusKnob.toArray()}
        onPointerDown={(e) => beginDrag('radius', e)}
      >
        <sphereGeometry args={[s * 0.30, 16, 16]} />
        <meshBasicMaterial color={COL.male} />
      </mesh>
      <mesh
        position={heightKnob.toArray()}
        onPointerDown={(e) => beginDrag('height', e)}
      >
        <sphereGeometry args={[s * 0.26, 16, 16]} />
        <meshBasicMaterial color={COL.axis} />
      </mesh>
      <mesh
        position={center.toArray()}
        onPointerDown={(e) => beginDrag('center', e)}
      >
        <sphereGeometry args={[s * 0.34, 16, 16]} />
        <meshBasicMaterial color={COL.center} />
      </mesh>
    </group>
  )
}
