"use client"
import { useUser } from "@/hooks/use-user"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { GoogleAddressInput } from "@/components/ui/google-address-input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import {
  User,
  Stethoscope,
  GraduationCap as GraduationCapIcon,
  GraduationCap,
  Camera,
  Save,
  ExternalLink,
  Plus,
  Trash2,
  Upload,
  X,
  Loader2,
  Building2,
  Monitor,
  CheckCircle2,
  Info,
  ShieldCheck,
  Key,
  Lock,
  FileText,
  BadgeCheck,
  History,
  Award,
  DollarSign,
  Tag
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { loadingDashboardInsetClassName } from "@/lib/loading-layout"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { ProfileCompleteness } from "@/components/professional/profile-completeness"
import { ProfilePhotoUpload } from "@/components/professional/profile-photo-upload"
import { ProfileSectionCard } from "@/components/professional/profile-section-card"
import { TipTapEditor } from "@/components/professional/tiptap-editor"
import { useProfile } from "@/hooks/use-profile"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { HeroCard } from "@/components/professional/hero-card"
import { ReviewsPanel } from "@/components/professional/reviews-panel"
import { AccordionSection, FieldRow, ToggleRow } from "@/components/professional/accordion-section"
import { FlaskConical, MessageSquare } from "lucide-react"

// --- Schemas ---
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
] as const

const generalSchema = z.object({
  bio: z.string().min(50, "La biografía debe tener al menos 50 caracteres"),
  years_experience: z.number().min(0).optional(),
  registration_number: z.string().min(1, "Nº Registro es requerido"),
  registration_institution: z.string().optional(),
  specialty_id: z.string().uuid("Selecciona una especialidad"),
  gender: z.enum(["M", "F", "other"]).optional(),
  professional_title: z.string().optional(),
  phone: z.string().optional(),
  show_phone: z.boolean().default(true),
})

const clinicalSchema = z.object({
  conditions_treated: z.array(z.string()),
  consultation_type: z.enum(['online', 'in-person', 'both']),
  clinic_address: z.string().optional(),
  clinic_city: z.string().optional(),
  patients_groups: z.array(z.string()).optional(),
  payment_methods: z.array(z.string()).optional(),
})

const educationSchema = z.object({
  education: z.array(z.object({
    institution: z.string().min(1, "Institución es requerida"),
    degree: z.string().min(1, "Título es requerido"),
    graduation_year: z.string().min(4, "Año inválido"),
  }))
})

const gallerySchema = z.object({
  clinic_images: z.array(z.string())
})

const securitySchema = z.object({
  new_password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirm_password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Las contraseñas no coinciden",
  path: ["confirm_password"],
})

const pricingSchema = z.object({
  consultationTypes: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Nombre requerido"),
    price: z.coerce.number().min(0, "El precio no puede ser negativo"),
    duration_minutes: z.coerce.number().min(15).max(240),
    modality: z.enum(['online', 'in-person', 'both']),
    description: z.string().optional(),
  }))
})

// ─── Inline accordion content helpers ─────────────────────────────────────────

function PersonalDataFields({ generalForm, profileName, onSaveGeneral, onSaveName, onSaveFieldDirect, saving }: any) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState("")
  const [tempLast, setTempLast] = useState("")

  function startEdit(field: string, current: string) {
    setEditingField(field)
    setTempValue(current)
  }
  function cancelEdit() { setEditingField(null); setTempValue(""); setTempLast("") }
  async function saveField(field: string) {
    await onSaveFieldDirect(field, tempValue)
    setEditingField(null)
  }
  async function saveName() {
    await onSaveName(tempValue, tempLast)
    setEditingField(null)
  }

  return (
    <div>
      <FieldRow
        label="Nombre"
        value={profileName?.first_name ?? ""}
        editing={editingField === "first_name"}
        onEdit={() => { setTempValue(profileName?.first_name ?? ""); setTempLast(profileName?.last_name ?? ""); setEditingField("first_name") }}
        editContent={
          <div className="flex items-center gap-2 flex-wrap">
            <input
              className="flex-1 min-w-0 rounded-lg border border-teal-300 focus:border-teal-500 h-8 px-2.5 text-sm outline-none"
              placeholder="Nombre"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              autoFocus
            />
            <input
              className="flex-1 min-w-0 rounded-lg border border-teal-300 focus:border-teal-500 h-8 px-2.5 text-sm outline-none"
              placeholder="Apellidos"
              value={tempLast}
              onChange={(e) => setTempLast(e.target.value)}
            />
            <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 px-2 py-1 border rounded-lg hover:bg-slate-50 shrink-0">Cancelar</button>
            <button type="button" onClick={saveName} disabled={saving} className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50 shrink-0">Guardar</button>
          </div>
        }
      />
      <FieldRow
        label="Apellidos"
        value={profileName?.last_name ?? ""}
        editing={editingField === "first_name"}
        onEdit={() => { setTempValue(profileName?.first_name ?? ""); setTempLast(profileName?.last_name ?? ""); setEditingField("first_name") }}
        editContent={
          <div className="flex items-center gap-2 flex-wrap">
            <input
              className="flex-1 min-w-0 rounded-lg border border-teal-300 focus:border-teal-500 h-8 px-2.5 text-sm outline-none"
              placeholder="Nombre"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
            />
            <input
              className="flex-1 min-w-0 rounded-lg border border-teal-300 focus:border-teal-500 h-8 px-2.5 text-sm outline-none"
              placeholder="Apellidos"
              value={tempLast}
              onChange={(e) => setTempLast(e.target.value)}
              autoFocus
            />
            <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 px-2 py-1 border rounded-lg hover:bg-slate-50 shrink-0">Cancelar</button>
            <button type="button" onClick={saveName} disabled={saving} className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50 shrink-0">Guardar</button>
          </div>
        }
      />
      <FieldRow
        label="Género"
        value={
          generalForm.watch("gender") === "M" ? "Hombre"
          : generalForm.watch("gender") === "F" ? "Mujer"
          : generalForm.watch("gender") === "other" ? "Prefiero no especificar"
          : ""
        }
        editing={editingField === "gender"}
        editContent={
          <div className="flex items-center gap-2">
            <select
              className="flex-1 rounded-lg border border-teal-300 focus:border-teal-500 h-8 px-2 text-sm outline-none"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
            >
              <option value="">Selecciona</option>
              <option value="M">Hombre</option>
              <option value="F">Mujer</option>
              <option value="other">Prefiero no especificar</option>
            </select>
            <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 px-2 py-1 border rounded-lg hover:bg-slate-50">Cancelar</button>
            <button type="button" onClick={() => saveField("gender")} disabled={saving} className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50">Guardar</button>
          </div>
        }
        onEdit={() => startEdit("gender", generalForm.getValues("gender") ?? "")}
      />
      <FieldRow
        label="Teléfono"
        value={generalForm.watch("phone") ?? ""}
        editing={editingField === "phone"}
        editContent={
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 shrink-0">+56</span>
            <input
              className="flex-1 rounded-lg border border-teal-300 focus:border-teal-500 h-8 px-2.5 text-sm outline-none"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              autoFocus
            />
            <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 px-2 py-1 border rounded-lg hover:bg-slate-50">Cancelar</button>
            <button type="button" onClick={() => saveField("phone")} disabled={saving} className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50">Guardar</button>
          </div>
        }
        onEdit={() => startEdit("phone", generalForm.getValues("phone") ?? "")}
      />
      <ToggleRow
        label="Mostrar teléfono en perfil público"
        description="Los pacientes podrán ver y llamarte directamente"
        checked={generalForm.watch("show_phone") ?? true}
        onCheckedChange={(v: boolean) => {
          onSaveFieldDirect("show_phone", v)
        }}
      />
    </div>
  )
}

function ProfessionalTrajectoryFields({ generalForm, specialties, PROFESSIONAL_TITLES, customTitle, setCustomTitle, onSaveGeneral, onSaveFieldDirect, saving }: any) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState("")
  const [tempCustomTitle, setTempCustomTitle] = useState(false)

  function startEdit(field: string, current: string) {
    setEditingField(field)
    setTempValue(current)
  }
  function cancelEdit() { setEditingField(null); setTempValue("") }
  async function saveField(field: string, value?: string) {
    await onSaveFieldDirect(field, value ?? tempValue)
    setEditingField(null)
  }

  const specialtyName = specialties.find((s: any) => s.id === generalForm.watch("specialty_id"))?.name_es ?? ""

  return (
    <div>
      <FieldRow
        label="Título abreviado"
        value={
          generalForm.watch("professional_title")
            ? <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3 py-0.5">{generalForm.watch("professional_title")}</span>
            : ""
        }
        editing={editingField === "professional_title"}
        editContent={
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {PROFESSIONAL_TITLES.map((t: any) => {
                const isSelected = t.value === "Otro"
                  ? tempCustomTitle
                  : tempValue === t.value && !tempCustomTitle
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      if (t.value === "Otro") { setTempCustomTitle(true); setTempValue("") }
                      else { setTempCustomTitle(false); setTempValue(t.value) }
                    }}
                    className={cn(
                      "px-3 py-1 rounded-xl text-sm font-bold border transition-all",
                      isSelected ? "bg-teal-600 text-white border-teal-600" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-400"
                    )}
                  >
                    {t.label} <span className="text-[10px] font-normal ml-1 opacity-60">{t.desc}</span>
                  </button>
                )
              })}
            </div>
            {tempCustomTitle && (
              <input
                className="w-full rounded-lg border border-teal-300 h-8 px-2.5 text-sm outline-none"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder="Ej: Lic., Kine., etc."
                autoFocus
              />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 px-2 py-1 border rounded-lg hover:bg-slate-50">Cancelar</button>
              <button type="button" onClick={() => { setCustomTitle(tempCustomTitle); saveField("professional_title") }} disabled={saving} className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50">Guardar</button>
            </div>
          </div>
        }
        onEdit={() => { setTempCustomTitle(customTitle); startEdit("professional_title", generalForm.getValues("professional_title") ?? "") }}
      />
      <FieldRow
        label="Especialidad"
        value={specialtyName}
        editing={editingField === "specialty_id"}
        editContent={
          <div className="flex items-center gap-2">
            <select
              className="flex-1 rounded-lg border border-teal-300 focus:border-teal-500 h-8 px-2 text-sm outline-none"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
            >
              <option value="">Selecciona una especialidad</option>
              {specialties.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name_es}</option>
              ))}
            </select>
            <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 px-2 py-1 border rounded-lg hover:bg-slate-50">Cancelar</button>
            <button type="button" onClick={() => saveField("specialty_id")} disabled={saving} className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50">Guardar</button>
          </div>
        }
        onEdit={() => startEdit("specialty_id", generalForm.getValues("specialty_id") ?? "")}
      />
      <FieldRow
        label="Años de experiencia"
        value={generalForm.watch("years_experience") != null ? String(generalForm.watch("years_experience")) : ""}
        editing={editingField === "years_experience"}
        editContent={
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              className="w-24 rounded-lg border border-teal-300 focus:border-teal-500 h-8 px-2.5 text-sm outline-none"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              autoFocus
            />
            <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 px-2 py-1 border rounded-lg hover:bg-slate-50">Cancelar</button>
            <button
              type="button"
              onClick={() => saveField("years_experience", String(parseInt(tempValue, 10) || 0))}
              disabled={saving}
              className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              Guardar
            </button>
          </div>
        }
        onEdit={() => startEdit("years_experience", String(generalForm.getValues("years_experience") ?? ""))}
      />
      <FieldRow
        label="Nº Registro"
        value={generalForm.watch("registration_number") ?? ""}
        editing={editingField === "registration_number"}
        editContent={
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-lg border border-teal-300 focus:border-teal-500 h-8 px-2.5 text-sm outline-none"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              autoFocus
            />
            <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 px-2 py-1 border rounded-lg hover:bg-slate-50">Cancelar</button>
            <button type="button" onClick={() => saveField("registration_number")} disabled={saving} className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50">Guardar</button>
          </div>
        }
        onEdit={() => startEdit("registration_number", generalForm.getValues("registration_number") ?? "")}
      />
      <FieldRow
        label="Institución emisora"
        value={generalForm.watch("registration_institution") ?? ""}
        editing={editingField === "registration_institution"}
        editContent={
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-lg border border-teal-300 focus:border-teal-500 h-8 px-2.5 text-sm outline-none"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              autoFocus
            />
            <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 px-2 py-1 border rounded-lg hover:bg-slate-50">Cancelar</button>
            <button type="button" onClick={() => saveField("registration_institution")} disabled={saving} className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50">Guardar</button>
          </div>
        }
        onEdit={() => startEdit("registration_institution", generalForm.getValues("registration_institution") ?? "")}
      />
    </div>
  )
}

function BioAccordion({ generalForm, onSaveGeneral, onSaveFieldDirect, saving }: any) {
  const [editing, setEditing] = useState(false)

  const bioHtml: string = generalForm.watch("bio") ?? ""
  const plainText = bioHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim()
  const preview = plainText.length > 60 ? `${plainText.slice(0, 60)}...` : plainText

  return (
    <AccordionSection
      title="Biografía profesional"
      subtitle="Tu presentación para los pacientes"
      icon={<MessageSquare className="h-4 w-4" />}
      iconVariant="teal"
      preview={preview || "Sin biografía"}
      editButton={
        !editing ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setEditing(true) }}
            className="text-xs font-semibold text-teal-600 border border-teal-200 rounded-lg px-3 py-1 hover:bg-teal-50 transition-colors"
          >
            Editar
          </button>
        ) : null
      }
    >
      {editing ? (
        <div className="space-y-3">
          <TipTapEditor
            value={generalForm.watch("bio")}
            onChange={(v: string) => generalForm.setValue("bio", v, { shouldDirty: true })}
            placeholder="Describe tu enfoque, especialidad y lo que ofreces a tus pacientes..."
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setEditing(false); generalForm.resetField("bio") }}
              className="text-xs text-slate-500 px-3 py-1.5 border rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => { onSaveFieldDirect("bio", generalForm.getValues("bio")); setEditing(false) }}
              className="text-xs font-semibold text-white bg-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar biografía"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-600 whitespace-pre-wrap">
          {plainText || <span className="italic text-slate-400">Sin biografía. Haz clic en Editar para añadir tu presentación.</span>}
        </p>
      )}
    </AccordionSection>
  )
}

export default function ProfessionalProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const { profile, mutate: mutateProfile } = useProfile()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [specialties, setSpecialties] = useState<any[]>([])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [profileName, setProfileName] = useState<{ first_name: string; last_name: string } | null>(null)
  const [publicProfilePath, setPublicProfilePath] = useState<string | null>(null)
  const [pageProfile, setPageProfile] = useState<any | null>(null)
  const [pageProfessional, setPageProfessional] = useState<any | null>(null)
  const [showReviews, setShowReviews] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(
    (searchParams.get("tab") as string) || "general"
  )

  // Calculate completeness (0–100)
  const [completeness, setCompleteness] = useState(0)



  // --- Forms ---
  const [customTitle, setCustomTitle] = useState(false)

  const generalForm = useForm<z.infer<typeof generalSchema>>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      bio: "",
      registration_number: "",
      registration_institution: "",
      specialty_id: "",
      gender: undefined,
      professional_title: "",
      phone: "",
      show_phone: true,
    }
  })

  const clinicalForm = useForm<z.infer<typeof clinicalSchema>>({
    resolver: zodResolver(clinicalSchema),
    defaultValues: { 
      conditions_treated: [], 
      consultation_type: 'online',
      clinic_address: "",
      clinic_city: "",
      patients_groups: [],
      payment_methods: [],
    }
  })

  const educationForm = useForm<z.infer<typeof educationSchema>>({
    resolver: zodResolver(educationSchema),
    defaultValues: { education: [] }
  })

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control: educationForm.control,
    name: "education"
  })

  const galleryForm = useForm<z.infer<typeof gallerySchema>>({
    resolver: zodResolver(gallerySchema),
    defaultValues: { clinic_images: [] }
  })

  const securityForm = useForm<z.infer<typeof securitySchema>>({
    resolver: zodResolver(securitySchema),
    defaultValues: { new_password: "", confirm_password: "" }
  })

  const pricingForm = useForm<z.infer<typeof pricingSchema>>({
    resolver: zodResolver(pricingSchema),
    defaultValues: { consultationTypes: [] }
  })

  const { fields: pricingFields, append: appendPricing, remove: removePricing } = useFieldArray({
    control: pricingForm.control,
    name: "consultationTypes"
  })

  // --- Load Data ---
  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      try {
        const [{ data: profileData }, { data }] = await Promise.all([
          supabase.from("profiles").select("first_name, last_name, gender, professional_title, show_phone").eq("id", user.id).single(),
          supabase.from("professionals").select("*").eq("id", user.id).single(),
        ])

        if (profileData) {
          setProfileName({
            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
          })
          setPageProfile({ ...profileData, id: user.id })
        }

        let professional: any = data

        // Autocreate professional row if it doesn't exist yet
        if (!professional && user.id) {
          const rawName = `${profileData?.first_name || ""} ${profileData?.last_name || ""}`.trim()
          const baseSlug =
            rawName.length > 0
              ? rawName
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "")
              : null

          const insertPayload: any = { id: user.id }
          if (baseSlug) insertPayload.slug = baseSlug

          const { data: createdPro, error: insertError } = await supabase
            .from("professionals")
            .insert(insertPayload)
            .select("*")
            .single()

          if (!insertError && createdPro) {
            professional = createdPro
          }
        }

        if (professional) {
          const slugOrId = professional.slug || professional.id
          if (slugOrId) {
            setPublicProfilePath(`/professionals/${slugOrId}`)
          }
          const loadedTitle = (profileData as any)?.professional_title || ""
          const isCustom = loadedTitle !== "" && !PROFESSIONAL_TITLES.some(t => t.value === loadedTitle && t.value !== "Otro")
          setCustomTitle(isCustom)

          generalForm.reset({
            bio: professional.bio || "",
            years_experience: typeof professional.years_experience === "number" ? professional.years_experience : undefined,
            registration_number: professional.registration_number || "",
            registration_institution: professional.registration_institution || "",
            specialty_id: professional.specialty_id || "",
            gender:
              profileData?.gender === "F" || profileData?.gender === "M" || (profileData?.gender as any) === "other"
                ? (profileData?.gender as "M" | "F" | "other")
                : undefined,
            professional_title: loadedTitle,
            phone: professional.phone || (profileData as any)?.phone || "",
            show_phone: (profileData as any)?.show_phone !== false,
          })
          setAvatarUrl(professional.avatar_url)
          setPageProfessional(professional)
          clinicalForm.reset({
            conditions_treated: professional.conditions_treated || [],
            consultation_type: professional.consultation_type || 'online',
            clinic_address: professional.clinic_address || "",
            clinic_city: professional.clinic_city || "",
            patients_groups: professional.patients_groups || [],
            payment_methods: professional.payment_methods || [],
          })
          educationForm.reset({
            education: professional.education || []
          })
          galleryForm.reset({
            clinic_images: professional.clinic_images || []
          })
          pricingForm.reset({
            consultationTypes: professional.consultation_types || []
          })

        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, [user])

  // --- Manage Credentials ---
  const [credentials, setCredentials] = useState<any[]>([])
  const [loadingCredentials, setLoadingCredentials] = useState(true)

  useEffect(() => {
    async function loadCredentials() {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from('professional_credentials')
          .select('*')
          .eq('professional_id', user.id)
          .order('created_at', { ascending: false })

        if (data) setCredentials(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingCredentials(false)
      }
    }
    if (user) loadCredentials()
  }, [user, supabase])

  const handleDeleteCredential = async (id: string) => {
    const { error } = await supabase
      .from('professional_credentials')
      .delete()
      .eq('id', id)
      .eq('status', 'pending')

    if (error) {
       toast.error("No se puede eliminar una credencial ya verificada")
    } else {
       setCredentials(prev => prev.filter(c => c.id !== id))
       toast.success("Credencial eliminada")
    }
  }

  // --- Save Handlers ---
  const onSaveGeneral = async (values: z.infer<typeof generalSchema>) => {
    if (!user) return
    setSaving(true)
    try {
      const selectedSpecialty = specialties.find(s => s.id === values.specialty_id)
      const specialtyLabel = selectedSpecialty?.name_es || null

      const { error } = await supabase
        .from('professionals')
        .update({
          bio: values.bio,
          years_experience: values.years_experience ?? null,
          registration_number: values.registration_number,
          registration_institution: values.registration_institution,
          specialty_id: values.specialty_id,
          // Mantener también la columna de texto legacy para que el perfil público muestre el título correcto.
          specialty: specialtyLabel,
        })
        .eq('id', user.id)

      if (error) throw error

      // Sincroniza género, teléfono, título profesional y show_phone en profiles
      // (phone, show_phone, gender y professional_title viven en profiles, no en professionals)
      const profileUpdate: Record<string, unknown> = {
        show_phone: values.show_phone,
        phone: values.phone ?? null,
      }
      if (values.gender === "M" || values.gender === "F" || values.gender === "other") {
        profileUpdate.gender = values.gender
      }
      if (values.professional_title !== undefined) {
        profileUpdate.professional_title = values.professional_title?.trim() || null
      }
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id)
      if (profileError) console.error("Error updating profile fields:", profileError)
      
      // Invalidar cache del perfil
      await mutateProfile()
      
      toast.success("Información general actualizada")
      generalForm.reset(values)
    } catch (err) {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  // Saves a single field directly to Supabase — bypasses full form validation
  // so fields are editable even when bio/registration_number aren't filled yet
  const onSaveFieldDirect = async (field: string, value: any) => {
    if (!user) return
    setSaving(true)
    try {
      const profileFields = ["gender", "phone", "show_phone", "professional_title"]
      if (profileFields.includes(field)) {
        const { error } = await supabase.from("profiles").update({ [field]: value }).eq("id", user.id)
        if (error) throw error
      } else if (field === "specialty_id") {
        const selectedSpecialty = specialties.find((s: any) => s.id === value)
        const updates: Record<string, unknown> = { specialty_id: value }
        if (selectedSpecialty) updates.specialty = selectedSpecialty.name_es
        const { error } = await supabase.from("professionals").update(updates).eq("id", user.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("professionals").update({ [field]: value }).eq("id", user.id)
        if (error) throw error
      }
      generalForm.setValue(field as any, value, { shouldDirty: false })
      await mutateProfile()
      toast.success("Guardado")
    } catch (err) {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const onSaveName = async (first_name: string, last_name: string) => {
    if (!user) return
    const trimmedFirst = first_name.trim()
    const trimmedLast = last_name.trim()
    if (!trimmedFirst) { toast.error("El nombre no puede estar vacío"); return }
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: trimmedFirst, last_name: trimmedLast })
      .eq("id", user.id)
    if (error) { toast.error("Error al guardar el nombre"); return }
    setProfileName({ first_name: trimmedFirst, last_name: trimmedLast })
    setPageProfile((p: any) => p ? { ...p, first_name: trimmedFirst, last_name: trimmedLast } : p)
    mutateProfile()
    toast.success("Nombre actualizado")
  }

  const handleProfilePhotoUpload = async (file: File) => {
    if (!user) return { success: false }
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/user/upload-avatar", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data?.success) {
        const message =
          data?.message ||
          "No se pudo actualizar la foto de perfil"
        throw new Error(message)
      }

      if (data.avatarUrl) {
        const timestampedUrl = `${data.avatarUrl}?t=${Date.now()}`
        setAvatarUrl(timestampedUrl)
      }

      // Refresca el perfil unificado (navbar, etc.)
      mutateProfile()

      toast.success("Foto de perfil actualizada")
      return { success: true }
    } catch (err) {
      toast.error("Error al subir foto")
      return { success: false }
    }
  }

  const onSaveClinical = async (values: z.infer<typeof clinicalSchema>) => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          conditions_treated: values.conditions_treated,
          consultation_type: values.consultation_type,
          clinic_address: values.clinic_address,
          clinic_city: values.clinic_city,
          patients_groups: values.patients_groups ?? [],
          payment_methods: values.payment_methods ?? [],
        })
        .eq('id', user.id)

      if (error) throw error
      
      // Invalidar cache del perfil
      await mutateProfile()
      
      toast.success("Información clínica actualizada")
      clinicalForm.reset(values)
    } catch (err) {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }



  const onSaveEducation = async (values: z.infer<typeof educationSchema>) => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          education: values.education
        })
        .eq('id', user.id)

      if (error) throw error
      
      // Invalidar cache del perfil
      await mutateProfile()
      
      toast.success("Historial educativo actualizado")
      educationForm.reset(values)
    } catch (err) {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const onSaveGallery = async (values: z.infer<typeof gallerySchema>) => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          clinic_images: values.clinic_images
        })
        .eq('id', user.id)

      if (error) throw error
      
      // Invalidar cache del perfil
      await mutateProfile()
      
      toast.success("Galería actualizada")
      galleryForm.reset(values)
    } catch (err) {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const onSaveSecurity = async (values: z.infer<typeof securitySchema>) => {
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.new_password
      })

      if (error) throw error
      toast.success("Contraseña actualizada correctamente")
      securityForm.reset()
    } catch (err) {
      toast.error("Error al actualizar contraseña")
    } finally {
      setSaving(false)
    }
  }

  const onSavePricing = async (data: z.infer<typeof pricingSchema>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/professional/consultation-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationTypes: data.consultationTypes })
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body?.error || 'Error al guardar los precios')
      } else {
        const body = await res.json().catch(() => ({}))
        
        // Invalidar cache del perfil para reflejar cambios
        await mutateProfile()
        
        toast.success('Precios guardados correctamente')
        pricingForm.reset(body?.consultationTypes ? { consultationTypes: body.consultationTypes } : data)
      }
    } catch (err) {
      toast.error('Error al guardar los precios')
    } finally {
      setSaving(false)
    }
  }

  const addPresetConsultationType = (preset: { name: string; price: number; duration_minutes: number; modality: 'online' | 'in-person' | 'both'; description?: string }) => {
    appendPricing({
      id: crypto.randomUUID(),
      ...preset,
    })
  }

  // --- Tag Management (conditions, patient groups, payment methods) ---
  const [tagInput, setTagInput] = useState("")
  const [patientsInput, setPatientsInput] = useState("")
  const [paymentsInput, setPaymentsInput] = useState("")

  const addConditionTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const currentTags = clinicalForm.getValues("conditions_treated")
      if (!currentTags.includes(tagInput.trim())) {
        clinicalForm.setValue("conditions_treated", [...currentTags, tagInput.trim()], { shouldDirty: true })
      }
      setTagInput("")
    }
  }

  const removeConditionTag = (tag: string) => {
    const currentTags = clinicalForm.getValues("conditions_treated")
    clinicalForm.setValue("conditions_treated", currentTags.filter(t => t !== tag), { shouldDirty: true })
  }

  const addPatientGroup = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && patientsInput.trim()) {
      e.preventDefault()
      const current = clinicalForm.getValues("patients_groups") || []
      if (!current.includes(patientsInput.trim())) {
        clinicalForm.setValue("patients_groups", [...current, patientsInput.trim()], { shouldDirty: true })
      }
      setPatientsInput("")
    }
  }

  const removePatientGroup = (value: string) => {
    const current = clinicalForm.getValues("patients_groups") || []
    clinicalForm.setValue("patients_groups", current.filter((v) => v !== value), { shouldDirty: true })
  }

  const addPaymentMethod = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && paymentsInput.trim()) {
      e.preventDefault()
      const current = clinicalForm.getValues("payment_methods") || []
      if (!current.includes(paymentsInput.trim())) {
        clinicalForm.setValue("payment_methods", [...current, paymentsInput.trim()], { shouldDirty: true })
      }
      setPaymentsInput("")
    }
  }

  const removePaymentMethod = (value: string) => {
    const current = clinicalForm.getValues("payment_methods") || []
    clinicalForm.setValue("payment_methods", current.filter((v) => v !== value), { shouldDirty: true })
  }

  const handleCredentialUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    if (file.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF")
      return
    }

    setSaving(true)
    try {
      const fileExt = "pdf"
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('credentials')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('credentials')
        .getPublicUrl(fileName)

      // Prompt for title and year
      const title = prompt("Nombre del Título/Diploma:", file.name.replace(".pdf", "")) || file.name
      const institution = prompt("Universidad/Institución:") || "Por definir"
      const year = prompt("Año de egreso:") || new Date().getFullYear().toString()

      const { data, error: insertError } = await supabase
        .from('professional_credentials')
        .insert({
          professional_id: user.id,
          title,
          institution,
          year,
          type,
          file_url: publicUrl,
          status: 'pending'
        })
        .select()
        .single()

      if (insertError) throw insertError
      
      setCredentials(prev => [data, ...prev])
      toast.success("Credencial subida y enviada a revisión")
    } catch (err) {
      console.error(err)
      toast.error("Error al subir credencial")
    } finally {
      setSaving(false)
    }
  }

  // --- Image Upload ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !user?.id) return

    setSaving(true)
    try {
      const currentImages = galleryForm.getValues("clinic_images")
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Math.random()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('clinic-photos')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('clinic-photos')
          .getPublicUrl(fileName)

        currentImages.push(publicUrl)
      }
      galleryForm.setValue("clinic_images", [...currentImages], { shouldDirty: true })
      toast.success("Imagen subida (Recuerda Guardar Cambios)")
    } catch (err) {
      console.error(err)
      toast.error("Error al subir imagen")
    } finally {
      setSaving(false)
    }
  }

  // Load specialties
  useEffect(() => {
    async function loadSpecialties() {
      const { data } = await supabase
        .from('specialties')
        .select('id, name_es')
        .eq('is_active', true)
        .order('name_es')
      
      if (data) setSpecialties(data)
    }
    loadSpecialties()
  }, [supabase])

  // Calculate completeness (max 100)
  // Subscribe to form changes via watch() callbacks instead of putting watch() in deps
  useEffect(() => {
    function recalc() {
      const values = generalForm.getValues()
      let score = 0
      if (avatarUrl) score += 15
      if (values.bio && values.bio.length >= 50) score += 20
      if ((values.years_experience ?? 0) > 0) score += 8
      if (values.registration_number) score += 10
      if (values.registration_institution) score += 5
      if (values.specialty_id) score += 10
      const clinicalValues = clinicalForm.getValues()
      if (clinicalValues.conditions_treated.length > 0) score += 10
      const eduValues = educationForm.getValues()
      if (eduValues.education.length > 0) score += 15
      if (credentials.length > 0) score += 5
      if (galleryForm.getValues("clinic_images").length > 0) score += 2
      setCompleteness(Math.min(100, score))
    }
    recalc()
    const sub1 = generalForm.watch(() => recalc())
    const sub2 = clinicalForm.watch(() => recalc())
    const sub3 = educationForm.watch(() => recalc())
    const sub4 = galleryForm.watch(() => recalc())
    return () => { sub1.unsubscribe(); sub2.unsubscribe(); sub3.unsubscribe(); sub4.unsubscribe() }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, [avatarUrl, credentials.length])

  if (loading) return (
    <div className={loadingDashboardInsetClassName("bg-background")}>
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-slate-500 font-medium">Cargando perfil...</p>
      </div>
    </div>
  )

  const displayName = profileName
    ? `${profileName.first_name} ${profileName.last_name}`.trim() || "Tu perfil"
    : "Tu perfil"

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* Header: nombre + Editar direcciones + Ver perfil público (referencia Doctoralia) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hola, {profileName?.first_name?.split(" ")[0] ?? displayName} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Tu perfil profesional
            {pageProfessional?.updated_at && (
              <> · Última edición {formatDistanceToNow(new Date(pageProfessional.updated_at), { addSuffix: true, locale: es })}</>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("clinical")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-xl border-slate-200 dark:border-slate-700 h-9 px-4 gap-2 text-slate-700 dark:text-slate-300"
          >
            <Building2 className="h-4 w-4" />
            Editar direcciones
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!publicProfilePath}
            onClick={() => publicProfilePath && window.open(publicProfilePath, "_blank")}
            className="rounded-xl border-slate-200 dark:border-slate-700 h-9 px-4 gap-2 text-slate-700 dark:text-slate-300"
          >
            <ExternalLink className="h-4 w-4" />
            Ver tu perfil público
          </Button>
        </div>
      </div>

      {/* ¿Qué tan atractivo es tu perfil? */}
      <ProfileCompleteness
        score={completeness}
        missingItems={[
          { label: "Premios", points: 1 },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className="h-auto p-0 rounded-none bg-white overflow-x-auto flex"
          style={{ borderBottom: "1px solid #e2e8f0" }}
        >
          {[
            { value: "general", label: "General" },
            { value: "clinical", label: "Clínica" },
            { value: "studies", label: "Estudios" },
            { value: "gallery", label: "Galería" },
            { value: "pricing", label: "Precios" },
            { value: "security", label: "Seguridad" },
            { value: "verification", label: "Verificación" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none px-4 py-2.5 whitespace-nowrap bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-slate-500 data-[state=active]:text-teal-600 font-semibold data-[state=active]:font-bold transition-colors"
              style={{
                fontSize: 12.5,
                borderBottom: activeTab === tab.value ? "2.5px solid #0d9488" : "2.5px solid transparent",
                marginBottom: -1,
              }}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* --- TAB: GENERAL --- */}
        <TabsContent value="general" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
          {/* Hero Card */}
          {pageProfile && (
            <HeroCard
              profile={pageProfile}
              professional={pageProfessional ?? {}}
              specialties={specialties}
              avatarUrl={avatarUrl}
              onUpload={handleProfilePhotoUpload}
              onRatingClick={() => setShowReviews((v) => !v)}
              onTabSwitch={setActiveTab}
            />
          )}

          {/* Reviews Panel */}
          {showReviews && user && (
            <ReviewsPanel
              professionalId={user.id}
              onClose={() => setShowReviews(false)}
            />
          )}

          <Form {...generalForm}>
            <form onSubmit={generalForm.handleSubmit(onSaveGeneral)} className="space-y-3">

              {/* Accordion: Datos personales */}
              <AccordionSection
                title="Datos personales"
                subtitle="Nombre, género y teléfono"
                icon={<User className="h-4 w-4" />}
                iconVariant="teal"
                preview={[
                  profileName ? `${profileName.first_name} ${profileName.last_name}`.trim() : "",
                  generalForm.watch("gender") === "M" ? "Hombre" : generalForm.watch("gender") === "F" ? "Mujer" : ""
                ].filter(Boolean).join(" · ")}
              >
                <PersonalDataFields
                  generalForm={generalForm}
                  profileName={profileName}
                  onSaveGeneral={onSaveGeneral}
                  onSaveName={onSaveName}
                  onSaveFieldDirect={onSaveFieldDirect}
                  saving={saving}
                />
              </AccordionSection>

              {/* Accordion: Trayectoria profesional */}
              <AccordionSection
                title="Trayectoria profesional"
                subtitle="Título, especialidad y experiencia"
                icon={<GraduationCapIcon className="h-4 w-4" />}
                iconVariant="blue"
                preview={[
                  pageProfile?.professional_title,
                  specialties.find((s: any) => s.id === generalForm.watch("specialty_id"))?.name_es,
                  generalForm.watch("years_experience") != null ? `${generalForm.watch("years_experience")} años` : null
                ].filter(Boolean).join(" · ")}
              >
                <ProfessionalTrajectoryFields
                  generalForm={generalForm}
                  specialties={specialties}
                  PROFESSIONAL_TITLES={PROFESSIONAL_TITLES}
                  customTitle={customTitle}
                  setCustomTitle={setCustomTitle}
                  onSaveGeneral={onSaveGeneral}
                  onSaveFieldDirect={onSaveFieldDirect}
                  saving={saving}
                />
              </AccordionSection>

              {/* Accordion: Condiciones que tratas */}
              <AccordionSection
                title="Condiciones que tratas"
                subtitle="Enfermedades y trastornos que atiendes"
                icon={<FlaskConical className="h-4 w-4" />}
                iconVariant="violet"
                preview={
                  (clinicalForm.watch("conditions_treated") ?? []).slice(0, 3).join(", ") || "Sin condiciones"
                }
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {(clinicalForm.watch("conditions_treated") ?? []).length > 0
                      ? clinicalForm.watch("conditions_treated").map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3 py-0.5"
                          >
                            {tag}
                          </span>
                        ))
                      : (
                          <span className="text-sm text-slate-400 italic">Sin condiciones configuradas.</span>
                        )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("clinical")}
                    className="text-sm font-medium text-teal-600 hover:underline"
                  >
                    Ir a Clínica para editar →
                  </button>
                </div>
              </AccordionSection>

              {/* Accordion: Biografía */}
              <BioAccordion
                generalForm={generalForm}
                onSaveGeneral={onSaveGeneral}
                onSaveFieldDirect={onSaveFieldDirect}
                saving={saving}
              />

            </form>
          </Form>
        </TabsContent>

        {/* --- TAB: CLINICAL --- */}
        <TabsContent value="clinical" id="clinical" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Form {...clinicalForm}>
            <form onSubmit={clinicalForm.handleSubmit(onSaveClinical)} className="space-y-3">

              {/* Accordion: Modalidad y Dirección */}
              <AccordionSection
                title="Modalidad de Atención"
                subtitle="Cómo atiendes a tus pacientes"
                icon={<Stethoscope className="h-4 w-4" />}
                iconVariant="teal"
                preview={
                  clinicalForm.watch("consultation_type") === "online" ? "Online" :
                  clinicalForm.watch("consultation_type") === "in-person" ? "Presencial" :
                  clinicalForm.watch("consultation_type") === "both" ? "Online y Presencial" : ""
                }
              >
                <div className="space-y-4 px-5 py-4">
                  <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">¿Cómo atiendes?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'online', label: 'Online', icon: Monitor, color: 'text-indigo-600', bg: 'bg-indigo-50/50', desc: 'Videollamada' },
                        { id: 'in-person', label: 'Presencial', icon: Building2, color: 'text-rose-600', bg: 'bg-rose-50/50', desc: 'En consultorio' },
                        { id: 'both', label: 'Ambos', icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50/50', desc: 'Online y presencial' }
                      ].map((type) => {
                        const isActive = clinicalForm.watch("consultation_type") === type.id
                        return (
                          <div
                            key={type.id}
                            onClick={() => clinicalForm.setValue("consultation_type", type.id as any, { shouldDirty: true })}
                            className={cn(
                              "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer h-16 group",
                              isActive
                                ? "border-teal-600 bg-teal-50/20 shadow-md shadow-teal-100/50"
                                : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            <type.icon className={cn("h-5 w-5 mb-1 transition-all", isActive ? type.color : "text-slate-300 group-hover:text-slate-400")} />
                            <span className={cn("text-sm font-black uppercase tracking-wider", isActive ? "text-slate-900" : "text-slate-400")}>{type.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {(clinicalForm.watch("consultation_type") === "in-person" || clinicalForm.watch("consultation_type") === "both") && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="h-4 w-4 text-rose-500" />
                        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Ubicación del consultorio</p>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <FormField
                          control={clinicalForm.control}
                          name="clinic_address"
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1 block">Dirección</FormLabel>
                              <FormControl>
                                <GoogleAddressInput
                                  value={field.value}
                                  onChange={field.onChange}
                                  className="rounded-xl h-9 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-sm font-bold"
                                  placeholder="Ej: Av. Providencia 1234"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={clinicalForm.control}
                          name="clinic_city"
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1 block">Ciudad / Comuna</FormLabel>
                              <FormControl>
                                <Input {...field} className="rounded-xl h-9 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-sm font-bold" placeholder="Ej: Santiago / Las Condes" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </AccordionSection>

              {/* Accordion: Condiciones y Pacientes */}
              <AccordionSection
                title="Condiciones y pacientes"
                subtitle="Enfermedades que tratas y grupos de pacientes"
                icon={<FlaskConical className="h-4 w-4" />}
                iconVariant="violet"
                preview={
                  (clinicalForm.watch("conditions_treated") ?? []).slice(0, 2).join(", ") || "Sin condiciones"
                }
              >
                <div className="space-y-4 px-5 py-4">
                  <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">Condiciones y Enfermedades que tratas</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Escribe una condición y presiona Enter..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={addConditionTag}
                        className="rounded-xl h-9 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-sm font-bold"
                      />
                      <Button
                        type="button"
                        onClick={() => addConditionTag({ key: 'Enter', preventDefault: () => {} } as any)}
                        variant="outline"
                        className="rounded-xl h-10 w-10 shrink-0 border-slate-200 hover:border-teal-300 transition-all p-0 flex items-center justify-center"
                      >
                        <Plus className="h-5 w-5 text-teal-600" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-50/50 border border-slate-100 min-h-[48px] items-start">
                      {clinicalForm.watch("conditions_treated").length === 0 && (
                        <div className="flex flex-col items-center justify-center w-full h-full text-slate-300 gap-2">
                          <Info className="h-6 w-6 opacity-50" />
                          <p className="italic text-xs font-medium">No has añadido etiquetas aún.</p>
                        </div>
                      )}
                      {clinicalForm.watch("conditions_treated").map(tag => (
                        <Badge
                          key={tag}
                          className="bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer group rounded-full px-3 py-1.5 gap-2 border shadow-sm text-xs font-bold"
                          onClick={() => removeConditionTag(tag)}
                        >
                          {tag}
                          <X className="h-3 w-3 text-slate-300 group-hover:text-rose-500 transition-colors" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">Pacientes que atiendes</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ej: Adultos, Niños, Parejas..."
                        value={patientsInput}
                        onChange={(e) => setPatientsInput(e.target.value)}
                        onKeyDown={addPatientGroup}
                        className="rounded-xl h-9 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-sm font-bold"
                      />
                      <Button
                        type="button"
                        onClick={() => addPatientGroup({ key: 'Enter', preventDefault: () => {} } as any)}
                        variant="outline"
                        className="rounded-xl h-10 w-10 shrink-0 border-slate-200 hover:border-teal-300 transition-all p-0 flex items-center justify-center"
                      >
                        <Plus className="h-5 w-5 text-teal-600" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-50/50 border border-slate-100 min-h-[48px] items-start">
                      {(!clinicalForm.watch("patients_groups") || clinicalForm.watch("patients_groups")?.length === 0) && (
                        <p className="italic text-xs font-medium text-slate-300">Ejemplos: Adultos, Niños, Adolescentes, Parejas...</p>
                      )}
                      {(clinicalForm.watch("patients_groups") || []).map((g: string) => (
                        <Badge
                          key={g}
                          className="bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer group rounded-full px-3 py-1.5 gap-2 border shadow-sm text-xs font-bold"
                          onClick={() => removePatientGroup(g)}
                        >
                          {g}
                          <X className="h-3 w-3 text-slate-300 group-hover:text-rose-500 transition-colors" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionSection>

              {/* Accordion: Métodos de Pago */}
              <AccordionSection
                title="Formas de pago"
                subtitle="Cómo pueden pagarte los pacientes"
                icon={<DollarSign className="h-4 w-4" />}
                iconVariant="blue"
                preview={(clinicalForm.watch("payment_methods") ?? []).slice(0, 3).join(", ") || "Sin configurar"}
              >
                <div className="space-y-3 px-5 py-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ej: Transferencia bancaria, Efectivo..."
                      value={paymentsInput}
                      onChange={(e) => setPaymentsInput(e.target.value)}
                      onKeyDown={addPaymentMethod}
                      className="rounded-xl h-9 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-sm font-bold"
                    />
                    <Button
                      type="button"
                      onClick={() => addPaymentMethod({ key: 'Enter', preventDefault: () => {} } as any)}
                      variant="outline"
                      className="rounded-xl h-10 w-10 shrink-0 border-slate-200 hover:border-teal-300 transition-all p-0 flex items-center justify-center"
                    >
                      <Plus className="h-5 w-5 text-teal-600" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-50/50 border border-slate-100 min-h-[48px] items-start">
                    {(!clinicalForm.watch("payment_methods") || clinicalForm.watch("payment_methods")?.length === 0) && (
                      <p className="italic text-xs font-medium text-slate-300">Ejemplos: Transferencia bancaria, Efectivo, Tarjeta de débito...</p>
                    )}
                    {(clinicalForm.watch("payment_methods") || []).map((m: string) => (
                      <Badge
                        key={m}
                        className="bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer group rounded-full px-3 py-1.5 gap-2 border shadow-sm text-xs font-bold"
                        onClick={() => removePaymentMethod(m)}
                      >
                        {m}
                        <X className="h-3 w-3 text-slate-300 group-hover:text-rose-500 transition-colors" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </AccordionSection>

              {/* Save */}
              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={!clinicalForm.formState.isDirty || saving}
                  className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 px-6 font-bold text-sm shadow-md shadow-teal-200/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Guardar Cambios
                </Button>
              </div>

            </form>
          </Form>
        </TabsContent>

        {/* --- TAB: STUDIES --- */}
        <TabsContent value="studies" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Form {...educationForm}>
            <form onSubmit={educationForm.handleSubmit(onSaveEducation)} className="space-y-4">
              <AccordionSection
                title="Historial Académico"
                subtitle="Gestiona tus títulos y certificaciones profesionales"
                icon={<GraduationCap className="h-4 w-4" />}
                iconVariant="teal"
                preview={`${eduFields.length} título${eduFields.length !== 1 ? 's' : ''} registrado${eduFields.length !== 1 ? 's' : ''}`}
              >
                <div className="space-y-4 px-5 py-4">
                  <div className="grid gap-3">
                    {eduFields.map((field, index) => (
                      <div key={field.id} className="p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/30 border border-slate-100/60 dark:border-slate-800/60 relative group animate-in zoom-in duration-500 hover:border-teal-100/60 dark:hover:border-teal-900/60 hover:bg-teal-50/10 dark:hover:bg-teal-950/10 transition-all">
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 opacity-0 group-hover:opacity-100 transition-all h-8 w-8 rounded-lg"
                          onClick={() => removeEdu(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <FormField
                            control={educationForm.control}
                            name={`education.${index}.institution`}
                            render={({ field }: { field: any }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Institución</FormLabel>
                                <FormControl>
                                  <Input {...field} className="rounded-xl h-9 bg-white/70 dark:bg-slate-950/70 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 text-sm font-bold dark:text-slate-200" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={educationForm.control}
                            name={`education.${index}.degree`}
                            render={({ field }: { field: any }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Título / Especialidad</FormLabel>
                                <FormControl>
                                  <Input {...field} className="rounded-xl h-9 bg-white/70 dark:bg-slate-950/70 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 text-sm font-bold dark:text-slate-200" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={educationForm.control}
                            name={`education.${index}.graduation_year`}
                            render={({ field }: { field: any }) => (
                              <FormItem className="sm:col-span-1">
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Año de Egreso</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} className="rounded-xl h-9 bg-white/70 dark:bg-slate-950/70 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 text-sm font-bold w-full sm:w-32 dark:text-slate-200" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => appendEdu({ institution: "", degree: "", graduation_year: "" })}
                      className="h-10 rounded-xl border-dashed border-teal-200/60 dark:border-teal-800/60 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-400 dark:hover:border-teal-600 transition-all font-bold text-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir Título
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!educationForm.formState.isDirty || saving}
                      className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-500 rounded-xl h-10 px-6 font-bold text-sm shadow-md shadow-teal-200/50 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Guardar
                    </Button>
                  </div>
                </div>
              </AccordionSection>
            </form>
          </Form>
        </TabsContent>

        {/* --- TAB: GALLERY --- */}
        <TabsContent value="gallery" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Form {...galleryForm}>
            <form onSubmit={galleryForm.handleSubmit(onSaveGallery)} className="space-y-4">
              <AccordionSection
                title="Galería de Consultorio"
                subtitle="Muestra tu espacio de trabajo a tus futuros pacientes"
                icon={<Camera className="h-4 w-4" />}
                iconVariant="blue"
                preview={`${galleryForm.watch("clinic_images").length} imagen${galleryForm.watch("clinic_images").length !== 1 ? 'es' : ''}`}
              >
                <div className="space-y-4 px-5 py-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {galleryForm.watch("clinic_images").map((img, idx) => (
                      <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm group hover:scale-[1.05] transition-all duration-500">
                        <img src={img} className="w-full h-full object-cover" alt="Vista del consultorio" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button"
                            className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition-transform hover:bg-rose-50 dark:hover:bg-rose-950"
                            onClick={() => {
                              const imgs = galleryForm.getValues("clinic_images")
                              galleryForm.setValue("clinic_images", imgs.filter((_, i) => i !== idx), { shouldDirty: true })
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <label className="aspect-[4/3] rounded-2xl border-2 border-dashed border-teal-200/60 dark:border-teal-800/60 bg-teal-50/10 dark:bg-teal-950/20 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50/40 dark:hover:bg-teal-900/30 hover:border-teal-400 dark:hover:border-teal-600 hover:scale-[1.02] transition-all group overflow-hidden relative">
                        <div className="absolute inset-0 bg-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Upload className="h-8 w-8 text-teal-600 dark:text-teal-400 mb-2 group-hover:-translate-y-1 transition-transform duration-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-500">Subir Imagen</span>
                        <input type="file" multiple className="hidden" onChange={handleFileUpload} accept="image/*" />
                    </label>
                  </div>
                  <div className="flex gap-4 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-indigo-900 dark:text-indigo-300 group">
                    <div className="p-2 bg-white dark:bg-indigo-900/50 rounded-xl shadow-sm h-fit">
                      <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm mb-1 dark:text-indigo-200">Paso Importante</p>
                      <p className="text-xs text-slate-600 dark:text-indigo-300/80 leading-relaxed">Al subir imágenes, estas se procesan en el servidor. <span className="text-indigo-600 dark:text-indigo-400 font-bold">Recuerda presionar el botón "Guardar Cambios"</span> para publicarlas en tu perfil.</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={!galleryForm.formState.isDirty || saving}
                      className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-500 rounded-xl h-10 px-6 font-bold text-sm shadow-md shadow-teal-200/50 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Guardar Cambios
                    </Button>
                  </div>
                </div>
              </AccordionSection>
            </form>
          </Form>
        </TabsContent>

        {/* --- TAB: PRICING --- */}
        <TabsContent value="pricing" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Form {...pricingForm}>
            <form onSubmit={pricingForm.handleSubmit(onSavePricing)} className="space-y-4">
              <AccordionSection
                title="Precios y Servicios"
                subtitle="Define los tipos de consulta que ofreces, su precio y duración"
                icon={<DollarSign className="h-4 w-4" />}
                iconVariant="teal"
                preview={`${pricingFields.length} servicio${pricingFields.length !== 1 ? 's' : ''}`}
              >
                <div className="space-y-4 px-5 py-4">
                  {/* Preset buttons */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Añadir servicio rápido</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: "Consulta General", price: 25000, duration_minutes: 60, modality: "both" as const },
                        { name: "Primera Consulta", price: 35000, duration_minutes: 60, modality: "both" as const },
                        { name: "Consulta de Seguimiento", price: 20000, duration_minutes: 30, modality: "both" as const },
                        { name: "Atención de Urgencia", price: 45000, duration_minutes: 30, modality: "in-person" as const },
                      ].map((preset) => (
                        <Button
                          key={preset.name}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addPresetConsultationType(preset)}
                          className="rounded-xl h-9 px-4 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400 hover:text-teal-700 dark:hover:border-teal-600 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-all text-xs font-bold gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {preset.name}
                        </Button>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPresetConsultationType({ name: "", price: 0, duration_minutes: 60, modality: "both" })}
                        className="rounded-xl h-9 px-4 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-teal-400 hover:text-teal-700 dark:hover:border-teal-600 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-all text-xs font-bold gap-1.5"
                      >
                        <Tag className="h-3.5 w-3.5" />
                        Personalizado
                      </Button>
                    </div>
                  </div>

                  {/* Empty state */}
                  {pricingFields.length === 0 && (
                    <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <div className="w-16 h-16 bg-white dark:bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-slate-800">
                        <DollarSign className="h-8 w-8 text-slate-200 dark:text-slate-700" />
                      </div>
                      <p className="text-base font-bold text-slate-500 dark:text-slate-400 mb-1">Sin servicios configurados</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mb-5">Los pacientes verán tus precios directamente en tu perfil.</p>
                      <Button
                        type="button"
                        onClick={() => addPresetConsultationType({ name: "Consulta General", price: 25000, duration_minutes: 60, modality: "both" })}
                        className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white h-10 px-6 font-bold text-sm gap-2 shadow-md shadow-teal-200/50 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Plus className="h-4 w-4" />
                        Añadir tu primer servicio
                      </Button>
                    </div>
                  )}

                  {/* Consultation type cards */}
                  {pricingFields.length > 0 && (
                    <div className="grid gap-3">
                      {pricingFields.map((field, index) => {
                        const modality = pricingForm.watch(`consultationTypes.${index}.modality`)
                        const price = pricingForm.watch(`consultationTypes.${index}.price`)
                        return (
                          <div
                            key={field.id}
                            className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden"
                          >
                            {/* Card top bar */}
                            <div className="flex items-center justify-between px-5 py-3 bg-slate-50/60 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={cn(
                                    "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border-0",
                                    modality === 'both'
                                      ? "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300"
                                      : modality === 'online'
                                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                                      : "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                                  )}
                                >
                                  {modality === 'both' ? 'Online + Presencial' : modality === 'online' ? 'Online' : 'Presencial'}
                                </Badge>
                                <span className="text-sm font-black text-teal-700 dark:text-teal-400">
                                  {price > 0 ? `$${price.toLocaleString('es-CL')} CLP` : '—'}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removePricing(index)}
                                className="h-8 w-8 rounded-lg text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Card body */}
                            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Name */}
                              <FormField
                                control={pricingForm.control}
                                name={`consultationTypes.${index}.name`}
                                render={({ field: f }: { field: any }) => (
                                  <FormItem className="sm:col-span-2">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Nombre del servicio</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...f}
                                        placeholder="Ej: Consulta General"
                                        className="rounded-xl h-9 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold dark:text-slate-200"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Price */}
                              <FormField
                                control={pricingForm.control}
                                name={`consultationTypes.${index}.price`}
                                render={({ field: f }: { field: any }) => (
                                  <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Precio</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-bold select-none">$</span>
                                        <Input
                                          {...f}
                                          type="number"
                                          min={0}
                                          step={500}
                                          placeholder="25000"
                                          className="rounded-xl h-9 pl-7 pr-14 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold dark:text-slate-200"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs font-black select-none">CLP</span>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Duration */}
                              <FormField
                                control={pricingForm.control}
                                name={`consultationTypes.${index}.duration_minutes`}
                                render={({ field: f }: { field: any }) => (
                                  <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Duración</FormLabel>
                                    <Select
                                      onValueChange={(val) => f.onChange(Number(val))}
                                      value={String(f.value)}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="rounded-xl h-9 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold">
                                          <SelectValue placeholder="Selecciona" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {[15, 30, 45, 60, 90, 120].map((min) => (
                                          <SelectItem key={min} value={String(min)}>{min} min</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Modality */}
                              <FormField
                                control={pricingForm.control}
                                name={`consultationTypes.${index}.modality`}
                                render={({ field: f }: { field: any }) => (
                                  <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Modalidad</FormLabel>
                                    <Select onValueChange={f.onChange} value={f.value}>
                                      <FormControl>
                                        <SelectTrigger className="rounded-xl h-9 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold">
                                          <SelectValue placeholder="Selecciona" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="online">Online</SelectItem>
                                        <SelectItem value="in-person">Presencial</SelectItem>
                                        <SelectItem value="both">Ambas</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Description (optional) */}
                              <FormField
                                control={pricingForm.control}
                                name={`consultationTypes.${index}.description`}
                                render={({ field: f }: { field: any }) => (
                                  <FormItem className="sm:col-span-2">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                      Descripción <span className="normal-case text-slate-400 dark:text-slate-500 font-medium">(opcional)</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Textarea
                                        {...f}
                                        placeholder="Describe brevemente este servicio..."
                                        rows={2}
                                        className="rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-medium resize-none dark:text-slate-200"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {pricingFields.length > 0 && (
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 px-6 font-bold text-sm gap-2 shadow-md shadow-teal-200/50 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Guardar Precios
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionSection>
            </form>
          </Form>
        </TabsContent>

        {/* --- TAB: SECURITY --- */}
        <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Form {...securityForm}>
            <form onSubmit={securityForm.handleSubmit(onSaveSecurity)} className="space-y-4">
              <AccordionSection
                title="Seguridad de la Cuenta"
                subtitle="Protege tu acceso y credenciales profesionales"
                icon={<Lock className="h-4 w-4" />}
                iconVariant="blue"
                preview={user?.email ?? ""}
              >
                <div className="space-y-4 px-5 py-4">
                  <div className="grid gap-3 max-w-2xl">
                    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                        <User className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Correo Electrónico</p>
                        <p className="text-base font-bold text-slate-900 dark:text-slate-200">{user?.email}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <FormField
                        control={securityForm.control}
                        name="new_password"
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Nueva Contraseña</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} autoComplete="new-password" className="rounded-xl h-9 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-all text-sm font-bold dark:text-slate-200" placeholder="Mínimo 8 caracteres" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={securityForm.control}
                        name="confirm_password"
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Confirmar Contraseña</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} autoComplete="new-password" className="rounded-xl h-9 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-all text-sm font-bold dark:text-slate-200" placeholder="Repite tu contraseña" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 text-amber-900 dark:text-amber-300">
                    <div className="p-2 bg-white dark:bg-amber-900/50 rounded-xl shadow-sm h-fit">
                      <Key className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div>
                      <p className="font-bold text-sm mb-1 dark:text-amber-200">Aviso de Sesión</p>
                      <p className="text-xs text-slate-600 dark:text-amber-400/80 leading-relaxed">Si cambias tu contraseña, <span className="text-amber-700 dark:text-amber-500 font-bold">se cerrará la sesión en todos tus otros dispositivos</span> por motivos de seguridad.</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl h-10 px-6 font-bold text-sm shadow-md shadow-slate-200/50 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                      Actualizar Contraseña
                    </Button>
                  </div>
                </div>
              </AccordionSection>
            </form>
          </Form>
        </TabsContent>

        {/* --- TAB: VERIFICATION --- */}
        <TabsContent value="verification" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4">
            <AccordionSection
              title="Subir Documentos"
              subtitle="Sube tus títulos y diplomas para obtener el sello oficial de NUREA"
              icon={<ShieldCheck className="h-4 w-4" />}
              iconVariant="teal"
                preview={`${credentials.length} documento${credentials.length !== 1 ? 's' : ''} subido${credentials.length !== 1 ? 's' : ''}`}
            >
              <div className="px-5 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {['Título', 'Diplomado', 'Magíster', 'Curso'].map((type) => (
                    <div key={type} className="relative group p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-600 hover:bg-teal-50/30 dark:hover:bg-teal-900/20 transition-all text-center">
                      <div className="w-12 h-12 bg-white dark:bg-slate-950 rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 text-slate-300 dark:text-slate-600 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:scale-110 group-hover:rotate-6 transition-all border border-slate-100 dark:border-slate-800">
                        <Upload className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 group-hover:text-teal-700 dark:group-hover:text-teal-300">{type}</span>
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        accept=".pdf"
                        onChange={(e) => handleCredentialUpload(e, type)}
                        disabled={saving}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </AccordionSection>

            <AccordionSection
              title="Estado de tus Documentos"
              subtitle="Historial de documentos subidos y su estado de verificación"
              icon={<History className="h-4 w-4" />}
              iconVariant="violet"
              preview={
                credentials.length > 0
                  ? `${credentials.filter(c => c.status === 'verified').length} verificado${credentials.filter(c => c.status === 'verified').length !== 1 ? 's' : ''}`
                  : "Sin documentos"
              }
            >
              <div className="px-5 py-4">
                {loadingCredentials ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600 dark:text-teal-400" />
                    <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">Cargando documentos...</p>
                  </div>
                ) : credentials.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-12 bg-white dark:bg-slate-950 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-slate-800">
                      <FileText className="h-6 w-6 text-slate-200 dark:text-slate-700" />
                    </div>
                    <p className="text-base font-bold text-slate-400 dark:text-slate-500">Aún no has subido documentos para verificar.</p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Tu perfil será más confiable al verificar tus estudios.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {credentials.map((cred) => (
                      <div key={cred.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all gap-4 group">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all",
                            cred.status === 'verified' ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400" : 
                            cred.status === 'rejected' ? "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400" : "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400"
                          )}>
                            <FileText className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="text-base font-black text-slate-900 dark:text-slate-200">{cred.title}</h4>
                              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                                {cred.type}
                              </Badge>
                            </div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{cred.institution} <span className="mx-2 text-slate-300 dark:text-slate-700">•</span> {cred.year}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <div className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm flex items-center gap-1.5",
                            cred.status === 'verified' ? "bg-emerald-500 dark:bg-emerald-600 text-white border-emerald-400 dark:border-emerald-700" : 
                            cred.status === 'rejected' ? "bg-rose-500 dark:bg-rose-600 text-white border-rose-400 dark:border-rose-700" : "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700"
                          )}>
                            {cred.status === 'verified' ? (
                              <><ShieldCheck className="h-3 w-3" /> Verificado</>
                            ) : cred.status === 'rejected' ? (
                              <><X className="h-3 w-3" /> Rechazado</>
                            ) : (
                              <><History className="h-3 w-3" /> Pendiente</>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-9 w-9 rounded-lg border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-200 dark:hover:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-all"
                              asChild
                            >
                              <a href={cred.file_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            {cred.status === 'pending' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 rounded-lg text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all opacity-0 group-hover:opacity-100"
                                onClick={() => handleDeleteCredential(cred.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AccordionSection>
          </div>
        </TabsContent>
      </Tabs>

      {/* Persistence Warning */}
      <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] py-4 border-t border-slate-50 dark:border-slate-800">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500 animate-pulse" />
        Tus cambios no son públicos hasta que presionas guardar cambios
      </div>
    </div>
  )
}
