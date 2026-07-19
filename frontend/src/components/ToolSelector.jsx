import { useState } from 'react'
import { useStore } from '../store/useStore'

export default function ToolSelector({ onSelectModelador }) {
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)
  const [hovering, setHovering] = useState(null)

  const handleCortes = () => {
    window.location.href = '/cortes'
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 48,
      animation: 'fadeIn 0.4s ease both',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img
            src="/logo.png"
            alt="Nativos Studio"
            style={{
              width: 48, height: 48, objectFit: 'contain',
              filter: 'drop-shadow(0 0 20px rgba(255,106,0,0.6))',
            }}
          />
          <div>
            <div style={{
              fontFamily: 'var(--font-condensed)', fontSize: 22, fontWeight: 800,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text)',
            }}>
              Nativos Studio
            </div>
            <div style={{
              fontFamily: 'var(--font-condensed)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)',
            }}>
              PRO · 3D MESH DESIGNER
            </div>
          </div>
        </div>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)',
          marginTop: 4,
        }}>
          Olá, <span style={{ color: 'var(--text)', fontWeight: 600 }}>{user?.name}</span>. Escolha a ferramenta:
        </p>
      </div>

      {/* Tool cards */}
      <div style={{
        display: 'flex', gap: 24,
        flexWrap: 'wrap', justifyContent: 'center',
        padding: '0 24px',
      }}>
        {/* Modelador 3D */}
        <ToolCard
          icon={<ModeladorIcon />}
          title="Modelador 3D"
          subtitle="Designer paramétrico de cúpulas e luminárias"
          badge="Cúpulas"
          active={hovering === 'modelador'}
          onMouseEnter={() => setHovering('modelador')}
          onMouseLeave={() => setHovering(null)}
          onClick={onSelectModelador}
        />

        {/* Cortes 3D */}
        <ToolCard
          icon={<CortesIcon />}
          title="Cortes 3D"
          subtitle="Corte inteligente de modelos STL · OBJ · GLB"
          badge="SmartCut"
          active={hovering === 'cortes'}
          onMouseEnter={() => setHovering('cortes')}
          onMouseLeave={() => setHovering(null)}
          onClick={handleCortes}
        />
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text-dim)', background: 'none',
          border: 'none', cursor: 'pointer', padding: '6px 12px',
          borderRadius: 4, transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
      >
        Sair da conta
      </button>
    </div>
  )
}

function ToolCard({ icon, title, subtitle, badge, active, onMouseEnter, onMouseLeave, onClick }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        width: 260,
        background: active ? 'var(--card)' : 'var(--panel)',
        border: `1.5px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
        borderRadius: 12,
        padding: '32px 28px',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 16,
        transition: 'all 0.18s ease',
        transform: active ? 'translateY(-3px)' : 'none',
        boxShadow: active ? '0 8px 32px rgba(255,106,0,0.15)' : '0 2px 8px rgba(0,0,0,0.3)',
        outline: 'none',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 64, height: 64,
        background: active ? 'var(--accent-dim)' : 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${active ? 'rgba(255,106,0,0.3)' : 'var(--line)'}`,
        transition: 'all 0.18s ease',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
      }}>
        {icon}
      </div>

      {/* Badge */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
        letterSpacing: '0.2em', textTransform: 'uppercase',
        color: active ? 'var(--accent)' : 'var(--text-dim)',
        background: active ? 'var(--accent-dim)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? 'rgba(255,106,0,0.25)' : 'var(--line)'}`,
        padding: '3px 10px', borderRadius: 4,
        transition: 'all 0.18s ease',
      }}>
        {badge}
      </div>

      {/* Title */}
      <div style={{
        fontFamily: 'var(--font-condensed)', fontSize: 18, fontWeight: 800,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: active ? 'var(--text)' : 'var(--text)',
        transition: 'color 0.18s ease',
      }}>
        {title}
      </div>

      {/* Subtitle */}
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 12,
        color: 'var(--text-secondary)', textAlign: 'center',
        lineHeight: 1.5, margin: 0,
      }}>
        {subtitle}
      </p>

      {/* CTA */}
      <div style={{
        marginTop: 4,
        fontFamily: 'var(--font-mono)', fontSize: 10,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: active ? 'var(--accent)' : 'var(--text-dim)',
        display: 'flex', alignItems: 'center', gap: 6,
        transition: 'color 0.18s ease',
      }}>
        Entrar
        <span style={{ fontSize: 12 }}>→</span>
      </div>
    </button>
  )
}

function ModeladorIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  )
}

function CortesIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/>
      <circle cx="6" cy="18" r="3"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88"/>
      <line x1="14.47" y1="14.48" x2="20" y2="20"/>
      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </svg>
  )
}
