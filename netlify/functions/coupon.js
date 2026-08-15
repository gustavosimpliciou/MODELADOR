// Netlify Function — Resgate de cupom (ESM, zero dependencies)
// POST /api/coupon
//
// Valida o código GHOOST3D no servidor (não é burlável pelo browser):
//  - confere o token de sessão do usuário via Supabase Auth
//  - exige conta NOVA (sem upgrade: first_upgrade_purchased = false)
//  - limita a 1 uso por conta (credit_history.type = 'coupon')
//  - concede 700 créditos com expiração de 20 dias (credits_expires_at)
//  - registra em credit_history e user_events

const SUPABASE_URL         = process.env.SUPABASE_URL         || 'https://blqvsglspdayrznnbzzf.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_KEY         || ''

const COUPON_CODE    = 'GHOOST3D'
const COUPON_CREDITS = 700
const COUPON_DAYS    = 20
const DAY_MS         = 86400000

// ─── Supabase REST helpers ───────────────────────────────────────────────────

function sbHeaders(prefer) {
  return {
    'Content-Type':  'application/json',
    'apikey':        SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    ...(prefer ? { Prefer: prefer } : {}),
  }
}

async function sbSelect(table, params) {
  const qs  = new URLSearchParams(params).toString()
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, { headers: sbHeaders() })
  if (!res.ok) return []
  return res.json()
}

async function sbUpdate(table, filterKey, filterValue, data) {
  await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${filterKey}=eq.${encodeURIComponent(filterValue)}`,
    { method: 'PATCH', headers: sbHeaders('return=minimal'), body: JSON.stringify(data) },
  )
}

async function sbInsert(table, row) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method:  'POST',
    headers: sbHeaders('return=minimal'),
    body:    JSON.stringify(row),
  })
}

// Valida o access token do app e devolve o usuário autenticado (sem checar admin).
async function verifyUser(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)

  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey':        SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${token}`,
    },
  })
  if (!res.ok) return null
  return res.json()
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization,Content-Type',
    },
    body: JSON.stringify(body),
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: json(200, {}).headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  if (!SUPABASE_SERVICE_KEY) {
    return json(503, { error: 'SUPABASE_KEY não configurado' })
  }

  let body = {}
  try { body = JSON.parse(event.body || '{}') } catch { body = {} }

  const headers    = event.headers || {}
  const authHeader = headers.authorization || headers.Authorization || ''
  const user       = await verifyUser(authHeader)
  if (!user) return json(401, { error: 'not_authenticated' })

  const code = String(body.code || '').trim().toUpperCase()
  if (code !== COUPON_CODE) return json(400, { error: 'invalid_code' })

  const rows = await sbSelect('users', { select: '*', id: `eq.${user.id}` })
  const row  = rows?.[0]
  if (!row) return json(404, { error: 'user_not_found' })

  // Cupom é só para contas novas que ainda não fizeram upgrade
  if (row.first_upgrade_purchased) {
    return json(400, { error: 'upgrade_already_purchased' })
  }

  // 1 uso por conta — registrado em credit_history.type = 'coupon'
  const used = await sbSelect('credit_history', {
    select: 'id',
    user_id: `eq.${user.id}`,
    type:    'eq.coupon',
  })
  if (used?.length) return json(400, { error: 'already_used' })

  const now         = new Date()
  const expiresAt   = new Date(now.getTime() + COUPON_DAYS * DAY_MS)
  const newCredits  = (row.credits || 0) + COUPON_CREDITS

  await sbUpdate('users', 'id', user.id, {
    credits:            newCredits,
    credits_expires_at: expiresAt.toISOString(),
  })

  await sbInsert('credit_history', {
    id:          crypto.randomUUID(),
    user_id:     user.id,
    type:        'coupon',
    credits:     COUPON_CREDITS,
    description: `Cupom ${COUPON_CODE} — ${COUPON_CREDITS} créditos, expiram em ${COUPON_DAYS} dias`,
    created_at:  now.toISOString(),
  })

  await sbInsert('user_events', {
    user_id:    user.id,
    user_name:  row.name || null,
    user_email: row.email || null,
    tool:       'auth',
    event:      'coupon_redeemed',
    details:    { code, credits: COUPON_CREDITS, expires_in_days: COUPON_DAYS },
    created_at: now.toISOString(),
  }).catch(() => {})

  return json(200, {
    ok: true,
    credits:   newCredits,
    expiresAt: expiresAt.toISOString(),
  })
}