"use client"

import { create } from 'zustand'
import { supabase } from './supabase'

export const ADMIN_EMAIL = 'nativos3d.adm@gmail.com'
/** Conta de teste do proprietário — mostra o cronômetro mesmo sem pagamento. */
export const TEST_ACCOUNT_EMAIL = 'simpliciou@icloud.com'
/** Créditos comprados expiram após este período (3 meses). */
export const CREDIT_EXPIRY_DAYS = 90
/** Saldo ao qual o crédito cai quando expira (independente do valor anterior). */
export const EXPIRED_CREDIT_BALANCE = 100
const EXPORT_COST = 40

const DAY_MS = 86400000

// localStorage helpers — same keys as the main Studio app so credits stay in sync
const ls    = (key: string, fb: string) => { try { const v = localStorage.getItem(key); return v !== null ? v : fb } catch { return fb } }
const lsSet = (key: string, v: string)  => { try { localStorage.setItem(key, v) } catch {} }

/** Lê um timestamp (ms) do localStorage; retorna null se ausente/inválido. */
function lsExpiry(key: string): number | null {
  const n = parseInt(ls(key, ''), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Extrai o timestamp (ms) de expiração de uma linha do Supabase. */
export function creditExpiryMs(row: { credits_expires_at?: string | null } | null | undefined): number | null {
  if (!row || !row.credits_expires_at) return null
  const t = Date.parse(row.credits_expires_at)
  return Number.isFinite(t) ? t : null
}

export interface UserInfo {
  id: string
  name: string
  email: string
  is_admin: boolean
  plan: string
}

interface UserState {
  user: UserInfo | null
  credits: number
  /** Timestamp (ms) de expiração dos créditos comprados; null = sem cronômetro. */
  creditsExpiresAt: number | null
  /** Popup "saldo expirado" — exibido quando o cronômetro zera. */
  expiredNotice: boolean
  freeDownloadUsed: boolean
  firstUpgradePurchased: boolean
  showUpgradeModal: boolean

  setUser:                  (user: UserInfo | null) => void
  setCredits:               (credits: number)       => void
  setCreditsExpiresAt:      (ms: number | null)     => void
  setExpiredNotice:         (v: boolean)            => void
  setFreeDownloadUsed:      (v: boolean)            => void
  setFirstUpgradePurchased: (v: boolean)            => void
  setShowUpgradeModal:      (v: boolean)            => void

  /** Open checkout URL in a new tab and dismiss the modal. */
  goToCheckout: (url: string) => void

  /** Re-fetch credits/plan from Supabase (call after returning from checkout). */
  refreshCredits: () => Promise<void>

  /**
   * Sincroniza a expiração a partir da linha do usuário. Se o prazo já
   * venceu, reseta o saldo para EXPIRED_CREDIT_BALANCE. Garante o
   * cronômetro da conta de teste do proprietário.
   */
  syncCreditExpiry: (row: { credits_expires_at?: string | null } | null | undefined, email?: string) => Promise<void>

  /** Zera o prazo vencido: saldo vai para EXPIRED_CREDIT_BALANCE. */
  resetExpiredCredits: () => Promise<void>

  /**
   * Gate an export action behind the credit system.
   * Returns 'ok' | 'free' | 'upgrade_required'.
   * Deducts 40 credits on 'ok'; sets showUpgradeModal on 'upgrade_required'.
   */
  tryExport: () => Promise<'ok' | 'free' | 'upgrade_required'>
}

export const useUserStore = create<UserState>((set, get) => ({
  user:                  null,
  credits:               parseInt(ls('nativos.credits', '0'), 10),
  creditsExpiresAt:      lsExpiry('nativos.creditsExpiresAt'),
  expiredNotice:         false,
  freeDownloadUsed:      ls('nativos.freeDownloadUsed', 'false') === 'true',
  firstUpgradePurchased: ls('nativos.firstUpgradePurchased', 'false') === 'true',
  showUpgradeModal:      false,

  setUser:                  (user)                  => set({ user }),
  setCredits:               (credits)               => set({ credits }),
  setCreditsExpiresAt:      (creditsExpiresAt)      => set({ creditsExpiresAt }),
  setExpiredNotice:         (expiredNotice)         => set({ expiredNotice }),
  setFreeDownloadUsed:      (freeDownloadUsed)      => set({ freeDownloadUsed }),
  setFirstUpgradePurchased: (firstUpgradePurchased) => set({ firstUpgradePurchased }),
  setShowUpgradeModal:      (showUpgradeModal)      => set({ showUpgradeModal }),

  goToCheckout: (url) => {
    set({ showUpgradeModal: false })
    window.open(url, '_blank', 'noopener,noreferrer')
  },

  refreshCredits: async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
      const { data: row } = await supabase
        .from('users')
        .select('credits, free_download_used, first_upgrade_purchased, plan, credits_expires_at')
        .eq('id', authUser.id)
        .single()
      if (!row) return
      const isAdmin  = authUser.email === ADMIN_EMAIL
      const credits  = isAdmin ? 99999 : (row.credits ?? 0)
      const freeUsed = isAdmin ? false  : (row.free_download_used ?? false)
      lsSet('nativos.credits',               String(credits))
      lsSet('nativos.freeDownloadUsed',      String(freeUsed))
      lsSet('nativos.firstUpgradePurchased', String(row.first_upgrade_purchased ?? false))
      set({
        credits,
        freeDownloadUsed:      freeUsed,
        firstUpgradePurchased: row.first_upgrade_purchased ?? false,
      })
      await get().syncCreditExpiry(row, authUser.email)
    } catch { /* non-blocking */ }
  },

  syncCreditExpiry: async (row, email) => {
    let expiry = creditExpiryMs(row)

    const isTest = email === TEST_ACCOUNT_EMAIL

    // Conta de teste do proprietário — garante cronômetro SEMPRE ativo:
    // se não há prazo, ou se o prazo anterior já venceu, concede um novo
    // (renova a cada vez, para o dono sempre conseguir testar a exibição).
    if (isTest && (expiry == null || expiry <= Date.now())) {
      expiry = Date.now() + CREDIT_EXPIRY_DAYS * DAY_MS
      // Expiração de 3 meses à frente (teste) — regravada no banco
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          await supabase
            .from('users')
            .update({ credits_expires_at: new Date(expiry).toISOString(), credits: EXPIRED_CREDIT_BALANCE })
            .eq('id', authUser.id)
        }
      } catch { /* coluna pode ainda não existir — estado local já basta */ }
    }

    if (!isTest && expiry != null && expiry <= Date.now()) {
      await get().resetExpiredCredits()
      return
    }

    if (expiry != null) {
      lsSet('nativos.creditsExpiresAt', String(expiry))
    } else {
      lsSet('nativos.creditsExpiresAt', '')
    }
    set({ creditsExpiresAt: expiry })
  },

  resetExpiredCredits: async () => {
    const s = get()
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        await supabase
          .from('users')
          .update({
            credits: EXPIRED_CREDIT_BALANCE,
            credits_expires_at: null,
          })
          .eq('id', authUser.id)
        try {
          await supabase
            .from('credit_history')
            .insert({
              id: globalThis.crypto?.randomUUID?.() ?? `exp-${Date.now()}`,
              user_id: authUser.id,
              type: 'expiry_reset',
              credits: EXPIRED_CREDIT_BALANCE - s.credits,
              description: `Crédito expirado — saldo ajustado para ${EXPIRED_CREDIT_BALANCE}`,
              created_at: new Date().toISOString(),
            })
        } catch { /* não bloqueia o reset */ }
      }
    } catch { /* não bloqueia o reset */ }

    lsSet('nativos.credits', String(EXPIRED_CREDIT_BALANCE))
    lsSet('nativos.creditsExpiresAt', '')
    set({ credits: EXPIRED_CREDIT_BALANCE, creditsExpiresAt: null, expiredNotice: true })
  },

  tryExport: async () => {
    const s = get()

    // ── Admin bypass — unlimited exports ────────────────────────────
    if (s.user?.is_admin) return 'ok'

    // ── Guest (not logged in) — one free download ────────────────────
    if (!s.user) {
      if (!s.freeDownloadUsed) {
        lsSet('nativos.freeDownloadUsed', 'true')
        set({ freeDownloadUsed: true })
        return 'free'
      }
      set({ showUpgradeModal: true })
      return 'upgrade_required'
    }

    // ── Authenticated user ───────────────────────────────────────────
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('not authenticated')

      const { data: row, error } = await supabase
        .from('users')
        .select('credits, free_download_used')
        .eq('id', authUser.id)
        .single()
      if (error) throw error

      // First free download
      if (!row.free_download_used) {
        await supabase.from('users').update({ free_download_used: true }).eq('id', authUser.id)
        lsSet('nativos.freeDownloadUsed', 'true')
        set({ freeDownloadUsed: true })
        return 'free'
      }

      const credits = row.credits ?? 0
      if (credits < EXPORT_COST) {
        set({ showUpgradeModal: true })
        return 'upgrade_required'
      }

      const newCredits = credits - EXPORT_COST
      await supabase.from('users').update({ credits: newCredits }).eq('id', authUser.id)
      lsSet('nativos.credits',          String(newCredits))
      lsSet('nativos.freeDownloadUsed', 'true')
      set({ credits: newCredits, freeDownloadUsed: true })
      return 'ok'
    } catch {
      set({ showUpgradeModal: true })
      return 'upgrade_required'
    }
  },
}))
