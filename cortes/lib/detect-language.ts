/**
 * Detecção automática do idioma do usuário pelo navegador.
 * pt → português · es → espanhol · qualquer outro (inclui en) → inglês.
 * Seguro em SSR (sem navigator): cai para inglês.
 * A preferência salva manualmente tem sempre prioridade sobre a detecção.
 */
import type { Language } from './i18n'

export function detectBrowserLanguage(): Language {
  try {
    if (typeof navigator === 'undefined') return 'en'
    const nav = navigator as Navigator & { languages?: readonly string[] }
    const raw =
      (Array.isArray(nav.languages) && nav.languages[0]) ||
      nav.language ||
      ''
    const base = String(raw).toLowerCase().split(/[-_]/)[0]
    if (base === 'pt') return 'pt'
    if (base === 'es') return 'es'
    return 'en'
  } catch {
    return 'en'
  }
}
