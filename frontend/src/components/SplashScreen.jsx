import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'

const STEPS = [
  { at: 0,  msg: 'splash.loading' },
  { at: 30, msg: 'splash.loadingUser' },
  { at: 55, msg: 'splash.loadingPlan' },
  { at: 75, msg: 'splash.loadingProjects' },
  { at: 90, msg: 'splash.initEngine' },
]

export default function SplashScreen({ onDone }) {
  const [progress, setProgress] = useState(0)
  const user    = useStore((s) => s.user)
  const t       = useT()
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  const stepMsg = [...STEPS].reverse().find(s => progress >= s.at)?.msg || 'splash.loading'

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(() => onDoneRef.current?.(), 400)
          return 100
        }
        return p + 1
      })
    }, 20)
    return () => clearInterval(interval)
  }, []) // runs once — onDoneRef.current keeps it fresh

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 20,
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        animation: 'fadeIn 0.5s ease both',
      }}>
        <img
          src="/logo.png"
          alt="Nativos Studio Pro"
          loading="eager"
          decoding="sync"
          fetchpriority="high"
          style={{
            width: 56, height: 56,
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 24px rgba(255,106,0,0.65))',
            animation: 'splashGlow 2s ease infinite',
          }}
        />
        <div>
          <div style={{
            fontFamily: 'var(--font-condensed)', fontSize: 24, fontWeight: 800,
            letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text)',
          }}>
            Nativos Studio
          </div>
          <div style={{
            fontFamily: 'var(--font-condensed)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)',
          }}>
            {t('splash.tagline')}
          </div>
        </div>
      </div>

      {/* User greeting */}
      {user?.name && (
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)',
          animation: 'fadeIn 0.6s ease both',
        }}>
          Olá, <span style={{ color: 'var(--text)', fontWeight: 600 }}>{user.name}</span>
        </div>
      )}

      {/* Progress bar */}
      <div style={{
        width: 240, height: 2,
        background: 'var(--line)', borderRadius: 1, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'var(--accent)',
          borderRadius: 1,
          transition: 'width 0.05s linear',
          boxShadow: '0 0 8px var(--accent-glow)',
        }} />
      </div>

      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'var(--text-dim)', letterSpacing: '0.1em',
        transition: 'opacity 0.3s',
      }}>
        {progress < 100 ? t(stepMsg) : t('splash.ready')}
      </span>
    </div>
  )
}
