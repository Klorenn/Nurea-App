import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

function assertSupabaseConfig(): void {
  if (typeof window === 'undefined') return
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'https://placeholder.supabase.co' || SUPABASE_ANON_KEY === 'placeholder-key') {
    console.error(
      '[NUREA] Faltan variables de Supabase.\n' +
      '1. Crea o edita .env.local en la raíz del proyecto (junto a package.json).\n' +
      '2. Añade (puedes usar una u otra clave pública):\n' +
      '   NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co\n' +
      '   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...\n' +
      '   o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_...\n' +
      '3. Reinicia el servidor: Ctrl+C y luego "npm run dev". Next.js solo lee .env.local al arrancar.'
    )
  }
}

export function createClient() {
  const url = SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = SUPABASE_ANON_KEY || 'placeholder-key'
  assertSupabaseConfig()
  return createBrowserClient(url, key)
}

