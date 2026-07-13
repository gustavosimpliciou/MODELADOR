// Netlify Function — Kiwify payment webhook (ESM, zero dependencies)
// Uses Supabase REST API directly via fetch — no @supabase/supabase-js needed

const SUPABASE_URL         = process.env.SUPABASE_URL         || 'https://blqvsglspdayrznnbzzf.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_Io0zkS3DyT3EDLwWPw673g_0C6o-JDu'
const KIWIFY_TOKEN         = process.env.KIWIFY_WEBHOOK_TOKEN  || 'abw1j1a77ay'

const PLAN_CREDITS = {
  easy:    200,
  medium:  565,
  premium: 1500,
}

// ─── Supabase REST helpers ───────────────────────────────────────────────────

function sbHeaders() {
  return {
    'Content-Type':  'application/json',
    'apikey':        SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  }
}

async function sbSelect(table, params) {
  const qs  = new URLSearchParams(params).toString()
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
    headers: { ...sbHeaders(), 'Prefer': 'return=representation' },
  })
  if (!res.ok) return []
  return res.json()
}

async function sbInsert(table, row) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method:  'POST',
    headers: { ...sbHeaders(), 'Prefer': 'return=minimal' },
    body:    JSON.stringify(row),
  })
}

async function sbUpdate(table, filterKey, filterValue, data) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filterKey}=eq.${encodeURIComponent(filterValue)}`, {
    method:  'PATCH',
    headers: { ...sbHeaders(), 'Prefer': 'return=minimal' },
    body:    JSON.stringify(data),
  })
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalize(text) {
  return (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function detectPlan(productName, productId) {
  const hay = normalize(`${productName} ${productId}`)
  if (hay.includes('premium'))                         return 'premium'
  if (/\bmedium\b|\bmedio\b|\bpro\b/.test(hay))       return 'medium'
  if (hay.includes('easy'))                            return 'easy'
  return null
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  if (!SUPABASE_SERVICE_KEY) return json(503, { error: 'SUPABASE_SERVICE_KEY não configurado' })
  if (!KIWIFY_TOKEN)         return json(503, { error: 'KIWIFY_WEBHOOK_TOKEN não configurado' })

  let body = {}
  try { body = JSON.parse(event.body || '{}') } catch { body = {} }

  const query   = event.queryStringParameters || {}
  const headers = event.headers || {}

  // ─── Validar token ──────────────────────────────────────────────
  const incomingToken =
    query.token               ||
    headers['x-webhook-token'] ||
    body.token                ||
    ''

  if (incomingToken !== KIWIFY_TOKEN) {
    return json(401, { error: 'Token inválido' })
  }

  // ─── Filtrar apenas vendas aprovadas ────────────────────────────
  const orderStatus = (body.order_status || '').toLowerCase()
  const eventType   = (body.webhook_event_type || '').toLowerCase()
  const orderId     = body.order_id || body.order_ref || ''

  if (orderStatus !== 'paid' && eventType !== 'order_approved') {
    return json(200, { ok: true, ignored: true, order_status: orderStatus })
  }

  // ─── Dados do cliente ────────────────────────────────────────────
  const customer = body.Customer || {}
  const email    = (customer.email || '').trim().toLowerCase()
  if (!email) return json(200, { ok: true, ignored: true, reason: 'sem e-mail' })

  // ─── Identificar plano ───────────────────────────────────────────
  const product     = body.Product || {}
  const productName = product.product_name || ''
  const productId   = product.product_id   || ''
  const tier        = detectPlan(productName, productId)

  const now         = new Date().toISOString()
  const commissions = body.Commissions || {}
  const value       = commissions.charge_amount || commissions.product_base_price || ''

  if (!tier) {
    await sbInsert('payments', {
      id: crypto.randomUUID(), user_id: null,
      kiwify_transaction_id: orderId,
      product: productName || productId,
      value, status: `${orderStatus || eventType}_unrecognized_product`,
      created_at: now,
    })
    return json(200, { ok: true, ignored: true, reason: 'produto não reconhecido' })
  }

  // ─── Idempotência ────────────────────────────────────────────────
  const existing = await sbSelect('payments', {
    select: 'id',
    kiwify_transaction_id: `eq.${orderId}`,
  })
  if (existing?.length) return json(200, { ok: true, duplicate: true })

  // ─── Buscar usuário ──────────────────────────────────────────────
  const users = await sbSelect('users', { select: '*', email: `eq.${email}` })
  if (!users?.length) {
    await sbInsert('payments', {
      id: crypto.randomUUID(), user_id: null,
      kiwify_transaction_id: orderId,
      product: productName || productId,
      value, status: `${orderStatus || eventType}_user_not_found`,
      created_at: now,
    })
    return json(200, { ok: true, ignored: true, reason: 'usuário não encontrado' })
  }

  const user         = users[0]
  const creditsToAdd = PLAN_CREDITS[tier]
  const newCredits   = (user.credits || 0) + creditsToAdd

  // ─── Atualizar créditos ──────────────────────────────────────────
  await sbUpdate('users', 'id', user.id, {
    credits:                 newCredits,
    plan:                    tier,
    first_upgrade_purchased: true,
  })

  // ─── Registrar pagamento ─────────────────────────────────────────
  await sbInsert('payments', {
    id: crypto.randomUUID(), user_id: user.id,
    kiwify_transaction_id: orderId,
    product: productName || productId,
    value, status: orderStatus || eventType,
    created_at: now,
  })

  await sbInsert('credit_history', {
    id: crypto.randomUUID(), user_id: user.id,
    type: 'purchase', credits: creditsToAdd,
    description: `Compra aprovada: ${productName || productId} (pedido ${orderId})`,
    created_at: now,
  })

  return json(200, { ok: true, credits_added: creditsToAdd, plan: tier })
}
