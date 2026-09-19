"use client"

import { useState } from 'react'
import { useUserStore } from '@/lib/user-store'
import { useT } from '@/lib/lang-store'
import { cn } from '@/lib/utils'

const ACCENT = 'oklch(0.70 0.22 42)'

const ERROR_MESSAGES: Record<string, string> = {
  not_authenticated: 'coupon_error_not_authenticated',
  invalid_code:      'coupon_error_invalid_code',
  already_used:      'coupon_error_already_used',
  upgrade_already_purchased: 'coupon_error_upgrade',
  server_error:      'coupon_error_server',
}

export function CouponModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t             = useT()
  const redeemCoupon  = useUserStore((s) => s.redeemCoupon)
  const [code, setCode]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!open) return null

  const handleRedeem = async () => {
    if (!code.trim() || loading) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    const result = await redeemCoupon(code.trim())
    setLoading(false)
    if (result.ok) {
      setSuccess(t.coupon_success(result.credits ?? 700))
      setCode('')
    } else {
      const key = ERROR_MESSAGES[result.error || 'server_error'] || 'coupon_error_server'
      setError(t[key as keyof typeof t] as string)
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-5"
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col gap-4 w-full max-w-md rounded-2xl border p-6"
        style={{
          background: 'oklch(0.08 0 0)',
          borderColor: 'oklch(0.2 0 0)',
          boxShadow: '0 30px 80px oklch(0 0 0 / 80%)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg text-lg text-muted-foreground/60 transition-colors hover:text-foreground"
          style={{ background: 'oklch(0.14 0 0)', border: '1px solid oklch(0.22 0 0)' }}
        >
          ×
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 46, height: 46,
              background: `${ACCENT} / 12%`,
              border: `1px solid ${ACCENT} / 30%`,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 9a3 3 0 0 1 0 6v3h20v-3a3 3 0 0 1 0-6V6H2v3z"/>
              <path d="M13 6v2M13 10v2M13 14v2M13 18v2"/>
            </svg>
          </div>
          <div>
            <div className="font-mono text-lg font-black uppercase tracking-[0.08em] text-foreground">
              {t.coupon_title}
            </div>
            <div className="text-xs text-muted-foreground">{t.coupon_subtitle}</div>
          </div>
        </div>

        {/* Benefit */}
        <div
          className="flex flex-col items-center gap-0.5 rounded-xl py-3"
          style={{ border: `1px solid ${ACCENT} / 25%`, background: `${ACCENT} / 8%` }}
        >
          <span className="text-3xl font-black font-mono tracking-wide" style={{ color: ACCENT }}>
            {t.coupon_benefit_credits}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {t.coupon_benefit_days}
          </span>
        </div>

        {/* Input */}
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            setError(null)
            setSuccess(null)
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
          placeholder={t.coupon_placeholder}
          autoFocus
          className="w-full rounded-lg border px-3 py-2.5 text-center font-mono text-sm uppercase tracking-[0.2em]"
          style={{
            background: 'oklch(0.11 0 0)',
            borderColor: 'oklch(0.25 0 0)',
            color: 'oklch(0.95 0 0)',
            outline: 'none',
          }}
        />

        {/* Messages */}
        {error && (
          <div className="rounded-lg border px-3 py-2 text-xs text-center"
            style={{ borderColor: 'oklch(0.55 0.2 25 / 40%)', background: 'oklch(0.55 0.2 25 / 10%)', color: 'oklch(0.72 0.16 28 / 95%)' }}
          >
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border px-3 py-2 text-xs text-center"
            style={{ borderColor: 'oklch(0.55 0.16 145 / 40%)', background: 'oklch(0.55 0.16 145 / 10%)', color: 'oklch(0.72 0.14 145 / 95%)' }}
          >
            {success}
          </div>
        )}

        {/* Terms + CTA */}
        <div className="text-center text-[10px] text-muted-foreground/70 leading-relaxed">
          {t.coupon_terms}
        </div>
        <button
          onClick={handleRedeem}
          disabled={loading || !code.trim()}
          className={cn(
            'w-full rounded-lg py-2.5 font-mono text-xs font-black uppercase tracking-[0.12em] transition-all',
            loading || !code.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90',
          )}
          style={{ background: ACCENT, color: 'oklch(0.08 0 0)' }}
        >
          {loading ? t.coupon_redeeming : t.coupon_redeem}
        </button>
      </div>
    </div>
  )
}