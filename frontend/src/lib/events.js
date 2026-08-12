import { supabase } from './supabase'

/**
 * Central de atividades — registra evento de uso no Supabase
 * (tabela `public.user_events`). Fire-and-forget, nunca bloqueia o app.
 * tool = 'studio' (modelador). Anônimos entram com user_id null.
 */
export function trackEvent(
  event,
  details = {},
  opts = {},
) {
  try {
    const row = {
      user_id:    null,
      user_name:  opts.name ?? null,
      user_email: null,
      tool:       'studio',
      event,
      details: {
        ...details,
        href: typeof window !== 'undefined' ? window.location.pathname : null,
      },
      created_at: new Date().toISOString(),
    }
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        if (user) {
          row.user_id = user.id
          row.user_email = user.email ?? null
          if (!row.user_name) row.user_name = user.user_metadata?.name ?? null
        }
        return supabase.from('user_events').insert(row)
      })
      .catch(() => {})
  } catch {
    // tracking nunca quebra o app
  }
}