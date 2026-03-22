"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Upload,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type Gender = "M" | "F" | "other"

interface FormData {
  avatarUrl: string
  phone: string
  gender: Gender | ""
  dateOfBirth: string
  nationalId: string
  healthInsurance: string
  allergies: string
  chronicDiseases: string
  currentMedications: string
  patientGoal: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HEALTH_INSURANCE_OPTIONS = [
  "FONASA Tramo A",
  "FONASA Tramo B",
  "FONASA Tramo C",
  "FONASA Tramo D",
  "ISAPRE",
  "Particular / Sin previsión",
]

const GOAL_CARDS = [
  { value: "medico_general", icon: "🩺", label: "Médico general" },
  { value: "salud_mental", icon: "🧠", label: "Salud mental" },
  { value: "control_cronico", icon: "💊", label: "Control enfermedad crónica" },
  { value: "segunda_opinion", icon: "🔍", label: "Segunda opinión" },
  { value: "nutricion", icon: "🥗", label: "Nutrición y bienestar" },
  { value: "otro", icon: "✨", label: "Otro" },
]

// ─── Animation Variants ───────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 280 : -280, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 280 : -280, opacity: 0 }),
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i === current
              ? "w-8 bg-teal-600"
              : i < current
              ? "w-2 bg-teal-600/50"
              : "w-2 bg-slate-200 dark:bg-slate-700"
          )}
        />
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PatientOnboardingPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [firstName, setFirstName] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [form, setForm] = useState<FormData>({
    avatarUrl: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    nationalId: "",
    healthInsurance: "",
    allergies: "",
    chronicDiseases: "",
    currentMedications: "",
    patientGoal: "",
  })

  const merge = (partial: Partial<FormData>) => setForm((f) => ({ ...f, ...partial }))

  // Load existing profile data
  useEffect(() => {
    if (!user?.id) return
    supabase
      .from("profiles")
      .select("first_name, avatar_url, phone, gender, date_of_birth")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) return
        if (data.first_name) setFirstName(data.first_name)
        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url)
          merge({ avatarUrl: data.avatar_url })
        }
        if (data.phone) merge({ phone: data.phone })
        if (data.gender) merge({ gender: data.gender as Gender })
        if (data.date_of_birth) merge({ dateOfBirth: data.date_of_birth })
      })
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const isValidRut = (rut: string) => /^\d{7,8}-[\dkK]$/.test(rut.trim())

  const maxDobDate = (() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 5)
    return d.toISOString().split("T")[0]
  })()

  const isValidDOB = (dob: string) => {
    if (!dob) return false
    const d = new Date(`${dob}T00:00:00`)
    const today = new Date()
    let age = today.getFullYear() - d.getFullYear()
    const m = today.getMonth() - d.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
    return age >= 5
  }

  // ─── Navigation ──────────────────────────────────────────────────────────

  const goNext = () => { setDirection(1); setStep((s) => s + 1) }
  const goBack = () => { setDirection(-1); setStep((s) => s - 1) }

  // ─── Step validation ─────────────────────────────────────────────────────

  const step2Valid = form.phone.trim().length >= 8 && form.gender !== "" && isValidDOB(form.dateOfBirth)
  const step3Valid = isValidRut(form.nationalId) && form.healthInsurance !== ""
  const step5Valid = form.patientGoal !== ""

  // ─── Avatar ──────────────────────────────────────────────────────────────

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("Solo se permiten imágenes"); return }
    if (file.size > 5 * 1024 * 1024) { toast.error("La imagen no debe superar 5MB"); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const uploadAvatar = async (): Promise<string> => {
    if (!avatarFile || !user?.id) return form.avatarUrl
    setUploadingAvatar(true)
    try {
      const ext = avatarFile.name.split(".").pop()
      const path = `${user.id}/avatar_${Date.now()}.${ext}`
      await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true })
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)
      return publicUrl
    } catch {
      toast.error("Error al subir la foto")
      return form.avatarUrl
    } finally {
      setUploadingAvatar(false)
    }
  }

  // ─── Submit ──────────────────────────────────────────────────────────────

  const handleFinish = async () => {
    if (!user?.id) return
    setSubmitting(true)
    try {
      const avatarUrl = await uploadAvatar()
      const res = await fetch("/api/onboarding/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarUrl,
          phone: form.phone.trim(),
          gender: form.gender,
          dateOfBirth: form.dateOfBirth,
          nationalId: form.nationalId.trim(),
          healthInsurance: form.healthInsurance,
          allergies: form.allergies.trim() || null,
          chronicDiseases: form.chronicDiseases.trim() || null,
          currentMedications: form.currentMedications.trim() || null,
          patientGoal: form.patientGoal,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Error al guardar")
      setShowSuccess(true)
      setTimeout(() => { router.refresh(); router.push("/dashboard/patient") }, 2000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar. Intenta nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Success screen ───────────────────────────────────────────────────────

  if (showSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mx-auto shadow-xl shadow-teal-500/30">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            ¡Todo listo{firstName ? `, ${firstName}` : ""}!
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Tu perfil está configurado. Redirigiendo...</p>
          <Loader2 className="h-5 w-5 animate-spin text-teal-600 mx-auto" />
        </motion.div>
      </div>
    )
  }

  if (authLoading) return null

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 py-8">
      <div className="w-full max-w-lg">
        <StepIndicator current={step} total={5} />

        <AnimatePresence custom={direction} mode="wait">

          {/* ── Step 0: Bienvenida ─────────────────────────────────────── */}
          {step === 0 && (
            <motion.div key="s0" custom={direction} variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out" style={{ width: "20%" }} />
              </div>
              <div className="p-8 space-y-6">
              <div className="text-center space-y-3">
                <div className="text-6xl mb-2">🏥</div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Hola{firstName ? `, ${firstName}` : ""}!
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Bienvenido/a a NUREA. Solo necesitamos algunos datos para personalizar tu experiencia.
                  Toma menos de 3 minutos.
                </p>
              </div>
              <div className="space-y-2.5">
                {["Perfil médico seguro", "Acceso a especialistas", "Historial en un lugar"].map((item) => (
                  <div key={item} className="flex items-center gap-3 py-1">
                    <div className="h-5 w-5 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
              <Button onClick={goNext}
                className="group relative overflow-hidden w-full h-12 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-teal-500/20">
                <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">Empezar</span>
                <i className="absolute right-1 top-1 bottom-1 rounded-lg z-10 grid w-1/4 place-items-center transition-all duration-500 bg-white/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
                  <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                </i>
              </Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Tu Perfil ──────────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="s1" custom={direction} variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out" style={{ width: "40%" }} />
              </div>
              <div className="p-8 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">Paso 2 de 5</p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tu Perfil</h2>
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative w-24 h-24 rounded-full overflow-hidden border-4 transition-all duration-300",
                    avatarPreview ? "border-solid border-teal-500" : "border-dashed border-slate-200 dark:border-slate-700",
                    "hover:border-teal-400"
                  )}>
                  {avatarPreview
                    ? <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
                    : <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><User className="h-10 w-10 text-slate-400" /></div>
                  }
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
                  <Upload className="h-3.5 w-3.5" />
                  {avatarPreview ? "Cambiar foto" : "Subir foto (opcional)"}
                </button>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <div className="flex">
                  <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 px-4 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300">
                    🇨🇱 +56
                  </div>
                  <Input type="tel" placeholder="9 XXXX XXXX" value={form.phone}
                    onChange={(e) => merge({ phone: e.target.value })}
                    className="rounded-l-none rounded-r-xl border-slate-200 dark:border-slate-700 focus-visible:ring-teal-500" />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Género <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {([{ value: "M", label: "Masculino" }, { value: "F", label: "Femenino" }, { value: "other", label: "Prefiero no especificar" }] as { value: Gender; label: string }[]).map((g) => (
                    <button key={g.value} type="button" onClick={() => merge({ gender: g.value })}
                      className={cn(
                        "py-3 rounded-xl text-sm font-medium border transition-all duration-200",
                        form.gender === g.value
                          ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/20"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400"
                      )}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date of birth */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Fecha de nacimiento <span className="text-red-500">*</span>
                </Label>
                <Input type="date" max={maxDobDate} value={form.dateOfBirth}
                  onChange={(e) => merge({ dateOfBirth: e.target.value })}
                  className="border-slate-200 dark:border-slate-700 focus-visible:ring-teal-500" />
                {form.dateOfBirth && !isValidDOB(form.dateOfBirth) && (
                  <p className="text-xs text-red-500">Debes tener más de 5 años</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={goBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Anterior
                </button>
                <Button onClick={goNext} disabled={!step2Valid}
                  className="group relative overflow-hidden h-11 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold shadow-md disabled:opacity-50">
                  <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">Continuar</span>
                  <i className="absolute right-1 top-1 bottom-1 rounded-lg z-10 grid w-1/4 place-items-center transition-all duration-500 bg-white/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
                    <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                  </i>
                </Button>
              </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Identificación ────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="s2" custom={direction} variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out" style={{ width: "60%" }} />
              </div>
              <div className="p-8 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">Paso 3 de 5</p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Identificación y Previsión</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Necesitamos estos datos para bonos y recetas</p>
              </div>

              {/* RUT */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  RUT <span className="text-red-500">*</span>
                </Label>
                <Input type="text" placeholder="12345678-9" value={form.nationalId}
                  onChange={(e) => merge({ nationalId: e.target.value })}
                  className="border-slate-200 dark:border-slate-700 focus-visible:ring-teal-500" />
                <p className="text-xs text-slate-400">Formato: 12345678-9 (sin puntos, con guión)</p>
                {form.nationalId && !isValidRut(form.nationalId) && (
                  <p className="text-xs text-red-500">RUT inválido. Ej: 12345678-9</p>
                )}
              </div>

              {/* Health insurance */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Previsión de salud <span className="text-red-500">*</span>
                </Label>
                <Select value={form.healthInsurance} onValueChange={(v) => merge({ healthInsurance: v })}>
                  <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:ring-teal-500">
                    <SelectValue placeholder="Selecciona tu previsión" />
                  </SelectTrigger>
                  <SelectContent>
                    {HEALTH_INSURANCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={goBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Anterior
                </button>
                <Button onClick={goNext} disabled={!step3Valid}
                  className="group relative overflow-hidden h-11 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold shadow-md disabled:opacity-50">
                  <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">Continuar</span>
                  <i className="absolute right-1 top-1 bottom-1 rounded-lg z-10 grid w-1/4 place-items-center transition-all duration-500 bg-white/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
                    <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                  </i>
                </Button>
              </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Tu Salud ──────────────────────────────────────── */}
          {step === 3 && (
            <motion.div key="s3" custom={direction} variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out" style={{ width: "80%" }} />
              </div>
              <div className="p-8 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">Paso 4 de 5</p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tu Salud</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Toda la información es opcional</p>
              </div>

              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200/60 dark:border-teal-800/40 rounded-xl px-4 py-3 text-xs text-teal-700 dark:text-teal-300">
                Puedes completar esto después desde tu perfil
              </div>

              <div className="space-y-5">
                {[
                  { key: "allergies" as const, label: "Alergias", placeholder: "Ej: Penicilina, Aspirina... o 'Ninguna'" },
                  { key: "chronicDiseases" as const, label: "Enfermedades crónicas", placeholder: "Ej: Diabetes tipo 2, Hipertensión... o 'Ninguna'" },
                  { key: "currentMedications" as const, label: "Medicamentos actuales", placeholder: "Ej: Metformina 500mg... o 'Ninguna'" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</Label>
                    <Textarea placeholder={placeholder} value={form[key]}
                      onChange={(e) => merge({ [key]: e.target.value })}
                      className="resize-none border-slate-200 dark:border-slate-700 focus-visible:ring-teal-500" rows={2} />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={goBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Anterior
                </button>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={goNext} className="text-sm text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                    Saltar →
                  </button>
                  <Button onClick={goNext}
                    className="group relative overflow-hidden h-11 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold shadow-md">
                    <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">Continuar</span>
                    <i className="absolute right-1 top-1 bottom-1 rounded-lg z-10 grid w-1/4 place-items-center transition-all duration-500 bg-white/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
                      <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                    </i>
                  </Button>
                </div>
              </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Tu Objetivo ───────────────────────────────────── */}
          {step === 4 && (
            <motion.div key="s4" custom={direction} variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out" style={{ width: "100%" }} />
              </div>
              <div className="p-8 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">Paso 5 de 5</p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tu Objetivo</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">¿Para qué usas NUREA principalmente?</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {GOAL_CARDS.map((g) => (
                  <button key={g.value} type="button" onClick={() => merge({ patientGoal: g.value })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-center",
                      form.patientGoal === g.value
                        ? "border-teal-600 bg-teal-50 dark:bg-teal-900/30 shadow-md shadow-teal-500/15"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-700"
                    )}>
                    <span className="text-3xl">{g.icon}</span>
                    <span className={cn("text-sm font-medium",
                      form.patientGoal === g.value
                        ? "text-teal-700 dark:text-teal-300"
                        : "text-slate-700 dark:text-slate-300"
                    )}>
                      {g.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={goBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Anterior
                </button>
                <Button onClick={handleFinish} disabled={!step5Valid || submitting || uploadingAvatar}
                  className="group relative overflow-hidden h-11 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold shadow-md disabled:opacity-50">
                  {submitting || uploadingAvatar ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Guardando...</>
                  ) : (
                    <>
                      <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">Finalizar</span>
                      <i className="absolute right-1 top-1 bottom-1 rounded-lg z-10 grid w-1/4 place-items-center transition-all duration-500 bg-white/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
                        <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                      </i>
                    </>
                  )}
                </Button>
              </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
