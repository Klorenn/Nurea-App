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
            .select("role, date_of_birth, email_verified")
            .eq("id", user.id)
            .single()

          if (error) {
            console.error("Error loading profile:", error)
            setProfileLoading(false)
            return
          }

          setProfile(data)

          // If user is a professional, check onboarding status
          // Only check for professional routes (not onboarding page itself)
          if (data?.role === "professional" && typeof window !== "undefined") {
            const currentPath = window.location.pathname
            // Don't check onboarding for the onboarding page itself
            if (currentPath !== "/professional/onboarding") {
              try {
                const onboardingResponse = await fetch("/api/professional/onboarding/status", {
                  method: "GET",
                  credentials: "include",
                })
                
                if (!onboardingResponse.ok) {
                  // If API call fails, allow access (don't block user)
                  console.warn("Onboarding status check failed, allowing access")
                  setOnboardingComplete(true)
                  return
                }
                
                const onboardingData = await onboardingResponse.json()
                
                if (onboardingData.success !== false) {
                  setOnboardingComplete(onboardingData.isComplete !== false)
                  
                  // If onboarding is incomplete, redirect to onboarding page
                  if (onboardingData.isComplete === false) {
                    router.push("/professional/onboarding")
                    return
                  }
                } else {
                  // API returned error but not a critical one, allow access
                  setOnboardingComplete(true)
                }
              } catch (onboardingError) {
                console.error("Error checking onboarding status:", onboardingError)
                // Don't block access if we can't check onboarding status
                // Allow user to proceed - they can complete onboarding later
                setOnboardingComplete(true)
              }
            } else {
              // On onboarding page, allow access
              setOnboardingComplete(true)
            }
          } else {
            setOnboardingComplete(true)
          }
        } catch (error) {
          console.error("Error loading profile:", error)
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

