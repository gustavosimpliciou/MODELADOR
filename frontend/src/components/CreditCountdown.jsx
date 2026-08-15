import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'

const pad = (n) => String(Math.max(0, Math.floor(n))).padStart(2, '0')

/**
 * Mini cronômetro regressivo dos créditos (plano pago ou cupom).
 * Aparece só quando `creditsExpiresAt` está ativo. Ao zerar, reseta o
 * saldo para EXPIRED_CREDIT_BALANCE (100) e mostra um aviso breve.
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

  const remaining = expiresAt - Date.now()
  if (remaining <= 0 && !justExpired) return null

  if (justExpired) {
    return (
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 11,
        color: '#e05050', marginRight: 6, whiteSpace: 'nowrap',
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
  const urgent   = remaining <= 7 * 86400000

  return (
    <div
      title={`Expiração de créditos: ${days} dia(s) ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '3px 8px', marginRight: 6, marginLeft: 2,
        background: 'rgba(255,106,0,0.07)',
        border: '1px solid rgba(255,106,0,0.28)',
        borderRadius: 4,
        fontFamily: 'var(--font-mono)', fontSize: 10.5,
        color: urgent ? '#f0a040' : 'rgba(255,150,60,0.9)',
        whiteSpace: 'nowrap',
        animation: urgent ? 'pulse 1.5s ease-in-out infinite' : undefined,
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="13" r="8"/>
        <path d="M12 9v4l2 2M9 2h6"/>
      </svg>
      <span>
        {days > 0 ? `${days}d ` : ''}{pad(hours)}h {pad(minutes)}m {pad(seconds)}s
      </span>
    </div>
  )
}