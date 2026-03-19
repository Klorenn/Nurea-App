import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let privateAdminClient: SupabaseClient | null = null

export function createAdminClient(): SupabaseClient {
  if (privateAdminClient) return privateAdminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_KEY?.trim()

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan las credenciales de Supabase Admin (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."
    )
  }

  privateAdminClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, options) =>
        fetch(input, { ...options, signal: AbortSignal.timeout(30000) }),
    },
  })

  return privateAdminClient
}
