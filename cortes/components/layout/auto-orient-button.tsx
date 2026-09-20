"use client"

import { useState, useCallback } from 'react'
import { ArrowUpFromLine, Loader2, Check, AlertTriangle } from 'lucide-react'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'
import { autoOrientObject } from '@/lib/auto-orient/autoOrient'
import { cn } from '@/lib/utils'

export function AutoOrientButton() {
  const modelMesh = useAppStore((s) => s.modelMesh)
  const parts = useAppStore((s) => s.parts)
  const activePartId = useAppStore((s) => s.activePartId)
  const setStatus = useAppStore((s) => s.setStatus)
  const pushHistory = useAppStore((s) => s.pushHistory)

  const [state, setState] = useState<'idle' | 'analyzing' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState<string>('')
  const [confidence, setConfidence] = useState<number | null>(null)

  const handleClick = useCallback(async () => {
    const store = useAppStore.getState()
    const targetMesh = store.modelMesh
    if (!targetMesh) {
      setStatus('error', 'Nenhum modelo carregado.')
      return
    }

    pushHistory()
    setState('analyzing')
    setMsg('Analisando...')
    setConfidence(null)
    setStatus('cutting', 'Analisando modelo...')

    // Cria um objeto temporário para análise sem mutar os meshes reais
    // Sempre clona para não mutar antes de confirmar confiança
    let object: THREE.Object3D
    let isGroup = false
    const clones: THREE.Mesh[] = []
    if (store.activePartId) {
      const clone = new THREE.Mesh(targetMesh.geometry.clone() as THREE.BufferGeometry, targetMesh.material)
      clone.position.copy(targetMesh.position)
      clone.quaternion.copy(targetMesh.quaternion)
      clone.scale.copy(targetMesh.scale)
      clone.updateMatrixWorld(true)
      object = clone
    } else if (store.parts.length > 1) {
      const group = new THREE.Group()
      for (const p of store.parts) {
        if (!p.visible) continue
        const clone = new THREE.Mesh(p.mesh.geometry.clone() as THREE.BufferGeometry, p.mesh.material)
        clone.position.copy(p.mesh.position)
        clone.quaternion.copy(p.mesh.quaternion)
        clone.scale.copy(p.mesh.scale)
        clone.updateMatrixWorld(true)
        group.add(clone)
        clones.push(clone)
      }
      if (group.children.length === 0) {
        const clone = new THREE.Mesh(targetMesh.geometry.clone() as THREE.BufferGeometry, targetMesh.material)
        clone.position.copy(targetMesh.position)
        clone.quaternion.copy(targetMesh.quaternion)
        clone.scale.copy(targetMesh.scale)
        group.add(clone)
        clones.push(clone)
      }
      group.updateMatrixWorld(true)
      object = group
      isGroup = true
    } else {
      const clone = new THREE.Mesh(targetMesh.geometry.clone() as THREE.BufferGeometry, targetMesh.material)
      clone.position.copy(targetMesh.position)
      clone.quaternion.copy(targetMesh.quaternion)
      clone.scale.copy(targetMesh.scale)
      clone.updateMatrixWorld(true)
      object = clone
    }

    try {
      const result = await autoOrientObject(object, { putOnGround: true, alignFront: false }, (stage) => {
        setMsg(stage)
        setStatus('cutting', stage)
      })

      setConfidence(result.confidence)

      // Se confiança muito baixa, ainda aplica mas avisa que pode desfazer
      const isUncertain = !result.success && result.confidence < 0.45

      // Aplica o delta a todos os meshes reais
      const q = result.quaternion
      const offsetY = result.groundOffset
      if (isGroup) {
        for (const p of store.parts) {
          if (!p.visible) continue
          p.mesh.quaternion.premultiply(q)
          p.mesh.position.y += offsetY
          p.mesh.updateMatrixWorld(true)
        }
      } else {
        targetMesh.quaternion.premultiply(q)
        targetMesh.position.y += offsetY
        targetMesh.updateMatrixWorld(true)
      }

      // Placa de Corte: faz ela seguir o modelo (mesma rotação + translação Y)
      try {
        const s = useAppStore.getState()
        const pos = new THREE.Vector3(...s.plateCutPosition)
        const euler = new THREE.Euler(s.plateCutRotation[0], s.plateCutRotation[1], s.plateCutRotation[2], 'XYZ')
        const plateQuat = new THREE.Quaternion().setFromEuler(euler)
        pos.applyQuaternion(q)
        pos.y += offsetY
        plateQuat.premultiply(q)
        const newEuler = new THREE.Euler().setFromQuaternion(plateQuat, 'XYZ')
        useAppStore.setState({
          plateCutPosition: [pos.x, pos.y, pos.z] as [number, number, number],
          plateCutRotation: [newEuler.x, newEuler.y, newEuler.z] as [number, number, number],
        })
      } catch {}

      // Centraliza no ponto central da tela (0,0 no XZ) — já está no ground em Y
      try {
        const allMeshes = isGroup ? store.parts.filter((p) => p.visible).map((p) => p.mesh) : [targetMesh]
        const box = new THREE.Box3()
        for (const m of allMeshes) {
          m.updateMatrixWorld(true)
          const b = new THREE.Box3().setFromObject(m)
          box.union(b)
        }
        const center = new THREE.Vector3()
        box.getCenter(center)
        const offsetXZ = new THREE.Vector3(-center.x, 0, -center.z)
        if (offsetXZ.lengthSq() > 1e-6) {
          for (const m of allMeshes) {
            m.position.add(offsetXZ)
            m.updateMatrixWorld(true)
          }
          const s2 = useAppStore.getState()
          const platePos2 = new THREE.Vector3(...s2.plateCutPosition)
          platePos2.add(offsetXZ)
          useAppStore.setState({ plateCutPosition: [platePos2.x, platePos2.y, platePos2.z] as [number, number, number] })
        }
      } catch {}

      // Limpa clones
      for (const c of clones) c.geometry.dispose()
      if (object instanceof THREE.Group) {
        for (const c of object.children) (c as THREE.Mesh).geometry?.dispose?.()
      } else {
        (object as THREE.Mesh).geometry.dispose()
      }

      useAppStore.getState().bumpOrientVersion()
      const { invalidate } = await import('@react-three/fiber')
      invalidate()

      setState('done')
      setMsg('OK')
      setStatus('loaded', `Orientado — ${(result.confidence * 100).toFixed(0)}% (${result.method})`)
      setTimeout(() => setState('idle'), 2500)
    } catch (e: any) {
      setState('error')
      setMsg('Falha')
      setStatus('error', `Falha: ${e?.message ?? 'erro'}`)
      setTimeout(() => setState('idle'), 3000)
    }
  }, [pushHistory, setStatus])

  const disabled = !modelMesh
  const orientA = useAppStore((s) => s.orientPointA)
  const orientB = useAppStore((s) => s.orientPointB)
  const activeTool = useAppStore((s) => s.activeTool)
  const setActiveTool = useAppStore((s) => s.setActiveTool)
  const isOrienting = activeTool === 'orient'

  const label = state === 'analyzing' ? msg : state === 'done' ? `OK ${confidence !== null ? `${(confidence * 100).toFixed(0)}%` : ''}` : state === 'error' ? msg : 'Orientar'
  const description = state === 'analyzing' ? msg : state === 'done' ? `Orientado ${(confidence! * 100).toFixed(0)}%` : state === 'error' ? msg : 'Indique topo e base e oriente'

  const handleOrientarClick = () => {
    if (!isOrienting) {
      setActiveTool('orient')
      useAppStore.getState().clearOrientPoints()
      setStatus('loaded', 'Orientar: clique no ponto de cima (A) e depois no ponto de baixo (B) no modelo')
      return
    }
    // Já em modo orientar: se tem A e B, aplica; se não, sai do modo
    if (orientA && orientB) {
      handleManualOrient()
    } else {
      setActiveTool('select')
      useAppStore.getState().clearOrientPoints()
      setStatus('loaded', 'Seleção Smart')
    }
  }

  const handleManualOrient = useCallback(async () => {
    const store = useAppStore.getState()
    const a = store.orientPointA
    const b = store.orientPointB
    const mesh = store.modelMesh
    if (!a || !b || !mesh) {
      setStatus('error', 'Indique os dois pontos (A topo e B base) no modelo')
      return
    }
    pushHistory()
    setState('analyzing')
    setMsg('Orientando...')
    setStatus('cutting', 'Orientando...')

    try {
      const { solveManualQuaternion, applyGroundOffset } = await import('@/lib/auto-orient/orientationSolver')
      const targetUp = new THREE.Vector3(0, 1, 0)
      const q = solveManualQuaternion(a, b, targetUp)

      // Aplica a todas as partes visíveis ou apenas à ativa
      let manualOffset = 0
      if (store.activePartId) {
        mesh.quaternion.premultiply(q)
        mesh.updateMatrixWorld(true)
        const offset = applyGroundOffset(mesh, 0)
        manualOffset = offset
        // Também aplica offset a todas as partes visíveis para manter conjunto
        for (const p of store.parts) {
          if (p.id !== store.activePartId && p.visible) {
            p.mesh.quaternion.premultiply(q)
            p.mesh.position.y += offset
            p.mesh.updateMatrixWorld(true)
          }
        }
      } else {
        for (const p of store.parts) {
          if (!p.visible) continue
          p.mesh.quaternion.premultiply(q)
          p.mesh.updateMatrixWorld(true)
        }
        // Ground para o conjunto
        const dummy = new THREE.Group()
        for (const p of store.parts) if (p.visible) dummy.add(p.mesh.clone())
        dummy.updateMatrixWorld(true)
        const box = new THREE.Box3().setFromObject(dummy)
        const offset = 0 - box.min.y
        manualOffset = offset
        for (const p of store.parts) {
          if (!p.visible) continue
          p.mesh.position.y += offset
          p.mesh.updateMatrixWorld(true)
        }
        // Limpa clones
        dummy.traverse((c) => (c as THREE.Mesh).geometry?.dispose?.())
      }

      // Placa de Corte: segue o modelo
      try {
        const s = useAppStore.getState()
        const pos = new THREE.Vector3(...s.plateCutPosition)
        const euler = new THREE.Euler(s.plateCutRotation[0], s.plateCutRotation[1], s.plateCutRotation[2], 'XYZ')
        const plateQuat = new THREE.Quaternion().setFromEuler(euler)
        pos.applyQuaternion(q)
        pos.y += manualOffset
        plateQuat.premultiply(q)
        const newEuler = new THREE.Euler().setFromQuaternion(plateQuat, 'XYZ')
        useAppStore.setState({
          plateCutPosition: [pos.x, pos.y, pos.z] as [number, number, number],
          plateCutRotation: [newEuler.x, newEuler.y, newEuler.z] as [number, number, number],
        })
      } catch {}

      // Centraliza: meio entre A e B = meio do modelo → centro da tela (0,0)
      // Placa recalculada para ficar fiel ao novo posicionamento
      try {
        const midAB = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
        // Aplica a mesma rotação da orientação ao ponto médio para saber onde ele foi parar
        const midAfter = midAB.clone().applyQuaternion(q)
        // Ground já aplicado, então midAfter.y já está ajustado; apenas centraliza XZ
        const offsetXZ = new THREE.Vector3(-midAfter.x, 0, -midAfter.z)
        // Também centraliza via bbox para garantir que o modelo inteiro fique centrado, mas prioriza midAB
        const allMeshes = store.activePartId ? [mesh] : store.parts.filter((p) => p.visible).map((p) => p.mesh)
        // Primeiro, move todos para que midAB vá para (0, *, 0)
        if (offsetXZ.lengthSq() > 1e-6) {
          for (const m of allMeshes) {
            m.position.add(offsetXZ)
            m.updateMatrixWorld(true)
          }
          const s2 = useAppStore.getState()
          const platePos2 = new THREE.Vector3(...s2.plateCutPosition)
          // Placa também segue o modelo e o offset de centralização
          platePos2.applyQuaternion(q)
          platePos2.add(new THREE.Vector3(0, manualOffset, 0))
          platePos2.add(offsetXZ)
          // Recalcula a placa para ficar exatamente no meio do modelo pós-orientação
          // (fiel ao corte onde a placa foi posicionada antes)
          const newPlatePos = new THREE.Vector3(0, platePos2.y, 0)
          // Mantém X/Z da placa no centro do modelo (0,0) para corte centralizado
          useAppStore.setState({ plateCutPosition: [newPlatePos.x, newPlatePos.y, newPlatePos.z] as [number, number, number] })
        }
      } catch {}

      useAppStore.getState().bumpOrientVersion()
      const { invalidate } = await import('@react-three/fiber')
      invalidate()
      setState('done')
      setMsg('OK')
      setStatus('loaded', 'Modelo orientado (manual A→B) — meio centralizado')
      setActiveTool('select')
      useAppStore.getState().clearOrientPoints()
      setTimeout(() => setState('idle'), 2500)
    } catch (e: any) {
      setState('error')
      setMsg('Falha')
      setStatus('error', `Falha: ${e?.message ?? 'erro'}`)
      setTimeout(() => setState('idle'), 3000)
    }
  }, [pushHistory, setStatus])

  // Se já tem A e B, o botão principal vira "Orientar" com ação manual
  const hasPoints = !!orientA && !!orientB

  return (
    <div className="relative group w-full max-w-full px-1.5 flex flex-col gap-1 box-border min-w-0 overflow-hidden">
      <button
        onClick={isOrienting && hasPoints ? handleManualOrient : handleOrientarClick}
        disabled={disabled || state === 'analyzing'}
        className={cn('tool-btn w-full max-w-full box-border', disabled && 'opacity-25 cursor-not-allowed', state === 'analyzing' && 'opacity-60', isOrienting && 'ring-1 ring-[oklch(0.70_0.22_42)]')}
        aria-label={description}
        aria-pressed={isOrienting}
        style={{ boxSizing: 'border-box' }}
      >
        {state === 'analyzing' ? <Loader2 className="w-4 h-4 animate-spin" /> : state === 'done' ? <Check className="w-4 h-4" style={{ color: 'oklch(0.65 0.15 145)' }} /> : state === 'error' ? <AlertTriangle className="w-4 h-4" style={{ color: 'oklch(0.70 0.18 30)' }} /> : <ArrowUpFromLine className="w-4 h-4" />}
        <span className="text-[8px] font-mono uppercase tracking-wider leading-none text-center whitespace-normal overflow-hidden text-ellipsis max-w-full">
          {state === 'idle' ? (
            isOrienting ? (
              hasPoints ? (
                <>
                  Aplicar
                  <br />
                  Orientar
                </>
              ) : (
                <>
                  {orientA ? 'Ponto B' : 'Ponto A'}
                  <br />
                  <span className="text-[6px] opacity-60">{orientA ? 'base' : 'topo'}</span>
                </>
              )
            ) : (
              'Orientar'
            )
          ) : (
            <span className="text-[7px] leading-none whitespace-normal overflow-hidden text-ellipsis max-w-full block">{label}</span>
          )}
        </span>
      </button>

      {/* Painel PONTO A/B — centralizado na sidebar */}
      {isOrienting && (
        <div className="w-full max-w-full rounded-lg border p-1.5 flex flex-col gap-1 box-border overflow-hidden min-w-0 mx-auto" style={{ background: 'oklch(0.12 0 0)', borderColor: 'oklch(0.70 0.22 42 / 30%)', boxSizing: 'border-box' }}>
          <div className="flex items-center gap-1 w-full max-w-full min-w-0 overflow-hidden">
            <span title="clique no topo" className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-mono font-bold shrink-0 cursor-help" style={{ background: orientA ? 'oklch(0.70 0.22 42)' : 'oklch(0.18 0 0)', color: orientA ? '#000' : 'oklch(0.40 0 0)', border: orientA ? 'none' : '1px solid oklch(0.25 0 0)' }}>
              A
            </span>
            <span className="text-[7px] font-mono flex-1 min-w-0 truncate overflow-hidden" style={{ color: orientA ? 'oklch(0.85 0 0)' : 'oklch(0.40 0 0)' }}>
              {orientA ? `${orientA.x.toFixed(0)},${orientA.y.toFixed(0)}` : 'topo'}
            </span>
            {orientA && (
              <button onClick={() => useAppStore.getState().setOrientPointA(null)} className="text-[7px] px-1 py-0 rounded bg-secondary/50 hover:bg-secondary leading-none shrink-0">×</button>
            )}
          </div>
          <div className="flex items-center gap-1 w-full max-w-full min-w-0 overflow-hidden">
            <span title="clique na base" className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-mono font-bold shrink-0 cursor-help" style={{ background: orientB ? 'oklch(0.70 0.22 42)' : 'oklch(0.18 0 0)', color: orientB ? '#000' : 'oklch(0.40 0 0)', border: orientB ? 'none' : '1px solid oklch(0.25 0 0)' }}>
              B
            </span>
            <span className="text-[7px] font-mono flex-1 min-w-0 truncate overflow-hidden" style={{ color: orientB ? 'oklch(0.85 0 0)' : 'oklch(0.40 0 0)' }}>
              {orientB ? `${orientB.x.toFixed(0)},${orientB.y.toFixed(0)}` : 'base'}
            </span>
            {orientB && (
              <button onClick={() => useAppStore.getState().setOrientPointB(null)} className="text-[7px] px-1 py-0 rounded bg-secondary/50 hover:bg-secondary leading-none shrink-0">×</button>
            )}
          </div>
          <div className="flex flex-col gap-1 w-full max-w-full box-border min-w-0">
            <button
              onClick={handleManualOrient}
              disabled={!hasPoints}
              className="w-full max-w-full py-1.5 rounded text-[7px] font-mono font-semibold disabled:opacity-30 leading-none truncate overflow-hidden box-border min-w-0"
              style={{ background: hasPoints ? 'oklch(0.70 0.22 42)' : 'oklch(0.18 0 0)', color: hasPoints ? '#000' : 'oklch(0.35 0 0)', boxSizing: 'border-box' }}
            >
              Orientar
            </button>
            <button
              onClick={() => { useAppStore.getState().clearOrientPoints(); setActiveTool('select') }}
              className="w-full max-w-full py-1 rounded text-[7px] font-mono border leading-none truncate overflow-hidden box-border min-w-0"
              style={{ borderColor: 'oklch(0.18 0 0)', color: 'oklch(0.45 0 0)', boxSizing: 'border-box' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="tool-tooltip whitespace-nowrap" role="tooltip">
        {description}
        {state === 'idle' && confidence !== null ? ` — ${(confidence * 100).toFixed(0)}%` : ''}
      </div>
    </div>
  )
}
