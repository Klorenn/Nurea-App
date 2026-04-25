"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

// Lazy-load supabase client
let supabaseClient: ReturnType<typeof import> | null = null

async function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = await import("@supabase/ssr")
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
  return supabaseClient.createBrowserClient(url, key)
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    getSupabase().then(supabase => {
      if (cancelled) return

      supabase.auth.getSession().then(({ data }) => {
        if (cancelled) return
        setUser(data?.session?.user ?? null)
        setLoading(false)
      })

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (cancelled) return
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => {
        cancelled = true
        data.subscription.unsubscribe()
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const signOut = async () => {
    const supabase = await getSupabase()
    await supabase.auth.signOut()
  }

  return { user, loading, signOut }
}