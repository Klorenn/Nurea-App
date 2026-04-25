"use client"

/**
 * Compatibility shim that mimics Clerk's `useUser` / `useAuth` hooks but
 * delegates to Supabase auth. This file used to be a stub returning `null`
 * for every consumer, which caused every dashboard relying on `useUser`
 * to perma-redirect to /login or hang on the loading spinner.
 *
 * The real Supabase user is exposed under the same shape Clerk consumers
 * expect: `{ user, isLoaded, isSignedIn }`.
 */

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

type ClerkLikeUser =
  | (User & {
      // a few helpers Clerk users habitually access
      firstName?: string | null
      lastName?: string | null
    })
  | null

function decorate(user: User | null): ClerkLikeUser {
  if (!user) return null
  const meta: any = user.user_metadata || {}
  const full = (meta.full_name || meta.name || "").split(" ")
  return Object.assign(user, {
    firstName: meta.first_name ?? full[0] ?? null,
    lastName: meta.last_name ?? full.slice(1).join(" ") ?? null,
  })
}

export function useUser() {
  const [user, setUser] = useState<ClerkLikeUser>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    // Safety net: never let the spinner hang forever — after 4s we mark
    // auth as "loaded" so consumer pages can render their empty / login
    // state instead of an infinite loader.
    const safety = setTimeout(() => {
      if (mounted) setIsLoaded(true)
    }, 4000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setUser(decorate(session?.user ?? null))
      setIsLoaded(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return
        setUser(decorate(session?.user ?? null))
        setIsLoaded(true)
      }
    )

    return () => {
      mounted = false
      clearTimeout(safety)
      subscription.unsubscribe()
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
