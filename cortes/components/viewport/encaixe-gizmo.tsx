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
  male: '#3ff0c4',
  maleBright: '#9dffe8',
  female: '#ff9d55',
  femaleBright: '#ffd0a8',
  maxRing: '#ff4757',
  axis: '#ffffff',
  center: '#ffd54a',
  seam: 'rgba(255,255,255,0.95)',
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
  /** Eixo e centro em espaço mundo — usados no arrasto de altura. */
  axisWorld: THREE.Vector3
  centerWorld: THREE.Vector3
  /** Posição do cursor projetada no eixo no início do arrasto (evita pulo). */
  startAxisParam: number
  /** Raio inicial medido no plano da costura (evita pulo no arrasto do diâmetro). */
  startRadiusParam: number
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
      const groupWorld = groupRef.current?.matrixWorld.clone() ?? new THREE.Matrix4()
      const inv = groupWorld.clone().invert()
      const dirLocal = new THREE.Vector3(...p.normal).multiplyScalar(p.inverted ? -1 : 1).normalize()
      const axisWorld = dirLocal.clone().transformDirection(groupWorld)
      const centerWorld = new THREE.Vector3(...p.center).applyMatrix4(groupWorld)

      // Plano de arrasto:
      //  - altura → plano que CONTÉM o eixo e o "up" da tela, garantindo que
      //    arrastar verticalmente mude a altura em QUALQUER ângulo de câmera;
      //  - raio/centro → plano paralelo à tela (comportamento clássico).
      let plane: THREE.Plane
      if (type === 'height') {
        const screenUp = cameraRef.current.up.clone().normalize()
        const n = new THREE.Vector3().crossVectors(axisWorld, screenUp)
        if (n.lengthSq() > 1e-6) {
          plane = new THREE.Plane().setFromNormalAndCoplanarPoint(n.normalize(), centerWorld)
        } else {
          plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
            cameraRef.current.getWorldDirection(new THREE.Vector3()).negate(),
            centerWorld,
          )
        }
      } else {
        plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
          cameraRef.current.getWorldDirection(new THREE.Vector3()).negate(),
          e.point.clone(),
        )
      }

      const hit = new THREE.Vector3()
      if (!ray.intersectPlane(plane, hit)) return
      const hitLocal = hit.clone().applyMatrix4(inv)
      const uLocal = new THREE.Vector3(...p.planeU).normalize()
      const vLocal = new THREE.Vector3(...p.planeV).normalize()
      const centerLocal = new THREE.Vector3(...p.center)
      const rel0 = hitLocal.clone().sub(centerLocal)

      dragRef.current = {
        type,
        plane,
        startHitLocal: hitLocal,
        startRadius: p.radius,
        startHeight: p.height,
        startCenter: centerLocal,
        groupInv: inv,
        dirLocal,
        axisWorld,
        centerWorld,
        startAxisParam: hit.clone().sub(centerWorld).dot(axisWorld),
        startRadiusParam: Math.hypot(rel0.dot(uLocal), rel0.dot(vLocal)),
        u: uLocal,
        v: vLocal,
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
        patchRef.current({ radius: clamp(d.startRadius + (rad - d.startRadiusParam), Math.min(RADIUS_MIN, p.maxRadius), p.maxRadius) })
      } else if (d.type === 'height') {
        // Projeção do cursor sobre o eixo (espaço mundo) — funciona em qualquer ângulo,
        // com deslocamento incremental a partir do ponto inicial (sem pulo).
        const t = hit.clone().sub(d.centerWorld).dot(d.axisWorld)
        patchRef.current({ height: clamp(d.startHeight + (t - d.startAxisParam), HEIGHT_MIN, p.maxHeight) })
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
      <mesh position={center.clone().addScaledVector(dirLocal, height / 2).toArray()} quaternion={quatY.toArray() as [number, number, number, number]} renderOrder={5}>
        <cylinderGeometry args={[radius, radius, height, CYL_SEG, 1, true]} />
        <meshBasicMaterial color={COL.male} transparent opacity={0.72} side={THREE.DoubleSide} depthWrite={false} depthTest={false} />
      </mesh>

      {/* ── Preview da FÊMEA (cavidade) ───────────────────────────────────── */}
      <mesh position={center.clone().addScaledVector(dirLocal, femaleDepth / 2).toArray()} quaternion={quatY.toArray() as [number, number, number, number]} renderOrder={6}>
        <cylinderGeometry args={[radius + tolerance, radius + tolerance, femaleDepth, CYL_SEG, 1, true]} />
        <meshBasicMaterial color={COL.female} transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} depthTest={false} />
      </mesh>

      {/* ── Eixo ──────────────────────────────────────────────────────────── */}
      <mesh position={center.clone().addScaledVector(dirLocal, height / 2).toArray()} quaternion={quatY.toArray() as [number, number, number, number]} renderOrder={7}>
        <cylinderGeometry args={[s * 0.06, s * 0.06, height, 6, 1, true]} />
        <meshBasicMaterial color={COL.axis} transparent opacity={0.85} depthWrite={false} depthTest={false} />
      </mesh>

      {/* ── Disco da base (boca do encaixe) ───────────────────────────────── */}
      <mesh position={center.toArray()} quaternion={quatZ.toArray() as [number, number, number, number]} renderOrder={4}>
        <circleGeometry args={[radius, CYL_SEG]} />
        <meshBasicMaterial color={COL.seam} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} depthTest={false} />
      </mesh>

      {/* ── Anel de limite máximo (região da costura) ─────────────────────── */}
      <mesh position={seamCenter.toArray()} quaternion={quatZ.toArray() as [number, number, number, number]} renderOrder={8}>
        <ringGeometry args={[maxRadius - s * 0.07, maxRadius + s * 0.02, CYL_SEG]} />
        <meshBasicMaterial
          color={COL.maxRing}
          transparent
          opacity={atLimit ? 0.95 : 0.6}
          side={THREE.DoubleSide}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* ── Anel de diâmetro (arrastável) ─────────────────────────────────── */}
      <mesh position={center.toArray()} quaternion={quatZ.toArray() as [number, number, number, number]} renderOrder={9}>
        <ringGeometry args={[radius - s * 0.09, radius + s * 0.05, CYL_SEG]} />
        <meshBasicMaterial color={COL.maleBright} transparent opacity={0.95} side={THREE.DoubleSide} depthWrite={false} depthTest={false} />
      </mesh>

      {/* ── Anel da boca da FÊMEA (contorno sólido) ───────────────────────── */}
      <mesh position={center.toArray()} quaternion={quatZ.toArray() as [number, number, number, number]} renderOrder={10}>
        <ringGeometry args={[radius + tolerance - s * 0.035, radius + tolerance + s * 0.035, CYL_SEG]} />
        <meshBasicMaterial color={COL.femaleBright} transparent opacity={1} side={THREE.DoubleSide} depthWrite={false} depthTest={false} />
      </mesh>

      {/* ── Anel do topo do MACHO (mostra a altura) ───────────────────────── */}
      <mesh position={center.clone().addScaledVector(dirLocal, height).toArray()} quaternion={quatZ.toArray() as [number, number, number, number]} renderOrder={10}>
        <ringGeometry args={[radius - s * 0.045, radius + s * 0.045, CYL_SEG]} />
        <meshBasicMaterial color={COL.maleBright} transparent opacity={1} side={THREE.DoubleSide} depthWrite={false} depthTest={false} />
      </mesh>

      {/* ── Handles ───────────────────────────────────────────────────────── */}
      <mesh
        position={radiusKnob.toArray()}
        onPointerDown={(e) => beginDrag('radius', e)}
        renderOrder={20}
      >
        <sphereGeometry args={[s * 0.30, 16, 16]} />
        <meshBasicMaterial color={COL.maleBright} depthTest={false} />
      </mesh>
      <mesh
        position={heightKnob.toArray()}
        onPointerDown={(e) => beginDrag('height', e)}
        renderOrder={21}
      >
        <sphereGeometry args={[s * 0.28, 16, 16]} />
        <meshBasicMaterial color={COL.axis} depthTest={false} />
      </mesh>
      <mesh
        position={center.toArray()}
        onPointerDown={(e) => beginDrag('center', e)}
        renderOrder={22}
      >
        <sphereGeometry args={[s * 0.34, 16, 16]} />
        <meshBasicMaterial color={COL.center} depthTest={false} />
      </mesh>
    </group>
  )
}
