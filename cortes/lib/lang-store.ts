"use client"

import { create } from 'zustand'
import { type Language, type Translations, translations } from './i18n'
import { detectBrowserLanguage } from './detect-language'

interface LangState {
  language: Language
  setLanguage: (lang: Language) => void
}

/** Mesma chave do Studio: a escolha manual vale nas duas ferramentas. */
const LANG_KEY = 'nativos.language'

function initialLanguage(): Language {
  // Preferência salva manualmente (em qualquer ferramenta) tem prioridade.
  try {
    if (typeof localStorage !== 'undefined') {
      const v = localStorage.getItem(LANG_KEY)
      if (v === 'pt' || v === 'en' || v === 'es') return v
    }
  } catch { /* ignora e detecta */ }
  // Sem preferência: abre direto no idioma do navegador (pt/es/en, resto inglês).
  return detectBrowserLanguage()
}

export const useLangStore = create<LangState>((set) => ({
  language: initialLanguage(),
  setLanguage: (language) => {
    try { localStorage.setItem(LANG_KEY, language) } catch { /* ignora */ }
    set({ language })
  },
}))

/** React hook — returns a translator function that re-renders when language changes. */
export function useT(): Translations {
  const language = useLangStore((s) => s.language)
  return translations[language] as unknown as Translations
}

/** Plain function — usable outside React (e.g. inside Zustand actions). */
export function getT(): Translations {
  return translations[useLangStore.getState().language] as unknown as Translations
}
