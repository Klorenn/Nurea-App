"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User, Stethoscope, Loader2, AlertCircle, Mail, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const SPECIALTY_OPTIONS = [
  "Medicina General",
  "Psicología",
  "Nutrición y Dietética",
  "Kinesiología y Rehabilitación",
  "Dermatología",
  "Cardiología",
  "Pediatría",
  "Ginecología y Obstetricia",
  "Traumatología",
  "Medicina Interna",
  "Otra",
]

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
function isValidEmail(v: string) {
  return emailRegex.test((v || "").trim())
}

function isAtLeast18(dateStr: string): boolean {
  if (!dateStr) return false
  const birth = new Date(dateStr)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 18
}

type Role = "patient" | "professional"

export function AuthForm() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [role, setRole] = useState<Role>("patient")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  const isRegister = mode === "register"
  const isProfessional = role === "professional"

  const validateRegister = (): boolean => {
    const err: Record<string, string> = {}
    if (!firstName.trim()) err.firstName = "El nombre es obligatorio."
    if (!lastName.trim()) err.lastName = "El apellido es obligatorio."
    if (!email.trim()) err.email = "El correo es obligatorio."
    else if (!isValidEmail(email)) err.email = "Introduce un correo válido."
    if (!password) err.password = "La contraseña es obligatoria."
    else if (password.length < 6) err.password = "Mínimo 6 caracteres."
    if (!dateOfBirth) err.dateOfBirth = "La fecha de nacimiento es obligatoria."
    else if (!isAtLeast18(dateOfBirth)) err.dateOfBirth = "Debes ser mayor de 18 años."
    if (isProfessional) {
      if (!specialty) err.specialty = "Selecciona una especialidad."
      if (!registrationNumber.trim()) err.registrationNumber = "El RUT o registro médico es obligatorio."
    }
    setFieldErrors(err)
    return Object.keys(err).length === 0
  }

  const validateLogin = (): boolean => {
    const err: Record<string, string> = {}
    if (!email.trim()) err.email = "El correo es obligatorio."
    else if (!isValidEmail(email)) err.email = "Introduce un correo válido."
    if (!password) err.password = "La contraseña es obligatoria."
    setFieldErrors(err)
    return Object.keys(err).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validateLogin()) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (authError) {
        setError(authError.message || "Error al iniciar sesión")
        setLoading(false)
        return
      }
      if (data.user && !data.user.email_confirmed_at) {
        setError("Por favor verifica tu email antes de iniciar sesión")
        setLoading(false)
        return
      }
      const redirect = data.user?.user_metadata?.role === "professional" ? "/professional/dashboard" : "/dashboard"
      router.push(redirect)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validateRegister()) return
    setLoading(true)
    try {
      setError("La funcionalidad de registro ha sido migrada a Clerk. Por favor, usa el flujo de Clerk para registrarte.")
    } finally {
      setLoading(false)
    }
  }

  const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-200 tracking-normal"
  const inputClass =
    "w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-colors disabled:opacity-50 h-11 px-4"

  if (registrationSuccess) {
    return (
      <div className="w-full max-w-md sm:max-w-lg mx-auto p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200/80 dark:border-slate-700/80">
        <div className="space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              ¡Cuenta creada!
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Hemos enviado un enlace de verificación a:
            </p>
            <p className="font-semibold text-teal-600 dark:text-teal-400 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              {registeredEmail}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 text-left space-y-3">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>Siguiente paso:</strong> Abre tu correo y haz clic en el enlace para activar tu cuenta.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Si no lo encuentras, revisa tu carpeta de spam o correo no deseado.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setRegistrationSuccess(false)
              setMode("login")
              setEmail(registeredEmail)
              setPassword("")
            }}
            className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline"
          >
            Volver a iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md sm:max-w-lg mx-auto p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200/80 dark:border-slate-700/80">
      <div className="space-y-5">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isRegister ? "Crear cuenta" : "Iniciar sesión"}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            {isRegister ? "Completa tus datos para unirte a Nurea." : "Accede a tu portal de salud."}
          </p>
        </div>

        {isRegister && (
          <div className="space-y-3">
            <Label className={labelClass} style={{ letterSpacing: "normal" }}>
              Tipo de cuenta
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all font-medium text-sm",
                  role === "patient"
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-teal-300 dark:hover:border-teal-600"
                )}
                aria-pressed={role === "patient"}
              >
                <User className="h-4 w-4" />
                Soy Paciente
              </button>
              <button
                type="button"
                onClick={() => setRole("professional")}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all font-medium text-sm",
                  role === "professional"
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-teal-300 dark:hover:border-teal-600"
                )}
                aria-pressed={role === "professional"}
              >
                <Stethoscope className="h-4 w-4" />
                Soy Profesional
              </button>
            </div>
          </div>
        )}

        {error && (
          <div
            className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {isRegister ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="firstName" className={labelClass} style={{ letterSpacing: "normal" }}>
                  Nombre
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                  placeholder="Tu nombre"
                  disabled={loading}
                  autoComplete="given-name"
                  aria-invalid={!!fieldErrors.firstName}
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className={labelClass} style={{ letterSpacing: "normal" }}>
                  Apellido
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                  placeholder="Tu apellido"
                  disabled={loading}
                  autoComplete="family-name"
                  aria-invalid={!!fieldErrors.lastName}
                />
                {fieldErrors.lastName && (
                  <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob" className={labelClass} style={{ letterSpacing: "normal" }}>
                Fecha de nacimiento
              </Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={inputClass}
                disabled={loading}
                aria-invalid={!!fieldErrors.dateOfBirth}
              />
              {fieldErrors.dateOfBirth && (
                <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.dateOfBirth}</p>
              )}
            </div>

            {isProfessional && (
              <div className="space-y-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-4">
                <div className="space-y-2">
                  <Label htmlFor="specialty" className={labelClass} style={{ letterSpacing: "normal" }}>
                    Especialidad
                  </Label>
                  <Select value={specialty} onValueChange={setSpecialty} disabled={loading} required={isProfessional}>
                    <SelectTrigger className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 h-11 px-4 text-slate-900 dark:text-slate-100">
                      <SelectValue placeholder="Selecciona una especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTY_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.specialty && (
                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.specialty}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber" className={labelClass} style={{ letterSpacing: "normal" }}>
                    RUT / Registro médico
                  </Label>
                  <Input
                    id="registrationNumber"
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className={inputClass}
                    placeholder="Ej. 12.345.678-9"
                    disabled={loading}
                    autoComplete="off"
                    aria-invalid={!!fieldErrors.registrationNumber}
                  />
                  {fieldErrors.registrationNumber && (
                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.registrationNumber}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className={labelClass} style={{ letterSpacing: "normal" }}>
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="tu@email.com"
                disabled={loading}
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={labelClass} style={{ letterSpacing: "normal" }}>
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={6}
                aria-invalid={!!fieldErrors.password}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-email" className={labelClass} style={{ letterSpacing: "normal" }}>
                Correo electrónico
              </Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="tu@email.com"
                disabled={loading}
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className={labelClass} style={{ letterSpacing: "normal" }}>
                Contraseña
              </Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Tu contraseña"
                disabled={loading}
                autoComplete="current-password"
                aria-invalid={!!fieldErrors.password}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.password}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          {isRegister ? (
            <>
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => { setMode("login"); setError(null); setFieldErrors({}); }}
                className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline"
              >
                Iniciar sesión
              </button>
            </>
          ) : (
            <>
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => { setMode("register"); setError(null); setFieldErrors({}); }}
                className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline"
              >
                Regístrate
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
