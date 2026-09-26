"use client"

/**
 * ProtectionDebugOverlay — modo visual de desenvolvimento (§25).
 *
 * Mapeamento:
 *   VERMELHO  = região protegida (bounds do artefato)
 *   AMARELO   = safe zone (bounds + margem adaptativa)
 *   (AZUL = operação atual = seleção laranja existente; VERDE = resto editável)
 *
 * Dev-only: sem botão na UI. Ativar no console:
 *   __protectionDebug(true)   → mostra os helpers
 *   __protection()            → dump textual + verificação exata
 *
 * 100% não-destrutivo: só Box helpers na cena, nunca toca nas malhas.
 */

import { useMemo } from 'react'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'

export function ProtectionDebugOverlay() {
  const enabled = useAppStore((s) => s.protectionDebug)
  const operations = useAppStore((s) => s.operations)
  const parts = useAppStore((s) => s.parts)

  const boxes = useMemo(() => {
    if (!enabled) return []
    const out: { box: THREE.Box3; color: number }[] = []
    for (const a of operations) {
      if (a.state !== 'PROTECTED' && a.state !== 'COMMITTED') continue
      const part = parts.find((p) => p.id === a.partId)
      const mesh = part?.mesh
      const mtx = new THREE.Matrix4()
      if (mesh) {
        try { mesh.updateWorldMatrix(true, false) } catch { /* debug-only */ }
        mtx.copy(mesh.matrixWorld)
      }
      const local = new THREE.Box3(
        new THREE.Vector3(...a.boxMin),
        new THREE.Vector3(...a.boxMax),
      )
      const world = local.clone().applyMatrix4(mtx)
      out.push({ box: world, color: 0xff2233 })
      const m = a.safeMargin
      const safe = new THREE.Box3(
        world.min.clone().add(new THREE.Vector3(-m, -m, -m)),
        world.max.clone().add(new THREE.Vector3(m, m, m)),
      )
      out.push({ box: safe, color: 0xffcc22 })
    }
    return out
  }, [enabled, operations, parts])

  if (!enabled || boxes.length === 0) return null

  return (
    <group>
      {boxes.map((b, i) => (
        // @ts-expect-error — box3Helper não está nos tipos JSX do R3F, mas existe no three.
        <box3Helper key={i} args={[b.box, b.color]} />
      ))}
    </group>
  )
}
