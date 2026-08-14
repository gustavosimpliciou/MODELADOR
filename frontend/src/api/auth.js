import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'nativos3d.adm@gmail.com'

function toUser(row) {
  const isAdmin = (row.email ?? '') === ADMIN_EMAIL
  return {
    id:                    row.id,
    name:                  row.name,
    email:                 row.email,
    is_admin:              isAdmin,
    credits:               isAdmin ? 99999 : (row.credits ?? 0),
    freeDownloadUsed:      isAdmin ? false  : (row.free_download_used ?? false),
    firstUpgradePurchased: row.first_upgrade_purchased ?? false,
    plan:                  row.plan ?? 'free',
  }
}

const PLAN_CREDITS = { easy: 200, medium: 565, premium: 1500 }

function detectPlanFromProduct(productName = '') {
  const h = (productName || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  if (h.includes('premium')) return 'premium'
  if (/\bpro\b|\bmedium\b|\bmedio\b/.test(h)) return 'medium'
  if (h.includes('easy')) return 'easy'
  return null
}

/** Extrai e-mail guardado em product no formato "Nome|||buyer:email@x.com" */
function buyerEmailFromProduct(product = '') {
  const m = String(product || '').match(/\|\|\|buyer:([^\s|]+)/i)
  return m ? m[1].trim().toLowerCase() : null
}

function cleanProductName(product = '') {
  return String(product || '').split('|||')[0].trim()
}

/**
 * Recupera pagamentos paid_user_not_found cujo e-mail do comprador
 * coincide com o e-mail da conta e libera os créditos.
 * Idempotente: só processa status paid_user_not_found.
 */
async function claimPendingPayments(userId, email) {
  if (!userId || !email) return { claimed: 0 }
  const emailNorm = email.trim().toLowerCase()

  try {
    const { data: pending, error } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'paid_user_not_found')
      .is('user_id', null)

    if (error || !pending?.length) return { claimed: 0 }

    const mine = pending.filter(p => buyerEmailFromProduct(p.product) === emailNorm)
    if (!mine.length) return { claimed: 0 }

    const { data: userRow } = await supabase
      .from('users')
      .select('credits,plan')
      .eq('id', userId)
      .maybeSingle()

    let credits = userRow?.credits || 0
    let plan = userRow?.plan || 'free'
    let claimed = 0

    for (const p of mine) {
      const productClean = cleanProductName(p.product)
      const tier = detectPlanFromProduct(productClean)
      if (!tier) continue
      const add = PLAN_CREDITS[tier]
      credits += add
      plan = tier
      claimed += 1

      await supabase.from('payments').update({
        user_id: userId,
        product: productClean,
        status: 'paid',
      }).eq('id', p.id)

      await supabase.from('credit_history').insert({
        id: crypto.randomUUID(),
        user_id: userId,
        type: 'purchase',
        credits: add,
        description: `Créditos recuperados: ${productClean} (pedido ${p.kiwify_transaction_id || p.id})`,
        created_at: new Date().toISOString(),
      })
    }

    if (claimed > 0) {
      await supabase.from('users').update({
        credits,
        plan,
        first_upgrade_purchased: true,
      }).eq('id', userId)
    }

    return { claimed, credits, plan }
  } catch {
    return { claimed: 0 }
  }
}

async function getOrCreateProfile(userId, email = '', name = '') {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)

  if (data) {
    // Tenta recuperar compras feitas com este e-mail antes do cadastro
    await claimPendingPayments(userId, data.email || email)
    const { data: refreshed } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    return toUser(refreshed || data)
  }

  // Profile row missing — create it
  const displayName = name || (email ? email.split('@')[0] : 'Usuário')
  const newRow = {
    id:                      userId,
    name:                    displayName,
    email:                   email.toLowerCase(),
    password_hash:           '',
    credits:                 0,
    free_download_used:      false,
    first_upgrade_purchased: false,
    plan:                    'free',
  }
  const { data: inserted, error: insertError } = await supabase
    .from('users')
    .insert(newRow)
    .select()
    .single()

  if (insertError) throw new Error(insertError.message)

  await claimPendingPayments(userId, email.toLowerCase())
  const { data: afterClaim } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return toUser(afterClaim || inserted)
}

export const authApi = {
  register: async (name, email, password) => {
    const emailClean = email.trim().toLowerCase()

    const { data, error } = await supabase.auth.signUp({
      email: emailClean,
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) throw new Error(error.message)
    if (!data.user) throw new Error('Erro ao criar conta')

    const userId = data.user.id

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (!existing) {
      await supabase.from('users').insert({
        id:                      userId,
        name:                    name.trim(),
        email:                   emailClean,
        password_hash:           '',
        credits:                 0,
        free_download_used:      false,
        first_upgrade_purchased: false,
        plan:                    'free',
      })
    }

    // Com confirmação de e-mail ativa, o Supabase não cria sessão até o e-mail ser verificado.
    if (!data.session?.access_token) {
      return { token: '', user: null, needsEmailVerification: true }
    }

    const profile = await getOrCreateProfile(userId, emailClean, name.trim())
    return { token: data.session.access_token, user: profile }
  },

  login: async (identifier, password) => {
    let email = identifier.trim()

    if (!email.includes('@')) {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .ilike('name', email)
        .limit(1)
      if (error || !data?.length) throw new Error('Usuário ou senha incorretos')
      email = data[0].email
    } else {
      email = email.toLowerCase()
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const m = (error.message || '').toLowerCase()
      if (m.includes('email') && (m.includes('confirm') || m.includes('verif'))) {
        throw new Error('Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada (e o spam) e clique no link de confirmação.')
      }
      throw new Error('Usuário ou senha incorretos')
    }

    const profile = await getOrCreateProfile(data.user.id, data.user.email, data.user.user_metadata?.name)
    return { token: data.session.access_token, user: profile }
  },

  me: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Sessão expirada. Faça login novamente.')
    return getOrCreateProfile(user.id, user.email, user.user_metadata?.name)
  },

  forgotPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: window.location.origin }
    )
    if (error) throw new Error(error.message)
    return { ok: true, message: 'Enviamos as instruções para o seu e-mail. Verifique também a caixa de spam.' }
  },

  resetPassword: async (_token, password) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw new Error(error.message)
    return { ok: true }
  },

  updateCredits: async (_token, credits, freeDownloadUsed, firstUpgradePurchased) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('users').update({
      credits,
      free_download_used:      freeDownloadUsed,
      first_upgrade_purchased: firstUpgradePurchased,
    }).eq('id', user.id)
  },
}
