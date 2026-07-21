"use client"

import { useEffect, useState } from 'react'

/**
 * AuthGuard — client-side session check for the Cortes tool.
 *
 * Reads the Supabase session from localStorage (written there by the main
 * Studio app via @supabase/supabase-js). If no valid session is found the
 * user is redirected to the root of the main app (/) which handles login.
 *
 * Rules:
 *  • Presence of any key that starts with "sb-" containing an access_token
 *    → session is valid, render children.
 *  • Legacy key "nativos.token" also counts.
 *  • Anything else (or no localStorage access) → redirect to "/".
 */

function hasValidSession(): boolean {
  try {
    // Check for Supabase v2 session (key: sb-<project>-auth-token)
    const supabaseKeys = Object.keys(localStorage).filter((k) =>
      k.startsWith('sb-') && k.endsWith('-auth-token'),
    )
    for (const key of supabaseKeys) {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      try {
        const parsed = JSON.parse(raw)
        if (parsed?.access_token || parsed?.session?.access_token) return true
      } catch {
        // malformed — ignore
      }
    }

    // Legacy token written by the backend
    const legacy = localStorage.getItem('nativos.token')
    if (legacy && legacy.length > 10) return true

    return false
  } catch {
    // localStorage not available (SSR or restrictive env) — block access
    return false
  }
}

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  // null = still checking, false = no session, true = authenticated
  const [status, setStatus] = useState<null | boolean>(null)

  useEffect(() => {
    const valid = hasValidSession()
    if (!valid) {
      // Redirect to main app login immediately
      window.location.replace('/')
    } else {
      setStatus(true)
    }
  }, [])

  // While checking or redirecting, show a minimal dark loading screen
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
