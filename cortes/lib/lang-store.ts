"use client"

import { create } from 'zustand'
import { type Language, type Translations, translations } from './i18n'
import { detectBrowserLanguage } from './detect-language'

interface LangState {
  language: Language
  setLanguage: (lang: Language) => void
}

function initialLanguage(): Language {
  // Sempre volta para o idioma padrão do navegador no reload
  // (brasileiro pt-BR → pt, espanhol → es, resto → en)
  return detectBrowserLanguage()
}

export const useLangStore = create<LangState>((set) => ({
  language: initialLanguage(),
  setLanguage: (language) => {
    // Troca apenas na sessão atual — no reload volta para o padrão do navegador
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
