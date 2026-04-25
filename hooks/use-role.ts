"use client"

import { useAuth } from "@/hooks/use-auth"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "@/lib/auth/utils"

/**
 * Hook para obtener y verificar el rol del usuario actual
 */
export function useRole() {
  const { user, loading: authLoading } = useAuth()
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (authLoading) {
      setLoading(true)
      return
    }

    if (!user) {
      setRole(null)
      setLoading(false)
      return
    }

    const loadRole = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error loading role:", error)
          setRole("patient") // Default fallback
        } else {
          setRole((data?.role as UserRole) || "patient")
        }
      } catch (error) {
        console.error("Error loading role:", error)
        setRole("patient") // Default fallback
      } finally {
        setLoading(false)
      }
    }

    loadRole()
  }, [user, authLoading, supabase])

  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!role) return false
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    return roles.includes(role)
  }

  return {
    role,
    loading,
    hasRole,
    isPatient: role === "patient",
    isProfessional: role === "professional",
    isAdmin: role === "admin",
  }
}

