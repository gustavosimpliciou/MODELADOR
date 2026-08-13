"use client"

import { TimerOff, X } from 'lucide-react'
import { useUserStore } from '@/lib/user-store'

const ACCENT = 'oklch(0.70 0.22 42)'
const DANGER = 'oklch(0.65 0.18 28)'

/**
 * Popup exibido quando o cronômetro de créditos zera: informa o usuário
 * que o saldo expirou e que ele voltou a 100 créditos.
 */
export function ExpiredCreditsPopup() {
  const expiredNotice     = useUserStore((s) => s.expiredNotice)
  const setExpiredNotice  = useUserStore((s) => s.setExpiredNotice)
  const credits           = useUserStore((s) => s.credits)

  if (!expiredNotice) return null

  const dismiss = () => {
    setExpiredNotice(false)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" aria-modal="true" role="dialog" aria-label="Saldo expirado">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={dismiss} aria-hidden="true" />

      <div
        className="relative w-96 rounded-xl border border-border animate-fade-in overflow-hidden"
        style={{ background: 'oklch(0.10 0 0)', boxShadow: '0 24px 48px oklch(0 0 0 / 80%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <TimerOff className="w-4 h-4" style={{ color: DANGER }} />
            <span className="font-mono text-sm font-medium text-foreground uppercase tracking-wider">
              Saldo expirado
            </span>
          </div>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          <div
            className="px-3 py-3 rounded-lg border text-[12px] font-mono leading-relaxed"
            style={{ borderColor: `${DANGER}55`, background: `${DANGER}0f` }}
          >
            <p className="text-foreground">
              Seu saldo de créditos <span className="font-semibold" style={{ color: DANGER }}>expirou</span> (período de 3 meses encerrado).
            </p>
            <p className="text-muted-foreground mt-2">
              O saldo foi restaurado para <span className="font-semibold" style={{ color: ACCENT }}>100 créditos</span>.
              Para continuar exportando à vontade, renove seu plano.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={dismiss}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-mono border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              Entendi
            </button>
            <button
              onClick={() => {
                setExpiredNotice(false)
                useUserStore.getState().setShowUpgradeModal(true)
              }}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all hover:opacity-90"
              style={{ background: ACCENT, color: '#000' }}
            >
              Ver planos
            </button>
          </div>

          <p className="text-[10px] font-mono text-muted-foreground/60">
            Saldo atual: <span className="tabular-nums" style={{ color: ACCENT }}>{credits.toLocaleString('pt-BR')}</span> créditos
          </p>
        </div>
      </div>
    </div>
  )
}