"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
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

export function useUser() {
  const [user, setUser] = useState<DecoratedUser | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let mounted = false
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
    )

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
  }, [])

  return { user, isLoaded, isSignedIn: !!user }
}