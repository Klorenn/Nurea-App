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
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null)
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
            // `onboarding_completed` puede no existir en entornos viejos; lo pedimos solo si hace falta.
            .select("role, date_of_birth, email_verified")
            .eq("id", user.id)
            .maybeSingle()

          if (error) {
            if (process.env.NODE_ENV === "development") {
              console.error("Error loading profile:", {
                message: (error as any)?.message,
                status: (error as any)?.status,
                details: error,
              })
            }
            setProfile(null)
            setOnboardingComplete(true) // no bloquear por un problema técnico
            return
          }

          setProfile(data)

          // Wizard v2 onboarding gating for professional routes.
          // If `onboarding_completed` is missing (older environments), we avoid blocking.
          if (data?.role === "professional" && typeof window !== "undefined") {
            const currentPath = window.location.pathname
            let completed: boolean | null = null

            // Solo intentamos leer `onboarding_completed` cuando realmente necesitamos gatear.
            if (currentPath !== "/onboarding") {
              try {
                const { data: onboardingData } = await supabase
                  .from("profiles")
                  .select("onboarding_completed")
                  .eq("id", user.id)
                  .maybeSingle()

                completed = onboardingData?.onboarding_completed ?? null
              } catch {
                // Si falla (columna inexistente / RLS), no bloqueamos.
                completed = null
              }

              if (completed === false) {
                router.push("/onboarding")
                return
              }
            }

            setOnboardingComplete(completed !== false)
          } else {
            setOnboardingComplete(true)
          }
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error loading profile:", {
              message: (error as any)?.message,
              details: error,
            })
          }
          setProfile(null)
          setOnboardingComplete(true) // no bloquear por un problema técnico
        } finally {
          setProfileLoading(false)
        }
      }

      loadProfile()
    } else {
      setProfileLoading(false)
      setOnboardingComplete(true)
    }
  }, [user, authLoading, requiredRole, requireEmailVerification, requireProfileComplete, router, redirectTo, supabase])

  // Mostrar loading mientras se verifica
  if (authLoading || profileLoading || onboardingComplete === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" aria-hidden="true"></div>
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
    // Si falla la carga de `profiles`, no asumimos "patient" (eso rompe dashboards admin).
    // Intentamos tomar el rol desde `user_metadata`; si tampoco existe, no redirigimos.
    const userRole =
      profile?.role ||
      (user.user_metadata as unknown as { role?: string } | null)?.role ||
      null

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

    // Si no podemos determinar el rol, redirigimos (evita que se muestre admin si el rol no está claro).
    if (!userRole) {
      router.push(redirectTo || "/dashboard")
      return null
    }

    if (!roles.includes(userRole as any)) {
      // Redirigir según el rol del usuario
      const defaultRedirect = 
        userRole === "professional" ? "/professional/dashboard" :
        userRole === "admin" ? "/admin" :
        "/dashboard"
      router.push(redirectTo || defaultRedirect)
      return null
    }
  }

  // Todo verificado, renderizar children
  return <>{children}</>
}

