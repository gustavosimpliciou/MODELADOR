"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserStore, ADMIN_EMAIL } from '@/lib/user-store'

function hasValidSession(): boolean {
  try {
    const supabaseKeys = Object.keys(localStorage).filter(
      (k) => k.startsWith('sb-') && k.endsWith('-auth-token'),
    )
    for (const key of supabaseKeys) {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      try {
        const parsed = JSON.parse(raw)
        if (parsed?.access_token || parsed?.session?.access_token) return true
      } catch {}
    }
    const legacy = localStorage.getItem('nativos.token')
    if (legacy && legacy.length > 10) return true
    return false
  } catch {
    return false
  }
}

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [status, setStatus] = useState<null | boolean>(null)

  useEffect(() => {
    const init = async () => {
      const valid = hasValidSession()
      if (!valid) {
        window.location.replace('/')
        return
      }

      // Load user profile + credits from Supabase (non-blocking — app works even on error)
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const { data: row } = await supabase
            .from('users')
            .select('id, name, email, plan, credits, free_download_used, first_upgrade_purchased, credits_expires_at')
            .eq('id', authUser.id)
            .maybeSingle()

          const isAdmin  = (authUser.email ?? '') === ADMIN_EMAIL
          const credits  = isAdmin ? 99999 : (row?.credits ?? 0)
          const freeUsed = isAdmin ? false  : (row?.free_download_used ?? false)
          const firstPurchased = row?.first_upgrade_purchased ?? false

          useUserStore.getState().setUser({
            id:       authUser.id,
            name:     row?.name ?? authUser.email?.split('@')[0] ?? 'Usuário',
            email:    authUser.email ?? '',
            is_admin: isAdmin,
            plan:     row?.plan ?? 'free',
          })
          useUserStore.getState().setCredits(credits)
          useUserStore.getState().setFreeDownloadUsed(freeUsed)
          useUserStore.getState().setFirstUpgradePurchased(firstPurchased)

          // Keep localStorage in sync with Supabase (shared with main Studio app)
          try {
            localStorage.setItem('nativos.credits',               String(credits))
            localStorage.setItem('nativos.freeDownloadUsed',      String(freeUsed))
            localStorage.setItem('nativos.firstUpgradePurchased', String(firstPurchased))
          } catch {}

          // Sincroniza o cronômetro de expiração (reseta para 100 se venceu)
          await useUserStore.getState().syncCreditExpiry(row, authUser.email)
        }
      } catch {
        // Non-fatal: credits from localStorage are used as fallback
      }

      setStatus(true)
    }

    init()
  }, [])

  if (status !== true) {
    return (
      <div
        className="flex h-dvh w-screen items-center justify-center"
        style={{ background: 'oklch(0.08 0 0)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <svg
            viewBox="0 0 40 40"
            className="w-10 h-10 opacity-30 animate-spin"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="20" cy="20" r="14" strokeDasharray="44 44" strokeLinecap="round" />
          </svg>
          <span className="text-xs font-mono text-muted-foreground/40 tracking-widest uppercase">
            Verificando sessão…
          </span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
