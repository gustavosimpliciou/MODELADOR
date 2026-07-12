import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL         = process.env.SUPABASE_URL         || 'https://blqvsglspdayrznnbzzf.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_Io0zkS3DyT3EDLwWPw673g_0C6o-JDu'
const KIWIFY_TOKEN         = process.env.KIWIFY_WEBHOOK_TOKEN  || 'abw1j1a77ay'

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

  if (orderStatus !== 'paid' && eventType !== 'order_approved') {
    return res.status(200).json({ ok: true, ignored: true, order_status: orderStatus })
  }

  // ─── Dados do cliente ─────────────────────────────────────────────
  const customer = body.Customer || {}
  const email    = (customer.email || '').trim().toLowerCase()
  if (!email) {
    return res.status(200).json({ ok: true, ignored: true, reason: 'sem e-mail' })
  }

  // ─── Identificar plano ────────────────────────────────────────────
  const product     = body.Product || {}
  const productName = product.product_name || ''
  const productId   = product.product_id   || ''
  const tier        = detectPlan(productName, productId)

  const sb  = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const now = new Date().toISOString()
  const commissions = body.Commissions || {}
  const value = commissions.charge_amount || commissions.product_base_price || ''

  if (!tier) {
    // Produto não reconhecido — registra e ignora
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

  // ─── Buscar usuário ───────────────────────────────────────────────
  const { data: users } = await sb.from('users').select('*').eq('email', email)
  if (!users?.length) {
    await sb.from('payments').insert({
      id: crypto.randomUUID(), user_id: null,
      kiwify_transaction_id: orderId,
      product: productName || productId,
      value, status: `${orderStatus || eventType}_user_not_found`,
      created_at: now,
    }).catch(() => {})
    return res.status(200).json({ ok: true, ignored: true, reason: 'usuário não encontrado' })
  }

  const user          = users[0]
  const creditsToAdd  = PLAN_CREDITS[tier]
  const newCredits    = (user.credits || 0) + creditsToAdd

  // ─── Atualizar créditos ───────────────────────────────────────────
  await sb.from('users').update({
    credits:                 newCredits,
    plan:                    tier,
    first_upgrade_purchased: true,
  }).eq('id', user.id)

  // ─── Registrar pagamento ──────────────────────────────────────────
  await sb.from('payments').insert({
    id: crypto.randomUUID(), user_id: user.id,
    kiwify_transaction_id: orderId,
    product: productName || productId,
    value, status: orderStatus || eventType,
    created_at: now,
  }).catch(() => {})

  await sb.from('credit_history').insert({
    id: crypto.randomUUID(), user_id: user.id,
    type: 'purchase', credits: creditsToAdd,
    description: `Compra aprovada: ${productName || productId} (pedido ${orderId})`,
    created_at: now,
  }).catch(() => {})

  return res.status(200).json({ ok: true, credits_added: creditsToAdd, plan: tier })
}
