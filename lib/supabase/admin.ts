import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let privateAdminClient: SupabaseClient | null = null

export function createAdminClient(): SupabaseClient {
  if (privateAdminClient) return privateAdminClient

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    "https://rhzanxzoqmbxptvxgnfj.supabase.co"
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoemFueHpvcW1ieHB0dnhnbmZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ4OTA2NywiZXhwIjoyMDgzMDY1MDY3fQ.V19in-nDbIjW2E-BcDmx07Jyg9e-oXinH-khC8Dlkaw"

  console.log("[supabase/admin] Inicializando cliente con URL:", url)

  if (!url || !serviceRoleKey) {
    throw new Error("Faltan las credenciales de Supabase Admin.")
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
