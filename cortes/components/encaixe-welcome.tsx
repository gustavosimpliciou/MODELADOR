"use client"

/**
 * EncaixeWelcome — Popup de novidades (Cores + Encaixe 3.0).
 * Aparece UMA VEZ por usuário/navegador (por versão do anúncio) ao entrar na
 * ferramenta de corte, apresentando as duas grandes novidades.
 */

import { useEffect, useState } from 'react'
import { Sparkles, X, Check, Box, MousePointerClick, SlidersHorizontal, Palette, Layers } from 'lucide-react'
import { useUserStore } from '@/lib/user-store'

const ANNOUNCEMENT_KEY = 'nativos.announce.cores-encaixe30-v1'

const STEPS_CORES = [
  {
    icon: MousePointerClick,
    title: 'Selecione com Smart',
    desc: 'Use a seleção Smart (Peça/Curv + Sensibilidade) — mesma do corte.',
  },
  {
    icon: Palette,
    title: 'Escolha a cor',
    desc: 'Paleta com 12 presets + color picker e opção Nenhuma (sem cor).',
  },
  {
    icon: Layers,
    title: 'Pinte e exporte 3MF',
    desc: 'Pintar seleção aplica a cor; exporte em Modelo colorido 3MF com cores por triângulo.',
  },
]

const STEPS_ENCAIXE = [
  {
    icon: Box,
    title: 'Encaixe 3.0 — centralizado',
    desc: 'Macho e fêmea no mesmo eixo/centralização do corte para união perfeita.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Reparo otimizado',
    desc: 'Bordas não-manifold corrigidas antes de exportar — sem erro no fatiador.',
  },
]

export function EncaixeWelcome() {
  const user = useUserStore((s) => s.user)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Mostra para todos (logados ou visitantes) — por navegador, uma vez por versão
    const key = user?.id ? `${ANNOUNCEMENT_KEY}.${user.id}` : ANNOUNCEMENT_KEY
    try {
      if (localStorage.getItem(key) === '1') return
    } catch { /* sem storage — exibe mesmo assim */ }
    // Pequeno delay para não competir com splash/loading
    const t = setTimeout(() => setOpen(true), 600)
    return () => clearTimeout(t)
  }, [user?.id])

  const dismiss = () => {
    const key = user?.id ? `${ANNOUNCEMENT_KEY}.${user.id}` : ANNOUNCEMENT_KEY
    try { localStorage.setItem(key, '1') } catch { /* ignore */ }
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
            Novidades: Cores + Encaixe 3.0
          </h2>
          <p className="m-0 mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Pinte modelos por seleção e encaixes perfeitamente centralizados — exportação 3MF com cores e bordas reparadas.
          </p>
        </div>

        {/* Modo Cores */}
        <div>
          <p className="m-0 mb-1.5 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest" style={{ color: 'oklch(0.65 0.14 260)' }}>
            <Palette className="w-3 h-3" /> Modo Cores
          </p>
          <ol className="m-0 p-0 flex flex-col gap-1.5 list-none">
            {STEPS_CORES.map((s, i) => (
              <li key={s.title} className="flex items-start gap-2 rounded-lg border border-border/60 px-2.5 py-2" style={{ background: 'oklch(1 0 0 / 2%)' }}>
                <span className="flex items-center justify-center w-5 h-5 shrink-0 rounded-full text-[9px] font-mono font-bold" style={{ background: 'oklch(0.55 0.15 260 / 25%)', color: 'oklch(0.75 0.12 260)' }}>
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
        </div>

        {/* Encaixe 3.0 */}
        <div>
          <p className="m-0 mb-1.5 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest" style={{ color: 'oklch(0.70 0.22 42)' }}>
            <Box className="w-3 h-3" /> Encaixe 3.0
          </p>
          <ol className="m-0 p-0 flex flex-col gap-1.5 list-none">
            {STEPS_ENCAIXE.map((s, i) => (
              <li key={s.title} className="flex items-start gap-2 rounded-lg border border-border/60 px-2.5 py-2" style={{ background: 'oklch(1 0 0 / 2%)' }}>
                <span className="flex items-center justify-center w-5 h-5 shrink-0 rounded-full text-[9px] font-mono font-bold" style={{ background: 'oklch(0.70 0.22 42 / 18%)', color: 'oklch(0.75 0.22 42)' }}>
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-foreground">
                    <s.icon className="w-3 h-3 shrink-0" style={{ color: 'oklch(0.70 0.22 42)' }} />
                    {s.title}
                  </span>
                  <p className="m-0 mt-0.5 text-[10px] leading-snug text-muted-foreground/80">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Dicas */}
        <div className="flex flex-col gap-1 rounded-lg px-2.5 py-2" style={{ background: 'oklch(0.12 0 0)', border: '1px solid oklch(0.16 0 0)' }}>
          <p className="m-0 text-[10px] leading-relaxed text-muted-foreground/70">
            <span style={{ color: 'oklch(0.65 0.14 260)' }}>● Cores:</span> use <b>Nenhuma</b> para remover cor e exporte em <b>3MF colorido</b>.
          </p>
          <p className="m-0 text-[10px] leading-relaxed text-muted-foreground/70">
            <span style={{ color: 'oklch(0.70 0.22 42)' }}>● Encaixe:</span> fica no local selecionado, mesma reta/centralização do corte.
          </p>
        </div>

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
