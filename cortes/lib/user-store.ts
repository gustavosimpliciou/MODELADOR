"use client"

import { create } from 'zustand'
import { supabase } from './supabase'

export const ADMIN_EMAIL = 'nativos3d.adm@gmail.com'
const EXPORT_COST = 40

// localStorage helpers — same keys as the main Studio app so credits stay in sync
const ls    = (key: string, fb: string) => { try { const v = localStorage.getItem(key); return v !== null ? v : fb } catch { return fb } }
const lsSet = (key: string, v: string)  => { try { localStorage.setItem(key, v) } catch {} }

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
  freeDownloadUsed: boolean
  firstUpgradePurchased: boolean
  showUpgradeModal: boolean

  setUser:                  (user: UserInfo | null) => void
  setCredits:               (credits: number)       => void
  setFreeDownloadUsed:      (v: boolean)            => void
  setFirstUpgradePurchased: (v: boolean)            => void
  setShowUpgradeModal:      (v: boolean)            => void

  /** Open checkout URL in a new tab and dismiss the modal. */
  goToCheckout: (url: string) => void

  /** Re-fetch credits/plan from Supabase (call after returning from checkout). */
  refreshCredits: () => Promise<void>

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
  freeDownloadUsed:      ls('nativos.freeDownloadUsed', 'false') === 'true',
  firstUpgradePurchased: ls('nativos.firstUpgradePurchased', 'false') === 'true',
  showUpgradeModal:      false,

  setUser:                  (user)                  => set({ user }),
  setCredits:               (credits)               => set({ credits }),
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
        .select('credits, free_download_used, first_upgrade_purchased, plan')
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
    } catch { /* non-blocking */ }
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
