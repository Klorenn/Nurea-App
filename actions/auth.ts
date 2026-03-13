"use server"

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server"

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "http://localhost:3000"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(String(email).trim())
}

function isConnectionError(error: unknown): boolean {
  if (!error) return false
  const err = error as Record<string, unknown>
  const message = String(err?.message ?? err?.toString?.() ?? "")
  const code = String(err?.code ?? err?.status ?? "")
  const normalized = `${message} ${code}`.toLowerCase()

  return (
    normalized.includes("connecttimeouterror") ||
    normalized.includes("timeout") ||
    normalized.includes("timed out") ||
    normalized.includes("etimedout") ||
    normalized.includes("network error") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("fetch failed") ||
    normalized.includes("getaddrinfo") ||
    normalized.includes("enotfound")
  )
}

const SAFE_ERROR_MESSAGE =
  "No pudimos completar la solicitud. Revisa los datos e inténtalo de nuevo."

export type SignUpInput = {
  email: string
  password: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  role?: "patient" | "professional"
  specialty?: string
  registrationNumber?: string
}

export type AuthActionResult =
  | { success: true; message?: string }
  | { success: false; error: string }

/**
 * Registro con flujo nativo de Supabase.
 * Supabase envía el correo de verificación automáticamente vía SMTP configurado.
 */
export async function signUp(input: SignUpInput): Promise<AuthActionResult> {
  const email = String(input.email).trim().toLowerCase()
  const password = String(input.password)
  const firstName = input.firstName?.trim() || ""
  const lastName = input.lastName?.trim() || ""
  const role = input.role || "patient"

  if (!email || !password) {
    return { success: false, error: "Email y contraseña son obligatorios." }
  }
  if (!isValidEmail(email)) {
    return { success: false, error: "El formato del email no es válido." }
  }
  if (password.length < 6) {
    return { success: false, error: "La contraseña debe tener al menos 6 caracteres." }
  }

  try {
    const supabase = await createServerSupabaseClient()
    const redirectTo = `${SITE_URL.replace(/\/$/, "")}/auth/callback`

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          first_name: firstName,
          last_name: lastName,
          role,
          date_of_birth: input.dateOfBirth || null,
          specialty: input.specialty || null,
          registration_number: input.registrationNumber || null,
        },
      },
    })

    if (error) {
      const msg = error.message?.toLowerCase() ?? ""
      console.error("[auth] signUp error:", error.message)

      if (isConnectionError(error)) {
        return {
          success: false,
          error: "Error de conexión. Por favor, intenta de nuevo en unos segundos.",
        }
      }
      if (msg.includes("already") && msg.includes("registered")) {
        return {
          success: false,
          error: "Este correo ya está registrado. Inicia sesión o usa otro correo.",
        }
      }
      if (msg.includes("password") && msg.includes("weak")) {
        return {
          success: false,
          error: "La contraseña es muy débil. Usa al menos 6 caracteres.",
        }
      }
      return { success: false, error: SAFE_ERROR_MESSAGE }
    }

    if (data.user && data.user.identities?.length === 0) {
      return {
        success: false,
        error: "Este correo ya está registrado. Inicia sesión o usa otro correo.",
      }
    }

    return { success: true }
  } catch (err) {
    console.error("[auth] signUp exception:", err)
    if (isConnectionError(err)) {
      return {
        success: false,
        error: "Error de conexión. Por favor, intenta de nuevo en unos segundos.",
      }
    }
    return { success: false, error: SAFE_ERROR_MESSAGE }
  }
}

/**
 * Flujo NUEVO de recuperación de contraseña basado en Supabase Auth:
 * - Usa supabase.auth.resetPasswordForEmail(email, { redirectTo })
 * - redirectTo apunta a /auth/update-password, donde el usuario define su nueva contraseña.
 *
 * Regla: nunca exponemos detalles técnicos ni si el email existe o no.
 * Siempre devolvemos un mensaje neutral salvo errores claros de conexión.
 */
export async function requestPasswordReset(
  email: string
): Promise<AuthActionResult> {
  const normalized = String(email).trim().toLowerCase()
  if (!normalized) {
    return { success: false, error: "Ingresa tu email." }
  }
  if (!isValidEmail(normalized)) {
    return { success: false, error: "El formato del email no es válido." }
  }

  try {
    const supabase = await createServerSupabaseClient()
    const redirectTo = `${SITE_URL.replace(/\/$/, "")}/auth/update-password`

    const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
      redirectTo,
    })

    if (error) {
      console.error("[auth] requestPasswordReset resetPasswordForEmail error:", error)

      if (isConnectionError(error)) {
        return {
          success: false,
          error:
            "Error de conexión con el servidor de salud. Por favor, intenta de nuevo en unos segundos.",
        }
      }

      // Para no filtrar información (si el email existe o no), devolvemos
      // igualmente un mensaje neutral aunque haya fallado, salvo errores de red.
      return {
        success: true,
        message:
          "Si ese correo está registrado, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y spam.",
      }
    }

    return {
      success: true,
      message:
        "Si ese correo está registrado, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y spam.",
    }
  } catch (err) {
    console.error("[auth] requestPasswordReset:", err)

    if (isConnectionError(err)) {
      return {
        success: false,
        error:
          "Error de conexión con el servidor de salud. Por favor, intenta de nuevo en unos segundos.",
      }
    }

    return {
      success: true,
      message:
        "Si ese correo está registrado, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y spam.",
    }
  }
}

