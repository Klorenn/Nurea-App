"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { loadingDashboardInsetClassName } from "@/lib/loading-layout"

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

            setOnboardingComplete(true) // false case already handled above with router.push + return
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

  // Compute the redirect target after profile loads (null = no redirect needed)
  const postLoadRedirect = (() => {
    if (authLoading || profileLoading || onboardingComplete === null || !user) return null

    if (requireEmailVerification) {
      const emailVerified = user.email_confirmed_at !== null || profile?.email_verified
      if (!emailVerified) return "/verify-email"
    }

    if (requireProfileComplete) {
      const emailVerified = user.email_confirmed_at !== null || profile?.email_verified
      const profileComplete = !!profile?.date_of_birth && emailVerified
      if (!profileComplete) return "/complete-profile"
    }

    if (requiredRole) {
      const userRole =
        profile?.role ||
        (user.user_metadata as unknown as { role?: string } | null)?.role ||
        null
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

      if (!userRole) return redirectTo || "/dashboard"

      if (!roles.includes(userRole as any)) {
        const defaultRedirect =
          userRole === "professional" ? "/dashboard/professional" :
          userRole === "admin" ? "/dashboard/admin" :
          "/dashboard"
        return redirectTo || defaultRedirect
      }
    }

    return null
  })()

  useEffect(() => {
    if (postLoadRedirect) {
      router.push(postLoadRedirect)
    }
  }, [postLoadRedirect, router])

  // Mostrar loading mientras se verifica o mientras se redirige
  if (authLoading || profileLoading || onboardingComplete === null || postLoadRedirect) {
    return (
      <div
        className={loadingDashboardInsetClassName("bg-background")}
        role="status"
        aria-live="polite"
      >
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" aria-hidden="true" />
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, no renderizar nada (ya se redirigió en el useEffect de arriba)
  if (!user) {
    return null
  }

  // Todo verificado, renderizar children
  return <>{children}</>
}

