"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

type DecoratedUser = User & {
  firstName?: string | null
  lastName?: string | null
}

function decorate(user: User | null): DecoratedUser | null {
  if (!user) return null
  const meta: Record<string, unknown> = user.user_metadata || {}
  const full = ((meta.full_name as string) || meta.name || "").split(" ")
  return Object.assign(user, {
    firstName: (meta.first_name as string) ?? full[0] ?? null,
    lastName: (meta.last_name as string) ?? full.slice(1).join(" ") ?? null,
  })
}

type SsModule = ReturnType<typeof import("@supabase/ssr">
let supabaseClient: SsModule | null = null

async function getSupabase(): Promise<ReturnType<SsModule["createBrowserClient"]>> {
  if (!supabaseClient) {
    supabaseClient = await import("@supabase/ssr")
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
  return supabaseClient.createBrowserClient(url, key)
}

export function useUser() {
  const [user, setUser] = useState<DecoratedUser | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let mounted = false

    getSupabase().then(supabase => {
      if (!mounted) return

      const safety = setTimeout(() => {
        if (mounted) setIsLoaded(true)
      }, 4000)

      supabase.auth.getSession().then(({ data }) => {
        if (!mounted) return
        setUser(decorate(data?.session?.user ?? null))
        setIsLoaded(true)
      })

      const { data } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!mounted) return
          setUser(decorate(session ?? null))
          setIsLoaded(true)
        }
      )

      return () => {
        mounted = false
        clearTimeout(safety)
        data.subscription.unsubscribe()
      }
    }).catch(() => {
      if (!mounted) setIsLoaded(true)
    })

    return () => {
      mounted = false
    }
  }, [])

  return { user, isLoaded, isSignedIn: !!user }
}