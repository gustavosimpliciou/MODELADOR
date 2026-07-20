"use client"

import { create } from 'zustand'
import { type Language, type Translations, translations } from './i18n'

interface LangState {
  language: Language
  setLanguage: (lang: Language) => void
}

export const useLangStore = create<LangState>((set) => ({
  language: 'pt',
  setLanguage: (language) => set({ language }),
}))

/** React hook — returns a translator function that re-renders when language changes. */
export function useT(): Translations {
  const language = useLangStore((s) => s.language)
  return translations[language]
}

/** Plain function — usable outside React (e.g. inside Zustand actions). */
export function getT(): Translations {
  return translations[useLangStore.getState().language]
}
