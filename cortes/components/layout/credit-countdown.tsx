"use client"

/**
 * CreditCountdown — mini cronômetro regressivo dos créditos comprados.
 *
 * Aparece só quando o usuário tem `creditsExpiresAt` ativo (pagou um plano
 * ou é a conta de teste do proprietário). Atualiza a cada segundo e, ao
 * zerar, chama `resetExpiredCredits()` (saldo cai para 100).
 */

import { useEffect, useRef, useState } from 'react'
import { Timer } from 'lucide-react'
import { useUserStore } from '@/lib/user-store'

const pad = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0')

export function CreditCountdown() {
  const expiresAt           = useUserStore((s) => s.creditsExpiresAt)
  const resetExpiredCredits = useUserStore((s) => s.resetExpiredCredits)
  const [, setTick]         = useState(0)
  const firedRef            = useRef(false)

  useEffect(() => {
    if (expiresAt == null) return
    firedRef.current = false
    const id = window.setInterval(() => {
      if (Date.now() >= expiresAt) {
        window.clearInterval(id)
        if (!firedRef.current) {
          firedRef.current = true
          resetExpiredCredits()
        }
      } else {
        setTick((t) => t + 1)
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [expiresAt, resetExpiredCredits])

  if (expiresAt == null) return null

  const remaining = expiresAt - Date.now()
  if (remaining <= 0) return null

  const totalSec = Math.floor(remaining / 1000)
  const days     = Math.floor(totalSec / 86400)
  const hours    = Math.floor((totalSec % 86400) / 3600)
  const minutes  = Math.floor((totalSec % 3600) / 60)
  const seconds  = totalSec % 60

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-lg border mr-1.5"
      style={{
        borderColor: 'oklch(0.70 0.22 42 / 45%)',
        background:  'oklch(0.70 0.22 42 / 10%)',
        color:       'oklch(0.72 0.16 42)',
      }}
      title={`Seu crédito expira em ${days} dias ${pad(hours)} horas ${pad(minutes)} minutos ${pad(seconds)} segundos`}
    >
      <Timer className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span className="text-[10px] font-mono font-semibold tabular-nums tracking-tight">
        {days}d&nbsp;{pad(hours)}h&nbsp;{pad(minutes)}m&nbsp;{pad(seconds)}s
      </span>
    </div>
  )
}
