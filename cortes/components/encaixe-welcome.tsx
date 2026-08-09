"use client"

/**
 * EncaixeWelcome — Popup de novidades (Encaixe 2.0).
 * Aparece UMA VEZ por usuário (por versão do anúncio) ao entrar na
 * ferramenta de corte, com um passo a passo objetivo.
 */

import { useEffect, useState } from 'react'
import { Sparkles, X, Check, Box, MousePointerClick, SlidersHorizontal } from 'lucide-react'
import { useUserStore } from '@/lib/user-store'

const ANNOUNCEMENT_KEY = 'nativos.announce.encaixe20'

const STEPS = [
  {
    icon: MousePointerClick,
    title: 'Corte a peça',
    desc: 'Divida o modelo com a ferramenta de corte (SmartCut ou plano).',
  },
  {
    icon: Box,
    title: 'Selecione as faces',
    desc: 'Selecione a área de encaixe nos dois lados do corte.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Ajuste o encaixe',
    desc: 'Defina diâmetro, altura e folga (tolerância).',
  },
  {
    icon: Check,
    title: 'Aplique',
    desc: 'O sistema gera o macho (pino) e a fêmea (furo) automaticamente.',
  },
]

export function EncaixeWelcome() {
  const user = useUserStore((s) => s.user)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    try {
      if (localStorage.getItem(`${ANNOUNCEMENT_KEY}.${user.id}`) === '1') return
    } catch { /* sem storage — exibe mesmo assim */ }
    setOpen(true)
  }, [user?.id])

  const dismiss = () => {
    if (user?.id) {
      try { localStorage.setItem(`${ANNOUNCEMENT_KEY}.${user.id}`, '1') } catch { /* ignore */ }
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'oklch(0 0 0 / 70%)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss() }}
    >
      <div
        className="w-full max-w-[400px] rounded-2xl border p-5 flex flex-col gap-4"
        style={{
          background: 'oklch(0.09 0 0 / 97%)',
          borderColor: 'oklch(0.38 0.08 260 / 70%)',
          boxShadow: '0 24px 80px oklch(0 0 0 / 60%), inset 0 1px 0 oklch(1 0 0 / 4%)',
        }}
      >
        {/* Badge + fechar */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest"
            style={{
              background: 'oklch(0.55 0.15 260 / 18%)',
              color: 'oklch(0.65 0.18 260)',
              border: '1px solid oklch(0.55 0.15 260 / 35%)',
            }}
          >
            <Sparkles className="w-2.5 h-2.5" /> Nova atualização
          </span>
          <button
            onClick={dismiss}
            className="p-1 rounded text-muted-foreground/50 hover:text-foreground hover:bg-secondary/50 transition-colors"
            title="Fechar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Título + intro */}
        <div>
          <h2 className="m-0 text-base font-mono font-bold tracking-wide" style={{ color: 'oklch(0.85 0.12 260)' }}>
            Encaixe 2.0
          </h2>
          <p className="m-0 mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Encaixe macho/fêmea paramétrico, agora mais rápido e preciso. Monte suas peças sem parafusos.
          </p>
        </div>

        {/* Passo a passo */}
        <ol className="m-0 p-0 flex flex-col gap-2 list-none">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="flex items-start gap-2.5 rounded-lg border border-border/60 px-2.5 py-2"
              style={{ background: 'oklch(1 0 0 / 2%)' }}
            >
              <span
                className="flex items-center justify-center w-5 h-5 shrink-0 rounded-full text-[9px] font-mono font-bold"
                style={{ background: 'oklch(0.55 0.15 260 / 25%)', color: 'oklch(0.75 0.12 260)' }}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <span className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-foreground">
                  <s.icon className="w-3 h-3 shrink-0" style={{ color: 'oklch(0.65 0.18 260)' }} />
                  {s.title}
                </span>
                <p className="m-0 mt-0.5 text-[10px] leading-snug text-muted-foreground/80">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Dica */}
        <p className="m-0 text-[10px] leading-relaxed text-muted-foreground/70">
          Dica: inverta o sentido com um clique e ajuste a folga para um encaixe firme ou deslizante.
        </p>

        {/* Fechar */}
        <button
          onClick={dismiss}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-mono font-medium text-background hover:opacity-90 transition-all"
          style={{ background: 'oklch(0.55 0.15 260)' }}
        >
          <Check className="w-3.5 h-3.5" /> Entendi
        </button>
      </div>
    </div>
  )
}
