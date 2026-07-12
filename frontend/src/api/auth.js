import { supabase } from '../lib/supabase'

function toUser(row) {
  return {
    id:                    row.id,
    name:                  row.name,
    email:                 row.email,
    credits:               row.credits ?? 0,
    freeDownloadUsed:      row.free_download_used ?? false,
    firstUpgradePurchased: row.first_upgrade_purchased ?? false,
    plan:                  row.plan ?? 'free',
  }
}

async function getOrCreateProfile(userId, email = '', name = '') {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)

  if (data) return toUser(data)

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
  return toUser(inserted)
}

export const authApi = {
  register: async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name: name.trim() } },
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
        email:                   email.trim().toLowerCase(),
        password_hash:           '',
        credits:                 0,
        free_download_used:      false,
        first_upgrade_purchased: false,
        plan:                    'free',
      })
    }

    const profile = await getOrCreateProfile(userId, email.trim().toLowerCase(), name.trim())
    return { token: data.session?.access_token ?? '', user: profile }
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
    if (error) throw new Error('Usuário ou senha incorretos')

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
