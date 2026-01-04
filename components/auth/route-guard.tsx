"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "@/lib/auth/utils"

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
  requireEmailVerification?: boolean
  requireProfileComplete?: boolean
  redirectTo?: string
}

/**
 * Componente para proteger rutas basado en rol y estado del usuario
 * 
 * @example
 * <RouteGuard requiredRole="professional" requireEmailVerification>
 *   <ProfessionalDashboard />
 * </RouteGuard>
 */
export function RouteGuard({
  children,
  requiredRole,
  requireEmailVerification = false,
  requireProfileComplete = false,
  redirectTo,
}: RouteGuardProps) {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (authLoading) return

    // Si no hay usuario, redirigir a login
    if (!user) {
      router.push(redirectTo || "/login")
      return
    }

    // Cargar perfil si se requiere verificación de rol o estado
    if (requiredRole || requireEmailVerification || requireProfileComplete) {
      const loadProfile = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("role, date_of_birth, email_verified")
            .eq("id", user.id)
            .single()

          if (error) {
            console.error("Error loading profile:", error)
            setProfileLoading(false)
            return
          }

          setProfile(data)
        } catch (error) {
          console.error("Error loading profile:", error)
        } finally {
          setProfileLoading(false)
        }
      }

      loadProfile()
    } else {
      setProfileLoading(false)
    }
  }, [user, authLoading, requiredRole, requireEmailVerification, requireProfileComplete, router, redirectTo, supabase])

  // Mostrar loading mientras se verifica
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, no renderizar nada (ya se redirigió)
  if (!user) {
    return null
  }

  // Verificar email verificado
  if (requireEmailVerification) {
    const emailVerified = user.email_confirmed_at !== null || profile?.email_verified
    if (!emailVerified) {
      router.push("/verify-email")
      return null
    }
  }

  // Verificar perfil completo
  if (requireProfileComplete) {
    const emailVerified = user.email_confirmed_at !== null || profile?.email_verified
    const profileComplete = !!profile?.date_of_birth && emailVerified
    if (!profileComplete) {
      router.push("/complete-profile")
      return null
    }
  }

  // Verificar rol
  if (requiredRole) {
    const userRole = profile?.role || "patient"
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    
    if (!roles.includes(userRole)) {
      // Redirigir según el rol del usuario
      const defaultRedirect = userRole === "professional" ? "/professional/dashboard" : "/dashboard"
      router.push(redirectTo || defaultRedirect)
      return null
    }
  }

  // Todo verificado, renderizar children
  return <>{children}</>
}

