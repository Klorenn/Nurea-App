"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

function getSupabase() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
    supabaseInstance = createBrowserClient(url, key)
  }
  return supabaseInstance
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    try {
      const supabase = getSupabase()
      
      supabase.auth.getSession().then(({ data }) => {
        if (cancelled) return
        setUser(data?.session?.user ?? null)
        setLoading(false)
      }).catch(() => {
        if (!cancelled) setLoading(false)
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
    } catch (error) {
      console.error("[useAuth] Error:", error)
      if (!cancelled) setLoading(false)
    }
  }, [])

  const signOut = async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
  }

  return { user, loading, signOut }
}
