import { Suspense, useState, useEffect, useCallback } from 'react'
import { useStore } from './store/useStore'
import Navbar from './components/Navbar'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import Viewport from './components/Viewport'
import Footer from './components/Footer'
import SplashScreen from './components/SplashScreen'
import MobileBlock, { useIsMobile } from './components/MobileBlock'
import UpgradeModal from './components/UpgradeModal'
import ProjectsModal from './components/ProjectsModal'
import LoginScreen from './components/LoginScreen'
import { useT } from './i18n/useT'
import { supabase } from './lib/supabase'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const handleSplashDone = useCallback(() => setLoaded(true), [])
  const isMobile      = useIsMobile()
  const token         = useStore((s) => s.token)
  const user          = useStore((s) => s.user)
  const authChecked   = useStore((s) => s.authChecked)
  const loginUser     = useStore((s) => s.loginUser)
  const logout        = useStore((s) => s.logout)
  const setAuthChecked = useStore((s) => s.setAuthChecked)

  // On mount: validate stored Supabase session
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        logout()
        return
      }
      try {
        const { data: row } = await supabase
          .from('users').select('*').eq('id', session.user.id).maybeSingle()
        if (row) {
          const userData = {
            id:                    row.id,
            name:                  row.name,
            email:                 row.email,
            credits:               row.credits ?? 0,
            freeDownloadUsed:      row.free_download_used ?? false,
            firstUpgradePurchased: row.first_upgrade_purchased ?? false,
            plan:                  row.plan ?? 'free',
          }
          loginUser(session.access_token, userData)
        } else {
          // Session valid but no profile row — create it on the fly
          const u = session.user
          const name = u.user_metadata?.name || u.email?.split('@')[0] || 'Usuário'
          const newRow = {
            id: u.id, name, email: u.email?.toLowerCase() ?? '',
            password_hash: '',
            credits: 0, free_download_used: false,
            first_upgrade_purchased: false, plan: 'free',
          }
          await supabase.from('users').insert(newRow)
          loginUser(session.access_token, {
            id: u.id, name, email: u.email ?? '',
            credits: 0, freeDownloadUsed: false,
            firstUpgradePurchased: false, plan: 'free',
          })
        }
      } catch {
        setAuthChecked(true)
      }
    }).catch(() => setAuthChecked(true))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mobile gate ─────────────────────────────────────────────────
  if (isMobile) return <MobileBlock />

  // ── Validating stored token ──────────────────────────────────────
  if (!authChecked) {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 24, height: 24,
          border: '2px solid var(--line)', borderTopColor: 'var(--accent)',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  // ── Not logged in ────────────────────────────────────────────────
  if (!user) return <LoginScreen />

  // ── Loading screen ───────────────────────────────────────────────
  if (!loaded) {
    return <SplashScreen onDone={handleSplashDone} />
  }

  // ── Main app ─────────────────────────────────────────────────────
  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      <UpgradeModal />
      <ProjectsModal />
      <Navbar />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* Left panel — 220px */}
        <div style={{ width: 220, flexShrink: 0, overflow: 'hidden' }}>
          <LeftPanel />
        </div>

        {/* Viewport — fluid */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <Suspense fallback={<ViewportFallback />}>
            <Viewport />
          </Suspense>
        </div>

        {/* Right panel — 280px */}
        <div style={{ width: 280, flexShrink: 0, overflow: 'hidden' }}>
          <RightPanel />
        </div>
      </div>

      <Footer />
    </div>
  )
}

function ViewportFallback() {
  const t = useT()
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        width: 32, height: 32,
        border: '2px solid var(--line)', borderTopColor: 'var(--accent)',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{
        fontFamily: 'var(--font-condensed)', fontSize: 11,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--text-secondary)',
      }}>
        {t('splash.initEngine')}
      </span>
    </div>
  )
}
