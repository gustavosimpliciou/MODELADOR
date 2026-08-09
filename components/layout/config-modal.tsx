"use client"

import { useEffect, useRef } from 'react'
import { X, Globe } from 'lucide-react'
import { useLangStore, useT } from '@/lib/lang-store'
import { type Language } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const LANGS: { id: Language; flag: string }[] = [
  { id: 'pt', flag: '🇧🇷' },
  { id: 'en', flag: '🇺🇸' },
  { id: 'es', flag: '🇪🇸' },
]

interface ConfigModalProps {
  open: boolean
  onClose: () => void
}

export function ConfigModal({ open, onClose }: ConfigModalProps) {
  const t = useT()
  const { language, setLanguage } = useLangStore()
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const langLabels: Record<Language, string> = {
    pt: t.portuguese,
    en: t.english,
    es: t.spanish,
  }

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className="fixed z-50 top-14 right-4 w-64 rounded-2xl border shadow-2xl"
        style={{
          background: 'oklch(0.09 0 0 / 98%)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          borderColor: 'oklch(0.22 0 0)',
          boxShadow: '0 12px 48px oklch(0 0 0 / 60%), inset 0 1px 0 oklch(1 0 0 / 5%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'oklch(0.16 0 0)' }}
        >
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            {t.settings}
          </span>
          <button
            onClick={onClose}
            className="text-muted-foreground/50 hover:text-foreground transition-colors p-0.5 rounded"
            aria-label={t.close}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4">
          {/* Language section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                {t.language}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {LANGS.map(({ id, flag }) => (
                <button
                  key={id}
                  onClick={() => setLanguage(id)}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-all border',
                    language === id
                      ? 'text-background font-medium border-transparent'
                      : 'text-muted-foreground border-border/50 hover:text-foreground hover:bg-secondary/50'
                  )}
                  style={
                    language === id
                      ? { background: 'oklch(0.70 0.22 42)', borderColor: 'transparent' }
                      : undefined
                  }
                >
                  <span className="text-base leading-none">{flag}</span>
                  <span className="text-xs font-mono">{langLabels[id]}</span>
                  {language === id && (
                    <span className="ml-auto text-[9px] font-mono opacity-70">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
