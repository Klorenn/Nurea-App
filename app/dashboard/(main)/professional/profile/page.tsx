"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { GoogleAddressInput } from "@/components/ui/google-address-input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import {
  User,
  Stethoscope,
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

export default function ProfessionalProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { profile, mutate: mutateProfile } = useProfile()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [specialties, setSpecialties] = useState<any[]>([])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [profileName, setProfileName] = useState<{ first_name: string; last_name: string } | null>(null)
  const [publicProfilePath, setPublicProfilePath] = useState<string | null>(null)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          phone: values.phone ?? null,
          show_phone: values.show_phone,
        })
        .eq('id', user.id)

      if (error) throw error

      // Sincroniza género, título profesional y show_phone en profiles
      const profileUpdate: Record<string, unknown> = {
        show_phone: values.show_phone,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarUrl, credentials.length])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      <p className="text-slate-500 font-medium">Cargando perfil...</p>
    </div>
  )

  const displayName = profileName
    ? `${profileName.first_name} ${profileName.last_name}`.trim() || "Tu perfil"
    : "Tu perfil"

  const initialTab = (searchParams.get("tab") as "general" | "clinical" | "studies" | "gallery" | "security" | "verification" | "pricing") || "general"

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* Header: nombre + Editar direcciones + Ver perfil público (referencia Doctoralia) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {displayName}
        </h1>
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
        missingHint="Agrega la información que falta"
        missingItems={[
          { label: "Premios", points: 1, onAdd: () => {} },
        ]}
      />

      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="bg-slate-100/40 dark:bg-slate-800/40 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/50 mb-6 w-full sm:w-auto h-auto flex-wrap gap-1">
          {[
            { value: "general", label: "General", icon: User },
            { value: "clinical", label: "Clínica", icon: Stethoscope },
            { value: "studies", label: "Estudios", icon: GraduationCap },
            { value: "gallery", label: "Galería", icon: Camera },
            { value: "pricing", label: "Precios", icon: DollarSign },
            { value: "security", label: "Seguridad", icon: Lock },
            { value: "verification", label: "Verificación", icon: ShieldCheck },
          ].map((tab) => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="rounded-lg px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 transition-all font-bold text-slate-600 dark:text-slate-400 text-sm"
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* --- TAB: GENERAL --- */}
        <TabsContent value="general" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          {/* Información básica: bloque dos columnas (referencia) */}
          <ProfileSectionCard
            title="Información básica"
            description="Añade tu información principal y una foto tuya en la que tu cara sea fácil de identificar. Nuestra IA revisa tu foto manteniéndola a salvo y asegurándose de que nunca se utiliza para ningún otro propósito."
            onEdit={() => {
              // Trigger click on the avatar uploader button/area
              const uploaderBtn = document.querySelector('[data-avatar-uploader-trigger]') as HTMLButtonElement
              uploaderBtn?.click()
            }}
            editLabel="Cambiar foto"
          >
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex justify-center sm:justify-start">
                <ProfilePhotoUpload
                  currentUrl={avatarUrl || profile?.avatar_url || undefined}
                  onUpload={handleProfilePhotoUpload}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tratamiento</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {specialties.find(s => s.id === generalForm.watch("specialty_id"))?.name_es || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre</p>
                  <p className="font-medium text-slate-900 dark:text-white">{profileName?.first_name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Apellidos</p>
                  <p className="font-medium text-slate-900 dark:text-white">{profileName?.last_name || "—"}</p>
                </div>
              </div>
            </div>
          </ProfileSectionCard>

          {/* Introducción / Sobre mí */}
          <ProfileSectionCard
            title="Introducción"
            description="Añade una descripción tuya. Los pacientes aprecian un lenguaje sencillo y acogedor."
            onEdit={() => document.getElementById("form-general")?.scrollIntoView({ behavior: "smooth" })}
            editLabel="Editar"
          >
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {(() => {
                const rawBio = generalForm.watch("bio") || ""
                const plainText = rawBio
                  .replace(/<[^>]+>/g, "")
                  .replace(/&nbsp;/g, " ")
                  .trim()

                if (!plainText) {
                  return (
                    <p className="text-slate-400 dark:text-slate-500 italic">
                      Sin descripción. Edita en la sección General para añadir tu biografía.
                    </p>
                  )
                }

                const preview =
                  plainText.length > 300 ? `${plainText.slice(0, 300)}…` : plainText

                return <p className="whitespace-pre-wrap">{preview}</p>
              })()}
            </div>
          </ProfileSectionCard>

          <Form {...generalForm}>
            <form onSubmit={generalForm.handleSubmit(onSaveGeneral)} className="space-y-6">
              <Card id="form-general" className="border-slate-100 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-950 scroll-mt-24">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-teal-50 dark:bg-teal-500/10 rounded-lg">
                      <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">Información General</CardTitle>
                      <CardDescription className="text-xs">Detalles básicos sobre tu trayectoria profesional.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10">
                    {/* Left Column: Profile Photo */}
                    <div className="flex flex-col items-center pt-4">
                      <ProfilePhotoUpload
                        currentUrl={avatarUrl || profile?.avatar_url || undefined}
                        onUpload={handleProfilePhotoUpload}
                      />
                    </div>

                    {/* Right Column: Fields */}
                    <div className="space-y-4">
                      {/* Row 1: Experience & Registration */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <FormField
                          control={generalForm.control}
                          name="years_experience"
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <div className="flex items-center gap-2 mb-1.5">
                                <History className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                <FormLabel className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Años de experiencia</FormLabel>
                              </div>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={field.value ?? ""}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    if (val === "") {
                                      field.onChange(undefined)
                                    } else {
                                      const parsed = parseInt(val, 10)
                                      if (!Number.isNaN(parsed) && parsed >= 0) {
                                        field.onChange(parsed)
                                      }
                                    }
                                  }}
                                  placeholder="Ej: 5"
                                  className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold text-center dark:text-slate-200"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={generalForm.control}
                          name="registration_number"
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <div className="flex items-center gap-2 mb-1.5">
                                <BadgeCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                <FormLabel className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Nº Registro Profesional</FormLabel>
                              </div>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Ej: 123456-7"
                                  className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold dark:text-slate-200"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={generalForm.control}
                          name="registration_institution"
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <div className="flex items-center gap-2 mb-1.5">
                                <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                <FormLabel className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Institución emisora</FormLabel>
                              </div>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Ej: Superintendencia de Salud / Colegio Médico"
                                  className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold dark:text-slate-200"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Professional Title */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Título profesional abreviado
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {PROFESSIONAL_TITLES.map((t) => {
                            const currentTitle = generalForm.watch("professional_title")
                            const isSelected = t.value === "Otro"
                              ? customTitle
                              : currentTitle === t.value && !customTitle
                            return (
                              <button
                                key={t.value}
                                type="button"
                                onClick={() => {
                                  if (t.value === "Otro") {
                                    setCustomTitle(true)
                                    generalForm.setValue("professional_title", "", { shouldDirty: true })
                                  } else {
                                    setCustomTitle(false)
                                    generalForm.setValue("professional_title", t.value, { shouldDirty: true })
                                  }
                                }}
                                className={cn(
                                  "px-3 py-1.5 rounded-xl text-sm font-bold border transition-all",
                                  isSelected
                                    ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400 hover:text-teal-700"
                                )}
                              >
                                {t.label}
                                <span className={cn("ml-1 text-[10px] font-normal", isSelected ? "text-teal-100" : "text-slate-400")}>
                                  {t.desc}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                        {customTitle && (
                          <Input
                            value={generalForm.watch("professional_title") || ""}
                            onChange={(e) => generalForm.setValue("professional_title", e.target.value, { shouldDirty: true })}
                            placeholder="Ej: Lic., Kine., Mat., etc."
                            className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-sm font-bold"
                            autoFocus
                          />
                        )}
                        {!customTitle && !generalForm.watch("professional_title") && (
                          <p className="text-[11px] text-slate-400 italic">
                            Selecciona el título que aparecerá junto a tu nombre en el perfil público.
                          </p>
                        )}
                      </div>

                      {/* Gender */}
                      <FormField
                        control={generalForm.control}
                        name="gender"
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <div className="flex items-center gap-2 mb-1.5">
                              <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                              <FormLabel className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Género
                              </FormLabel>
                            </div>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || undefined}
                            >
                              <FormControl>
                                <SelectTrigger className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold">
                                  <SelectValue placeholder="Selecciona" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="M">Hombre</SelectItem>
                                <SelectItem value="F">Mujer</SelectItem>
                                <SelectItem value="other">Prefiero no especificar</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Phone */}
                      <div className="space-y-2">
                        <FormField
                          control={generalForm.control}
                          name="phone"
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <div className="flex items-center gap-2 mb-1.5">
                                <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                <FormLabel className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  Teléfono de contacto
                                </FormLabel>
                              </div>
                              <FormControl>
                                <div className="flex">
                                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-bold select-none">
                                    +56
                                  </span>
                                  <Input
                                    type="tel"
                                    {...field}
                                    placeholder="9 1234 5678"
                                    className="rounded-l-none rounded-r-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold dark:text-slate-200"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Mostrar teléfono en perfil público</p>
                            <p className="text-xs text-slate-400 mt-0.5">Los pacientes podrán ver y llamarte directamente</p>
                          </div>
                          <Switch
                            checked={generalForm.watch("show_phone") ?? true}
                            onCheckedChange={(v) => generalForm.setValue("show_phone", v, { shouldDirty: true })}
                          />
                        </div>
                      </div>

                      {/* Row 2: Specialties */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={generalForm.control}
                          name="specialty_id"
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <div className="flex items-center gap-2 mb-1.5">
                                <Award className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                <FormLabel className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Especialidad Principal</FormLabel>
                              </div>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold">
                                    <SelectValue placeholder="Selecciona una especialidad" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {specialties.map(spec => (
                                    <SelectItem key={spec.id} value={spec.id}>{spec.name_es}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            <FormLabel className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Condiciones que tratas
                            </FormLabel>
                          </div>
                          <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 min-h-[40px]">
                            {clinicalForm.watch("conditions_treated")?.length
                              ? clinicalForm.watch("conditions_treated").map((tag: string) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-100 dark:border-teal-900/50 rounded-lg"
                                  >
                                    {tag}
                                  </Badge>
                                ))
                              : (
                                  <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                                    Edita las condiciones en la pestaña Clínica.
                                  </span>
                                )}
                          </div>
                          <FormDescription className="text-[10px] italic">
                            Este resumen muestra las enfermedades que configuras en la sección Clínica.
                          </FormDescription>
                        </div>
                      </div>

                      {/* Row 3: Bio */}
                      <FormField
                        control={generalForm.control}
                        name="bio"
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <div className="flex items-center gap-2 mb-1.5">
                              <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                              <FormLabel className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Biografía Profesional</FormLabel>
                            </div>
                            <FormControl>
                              <TipTapEditor 
                                value={field.value} 
                                onChange={field.onChange}
                                placeholder="Describe tu enfoque, especialidad y lo que ofreces a tus pacientes..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/30 dark:bg-slate-900/30 p-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!generalForm.formState.isDirty || saving}
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 px-8 font-bold text-sm shadow-md shadow-teal-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Guardar Cambios
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* --- TAB: CLINICAL --- */}
        <TabsContent value="clinical" id="clinical" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Form {...clinicalForm}>
            <form onSubmit={clinicalForm.handleSubmit(onSaveClinical)} className="space-y-6">
              <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm dark:shadow-none rounded-xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                <CardHeader className="bg-slate-50/30 dark:bg-slate-900/30 border-b border-slate-100/60 dark:border-slate-800/60 p-4">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-1.5 bg-teal-50 dark:bg-teal-500/10 rounded-lg">
                      <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold dark:text-slate-100">Información Clínica</CardTitle>
                      <CardDescription className="text-xs dark:text-slate-400">Define cómo y qué especialidades atiendes.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Modalidad de Atención</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { id: 'online', label: 'Online', icon: Monitor, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50/50 dark:bg-indigo-500/10' },
                        { id: 'in-person', label: 'Presencial', icon: Building2, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/50 dark:bg-rose-500/10' },
                        { id: 'both', label: 'Ambos', icon: CheckCircle2, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50/50 dark:bg-teal-500/10' }
                      ].map((type) => {
                        const isActive = clinicalForm.watch("consultation_type") === type.id
                        return (
                          <div 
                            key={type.id}
                            onClick={() => clinicalForm.setValue("consultation_type", type.id as any, { shouldDirty: true })}
                            className={cn(
                              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer h-24 group",
                              isActive 
                                ? "border-teal-600 dark:border-teal-500 bg-teal-50/20 dark:bg-teal-950/30 shadow-md shadow-teal-100/50 dark:shadow-none" 
                                : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
                            )}
                          >
                            <type.icon className={cn(
                              "h-6 w-6 mb-2 transition-all", 
                              isActive ? type.color : "text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500"
                            )} />
                            <span className={cn(
                              "text-sm font-black uppercase tracking-wider",
                              isActive ? "text-slate-900 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"
                            )}>{type.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={clinicalForm.control}
                      name="clinic_address"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Dirección Consulta</FormLabel>
                          <FormControl>
                            <GoogleAddressInput 
                              value={field.value} 
                              onChange={field.onChange}
                              className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold dark:text-slate-200" 
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
                          <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Ciudad / Comuna</FormLabel>
                          <FormControl>
                            <Input {...field} className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold dark:text-slate-200" placeholder="Ej: Santiago / Las Condes" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Condiciones y Enfermedades que tratas</Label>
                    <div className="flex gap-2">
                       <Input 
                         placeholder="Escribe una condición y presiona Enter..."
                         value={tagInput}
                         onChange={(e) => setTagInput(e.target.value)}
                         onKeyDown={addConditionTag}
                         className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold dark:text-slate-200"
                       />
                       <Button 
                         type="button" 
                         onClick={() => addConditionTag({ key: 'Enter', preventDefault: () => {} } as any)} 
                         variant="outline" 
                         className="rounded-xl h-10 w-10 shrink-0 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-800 transition-all p-0 flex items-center justify-center dark:text-slate-300"
                       >
                         <Plus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                       </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 min-h-[100px] items-start">
                      {clinicalForm.watch("conditions_treated").length === 0 && (
                        <div className="flex flex-col items-center justify-center w-full h-full text-slate-300 dark:text-slate-600 gap-2">
                          <Info className="h-6 w-6 opacity-50" />
                          <p className="italic text-xs font-medium">No has añadido etiquetas aún.</p>
                        </div>
                      )}
                      {clinicalForm.watch("conditions_treated").map(tag => (
                        <Badge 
                          key={tag} 
                          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900 transition-all cursor-pointer group rounded-full px-3 py-1.5 gap-2 border shadow-sm dark:shadow-none text-xs font-bold"
                          onClick={() => removeConditionTag(tag)}
                        >
                          {tag}
                          <X className="h-3 w-3 text-slate-300 dark:text-slate-500 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors" />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Pacientes que atiendes</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ej: Adultos, Niños, Parejas..."
                        value={patientsInput}
                        onChange={(e) => setPatientsInput(e.target.value)}
                        onKeyDown={addPatientGroup}
                        className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold dark:text-slate-200"
                      />
                      <Button
                        type="button"
                        onClick={() => addPatientGroup({ key: 'Enter', preventDefault: () => {} } as any)}
                        variant="outline"
                        className="rounded-xl h-10 w-10 shrink-0 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-800 transition-all p-0 flex items-center justify-center dark:text-slate-300"
                      >
                        <Plus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 min-h-[64px] items-start">
                      {(!clinicalForm.watch("patients_groups") || clinicalForm.watch("patients_groups")?.length === 0) && (
                        <p className="italic text-xs font-medium text-slate-300 dark:text-slate-600">
                          Ejemplos: Adultos, Niños, Adolescentes, Parejas...
                        </p>
                      )}
                      {(clinicalForm.watch("patients_groups") || []).map((g: string) => (
                        <Badge
                          key={g}
                          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900 transition-all cursor-pointer group rounded-full px-3 py-1.5 gap-2 border shadow-sm dark:shadow-none text-xs font-bold"
                          onClick={() => removePatientGroup(g)}
                        >
                          {g}
                          <X className="h-3 w-3 text-slate-300 dark:text-slate-500 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors" />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Formas de pago aceptadas</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ej: Transferencia bancaria, Efectivo..."
                        value={paymentsInput}
                        onChange={(e) => setPaymentsInput(e.target.value)}
                        onKeyDown={addPaymentMethod}
                        className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold dark:text-slate-200"
                      />
                      <Button
                        type="button"
                        onClick={() => addPaymentMethod({ key: 'Enter', preventDefault: () => {} } as any)}
                        variant="outline"
                        className="rounded-xl h-10 w-10 shrink-0 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-800 transition-all p-0 flex items-center justify-center dark:text-slate-300"
                      >
                        <Plus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 min-h-[64px] items-start">
                      {(!clinicalForm.watch("payment_methods") || clinicalForm.watch("payment_methods")?.length === 0) && (
                        <p className="italic text-xs font-medium text-slate-300 dark:text-slate-600">
                          Ejemplos: Transferencia bancaria, Efectivo, Tarjeta de débito...
                        </p>
                      )}
                      {(clinicalForm.watch("payment_methods") || []).map((m: string) => (
                        <Badge
                          key={m}
                          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900 transition-all cursor-pointer group rounded-full px-3 py-1.5 gap-2 border shadow-sm dark:shadow-none text-xs font-bold"
                          onClick={() => removePaymentMethod(m)}
                        >
                          {m}
                          <X className="h-3 w-3 text-slate-300 dark:text-slate-500 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/30 dark:bg-slate-900/30 p-3 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!clinicalForm.formState.isDirty || saving}
                    className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-500 rounded-xl h-10 px-6 font-bold text-sm shadow-md shadow-teal-200/50 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar Cambios
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* --- TAB: STUDIES --- */}
        <TabsContent value="studies" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Form {...educationForm}>
            <form onSubmit={educationForm.handleSubmit(onSaveEducation)} className="space-y-6">
              <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm dark:shadow-none rounded-xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                <CardHeader className="bg-slate-50/30 dark:bg-slate-900/30 border-b border-slate-100/60 dark:border-slate-800/60 p-4">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-1.5 bg-teal-50 dark:bg-teal-500/10 rounded-lg">
                      <GraduationCap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold dark:text-slate-100">Historial Académico</CardTitle>
                      <CardDescription className="text-xs dark:text-slate-400">Gestiona tus títulos y certificaciones profesionales.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid gap-4">
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
                        <div className="grid sm:grid-cols-2 gap-6">
                          <FormField
                            control={educationForm.control}
                            name={`education.${index}.institution`}
                            render={({ field }: { field: any }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Institución</FormLabel>
                                <FormControl>
                                  <Input {...field} className="rounded-xl h-10 bg-white/70 dark:bg-slate-950/70 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 text-sm font-bold dark:text-slate-200" />
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
                                  <Input {...field} className="rounded-xl h-10 bg-white/70 dark:bg-slate-950/70 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 text-sm font-bold dark:text-slate-200" />
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
                                  <Input type="number" {...field} className="rounded-xl h-10 bg-white/70 dark:bg-slate-950/70 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 text-sm font-bold w-full sm:w-32 dark:text-slate-200" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => appendEdu({ institution: "", degree: "", graduation_year: "" })}
                    className="w-full h-12 rounded-xl border-2 border-dashed bg-teal-50/10 dark:bg-teal-950/20 border-teal-200/60 dark:border-teal-800/60 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-400 dark:hover:border-teal-600 hover:scale-[1.01] transition-all font-black text-sm uppercase tracking-wider"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Añadir Nuevo Título
                  </Button>
                </CardContent>
                <CardFooter className="bg-slate-50/30 dark:bg-slate-900/30 p-3 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!educationForm.formState.isDirty || saving}
                    className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-500 rounded-xl h-10 px-6 font-bold text-sm shadow-md shadow-teal-200/50 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar Cambios
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* --- TAB: GALLERY --- */}
        <TabsContent value="gallery" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Form {...galleryForm}>
            <form onSubmit={galleryForm.handleSubmit(onSaveGallery)} className="space-y-6">
              <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm dark:shadow-none rounded-xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                <CardHeader className="bg-slate-50/30 dark:bg-slate-900/30 border-b border-slate-100/60 dark:border-slate-800/60 p-4">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-1.5 bg-teal-50 dark:bg-teal-500/10 rounded-lg">
                      <Camera className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold dark:text-slate-100">Galería de Consultorio</CardTitle>
                      <CardDescription className="text-xs dark:text-slate-400">Muestra tu espacio de trabajo a tus futuros pacientes.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
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
                </CardContent>
                <CardFooter className="bg-slate-50/30 dark:bg-slate-900/30 p-3 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!galleryForm.formState.isDirty || saving}
                    className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-500 rounded-xl h-10 px-6 font-bold text-sm shadow-md shadow-teal-200/50 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar Cambios
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* --- TAB: PRICING --- */}
        <TabsContent value="pricing" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Form {...pricingForm}>
            <form onSubmit={pricingForm.handleSubmit(onSavePricing)} className="space-y-6">
              <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm dark:shadow-none rounded-xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                <CardHeader className="bg-slate-50/30 dark:bg-slate-900/30 border-b border-slate-100/60 dark:border-slate-800/60 p-4">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-1.5 bg-teal-50 dark:bg-teal-500/10 rounded-lg">
                      <DollarSign className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold dark:text-slate-100">Precios y Servicios</CardTitle>
                      <CardDescription className="text-xs dark:text-slate-400">
                        Define los tipos de consulta que ofreces, su precio y duración. Esta información es visible en tu perfil público.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">

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
                    <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
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
                    <div className="grid gap-4">
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
                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold dark:text-slate-200"
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
                                          className="rounded-xl h-10 pl-7 pr-14 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold dark:text-slate-200"
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
                                        <SelectTrigger className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold">
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
                                        <SelectTrigger className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold">
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
                </CardContent>
                <CardFooter className="bg-slate-50/30 dark:bg-slate-900/30 p-3 flex justify-end">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 px-6 font-bold text-sm gap-2 shadow-md shadow-teal-200/50 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Guardar Precios
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* --- TAB: SECURITY --- */}
        <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Form {...securityForm}>
            <form onSubmit={securityForm.handleSubmit(onSaveSecurity)} className="space-y-6">
              <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm dark:shadow-none rounded-xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                <CardHeader className="bg-slate-50/30 dark:bg-slate-900/30 border-b border-slate-100/60 dark:border-slate-800/60 p-4">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-1.5 bg-teal-50 dark:bg-teal-500/10 rounded-lg">
                      <Lock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold dark:text-slate-100">Seguridad de la Cuenta</CardTitle>
                      <CardDescription className="text-xs dark:text-slate-400">Protege tu acceso y credenciales profesionales.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid gap-6 max-w-2xl">
                    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                        <User className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Correo Electrónico</p>
                        <p className="text-base font-bold text-slate-900 dark:text-slate-200">{user?.email}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={securityForm.control}
                        name="new_password"
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Nueva Contraseña</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-all text-sm font-bold dark:text-slate-200" placeholder="Mínimo 8 caracteres" />
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
                            <FormLabel className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Confirmar Contraseña</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-all text-sm font-bold dark:text-slate-200" placeholder="Repite tu contraseña" />
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
                </CardContent>
                <CardFooter className="bg-slate-50/30 dark:bg-slate-900/30 p-3 flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl h-10 px-6 font-bold text-sm shadow-md shadow-slate-200/50 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                    Actualizar Contraseña
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* --- TAB: VERIFICATION --- */}
        <TabsContent value="verification" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm dark:shadow-none rounded-xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
            <CardHeader className="bg-slate-50/30 dark:bg-slate-900/30 border-b border-slate-100/60 dark:border-slate-800/60 p-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-1.5 bg-teal-50 dark:bg-teal-500/10 rounded-lg">
                  <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold dark:text-slate-100">Verificación de Credenciales</CardTitle>
                  <CardDescription className="text-xs dark:text-slate-400">Sube tus títulos y diplomas para obtener el sello oficial de NUREA.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {['Título', 'Diplomado', 'Magíster', 'Curso'].map((type) => (
                  <div key={type} className="relative group p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-600 hover:bg-teal-50/30 dark:hover:bg-teal-900/20 transition-all text-center">
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

              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <History className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  Estado de tus documentos
                </h3>
                
                <div className="grid gap-3">
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
                    <div className="grid gap-4">
                      {credentials.map((cred) => (
                        <div key={cred.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all gap-4 group">
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
              </div>
            </CardContent>
          </Card>
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
