import { useEffect, useState, useCallback, useRef } from 'react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { useIsMobile } from './MobileBlock'
import * as XLSX from 'xlsx'

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
export default function DashboardADM({ onBack, mobileOnly = false }) {
  const user = useStore((s) => s.user)
  if (!user?.is_admin) return null
  return <AdminShell onBack={onBack} user={user} mobileOnly={mobileOnly} />
}

// ─── Shell: sidebar + page (responsivo no mobile) ─────────────────────────────
function AdminShell({ onBack, user, mobileOnly }) {
  const [page, setPage] = useState('overview') // 'overview' | 'users'
  const isMobile = useIsMobile() || mobileOnly
  const logout = useStore((s) => s.logout)

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16,
        padding: isMobile ? '0 12px' : '0 20px',
        height: isMobile ? 52 : 48,
        borderBottom: '1px solid var(--line)',
        background: 'var(--panel)', flexShrink: 0,
      }}>
        {!isMobile && onBack && (
          <button onClick={onBack} style={btnStyle({ variant: 'ghost' })}>
            ← Voltar
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <ShieldIcon size={15} color="#ff6a00" />
          <span style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: isMobile ? 12 : 14,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text)',
            whiteSpace: 'nowrap',
          }}>
            {isMobile ? 'ADM' : 'Dashboard ADM'}
          </span>
          <Tag label="ADM" color="#ff6a00" />
        </div>
        <div style={{ flex: 1 }} />
        {!isMobile && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
            {user.email}
          </span>
        )}
        {isMobile && (
          <button
            type="button"
            onClick={() => logout()}
            style={{
              ...btnStyle({ variant: 'ghost', size: 'sm' }),
              fontSize: 11,
              color: 'var(--text-dim)',
            }}
            title="Sair"
          >
            Sair
          </button>
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* Sidebar desktop */}
        {!isMobile && (
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
            <NavItem
              label="Log de Atividades"
              icon={<ActivityIcon size={14} />}
              active={page === 'log'}
              onClick={() => setPage('log')}
            />
          </nav>
        )}

        {/* Main content */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: isMobile ? '14px 12px 72px' : 28,
          WebkitOverflowScrolling: 'touch',
        }}>
          {page === 'overview' && <OverviewPage compact={isMobile} />}
          {page === 'users'    && <UsersPage compact={isMobile} />}
          {page === 'log'      && <ActivitiesLogPage compact={isMobile} />}
        </main>

        {/* Bottom tab bar mobile */}
        {isMobile && (
          <nav style={{
            position: 'fixed',
            left: 0, right: 0, bottom: 0,
            height: 56,
            background: 'var(--panel)',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            zIndex: 50,
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}>
            <MobileTab
              label="Visão Geral"
              icon={<ChartIcon size={18} />}
              active={page === 'overview'}
              onClick={() => setPage('overview')}
            />
            <MobileTab
              label="Usuários"
              icon={<UsersIcon size={18} />}
              active={page === 'users'}
              onClick={() => setPage('users')}
            />
            <MobileTab
              label="Log"
              icon={<ActivityIcon size={18} />}
              active={page === 'log'}
              onClick={() => setPage('log')}
            />
          </nav>
        )}
      </div>
    </div>
  )
}

function MobileTab({ label, icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: active ? '#ff6a00' : 'var(--text-dim)',
        fontFamily: 'var(--font-condensed)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        padding: '6px 4px',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

// ─── Overview page ───────────────────────────────────────────────────────────
const OVERVIEW_POLL_MS = 30_000 // atualiza a cada 30 segundos

function OverviewPage({ compact = false }) {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [modalUser, setModalUser] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

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

  // Abre créditos do usuário pelo USER_ID (nunca por nome/e-mail)
  const openUserCredits = async (userId) => {
    if (!userId) return
    setModalLoading(true)
    try {
      const user = await adminFetch(`/users/${userId}`)
      setModalUser(user)
    } catch (e) {
      setError(e.message || 'Não foi possível carregar o usuário')
    } finally {
      setModalLoading(false)
    }
  }

  // Vincula pagamento órfão (PAID_USER_NOT_FOUND) a um USER_ID e libera créditos
  const linkPayment = async (paymentId, userId) => {
    await adminFetch(`/payments/${paymentId}/link`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, grant_credits: true }),
    })
    await load(true)
  }

  const handleCreditsUpdated = (userId, newCredits) => {
    if (modalUser?.id === userId) {
      setModalUser(mu => ({ ...mu, credits: newCredits }))
    }
    // Atualiza stats em background para refletir créditos
    load(true)
  }

  if (loading) return <Spinner />
  if (error && !stats) return <ErrorBanner msg={error} onRetry={load} />

  const {
    total_users, total_admins, total_credits,
    users_with_credits, users_without_credits,
    total_revenue, total_paid_count,
    recent_payments,
  } = stats || {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 16 : 28 }}>
      <PageTitle
        title="Visão Geral"
        subtitle={
          lastUpdated
            ? `Atualizado às ${lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · atualiza a cada 30s`
            : 'Estatísticas da plataforma em tempo real'
        }
        compact={compact}
      />

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: compact ? 8 : 14,
      }}>
        <StatCard
          label="Total de Vendas"
          value={
            total_revenue != null
              ? Number(total_revenue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              : '—'
          }
          icon="💰"
          accent="#4caf50"
        />
        <StatCard label="Pagamentos"            value={total_paid_count ?? '—'}    icon="🧾" accent="#4caf50" />
        <StatCard label="Total de Usuários"     value={total_users ?? '—'}         icon="👤" />
        <StatCard label="Administradores"        value={total_admins ?? '—'}        icon="🛡" accent="#ff6a00" />
        <StatCard label="Total de Créditos"      value={(total_credits ?? 0).toLocaleString('pt-BR')} icon="⚡" accent="#ffd600" />
        <StatCard label="Com Créditos"           value={users_with_credits ?? '—'}  icon="✅" accent="#4caf50" />
        <StatCard label="Sem Créditos"           value={users_without_credits ?? '—'} icon="⭕" accent="#e05050" />
      </div>

      {/* Gráficos de crescimento */}
      <GrowthChartsSection />

      {/* Recent payments */}
      <Section title="Pagamentos Recentes">
        {recent_payments?.length > 0 ? (
          <PaymentsTable
            payments={recent_payments}
            onOpenUser={openUserCredits}
            openingUser={modalLoading}
            onLinkPayment={linkPayment}
          />
        ) : (
          <Empty msg="Nenhum pagamento registrado ainda" />
        )}
      </Section>

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

// ─── Growth charts (SVG, zero deps) ───────────────────────────────────────────
function toISODate(d) {
  const x = new Date(d)
  const y = x.getFullYear()
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const day = String(x.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function GrowthChartsSection() {
  const [preset, setPreset] = useState('30') // 7 | 30 | 90 | custom
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return toISODate(d)
  })
  const [to, setTo] = useState(() => toISODate(new Date()))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const applyPreset = (days) => {
    setPreset(String(days))
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - Number(days))
    setFrom(toISODate(start))
    setTo(toISODate(end))
  }

  const loadCharts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ from, to })
      const result = await adminFetch(`/stats/charts?${params}`)
      setData(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => { loadCharts() }, [loadCharts])

  const presets = [
    { id: '7', label: '7 dias' },
    { id: '30', label: '30 dias' },
    { id: '90', label: '90 dias' },
    { id: 'custom', label: 'Personalizado' },
  ]

  return (
    <Section title="Crescimento">
      {/* Filtro de data */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {presets.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                if (p.id === 'custom') setPreset('custom')
                else applyPreset(p.id)
              }}
              style={{
                ...btnStyle({ variant: preset === p.id ? 'primary' : 'ghost', size: 'sm' }),
                fontSize: 11,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>De</label>
          <input
            type="date"
            value={from}
            onChange={e => { setFrom(e.target.value); setPreset('custom') }}
            style={dateInputStyle}
          />
          <label style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>Até</label>
          <input
            type="date"
            value={to}
            onChange={e => { setTo(e.target.value); setPreset('custom') }}
            style={dateInputStyle}
          />
          <button type="button" onClick={loadCharts} style={btnStyle({ variant: 'ghost', size: 'sm' })}>
            ↻ Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: '#e05050', fontSize: 12, marginBottom: 12, fontFamily: 'var(--font-body)' }}>
          {error}
        </div>
      )}

      {loading && !data ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>Carregando gráficos…</div>
      ) : data ? (
        <>
          <div style={{
            display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 14, fontSize: 12,
            fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)',
          }}>
            <span>Usuários no período: <strong style={{ color: '#4fc3f7' }}>{data.total_users_in_range}</strong></span>
            <span>Pagamentos: <strong style={{ color: '#ff6a00' }}>{data.total_payments_in_range}</strong></span>
            <span>Receita: <strong style={{ color: '#4caf50' }}>
              {Number(data.total_revenue_in_range || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </strong></span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            <ChartCard
              title="Usuários cadastrados"
              subtitle="Novos cadastros por dia"
              color="#4fc3f7"
              series={(data.users_series || []).map(p => ({ date: p.date, value: p.count }))}
              formatValue={v => String(v)}
            />
            <ChartCard
              title="Pagamentos"
              subtitle="Receita (R$) por dia"
              color="#4caf50"
              series={(data.payments_series || []).map(p => ({ date: p.date, value: p.revenue }))}
              formatValue={v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              secondarySeries={(data.payments_series || []).map(p => ({ date: p.date, value: p.count }))}
              secondaryLabel="qtd. pagamentos"
            />
          </div>
        </>
      ) : null}
    </Section>
  )
}

const dateInputStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  padding: '5px 8px',
  borderRadius: 6,
  border: '1px solid var(--line)',
  background: 'var(--panel)',
  color: 'var(--text)',
  outline: 'none',
}

function ChartCard({ title, subtitle, color, series, formatValue, secondarySeries, secondaryLabel }) {
  const values = (series || []).map(s => s.value || 0)
  const max = Math.max(1, ...values)
  const w = 520
  const h = 180
  const pad = { top: 16, right: 12, bottom: 28, left: 44 }
  const innerW = w - pad.left - pad.right
  const innerH = h - pad.top - pad.bottom
  const n = Math.max(1, series.length)

  const xAt = (i) => pad.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const yAt = (v) => pad.top + innerH - (v / max) * innerH

  const points = series.map((s, i) => `${xAt(i)},${yAt(s.value || 0)}`).join(' ')
  const areaPoints = series.length
    ? `${xAt(0)},${pad.top + innerH} ${points} ${xAt(series.length - 1)},${pad.top + innerH}`
    : ''

  // Labels no eixo X (poucos para não poluir)
  const labelIdx = []
  if (n <= 7) {
    for (let i = 0; i < n; i++) labelIdx.push(i)
  } else {
    labelIdx.push(0, Math.floor(n / 2), n - 1)
  }

  const total = values.reduce((a, b) => a + b, 0)
  const peak = Math.max(0, ...values)

  return (
    <div style={{
      background: 'var(--panel)',
      border: '1px solid var(--line)',
      borderRadius: 10,
      padding: '14px 14px 10px',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-condensed)', fontSize: 13, fontWeight: 800,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text)',
          }}>
            {title}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
            {subtitle}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
          <div>Total: <span style={{ color }}>{formatValue(total)}</span></div>
          <div>Pico: <span style={{ color }}>{formatValue(peak)}</span></div>
          {secondarySeries && (
            <div style={{ marginTop: 2, color: 'var(--text-dim)' }}>
              {secondaryLabel}: {secondarySeries.reduce((s, x) => s + (x.value || 0), 0)}
            </div>
          )}
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: 'block' }}>
        {/* grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = pad.top + innerH * (1 - t)
          return (
            <g key={i}>
              <line x1={pad.left} y1={y} x2={w - pad.right} y2={y}
                stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={pad.left - 6} y={y + 3} textAnchor="end"
                fill="var(--text-dim)" fontSize="9" fontFamily="var(--font-mono)">
                {formatValue(Math.round(max * t * 100) / 100)}
              </text>
            </g>
          )
        })}

        {areaPoints && (
          <polygon points={areaPoints} fill={color} opacity="0.12" />
        )}
        {series.length > 1 && (
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {series.map((s, i) => (
          <circle
            key={s.date}
            cx={xAt(i)}
            cy={yAt(s.value || 0)}
            r={series.length > 60 ? 1.5 : 3}
            fill={color}
          >
            <title>{`${s.date}: ${formatValue(s.value || 0)}`}</title>
          </circle>
        ))}

        {labelIdx.map(i => {
          const s = series[i]
          if (!s) return null
          const label = s.date.slice(5).replace('-', '/') // MM/DD
          return (
            <text key={i} x={xAt(i)} y={h - 8} textAnchor="middle"
              fill="var(--text-dim)" fontSize="9" fontFamily="var(--font-mono)">
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Users page ───────────────────────────────────────────────────────────────
function UsersPage({ compact = false }) {
  const [data, setData]         = useState({ users: [], total: 0, pages: 1 })
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [sortBy, setSortBy]     = useState('created_at')
  const [sortDir, setSortDir]   = useState('desc')
  const [paidOnly, setPaidOnly] = useState(false)
  const [modalUser, setModalUser] = useState(null)   // user row for credits modal
  const [toast, setToast]       = useState(null)
  const [exporting, setExporting] = useState(false)
  const [, setNow]              = useState(Date.now()) // tick p/ cronômetro ao vivo
  const searchRef               = useRef(null)
  const debounceRef             = useRef(null)

  // Cronômetro vivo — atualiza a coluna Expiração a cada segundo
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const load = useCallback(async (opts = {}) => {
    setLoading(true); setError(null)
    const q = opts.search  ?? search
    const p = opts.page    ?? page
    const sb = opts.sortBy  ?? sortBy
    const sd = opts.sortDir ?? sortDir
    const po = opts.paidOnly ?? paidOnly
    try {
      const params = new URLSearchParams({
        page: p, limit: PAGE_SIZE, search: q,
        sort_by: sb, sort_dir: sd,
      })
      if (po) params.set('paid', '1')
      const result = await adminFetch(`/users?${params}`)
      setData(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, page, sortBy, sortDir, paidOnly])

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

  // Exporta TODOS os usuários em .xlsx (colunas de análise: acessos, créditos, valor pago)
  const handleExport = async () => {
    setExporting(true)
    try {
      const result = await adminFetch('/export/users')
      const users = result.users || []

      const header = [
        'Nome', 'E-mail', 'Plano', 'Créditos', 'Data de expiração',
        'Data de cadastro', 'Acessos', 'Valor pago (R$)', 'Qtd. pagamentos',
        'Usou download grátis', 'Comprou upgrade', 'ID',
      ]

      const rows = users.map(u => [
        u.name,
        u.email,
        u.plan || 'free',
        u.credits ?? 0,
        u.credits_expires_at
          ? new Date(u.credits_expires_at).toLocaleString('pt-BR')
          : '',
        u.created_at
          ? new Date(u.created_at).toLocaleDateString('pt-BR')
          : '',
        u.accesses ?? 0,
        (u.total_paid_reais ?? 0).toFixed(2).replace('.', ','),
        u.paid_count ?? 0,
        u.free_download_used ? 'Sim' : 'Não',
        u.first_upgrade_purchased ? 'Sim' : 'Não',
        u.id,
      ])

      const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
      ws['!cols'] = [
        { wch: 22 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 20 },
        { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 14 },
        { wch: 20 }, { wch: 18 }, { wch: 40 },
      ]
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Usuários')
      const dateStr = new Date().toISOString().slice(0, 10)
      XLSX.writeFile(wb, `usuarios-${dateStr}.xlsx`)
      showToast(`Planilha gerada com ${users.length} usuários!`)
    } catch (e) {
      showToast(e.message || 'Erro ao exportar', 'error')
    } finally {
      setExporting(false)
    }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 20 }}>
      <PageTitle
        title="Usuários"
        subtitle={`${data.total.toLocaleString('pt-BR')} usuários cadastrados`}
        compact={compact}
      />

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 0, maxWidth: compact ? '100%' : 380 }}>
          <SearchIcon size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            ref={searchRef}
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou USER_ID..."
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
        <button
          onClick={() => { setPaidOnly(v => !v); setPage(1); load({ paidOnly: !paidOnly, page: 1 }) }}
          style={{
            ...btnStyle({ variant: paidOnly ? 'primary' : 'ghost' }),
            whiteSpace: 'nowrap',
          }}
          title="Apenas usuários que pagaram (têm data de expiração de créditos)"
        >
          {paidOnly ? '✓ ' : ''}Só pagantes
        </button>
        <button onClick={() => load()} style={btnStyle({ variant: 'ghost' })}>
          ↻ Atualizar
        </button>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{ ...btnStyle({ variant: 'ghost' }), whiteSpace: 'nowrap' }}
          title="Exportar todos os usuários para planilha Excel (.xlsx)"
        >
          {exporting ? 'Gerando...' : '📥 Exportar XLSX'}
        </button>
      </div>

      {error && <ErrorBanner msg={error} onRetry={() => load()} />}

      {/* Table */}
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--line)',
        borderRadius: 8, overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: compact ? 640 : undefined }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--line)' }}>
              <Th><SortBtn col="name" label="Nome" /></Th>
              <Th><SortBtn col="email" label="E-mail" /></Th>
              <Th style={{ maxWidth: 120 }}>ID</Th>
              {!compact && <Th><SortBtn col="created_at" label="Cadastro" /></Th>}
              <Th><SortBtn col="credits" label="Créditos" /></Th>
              <Th><SortBtn col="credits_expires_at" label="Expiração" /></Th>
              {!compact && <Th>Tipo</Th>}
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.users.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--font-body)', fontSize: 13 }}>
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
                  <CopyableId id={u.id} />
                </Td>
                {!compact && (
                  <Td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}
                    </span>
                  </Td>
                )}
                <Td>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                    color: (u.credits || 0) > 0 ? '#4caf50' : 'var(--text-dim)',
                  }}>
                    {(u.credits || 0).toLocaleString('pt-BR')}
                  </span>
                </Td>
                <Td>
                  {(() => {
                    if (!u.credits_expires_at) {
                      return (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                          —
                        </span>
                      )
                    }
                    const exp = new Date(u.credits_expires_at)
                    const diff = exp.getTime() - Date.now()
                    const overdue = diff <= 0
                    const totalSec = Math.max(0, Math.floor(diff / 1000))
                    const days  = Math.floor(totalSec / 86400)
                    const hours = Math.floor((totalSec % 86400) / 3600)
                    const mins  = Math.floor((totalSec % 3600) / 60)
                    const secs  = totalSec % 60
                    const pad2 = n => String(n).padStart(2, '0')
                    const color = overdue ? '#e05050' : (days <= 3 ? '#ff9800' : '#4caf50')
                    const text = overdue
                      ? 'Expirado'
                      : days > 0
                        ? `${days}d ${pad2(hours)}:${pad2(mins)}:${pad2(secs)}`
                        : `${pad2(hours)}:${pad2(mins)}:${pad2(secs)}`
                    return (
                      <span
                        title={`Expira em ${exp.toLocaleString('pt-BR')}`}
                        style={{
                          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                          color, whiteSpace: 'nowrap',
                        }}
                      >
                        {text}
                      </span>
                    )
                  })()}
                </Td>
                {!compact && (
                  <Td>
                    {u.is_admin
                      ? <Tag label="Admin" color="#ff6a00" />
                      : <Tag label="Usuário" color="#666" />
                    }
                  </Td>
                )}
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

// ─── Log de Atividades (Central) ─────────────────────────────────────────────
const LOG_POLL_MS = 20_000 // atualiza sozinho a cada 20s

const EVENT_META = {
  login:            { label: 'Login',            color: '#4caf50' },
  logout:           { label: 'Logout',           color: '#9e9e9e' },
  upload:           { label: 'Upload',           color: '#2196f3' },
  download:         { label: 'Download',         color: '#ff6a00' },
  download_attempt: { label: 'Tent. download',   color: '#ff9800' },
  cut_created:      { label: 'Corte gerado',     color: '#e040fb' },
  project_saved:    { label: 'Projeto salvo',    color: '#00bcd4' },
  project_loaded:   { label: 'Projeto aberto',   color: '#26a69a' },
  upgrade:          { label: 'Upgrade',          color: '#ffd600' },
}

const TOOL_META = {
  cortes:  { label: 'Cortes',    color: '#ff6a00' },
  studio:  { label: 'Modelador', color: '#2196f3' },
  auth:    { label: 'Sistema',   color: '#9e9e9e' },
}

function fmtEventLabel(evt) {
  return (EVENT_META[evt] || {}).label || evt || '—'
}
function fmtEventColor(evt) {
  return (EVENT_META[evt] || {}).color || '#888'
}
function fmtToolLabel(tool) {
  return (TOOL_META[tool] || {}).label || tool || '—'
}
function fmtToolColor(tool) {
  return (TOOL_META[tool] || {}).color || '#888'
}

function fmtDT(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

/** Resumo legível dos detalhes de um evento (destaques por tipo). */
function detailsLine(evt, details = {}) {
  if (!details || typeof details !== 'object') return ''
  const d = details
  switch (evt) {
    case 'upload':    return [d.fileName, d.faces ? `${d.faces} faces` : null].filter(Boolean).join(' · ')
    case 'download':
    case 'download_attempt': {
      const parts = []
      if (d.format) parts.push(`.${d.format}`)
      if (d.partCount) parts.push(`${d.partCount} parte(s)`)
      if (d.mode) parts.push(d.mode === 'free' ? 'grátis' : 'pago')
      if (d.zip) parts.push('ZIP')
      if (d.blocked) parts.push(d.reason === 'creditos_insuficientes' ? '⛔ sem créditos' : '⛔ bloqueado')
      if (d.source) parts.push(d.source)
      return parts.join(' · ')
    }
    case 'cut_created': {
      const tool = { smart_autocut: 'SmartCut', encaixe: 'Encaixe', auto_split: 'Auto Split', plane_cut: 'Corte plano', acabamento: 'Acabamento' }[d.tool] || d.tool
      const parts = [tool]
      if (d.pieces) parts.push(`${d.pieces} peças`)
      if (d.parts) parts.push(`${d.parts} parte(s)`)
      if (d.radius) parts.push(`Ø${(d.radius * 2).toFixed(1)}mm`)
      if (d.mode) parts.push(d.mode)
      return parts.join(' · ')
    }
    case 'upgrade': {
      const parts = []
      if (d.plan) parts.push(`Plano ${d.plan}`)
      if (d.credits) parts.push(`+${d.credits} créditos`)
      if (d.product) parts.push(d.product)
      return parts.join(' · ')
    }
    case 'project_saved':
    case 'project_loaded': {
      const parts = []
      if (d.name) parts.push(`"${d.name}"`)
      if (d.partCount) parts.push(`${d.partCount} parte(s)`)
      return parts.join(' · ')
    }
    case 'login': {
      const parts = []
      if (d.plan) parts.push(`plano ${d.plan}`)
      if (d.href) parts.push(d.href)
      return parts.join(' · ')
    }
    default: {
      const keys = Object.keys(d).filter((k) => !['href'].includes(k))
      return keys.slice(0, 3).map((k) => `${k}: ${JSON.stringify(d[k])}`).join(' · ')
    }
  }
}

function ActivitiesLogPage({ compact = false }) {
  const [stats, setStats]     = useState(null)
  const [data, setData]       = useState({ events: [], total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const [search, setSearch] = useState('')
  const [evt, setEvt]       = useState('')      // '' = todos
  const [tool, setTool]     = useState('')      // '' = todas
  const [range, setRange]   = useState('7d')    // 'today' | '7d' | '30d' | 'all'
  const [page, setPage]     = useState(1)

  const load = useCallback(async (opts) => {
    try {
      const q = new URLSearchParams()
      if (opts.search) q.set('search', opts.search)
      if (opts.evt)    q.set('event', opts.evt)
      if (opts.tool)   q.set('tool', opts.tool)
      if (opts.range === 'today') q.set('from', new Date().toISOString().slice(0, 10))
      if (opts.range === '7d')    q.set('from', new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10))
      if (opts.range === '30d')   q.set('from', new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10))
      q.set('page', String(opts.page || 1))
      q.set('limit', '60')

      const [eventsRes, statsRes] = await Promise.all([
        adminFetch(`/events?${q.toString()}`),
        adminFetch('/events/stats'),
      ])
      setData(eventsRes)
      setStats(statsRes)
      setError(null)
      setLastUpdated(new Date())
    } catch (e) {
      setError(e?.message || 'Falha ao carregar o log')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carga inicial + auto-refresh a cada 20s (mantém filtros atuais)
  useEffect(() => {
    setLoading(true)
    load({ search, evt, tool, range, page })
    const id = setInterval(() => load({ search, evt, tool, range, page }), LOG_POLL_MS)
    return () => clearInterval(id)
  }, [load, search, evt, tool, range, page])

  const applyFilters = (patch) => {
    setSearch(patch.search !== undefined ? patch.search : search)
    setEvt(patch.evt !== undefined ? patch.evt : evt)
    setTool(patch.tool !== undefined ? patch.tool : tool)
    setRange(patch.range !== undefined ? patch.range : range)
    setPage(1)
  }

  const counts  = stats?.today?.counts || {}
  const tools   = stats?.today?.tools || {}
  const last7   = stats?.last_7d?.counts || {}

  const cards = compact ? 2 : 3
  const grid = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cards}, minmax(0, 1fr))`,
    gap: 10,
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--panel)',
    border: '1px solid var(--line)',
    borderRadius: 6,
    padding: '8px 10px',
    fontFamily: 'var(--font-body)', fontSize: 13,
    color: 'var(--text)',
    outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <PageTitle
          title="Log de Atividades"
          subtitle="Tudo que acontece na ferramenta: quem entrou, carregou arquivo, gerou cortes, baixou e comprou. Atualiza automaticamente."
          compact={compact}
        />
        {lastUpdated && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--text-dim)', whiteSpace: 'nowrap',
          }}>
            atualizado {lastUpdated.toLocaleTimeString('pt-BR')}
          </span>
        )}
      </div>

      {/* ── Métricas de hoje ─────────────────────────────────────── */}
      <div style={grid}>
        <StatCard label="Downloads hoje" value={counts.download || 0} accent="#ff6a00" icon={<span>⬇</span>} />
        <StatCard label="Tentativas de download" value={counts.download_attempt || 0} accent="#ff9800" icon={<span>⚡</span>} />
        <StatCard label="Cortes gerados hoje" value={counts.cut_created || 0} accent="#e040fb" icon={<span>✂</span>} />
        <StatCard label="Uploads hoje" value={counts.upload || 0} accent="#2196f3" icon={<span>⬆</span>} />
        <StatCard label="Logins hoje" value={counts.login || 0} accent="#4caf50" icon={<span>→</span>} />
        <StatCard label="Usuários ativos hoje" value={stats?.today?.active_users || 0} accent="#00bcd4" icon={<span>●</span>} />
      </div>

      {/* ── Painel de hoje vs 7d ─────────────────────────────────── */}
      <Section title="Usabilidade (hoje · últimos 7 dias)">
        <div style={grid}>
          <StatCard label="Downloads 7 dias" value={last7.download || 0} accent="#ff6a00" icon={<span>⬇</span>} />
          <StatCard label="Cortes 7 dias" value={last7.cut_created || 0} accent="#e040fb" icon={<span>✂</span>} />
          <StatCard label="Uploads 7 dias" value={last7.upload || 0} accent="#2196f3" icon={<span>⬆</span>} />
          <StatCard label="Logins 7 dias" value={last7.login || 0} accent="#4caf50" icon={<span>→</span>} />
          <StatCard label="Ativos 7 dias" value={stats?.last_7d?.active_users || 0} accent="#00bcd4" icon={<span>●</span>} />
          <StatCard label="Upgrades 7 dias" value={last7.upgrade || 0} accent="#ffd600" icon={<span>⭐</span>} />
        </div>
      </Section>

      {/* ── Filtros ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '2fr 1fr 1fr 1fr', gap: 10 }}>
        <div>
          <span style={labelStyle}>Buscar usuário</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome ou e-mail..."
              style={inputStyle}
            />
            <button onClick={() => applyFilters({ search })} style={btnStyle({ variant: 'primary', size: 'sm' })}>
              <SearchIcon size={13} /> Buscar
            </button>
          </div>
        </div>
        <div>
          <span style={labelStyle}>Ferramenta</span>
          <select value={tool} onChange={(e) => applyFilters({ tool: e.target.value })} style={inputStyle}>
            <option value="">Todas</option>
            <option value="cortes">Cortes</option>
            <option value="studio">Modelador</option>
            <option value="auth">Sistema</option>
          </select>
        </div>
        <div>
          <span style={labelStyle}>Evento</span>
          <select value={evt} onChange={(e) => applyFilters({ evt: e.target.value })} style={inputStyle}>
            <option value="">Todos</option>
            {Object.entries(EVENT_META).map(([k, m]) => (
              <option key={k} value={k}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <span style={labelStyle}>Período</span>
          <select value={range} onChange={(e) => applyFilters({ range: e.target.value })} style={inputStyle}>
            <option value="today">Hoje</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="all">Tudo</option>
          </select>
        </div>
      </div>

      {/* ── Tabela de eventos ────────────────────────────────────── */}
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--line)',
        borderRadius: 10, overflow: 'hidden',
      }}>
        {loading && !data.events.length ? (
          <Spinner />
        ) : error ? (
          <ErrorBanner msg={error} onRetry={() => load({ search, evt, tool, range, page })} />
        ) : !data.events.length ? (
          <Empty msg="Nenhum evento encontrado para os filtros atuais." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--line)' }}>
                <tr>
                  <Th>Data</Th>
                  <Th>Usuário</Th>
                  <Th>Ferramenta</Th>
                  <Th>Evento</Th>
                  <Th>Detalhes</Th>
                </tr>
              </thead>
              <tbody>
                {data.events.map((e, i) => (
                  <tr key={e.id ?? i} style={{ borderBottom: '1px solid var(--line)', verticalAlign: 'top' }}>
                    <Td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {fmtDT(e.created_at)}
                      </span>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                          {e.user_name || '—'}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
                          {e.user_email || 'anônimo'}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <Tag label={fmtToolLabel(e.tool)} color={fmtToolColor(e.tool)} />
                    </Td>
                    <Td>
                      <Tag label={fmtEventLabel(e.event)} color={fmtEventColor(e.event)} />
                    </Td>
                    <Td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {detailsLine(e.event, e.details)}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data.pages > 1 && (
        <Pagination current={page} total={data.pages} onChange={(p) => { setPage(p); setLoading(true) }} />
      )}
    </div>
  )
}


// ─── Credits Modal ────────────────────────────────────────────────────────────
function CreditsModal({ user, onClose, onSuccess }) {
  const [op, setOp]           = useState('add') // 'add' | 'remove' | 'set'
  const [amount, setAmount]   = useState('')
  const [note, setNote]       = useState('')
  const [expiryDays, setExpiryDays] = useState('')
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

      // Define/ativa o cronômetro quando dias de expiração informados
      if (expiryDays && parseInt(expiryDays, 10) > 0) {
        try {
          await adminFetch(`/users/${user.id}/expiry`, {
            method: 'PATCH',
            body: JSON.stringify({ days: parseInt(expiryDays, 10), note: note || undefined }),
          })
          setSuccess(`Saldo atualizado (→ ${result.new_credits}) · cronômetro de ${parseInt(expiryDays, 10)} dias ativado`)
          setExpiryDays('')
        } catch (e) {
          setSuccess(`Saldo atualizado: → ${result.new_credits} (falha ao ativar cronômetro: ${e.message})`)
        }
      }
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
          <InfoItem
            label="Expira em"
            value={user.credits_expires_at
              ? new Date(user.credits_expires_at).toLocaleDateString('pt-BR')
              : '—'}
          />
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

        {/* Expiração (cronômetro) */}
        <div>
          <label style={labelStyle}>Expiração dos créditos (cronômetro)</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="number"
              min="1"
              max="365"
              value={expiryDays}
              onChange={e => setExpiryDays(e.target.value)}
              placeholder="Dias (ex.: 90)"
              style={{
                flex: 1, boxSizing: 'border-box',
                padding: '8px 12px',
                background: 'var(--panel)', border: '1px solid var(--line)',
                borderRadius: 6, outline: 'none',
                fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text)',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#00bcd4'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--line)'}
            />
            <button
              onClick={() => setExpiryDays(String(90))}
              style={btnStyle({ variant: 'ghost', size: 'sm' })}
              title="Padrão: 3 meses"
            >
              90d
            </button>
          </div>
          <p style={{ margin: '6px 0 0', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)' }}>
            {expiryDays && parseInt(expiryDays) > 0
              ? <>▶ Cronômetro em {new Date(Date.now() + parseInt(expiryDays) * 86400000).toLocaleDateString('pt-BR')}</>
              : user.credits_expires_at
                ? <>Atual: {new Date(user.credits_expires_at).toLocaleDateString('pt-BR')}</>
                : 'Sem expiração (não pago / sem cronômetro ativo)'}
            {expiryDays && <span style={{ color: '#00897b' }}> · será aplicado ao confirmar</span>}
          </p>
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

/** Formata valor em reais no padrão brasileiro. value já deve estar em REAIS (não centavos). */
function formatBRL(value) {
  if (value == null || value === '' || Number.isNaN(Number(value))) return '—'
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Informações da expiração do crédito. O texto principal é a QUANTIDADE DE
 * DIAS que faltam para os créditos finalizarem (ex.: "37 dias"); a cor
 * sinaliza a urgência e o título completo fica disponível no tooltip.
 * Visível apenas no painel do admin.
 */
/** Normaliza status para exibição legível e cor. */
function paymentStatusMeta(status = '') {
  const s = (status || '').toLowerCase()
  if (s.includes('user_not_found')) {
    return { label: 'PAID_USER_NOT_FOUND', color: '#e05050', hint: 'Usuário não localizado no momento do webhook' }
  }
  if (s.includes('unrecognized_product')) {
    return { label: 'PRODUTO NÃO RECONHECIDO', color: '#ff9800', hint: 'Produto não mapeado para créditos' }
  }
  if (s.includes('paid') || s.includes('approved')) {
    return { label: status || 'paid', color: '#4caf50', hint: null }
  }
  return { label: status || '—', color: '#888', hint: null }
}

function cleanProductLabel(product = '') {
  return String(product || '').split('|||')[0].trim() || '—'
}

function buyerEmailFromProduct(product = '') {
  const m = String(product || '').match(/\|\|\|buyer:([^\s|]+)/i)
  return m ? m[1].trim().toLowerCase() : null
}

// ─── Payments table ───────────────────────────────────────────────────────────
function PaymentsTable({ payments, onOpenUser, openingUser, onLinkPayment }) {
  const [linkingId, setLinkingId] = useState(null)
  const [linkUserId, setLinkUserId] = useState('')
  const [linkBusy, setLinkBusy] = useState(false)
  const [linkError, setLinkError] = useState(null)

  const submitLink = async (paymentId) => {
    if (!linkUserId.trim()) {
      setLinkError('Informe o USER_ID')
      return
    }
    setLinkBusy(true)
    setLinkError(null)
    try {
      await onLinkPayment?.(paymentId, linkUserId.trim())
      setLinkingId(null)
      setLinkUserId('')
    } catch (e) {
      setLinkError(e.message || 'Falha ao vincular')
    } finally {
      setLinkBusy(false)
    }
  }

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--line)' }}>
            {['Nome', 'E-mail', 'Produto', 'Valor', 'Créditos', 'Status', 'Data', 'Ação'].map(h => (
              <Th key={h}>{h}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.map((p, i) => {
            const productLabel = cleanProductLabel(p.product)
            const buyerEmail = buyerEmailFromProduct(p.product)
            const credits = creditsFromProduct(productLabel)
            const statusMeta = paymentStatusMeta(p.status)
            const hasUser = Boolean(p.user_id)
            const needsLink = (p.status || '').toLowerCase().includes('user_not_found')
            return (
              <tr key={p.id || i} style={{ borderBottom: i < payments.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <Td>
                  {hasUser ? (
                    <button
                      type="button"
                      onClick={() => onOpenUser?.(p.user_id)}
                      disabled={openingUser}
                      title="Abrir créditos deste usuário (via USER_ID)"
                      style={{
                        background: 'none', border: 'none', padding: 0, margin: 0,
                        cursor: openingUser ? 'wait' : 'pointer',
                        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                        color: '#ff6a00', textDecoration: 'underline', textUnderlineOffset: 2,
                      }}
                    >
                      {p.user_name || 'Usuário'}
                    </button>
                  ) : (
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-dim)' }}>—</span>
                  )}
                </Td>
                <Td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                    {p.user_email || buyerEmail || '—'}
                  </span>
                </Td>
                <Td>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)' }}>
                    {productLabel}
                  </span>
                </Td>
                <Td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#4caf50', fontWeight: 600 }}>
                    {formatBRL(p.value)}
                  </span>
                </Td>
                <Td>
                  {credits !== null ? (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#ffd600' }}>
                      ⚡ {credits.toLocaleString('pt-BR')}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>—</span>
                  )}
                </Td>
                <Td>
                  <span title={statusMeta.hint || undefined}>
                    <Tag label={statusMeta.label} color={statusMeta.color} />
                  </span>
                </Td>
                <Td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                    {p.created_at
                      ? new Date(p.created_at).toLocaleString('pt-BR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : '—'}
                  </span>
                </Td>
                <Td>
                  {needsLink ? (
                    linkingId === p.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 180 }}>
                        <input
                          value={linkUserId}
                          onChange={e => setLinkUserId(e.target.value)}
                          placeholder="USER_ID do usuário"
                          style={{
                            fontFamily: 'var(--font-mono)', fontSize: 11,
                            padding: '4px 6px', borderRadius: 4,
                            border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)',
                          }}
                        />
                        {linkError && <span style={{ color: '#e05050', fontSize: 10 }}>{linkError}</span>}
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            type="button"
                            disabled={linkBusy}
                            onClick={() => submitLink(p.id)}
                            style={{
                              ...btnStyle({ variant: 'primary', size: 'sm' }),
                              fontSize: 11, padding: '3px 8px',
                            }}
                          >
                            {linkBusy ? '…' : 'Vincular'}
                          </button>
                          <button
                            type="button"
                            disabled={linkBusy}
                            onClick={() => { setLinkingId(null); setLinkError(null); setLinkUserId('') }}
                            style={{ ...btnStyle({ variant: 'ghost', size: 'sm' }), fontSize: 11, padding: '3px 8px' }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setLinkingId(p.id); setLinkUserId(''); setLinkError(null) }}
                        style={{
                          ...btnStyle({ variant: 'ghost', size: 'sm' }),
                          fontSize: 11, color: '#ff6a00', borderColor: '#ff6a00',
                        }}
                      >
                        Vincular
                      </button>
                    )
                  ) : (
                    <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>—</span>
                  )}
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
      minWidth: 0,
      background: 'var(--panel)', border: '1px solid var(--line)',
      borderRadius: 10, padding: '14px 14px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ fontSize: 18 }}>{icon}</div>
      <div style={{
        fontFamily: 'var(--font-condensed)', fontSize: 22, fontWeight: 900,
        color: accent, letterSpacing: '-0.01em', lineHeight: 1.1,
        wordBreak: 'break-word',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
        letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)',
      }}>
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

function PageTitle({ title, subtitle, compact = false }) {
  return (
    <div>
      <h1 style={{
        margin: 0, fontFamily: 'var(--font-condensed)',
        fontSize: compact ? 18 : 22, fontWeight: 900,
        letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)',
      }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{
          margin: '4px 0 0', fontFamily: 'var(--font-body)',
          fontSize: compact ? 11 : 13, color: 'var(--text-secondary)',
          lineHeight: 1.35,
        }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

/** Clique no ID → copia o USER_ID completo para a área de transferência */
function CopyableId({ id }) {
  const [copied, setCopied] = useState(false)
  if (!id) return <span style={{ color: 'var(--text-dim)' }}>—</span>

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id)
    } catch {
      // Fallback para ambientes sem clipboard API
      const ta = document.createElement('textarea')
      ta.value = id
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={`Clique para copiar: ${id}`}
      style={{
        background: copied ? 'rgba(76,175,80,0.15)' : 'none',
        border: copied ? '1px solid #4caf50' : '1px solid transparent',
        borderRadius: 4,
        padding: '2px 6px',
        margin: 0,
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: copied ? '#4caf50' : 'var(--text-dim)',
        maxWidth: 140,
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s',
      }}
    >
      {copied ? '✓ Copiado!' : `${id.slice(0, 8)}…`}
    </button>
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

function ActivityIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
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
