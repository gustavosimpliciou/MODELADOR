import { useEffect, useState, useCallback, useRef } from 'react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'

// ─── Constants ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 20

const PLAN_COLOR = {
  free: '#666', easy: '#4fc3f7', medium: '#ff6a00', premium: '#ffd600',
  starter: '#4fc3f7', pro: '#ff6a00',
}
const PLAN_LABEL = {
  free: 'Free', easy: 'Easy', medium: 'Medium', premium: 'Premium',
  starter: 'Starter', pro: 'Pro',
}

// ─── Auth helper ─────────────────────────────────────────────────────────────
async function getAdminHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Sessão expirada. Faça login novamente.')
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  }
}

async function adminFetch(path, options = {}) {
  const headers = await getAdminHeaders()
  const res = await fetch(`/api/admin${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } })
  if (res.status === 403) throw new Error('Acesso negado pelo servidor')
  if (res.status === 401) throw new Error('Sessão expirada. Faça login novamente.')
  if (!res.ok) {
    let msg = `Erro ${res.status}`
    try { const j = await res.json(); msg = j.detail || j.message || msg } catch {}
    throw new Error(msg)
  }
  return res.json()
}

// ─── Root guard ───────────────────────────────────────────────────────────────
export default function DashboardADM({ onBack }) {
  const user = useStore((s) => s.user)
  if (!user?.is_admin) return null
  return <AdminShell onBack={onBack} user={user} />
}

// ─── Shell: sidebar + page ────────────────────────────────────────────────────
function AdminShell({ onBack, user }) {
  const [page, setPage] = useState('overview') // 'overview' | 'users'

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 20px', height: 48,
        borderBottom: '1px solid var(--line)',
        background: 'var(--panel)', flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={btnStyle({ variant: 'ghost' })}
        >
          ← Voltar
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldIcon size={15} color="#ff6a00" />
          <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 14, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text)' }}>
            Dashboard ADM
          </span>
          <Tag label="ADM" color="#ff6a00" />
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
          {user.email}
        </span>
      </div>

      {/* ── Body: sidebar + content ──────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <nav style={{
          width: 200, flexShrink: 0,
          background: 'var(--panel)',
          borderRight: '1px solid var(--line)',
          display: 'flex', flexDirection: 'column',
          padding: '20px 0',
          gap: 2,
        }}>
          <NavSection label="Módulos" />
          <NavItem
            label="Visão Geral"
            icon={<ChartIcon size={14} />}
            active={page === 'overview'}
            onClick={() => setPage('overview')}
          />
          <NavItem
            label="Usuários"
            icon={<UsersIcon size={14} />}
            active={page === 'users'}
            onClick={() => setPage('users')}
          />
        </nav>

        {/* Main content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>
          {page === 'overview' && <OverviewPage />}
          {page === 'users'    && <UsersPage />}
        </main>
      </div>
    </div>
  )
}

// ─── Overview page ───────────────────────────────────────────────────────────
const OVERVIEW_POLL_MS = 30_000 // atualiza a cada 30 segundos

function OverviewPage() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      setStats(await adminFetch('/stats'))
      setLastUpdated(new Date())
    }
    catch (e) { setError(e.message) }
    finally { if (!silent) setLoading(false) }
  }, [])

  // Carga inicial
  useEffect(() => { load() }, [load])

  // Auto-refresh a cada 30 segundos (silent — não mostra spinner)
  useEffect(() => {
    const id = setInterval(() => load(true), OVERVIEW_POLL_MS)
    return () => clearInterval(id)
  }, [load])

  if (loading) return <Spinner />
  if (error)   return <ErrorBanner msg={error} onRetry={load} />

  const {
    total_users, total_admins, total_credits,
    users_with_credits, users_without_credits,
    recent_payments,
  } = stats || {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <PageTitle
        title="Visão Geral"
        subtitle={
          lastUpdated
            ? `Atualizado às ${lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · atualiza a cada 30s`
            : 'Estatísticas da plataforma em tempo real'
        }
      />

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <StatCard label="Total de Usuários"     value={total_users ?? '—'}         icon="👤" />
        <StatCard label="Administradores"        value={total_admins ?? '—'}        icon="🛡" accent="#ff6a00" />
        <StatCard label="Total de Créditos"      value={(total_credits ?? 0).toLocaleString('pt-BR')} icon="⚡" accent="#ffd600" />
        <StatCard label="Com Créditos"           value={users_with_credits ?? '—'}  icon="✅" accent="#4caf50" />
        <StatCard label="Sem Créditos"           value={users_without_credits ?? '—'} icon="⭕" accent="#e05050" />
      </div>

      {/* Recent payments */}
      {recent_payments?.length > 0 && (
        <Section title="Pagamentos Recentes">
          <PaymentsTable payments={recent_payments} />
        </Section>
      )}

      {(!recent_payments || recent_payments.length === 0) && (
        <Section title="Pagamentos Recentes">
          <Empty msg="Nenhum pagamento registrado ainda" />
        </Section>
      )}
    </div>
  )
}

// ─── Users page ───────────────────────────────────────────────────────────────
function UsersPage() {
  const [data, setData]         = useState({ users: [], total: 0, pages: 1 })
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [sortBy, setSortBy]     = useState('created_at')
  const [sortDir, setSortDir]   = useState('desc')
  const [modalUser, setModalUser] = useState(null)   // user row for credits modal
  const [toast, setToast]       = useState(null)
  const searchRef               = useRef(null)
  const debounceRef             = useRef(null)

  const load = useCallback(async (opts = {}) => {
    setLoading(true); setError(null)
    const q = opts.search  ?? search
    const p = opts.page    ?? page
    const sb = opts.sortBy  ?? sortBy
    const sd = opts.sortDir ?? sortDir
    try {
      const params = new URLSearchParams({
        page: p, limit: PAGE_SIZE, search: q,
        sort_by: sb, sort_dir: sd,
      })
      const result = await adminFetch(`/users?${params}`)
      setData(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, page, sortBy, sortDir])

  useEffect(() => { load() }, []) // initial load

  // Debounced search
  const handleSearch = (val) => {
    setSearch(val)
    setPage(1)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      load({ search: val, page: 1 })
    }, 400)
  }

  const handleSort = (col) => {
    const newDir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc'
    setSortBy(col); setSortDir(newDir); setPage(1)
    load({ sortBy: col, sortDir: newDir, page: 1 })
  }

  const handlePage = (p) => {
    setPage(p)
    load({ page: p })
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCreditsUpdated = (userId, newCredits) => {
    setData(d => ({
      ...d,
      users: d.users.map(u => u.id === userId ? { ...u, credits: newCredits } : u),
    }))
    if (modalUser?.id === userId) setModalUser(mu => ({ ...mu, credits: newCredits }))
    showToast('Créditos atualizados com sucesso!')
  }

  const SortBtn = ({ col, label }) => {
    const active = sortBy === col
    return (
      <button
        onClick={() => handleSort(col)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', gap: 4,
          fontFamily: 'var(--font-condensed)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: active ? '#ff6a00' : 'var(--text-dim)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
        <span style={{ fontSize: 9, opacity: active ? 1 : 0.4 }}>
          {active ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
        </span>
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageTitle
        title="Usuários"
        subtitle={`${data.total.toLocaleString('pt-BR')} usuários cadastrados`}
      />

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <SearchIcon size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            ref={searchRef}
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '7px 10px 7px 30px',
              background: 'var(--panel)', border: '1px solid var(--line)',
              borderRadius: 6, outline: 'none',
              fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#ff6a00'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--line)'}
          />
        </div>
        {search && (
          <button
            onClick={() => { setSearch(''); setPage(1); load({ search: '', page: 1 }) }}
            style={btnStyle({ variant: 'ghost' })}
          >
            Limpar
          </button>
        )}
        <button onClick={() => load()} style={btnStyle({ variant: 'ghost' })}>
          ↻ Atualizar
        </button>
      </div>

      {error && <ErrorBanner msg={error} onRetry={() => load()} />}

      {/* Table */}
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--line)',
        borderRadius: 8, overflow: 'hidden',
        opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--line)' }}>
              <Th><SortBtn col="name" label="Nome" /></Th>
              <Th><SortBtn col="email" label="E-mail" /></Th>
              <Th style={{ maxWidth: 120 }}>ID</Th>
              <Th><SortBtn col="created_at" label="Cadastro" /></Th>
              <Th><SortBtn col="credits" label="Créditos" /></Th>
              <Th>Tipo</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                  {search ? 'Nenhum usuário encontrado para esta busca' : 'Nenhum usuário cadastrado'}
                </td>
              </tr>
            ) : data.users.map((u, i) => (
              <tr
                key={u.id}
                style={{
                  borderBottom: i < data.users.length - 1 ? '1px solid var(--line)' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <Td>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                    {u.name || '—'}
                  </span>
                </Td>
                <Td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                    {u.email}
                  </span>
                </Td>
                <Td>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)',
                    maxWidth: 110, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }} title={u.id}>
                    {u.id?.slice(0, 8)}…
                  </span>
                </Td>
                <Td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}
                  </span>
                </Td>
                <Td>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                    color: (u.credits || 0) > 0 ? '#4caf50' : 'var(--text-dim)',
                  }}>
                    {(u.credits || 0).toLocaleString('pt-BR')}
                  </span>
                </Td>
                <Td>
                  {u.is_admin
                    ? <Tag label="Admin" color="#ff6a00" />
                    : <Tag label="Usuário" color="#666" />
                  }
                </Td>
                <Td>
                  <button
                    onClick={() => setModalUser(u)}
                    style={btnStyle({ variant: 'primary', size: 'sm' })}
                  >
                    Créditos
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.pages > 1 && (
        <Pagination current={page} total={data.pages} onChange={handlePage} />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: toast.type === 'success' ? 'rgba(76,175,80,0.15)' : 'rgba(224,80,80,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(76,175,80,0.5)' : 'rgba(224,80,80,0.5)'}`,
          color: toast.type === 'success' ? '#4caf50' : '#e05050',
          padding: '10px 18px', borderRadius: 8,
          fontFamily: 'var(--font-body)', fontSize: 13,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.2s ease',
          zIndex: 9999,
        }}>
          {toast.type === 'success' ? '✓ ' : '⚠ '}{toast.msg}
        </div>
      )}

      {/* Credits Modal */}
      {modalUser && (
        <CreditsModal
          user={modalUser}
          onClose={() => setModalUser(null)}
          onSuccess={(newCredits) => handleCreditsUpdated(modalUser.id, newCredits)}
        />
      )}
    </div>
  )
}

// ─── Credits Modal ────────────────────────────────────────────────────────────
function CreditsModal({ user, onClose, onSuccess }) {
  const [op, setOp]           = useState('add') // 'add' | 'remove' | 'set'
  const [amount, setAmount]   = useState('')
  const [note, setNote]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(null)

  const currentCredits = user.credits || 0

  const quickAmounts = op === 'add'
    ? [10, 50, 100, 200, 500]
    : op === 'remove'
      ? [10, 50, 100]
      : []

  const handleSubmit = async () => {
    const val = parseInt(amount, 10)
    if (!amount || isNaN(val) || val <= 0) {
      setError('Informe um valor positivo válido'); return
    }
    if (op === 'remove' && val > currentCredits) {
      setError(`Saldo insuficiente (${currentCredits} disponíveis)`); return
    }

    setLoading(true); setError(null)
    try {
      const result = await adminFetch(`/users/${user.id}/credits`, {
        method: 'PATCH',
        body: JSON.stringify({ operation: op, amount: val, note: note || undefined }),
      })
      setSuccess(`Saldo atualizado: ${result.previous_credits} → ${result.new_credits} créditos`)
      onSuccess(result.new_credits)
      setAmount(''); setNote('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const preview = (() => {
    const val = parseInt(amount, 10)
    if (!amount || isNaN(val) || val <= 0) return null
    if (op === 'add')    return currentCredits + val
    if (op === 'remove') return Math.max(0, currentCredits - val)
    if (op === 'set')    return Math.max(0, val)
    return null
  })()

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: 460, maxHeight: '90vh', overflowY: 'auto',
        background: 'var(--bg)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        padding: 28,
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{
              margin: 0, fontFamily: 'var(--font-condensed)', fontSize: 16, fontWeight: 800,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)',
            }}>
              Gerenciar Créditos
            </h2>
            <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>
              {user.name || user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}
          >
            ×
          </button>
        </div>

        {/* User info */}
        <div style={{
          background: 'var(--panel)', border: '1px solid var(--line)',
          borderRadius: 8, padding: '14px 16px',
          display: 'flex', gap: 24,
        }}>
          <InfoItem label="E-mail"     value={user.email} mono />
          <InfoItem label="Saldo Atual" value={`${currentCredits.toLocaleString('pt-BR')} créditos`} accent />
          <InfoItem label="Plano"      value={PLAN_LABEL[user.plan] || user.plan || 'Free'} />
        </div>

        {/* Operation tabs */}
        <div>
          <label style={labelStyle}>Operação</label>
          <div style={{ display: 'flex', gap: 0, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 6, overflow: 'hidden' }}>
            {[
              ['add',    '+ Adicionar'],
              ['remove', '− Remover'],
              ['set',    '= Definir'],
            ].map(([key, lbl]) => (
              <button
                key={key}
                onClick={() => { setOp(key); setAmount(''); setError(null); setSuccess(null) }}
                style={{
                  flex: 1, border: 'none', cursor: 'pointer', padding: '8px 0',
                  background: op === key ? (key === 'remove' ? '#e05050' : key === 'set' ? '#4fc3f7' : '#ff6a00') : 'transparent',
                  color: op === key ? '#fff' : 'var(--text-dim)',
                  fontFamily: 'var(--font-condensed)', fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.08em', transition: 'all 0.15s',
                }}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Quick amounts */}
        {quickAmounts.length > 0 && (
          <div>
            <label style={labelStyle}>Valores rápidos</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {quickAmounts.map(v => (
                <button
                  key={v}
                  onClick={() => { setAmount(String(v)); setError(null); setSuccess(null) }}
                  style={{
                    ...btnStyle({ variant: amount === String(v) ? 'primary' : 'ghost', size: 'sm' }),
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {op === 'remove' ? `−${v}` : `+${v}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Amount input */}
        <div>
          <label style={labelStyle}>
            {op === 'add' ? 'Quantidade a adicionar' : op === 'remove' ? 'Quantidade a remover' : 'Novo saldo exato'}
          </label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={e => { setAmount(e.target.value); setError(null); setSuccess(null) }}
            placeholder={op === 'set' ? `Saldo atual: ${currentCredits}` : 'Ex: 100'}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 12px',
              background: 'var(--panel)', border: '1px solid var(--line)',
              borderRadius: 6, outline: 'none',
              fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text)',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#ff6a00'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--line)'}
          />
          {/* Preview */}
          {preview !== null && (
            <p style={{
              margin: '6px 0 0',
              fontFamily: 'var(--font-body)', fontSize: 12,
              color: 'var(--text-secondary)',
            }}>
              Resultado: <strong style={{ color: preview > currentCredits ? '#4caf50' : preview < currentCredits ? '#e05050' : 'var(--text)' }}>
                {preview.toLocaleString('pt-BR')} créditos
              </strong>
            </p>
          )}
          {op === 'remove' && amount && parseInt(amount) > currentCredits && (
            <p style={{ margin: '6px 0 0', fontFamily: 'var(--font-body)', fontSize: 12, color: '#e05050' }}>
              ⚠ Valor superior ao saldo disponível ({currentCredits})
            </p>
          )}
        </div>

        {/* Note */}
        <div>
          <label style={labelStyle}>Observação (opcional)</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Motivo da alteração..."
            maxLength={120}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 12px',
              background: 'var(--panel)', border: '1px solid var(--line)',
              borderRadius: 6, outline: 'none',
              fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#ff6a00'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--line)'}
          />
        </div>

        {/* Feedback */}
        {error   && <Alert type="error"   msg={error} />}
        {success && <Alert type="success" msg={success} />}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnStyle({ variant: 'ghost' })}>Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={loading || !amount}
            style={{
              ...btnStyle({ variant: 'primary' }),
              opacity: loading || !amount ? 0.5 : 1,
              cursor: loading || !amount ? 'not-allowed' : 'pointer',
              minWidth: 120,
            }}
          >
            {loading ? 'Salvando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Credits helper ───────────────────────────────────────────────────────────
// Espelha a lógica de detect_plan_tier do backend (backend/server.py)
function creditsFromProduct(productName = '') {
  const h = (productName || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // remove acentos
  if (h.includes('premium')) return 1500
  if (/\bpro\b|\bmedium\b|\bmedio\b/.test(h)) return 565
  if (h.includes('easy')) return 200
  return null
}

// ─── Payments table ───────────────────────────────────────────────────────────
function PaymentsTable({ payments }) {
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--line)' }}>
            {['Produto', 'Valor', 'Créditos', 'Status', 'Data'].map(h => (
              <Th key={h}>{h}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.map((p, i) => {
            const credits = creditsFromProduct(p.product)
            const isPaid = (p.status || '').includes('paid') || (p.status || '').includes('approved')
            return (
              <tr key={p.id || i} style={{ borderBottom: i < payments.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <Td>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)' }}>
                    {p.product || '—'}
                  </span>
                </Td>
                <Td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#4caf50' }}>
                    {p.value ? `R$ ${Number(p.value).toFixed(2)}` : '—'}
                  </span>
                </Td>
                <Td>
                  {credits !== null ? (
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                      color: '#ffd600',
                    }}>
                      ⚡ {credits.toLocaleString('pt-BR')}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>—</span>
                  )}
                </Td>
                <Td>
                  <Tag
                    label={p.status || '—'}
                    color={isPaid ? '#4caf50' : '#888'}
                  />
                </Td>
                <Td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                    {p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '—'}
                  </span>
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
  const pages = []
  const delta = 2
  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
    pages.push(i)
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <PgBtn disabled={current <= 1} onClick={() => onChange(current - 1)}>‹</PgBtn>
      {pages[0] > 1 && <>
        <PgBtn onClick={() => onChange(1)}>1</PgBtn>
        {pages[0] > 2 && <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>…</span>}
      </>}
      {pages.map(p => (
        <PgBtn key={p} active={p === current} onClick={() => onChange(p)}>{p}</PgBtn>
      ))}
      {pages[pages.length - 1] < total && <>
        {pages[pages.length - 1] < total - 1 && <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>…</span>}
        <PgBtn onClick={() => onChange(total)}>{total}</PgBtn>
      </>}
      <PgBtn disabled={current >= total} onClick={() => onChange(current + 1)}>›</PgBtn>
    </div>
  )
}

function PgBtn({ children, onClick, active, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 30, height: 30, padding: '0 8px',
        background: active ? '#ff6a00' : 'var(--panel)',
        border: `1px solid ${active ? '#ff6a00' : 'var(--line)'}`,
        borderRadius: 4, cursor: disabled ? 'not-allowed' : 'pointer',
        color: active ? '#fff' : disabled ? 'var(--text-dim)' : 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)', fontSize: 12,
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

// ─── Small reusable components ────────────────────────────────────────────────
function StatCard({ label, value, icon, accent = '#888' }) {
  return (
    <div style={{
      flex: '1 1 150px', minWidth: 150,
      background: 'var(--panel)', border: '1px solid var(--line)',
      borderRadius: 10, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-condensed)', fontSize: 28, fontWeight: 900, color: accent, letterSpacing: '-0.01em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
        {label}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ margin: 0, fontFamily: 'var(--font-condensed)', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function PageTitle({ title, subtitle }) {
  return (
    <div>
      <h1 style={{ margin: 0, fontFamily: 'var(--font-condensed)', fontSize: 22, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)' }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

function Tag({ label, color }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color, background: `${color}18`, border: `1px solid ${color}40`,
      padding: '2px 7px', borderRadius: 3, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function Alert({ type, msg }) {
  const isErr = type === 'error'
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 6,
      background: isErr ? 'rgba(224,80,80,0.1)' : 'rgba(76,175,80,0.1)',
      border: `1px solid ${isErr ? 'rgba(224,80,80,0.4)' : 'rgba(76,175,80,0.4)'}`,
      color: isErr ? '#e05050' : '#4caf50',
      fontFamily: 'var(--font-body)', fontSize: 13,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span>{isErr ? '⚠' : '✓'}</span> {msg}
    </div>
  )
}

function ErrorBanner({ msg, onRetry }) {
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 8,
      background: 'rgba(224,80,80,0.1)', border: '1px solid rgba(224,80,80,0.35)',
      color: '#e05050', fontFamily: 'var(--font-body)', fontSize: 13,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span>⚠ {msg}</span>
      {onRetry && (
        <button onClick={onRetry} style={{ ...btnStyle({ variant: 'ghost', size: 'sm' }), marginLeft: 'auto', color: '#e05050', borderColor: 'rgba(224,80,80,0.4)' }}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}

function Empty({ msg }) {
  return (
    <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--font-body)', fontSize: 13 }}>
      {msg}
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 240, gap: 14 }}>
      <div style={{ width: 26, height: 26, border: '2px solid var(--line)', borderTopColor: '#ff6a00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-dim)' }}>CARREGANDO...</span>
    </div>
  )
}

function InfoItem({ label, value, mono, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>{label}</span>
      <span style={{
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
        fontSize: mono ? 11 : 13,
        color: accent ? '#ff6a00' : 'var(--text)',
        fontWeight: accent ? 700 : 400,
      }}>{value}</span>
    </div>
  )
}

function NavSection({ label }) {
  return (
    <div style={{ padding: '0 16px 6px', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
      {label}
    </div>
  )
}

function NavItem({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 16px', margin: '0 8px', borderRadius: 6,
        background: active ? 'rgba(255,106,0,0.12)' : 'none',
        border: active ? '1px solid rgba(255,106,0,0.25)' : '1px solid transparent',
        color: active ? '#ff6a00' : 'var(--text-secondary)',
        cursor: 'pointer', textAlign: 'left',
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: active ? 600 : 400,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none' }}
    >
      {icon} {label}
    </button>
  )
}

function Th({ children, style }) {
  return (
    <th style={{
      padding: '10px 14px', textAlign: 'left',
      fontFamily: 'var(--font-condensed)', fontSize: 10, fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)',
      whiteSpace: 'nowrap', ...style,
    }}>
      {children}
    </th>
  )
}

function Td({ children }) {
  return <td style={{ padding: '10px 14px' }}>{children}</td>
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ShieldIcon({ size = 16, color = 'currentColor', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  )
}

function ChartIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )
}

function UsersIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function SearchIcon({ size = 16, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────
const labelStyle = {
  display: 'block', marginBottom: 6,
  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
  letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)',
}

function btnStyle({ variant = 'ghost', size = 'md' } = {}) {
  const pad = size === 'sm' ? '4px 10px' : '6px 14px'
  const fs  = size === 'sm' ? 11 : 12
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: pad, borderRadius: 5, cursor: 'pointer',
    fontFamily: 'var(--font-mono)', fontSize: fs, fontWeight: 600,
    letterSpacing: '0.06em', textTransform: 'none',
    transition: 'all 0.15s', border: '1px solid',
  }
  if (variant === 'primary') return { ...base, background: '#ff6a00', borderColor: '#ff6a00', color: '#fff' }
  return { ...base, background: 'none', borderColor: 'var(--line)', color: 'var(--text-secondary)' }
}
