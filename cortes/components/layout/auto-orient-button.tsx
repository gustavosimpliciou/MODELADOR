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
    // Se houver isolamento, analisa apenas a peça ativa; senão, todas as visíveis
    let object: THREE.Object3D
    let isGroup = false
    if (store.activePartId) {
      object = targetMesh
    } else if (store.parts.length > 1) {
      const group = new THREE.Group()
      // Clona meshes apenas para análise (não muta os originais)
      for (const p of store.parts) {
        if (!p.visible) continue
        const clone = new THREE.Mesh(p.mesh.geometry.clone() as THREE.BufferGeometry, p.mesh.material)
        clone.position.copy(p.mesh.position)
        clone.quaternion.copy(p.mesh.quaternion)
        clone.scale.copy(p.mesh.scale)
        clone.updateMatrixWorld(true)
        group.add(clone)
      }
      if (group.children.length === 0) {
        const clone = new THREE.Mesh(targetMesh.geometry.clone() as THREE.BufferGeometry, targetMesh.material)
        clone.position.copy(targetMesh.position)
        clone.quaternion.copy(targetMesh.quaternion)
        clone.scale.copy(targetMesh.scale)
        group.add(clone)
      }
      group.updateMatrixWorld(true)
      object = group
      isGroup = true
    } else {
      object = targetMesh
    }

    try {
      const result = await autoOrientObject(object, { putOnGround: true, alignFront: false }, (stage) => {
        setMsg(stage)
        setStatus('cutting', stage)
      })

      setConfidence(result.confidence)

      if (!result.success && result.confidence < 0.45) {
        setState('error')
        setMsg('Incerta')
        setStatus('error', 'Orientação incerta — tente manualmente.')
        setTimeout(() => setState('idle'), 3000)
        return
      }

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
  const label = state === 'analyzing' ? msg : state === 'done' ? `OK ${confidence !== null ? `${(confidence * 100).toFixed(0)}%` : ''}` : state === 'error' ? msg : 'Auto Orientar'
  const description = state === 'analyzing' ? msg : state === 'done' ? `Orientado ${(confidence! * 100).toFixed(0)}%` : state === 'error' ? msg : 'Detecta a base e coloca em pé'

  return (
    <div className="relative group w-full px-1.5">
      <button
        onClick={handleClick}
        disabled={disabled || state === 'analyzing'}
        className={cn('tool-btn', disabled && 'opacity-25 cursor-not-allowed', state === 'analyzing' && 'opacity-60')}
        aria-label={description}
        aria-pressed={false}
      >
        {state === 'analyzing' ? <Loader2 className="w-4 h-4 animate-spin" /> : state === 'done' ? <Check className="w-4 h-4" style={{ color: 'oklch(0.65 0.15 145)' }} /> : state === 'error' ? <AlertTriangle className="w-4 h-4" style={{ color: 'oklch(0.70 0.18 30)' }} /> : <ArrowUpFromLine className="w-4 h-4" />}
        <span className="text-[8px] font-mono uppercase tracking-wider leading-none text-center">
          {state === 'idle' ? (
            <>
              Auto
              <br />
              Orientar
            </>
          ) : (
            <span className="text-[7px] leading-none">{label}</span>
          )}
        </span>
      </button>
      <div className="tool-tooltip whitespace-nowrap" role="tooltip">
        {description}
        {state === 'idle' && confidence !== null ? ` — ${(confidence * 100).toFixed(0)}%` : ''}
      </div>
    </div>
  )
}
