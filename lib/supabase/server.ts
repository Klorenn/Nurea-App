import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

function assertSupabaseConfig(): void {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'https://placeholder.supabase.co' || SUPABASE_ANON_KEY === 'placeholder-key') {
    console.error(
      '[NUREA] Faltan variables de Supabase en el servidor. Configura .env.local con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }
}

export async function createClient() {
  const cookieStore = await cookies()
  const url = SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = SUPABASE_ANON_KEY || 'placeholder-key'
  assertSupabaseConfig()

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

