"use client"

/**
 * CutPreviewOverlay V2 — Visualização interativa 3D do pipeline de corte.
 *
 * Suporta os modos de visualização do SmartCut V2:
 *   'plane'      → mostra apenas a linha de corte (isocontorno)
 *   'shell'      → cascas abertas (Etapas 1–3, sem tampas)
 *   'caps'       → peças com tampas geradas (Etapas 4–6)
 *   'connectors' → igual a 'caps' (encaixes são aplicados ao final)
 *   'final'      → resultado final (igual a 'caps')
 *
 * Para compatibilidade, quando autoCutPreviewMode não está ativo,
 * usa o comportamento legado com cutPreview e previewViewMode.
 */

import { useEffect, useRef, useState } from 'react'
import { invalidate } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'

export function CutPreviewOverlay() {
  const cutPreview = useAppStore((s) => s.cutPreview)
  const openCutData = useAppStore((s) => s.openCutData)
  const autoCutPreviewMode = useAppStore((s) => s.autoCutPreviewMode)
  const autoCutPipelineStage = useAppStore((s) => s.autoCutPipelineStage)
  const previewViewMode = useAppStore((s) => s.previewViewMode)
  const modelMesh = useAppStore((s) => s.modelMesh)

  const [seamGeo, setSeamGeo] = useState<THREE.BufferGeometry | null>(null)
  const seamGeoRef = useRef<THREE.BufferGeometry | null>(null)

  // Determina quais geometrias mostrar de acordo com o modo
  const showShell = autoCutPreviewMode === 'shell' && autoCutPipelineStage !== 'idle' && !!openCutData
  const showCaps = (autoCutPreviewMode === 'caps' || autoCutPreviewMode === 'connectors' || autoCutPreviewMode === 'final') && !!cutPreview
  const showPlane = autoCutPreviewMode === 'plane'

  // Fallback: legado (quando o pipeline V2 não está ativo)
  const legacyMode = autoCutPipelineStage === 'idle' && !!cutPreview

  const selectedGeo = showShell
    ? openCutData!.openSelectedGeometry
    : showCaps ? cutPreview!.selectedGeometry
    : legacyMode ? cutPreview!.selectedGeometry
    : null

  const bodyGeo = showShell
    ? openCutData!.openBodyGeometry
    : showCaps ? cutPreview!.bodyGeometry
    : legacyMode ? cutPreview!.bodyGeometry
    : null

  // Pontos do isocontorno (seam line)
  const seamPoints = showShell
    ? openCutData!.seamPoints
    : (cutPreview?.seamPoints ?? null)

  useEffect(() => {
    if (seamGeoRef.current) {
      seamGeoRef.current.dispose()
      seamGeoRef.current = null
    }
    if (seamPoints && seamPoints.length > 0) {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(seamPoints, 3))
      seamGeoRef.current = geo
      setSeamGeo(geo)
    } else {
      setSeamGeo(null)
    }
    invalidate()
    return () => {
      if (seamGeoRef.current) {
        seamGeoRef.current.dispose()
        seamGeoRef.current = null
      }
    }
  }, [seamPoints])

  useEffect(() => { invalidate() }, [previewViewMode, autoCutPreviewMode, selectedGeo, bodyGeo])

  if (!modelMesh) return null
  if (!selectedGeo && !showPlane) return null

  const pos = modelMesh.position.toArray() as [number, number, number]
  const rot = [modelMesh.rotation.x, modelMesh.rotation.y, modelMesh.rotation.z] as [number, number, number]
  const scale = modelMesh.scale.toArray() as [number, number, number]

  const wireframe = previewViewMode === 'wireframe'
  const xray = previewViewMode === 'xray'
  const isShell = cutPreview?.params.cutType === 'shell'

  // Cor da peça selecionada depende do modo
  // Shell (cascas abertas) → laranja translúcido; Tampas → vermelho translúcido
  const selectedColor = showShell ? '#ff8800' : isShell ? '#3388ff' : '#ff2222'
  const selectedOpacity = wireframe ? 1 : showShell ? 0.35 : isShell ? 0.55 : 0.42

  // Modo 'plane': mostra só a linha de corte, sem geometrias de peça
  if (showPlane && !selectedGeo) {
    if (!seamGeo) return null
    return (
      <group position={pos} rotation={rot} scale={scale}>
        <lineSegments geometry={seamGeo} renderOrder={999}>
          <lineBasicMaterial color="#00aaff" transparent opacity={0.95} depthTest={false} />
        </lineSegments>
      </group>
    )
  }

  return (
    <group position={pos} rotation={rot} scale={scale}>
      {/* Corpo restante */}
      {bodyGeo && (
        <mesh geometry={bodyGeo} renderOrder={1} castShadow receiveShadow>
          <meshStandardMaterial
            color="#8a8a8d"
            roughness={0.6}
            metalness={0.05}
            transparent={xray}
            opacity={xray ? 0.25 : 1}
            wireframe={wireframe}
            side={THREE.DoubleSide}
            depthWrite={!xray}
          />
        </mesh>
      )}

      {/* Peça separada */}
      {selectedGeo && (
        <mesh geometry={selectedGeo} renderOrder={2}>
          <meshStandardMaterial
            color={selectedColor}
            roughness={showShell ? 0.7 : isShell ? 0.35 : 0.5}
            metalness={showShell ? 0.0 : isShell ? 0.15 : 0.1}
            transparent
            opacity={selectedOpacity}
            wireframe={wireframe}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Linha de separação */}
      {seamGeo && (
        <lineSegments geometry={seamGeo} renderOrder={999}>
          <lineBasicMaterial
            color={showPlane || showShell ? '#00aaff' : '#ffffff'}
            transparent
            opacity={0.9}
            depthTest={false}
          />
        </lineSegments>
      )}
    </group>
  )
}
