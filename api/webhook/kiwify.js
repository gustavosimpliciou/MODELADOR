import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL         = process.env.SUPABASE_URL         || 'https://blqvsglspdayrznnbzzf.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_KEY         || ''
const KIWIFY_TOKEN         = process.env.KIWIFY_WEBHOOK_TOKEN || ''

const EXPORT_COST = 40

const PLAN_CREDITS = {
  easy:    200,
  medium:  565,
  premium: 1500,
}

function normalize(text) {
  return (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function detectPlan(productName, productId) {
  const hay = normalize(`${productName} ${productId}`)
  if (hay.includes('premium'))                              return 'premium'
  if (/\bmedium\b|\bmedio\b|\bpro\b/.test(hay))            return 'medium'
  if (hay.includes('easy'))                                 return 'easy'
  return null
}

const PAID_STATUSES = new Set([
  'paid', 'approved', 'completed', 'confirmed', 'success',
  'order_approved', 'payment_approved', 'payment_confirmed'
])

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!SUPABASE_SERVICE_KEY) {
    return res.status(503).json({ error: 'SUPABASE_SERVICE_KEY não configurado' })
  }
  if (!KIWIFY_TOKEN) {
    return res.status(503).json({ error: 'KIWIFY_WEBHOOK_TOKEN não configurado' })
  }

  const body = req.body || {}

  // ─── Validar token ────────────────────────────────────────────────
  const incomingToken =
    req.query.token ||
    req.headers['x-webhook-token'] ||
    body.token ||
    ''

  if (incomingToken !== KIWIFY_TOKEN) {
    return res.status(401).json({ error: 'Token inválido' })
  }

  // ─── Filtrar apenas vendas aprovadas ──────────────────────────────
  const orderStatus = (body.order_status || '').toLowerCase()
  const eventType   = (body.webhook_event_type || '').toLowerCase()
  const orderId     = body.order_id || body.order_ref || ''

  const isPaid = PAID_STATUSES.has(orderStatus) || PAID_STATUSES.has(eventType)
  if (!isPaid) {
    return res.status(200).json({ ok: true, ignored: true, order_status: orderStatus, event_type: eventType })
  }

  // ─── Dados do cliente + tracking (user_id do app) ─────────────────
  const customer = body.Customer || {}
  const email    = (customer.email || '').trim().toLowerCase()
  const tracking = body.TrackingParameters || body.tracking_parameters || {}
  const trackedUserId = (
    tracking.src || tracking.sck || tracking.utm_content || tracking.utm_term ||
    tracking.user_id || tracking.external_id || tracking.customer_id || tracking.subscriber_id || ''
  ).toString().trim() || null

  // ─── Identificar plano ────────────────────────────────────────────
  const product     = body.Product || {}
  const productName = product.product_name || ''
  const productId   = product.product_id   || ''
  const tier        = detectPlan(productName, productId)

  const sb  = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const now = new Date().toISOString()
  const commissions = body.Commissions || {}
  const value = commissions.charge_amount || commissions.product_base_price || ''

  // Use Kiwify's order_date if available for accurate expiry calculation
  const paidRaw = body.order_date || body.OrderDate || body.payment_date || now
  let paidAt
  try {
    paidAt = new Date(paidRaw)
    if (isNaN(paidAt.getTime())) paidAt = new Date(now)
  } catch {
    paidAt = new Date(now)
  }
  const credits_expires_at = new Date(paidAt.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString()

  if (!tier) {
    await sb.from('payments').insert({
      id: crypto.randomUUID(), user_id: null,
      kiwify_transaction_id: orderId,
      product: productName || productId,
      value, status: `${orderStatus || eventType}_unrecognized_product`,
      created_at: now,
    }).catch(() => {})
    return res.status(200).json({ ok: true, ignored: true, reason: 'produto não reconhecido' })
  }

  // ─── Idempotência ─────────────────────────────────────────────────
  const { data: existing } = await sb
    .from('payments').select('id').eq('kiwify_transaction_id', orderId)
  if (existing?.length) {
    return res.status(200).json({ ok: true, duplicate: true })
  }

  // ─── Resolver usuário: USER_ID (tracking) → e-mail ─────────────────
  let user = null
  let resolvedBy = null

  if (trackedUserId) {
    const { data: byId } = await sb.from('users').select('*').eq('id', trackedUserId)
    if (byId?.length) { user = byId[0]; resolvedBy = 'tracking_user_id' }
  }
  if (!user && email) {
    const { data: byEmail } = await sb.from('users').select('*').eq('email', email)
    if (byEmail?.length) { user = byEmail[0]; resolvedBy = 'email' }
  }

  if (!user) {
    const productStored = email
      ? `${productName || productId}|||buyer:${email}`
      : (productName || productId)
    await sb.from('payments').insert({
      id: crypto.randomUUID(), user_id: null,
      kiwify_transaction_id: orderId,
      product: productStored,
      value,
      status: 'paid_user_not_found',
      created_at: now,
    }).catch(() => {})
    return res.status(200).json({
      ok: true, ignored: true, reason: 'usuário não encontrado',
      email: email || null, tracked_user_id: trackedUserId,
    })
  }

  const creditsToAdd  = PLAN_CREDITS[tier]
  const newCredits    = (user.credits || 0) + creditsToAdd

  const originalCredits = user.credits || 0
  const originalPlan = user.plan || 'free'
  const originalExpiry = user.credits_expires_at || null

  try {
    await sb.from('users').update({
      credits:                 newCredits,
      plan:                    tier,
      first_upgrade_purchased: true,
      credits_expires_at,
    }).eq('id', user.id)

    await sb.from('payments').insert({
      id: crypto.randomUUID(), user_id: user.id,
      kiwify_transaction_id: orderId,
      product: productName || productId,
      value, status: orderStatus || eventType || 'paid',
      created_at: now,
    })

    await sb.from('credit_history').insert({
      id: crypto.randomUUID(), user_id: user.id,
      type: 'purchase', credits: creditsToAdd,
      description: `Compra aprovada: ${productName || productId} (pedido ${orderId})`,
      created_at: now,
    })

  } catch (e) {
    console.error(`Kiwify webhook: erro ao creditar usuário ${user.id} (order ${orderId}):`, e)
    // Rollback: tenta reverter créditos se user foi atualizado
    try {
      await sb.from('users').update({
        credits: originalCredits,
        plan: originalPlan,
        credits_expires_at: originalExpiry,
      }).eq('id', user.id)
    } catch (_) {}
    return res.status(500).json({ error: 'Erro interno ao processar pagamento' })
  }

  return res.status(200).json({
    ok: true, credits_added: creditsToAdd, plan: tier,
    resolved_by: resolvedBy, user_id: user.id,
  })
}
