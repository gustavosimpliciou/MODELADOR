"use client"

import { supabase } from './supabase'
import { useUserStore } from './user-store'

/**
 * Central de atividades — registra um evento de uso no Supabase
 * (tabela `public.user_events`). Fire-and-forget: nunca bloqueia o
 * fluxo da ferramenta. Anônimos (sem sessão) entram com user_id null.
 *
 * Eventos principais:
 *  - login / logout
 *  - upload        (arquivo carregado)
 *  - download      (export concluído) e download_attempt (clique/tentativa)
 *  - cut_created   (corte/peça gerado na ferramenta)
 *  - upgrade       (compra/plano — inserido também pelo webhook)
 */
export type TrackEventName =
  | 'login'
  | 'logout'
  | 'upload'
  | 'download'
  | 'download_attempt'
  | 'cut_created'
  | 'upgrade'

export function trackEvent(event: TrackEventName, details: Record<string, unknown> = {}): void {
  try {
    const u = useUserStore.getState().user
    const row = {
      user_id:    u?.id ?? null,
      user_name:  u?.name ?? null,
      user_email: u?.email ?? null,
      tool:       'cortes',
      event,
      details: {
        ...details,
        href: typeof window !== 'undefined' ? window.location.pathname : null,
      },
      created_at: new Date().toISOString(),
    }
    supabase.from('user_events').insert(row).then(() => {}, () => {})
  } catch {
    // Tracking nunca quebra a ferramenta.
  }
}
