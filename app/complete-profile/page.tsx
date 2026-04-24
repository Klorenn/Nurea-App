"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SmokeyBackground } from "@/components/smokey-login"
import { Button } from "@/components/ui/button"
import { Calendar, Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { cn } from "@/lib/utils"

function CompleteProfileContent() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return

    // Check if user is authenticated
    if (!user) {
      // Give it a moment for session to establish after signup
      const timeout = setTimeout(() => {
        // Re-check user after timeout
        if (!user) {
          router.push("/login")
        }
      }, 2000)
      return () => clearTimeout(timeout)
    }

    // Check if email is already verified
    if (user.email_confirmed_at) {
      // Check if profile is already complete
      checkProfileComplete()
    } else {
      // Send verification email if not sent yet
      sendVerificationEmail()
    }
  }, [user, authLoading, router])

  const checkProfileComplete = async () => {
    try {
      const response = await fetch("/api/user/profile")
      const data = await response.json()
      
      if (data.profile?.date_of_birth) {
        // Profile is complete, redirect based on role
        const userRole = data.profile?.role || 'patient'
        let redirectPath = '/dashboard'
        
        if (userRole === 'professional') {
          redirectPath = '/dashboard/professional'
        } else if (userRole === 'admin') {
          redirectPath = '/dashboard/admin'
        } else {
          redirectPath = '/dashboard/patient'
        }
        
        router.push(redirectPath)

      }
    } catch (err) {
      console.error("Error checking profile:", err)
    }
  }

  const sendVerificationEmail = async () => {
    if (emailSent) return
    
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
      })
      
      if (response.ok) {
        setEmailSent(true)
      }
    } catch (err) {
      console.error("Error sending verification email:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!dateOfBirth) {
      setError(language === "es" ? "Por favor ingresa tu fecha de nacimiento" : "Please enter your date of birth")
      return
    }

    // Validate age (must be at least 18 years old)
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    if (age < 18) {
      setError(language === "es" ? "Debes ser mayor de 18 años para usar NUREA" : "You must be at least 18 years old to use NUREA")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateOfBirth,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || (language === "es" ? "Error al completar el perfil" : "Error completing profile"))
      }

      // Redirect to onboarding if profile is not complete
      // Check if we have all required fields
      const profileResponse = await fetch("/api/user/profile")
      const profileData = await profileResponse.json()
      
      const hasAllFields = profileData.profile?.first_name && 
                          profileData.profile?.last_name && 
                          profileData.profile?.date_of_birth && 
                          profileData.profile?.avatar_url
      
      if (!hasAllFields) {
        router.push("/onboarding")
      } else {
        // Redirect based on role
        const redirectPath = data.redirectPath || "/dashboard"
        router.push(redirectPath)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (language === "es" ? "Error al completar el perfil" : "Error completing profile"))
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
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <SmokeyBackground backdropBlurAmount="md" color="#14B8A6" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="w-full p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              {language === "es" ? "Completar Perfil" : "Complete Profile"}
            </h2>
            <p className="mt-2 text-sm text-gray-200">
              {language === "es" 
                ? "Necesitamos algunos datos adicionales para completar tu registro"
                : "We need some additional information to complete your registration"}
            </p>
          </div>

          {/* Email Verification Status */}
          {!user?.email_confirmed_at && (
            <div className={cn(
              "rounded-xl p-4 border",
              emailSent
                ? "bg-teal-500/20 border-teal-500/50"
                : "bg-amber-500/20 border-amber-500/50"
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
                      ? (language === "es" ? "Email de verificación enviado" : "Verification email sent")
                      : (language === "es" ? "Verifica tu correo electrónico" : "Verify your email address")}
                  </p>
                  <p className="text-xs text-gray-200">
                    {emailSent
                      ? (language === "es" 
                          ? "Revisa tu bandeja de entrada y haz clic en el enlace de verificación"
                          : "Check your inbox and click the verification link")
                      : (language === "es"
                          ? "Se enviará un email de verificación a tu correo"
                          : "A verification email will be sent to your email")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-300 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-200">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="dateOfBirth" className="text-sm font-medium text-teal-200/90 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {language === "es" ? "Fecha de Nacimiento" : "Date of Birth"}
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
                {language === "es" 
                  ? "Debes ser mayor de 18 años para usar NUREA"
                  : "You must be at least 18 years old to use NUREA"}
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
                  {language === "es" ? "Guardando..." : "Saving..."}
                </>
              ) : (
                <>
                  {language === "es" ? "Completar Registro" : "Complete Registration"}
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400">
            {language === "es" 
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
    <Suspense fallback={
      <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <SmokeyBackground backdropBlurAmount="md" color="#14B8A6" />
        <div className="relative z-10 text-white">Cargando...</div>
      </main>
    }>
      <CompleteProfileContent />
    </Suspense>
  )
}
