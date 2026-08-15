import { useState } from 'react'
import { useStore } from '../store/useStore'

const ERROR_MESSAGES = {
  not_authenticated: 'Faça login para resgatar um cupom.',
  invalid_code: 'Código inválido. Verifique e tente novamente.',
  already_used: 'Este cupom já foi utilizado nesta conta.',
  upgrade_already_purchased: 'Este cupom é válido apenas para contas novas (sem upgrade).',
  server_error: 'Não foi possível resgatar agora. Tente novamente em instantes.',
}

export default function CouponModal({ open, onClose }) {
  const redeemCoupon = useStore((s) => s.redeemCoupon)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!open) return null

  const handleRedeem = async () => {
    if (!code.trim() || loading) return
    setLoading(true)
    setError('')
    setSuccess('')
    const result = await redeemCoupon(code.trim())
    setLoading(false)
    if (result.ok) {
      setSuccess(`${(result.credits ?? 700).toLocaleString('pt-BR')} créditos adicionados! Expiração em 20 dias.`)
      setCode('')
      onClose()
    } else {
      setError(ERROR_MESSAGES[result.error] || ERROR_MESSAGES.server_error)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 600,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.12s ease both',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          background: '#141414',
          border: '1px solid #2a2a2a',
          borderRadius: 10,
          padding: '28px 28px 24px',
          width: 380, maxWidth: '100%',
          boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 30, height: 30,
            background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 6,
            color: '#777', fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#444' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#777'; e.currentTarget.style.borderColor = '#2a2a2a' }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,106,0,0.12)',
            border: '1px solid rgba(255,106,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v3h20v-3a3 3 0 0 1 0-6V6H2v3z"/>
              <path d="M13 6v2M13 10v2M13 14v2M13 18v2"/>
            </svg>
          </div>
          <h3 style={{
            fontFamily: 'var(--font-condensed)', fontSize: 16, fontWeight: 900,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--text)', margin: 0,
          }}>
            Cupom de Bônus
          </h3>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 12,
            color: 'var(--text-secondary)', margin: 0,
          }}>
            Resgate seu bônus de boas-vindas
          </p>
        </div>

        {/* Benefit */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          border: '1px solid rgba(255,106,0,0.3)',
          background: 'rgba(255,106,0,0.08)',
          borderRadius: 8, padding: '12px', gap: 2,
        }}>
          <span style={{
            fontFamily: 'var(--font-condensed)', fontSize: 26, fontWeight: 900,
            letterSpacing: '0.06em', color: '#ff6a00',
          }}>
            700 CRÉDITOS
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#888' }}>
            válidos por 20 dias
          </span>
        </div>

        {/* Input */}
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            setError('')
            setSuccess('')
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
          placeholder="Digite o código (ex: GHOOST3D)"
          autoFocus
          style={{
            width: '100%', padding: '10px 12px', boxSizing: 'border-box',
            background: '#0d0d0d', border: '1px solid #2a2a2a',
            borderRadius: 5, color: 'var(--text)',
            fontFamily: 'var(--font-body)', fontSize: 13,
            textAlign: 'center', textTransform: 'uppercase',
            letterSpacing: '0.2em', outline: 'none',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#ff6a00' }}
          onBlur={(e) => { e.target.style.borderColor = '#2a2a2a' }}
        />

        {/* Messages */}
        {error && (
          <div style={{
            padding: '9px 12px',
            background: 'rgba(214,48,49,0.12)',
            border: '1px solid rgba(214,48,49,0.4)',
            borderRadius: 5, fontFamily: 'var(--font-body)', fontSize: 12,
            color: '#ff8888', textAlign: 'center',
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            padding: '9px 12px',
            background: 'rgba(0,184,148,0.1)',
            border: '1px solid rgba(0,184,148,0.35)',
            borderRadius: 5, fontFamily: 'var(--font-body)', fontSize: 12,
            color: '#00b894', textAlign: 'center',
          }}>
            {success}
          </div>
        )}

        {/* Terms */}
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 10, color: '#666', lineHeight: 1.5 }}>
          1x por conta · apenas para contas que ainda não fizeram upgrade
        </div>

        {/* CTA */}
        <button
          onClick={handleRedeem}
          disabled={loading || !code.trim()}
          style={{
            width: '100%', padding: '12px',
            background: loading ? '#333' : '#ff6a00',
            border: 'none', borderRadius: 6,
            color: loading ? '#666' : '#000',
            fontFamily: 'var(--font-condensed)', fontSize: 13, fontWeight: 900,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.12s',
          }}
        >
          {loading ? 'RESGATANDO...' : 'RESGATAR'}
        </button>
      </div>
    </div>
  )
}