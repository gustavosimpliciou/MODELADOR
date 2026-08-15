// Netlify Function — Admin API (ESM, pure fetch, no npm deps)
// Handles:  GET  /api/admin/stats
//           GET  /api/admin/users
//           PATCH /api/admin/users/:id/credits

const SUPABASE_URL         = process.env.SUPABASE_URL         || 'https://blqvsglspdayrznnbzzf.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_KEY         || ''
const ADMIN_EMAIL          = 'nativos3d.adm@gmail.com'

// ─── Supabase REST helpers ───────────────────────────────────────────────────

/**
 * Kiwify envia INTEGER em centavos (ex: 690 = R$ 6,90).
 * Alguns registros antigos/manuais podem já estar em reais (ex: "6.90").
 * Heurística:
 * - string com ponto/vírgula → já está em reais
 * - inteiro → centavos → divide por 100
 */
function toReais(raw) {
  if (raw == null || raw === '') return null
  const asStr = String(raw).trim().replace(',', '.')
  const n = Number(asStr)
  if (!Number.isFinite(n)) return null
  if (asStr.includes('.')) return n          // já em reais (ex: 6.90)
  return n / 100                             // centavos Kiwify (ex: 690 → 6.90)
}

function sbHeaders() {
  return {
    'Content-Type':  'application/json',
    'apikey':        SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Prefer':        'return=representation',
  }
}

async function sbSelect(table, params = {}) {
  const qs  = new URLSearchParams(params).toString()
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, { headers: sbHeaders() })
  if (!res.ok) return []
  return res.json()
}

async function sbSelectCount(table, params = {}) {
  const qs  = new URLSearchParams(params).toString()
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
    headers: { ...sbHeaders(), 'Prefer': 'count=exact' },
  })
  const count = parseInt(res.headers.get('content-range')?.split('/')[1] ?? '0', 10)
  const data  = res.ok ? await res.json() : []
  return { data, count }
}

async function sbUpdate(table, filterKey, filterValue, data) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${filterKey}=eq.${encodeURIComponent(filterValue)}`,
    { method: 'PATCH', headers: sbHeaders(), body: JSON.stringify(data) },
  )
  if (!res.ok) throw new Error(await res.text())
  return res.json().catch(() => [])
}

async function sbInsert(table, row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method:  'POST',
    headers: { ...sbHeaders(), 'Prefer': 'return=minimal' },
    body:    JSON.stringify(row),
  })
  if (!res.ok) throw new Error(await res.text())
}

// ─── Auth ────────────────────────────────────────────────────────────────────

// Verify the Supabase access token the frontend sends.
// Uses service-role key as apikey so Supabase accepts any valid project JWT.
async function verifyAdmin(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)

  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey':        SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${token}`,
    },
  })
  if (!res.ok) return null

  const user = await res.json()
  if (user?.email !== ADMIN_EMAIL) return null
  return user
}

// ─── Response helper ─────────────────────────────────────────────────────────

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  // CORS pre-flight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Methods': 'GET,PATCH,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization,Content-Type',
      },
      body: '',
    }
  }

  // Env guard
  if (!SUPABASE_SERVICE_KEY) return json(503, { detail: 'SUPABASE_KEY não configurado no servidor' })

  // Auth guard
  const admin = await verifyAdmin(event.headers?.authorization || event.headers?.Authorization)
  if (!admin) return json(401, { detail: 'Sessão inválida ou expirada' })

  // Route — normalize both public path (/api/admin/...) and Netlify-rewritten
  // function path (/.netlify/functions/admin/...) so subroutes resolve correctly.
  const path   = event.path
    .replace(/^\/\.netlify\/functions\/admin/, '')
    .replace(/^\/api\/admin/, '') // e.g. '/stats', '/users', '/users/xxx/credits'
  const method = event.httpMethod

  // ── GET /stats ──────────────────────────────────────────────────────────────
  if (method === 'GET' && path === '/stats') {
    const [users, payments, allPaymentValues] = await Promise.all([
      // Sem limite explícito o PostgREST trunca em 1000 linhas → total de
      // usuários fica errado. 1M cobre qualquer base realista.
      sbSelect('users', { select: 'id,name,email,credits,plan', limit: '1000000' }),
      sbSelect('payments', {
        select:  'id,user_id,product,value,status,created_at,kiwify_transaction_id',
        order:   'created_at.desc',
        limit:   20,
      }),
      // Todos os pagamentos só com value+status (para total de vendas)
      sbSelect('payments', { select: 'value,status', limit: '1000000' }),
    ])

    const total_users        = users.length
    const total_admins       = users.filter(u => u.email === ADMIN_EMAIL).length
    const total_credits      = users.reduce((s, u) => s + (u.credits || 0), 0)
    const users_with_credits = users.filter(u => (u.credits || 0) > 0).length

    /**
     * Kiwify envia INTEGER em centavos (ex: 690 = R$ 6,90).
     * Alguns registros antigos/manuais podem já estar em reais (ex: "6.90").
     * Heurística:
     * - string com ponto/vírgula → já está em reais
     * - inteiro → centavos → divide por 100
     */
    function toReais(raw) {
      if (raw == null || raw === '') return null
      const asStr = String(raw).trim().replace(',', '.')
      const n = Number(asStr)
      if (!Number.isFinite(n)) return null
      if (asStr.includes('.')) return n          // já em reais (ex: 6.90)
      return n / 100                             // centavos Kiwify (ex: 690 → 6.90)
    }

    // Map user_id → user for enrichment
    const userMap = Object.fromEntries((users || []).map(u => [u.id, u]))
    const recent_payments = (payments || []).map(p => {
      const valueReais = toReais(p.value)
      const u = p.user_id ? userMap[p.user_id] : null
      // product pode ter "Nome|||buyer:email" em pagamentos órfãos
      const productRaw = p.product || ''
      const buyerMatch = String(productRaw).match(/\|\|\|buyer:([^\s|]+)/i)
      return {
        id: p.id,
        user_id: p.user_id || null,
        product: productRaw,
        value: valueReais, // sempre em REAIS
        status: p.status,
        created_at: p.created_at,
        kiwify_transaction_id: p.kiwify_transaction_id || null,
        user_name: u?.name || null,
        user_email: u?.email || (buyerMatch ? buyerMatch[1].toLowerCase() : null),
        user_credits: u != null ? (u.credits || 0) : null,
        user_plan: u?.plan || null,
      }
    })

    // Total de vendas em dinheiro (pagamentos que chegaram na Kiwify)
    // Inclui paid / approved e também paid_user_not_found (o dinheiro caiu, só não linkou usuário)
    let total_revenue = 0
    let total_paid_count = 0
    for (const p of (allPaymentValues || [])) {
      const s = (p.status || '').toLowerCase()
      const isMoneyIn =
        s.includes('paid') ||
        s.includes('approved') ||
        s.includes('user_not_found') // dinheiro caiu, usuário não encontrado
      if (!isMoneyIn) continue
      if (s.includes('unrecognized_product')) continue
      const v = toReais(p.value)
      if (v != null && v > 0) {
        total_revenue += v
        total_paid_count += 1
      }
    }
    // arredonda para 2 casas (evita 25.00000001)
    total_revenue = Math.round(total_revenue * 100) / 100

    return json(200, {
      total_users,
      total_admins,
      total_credits,
      users_with_credits,
      users_without_credits: total_users - users_with_credits,
      total_revenue,
      total_paid_count,
      recent_payments,
    })
  }

  // ── GET /stats/charts ───────────────────────────────────────────────────────
  // Série temporal de usuários cadastrados e pagamentos (receita + qtd) por dia
  if (method === 'GET' && path === '/stats/charts') {
    const qs = event.queryStringParameters || {}
    const now = new Date()
    let toDate = qs.to ? new Date(qs.to + 'T23:59:59.999Z') : now
    let fromDate = qs.from
      ? new Date(qs.from + 'T00:00:00.000Z')
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    if (Number.isNaN(fromDate.getTime())) fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    if (Number.isNaN(toDate.getTime())) toDate = now
    if (fromDate > toDate) { const t = fromDate; fromDate = toDate; toDate = t }

    // Limite de 365 dias para não estourar memória
    const maxSpan = 366 * 24 * 60 * 60 * 1000
    if (toDate - fromDate > maxSpan) {
      fromDate = new Date(toDate.getTime() - maxSpan)
    }

    const fromISO = fromDate.toISOString()
    const toISO = toDate.toISOString()

    function toReais(raw) {
      if (raw == null || raw === '') return null
      const asStr = String(raw).trim().replace(',', '.')
      const n = Number(asStr)
      if (!Number.isFinite(n)) return null
      if (asStr.includes('.')) return n
      return n / 100
    }

    function dayKey(iso) {
      if (!iso) return null
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return null
      return d.toISOString().slice(0, 10) // YYYY-MM-DD UTC
    }

    const [usersRows, paymentsRows] = await Promise.all([
      sbSelect('users', {
        select: 'id,created_at',
        created_at: `gte.${fromISO}`,
        order: 'created_at.asc',
        limit: '1000000',
      }),
      sbSelect('payments', {
        select: 'id,value,status,created_at',
        created_at: `gte.${fromISO}`,
        order: 'created_at.asc',
        limit: '1000000',
      }),
    ])

    // Filtra até toISO no JS (PostgREST gte + lte com dois params no mesmo campo é chato via URLSearchParams)
    const usersInRange = (usersRows || []).filter(u => {
      const t = new Date(u.created_at).getTime()
      return t >= fromDate.getTime() && t <= toDate.getTime()
    })
    const paysInRange = (paymentsRows || []).filter(p => {
      const t = new Date(p.created_at).getTime()
      return t >= fromDate.getTime() && t <= toDate.getTime()
    })

    // Preenche todos os dias do intervalo
    const days = []
    const cursor = new Date(Date.UTC(
      fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate(),
    ))
    const endDay = new Date(Date.UTC(
      toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate(),
    ))
    while (cursor <= endDay) {
      days.push(cursor.toISOString().slice(0, 10))
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }

    const usersByDay = Object.fromEntries(days.map(d => [d, 0]))
    const paymentsByDay = Object.fromEntries(days.map(d => [d, { count: 0, revenue: 0 }]))

    for (const u of usersInRange) {
      const k = dayKey(u.created_at)
      if (k && usersByDay[k] != null) usersByDay[k] += 1
    }

    for (const p of paysInRange) {
      const k = dayKey(p.created_at)
      if (!k || !paymentsByDay[k]) continue
      const s = (p.status || '').toLowerCase()
      const isMoney =
        (s.includes('paid') || s.includes('approved') || s.includes('user_not_found')) &&
        !s.includes('unrecognized_product')
      if (!isMoney) continue
      const v = toReais(p.value)
      paymentsByDay[k].count += 1
      if (v != null && v > 0) paymentsByDay[k].revenue += v
    }

    const users_series = days.map(d => ({ date: d, count: usersByDay[d] }))
    const payments_series = days.map(d => ({
      date: d,
      count: paymentsByDay[d].count,
      revenue: Math.round(paymentsByDay[d].revenue * 100) / 100,
    }))

    const total_users_in_range = users_series.reduce((s, x) => s + x.count, 0)
    const total_payments_in_range = payments_series.reduce((s, x) => s + x.count, 0)
    const total_revenue_in_range = Math.round(
      payments_series.reduce((s, x) => s + x.revenue, 0) * 100,
    ) / 100

    return json(200, {
      from: days[0] || fromISO.slice(0, 10),
      to: days[days.length - 1] || toISO.slice(0, 10),
      users_series,
      payments_series,
      total_users_in_range,
      total_payments_in_range,
      total_revenue_in_range,
    })
  }

  // ── GET /users/:id ──────────────────────────────────────────────────────────
  const userByIdMatch = path.match(/^\/users\/([^/]+)$/)
  if (method === 'GET' && userByIdMatch) {
    const userId = userByIdMatch[1]
    const rows = await sbSelect('users', {
      select: 'id,name,email,plan,credits,created_at',
      id: `eq.${userId}`,
    })
    if (!rows?.length) return json(404, { detail: 'Usuário não encontrado' })
    const u = rows[0]
    return json(200, { ...u, is_admin: u.email === ADMIN_EMAIL })
  }

  // ── GET /users ──────────────────────────────────────────────────────────────
  if (method === 'GET' && path === '/users') {
    const qs      = event.queryStringParameters || {}
    const page    = Math.max(1, parseInt(qs.page    || '1',  10))
    const limit   = Math.max(1, parseInt(qs.limit   || '20', 10))
    const search  = (qs.search   || '').trim()
    const sortBy  = ['name','created_at','credits','email','credits_expires_at'].includes(qs.sort_by) ? qs.sort_by : 'created_at'
    const sortDir = qs.sort_dir === 'asc' ? 'asc' : 'desc'
    const offset  = (page - 1) * limit
    const cols    = 'id,name,email,plan,credits,created_at,credits_expires_at'

    const params = {
      select: cols,
      order:  `${sortBy}.${sortDir}`,
      offset: String(offset),
      limit:  String(limit),
    }
    if (qs.paid === '1' || qs.paid === 'true') {
      // Apenas usuários que pagaram (têm data de expiração definida)
      params.credits_expires_at = 'not.is.null'
    }
    if (search) {
      // PostgREST exige parênteses no `or`. Remove chars que quebram o filtro.
      const term = search
        .replace(/[%(),]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (term) {
        // Busca por nome, e-mail OU id (útil para colar USER_ID)
        params.or = `(name.ilike.*${term}*,email.ilike.*${term}*,id.ilike.*${term}*)`
      }
    }

    const { data, count } = await sbSelectCount('users', params)

    const users = (data || []).map(u => ({ ...u, is_admin: u.email === ADMIN_EMAIL }))
    const pages = Math.max(1, Math.ceil(count / limit))

    return json(200, { users, total: count, page, limit, pages })
  }

  // ── PATCH /users/:id/credits ────────────────────────────────────────────────
  const creditsMatch = path.match(/^\/users\/([^/]+)\/credits$/)
  if (method === 'PATCH' && creditsMatch) {
    const userId = creditsMatch[1]
    let body = {}
    try { body = JSON.parse(event.body || '{}') } catch { body = {} }

    const { operation, amount, note } = body

    if (!['add', 'remove', 'set'].includes(operation)) return json(400, { detail: 'Operação inválida — use: add | remove | set' })
    if (typeof amount !== 'number' || amount < 0)       return json(400, { detail: 'O valor deve ser positivo' })

    const rows = await sbSelect('users', { select: '*', id: `eq.${userId}` })
    if (!rows?.length) return json(404, { detail: 'Usuário não encontrado' })

    const target          = rows[0]
    const current_credits = target.credits || 0
    let new_credits, change, op_type, desc

    if (operation === 'add') {
      new_credits = current_credits + amount
      change      = amount
      op_type     = 'admin_add'
      desc        = `ADM +${amount} créditos`
    } else if (operation === 'remove') {
      if (amount > current_credits) return json(400, { detail: `Saldo insuficiente: usuário tem ${current_credits} créditos` })
      new_credits = current_credits - amount
      change      = -amount
      op_type     = 'admin_remove'
      desc        = `ADM -${amount} créditos`
    } else { // set
      new_credits = Math.max(0, amount)
      change      = new_credits - current_credits
      op_type     = 'admin_set'
      desc        = `ADM definiu saldo para ${new_credits}`
    }

    if (note) desc += ` (${note})`
    desc += ` | admin: ${admin.email}`

    const now = new Date().toISOString()

    await sbUpdate('users', 'id', userId, { credits: new_credits })

    sbInsert('credit_history', {
      id:          crypto.randomUUID(),
      user_id:     userId,
      type:        op_type,
      credits:     change,
      description: desc,
      created_at:  now,
    }).catch(() => {})

    return json(200, {
      ok:               true,
      previous_credits: current_credits,
      new_credits,
      change,
    })
  }

  // ── PATCH /users/:id/expiry ────────────────────────────────────────────────
  // Define a expiração de créditos manualmente (para ativar o cronômetro de
  // quem pagou e o pagamento ainda não carregou a data, ou para renovar).
  // Body: { days?: number, expires_at?: string, note?: string }
  const expiryMatch = path.match(/^\/users\/([^/]+)\/expiry$/)
  if (method === 'PATCH' && expiryMatch) {
    const userId = expiryMatch[1]
    let body = {}
    try { body = JSON.parse(event.body || '{}') } catch { body = {} }

    const { days, expires_at, note } = body

    let credits_expires_at
    if (expires_at) {
      const d = new Date(expires_at)
      credits_expires_at = Number.isNaN(d.getTime()) ? null : d.toISOString()
    } else if (typeof days === 'number' && days >= 0) {
      credits_expires_at = new Date(Date.now() + days * 86400000).toISOString()
    } else {
      return json(400, { detail: 'Envie days (número) ou expires_at (ISO)' })
    }

    const rows = await sbSelect('users', { select: '*', id: `eq.${userId}` })
    if (!rows?.length) return json(404, { detail: 'Usuário não encontrado' })

    const target = rows[0]
    const now    = new Date().toISOString()

    await sbUpdate('users', 'id', userId, { credits_expires_at })

    // Zera o popup/flag se a data estiver vencida (saldo volta a 100)
    if (credits_expires_at && credits_expires_at <= now) {
      await sbUpdate('users', 'id', userId, { credits: 100, credits_expires_at: null })
    }

    sbInsert('credit_history', {
      id:          crypto.randomUUID(),
      user_id:     userId,
      type:        'admin_expiry',
      credits:     0,
      description: `Expiração definida pelo ADM (${days != null ? `${days} dias` : credits_expires_at})${note ? ` (${note})` : ''} | admin: ${admin.email}`,
      created_at:  now,
    }).catch(() => {})

    return json(200, {
      ok: true,
      user_id: userId,
      credits_expires_at,
      current_credits: target.credits || 0,
    })
  }

// ─── GET /events ──────────────────────────────────────────────────────────────
// Central de atividades: log unificado (busca por usuário, filtros e paginação)
if (method === 'GET' && path === '/events') {
  const qs       = event.queryStringParameters || {}
  const page     = Math.max(1, parseInt(qs.page || '1', 10))
  const limit    = Math.min(500, Math.max(1, parseInt(qs.limit || '50', 10)))
  const offset   = (page - 1) * limit
  const search   = (qs.search || '').trim().replace(/[%(),]/g, ' ').replace(/\s+/g, ' ').trim()
  const evt      = (qs.event || '').trim()
  const tool     = (qs.tool || '').trim()
  const from     = qs.from ? new Date(qs.from + 'T00:00:00.000Z') : null
  const to       = qs.to   ? new Date(qs.to   + 'T23:59:59.999Z') : null

  const params = new URLSearchParams()
  params.set('select', '*')
  params.set('order', 'created_at.desc')
  params.set('offset', String(offset))
  params.set('limit', String(limit))
  if (evt)   params.set('event', `eq.${evt}`)
  if (tool)  params.set('tool', `eq.${tool}`)
  if (from && !Number.isNaN(from.getTime())) params.set('created_at', `gte.${from.toISOString()}`)
  if (to   && !Number.isNaN(to.getTime()))   params.append('created_at', `lte.${to.toISOString()}`)
  if (search) {
    params.set('or', `(user_name.ilike.*${search}*,user_email.ilike.*${search}*)`)
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/user_events?${params.toString()}`, {
    headers: { ...sbHeaders(), 'Prefer': 'count=exact' },
  })
  const rows   = res.ok ? await res.json() : []
  const total  = parseInt(res.headers.get('content-range')?.split('/')[1] ?? '0', 10)
  const pages  = Math.max(1, Math.ceil(total / limit))

  return json(200, { events: rows, total, page, limit, pages })
}

// ─── GET /events/stats ────────────────────────────────────────────────────────
// Métricas agregadas de usabilidade (hoje / últimos 7 e 30 dias)
if (method === 'GET' && path === '/events/stats') {
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const start7  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000).toISOString()
  const start30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  async function fetchSince(iso) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/user_events?select=event,user_id,tool&order=created_at.desc&created_at=gte.${encodeURIComponent(iso)}`,
      { headers: sbHeaders() },
    )
    return res.ok ? await res.json() : []
  }

  function summarize(rows) {
    const counts = {}
    const tools  = {}
    const users  = new Set()
    for (const r of (rows || [])) {
      counts[r.event] = (counts[r.event] || 0) + 1
      tools[r.tool]   = (tools[r.tool] || 0) + 1
      if (r.user_id) users.add(r.user_id)
    }
    return { total: rows?.length || 0, counts, tools, active_users: users.size }
  }

  const [today, last7, last30] = await Promise.all([fetchSince(startToday), fetchSince(start7), fetchSince(start30)])

  return json(200, {
    today:   summarize(today),
    last_7d: summarize(last7),
    last_30d: summarize(last30),
  })
}

// ── POST /payments/:id/link  — vincular pagamento órfão a um USER_ID ──────
  const linkMatch = path.match(/^\/payments\/([^/]+)\/link$/)
  if (method === 'POST' && linkMatch) {
    const paymentId = linkMatch[1]
    let body = {}
    try { body = JSON.parse(event.body || '{}') } catch { body = {} }
    const targetUserId = (body.user_id || '').toString().trim()
    if (!targetUserId) return json(400, { detail: 'Informe user_id' })

    const payments = await sbSelect('payments', { select: '*', id: `eq.${paymentId}` })
    if (!payments?.length) return json(404, { detail: 'Pagamento não encontrado' })
    const payment = payments[0]

    const users = await sbSelect('users', { select: '*', id: `eq.${targetUserId}` })
    if (!users?.length) return json(404, { detail: 'Usuário não encontrado' })
    const target = users[0]

    // Já vinculado a este usuário → ok idempotente
    if (payment.user_id === targetUserId && !(payment.status || '').includes('user_not_found')) {
      return json(200, { ok: true, already_linked: true, user_id: targetUserId })
    }

    const PLAN_CREDITS = { easy: 200, medium: 565, premium: 1500 }
    const productClean = String(payment.product || '').split('|||')[0].trim()
    const hay = productClean.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    let tier = null
    if (hay.includes('premium')) tier = 'premium'
    else if (/\bpro\b|\bmedium\b|\bmedio\b/.test(hay)) tier = 'medium'
    else if (hay.includes('easy')) tier = 'easy'

    const creditsToAdd = tier ? PLAN_CREDITS[tier] : 0
    const grantCredits = body.grant_credits !== false && creditsToAdd > 0
      && (payment.status || '').includes('user_not_found')

    let newCredits = target.credits || 0
    if (grantCredits) {
      newCredits = newCredits + creditsToAdd
      // Expiração = data da compra + 90 dias (3 meses)
      const paidAt = payment.created_at ? new Date(payment.created_at) : new Date()
      const expiresAt = new Date(
        (Number.isNaN(paidAt.getTime()) ? new Date() : paidAt).getTime() + 90 * 24 * 60 * 60 * 1000,
      )
      await sbUpdate('users', 'id', targetUserId, {
        credits: newCredits,
        plan: tier || target.plan || 'free',
        first_upgrade_purchased: true,
        credits_expires_at: expiresAt.toISOString(),
      })
      await sbInsert('credit_history', {
        id: crypto.randomUUID(),
        user_id: targetUserId,
        type: 'purchase',
        credits: creditsToAdd,
        description: `ADM vinculou pagamento ${payment.kiwify_transaction_id || paymentId}: ${productClean}`,
        created_at: new Date().toISOString(),
      }).catch(() => {})
    }

    await sbUpdate('payments', 'id', paymentId, {
      user_id: targetUserId,
      product: productClean || payment.product,
      status: 'paid',
    })

    return json(200, {
      ok: true,
      user_id: targetUserId,
      credits_added: grantCredits ? creditsToAdd : 0,
      new_credits: newCredits,
      plan: tier || target.plan,
    })
  }

  // ── GET /export/users ───────────────────────────────────────────────────────
  // Exporta TODOS os usuários com métricas para análise em planilha (.xlsx).
  // O frontend gera o arquivo; aqui retornamos JSON pronto para as colunas.
  if (method === 'GET' && path === '/export/users') {
    const [users, events, payments] = await Promise.all([
      sbSelect('users', {
        select: 'id,name,email,plan,credits,credits_expires_at,created_at,free_download_used,first_upgrade_purchased',
        limit: '1000000',
      }),
      sbSelect('user_events', {
        select: 'user_id',
        limit: '1000000',
      }),
      sbSelect('payments', {
        select: 'user_id,value,status',
        limit: '1000000',
      }),
    ])

    // Quantidade de acessos por usuário (total de eventos registrados)
    const accessCount = {}
    for (const ev of events || []) {
      if (!ev.user_id) continue
      accessCount[ev.user_id] = (accessCount[ev.user_id] || 0) + 1
    }

    // Valor pago (em R$) e quantidade de pagamentos por usuário
    const paidByUser = {}
    const paidCount  = {}
    for (const p of payments || []) {
      if (!p.user_id) continue
      const s = (p.status || '').toLowerCase()
      const isMoney =
        (s.includes('paid') || s.includes('approved') || s.includes('user_not_found')) &&
        !s.includes('unrecognized_product')
      if (!isMoney) continue
      const v = toReais(p.value)
      paidByUser[p.user_id] = (paidByUser[p.user_id] || 0) + (v && v > 0 ? v : 0)
      paidCount[p.user_id]  = (paidCount[p.user_id]  || 0) + 1
    }

    const rows = (users || []).map(u => ({
      id:           u.id,
      name:         u.name || '',
      email:        u.email || '',
      plan:         u.plan || 'free',
      credits:      u.credits || 0,
      credits_expires_at: u.credits_expires_at || '',
      created_at:   u.created_at || '',
      accesses:     accessCount[u.id] || 0,
      total_paid_reais: Math.round((paidByUser[u.id] || 0) * 100) / 100,
      paid_count:   paidCount[u.id] || 0,
      free_download_used: !!u.free_download_used,
      first_upgrade_purchased: !!u.first_upgrade_purchased,
    }))

    return json(200, {
      total: rows.length,
      generated_at: new Date().toISOString(),
      users: rows,
    })
  }

  return json(404, { detail: 'Rota não encontrada' })
}
