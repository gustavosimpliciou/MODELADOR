// ─────────────────────────────────────────────────────────────────
// Detecção automática do idioma do usuário pelo navegador.
// pt → português · es → espanhol · qualquer outro (inclui en) → inglês.
// Seguro em SSR (sem navigator/localStorage): cai para inglês.
// A preferência salva manualmente tem sempre prioridade sobre a detecção.
// ─────────────────────────────────────────────────────────────────

export function detectBrowserLanguage() {
  try {
    if (typeof navigator === 'undefined') return 'en'
    const raw =
      (Array.isArray(navigator.languages) && navigator.languages[0]) ||
      navigator.language ||
      ''
    const base = String(raw).toLowerCase().split(/[-_]/)[0]
    if (base === 'pt') return 'pt'
    if (base === 'es') return 'es'
    return 'en'
  } catch {
    return 'en'
  }
}
