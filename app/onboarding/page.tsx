"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Bird, Calendar, CheckCircle2, Loader2, Phone, User } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { SmokeyBackground } from "@/components/smokey-login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/lib/auth/utils"
import { createClient } from "@/lib/supabase/client"
import { AvatarDropzone } from "@/components/onboarding/AvatarDropzone"

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 320 : -320,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 320 : -320,
    opacity: 0,
    scale: 0.98,
  }),
}

function maxAgeDateString(ageYears: number) {
  const d = new Date()
  d.setFullYear(d.getFullYear() - ageYears)
  return d.toISOString().split("T")[0]
}

function minAgeDateString(ageYears: number) {
  const d = new Date()
  d.setFullYear(d.getFullYear() - ageYears)
  return d.toISOString().split("T")[0]
}

const sexSchema = z.enum(["M", "F"])
const patientGoalSchema = z.enum(["consulta_medica", "psicologia", "ver_examenes", "otra"])

const dateOfBirth18PlusSchema = z
  .string()
  .min(1, "Fecha requerida")
  .refine((v) => {
    const d = new Date(`${v}T00:00:00`)
    return !Number.isNaN(d.getTime())
  }, "Fecha inválida")
  .refine((v) => {
    const d = new Date(`${v}T00:00:00`)
    const today = new Date()
    let age = today.getFullYear() - d.getFullYear()
    const monthDiff = today.getMonth() - d.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) age -= 1
    return age >= 18
  }, "Debes ser mayor de 18 años")

const patientWizardSchema = z
  .object({
    dateOfBirth: dateOfBirth18PlusSchema,
    gender: sexSchema,
    phone: z.string().min(1, "Teléfono requerido"),

    allergiesEnabled: z.boolean(),
    allergiesText: z.string().nullable().optional(),
    chronicEnabled: z.boolean(),
    chronicText: z.string().nullable().optional(),
    currentMedications: z.string().min(1, "Medicamentos requeridos"),

    patientGoal: patientGoalSchema,
  })
  .superRefine((val, ctx) => {
    if (val.allergiesEnabled && !val.allergiesText?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indica tus alergias",
        path: ["allergiesText"],
      })
    }
    if (val.chronicEnabled && !val.chronicText?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indica tus enfermedades crónicas",
        path: ["chronicText"],
      })
    }
  })

const consultationTypeSchema = z.enum(["online", "in-person", "both"])
const nuraAiToneSchema = z.enum(["clinico_tecnico", "empatico_cercano", "directo_resumido"])

const professionalWizardSchema = z.object({
  specialtyPrincipalId: z.string().uuid(),
  specialtySubId: z.string().uuid(),
  registrationNumber: z.string().min(1, "Registro médico requerido"),

  yearsExperience: z.number().int().min(0, "Años inválidos"),
  consultationType: consultationTypeSchema,
  professionalSlogan: z.string().min(1, "Frase o lema requerido"),

  nuraAiTone: nuraAiToneSchema,
})

type PatientWizardValues = z.infer<typeof patientWizardSchema>
type ProfessionalWizardValues = z.infer<typeof professionalWizardSchema>

type PatientInitial = {
  date_of_birth: string | null
  gender: "M" | "F" | null
  phone: string | null
  allergies: string | null
  chronic_diseases: string | null
  current_medications: string | null
  patient_goal: string | null
  avatar_url: string | null
}

type ProfessionalInitial = {
  specialty_id: string | null
  registration_number: string | null
  years_experience: number | null
  consultation_type: "online" | "in-person" | "both" | null
  professional_slogan: string | null
  nura_ai_tone: "clinico_tecnico" | "empatico_cercano" | "directo_resumido" | null
  avatar_url: string | null
}

async function uploadAvatarToSupabase(file: File, role: UserRole): Promise<string> {
  const endpoint = role === "professional" ? "/api/professional/upload-avatar" : "/api/user/upload-avatar"
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(endpoint, { method: "POST", body: formData })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || data.error || "Error al subir el avatar")
  }
  return data.avatarUrl as string
}

function BuhitoNuraLoader({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.08, 1] }}
          transition={{ rotate: { duration: 4, repeat: Infinity, ease: "linear" }, scale: { duration: 1.6, repeat: Infinity } }}
          className="w-24 h-24 rounded-full border-2 border-dashed border-teal-500/40"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
            <Bird className="w-10 h-10 text-teal-500" />
          </motion.div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-2 text-teal-700 text-xs font-mono">
          <Loader2 className="w-3 h-3 animate-spin" />
          STREAMS_SYNCING
        </div>
        <p className="text-sm text-slate-700">{message}</p>
      </div>
    </div>
  )
}

function PatientWizard({
  initial,
  onDone,
}: {
  initial: PatientInitial
  onDone: () => void
}) {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatar_url)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const steps = useMemo(
    () => [
      isSpanish ? "Identidad Básica" : "Basic Identity",
      isSpanish ? "Perfil Clínico" : "Clinical Profile",
      isSpanish ? "Foto de Perfil" : "Profile Photo",
      isSpanish ? "Objetivo" : "Objective",
    ],
    [isSpanish],
  )

  const form = useForm<PatientWizardValues>({
    resolver: zodResolver(patientWizardSchema),
    mode: "onChange",
    defaultValues: {
      dateOfBirth: initial.date_of_birth || "",
      gender: initial.gender || "M",
      phone: initial.phone || "",

      allergiesEnabled: !!initial.allergies,
      allergiesText: initial.allergies || "",
      chronicEnabled: !!initial.chronic_diseases,
      chronicText: initial.chronic_diseases || "",
      currentMedications: initial.current_medications || "",
      patientGoal: (initial.patient_goal as any) || "consulta_medica",
    },
  })

  const allergiesEnabled = form.watch("allergiesEnabled")
  const chronicEnabled = form.watch("chronicEnabled")

  const maxDate = useMemo(() => maxAgeDateString(18), [])
  const minDate = useMemo(() => minAgeDateString(100), [])

  const goNext = async () => {
    setError(null)
    if (submitting) return

    if (step === 0) {
      const ok = await form.trigger(["dateOfBirth", "gender", "phone"])
      if (!ok) return
      setDirection(1)
      setStep(1)
      return
    }

    if (step === 1) {
      const ok = await form.trigger(["allergiesEnabled", "allergiesText", "chronicEnabled", "chronicText", "currentMedications"])
      if (!ok) return
      setDirection(1)
      setStep(2)
      return
    }

    if (step === 2) {
      if (!avatarFile && !avatarUrl) {
        setError(isSpanish ? "Por favor sube una foto de perfil" : "Please upload a profile photo")
        return
      }
      setDirection(1)
      setStep(3)
      return
    }
  }

  const handleFinalSubmit = async (values: PatientWizardValues) => {
    setError(null)
    setSubmitting(true)
    try {
      let finalAvatarUrl = avatarUrl
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatarToSupabase(avatarFile, "patient")
        setAvatarUrl(finalAvatarUrl)
      }

      if (!finalAvatarUrl) {
        throw new Error(isSpanish ? "Falta la foto de perfil" : "Missing profile photo")
      }

      const payload = {
        avatarUrl: finalAvatarUrl,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        phone: values.phone.trim(),

        allergiesEnabled: values.allergiesEnabled,
        allergiesText: values.allergiesEnabled ? values.allergiesText?.trim() || null : null,
        chronicEnabled: values.chronicEnabled,
        chronicText: values.chronicEnabled ? values.chronicText?.trim() || null : null,

        currentMedications: values.currentMedications.trim(),
        patientGoal: values.patientGoal,
      }

      const res = await fetch("/api/onboarding/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || data?.error || (isSpanish ? "No pudimos guardar tu perfil" : "Could not save profile"))
      }

      router.push("/dashboard/patient")
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : (isSpanish ? "Error al guardar" : "Error saving"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    if (submitting) return
    setDirection(-1)
    setStep((s) => Math.max(0, s - 1))
    setError(null)
  }

  const handleSubmit = form.handleSubmit(handleFinalSubmit)

  return (
    <div className="relative">
      {submitting ? (
        <div className="absolute inset-0 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <BuhitoNuraLoader message={isSpanish ? "Preparando tu perfil..." : "Preparing your profile..."} />
        </div>
      ) : null}

      <div className="space-y-6 relative">
        {/* Progress UI */}
        <div className="space-y-3">
          <Progress value={((step + 1) / steps.length) * 100} className="h-2" />
          <div className="flex items-start justify-between gap-3">
            {steps.map((label, i) => (
              <div key={label} className="flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mx-auto ring-1 transition-colors",
                    i < step ? "bg-teal-600 text-white ring-teal-600/40" : i === step ? "bg-teal-600 text-white ring-teal-600/40" : "bg-slate-100 text-slate-500 ring-slate-200",
                  )}
                >
                  {i < step ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                </div>
                <p className={cn("mt-2 text-[11px] text-center", i === step ? "text-teal-700 font-semibold" : "text-slate-500")}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            {step === 0 ? (
              <form className="space-y-5">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Calendar className="w-4 h-4" />
                    {isSpanish ? "Fecha de Nacimiento" : "Date of Birth"}
                    <span className="text-teal-600">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.watch("dateOfBirth")}
                    onChange={(e) => form.setValue("dateOfBirth", e.target.value, { shouldValidate: true })}
                    min={minDate}
                    max={maxDate}
                    disabled={submitting}
                  />
                  {form.formState.errors.dateOfBirth ? (
                    <p className="text-xs text-red-600">{form.formState.errors.dateOfBirth.message}</p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <User className="w-4 h-4" />
                      {isSpanish ? "Sexo biológico" : "Biological Sex"}
                      <span className="text-teal-600">*</span>
                    </Label>
                    <Select
                      value={form.watch("gender")}
                      onValueChange={(v) => form.setValue("gender", v as any, { shouldValidate: true })}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder={isSpanish ? "Selecciona" : "Select"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">{isSpanish ? "Masculino" : "Male"}</SelectItem>
                        <SelectItem value="F">{isSpanish ? "Femenino" : "Female"}</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.gender ? (
                      <p className="text-xs text-red-600">{form.formState.errors.gender.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Phone className="w-4 h-4" />
                      {isSpanish ? "Teléfono de contacto" : "Contact Phone"}
                      <span className="text-teal-600">*</span>
                    </Label>
                    <Input
                      type="tel"
                      value={form.watch("phone")}
                      onChange={(e) => form.setValue("phone", e.target.value, { shouldValidate: true })}
                      placeholder={isSpanish ? "+56 9 1234 5678" : "+1 234 567 8900"}
                      disabled={submitting}
                    />
                    {form.formState.errors.phone ? <p className="text-xs text-red-600">{form.formState.errors.phone.message}</p> : null}
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  {isSpanish ? "Debes ser mayor de 18 años para usar NUREA." : "You must be at least 18 years old."}
                </p>
              </form>
            ) : null}

            {step === 1 ? (
              <form className="space-y-5">
                {/* Allergies */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <Label className="text-sm font-semibold text-slate-700">
                      {isSpanish ? "¿Alergias conocidas?" : "Known allergies?"}
                      <span className="text-teal-600">*</span>
                    </Label>
                    <Switch
                      checked={allergiesEnabled}
                      onCheckedChange={(checked) => {
                        form.setValue("allergiesEnabled", checked, { shouldValidate: true })
                        if (!checked) form.setValue("allergiesText", "", { shouldValidate: false })
                      }}
                    />
                  </div>
                  {allergiesEnabled ? (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600">{isSpanish ? "¿Cuáles?" : "Which ones?"}</Label>
                      <Input
                        value={form.watch("allergiesText") ?? ""}
                        onChange={(e) => form.setValue("allergiesText", e.target.value, { shouldValidate: true })}
                        placeholder={isSpanish ? "Ej: Penicilina, mariscos..." : "E.g. Penicillin, seafood..."}
                        disabled={submitting}
                      />
                      {form.formState.errors.allergiesText ? (
                        <p className="text-xs text-red-600">{form.formState.errors.allergiesText.message}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {/* Chronic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <Label className="text-sm font-semibold text-slate-700">
                      {isSpanish ? "¿Enfermedades crónicas?" : "Chronic diseases?"}
                      <span className="text-teal-600">*</span>
                    </Label>
                    <Switch
                      checked={chronicEnabled}
                      onCheckedChange={(checked) => {
                        form.setValue("chronicEnabled", checked, { shouldValidate: true })
                        if (!checked) form.setValue("chronicText", "", { shouldValidate: false })
                      }}
                    />
                  </div>
                  {chronicEnabled ? (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600">{isSpanish ? "¿Cuáles?" : "Which ones?"}</Label>
                      <Input
                        value={form.watch("chronicText") ?? ""}
                        onChange={(e) => form.setValue("chronicText", e.target.value, { shouldValidate: true })}
                        placeholder={isSpanish ? "Ej: Diabetes, hipertensión..." : "E.g. Diabetes, hypertension..."}
                        disabled={submitting}
                      />
                      {form.formState.errors.chronicText ? (
                        <p className="text-xs text-red-600">{form.formState.errors.chronicText.message}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {/* Current medications */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    {isSpanish ? "Medicamentos actuales" : "Current medications"}
                    <span className="text-teal-600">*</span>
                  </Label>
                  <Textarea
                    value={form.watch("currentMedications")}
                    onChange={(e) => form.setValue("currentMedications", e.target.value, { shouldValidate: true })}
                    placeholder={isSpanish ? "Escribe los medicamentos que estás usando actualmente..." : "List your current medications..."}
                    disabled={submitting}
                    rows={4}
                    className="bg-white"
                  />
                  {form.formState.errors.currentMedications ? (
                    <p className="text-xs text-red-600">{form.formState.errors.currentMedications.message}</p>
                  ) : null}
                </div>
              </form>
            ) : null}

            {step === 2 ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    {isSpanish ? "Foto de Perfil" : "Profile Photo"} <span className="text-teal-600">*</span>
                  </Label>
                  <p className="text-xs text-slate-500">
                    {isSpanish
                      ? "Por favor sube una foto donde se vea claramente tu rostro. Esta foto será visible en tu perfil."
                      : "Upload a clear photo where your face is visible."}
                  </p>
                </div>

                <AvatarDropzone
                  avatarUrl={avatarUrl}
                  onFileChange={(f) => setAvatarFile(f)}
                  disabled={submitting}
                />
              </div>
            ) : null}

            {step === 3 ? (
              <form className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    {isSpanish ? "¿Qué buscas hoy?" : "What are you looking for today?"} <span className="text-teal-600">*</span>
                  </Label>
                </div>

                <Select
                  value={form.watch("patientGoal")}
                  onValueChange={(v) => form.setValue("patientGoal", v as any, { shouldValidate: true })}
                >
                  <SelectTrigger className="bg-white h-11">
                    <SelectValue placeholder={isSpanish ? "Selecciona una opción" : "Select an option"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta_medica">{isSpanish ? "Consulta Médica" : "Medical Consultation"}</SelectItem>
                    <SelectItem value="psicologia">{isSpanish ? "Psicología" : "Psychology"}</SelectItem>
                    <SelectItem value="ver_examenes">{isSpanish ? "Ver Exámenes" : "Review Exams"}</SelectItem>
                    <SelectItem value="otra">{isSpanish ? "Otro" : "Other"}</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.patientGoal ? (
                  <p className="text-xs text-red-600">{form.formState.errors.patientGoal.message}</p>
                ) : null}

                <div className="rounded-2xl bg-teal-50 p-4 border border-teal-200/60">
                  <p className="text-sm font-semibold text-teal-900">
                    {isSpanish ? "Listo. Ahora guardaremos tu perfil." : "All set. We'll save your profile now."}
                  </p>
                  <p className="text-xs text-teal-800/70 mt-1">
                    {isSpanish ? "No cierres la página mientras se completa el proceso." : "Don't close the page while we finish."}
                  </p>
                </div>
              </form>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {/* Error */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        ) : null}

        {/* Navigation */}
        <div className="flex justify-between gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 0 || submitting}
            className="bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            {isSpanish ? "Atrás" : "Back"}
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              onClick={goNext}
              disabled={submitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8"
            >
              {isSpanish ? "Siguiente" : "Next"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => handleSubmit()}
              disabled={submitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSpanish ? "Guardando..." : "Saving..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isSpanish ? "Completar y Continuar" : "Complete & Continue"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function ProfessionalWizard({
  initial,
  onDone,
}: {
  initial: ProfessionalInitial
  onDone: () => void
}) {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatar_url)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [specialties, setSpecialties] = useState<Array<{ id: string; parent_id: string | null; name_es: string }>>([])

  const steps = useMemo(
    () => [
      isSpanish ? "Identidad Médica" : "Medical Identity",
      isSpanish ? "Operación de la Consulta" : "Consultation Setup",
      isSpanish ? "Foto de Perfil" : "Profile Photo",
      isSpanish ? "Nura AI" : "Nura AI Setup",
    ],
    [isSpanish],
  )

  const form = useForm<ProfessionalWizardValues>({
    resolver: zodResolver(professionalWizardSchema),
    mode: "onChange",
    defaultValues: {
      specialtyPrincipalId: "",
      specialtySubId: initial.specialty_id || "",
      registrationNumber: initial.registration_number || "",
      yearsExperience: initial.years_experience ?? 0,
      consultationType: initial.consultation_type || "both",
      professionalSlogan: initial.professional_slogan || "",
      nuraAiTone: initial.nura_ai_tone || "clinico_tecnico",
    },
  })

  const specialtySubId = form.watch("specialtySubId")
  const specialtyPrincipalId = form.watch("specialtyPrincipalId")

  useEffect(() => {
    let mounted = true
    const loadSpecialties = async () => {
      try {
        const res = await fetch("/api/specialties?activeOnly=true")
        const data = await res.json()
        if (!res.ok) return
        if (!mounted) return
        setSpecialties(data || [])
      } catch {
        // ignore
      }
    }
    loadSpecialties()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!specialties.length) return
    if (!specialtySubId) return
    const sub = specialties.find((s) => s.id === specialtySubId)
    if (sub?.parent_id) {
      form.setValue("specialtyPrincipalId", sub.parent_id, { shouldValidate: true })
    }
  }, [specialties, specialtySubId, form])

  const principalOptions = useMemo(() => specialties.filter((s) => !s.parent_id), [specialties])
  const subOptions = useMemo(
    () => specialties.filter((s) => s.parent_id === specialtyPrincipalId),
    [specialties, specialtyPrincipalId],
  )

  const goNext = async () => {
    setError(null)
    if (submitting) return

    if (step === 0) {
      const ok = await form.trigger(["specialtyPrincipalId", "specialtySubId", "registrationNumber"])
      if (!ok) return
      setDirection(1)
      setStep(1)
      return
    }

    if (step === 1) {
      const ok = await form.trigger(["yearsExperience", "consultationType", "professionalSlogan"])
      if (!ok) return
      setDirection(1)
      setStep(2)
      return
    }

    if (step === 2) {
      if (!avatarFile && !avatarUrl) {
        setError(isSpanish ? "Por favor sube una foto de perfil" : "Please upload a profile photo")
        return
      }
      setDirection(1)
      setStep(3)
      return
    }
  }

  const handleFinalSubmit = async (values: ProfessionalWizardValues) => {
    setError(null)
    setSubmitting(true)
    try {
      let finalAvatarUrl = avatarUrl
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatarToSupabase(avatarFile, "professional")
        setAvatarUrl(finalAvatarUrl)
      }
      if (!finalAvatarUrl) throw new Error(isSpanish ? "Falta la foto de perfil" : "Missing profile photo")

      const payload = {
        avatarUrl: finalAvatarUrl,
        specialtyPrincipalId: values.specialtyPrincipalId,
        specialtySubId: values.specialtySubId,
        registrationNumber: values.registrationNumber,
        yearsExperience: values.yearsExperience,
        consultationType: values.consultationType,
        professionalSlogan: values.professionalSlogan,
        nuraAiTone: values.nuraAiTone,
      }

      const res = await fetch("/api/onboarding/professional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || data?.error || (isSpanish ? "No pudimos guardar tu perfil" : "Could not save profile"))
      }

      router.push("/dashboard/professional")
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : (isSpanish ? "Error al guardar" : "Error saving"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    if (submitting) return
    setDirection(-1)
    setStep((s) => Math.max(0, s - 1))
    setError(null)
  }

  const handleSubmit = form.handleSubmit(handleFinalSubmit)

  return (
    <div className="relative">
      {submitting ? (
        <div className="absolute inset-0 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <BuhitoNuraLoader message={isSpanish ? "Configurando tu perfil profesional..." : "Configuring your professional profile..."} />
        </div>
      ) : null}

      <div className="space-y-6 relative">
        <div className="space-y-3">
          <Progress value={((step + 1) / steps.length) * 100} className="h-2" />
          <div className="flex items-start justify-between gap-3">
            {steps.map((label, i) => (
              <div key={label} className="flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mx-auto ring-1 transition-colors",
                    i < step ? "bg-teal-600 text-white ring-teal-600/40" : i === step ? "bg-teal-600 text-white ring-teal-600/40" : "bg-slate-100 text-slate-500 ring-slate-200",
                  )}
                >
                  {i < step ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                </div>
                <p className={cn("mt-2 text-[11px] text-center", i === step ? "text-teal-700 font-semibold" : "text-slate-500")}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            {step === 0 ? (
              <form className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    {isSpanish ? "Especialidad principal" : "Main Specialty"} <span className="text-teal-600">*</span>
                  </Label>
                  <Select
                    value={specialtyPrincipalId}
                    onValueChange={(v) => {
                      form.setValue("specialtyPrincipalId", v, { shouldValidate: true })
                      form.setValue("specialtySubId", "", { shouldValidate: true })
                    }}
                  >
                    <SelectTrigger className="bg-white h-11">
                      <SelectValue placeholder={isSpanish ? "Selecciona tu especialidad principal" : "Select main specialty"} />
                    </SelectTrigger>
                    <SelectContent>
                      {principalOptions.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name_es}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.specialtyPrincipalId ? (
                    <p className="text-xs text-red-600">{form.formState.errors.specialtyPrincipalId.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    {isSpanish ? "Sub-especialidad" : "Sub-specialty"} <span className="text-teal-600">*</span>
                  </Label>
                  <Select
                    value={specialtySubId}
                    onValueChange={(v) => form.setValue("specialtySubId", v, { shouldValidate: true })}
                    disabled={!subOptions.length}
                  >
                    <SelectTrigger className="bg-white h-11">
                      <SelectValue placeholder={isSpanish ? "Selecciona la sub-especialidad" : "Select sub-specialty"} />
                    </SelectTrigger>
                    <SelectContent>
                      {subOptions.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name_es}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.specialtySubId ? (
                    <p className="text-xs text-red-600">{form.formState.errors.specialtySubId.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    {isSpanish ? "Nº de Registro Médico / RUT" : "Medical Registration / RUT"} <span className="text-teal-600">*</span>
                  </Label>
                  <Input
                    value={form.watch("registrationNumber")}
                    onChange={(e) => form.setValue("registrationNumber", e.target.value, { shouldValidate: true })}
                    placeholder={isSpanish ? "Ej: 12.345.678-9" : "E.g. 12.345.678-9"}
                    disabled={submitting}
                  />
                  {form.formState.errors.registrationNumber ? (
                    <p className="text-xs text-red-600">{form.formState.errors.registrationNumber.message}</p>
                  ) : null}
                </div>
              </form>
            ) : null}

            {step === 1 ? (
              <form className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      {isSpanish ? "Años de experiencia" : "Years of experience"} <span className="text-teal-600">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={String(form.watch("yearsExperience"))}
                      onChange={(e) => {
                        const num = Number(e.target.value)
                        form.setValue("yearsExperience", Number.isNaN(num) ? 0 : num, { shouldValidate: true })
                      }}
                      min={0}
                      disabled={submitting}
                      placeholder="0"
                      className="bg-white"
                    />
                    {form.formState.errors.yearsExperience ? (
                      <p className="text-xs text-red-600">{form.formState.errors.yearsExperience.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      {isSpanish ? "Modalidad de atención" : "Care modality"} <span className="text-teal-600">*</span>
                    </Label>
                    <Select
                      value={form.watch("consultationType")}
                      onValueChange={(v) => form.setValue("consultationType", v as any, { shouldValidate: true })}
                    >
                      <SelectTrigger className="bg-white h-11">
                        <SelectValue placeholder={isSpanish ? "Selecciona" : "Select"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-person">{isSpanish ? "Presencial" : "In-Person"}</SelectItem>
                        <SelectItem value="online">{isSpanish ? "Online" : "Online"}</SelectItem>
                        <SelectItem value="both">{isSpanish ? "Híbrido" : "Hybrid"}</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.consultationType ? (
                      <p className="text-xs text-red-600">{form.formState.errors.consultationType.message}</p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    {isSpanish ? "Frase o Lema Profesional" : "Professional slogan"} <span className="text-teal-600">*</span>
                  </Label>
                  <Input
                    value={form.watch("professionalSlogan")}
                    onChange={(e) => form.setValue("professionalSlogan", e.target.value, { shouldValidate: true })}
                    placeholder={isSpanish ? "Ej: Cuidar con precisión y cercanía" : "E.g. Care with precision and warmth"}
                    disabled={submitting}
                    className="bg-white"
                  />
                  {form.formState.errors.professionalSlogan ? (
                    <p className="text-xs text-red-600">{form.formState.errors.professionalSlogan.message}</p>
                  ) : null}
                </div>
              </form>
            ) : null}

            {step === 2 ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    {isSpanish ? "Foto de Perfil (Branding)" : "Profile Photo (Branding)"} <span className="text-teal-600">*</span>
                  </Label>
                </div>
                <AvatarDropzone
                  avatarUrl={avatarUrl}
                  onFileChange={(f) => setAvatarFile(f)}
                  disabled={submitting}
                  helpText={
                    isSpanish
                      ? "Sube una foto clara y profesional. Los perfiles con foto reciben un 70% más de reservas."
                      : "Upload a clear, professional photo. Profiles with photos receive 70% more bookings."
                  }
                />
              </div>
            ) : null}

            {step === 3 ? (
              <form className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    {isSpanish ? "¿Qué tono prefieres para tus informes automáticos?" : "What tone do you prefer for your automatic reports?"}{" "}
                    <span className="text-teal-600">*</span>
                  </Label>
                </div>

                <Select
                  value={form.watch("nuraAiTone")}
                  onValueChange={(v) => form.setValue("nuraAiTone", v as any, { shouldValidate: true })}
                >
                  <SelectTrigger className="bg-white h-11">
                    <SelectValue placeholder={isSpanish ? "Selecciona un tono" : "Select a tone"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinico_tecnico">{isSpanish ? "Clínico/Técnico" : "Clinical/Technical"}</SelectItem>
                    <SelectItem value="empatico_cercano">{isSpanish ? "Empático/Cercano" : "Empathetic/Warm"}</SelectItem>
                    <SelectItem value="directo_resumido">{isSpanish ? "Directo/Resumido" : "Direct/Concise"}</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.nuraAiTone ? (
                  <p className="text-xs text-red-600">{form.formState.errors.nuraAiTone.message}</p>
                ) : null}

                <div className="rounded-2xl bg-teal-50 p-4 border border-teal-200/60">
                  <p className="text-sm font-semibold text-teal-900">
                    {isSpanish ? "Perfecto. Guardaremos tu perfil ahora." : "Great. We'll save your profile now."}
                  </p>
                  <p className="text-xs text-teal-800/70 mt-1">
                    {isSpanish ? "La animación del Buhito Nura aparecerá mientras se completa el proceso." : "You'll see Buhito Nura while we save."}
                  </p>
                </div>
              </form>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        ) : null}

        <div className="flex justify-between gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 0 || submitting}
            className="bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            {isSpanish ? "Atrás" : "Back"}
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              onClick={goNext}
              disabled={submitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8"
            >
              {isSpanish ? "Siguiente" : "Next"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => handleSubmit()}
              disabled={submitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSpanish ? "Guardando..." : "Saving..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isSpanish ? "Completar y Continuar" : "Complete & Continue"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function OnboardingContent() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [role, setRole] = useState<UserRole | null>(null)
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false)
  const [initialPatient, setInitialPatient] = useState<PatientInitial | null>(null)
  const [initialProfessional, setInitialProfessional] = useState<ProfessionalInitial | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push("/login")
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user || authLoading) return

    const load = async () => {
      setLoading(true)
      try {
        const profileRes = await supabase
          .from("profiles")
          .select(
            "role,onboarding_completed, date_of_birth, phone, gender, avatar_url, allergies, chronic_diseases, current_medications, patient_goal",
          )
          .eq("id", user.id)
          .single()

        if (profileRes.error) {
          // If onboarding fields aren't present yet, do not hard-block.
          const fallback = await supabase
            .from("profiles")
            .select("role,onboarding_completed, date_of_birth, phone, gender, avatar_url")
            .eq("id", user.id)
            .single()

          if (fallback.error) throw fallback.error
          profileRes.data = fallback.data
        }

        const profile = profileRes.data as any

        const nextRole = (profile?.role as UserRole) || "patient"
        const nextComplete = !!profile?.onboarding_completed

        if (nextComplete) {
          const redirect = nextRole === "professional" ? "/dashboard/professional" : "/dashboard/patient"
          router.push(redirect)
          return
        }

        setRole(nextRole)
        setOnboardingComplete(nextComplete)

        setInitialPatient({
          date_of_birth: profile?.date_of_birth || null,
          gender: profile?.gender || null,
          phone: profile?.phone || null,
          allergies: profile?.allergies || null,
          chronic_diseases: profile?.chronic_diseases || null,
          current_medications: profile?.current_medications || null,
          patient_goal: profile?.patient_goal || null,
          avatar_url: profile?.avatar_url || null,
        })

        if (nextRole === "professional") {
          const profRes = await supabase
            .from("professionals")
            .select(
              "specialty_id, registration_number, years_experience, consultation_type, professional_slogan, nura_ai_tone",
            )
            .eq("id", user.id)
            .single()

          if (profRes.error) throw profRes.error

          setInitialProfessional({
            specialty_id: profRes.data?.specialty_id || null,
            registration_number: profRes.data?.registration_number || null,
            years_experience: profRes.data?.years_experience ?? null,
            consultation_type: profRes.data?.consultation_type || null,
            professional_slogan: profRes.data?.professional_slogan || profRes.data?.bio || null,
            nura_ai_tone: profRes.data?.nura_ai_tone || null,
            avatar_url: profile?.avatar_url || null,
          })
        }
      } catch (e) {
        // If something fails, keep the wizard accessible and default to patient.
        setRole("patient")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user, authLoading, supabase, router])

  const cardClass =
    "relative w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8"

  if (authLoading || loading) {
    return (
      <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <SmokeyBackground backdropBlurAmount="md" color="#14B8A6" />
        <div className="relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
        </div>
      </main>
    )
  }

  if (!role || onboardingComplete) {
    return (
      <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <SmokeyBackground backdropBlurAmount="md" color="#14B8A6" />
        <div className="relative z-10 text-slate-700 text-sm font-semibold">{isSpanish ? "Cargando..." : "Loading..."}</div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <SmokeyBackground backdropBlurAmount="md" color="#14B8A6" />
      <div className="relative z-10 w-full max-w-3xl">
        <div className={cardClass}>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {role === "professional"
                ? isSpanish
                  ? "Onboarding Profesional"
                  : "Professional Onboarding"
                : isSpanish
                  ? "Onboarding del Paciente"
                  : "Patient Onboarding"}
            </h1>
            <p className="text-sm text-slate-600">
              {isSpanish
                ? "Completa tu perfil al 100% para comenzar a usar NUREA."
                : "Complete your profile 100% to start using NUREA."}
            </p>
          </div>

          {role === "professional" && initialProfessional ? (
            <ProfessionalWizard
              initial={initialProfessional}
              onDone={() => {
                // no-op
              }}
            />
          ) : null}

          {role === "patient" && initialPatient ? (
            <PatientWizard
              initial={initialPatient}
              onDone={() => {
                // no-op
              }}
            />
          ) : null}
        </div>
      </div>
    </main>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
          <SmokeyBackground backdropBlurAmount="md" color="#14B8A6" />
          <div className="relative z-10 text-white">Cargando...</div>
        </main>
      }
    >
      <OnboardingContent />
    </Suspense>
  )
}
