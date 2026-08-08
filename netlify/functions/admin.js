// Netlify Function — Admin API (ESM, pure fetch, no npm deps)
// Handles:  GET  /api/admin/stats
//           GET  /api/admin/users
//           PATCH /api/admin/users/:id/credits

const SUPABASE_URL         = process.env.SUPABASE_URL         || 'https://blqvsglspdayrznnbzzf.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_KEY         || ''
const ADMIN_EMAIL          = 'nativos3d.adm@gmail.com'

// ─── Supabase REST helpers ───────────────────────────────────────────────────

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
        'Access-Control-Allow-Methods': 'GET,PATCH,OPTIONS',
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
    const [users, payments] = await Promise.all([
      sbSelect('users', { select: 'id,name,email,credits,plan' }),
      sbSelect('payments', {
        select:  'id,user_id,product,value,status,created_at,kiwify_transaction_id',
        order:   'created_at.desc',
        limit:   20,
      }),
    ])

    const total_users        = users.length
    const total_admins       = users.filter(u => u.email === ADMIN_EMAIL).length
    const total_credits      = users.reduce((s, u) => s + (u.credits || 0), 0)
    const users_with_credits = users.filter(u => (u.credits || 0) > 0).length

    // Map user_id → user for enrichment. Values from Kiwify are stored in CENTS.
    // Convert once here (cents → reais) so the dashboard never double-converts.
    const userMap = Object.fromEntries((users || []).map(u => [u.id, u]))
    const recent_payments = (payments || []).map(p => {
      const raw = p.value
      const cents = Number(raw)
      const valueReais = Number.isFinite(cents) ? cents / 100 : null
      const u = p.user_id ? userMap[p.user_id] : null
      return {
        id: p.id,
        user_id: p.user_id || null,
        product: p.product,
        // value is now in REAIS (conversion happens only once, in this endpoint)
        value: valueReais,
        value_cents: Number.isFinite(cents) ? Math.round(cents) : null,
        status: p.status,
        created_at: p.created_at,
        kiwify_transaction_id: p.kiwify_transaction_id || null,
        user_name: u?.name || null,
        user_email: u?.email || null,
        user_credits: u != null ? (u.credits || 0) : null,
        user_plan: u?.plan || null,
      }
    })

    return json(200, {
      total_users,
      total_admins,
      total_credits,
      users_with_credits,
      users_without_credits: total_users - users_with_credits,
      recent_payments,
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
    const sortBy  = ['name','created_at','credits','email'].includes(qs.sort_by) ? qs.sort_by : 'created_at'
    const sortDir = qs.sort_dir === 'asc' ? 'asc' : 'desc'
    const offset  = (page - 1) * limit
    const cols    = 'id,name,email,plan,credits,created_at'

    const params = {
      select: cols,
      order:  `${sortBy}.${sortDir}`,
      offset: offset,
      limit:  limit,
    }
    if (search) params.or = `name.ilike.*${search}*,email.ilike.*${search}*`

    const { data, count } = await sbSelectCount('users', params)

    const users = data.map(u => ({ ...u, is_admin: u.email === ADMIN_EMAIL }))
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

  return json(404, { detail: 'Rota não encontrada' })
}
