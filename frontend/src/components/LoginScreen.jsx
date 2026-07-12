import { useState } from 'react'
import { authApi } from '../api/auth'
import { useStore } from '../store/useStore'

// ─── shared input style ──────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: '#0d0d0d',
  border: '1px solid #2a2a2a',
  borderRadius: 6,
  color: '#f0f0f0',
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  outline: 'none',
  transition: 'border-color 0.15s',
}

function Field({ label, type = 'text', value, onChange, placeholder, autoFocus }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontFamily: 'var(--font-condensed)', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: '#777',
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          borderColor: focused ? 'var(--accent)' : '#2a2a2a',
          boxShadow: focused ? '0 0 0 2px rgba(255,106,0,0.12)' : 'none',
        }}
      />
    </div>
  )
}

function SubmitBtn({ label, loading, disabled }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      style={{
        width: '100%', padding: '13px',
        background: loading ? '#333' : 'var(--accent)',
        border: 'none', borderRadius: 6,
        color: loading ? '#666' : '#000',
        fontFamily: 'var(--font-condensed)', fontSize: 14, fontWeight: 900,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginTop: 4,
      }}
    >
      {loading && (
        <span style={{
          width: 14, height: 14,
          border: '2px solid #555',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          display: 'inline-block',
        }} />
      )}
      {label}
    </button>
  )
}

function ErrorMsg({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      padding: '10px 14px',
      background: 'rgba(214,48,49,0.12)',
      border: '1px solid rgba(214,48,49,0.4)',
      borderRadius: 6,
      fontFamily: 'var(--font-body)', fontSize: 12,
      color: '#ff8888',
    }}>
      {msg}
    </div>
  )
}

function SuccessMsg({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      padding: '10px 14px',
      background: 'rgba(0,184,148,0.1)',
      border: '1px solid rgba(0,184,148,0.35)',
      borderRadius: 6,
      fontFamily: 'var(--font-body)', fontSize: 12,
      color: '#00b894',
    }}>
      {msg}
    </div>
  )
}

// ─── Login form ──────────────────────────────────────────────────────
function LoginForm({ onSuccess, onForgot, onRegister }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authApi.login(identifier, password)
      onSuccess(data.token, data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ErrorMsg msg={error} />
      <Field label="E-mail ou nome de usuário" type="text" value={identifier}
        onChange={setIdentifier} placeholder="seu@email.com ou seu nome" autoFocus />
      <Field label="Senha" type="password" value={password} onChange={setPassword}
        placeholder="••••••••" />
      <button type="button" onClick={onForgot} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontSize: 12,
        color: 'var(--accent)', textAlign: 'left', padding: 0,
        textDecoration: 'underline', textUnderlineOffset: 3,
      }}>
        Esqueci minha senha
      </button>
      <SubmitBtn label="Entrar" loading={loading} />
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#666' }}>
          Não tem conta?{' '}
        </span>
        <button type="button" onClick={onRegister} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: 12,
          color: 'var(--accent)', padding: 0,
          textDecoration: 'underline', textUnderlineOffset: 3,
        }}>
          Criar conta
        </button>
      </div>
    </form>
  )
}

// ─── Register form ────────────────────────────────────────────────────
function RegisterForm({ onSuccess, onLogin }) {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('As senhas não coincidem'); return }
    if (password.length < 6)  { setError('A senha deve ter pelo menos 6 caracteres'); return }
    setLoading(true)
    try {
      const data = await authApi.register(name, email, password)
      onSuccess(data.token, data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ErrorMsg msg={error} />
      <Field label="Nome" value={name} onChange={setName} placeholder="Seu nome" autoFocus />
      <Field label="E-mail" type="email" value={email} onChange={setEmail}
        placeholder="seu@email.com" />
      <Field label="Senha" type="password" value={password} onChange={setPassword}
        placeholder="Mínimo 6 caracteres" />
      <Field label="Confirmar senha" type="password" value={confirm} onChange={setConfirm}
        placeholder="Repita a senha" />
      <SubmitBtn label="Criar conta grátis" loading={loading} />
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#666' }}>
          Já tem conta?{' '}
        </span>
        <button type="button" onClick={onLogin} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: 12,
          color: 'var(--accent)', padding: 0,
          textDecoration: 'underline', textUnderlineOffset: 3,
        }}>
          Entrar
        </button>
      </div>
    </form>
  )
}

// ─── Forgot-password form ────────────────────────────────────────────
function ForgotForm({ onBack }) {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const data = await authApi.forgotPassword(email)
      setSuccess(data.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#999', lineHeight: 1.5 }}>
        Informe seu e-mail para receber as instruções de recuperação de senha.
      </p>
      <ErrorMsg msg={error} />
      <SuccessMsg msg={success} />
      {!success && (
        <Field label="E-mail" type="email" value={email} onChange={setEmail}
          placeholder="seu@email.com" autoFocus />
      )}
      {!success && <SubmitBtn label="Enviar instruções" loading={loading} />}
      <button type="button" onClick={onBack} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontSize: 12,
        color: '#777', padding: 0,
        textDecoration: 'underline', textUnderlineOffset: 3,
        textAlign: 'center', marginTop: 4,
      }}>
        ← Voltar ao login
      </button>
    </form>
  )
}

// ─── Main LoginScreen ────────────────────────────────────────────────
export default function LoginScreen() {
  // view: 'login' | 'register' | 'forgot'
  const [view, setView] = useState('login')
  const loginUser = useStore((s) => s.loginUser)

  const handleSuccess = (token, user) => {
    loginUser(token, user)
  }

  const titles = {
    login:    { title: 'Bem-vindo de volta', sub: 'Faça login para continuar' },
    register: { title: 'Criar conta', sub: 'Junte-se ao Nativos Studio' },
    forgot:   { title: 'Recuperar senha', sub: 'Redefinição de acesso' },
  }
  const { title, sub } = titles[view]

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      animation: 'fadeIn 0.3s ease both',
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        display: 'flex', flexDirection: 'column', gap: 28,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <img
            src="/logo.png"
            alt="Nativos Studio Pro"
            style={{
              width: 44, height: 44,
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 18px rgba(255,106,0,0.6))',
            }}
          />
          <div>
            <div style={{
              fontFamily: 'var(--font-condensed)', fontSize: 20, fontWeight: 800,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)',
            }}>
              Nativos Studio
            </div>
            <div style={{
              fontFamily: 'var(--font-condensed)', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)',
              marginTop: -1,
            }}>
              Pro · 3D Mesh Designer
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#111',
          border: '1px solid #222',
          borderRadius: 10,
          padding: '28px 28px 24px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}>
          {/* Card header */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{
              fontFamily: 'var(--font-condensed)', fontSize: 22, fontWeight: 900,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--text)', marginBottom: 4,
            }}>
              {title}
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 12, color: '#666',
            }}>
              {sub}
            </p>
          </div>

          {view === 'login'    && <LoginForm    onSuccess={handleSuccess} onForgot={() => setView('forgot')} onRegister={() => setView('register')} />}
          {view === 'register' && <RegisterForm onSuccess={handleSuccess} onLogin={() => setView('login')} />}
          {view === 'forgot'   && <ForgotForm   onBack={() => setView('login')} />}
        </div>

        <p style={{
          textAlign: 'center',
          fontFamily: 'var(--font-body)', fontSize: 11, color: '#444',
        }}>
          © 2026 Nativos Studio Pro. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
