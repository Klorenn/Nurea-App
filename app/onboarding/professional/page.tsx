"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Brain,
  Briefcase,
  Camera,
  CheckCircle2,
  ChevronRight,
  Crown,
  FileText,
  Info,
  Loader2,
  Stethoscope,
  Upload,
  User,
  Users,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type Gender = "M" | "F" | "other"
type ConsultationType = "online" | "in_person" | "both"
type NuraAiTone = "clinico_tecnico" | "empatico_cercano" | "directo_resumido" | "cercano_amigable"

interface Specialty { id: string; name_es: string; parent_id: string | null }

const PROFESSIONAL_TITLES = [
  { value: "Dr.", label: "Dr.", desc: "Médico" },
  { value: "Dra.", label: "Dra.", desc: "Médica" },
  { value: "Ps.", label: "Ps.", desc: "Psicólogo/a" },
  { value: "Nut.", label: "Nut.", desc: "Nutricionista" },
  { value: "Kines.", label: "Kines.", desc: "Kinesiólogo/a" },
  { value: "Fono.", label: "Fono.", desc: "Fonoaudiólogo/a" },
  { value: "Enf.", label: "Enf.", desc: "Enfermero/a" },
  { value: "TO.", label: "TO.", desc: "Terapeuta Ocupacional" },
  { value: "Otro", label: "Otro", desc: "Personalizado" },
]

interface FormData {
  avatarUrl: string
  phone: string
  showPhone: boolean
  professionalTitle: string
  gender: Gender | ""
  specialtyId: string
  specialtyParentId: string
  registrationNumber: string
  yearsExperience: string
  bio: string
  professionalSlogan: string
  consultationType: ConsultationType | ""
  onlinePrice: string
  inPersonPrice: string
  clinicAddress: string
  nuraAiTone: NuraAiTone | ""
  referralCode: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CONSULTATION_TYPES = [
  {
    value: "online" as ConsultationType,
    icon: "💻",
    label: "Online",
    desc: "Videollamada por Nurea",
    badge: "Más popular",
  },
  {
    value: "in_person" as ConsultationType,
    icon: "🏥",
    label: "Presencial",
    desc: "En tu consulta física",
    badge: null,
  },
  {
    value: "both" as ConsultationType,
    icon: "⚡",
    label: "Ambas modalidades",
    desc: "Máxima flexibilidad para tus pacientes",
    badge: "Recomendado",
  },
]

const AI_TONES = [
  {
    value: "clinico_tecnico" as NuraAiTone,
    icon: "🎩",
    label: "Clínico",
    desc: "Lenguaje técnico y preciso",
    example: '"El diagnóstico diferencial incluye..."',
  },
  {
    value: "empatico_cercano" as NuraAiTone,
    icon: "💚",
    label: "Empático",
    desc: "Cercano y comprensivo",
    example: '"Entiendo cómo te sientes, es normal..."',
  },
  {
    value: "directo_resumido" as NuraAiTone,
    icon: "🔬",
    label: "Directo",
    desc: "Conciso y basado en evidencia",
    example: '"En resumen: 3 puntos clave para tu caso."',
  },
  {
    value: "cercano_amigable" as NuraAiTone,
    icon: "😊",
    label: "Amigable",
    desc: "Cálido y accesible",
    example: '"¡Hola! Revisé tus resultados y te cuento..."',
  },
]

const STEP_DEFS = [
  { label: "Bienvenida", icon: Users },
  { label: "Tu foto", icon: Camera },
  { label: "Especialidad", icon: Stethoscope },
  { label: "Tu perfil", icon: FileText },
  { label: "Consulta", icon: Briefcase },
  { label: "IA & Finalizar", icon: Brain },
]

// ─── Animation Variants ───────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 260 : -260, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 260 : -260, opacity: 0 }),
}

// ─── Sidebar Step Nav ─────────────────────────────────────────────────────────

function StepSidebar({ current, total, completedUpTo }: { current: number; total: number; completedUpTo: number }) {
  return (
    <aside className="hidden lg:flex flex-col gap-1 w-52 shrink-0 pt-2">
      {STEP_DEFS.map((step, i) => {
        const done = i < completedUpTo
        const active = i === current
        const Icon = step.icon
        return (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              active
                ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                : done
                ? "text-slate-500 dark:text-slate-400"
                : "text-slate-400 dark:text-slate-600"
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
              active
                ? "bg-teal-600 text-white shadow-md shadow-teal-500/30"
                : done
                ? "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            )}>
              {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
            </div>
            <span className={active ? "text-teal-700 dark:text-teal-300" : ""}>{step.label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500" />}
          </div>
        )
      })}

      <div className="mt-auto pt-8 px-3">
        <div className="text-xs text-slate-400 dark:text-slate-500 mb-1.5">Progreso</div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.round((completedUpTo / total) * 100)}%` }}
          />
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {Math.round((completedUpTo / total) * 100)}% completado
        </div>
      </div>
    </aside>
  )
}

// ─── Mobile Progress Bar ──────────────────────────────────────────────────────

function MobileProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="lg:hidden mb-6 space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium">{STEP_DEFS[current]?.label}</span>
        <span>Paso {current + 1} de {total}</span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.round(((current + 1) / total) * 100)}%` }}
        />
      </div>
    </div>
  )
}

// ─── Specialty Combobox ───────────────────────────────────────────────────────

interface SpecialtyOption {
  id: string
  name: string
  parentName: string | null
  parentId: string | null
}

function SpecialtyCombobox({
  specialties,
  loading,
  value,
  onSelect,
}: {
  specialties: Specialty[]
  loading: boolean
  value: string
  onSelect: (id: string, parentId: string | null) => void
}) {
  const [open, setOpen] = useState(false)

  // Build flat searchable list: children with parent context + leaf parents (no children)
  const options = useMemo<SpecialtyOption[]>(() => {
    const childParentIds = new Set(specialties.filter(s => s.parent_id).map(s => s.parent_id!))
    const result: SpecialtyOption[] = []

    for (const s of specialties) {
      if (s.parent_id) {
        // It's a child specialty
        const parent = specialties.find(p => p.id === s.parent_id)
        result.push({ id: s.id, name: s.name_es, parentName: parent?.name_es || null, parentId: s.parent_id })
      } else if (!childParentIds.has(s.id)) {
        // It's a leaf parent (no children)
        result.push({ id: s.id, name: s.name_es, parentName: null, parentId: null })
      }
    }

    return result
  }, [specialties])

  // Group options by parentName for Command display
  const groups = useMemo(() => {
    const map = new Map<string, SpecialtyOption[]>()
    for (const opt of options) {
      const key = opt.parentName || "General"
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(opt)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, "es"))
  }, [options])

  const selected = options.find(o => o.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full flex items-center gap-3 h-11 px-4 rounded-xl border text-sm transition-all duration-200 text-left",
            open
              ? "border-teal-500 ring-2 ring-teal-500/20 bg-white dark:bg-slate-900"
              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-teal-400 dark:hover:border-teal-600",
            loading && "opacity-60 cursor-not-allowed"
          )}
          disabled={loading}
        >
          <Stethoscope className="h-4 w-4 text-slate-400 shrink-0" />
          {selected ? (
            <span className="flex-1 flex items-center gap-2 min-w-0">
              <span className="font-medium text-slate-900 dark:text-white truncate">{selected.name}</span>
              {selected.parentName && (
                <span className="text-xs text-slate-400 shrink-0 hidden sm:inline">{selected.parentName}</span>
              )}
            </span>
          ) : (
            <span className="flex-1 text-slate-400">
              {loading ? "Cargando especialidades..." : "Busca tu especialidad..."}
            </span>
          )}
          {selected ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSelect("", null) }}
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 rotate-90" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] max-w-md p-0 border-slate-200 dark:border-slate-700 shadow-xl rounded-xl overflow-hidden"
        align="start"
        sideOffset={4}
      >
        <Command className="bg-white dark:bg-slate-900">
          <CommandInput placeholder="Escribe para filtrar especialidad..." />
          <CommandList className="max-h-72 overflow-y-auto">
            <CommandEmpty className="py-8 text-center text-sm text-slate-400">
              No se encontraron especialidades
            </CommandEmpty>
            {groups.map(([parentName, items]) => (
              <CommandGroup
                key={parentName}
                heading={parentName}
                className="[&>[cmdk-group-heading]]:text-xs [&>[cmdk-group-heading]]:font-semibold [&>[cmdk-group-heading]]:text-slate-400 [&>[cmdk-group-heading]]:px-3 [&>[cmdk-group-heading]]:py-2 [&>[cmdk-group-heading]]:uppercase [&>[cmdk-group-heading]]:tracking-wide"
              >
                {items.map((opt) => (
                  <CommandItem
                    key={opt.id}
                    value={`${opt.parentName || ""} ${opt.name}`}
                    onSelect={() => {
                      onSelect(opt.id, opt.parentId)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg mx-1 text-sm transition-colors",
                      "hover:bg-teal-50 dark:hover:bg-teal-900/20 aria-selected:bg-teal-50 dark:aria-selected:bg-teal-900/20"
                    )}
                  >
                    <Stethoscope className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                    <span className="flex-1 font-medium text-slate-800 dark:text-slate-200">{opt.name}</span>
                    {opt.id === value && (
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ─── Profile Preview Card ─────────────────────────────────────────────────────

function ProfilePreviewCard({
  name,
  specialty,
  slogan,
  avatar,
}: {
  name: string
  specialty: string
  slogan: string
  avatar: string | null
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Vista previa del perfil
      </div>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/40 dark:to-teal-800/40 flex items-center justify-center shrink-0">
          {avatar ? (
            <Image src={avatar} alt="preview" width={48} height={48} className="object-cover w-full h-full" />
          ) : (
            <User className="h-6 w-6 text-teal-400" />
          )}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">
            {name || "Tu nombre"}
          </div>
          <div className="text-teal-600 dark:text-teal-400 text-xs font-medium mt-0.5">
            {specialty || "Tu especialidad"}
          </div>
          {slogan && (
            <div className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
              {slogan}
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-slate-400">Nuevo · Verificado</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Nav Buttons ──────────────────────────────────────────────────────────────

function NavRow({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = "Continuar",
  loading = false,
}: {
  onBack?: () => void
  onNext: () => void
  nextDisabled?: boolean
  nextLabel?: string
  loading?: boolean
}) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Anterior
        </button>
      ) : <div />}
      <Button
        onClick={onNext}
        disabled={nextDisabled || loading}
        className="group relative overflow-hidden h-11 px-7 rounded-xl bg-teal-600 hover:bg-teal-600 text-white font-semibold shadow-md shadow-teal-600/25 disabled:opacity-40 disabled:shadow-none"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />{nextLabel}</>
        ) : (
          <>
            <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">{nextLabel}</span>
            <i className="absolute right-1 top-1 bottom-1 rounded-lg z-10 grid w-1/4 place-items-center transition-all duration-500 bg-white/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
              <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </i>
          </>
        )}
      </Button>
    </div>
  )
}

// ─── Card Wrapper ─────────────────────────────────────────────────────────────

function Card({ children, className, progressPercent }: { children: React.ReactNode; className?: string; progressPercent?: number }) {
  return (
    <div className={cn(
      "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden",
      className
    )}>
      {progressPercent !== undefined && (
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
      <div className="p-6 sm:p-8">
        {children}
      </div>
    </div>
  )
}

function StepHeader({ step, total, title, subtitle }: { step: number; total: number; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1 tracking-wide">
        PASO {step} DE {total}
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfessionalOnboardingPage() {
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
  const [lastName, setLastName] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loadingSpecialties, setLoadingSpecialties] = useState(false)

  const [referralValid, setReferralValid] = useState(false)
  const [checkingReferral, setCheckingReferral] = useState(false)
  const [customTitle, setCustomTitle] = useState(false)

  const [stats, setStats] = useState({ professionals: 0, appointments: 0, loadingStats: true })

  const [form, setForm] = useState<FormData>({
    avatarUrl: "",
    phone: "",
    showPhone: true,
    professionalTitle: "",
    gender: "",
    specialtyId: "",
    specialtyParentId: "",
    registrationNumber: "",
    yearsExperience: "",
    bio: "",
    professionalSlogan: "",
    consultationType: "",
    onlinePrice: "",
    inPersonPrice: "",
    clinicAddress: "",
    nuraAiTone: "",
    referralCode: "",
  })

  const merge = (partial: Partial<FormData>) => setForm((f) => ({ ...f, ...partial }))

  // Load existing profile
  useEffect(() => {
    if (!user?.id) return
    supabase.from("profiles").select("first_name, last_name, avatar_url, phone, gender, show_phone, professional_title")
      .eq("id", user.id).single()
      .then(({ data }) => {
        if (!data) return
        if (data.first_name) setFirstName(data.first_name)
        if (data.last_name) setLastName(data.last_name)
        if (data.avatar_url) { setAvatarPreview(data.avatar_url); merge({ avatarUrl: data.avatar_url }) }
        if (data.phone) merge({ phone: data.phone })
        if (data.gender) merge({ gender: data.gender as Gender })
        if (data.professional_title) merge({ professionalTitle: data.professional_title })
        merge({ showPhone: data.show_phone !== false }) // default true
      })
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch real-time platform stats
  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "professional").eq("onboarding_completed", true),
      supabase.from("appointments").select("*", { count: "exact", head: true }),
    ]).then(([profRes, apptRes]) => {
      setStats({
        professionals: profRes.count || 0,
        appointments: apptRes.count || 0,
        loadingStats: false,
      })
    }).catch(() => setStats(s => ({ ...s, loadingStats: false })))
  }, [supabase])

  // Load specialties
  useEffect(() => {
    setLoadingSpecialties(true)
    supabase.from("specialties").select("id, name_es, parent_id")
      .eq("is_active", true).order("sort_order").order("name_es")
      .then(({ data }) => {
        if (data) setSpecialties(data as Specialty[])
        setLoadingSpecialties(false)
      })
  }, [supabase])

  // Selected specialty display info
  const selectedSpecialty = specialties.find(s => s.id === form.specialtyId)
  const selectedParent = selectedSpecialty?.parent_id
    ? specialties.find(p => p.id === selectedSpecialty.parent_id)
    : null
  const specialtyDisplayName = selectedSpecialty?.name_es || ""

  // ─── Navigation ──────────────────────────────────────────────────────────

  const goNext = () => { setDirection(1); setStep((s) => s + 1) }
  const goBack = () => { setDirection(-1); setStep((s) => s - 1) }

  // ─── Step validation ─────────────────────────────────────────────────────

  const step1Valid = form.phone.trim().length >= 8 && form.gender !== "" && !!avatarPreview && form.professionalTitle.trim().length > 0
  const step2Valid = form.specialtyId !== "" &&
    form.registrationNumber.trim().length >= 5 &&
    form.yearsExperience !== ""
  const step3Valid = form.bio.trim().length >= 100 && form.bio.trim().length <= 600 && form.professionalSlogan.trim().length > 0
  const step4Valid = (() => {
    if (!form.consultationType) return false
    if (form.consultationType === "online" || form.consultationType === "both") {
      if (!form.onlinePrice.trim()) return false
    }
    if (form.consultationType === "in_person" || form.consultationType === "both") {
      if (!form.inPersonPrice.trim() || !form.clinicAddress.trim()) return false
    }
    return true
  })()
  const step5Valid = form.nuraAiTone !== ""

  const completedUpTo = step === 0 ? 0
    : step === 1 ? 1
    : step === 2 ? (step1Valid ? 2 : 1)
    : step === 3 ? (step2Valid ? 3 : 2)
    : step === 4 ? (step3Valid ? 4 : 3)
    : step === 5 ? (step4Valid ? 5 : 4)
    : 6

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

  // ─── Referral ────────────────────────────────────────────────────────────

  const validateReferral = useCallback(async (code: string) => {
    if (!code || code.length < 3) return
    setCheckingReferral(true)
    try {
      const { data } = await supabase.from("referral_codes")
        .select("uses_count, max_uses")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .single()
      if (data && data.uses_count < data.max_uses) {
        setReferralValid(true)
        toast.success("¡Código VIP activado!", { icon: <Crown className="h-4 w-4 text-amber-500" /> })
      } else {
        setReferralValid(false)
        toast.error("Código inválido o agotado")
      }
    } catch { setReferralValid(false) }
    finally { setCheckingReferral(false) }
  }, [supabase])

  // ─── Submit ──────────────────────────────────────────────────────────────

  const handleFinish = async () => {
    if (!user?.id) return
    setSubmitting(true)
    try {
      const avatarUrl = await uploadAvatar()
      const res = await fetch("/api/onboarding/professional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarUrl,
          phone: form.phone.trim(),
          showPhone: form.showPhone,
          professionalTitle: form.professionalTitle.trim(),
          gender: form.gender,
          specialtyId: form.specialtyId,
          registrationNumber: form.registrationNumber.trim(),
          yearsExperience: parseInt(form.yearsExperience, 10),
          bio: form.bio.trim(),
          professionalSlogan: form.professionalSlogan.trim(),
          consultationType: form.consultationType,
          onlinePrice: form.onlinePrice ? parseInt(form.onlinePrice, 10) : null,
          inPersonPrice: form.inPersonPrice ? parseInt(form.inPersonPrice, 10) : null,
          clinicAddress: form.clinicAddress.trim() || null,
          nuraAiTone: form.nuraAiTone,
          referralCode: referralValid ? form.referralCode.toUpperCase() : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Error al guardar")
      setShowSuccess(true)
      setTimeout(() => { router.refresh(); router.push("/dashboard/professional") }, 2500)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar. Intenta nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Success ─────────────────────────────────────────────────────────────

  if (showSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-center space-y-5 max-w-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mx-auto shadow-2xl shadow-teal-500/30"
          >
            <CheckCircle2 className="h-12 w-12 text-white" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              ¡Listo, {form.professionalTitle || "Dr/a."} {firstName}!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Tu perfil está configurado. Los pacientes ya pueden encontrarte en Nurea.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
            <span>Redirigiendo a tu dashboard...</span>
          </div>
        </motion.div>
      </div>
    )
  }

  if (authLoading) return null

  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Tu nombre"

  return (
    <div className="flex-1 flex flex-col">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex gap-8 items-start">

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <StepSidebar current={step} total={6} completedUpTo={completedUpTo} />

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <MobileProgress current={step} total={6} />

          <AnimatePresence custom={direction} mode="wait">

            {/* ── Step 0: Bienvenida ──────────────────────────────────────── */}
            {step === 0 && (
              <motion.div key="s0" custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ type: "spring", stiffness: 380, damping: 35 }}
              >
                <Card progressPercent={17}>
                  <div className="text-center space-y-3 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/25">
                      <Stethoscope className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {firstName ? `Bienvenido/a, Dr/a. ${firstName}` : "Configura tu perfil profesional"}
                      </h1>
                      <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
                        En menos de 5 minutos tu perfil estará listo para recibir pacientes
                      </p>
                    </div>
                  </div>

                  {/* Stats row — real-time */}
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                      {
                        value: stats.loadingStats ? "…" : `+${stats.professionals.toLocaleString("es-CL")}`,
                        label: "Especialistas en Nurea",
                      },
                      {
                        value: stats.loadingStats ? "…" : stats.appointments > 0 ? `+${stats.appointments.toLocaleString("es-CL")}` : "En crecimiento",
                        label: stats.appointments > 0 ? "Consultas realizadas" : "Plataforma en expansión",
                      },
                      { value: "3×", label: "Más visitas con foto de perfil" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                        <div className="text-lg font-bold text-teal-600 dark:text-teal-400">{stat.value}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Steps preview */}
                  <div className="space-y-2 mb-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                      Lo que configurarás hoy
                    </p>
                    {[
                      { icon: Camera, label: "Foto y datos de contacto" },
                      { icon: Stethoscope, label: "Especialidad y número de registro" },
                      { icon: FileText, label: "Biografía y frase de presentación" },
                      { icon: Briefcase, label: "Modalidad de atención y precios" },
                      { icon: Brain, label: "Tono del asistente IA Nura" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3 py-1.5">
                        <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                          <item.icon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  <Button onClick={goNext}
                    className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md shadow-teal-600/25 transition-all active:scale-[0.98]">
                    Comenzar configuración <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Card>
              </motion.div>
            )}

            {/* ── Step 1: Tu Foto y Contacto ──────────────────────────────── */}
            {step === 1 && (
              <motion.div key="s1" custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ type: "spring", stiffness: 380, damping: 35 }}
              >
                <Card progressPercent={33}>
                  <StepHeader step={2} total={6} title="Tu foto y contacto" subtitle="La primera impresión importa" />

                  {/* Avatar — required */}
                  <div className="flex flex-col items-center gap-3 mb-7 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "relative w-24 h-24 rounded-full overflow-hidden border-4 transition-all duration-300 group",
                        avatarPreview
                          ? "border-teal-500 shadow-md shadow-teal-500/20"
                          : "border-dashed border-amber-400 dark:border-amber-500 hover:border-teal-400"
                      )}
                    >
                      {avatarPreview
                        ? <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
                        : (
                          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <User className="h-10 w-10 text-slate-400" />
                          </div>
                        )
                      }
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        <Camera className="h-6 w-6 text-white" />
                        <span className="text-white text-xs font-medium">Cambiar</span>
                      </div>
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {avatarPreview ? "Cambiar foto" : "Subir foto profesional"}
                      </button>
                      {!avatarPreview && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Requerida · Los especialistas con foto reciben 3× más visitas
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Professional Title */}
                  <div className="space-y-2 mb-5">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      ¿Cómo quieres que te llamen? <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-slate-400 -mt-1">Tu título aparecerá junto a tu nombre en el perfil</p>
                    <div className="flex flex-wrap gap-2">
                      {PROFESSIONAL_TITLES.map((t) => {
                        const isOtro = t.value === "Otro"
                        const isSelected = isOtro ? customTitle : (!customTitle && form.professionalTitle === t.value)
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => {
                              if (isOtro) {
                                setCustomTitle(true)
                                merge({ professionalTitle: "" })
                              } else {
                                setCustomTitle(false)
                                merge({ professionalTitle: t.value })
                              }
                            }}
                            title={t.desc}
                            className={cn(
                              "flex flex-col items-center px-3 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 min-w-[52px]",
                              isSelected
                                ? "bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-500/20"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600"
                            )}
                          >
                            <span>{t.label}</span>
                            <span className={cn("text-[10px] font-normal mt-0.5 leading-tight",
                              isSelected ? "text-teal-100" : "text-slate-400"
                            )}>{t.desc}</span>
                          </button>
                        )
                      })}
                    </div>
                    {customTitle && (
                      <Input
                        type="text"
                        maxLength={20}
                        placeholder="Ej: Quir., Biol., Mat., ..."
                        value={form.professionalTitle}
                        onChange={(e) => merge({ professionalTitle: e.target.value })}
                        className="border-slate-200 dark:border-slate-700 focus-visible:ring-teal-500 mt-2"
                        autoFocus
                      />
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2 mb-5">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Teléfono de contacto <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex">
                      <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 px-4 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 shrink-0">
                        🇨🇱 +56
                      </div>
                      <Input
                        type="tel"
                        placeholder="9 XXXX XXXX"
                        value={form.phone}
                        onChange={(e) => merge({ phone: e.target.value })}
                        className="rounded-l-none rounded-r-xl border-slate-200 dark:border-slate-700 focus-visible:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* Show phone toggle */}
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-5">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Mostrar teléfono en perfil público</p>
                      <p className="text-xs text-slate-400 mt-0.5">Los pacientes podrán contactarte directamente</p>
                    </div>
                    <Switch
                      checked={form.showPhone}
                      onCheckedChange={(v) => merge({ showPhone: v })}
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2 mb-6">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Género <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { value: "M", label: "Masculino" },
                        { value: "F", label: "Femenino" },
                        { value: "other", label: "Prefiero no especificar" },
                      ] as { value: Gender; label: string }[]).map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => merge({ gender: g.value })}
                          className={cn(
                            "py-2.5 rounded-xl text-sm font-medium border transition-all duration-200",
                            form.gender === g.value
                              ? "bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-500/20"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600"
                          )}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <NavRow onBack={goBack} onNext={goNext} nextDisabled={!step1Valid} nextLabel="Continuar" />
                </Card>
              </motion.div>
            )}

            {/* ── Step 2: Especialidad y Credenciales ─────────────────────── */}
            {step === 2 && (
              <motion.div key="s2" custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ type: "spring", stiffness: 380, damping: 35 }}
              >
                <Card progressPercent={50}>
                  <StepHeader step={3} total={6} title="Especialidad y credenciales" subtitle="Esta información valida tu perfil ante los pacientes" />

                  {/* Specialty Combobox */}
                  <div className="space-y-2 mb-5">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Especialidad médica <span className="text-red-500">*</span>
                    </Label>
                    <SpecialtyCombobox
                      specialties={specialties}
                      loading={loadingSpecialties}
                      value={form.specialtyId}
                      onSelect={(id, parentId) => {
                        if (!id) {
                          merge({ specialtyId: "", specialtyParentId: "" })
                        } else {
                          merge({ specialtyId: id, specialtyParentId: parentId || id })
                        }
                      }}
                    />
                    {/* Selected specialty breadcrumb */}
                    {selectedSpecialty && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
                        {selectedParent && <span>{selectedParent.name_es} ›</span>}
                        <span className="font-medium text-teal-600 dark:text-teal-400">{selectedSpecialty.name_es}</span>
                      </div>
                    )}
                  </div>

                  {/* RNPI */}
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Número RNPI <span className="text-red-500">*</span>
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="text-slate-400 hover:text-teal-500 transition-colors">
                              <Info className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs p-3 text-xs">
                            Número del Registro Nacional de Prestadores Individuales de Salud. Lo encuentras en tu certificado de la Superintendencia de Salud.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      type="text"
                      placeholder="Ej: 123456"
                      value={form.registrationNumber}
                      onChange={(e) => merge({ registrationNumber: e.target.value })}
                      className="border-slate-200 dark:border-slate-700 focus-visible:ring-teal-500"
                    />
                    {form.registrationNumber && form.registrationNumber.trim().length < 5 && (
                      <p className="text-xs text-red-500">Mínimo 5 caracteres</p>
                    )}
                    <p className="text-xs text-slate-400">
                      Tu número RNPI permite a los pacientes verificar tu registro en la Superintendencia de Salud
                    </p>
                  </div>

                  {/* Years experience */}
                  <div className="space-y-2 mb-6">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Años de experiencia clínica <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        max={50}
                        placeholder="Ej: 8"
                        value={form.yearsExperience}
                        onChange={(e) => {
                          const v = e.target.value
                          if (v === "") { merge({ yearsExperience: "" }); return }
                          merge({ yearsExperience: String(Math.min(50, Math.max(0, parseInt(v, 10)))) })
                        }}
                        className="border-slate-200 dark:border-slate-700 focus-visible:ring-teal-500 pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">años</span>
                    </div>
                  </div>

                  <NavRow onBack={goBack} onNext={goNext} nextDisabled={!step2Valid} nextLabel="Continuar" />
                </Card>
              </motion.div>
            )}

            {/* ── Step 3: Tu Perfil Público ────────────────────────────────── */}
            {step === 3 && (
              <motion.div key="s3" custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ type: "spring", stiffness: 380, damping: 35 }}
              >
                <Card progressPercent={67}>
                  <StepHeader step={4} total={6} title="Tu perfil público" subtitle="Lo que los pacientes ven al buscarte" />

                  {/* Live profile preview */}
                  <div className="mb-6">
                    <ProfilePreviewCard
                      name={`Dr/a. ${fullName}`}
                      specialty={specialtyDisplayName}
                      slogan={form.professionalSlogan}
                      avatar={avatarPreview}
                    />
                  </div>

                  {/* Slogan — first for faster preview feedback */}
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Frase de presentación <span className="text-red-500">*</span>
                      </Label>
                      <span className="text-xs text-slate-400">{form.professionalSlogan.length}/80</span>
                    </div>
                    <Input
                      type="text"
                      maxLength={80}
                      placeholder="Ej: Psicólogo clínico especializado en terapia cognitivo-conductual"
                      value={form.professionalSlogan}
                      onChange={(e) => merge({ professionalSlogan: e.target.value })}
                      className="border-slate-200 dark:border-slate-700 focus-visible:ring-teal-500"
                    />
                    <p className="text-xs text-slate-400">Aparece bajo tu nombre en los resultados de búsqueda</p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Biografía <span className="text-red-500">*</span>
                      </Label>
                      <span className={cn(
                        "text-xs font-mono px-2 py-0.5 rounded-md",
                        form.bio.length >= 100 && form.bio.length <= 600
                          ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400"
                          : form.bio.length > 600
                          ? "bg-red-50 dark:bg-red-900/30 text-red-600"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                      )}>
                        {form.bio.length}/600
                      </span>
                    </div>
                    <Textarea
                      placeholder="Describe tu experiencia, enfoque clínico, formación académica y por qué los pacientes deberían elegirte..."
                      value={form.bio}
                      onChange={(e) => merge({ bio: e.target.value.slice(0, 600) })}
                      className="resize-none border-slate-200 dark:border-slate-700 focus-visible:ring-teal-500 min-h-[140px]"
                      rows={5}
                    />
                    {form.bio.length > 0 && form.bio.length < 100 ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {100 - form.bio.length} caracteres más para el mínimo requerido
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Mínimo 100 caracteres · Los perfiles con biografía completa reciben 2× más consultas
                      </p>
                    )}
                  </div>

                  <NavRow onBack={goBack} onNext={goNext} nextDisabled={!step3Valid} nextLabel="Continuar" />
                </Card>
              </motion.div>
            )}

            {/* ── Step 4: Tu Consulta ──────────────────────────────────────── */}
            {step === 4 && (
              <motion.div key="s4" custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ type: "spring", stiffness: 380, damping: 35 }}
              >
                <Card progressPercent={83}>
                  <StepHeader step={5} total={6} title="Tu consulta" subtitle="¿Cómo y cuánto cobras por atender?" />

                  <div className="space-y-3 mb-6">
                    {CONSULTATION_TYPES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => merge({ consultationType: c.value })}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left group",
                          form.consultationType === c.value
                            ? "border-teal-600 bg-teal-50 dark:bg-teal-900/20 shadow-sm shadow-teal-500/10"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                        )}
                      >
                        <span className="text-2xl shrink-0">{c.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn(
                              "font-semibold text-sm",
                              form.consultationType === c.value
                                ? "text-teal-700 dark:text-teal-300"
                                : "text-slate-800 dark:text-slate-200"
                            )}>{c.label}</p>
                            {c.badge && (
                              <span className="text-xs bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-full font-medium">
                                {c.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.desc}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                          form.consultationType === c.value
                            ? "border-teal-600 bg-teal-600"
                            : "border-slate-300 dark:border-slate-600"
                        )}>
                          {form.consultationType === c.value && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Price fields */}
                  {(form.consultationType === "online" || form.consultationType === "both") && (
                    <div className="space-y-2 mb-4">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Precio consulta online (CLP) <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">$</span>
                        <Input
                          type="number"
                          min={0}
                          placeholder="25.000"
                          value={form.onlinePrice}
                          onChange={(e) => merge({ onlinePrice: e.target.value })}
                          className="pl-7 border-slate-200 dark:border-slate-700 focus-visible:ring-teal-500"
                        />
                      </div>
                      <p className="text-xs text-slate-400">Rango típico en Chile: $15.000 – $60.000</p>
                    </div>
                  )}

                  {(form.consultationType === "in_person" || form.consultationType === "both") && (
                    <>
                      <div className="space-y-2 mb-4">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Precio consulta presencial (CLP) <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">$</span>
                          <Input
                            type="number"
                            min={0}
                            placeholder="30.000"
                            value={form.inPersonPrice}
                            onChange={(e) => merge({ inPersonPrice: e.target.value })}
                            className="pl-7 border-slate-200 dark:border-slate-700 focus-visible:ring-teal-500"
                          />
                        </div>
                        <p className="text-xs text-slate-400">Rango típico en Chile: $20.000 – $80.000</p>
                      </div>
                      <div className="space-y-2 mb-4">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Dirección de tu consulta <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          placeholder="Ej: Av. Providencia 1234, Of. 502, Santiago"
                          value={form.clinicAddress}
                          onChange={(e) => merge({ clinicAddress: e.target.value })}
                          className="border-slate-200 dark:border-slate-700 focus-visible:ring-teal-500"
                        />
                      </div>
                    </>
                  )}

                  <NavRow onBack={goBack} onNext={goNext} nextDisabled={!step4Valid} nextLabel="Continuar" />
                </Card>
              </motion.div>
            )}

            {/* ── Step 5: IA & Finalizar ───────────────────────────────────── */}
            {step === 5 && (
              <motion.div key="s5" custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ type: "spring", stiffness: 380, damping: 35 }}
              >
                <Card progressPercent={100}>
                  <StepHeader step={6} total={6} title="Asistente IA Nura" subtitle="Personaliza cómo Nura comunica con tus pacientes en tu nombre" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
                    {AI_TONES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => merge({ nuraAiTone: t.value })}
                        className={cn(
                          "flex flex-col gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                          form.nuraAiTone === t.value
                            ? "border-teal-600 bg-teal-50 dark:bg-teal-900/20 shadow-sm shadow-teal-500/10"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{t.icon}</span>
                            <span className={cn(
                              "text-sm font-semibold",
                              form.nuraAiTone === t.value ? "text-teal-700 dark:text-teal-300" : "text-slate-800 dark:text-slate-200"
                            )}>{t.label}</span>
                          </div>
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                            form.nuraAiTone === t.value
                              ? "border-teal-600 bg-teal-600"
                              : "border-slate-300 dark:border-slate-600"
                          )}>
                            {form.nuraAiTone === t.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.desc}</p>
                        <div className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-2 py-1.5 italic leading-relaxed">
                          {t.example}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Referral code */}
                  <div className="rounded-xl border border-dashed border-amber-300 dark:border-amber-700/50 bg-amber-50/50 dark:bg-amber-900/10 p-4 space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Código VIP de invitación
                      </span>
                      <span className="text-xs text-slate-400 font-normal">(opcional)</span>
                      {referralValid && (
                        <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                          ✓ VIP activado
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="NUREA50"
                        value={form.referralCode}
                        onChange={(e) => merge({ referralCode: e.target.value.toUpperCase() })}
                        disabled={referralValid}
                        className={cn(
                          "font-mono tracking-widest uppercase h-10 border-amber-200 dark:border-amber-700/50 focus-visible:ring-amber-400 bg-white dark:bg-slate-900",
                          referralValid && "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                        )}
                      />
                      {!referralValid && (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!form.referralCode || checkingReferral}
                          onClick={() => validateReferral(form.referralCode)}
                          className="shrink-0 h-10 border-amber-200 dark:border-amber-700/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                        >
                          {checkingReferral ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validar"}
                        </Button>
                      )}
                    </div>
                    {referralValid && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Tu perfil tendrá prioridad en los resultados de búsqueda
                      </p>
                    )}
                  </div>

                  <NavRow
                    onBack={goBack}
                    onNext={handleFinish}
                    nextDisabled={!step5Valid}
                    nextLabel={submitting || uploadingAvatar ? "Guardando..." : "Finalizar y publicar perfil"}
                    loading={submitting || uploadingAvatar}
                  />
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
