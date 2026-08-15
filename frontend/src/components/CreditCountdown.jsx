import { useEffect, useRef, useState } from 'react'
import { Timer } from 'lucide-react'
import { useStore } from '../store/useStore'

const pad = (n) => String(Math.max(0, Math.floor(n))).padStart(2, '0')

/**
 * Mini cronômetro regressivo dos créditos (plano pago ou cupom) — mesmo
 * visual do Cronômetro do Cortes 3D. Aparece só quando `creditsExpiresAt`
 * está ativo. Ao zerar, reseta o saldo para EXPIRED_CREDIT_BALANCE (100)
 * e mostra um aviso breve.
 */
export default function CreditCountdown() {
  const expiresAt = useStore((s) => s.creditsExpiresAt)
  const resetExpiredCredits = useStore((s) => s.resetExpiredCredits)
  const [, setTick] = useState(0)
  const [justExpired, setJustExpired] = useState(false)
  const firedRef = useRef(false)

  useEffect(() => {
    if (expiresAt == null) return
    firedRef.current = false
    const id = window.setInterval(() => {
      if (Date.now() >= expiresAt) {
        window.clearInterval(id)
        if (!firedRef.current) {
          firedRef.current = true
          resetExpiredCredits()
          setJustExpired(true)
          setTimeout(() => setJustExpired(false), 3000)
        }
      } else {
        setTick((t) => t + 1)
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [expiresAt, resetExpiredCredits])

  if (expiresAt == null) return null
  if (!Number.isFinite(expiresAt)) return null

  const remaining = expiresAt - Date.now()
  if (remaining <= 0 && !justExpired) return null

  if (justExpired) {
    return (
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 11,
        color: '#e05050', whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        Créditos expirados — saldo ajustado
      </span>
    )
  }

  const totalSec = Math.floor(remaining / 1000)
  const days     = Math.floor(totalSec / 86400)
  const hours    = Math.floor((totalSec % 86400) / 3600)
  const minutes  = Math.floor((totalSec % 3600) / 60)
  const seconds  = totalSec % 60
  const urgent   = days <= 7

  return (
    <div
      title={`Expiração de créditos: ${days} dia(s) ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`}
      style={{
        display: 'flex', alignItems: 'center', gap: 3,
        padding: '2px 6px',
        borderRadius: 4,
        flexShrink: 0,
        border: '1px solid rgba(255,106,0,0.22)',
        background: 'rgba(255,106,0,0.06)',
        color: urgent ? 'rgba(240,140,50,0.95)' : 'rgba(255,155,80,0.85)',
        opacity: 0.85,
        fontFamily: 'var(--font-mono)', fontSize: 10,
        letterSpacing: '-0.02em',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        cursor: 'default',
        animation: urgent ? 'pulse 1.5s ease-in-out infinite' : undefined,
      }}
    >
      <Timer
        width={10} height={10}
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      />
      <span>
        {days > 0 ? `${days}d ` : ''}{pad(hours)}h&nbsp;{pad(minutes)}m&nbsp;{pad(seconds)}s
      </span>
    </div>
  )
}