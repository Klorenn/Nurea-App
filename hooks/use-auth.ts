"use client"

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useRef } from 'react'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // Stable client reference — createBrowserClient returns a new object on every
  // call, so storing it in a ref prevents the useEffect from re-running (and
  // re-subscribing) on every render.
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, [])

  const signOut = async () => {
    try {
      // Limpiar sesión en Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error)
      }
      
      // Limpiar cualquier dato local si es necesario
      // Redirigir al login
      window.location.href = '/login'
    } catch (error) {
      console.error('Error during sign out:', error)
      // Aún así redirigir al login
      window.location.href = '/login'
    }
  }

  return {
    user,
    loading,
    signOut,
  }
}

