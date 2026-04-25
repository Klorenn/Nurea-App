"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"

/**
 * Compatibility shim that mimics Clerk's `useUser` / `useAuth` hooks but
 * delegates to Supabase auth.
 */

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

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

function getSupabase() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
    supabaseInstance = createBrowserClient(url, key)
  }
  return supabaseInstance
}

export function useUser() {
  const [user, setUser] = useState<DecoratedUser | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let mounted = false

    try {
      const supabase = getSupabase()
      const safety = setTimeout(() => {
        if (mounted) setIsLoaded(true)
      }, 4000)

      supabase.auth.getSession().then(({ data }) => {
        if (!mounted) return
        setUser(decorate(data?.session?.user ?? null))
        setIsLoaded(true)
        clearTimeout(safety)
      }).catch(() => {
        if (mounted) {
          setIsLoaded(true)
          clearTimeout(safety)
        }
      })

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return
        setUser(decorate(session?.user ?? null))
        setIsLoaded(true)
        clearTimeout(safety)
      })

      return () => {
        mounted = false
        clearTimeout(safety)
        data.subscription.unsubscribe()
      }
    } catch (error) {
      console.error("[useUser] Error:", error)
      if (mounted) setIsLoaded(true)
    }
  }, [])

  return { user, isLoaded, isSignedIn: !!user }
}

export function useAuth() {
  const { user, isLoaded } = useUser()
  return {
    userId: user?.id ?? null,
    isLoaded,
    isSignedIn: !!user,
  }
}

/* — The rest are inert components kept for import compatibility — */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => children
export const useSignIn = () => ({})
export const useSignUp = () => ({})
export const SignUp = () => null
export const SignIn = () => null
export const AuthenticateWithRedirectCallback = () => null
