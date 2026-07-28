"use client"

/**
 * PlateGizmo — Gizmo 3D interativo da Placa de Limitação
 *
 * Modos:
 *  plateMoveMode = true  → Placa arrastável livremente (câmera-plane). Arcos e
 *                          resize handles ficam ocultos.
 *  plateMoveMode = false → Arcos de rotação + handles de resize visíveis.
 *                          Clique na placa não move.
 */

import { useRef, useCallback, useEffect, useMemo, useState } from 'react'
import { useThree, useFrame, invalidate } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'

// ─── Tipos ──────────────────────────────────────────────────────────────────

type DragType = 'free' | 'tx' | 'ty' | 'tz' | 'rx' | 'ry' | 'rz' | 'rw' | 'rh'

interface DragState {
  type: DragType
  plane: THREE.Plane
  startHit: THREE.Vector3
  startPos: THREE.Vector3
  startEuler: THREE.Euler
  startW: number
  startH: number
  axisWorld: THREE.Vector3
}

// ─── Constantes visuais ──────────────────────────────────────────────────────

const COL = {
  x: '#ff3333', y: '#33dd55', z: '#3388ff',
  w: '#ffaa00', h: '#cc44ff',
  plate: '#2255ff',
  plateMove: '#ff9900',  // cor da placa no modo movimento
}
const TUBE_R   = 0.018
const ARROW_R  = 0.045
const ARROW_SH = 0.28
const ARROW_TH = ARROW_R * 2.2
const BOX_S    = 0.055

// ─── Componente principal ────────────────────────────────────────────────────

export function PlateGizmo() {
  const activeTool          = useAppStore(s => s.activeTool)
  const planeCutMode        = useAppStore(s => s.planeCutMode)
  const plateCutPosition    = useAppStore(s => s.plateCutPosition)
  const plateCutRotation    = useAppStore(s => s.plateCutRotation)
  const plateCutWidth       = useAppStore(s => s.plateCutWidth)
  const plateCutHeight      = useAppStore(s => s.plateCutHeight)
  const modelMesh           = useAppStore(s => s.modelMesh)
  const plateMoveMode       = useAppStore(s => s.plateMoveMode)
  const setPlateCutPosition = useAppStore(s => s.setPlateCutPosition)
  const setPlateCutRotation = useAppStore(s => s.setPlateCutRotation)
  const setPlateCutSize     = useAppStore(s => s.setPlateCutSize)
  const setPlateCutDragging = useAppStore(s => s.setPlateCutDragging)

  const { camera, gl } = useThree()
  const dragRef = useRef<DragState | null>(null)

  const visible = activeTool === 'cut' && planeCutMode === 'plate' && !!modelMesh

  // ── Surface-click: cursor position on model surface (Move mode only) ─────────
  const [cursorPos, setCursorPos] = useState<[number, number, number] | null>(null)
  const [cursorScale, setCursorScale] = useState(0.05)

  // ── Valores derivados ────────────────────────────────────────────────────────
  const plateCenter = useMemo(
    () => new THREE.Vector3(...plateCutPosition),
    [plateCutPosition],
  )
  const plateQuat = useMemo(
    () => new THREE.Quaternion().setFromEuler(
      new THREE.Euler(plateCutRotation[0], plateCutRotation[1], plateCutRotation[2], 'XYZ'),
    ),
    [plateCutRotation],
  )

  // Escala dos handles proporcional à distância câmera→placa
  const handleScaleRef = useRef(1)
  useFrame(() => {
    const dist = camera.position.distanceTo(plateCenter)
    handleScaleRef.current = Math.max(0.1, dist * 0.10)
  })

  // ── Raycast auxiliar ──────────────────────────────────────────────────────────
  const getWorldRay = useCallback((clientX: number, clientY: number) => {
    const rect = gl.domElement.getBoundingClientRect()
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width)  *  2 - 1,
     -((clientY - rect.top)  / rect.height) *  2 + 1,
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(ndc, camera)
    return raycaster.ray
  }, [camera, gl])

  // ── Início do arrasto ─────────────────────────────────────────────────────────
  const startDrag = useCallback((type: DragType, clientX: number, clientY: number) => {
    const ray = getWorldRay(clientX, clientY)

    // Eixo de restrição no espaço mundo (não usado para 'free')
    let axisWorld = new THREE.Vector3(0, 1, 0)
    switch (type) {
      case 'tx': axisWorld.set(1, 0, 0); break
      case 'ty': axisWorld.set(0, 1, 0); break
      case 'tz': axisWorld.set(0, 0, 1); break
      case 'rx': axisWorld.set(1, 0, 0); break
      case 'ry': axisWorld.set(0, 1, 0); break
      case 'rz': axisWorld.set(0, 0, 1); break
      case 'rw': axisWorld.copy(new THREE.Vector3(1, 0, 0).applyQuaternion(plateQuat)); break
      case 'rh': axisWorld.copy(new THREE.Vector3(0, 1, 0).applyQuaternion(plateQuat)); break
      // 'free': sem eixo fixo
    }

    // Sempre usar plano voltado para câmera → ray sempre intersecta
    const planeNormal = camera.getWorldDirection(new THREE.Vector3()).negate()
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, plateCenter)
    const startHit = new THREE.Vector3()
    ray.intersectPlane(plane, startHit)

    dragRef.current = {
      type, plane,
      startHit: startHit.clone(),
      startPos: plateCenter.clone(),
      startEuler: new THREE.Euler(plateCutRotation[0], plateCutRotation[1], plateCutRotation[2], 'XYZ'),
      startW: plateCutWidth,
      startH: plateCutHeight,
      axisWorld: axisWorld.normalize(),
    }
    setPlateCutDragging(true)
  }, [getWorldRay, plateCenter, plateQuat, plateCutRotation, plateCutWidth, plateCutHeight, camera, setPlateCutDragging])

  // ── Ponteiro movido ───────────────────────────────────────────────────────────
  const onPointerMove = useCallback((e: PointerEvent) => {
    const state = dragRef.current
    if (!state) return

    const ray = getWorldRay(e.clientX, e.clientY)
    const hitPoint = new THREE.Vector3()
    if (!ray.intersectPlane(state.plane, hitPoint)) return

    const delta = hitPoint.clone().sub(state.startHit)
    const { type, axisWorld, startPos, startEuler, startW, startH } = state

    if (type === 'free') {
      // Movimento livre: transladar pelo delta total no plano câmera
      const newPos = startPos.clone().add(delta)
      setPlateCutPosition([newPos.x, newPos.y, newPos.z])

    } else if (type === 'tx' || type === 'ty' || type === 'tz') {
      // Translação constrangida ao eixo
      const proj = axisWorld.clone().multiplyScalar(delta.dot(axisWorld))
      const newPos = startPos.clone().add(proj)
      setPlateCutPosition([newPos.x, newPos.y, newPos.z])

    } else if (type === 'rx' || type === 'ry' || type === 'rz') {
      // Rotação robusta: proj. sobre plano do eixo → ângulo com sinal
      const toStart = state.startHit.clone().sub(state.startPos)
      const toNow   = hitPoint.clone().sub(state.startPos)

      const projStart = toStart.clone().sub(axisWorld.clone().multiplyScalar(toStart.dot(axisWorld)))
      const projNow   = toNow.clone().sub(axisWorld.clone().multiplyScalar(toNow.dot(axisWorld)))

      if (projStart.lengthSq() < 1e-8 || projNow.lengthSq() < 1e-8) return

      const cross = projStart.clone().cross(projNow)
      const sinA  = cross.length() * Math.sign(cross.dot(axisWorld))
      const cosA  = projStart.dot(projNow) / (projStart.length() * projNow.length())
      const angle = Math.atan2(sinA, Math.min(1, Math.max(-1, cosA)))

      const qDelta  = new THREE.Quaternion().setFromAxisAngle(axisWorld, angle)
      const baseQ   = new THREE.Quaternion().setFromEuler(startEuler)
      const newQuat = qDelta.multiply(baseQ)
      const e2      = new THREE.Euler().setFromQuaternion(newQuat, 'XYZ')
      setPlateCutRotation([e2.x, e2.y, e2.z])

    } else if (type === 'rw') {
      const scaleDelta = delta.dot(axisWorld) * 2
      setPlateCutSize(Math.max(0.01, startW + scaleDelta), startH)

    } else if (type === 'rh') {
      const scaleDelta = delta.dot(axisWorld) * 2
      setPlateCutSize(startW, Math.max(0.01, startH + scaleDelta))
    }

    invalidate()
  }, [getWorldRay, setPlateCutPosition, setPlateCutRotation, setPlateCutSize])

  const onPointerUp = useCallback(() => {
    dragRef.current = null
    setPlateCutDragging(false)
  }, [setPlateCutDragging])

  // Eventos globais para capturar drag fora do canvas
  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup',   onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup',   onPointerUp)
    }
  }, [onPointerMove, onPointerUp])

  // Clear cursor when leaving move mode
  useEffect(() => {
    if (!plateMoveMode) setCursorPos(null)
  }, [plateMoveMode])

  if (!visible) return null

  const W = plateCutWidth
  const H = plateCutHeight
  const S = handleScaleRef.current
  const plateColor = plateMoveMode ? COL.plateMove : COL.plate

  const mkDown = (type: DragType) => (e: any) => {
    e.stopPropagation()
    const ev = e.nativeEvent as PointerEvent
    startDrag(type, ev.clientX, ev.clientY)
  }

  return (
    <>
      {/* ── Surface pick mesh: transparente, captura cliques no modelo em modo Mover ── */}
      {plateMoveMode && modelMesh && (
        <mesh
          geometry={modelMesh.geometry}
          position={[modelMesh.position.x, modelMesh.position.y, modelMesh.position.z]}
          quaternion={modelMesh.quaternion.toArray() as [number, number, number, number]}
          scale={[modelMesh.scale.x, modelMesh.scale.y, modelMesh.scale.z]}
          renderOrder={1}
          onPointerMove={(e) => {
            e.stopPropagation()
            const s = Math.max(0.01, camera.position.distanceTo(e.point) * 0.05)
            setCursorPos([e.point.x, e.point.y, e.point.z])
            setCursorScale(s)
            invalidate()
          }}
          onPointerLeave={() => {
            setCursorPos(null)
            invalidate()
          }}
          onPointerDown={(e) => {
            // Only fires when clicking the model surface (plate stopPropagation blocks this on the plate area)
            e.stopPropagation()
            setPlateCutPosition([e.point.x, e.point.y, e.point.z])
            setCursorPos(null)
            setPlateCutDragging(true)
            invalidate()
          }}
          onPointerUp={() => setPlateCutDragging(false)}
        >
          <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* ── Cursor de superfície: anel laranja que segue o ponteiro no modelo ── */}
      {plateMoveMode && cursorPos && (
        <mesh position={cursorPos} renderOrder={25}>
          <torusGeometry args={[cursorScale, cursorScale * 0.18, 6, 32]} />
          <meshBasicMaterial color={COL.plateMove} depthTest={false} transparent opacity={0.85} />
        </mesh>
      )}

      {/* ── Placa + Bordas (sempre visíveis; clicável só no modo movimento) ── */}
      <group position={plateCutPosition} quaternion={plateQuat.toArray() as [number,number,number,number]}>
        {/* Superfície — no modo movimento é o handle de drag */}
        <mesh
          renderOrder={2}
          onPointerDown={plateMoveMode ? mkDown('free') : undefined}
          style={plateMoveMode ? { cursor: 'grab' } : undefined}
        >
          <planeGeometry args={[W, H, 1, 1]} />
          <meshBasicMaterial
            color={plateColor}
            transparent
            opacity={plateMoveMode ? 0.28 : 0.18}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Bordas */}
        <lineSegments renderOrder={3}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([
                -W/2,-H/2,0,  W/2,-H/2,0,
                 W/2,-H/2,0,  W/2, H/2,0,
                 W/2, H/2,0, -W/2, H/2,0,
                -W/2, H/2,0, -W/2,-H/2,0,
              ]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={plateColor} transparent opacity={0.9} depthTest={false} />
        </lineSegments>

        {/* Handles de redimensionamento — ocultos no modo movimento */}
        {!plateMoveMode && (
          <>
            <ResizeHandle pos={[ W/2,   0, 0]} color={COL.w} size={S} onPointerDown={mkDown('rw')} />
            <ResizeHandle pos={[-W/2,   0, 0]} color={COL.w} size={S} onPointerDown={mkDown('rw')} />
            <ResizeHandle pos={[0,  H/2, 0]} color={COL.h} size={S} onPointerDown={mkDown('rh')} />
            <ResizeHandle pos={[0, -H/2, 0]} color={COL.h} size={S} onPointerDown={mkDown('rh')} />
          </>
        )}
      </group>

      {/* ── Handles de translação — ocultos no modo movimento ────────────────── */}
      {!plateMoveMode && (
        <group position={plateCutPosition}>
          <TranslateArrow dir={[1,0,0]} color={COL.x} len={S} onPointerDown={mkDown('tx')} />
          <TranslateArrow dir={[0,1,0]} color={COL.y} len={S} onPointerDown={mkDown('ty')} />
          <TranslateArrow dir={[0,0,1]} color={COL.z} len={S} onPointerDown={mkDown('tz')} />
        </group>
      )}

      {/* ── Arcos de rotação — ocultos no modo movimento ─────────────────────── */}
      {!plateMoveMode && (
        <group position={plateCutPosition}>
          <RotateArc axis="x" color={COL.x} radius={S * 1.3} onPointerDown={mkDown('rx')} />
          <RotateArc axis="y" color={COL.y} radius={S * 1.3} onPointerDown={mkDown('ry')} />
          <RotateArc axis="z" color={COL.z} radius={S * 1.3} onPointerDown={mkDown('rz')} />
        </group>
      )}

      {/* ── Indicador de modo movimento: cruz central ─────────────────────────── */}
      {plateMoveMode && (
        <group position={plateCutPosition} quaternion={plateQuat.toArray() as [number,number,number,number]}>
          {/* Cruz no centro: linha horizontal */}
          <lineSegments renderOrder={15}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([
                  -S * 0.4, 0, 0,  S * 0.4, 0, 0,
                   0, -S * 0.4, 0, 0,  S * 0.4, 0,
                ]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color={COL.plateMove} depthTest={false} />
          </lineSegments>
        </group>
      )}
    </>
  )
}

// ─── Handle de resize ────────────────────────────────────────────────────────

function ResizeHandle({ pos, color, size, onPointerDown }: {
  pos: [number, number, number]; color: string; size: number
  onPointerDown: (e: any) => void
}) {
  const s = Math.max(BOX_S, size * 0.35)
  return (
    <mesh position={pos} onPointerDown={onPointerDown} renderOrder={10}>
      <boxGeometry args={[s, s, s * 0.4]} />
      <meshBasicMaterial color={color} depthTest={false} />
    </mesh>
  )
}

// ─── Seta de translação ───────────────────────────────────────────────────────

function TranslateArrow({ dir, color, len, onPointerDown }: {
  dir: [number, number, number]; color: string; len: number
  onPointerDown: (e: any) => void
}) {
  const quat = useMemo(() => {
    const d = new THREE.Vector3(...dir).normalize()
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d)
  }, [dir])

  const shaftLen = Math.max(0.01, len * ARROW_SH)
  const coneR    = Math.max(0.001, len * ARROW_R)
  const coneH    = Math.max(0.001, len * ARROW_TH)

  return (
    <group quaternion={quat}>
      <mesh position={[0, shaftLen * 0.5, 0]} onPointerDown={onPointerDown} renderOrder={10}>
        <cylinderGeometry args={[coneR * 0.4, coneR * 0.4, shaftLen, 6]} />
        <meshBasicMaterial color={color} depthTest={false} />
      </mesh>
      <mesh position={[0, shaftLen + coneH * 0.5, 0]} onPointerDown={onPointerDown} renderOrder={10}>
        <coneGeometry args={[coneR, coneH, 8]} />
        <meshBasicMaterial color={color} depthTest={false} />
      </mesh>
    </group>
  )
}

// ─── Arco de rotação (círculo limpo — estilo Blender) ─────────────────────────
//
// Three.js TorusGeometry: anel padrão no plano XY, eixo de simetria = Z.
//   eixo Z → sem rotação         (plano XY)
//   eixo Y → rotate X +90°      (plano XZ)
//   eixo X → rotate Y +90°      (plano YZ)

function RotateArc({ axis, color, radius, onPointerDown }: {
  axis: 'x' | 'y' | 'z'; color: string; radius: number
  onPointerDown: (e: any) => void
}) {
  const rot = useMemo<[number, number, number]>(() => {
    if (axis === 'x') return [0, Math.PI / 2, 0]   // plano YZ — eixo X
    if (axis === 'y') return [Math.PI / 2, 0, 0]   // plano XZ — eixo Y
    return [0, 0, 0]                                // plano XY — eixo Z
  }, [axis])

  const r    = Math.max(0.01, radius)
  const tube = Math.max(0.003, r * TUBE_R)

  return (
    <mesh rotation={rot} onPointerDown={onPointerDown} renderOrder={10}>
      <torusGeometry args={[r, tube, 8, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.90} depthTest={false} />
    </mesh>
  )
}
