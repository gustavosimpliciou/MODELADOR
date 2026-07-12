import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = 'https://blqvsglspdayrznnbzzf.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_fg_66namw-ZLUeYkyg365w_zwsGvCIR'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
