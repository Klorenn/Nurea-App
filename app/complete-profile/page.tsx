"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SmokeyBackground } from "@/components/smokey-login"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Heart,
  Stethoscope,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"

type Role = "patient" | "professional"

/* ------------------------------------------------------------------
 *  Step 1: Role picker (only shown for users that don't have a role
 *           yet — typically just-signed-up Google users).
 * ------------------------------------------------------------------ */
function RolePicker({
  language,
  onPicked,
}: {
  language: "es" | "en"
  onPicked: (role: Role) => void
}) {
  const [submitting, setSubmitting] = useState<Role | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isES = language === "es"

  const handlePick = async (role: Role) => {
    setSubmitting(role)
    setError(null)
    try {
      const res = await fetch("/api/user/select-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(
          data?.message ||
            (isES ? "No pudimos guardar tu rol." : "Could not save your role.")
        )
      }
      onPicked(role)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">
          {isES ? "¿Cómo usarás Nurea?" : "How will you use Nurea?"}
        </h2>
        <p className="mt-2 text-sm text-gray-200">
          {isES
            ? "Elige tu perfil para personalizar tu experiencia."
            : "Pick your profile to personalize your experience."}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-300 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-200">{error}</p>
        </div>
      )}

      <div className="grid gap-4">
        <button
          type="button"
          onClick={() => handlePick("patient")}
          disabled={submitting !== null}
          className="group flex items-start gap-4 rounded-2xl border border-white/20 bg-white/10 p-5 text-left transition hover:border-teal-300/60 hover:bg-white/15 disabled:opacity-50"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-400/20">
            {submitting === "patient" ? (
              <Loader2 className="h-5 w-5 animate-spin text-teal-200" />
            ) : (
              <Heart className="h-5 w-5 text-teal-200" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-base font-semibold text-white">
              {isES ? "Soy paciente" : "I'm a patient"}
            </div>
            <div className="mt-1 text-xs text-gray-300">
              {isES
                ? "Quiero buscar profesionales, agendar citas y gestionar mi bienestar."
                : "I want to find professionals, book appointments and manage my wellbeing."}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handlePick("professional")}
          disabled={submitting !== null}
          className="group flex items-start gap-4 rounded-2xl border border-white/20 bg-white/10 p-5 text-left transition hover:border-teal-300/60 hover:bg-white/15 disabled:opacity-50"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/20">
            {submitting === "professional" ? (
              <Loader2 className="h-5 w-5 animate-spin text-amber-200" />
            ) : (
              <Stethoscope className="h-5 w-5 text-amber-200" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-base font-semibold text-white">
              {isES ? "Soy profesional de la salud" : "I'm a healthcare professional"}
            </div>
            <div className="mt-1 text-xs text-gray-300">
              {isES
                ? "Quiero ofrecer mis servicios, gestionar mi agenda y atender pacientes."
                : "I want to offer my services, manage my schedule and treat patients."}
            </div>
          </div>
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">
        {isES
          ? "Podrás ajustar tu perfil más tarde desde Configuración."
          : "You can adjust this later from Settings."}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------
 *  Step 2: Date of birth (the original complete-profile content)
 * ------------------------------------------------------------------ */
function ProfileForm({ language }: { language: "es" | "en" }) {
  const isES = language === "es"
  const router = useRouter()
  const { user } = useUser()

  const [dateOfBirth, setDateOfBirth] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    if (!user) return
    if (!user.email_confirmed_at) {
      ;(async () => {
        try {
          const res = await fetch("/api/auth/send-verification", { method: "POST" })
          if (res.ok) setEmailSent(true)
        } catch (e) {
          /* silent */
        }
      })()
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dateOfBirth) {
      setError(isES ? "Por favor ingresa tu fecha de nacimiento" : "Please enter your date of birth")
      return
    }

    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--

    if (age < 18) {
      setError(isES ? "Debes ser mayor de 18 años para usar NUREA" : "You must be at least 18 years old to use NUREA")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ date_of_birth: dateOfBirth, updated_at: new Date().toISOString() })
        .eq("id", user!.id)
      if (dbError) throw dbError

      // Read role to redirect correctly
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user!.id)
        .maybeSingle()

      const role = profile?.role
      const redirectPath =
        role === "professional"
          ? "/dashboard/professional"
          : role === "admin"
          ? "/dashboard/admin"
          : "/dashboard/patient"

      router.push(redirectPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : (isES ? "Error al completar el perfil" : "Error completing profile"))
    } finally {
      setLoading(false)
    }
  }

  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 18)
  const maxDateString = maxDate.toISOString().split("T")[0]
  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - 100)
  const minDateString = minDate.toISOString().split("T")[0]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">
          {isES ? "Completar Perfil" : "Complete Profile"}
        </h2>
        <p className="mt-2 text-sm text-gray-200">
          {isES
            ? "Necesitamos algunos datos adicionales para terminar tu registro"
            : "We need a couple more details to finish your registration"}
        </p>
      </div>

      {!user?.email_confirmed_at && (
        <div className={cn(
          "rounded-xl p-4 border",
          emailSent ? "bg-teal-500/20 border-teal-500/50" : "bg-amber-500/20 border-amber-500/50"
        )}>
          <div className="flex items-start gap-3">
            {emailSent ? (
              <CheckCircle2 className="h-5 w-5 text-teal-300 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-white mb-1">
                {emailSent
                  ? isES ? "Email de verificación enviado" : "Verification email sent"
                  : isES ? "Verifica tu correo electrónico" : "Verify your email address"}
              </p>
              <p className="text-xs text-gray-200">
                {emailSent
                  ? isES ? "Revisa tu bandeja y haz clic en el enlace." : "Check your inbox and click the link."
                  : isES ? "Se enviará un email a tu correo." : "A verification email will be sent to your email."}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-300 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="dateOfBirth" className="text-sm font-medium text-teal-200/90 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {isES ? "Fecha de Nacimiento" : "Date of Birth"}
            <span className="text-red-300">*</span>
          </label>
          <input
            type="date"
            id="dateOfBirth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            min={minDateString}
            max={maxDateString}
            required
            disabled={loading}
            className="w-full px-4 py-3 bg-white/10 border border-teal-300/50 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 disabled:opacity-50"
          />
          <p className="text-xs text-gray-300">
            {isES ? "Debes ser mayor de 18 años para usar NUREA" : "You must be at least 18 years old to use NUREA"}
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading || !dateOfBirth}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isES ? "Guardando..." : "Saving..."}
            </>
          ) : (
            isES ? "Completar Registro" : "Complete Registration"
          )}
        </Button>
      </form>
    </div>
  )
}

/* ------------------------------------------------------------------
 *  Page wrapper — decides whether to show role picker or DOB form
 * ------------------------------------------------------------------ */
function CompleteProfileContent() {
  const { language } = useLanguage()
  const lang: "es" | "en" = language === "es" ? "es" : "en"
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoaded } = useUser()

  const [phase, setPhase] = useState<"loading" | "role" | "form">("loading")

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      // small grace period for the session to land
      const t = setTimeout(() => {
        if (!user) router.replace("/login")
      }, 1500)
      return () => clearTimeout(t)
    }

    let cancelled = false
    ;(async () => {
      try {
        const supabase = createClient()
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, date_of_birth")
          .eq("id", user.id)
          .maybeSingle()

        if (cancelled) return

        // No role yet → ask for it
        if (!profile?.role) {
          setPhase("role")
          return
        }

        // Role exists but DOB missing → DOB form
        if (!profile?.date_of_birth) {
          setPhase("form")
          return
        }

        // Profile already complete → bounce to the right dashboard
        const role = profile.role
        const redirectPath =
          role === "professional"
            ? "/dashboard/professional"
            : role === "admin"
            ? "/dashboard/admin"
            : "/dashboard/patient"
        router.replace(redirectPath)
      } catch (err) {
        console.error("[complete-profile] init error:", err)
        if (!cancelled) setPhase("role")
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user, isLoaded, router, searchParams])

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <SmokeyBackground backdropBlurAmount="md" color="#14B8A6" />

      <div className="relative z-10 w-full max-w-md">
        <div className="w-full p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
          {phase === "loading" && (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-white">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-gray-200">
                {lang === "es" ? "Preparando tu perfil…" : "Preparing your profile…"}
              </p>
            </div>
          )}

          {phase === "role" && (
            <RolePicker
              language={lang}
              onPicked={(role) => {
                // After picking the role, do a hard navigation so SWR
                // caches and any cookie-based JWT claims are refreshed.
                const target =
                  role === "professional"
                    ? "/dashboard/professional"
                    : "/dashboard/patient"
                window.location.href = target
              }}
            />
          )}

          {phase === "form" && <ProfileForm language={lang} />}

          <p className="text-center text-xs text-gray-400">
            {lang === "es"
              ? "Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad"
              : "By continuing, you agree to our Terms of Service and Privacy Policy"}
          </p>
        </div>
      </div>
    </main>
  )
}

export default function CompleteProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
          <SmokeyBackground backdropBlurAmount="md" color="#14B8A6" />
          <div className="relative z-10 text-white flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </div>
        </main>
      }
    >
      <CompleteProfileContent />
    </Suspense>
  )
}
