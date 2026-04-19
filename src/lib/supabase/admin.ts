import { createClient } from '@supabase/supabase-js'

let supabaseAdminClient: ReturnType<typeof createClient> | null = null

export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase admin env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and SERVICE_ROLE_KEY.')
  }

  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return supabaseAdminClient
}
