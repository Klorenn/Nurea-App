import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"
import type { UserRole } from "./utils"

export interface AuthUser {
  user: User
  role: UserRole
  profileComplete: boolean
  emailVerified: boolean
}

/**
 * Obtiene el usuario autenticado con su rol y estado (solo en el servidor).
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, date_of_birth, email_verified")
    .eq("id", user.id)
    .single()


  if (profileError) {
    console.error("Error fetching profile:", profileError)
    return null
  }
  const role = (profile?.role as UserRole) || "patient"
  const emailVerified = user.email_confirmed_at !== null || profile?.email_verified || false
  const profileComplete = !!profile?.date_of_birth && emailVerified

  return {
    user,
    role,
    profileComplete,
    emailVerified,
  }
}

/**
 * Verifica si el usuario tiene el rol requerido (solo en el servidor).
 */
export async function hasRole(requiredRole: UserRole | UserRole[]): Promise<boolean> {
  const authUser = await getAuthUser()

  if (!authUser) {
    return false
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return roles.includes(authUser.role)
}

