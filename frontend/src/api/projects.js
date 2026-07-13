import { supabase } from '../lib/supabase'

async function currentUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  return user.id
}

export const projectsApi = {
  list: async (_token) => {
    const userId = await currentUserId()
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, updated_at, data')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data
  },

  save: async (_token, id, name, data) => {
    const userId = await currentUserId()
    const now = new Date().toISOString()
    if (id) {
      const { error } = await supabase
        .from('projects')
        .update({ name, data, updated_at: now })
        .eq('id', id)
        .eq('user_id', userId)
      if (error) throw new Error(error.message)
      return { id, name }
    } else {
      const newId = crypto.randomUUID()
      const { error } = await supabase.from('projects').insert({
        id:         newId,
        user_id:    userId,
        name,
        data,
        created_at: now,
        updated_at: now,
      })
      if (error) throw new Error(error.message)
      return { id: newId, name }
    }
  },

  load: async (_token, id) => {
    const userId = await currentUserId()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    if (error) throw new Error('Projeto não encontrado')
    return data
  },

  delete: async (_token, id) => {
    const userId = await currentUserId()
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw new Error(error.message)
    return { ok: true }
  },
}
