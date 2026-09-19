"use client"

import { AlertTriangle, X, Minimize2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { REDUCER_URL, MAX_SUPPORTED_FACES, formatFaceCount } from '@/lib/face-limit'
import { useT } from '@/lib/lang-store'

/**
 * FaceLimitModal — exibido quando o upload excede MAX_SUPPORTED_FACES.
 * Informa a contagem de faces e direciona para o redutor externo (nova aba).
 */
export function FaceLimitModal() {
  const t = useT()
  const faceLimitInfo = useAppStore((s) => s.faceLimitInfo)
  const setFaceLimitInfo = useAppStore((s) => s.setFaceLimitInfo)

  if (!faceLimitInfo) return null

  const onClose = () => setFaceLimitInfo(null)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="face-limit-title"
        className="relative flex flex-col gap-4 p-6 rounded-2xl border w-[380px] max-w-full shadow-2xl animate-fade-in"
        style={{
          background: 'oklch(0.09 0 0 / 98%)',
          borderColor: 'oklch(0.55 0.15 30 / 50%)',
          boxShadow: '0 16px 64px oklch(0 0 0 / 70%), 0 0 24px oklch(0.55 0.15 30 / 15%)',
        }}
      >
        <button
          onClick={onClose}
          aria-label={t.close}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'oklch(0.55 0.15 30 / 12%)',
              border: '1px solid oklch(0.55 0.15 30 / 40%)',
            }}
          >
            <AlertTriangle className="w-5 h-5" style={{ color: 'oklch(0.70 0.18 30)' }} />
          </div>
          <h2
            id="face-limit-title"
            className="text-sm font-mono font-semibold text-foreground leading-snug"
          >
            {t.face_limit_title}
          </h2>
        </div>

        <p className="text-xs font-mono leading-relaxed text-muted-foreground">
          {t.face_limit_body(formatFaceCount(faceLimitInfo.faces), faceLimitInfo.fileName)}
        </p>

        <div
          className="rounded-xl px-3 py-2.5 text-[11px] font-mono leading-relaxed"
          style={{
            background: 'oklch(0.12 0 0)',
            border: '1px solid oklch(0.20 0 0)',
            color: 'oklch(0.60 0 0)',
          }}
        >
          {t.face_limit_hint}{' '}
          <a
            href={REDUCER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
            style={{ color: 'oklch(0.70 0.22 42)' }}
          >
            <Minimize2 className="w-3 h-3" />
            {t.face_limit_cta}
          </a>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 rounded-xl text-xs font-mono border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            {t.face_limit_close}
          </button>
          <a
            href={REDUCER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2 rounded-xl text-xs font-mono font-semibold text-center transition-opacity hover:opacity-90"
            style={{ background: 'oklch(0.70 0.22 42)', color: 'oklch(0.08 0 0)' }}
          >
            {t.face_limit_cta}
          </a>
        </div>

        <span className="text-[10px] font-mono text-center" style={{ color: 'oklch(0.35 0 0)' }}>
          {t.face_limit_max(MAX_SUPPORTED_FACES.toLocaleString('pt-BR'))}
        </span>
      </div>
    </div>
  )
}
