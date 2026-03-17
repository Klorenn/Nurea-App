"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
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
  Globe,
  Info,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Key,
  Lock,
  FileText,
  BadgeCheck,
  History,
  Calendar,
  Clock,
  Award
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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

// --- Availability Types & Constants ---
interface DaySchedule {
  enabled: boolean
  startTime: string
  endTime: string
  slotDuration: number
}

interface WeeklySchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

const DAYS_OF_WEEK = [
  { key: "monday", labelEs: "Lunes", labelEn: "Monday" },
  { key: "tuesday", labelEs: "Martes", labelEn: "Tuesday" },
  { key: "wednesday", labelEs: "Miércoles", labelEn: "Wednesday" },
  { key: "thursday", labelEs: "Jueves", labelEn: "Thursday" },
  { key: "friday", labelEs: "Viernes", labelEn: "Friday" },
  { key: "saturday", labelEs: "Sábado", labelEn: "Saturday" },
  { key: "sunday", labelEs: "Domingo", labelEn: "Sunday" },
] as const

const SLOT_DURATIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
]

const DEFAULT_SCHEDULE: DaySchedule = {
  enabled: false,
  startTime: "09:00",
  endTime: "18:00",
  slotDuration: 60,
}

const getDefaultWeeklySchedule = (): WeeklySchedule => ({
  monday: { ...DEFAULT_SCHEDULE, enabled: true },
  tuesday: { ...DEFAULT_SCHEDULE, enabled: true },
  wednesday: { ...DEFAULT_SCHEDULE, enabled: true },
  thursday: { ...DEFAULT_SCHEDULE, enabled: true },
  friday: { ...DEFAULT_SCHEDULE, enabled: true },
  saturday: { ...DEFAULT_SCHEDULE },
  sunday: { ...DEFAULT_SCHEDULE },
})

function calculateSlots(startTime: string, endTime: string, duration: number): number {
  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  if (endMinutes <= startMinutes) return 0
  
  return Math.floor((endMinutes - startMinutes) / duration)
}

// --- Schemas ---
const generalSchema = z.object({
  bio: z.string().min(50, "La biografía debe tener al menos 50 caracteres"),
  years_experience: z.number().min(0).optional(),
  registration_number: z.string().min(1, "Nº Registro es requerido"),
  registration_institution: z.string().optional(),
  specialty_id: z.string().uuid("Selecciona una especialidad"),
  sub_specialties: z.array(z.string()).optional(),
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

export default function ProfessionalProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [specialties, setSpecialties] = useState<any[]>([])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [profileName, setProfileName] = useState<{ first_name: string; last_name: string } | null>(null)
  const [publicProfilePath, setPublicProfilePath] = useState<string | null>(null)

  // Calculate completeness (0–100)
  const [completeness, setCompleteness] = useState(0)

  // --- Availability State ---
  const [schedule, setSchedule] = useState<WeeklySchedule>(getDefaultWeeklySchedule())
  const [hasScheduleChanges, setHasScheduleChanges] = useState(false)
  const [originalSchedule, setOriginalSchedule] = useState<WeeklySchedule | null>(null)
  const [savingSchedule, setSavingSchedule] = useState(false)

  useEffect(() => {
    if (!originalSchedule) return
    const changed = JSON.stringify(schedule) !== JSON.stringify(originalSchedule)
    setHasScheduleChanges(changed)
  }, [schedule, originalSchedule])

  const updateDaySchedule = (day: keyof WeeklySchedule, field: keyof DaySchedule, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  // --- Forms ---
  const generalForm = useForm<z.infer<typeof generalSchema>>({
    resolver: zodResolver(generalSchema),
    defaultValues: { 
      bio: "", 
      registration_number: "",
      registration_institution: "",
      specialty_id: "",
      sub_specialties: []
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

  // --- Load Data ---
  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      try {
        const [{ data: profileData }, { data }] = await Promise.all([
          supabase.from("profiles").select("first_name, last_name").eq("id", user.id).single(),
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
          generalForm.reset({
            bio: professional.bio || "",
            years_experience: typeof professional.years_experience === "number" ? professional.years_experience : undefined,
            registration_number: professional.registration_number || "",
            registration_institution: professional.registration_institution || "",
            specialty_id: professional.specialty_id || "",
            sub_specialties: [] // Multi-select sub-specialties would come from professional_specialties
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

          // Parse availability
          if (professional.availability && Object.keys(professional.availability).length > 0) {
            const storedAvailability = professional.availability as Record<string, any>
            const parsedSchedule = getDefaultWeeklySchedule()

            DAYS_OF_WEEK.forEach(({ key }) => {
              const dayData = storedAvailability[key]
              if (dayData) {
                if (dayData.online || dayData['in-person']) {
                  const onlineData = dayData.online || dayData['in-person']
                  parsedSchedule[key as keyof WeeklySchedule] = {
                    enabled: onlineData?.available || false,
                    startTime: onlineData?.hours?.split(' - ')[0] || "09:00",
                    endTime: onlineData?.hours?.split(' - ')[1] || "18:00",
                    slotDuration: dayData.slotDuration || 60,
                  }
                } else if (dayData.available !== undefined) {
                  parsedSchedule[key as keyof WeeklySchedule] = {
                    enabled: dayData.available || false,
                    startTime: dayData.hours?.split(' - ')[0] || dayData.startTime || "09:00",
                    endTime: dayData.hours?.split(' - ')[1] || dayData.endTime || "18:00",
                    slotDuration: dayData.slotDuration || 60,
                  }
                }
              }
            })
            setSchedule(parsedSchedule)
            setOriginalSchedule(parsedSchedule)
          } else {
            setOriginalSchedule(getDefaultWeeklySchedule())
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [user, supabase, generalForm, clinicalForm, educationForm, galleryForm])

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
      const { error } = await supabase
        .from('professionals')
        .update({
          bio: values.bio,
          years_experience: values.years_experience ?? null,
          registration_number: values.registration_number,
          registration_institution: values.registration_institution,
          specialty_id: values.specialty_id
        })
        .eq('id', user.id)

      if (error) throw error
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
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('professionals')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError
      
      setAvatarUrl(publicUrl)
      toast.success("Foto de perfil actualizada")
      return { success: true }
    } catch (err) {
      console.error(err)
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
      toast.success("Información clínica actualizada")
      clinicalForm.reset(values)
    } catch (err) {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const onSaveSchedule = async () => {
    if (!user) return
    setSavingSchedule(true)
    try {
      const availability: Record<string, any> = {}

      DAYS_OF_WEEK.forEach(({ key }) => {
        const daySchedule = schedule[key as keyof WeeklySchedule]
        availability[key] = {
          online: {
            available: daySchedule.enabled,
            hours: daySchedule.enabled ? `${daySchedule.startTime} - ${daySchedule.endTime}` : null,
          },
          'in-person': {
            available: daySchedule.enabled,
            hours: daySchedule.enabled ? `${daySchedule.startTime} - ${daySchedule.endTime}` : null,
          },
          slotDuration: daySchedule.slotDuration,
        }
      })

      const { error } = await supabase
        .from('professionals')
        .update({ availability })
        .eq('id', user.id)

      if (error) throw error

      setOriginalSchedule(schedule)
      setHasScheduleChanges(false)
      toast.success("Horarios guardados exitosamente")
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar horarios")
    } finally {
      setSavingSchedule(false)
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
  useEffect(() => {
    const values = generalForm.getValues()
    let score = 0
    if (avatarUrl) score += 15
    if (values.bio && values.bio.length >= 50) score += 20
    if ((values.years_experience ?? 0) > 0) score += 8
    if (values.registration_number) score += 10
    if (values.registration_institution) score += 5
    if (values.specialty_id) score += 10
    if (values.sub_specialties && values.sub_specialties.length > 0) score += 5
    const clinicalValues = clinicalForm.getValues()
    if (clinicalValues.conditions_treated.length > 0) score += 10
    const eduValues = educationForm.getValues()
    if (eduValues.education.length > 0) score += 15
    if (credentials.length > 0) score += 5
    if (galleryForm.getValues("clinic_images").length > 0) score += 2
    setCompleteness(Math.min(100, score))
  }, [generalForm.watch(), clinicalForm.watch(), educationForm.watch(), avatarUrl, credentials.length])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      <p className="text-slate-500 font-medium">Cargando perfil...</p>
    </div>
  )

  const displayName = profileName
    ? `${profileName.first_name} ${profileName.last_name}`.trim() || "Tu perfil"
    : "Tu perfil"

  const initialTab = (searchParams.get("tab") as "general" | "clinical" | "availability" | "studies" | "gallery" | "security" | "verification") || "general"

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
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
            { value: "availability", label: "Horarios", icon: Calendar },
            { value: "studies", label: "Estudios", icon: GraduationCap },
            { value: "gallery", label: "Galería", icon: Camera },
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
            onEdit={() => document.getElementById("form-general")?.scrollIntoView({ behavior: "smooth" })}
            editLabel="Editar"
          >
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex justify-center sm:justify-start">
                <ProfilePhotoUpload
                  currentUrl={avatarUrl || undefined}
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
              {generalForm.watch("bio") ? (
                <p className="whitespace-pre-wrap">{generalForm.watch("bio").slice(0, 300)}{generalForm.watch("bio").length > 300 ? "…" : ""}</p>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 italic">Sin descripción. Edita en la sección General para añadir tu biografía.</p>
              )}
            </div>
          </ProfileSectionCard>

          <Form {...generalForm}>
            <form onSubmit={generalForm.handleSubmit(onSaveGeneral)} className="space-y-6">
              <Card id="form-general" className="border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-950 scroll-mt-24">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-50 dark:bg-teal-500/10 rounded-xl">
                      <User className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black">Información General</CardTitle>
                      <CardDescription className="text-sm font-medium">Detalles básicos sobre tu trayectoria profesional.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10">
                    {/* Left Column: Profile Photo */}
                    <div className="flex flex-col items-center pt-4">
                      <ProfilePhotoUpload 
                        currentUrl={avatarUrl || undefined} 
                        onUpload={handleProfilePhotoUpload} 
                      />
                    </div>

                    {/* Right Column: Fields */}
                    <div className="space-y-8">
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
                        <FormField
                          control={generalForm.control}
                          name="sub_specialties"
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <div className="flex items-center gap-2 mb-1.5">
                                <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                <FormLabel className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Sub-especialidades</FormLabel>
                              </div>
                              <FormControl>
                                <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all min-h-[40px]">
                                  {field.value?.map((tag: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-100 dark:border-teal-900/50 flex items-center gap-1 py-1 px-2 rounded-lg group">
                                      {tag}
                                      <button 
                                        type="button" 
                                        onClick={() => field.onChange(field.value.filter((_: any, idx: number) => idx !== i))}
                                        className="hover:text-rose-500 transition-colors"
                                      >
                                        <X className="h-2 w-2" />
                                      </button>
                                    </Badge>
                                  ))}
                                  <input
                                    placeholder={field.value?.length ? "" : "Ej: Psiquiatría Infantil..."}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold min-w-[120px] dark:text-slate-200"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ',') {
                                        e.preventDefault()
                                        const val = e.currentTarget.value.trim()
                                        if (val && !field.value.includes(val)) {
                                          field.onChange([...field.value, val])
                                          e.currentTarget.value = ""
                                        }
                                      }
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="text-[10px] italic">Presiona Enter o Coma para añadir.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                <CardFooter className="bg-slate-50/30 dark:bg-slate-900/30 p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
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
              <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/30 dark:shadow-none rounded-2xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                <CardHeader className="bg-slate-50/30 dark:bg-slate-900/30 border-b border-slate-100/60 dark:border-slate-800/60 p-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-teal-50 dark:bg-teal-500/10 rounded-xl">
                      <Stethoscope className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black dark:text-slate-100">Información Clínica</CardTitle>
                      <CardDescription className="text-sm font-medium dark:text-slate-400">Define cómo y qué especialidades atiendes.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
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
                            <Input {...field} className="rounded-xl h-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold dark:text-slate-200" placeholder="Ej: Av. Providencia 1234" />
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
                <CardFooter className="bg-slate-50/30 dark:bg-slate-900/30 p-4 flex justify-end">
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

        {/* --- TAB: AVAILABILITY --- */}
        <TabsContent value="availability" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/30 dark:shadow-none rounded-2xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
            <CardHeader className="bg-slate-50/30 dark:bg-slate-900/30 border-b border-slate-100/60 dark:border-slate-800/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 dark:bg-teal-500/10 rounded-xl">
                  <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black dark:text-slate-100">Horarios de Atención</CardTitle>
                  <CardDescription className="text-sm font-medium dark:text-slate-400">Configura tus días y modalidades disponibles.</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">
                  {Object.values(schedule).filter(day => day.enabled).length} días activos
                </span>
                {hasScheduleChanges && (
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-500 dark:border-amber-900">
                    Cambios sin guardar
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {DAYS_OF_WEEK.map(({ key, labelEs, labelEn }) => {
                const daySchedule = schedule[key as keyof WeeklySchedule]
                const isWeekend = key === "saturday" || key === "sunday"

                return (
                  <div key={key} className={cn(
                    "flex flex-col xl:flex-row xl:items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                    daySchedule.enabled 
                      ? "bg-white dark:bg-slate-900/50 border-teal-200 dark:border-teal-800/50 shadow-sm" 
                      : "bg-slate-50/50 dark:bg-slate-950/30 border-slate-100 dark:border-slate-800/60"
                  )}>
                    {/* Switch & Day */}
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <Switch
                        checked={daySchedule.enabled}
                        onCheckedChange={(checked) => updateDaySchedule(key as keyof WeeklySchedule, "enabled", checked)}
                        className="data-[state=checked]:bg-teal-600"
                      />
                      <Label className={cn(
                        "font-bold text-sm",
                        daySchedule.enabled ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
                      )}>
                        {labelEs}
                      </Label>
                    </div>

                    {/* Time Inputs */}
                    <div className={cn(
                      "flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
                      !daySchedule.enabled && "opacity-50 pointer-events-none"
                    )}>
                      <div>
                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Inicio</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                          <Input
                            type="time"
                            value={daySchedule.startTime}
                            onChange={(e) => updateDaySchedule(key as keyof WeeklySchedule, "startTime", e.target.value)}
                            className="pl-9 rounded-lg h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm font-bold dark:text-slate-200"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Fin</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                          <Input
                            type="time"
                            value={daySchedule.endTime}
                            onChange={(e) => updateDaySchedule(key as keyof WeeklySchedule, "endTime", e.target.value)}
                            className="pl-9 rounded-lg h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm font-bold dark:text-slate-200"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Duración</Label>
                        <Select
                          value={String(daySchedule.slotDuration)}
                          onValueChange={(val) => updateDaySchedule(key as keyof WeeklySchedule, "slotDuration", Number(val))}
                        >
                          <SelectTrigger className="rounded-lg h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm font-bold dark:text-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SLOT_DURATIONS.map((d) => (
                              <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
            <CardFooter className="bg-slate-50/30 dark:bg-slate-900/30 p-4 flex justify-between items-center border-t border-slate-100/60 dark:border-slate-800/60">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {hasScheduleChanges ? "Tienes cambios pendientes." : "Tus horarios están al día."}
              </div>
              <Button 
                type="button" 
                onClick={onSaveSchedule}
                disabled={savingSchedule}
                className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-500 rounded-xl h-10 px-6 font-bold text-sm shadow-md shadow-teal-200/50 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {savingSchedule ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar Horarios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- TAB: STUDIES --- */}
        <TabsContent value="studies" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Form {...educationForm}>
            <form onSubmit={educationForm.handleSubmit(onSaveEducation)} className="space-y-6">
              <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/30 dark:shadow-none rounded-2xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                <CardHeader className="bg-slate-50/30 dark:bg-slate-900/30 border-b border-slate-100/60 dark:border-slate-800/60 p-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-teal-50 dark:bg-teal-500/10 rounded-xl">
                      <GraduationCap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black dark:text-slate-100">Historial Académico</CardTitle>
                      <CardDescription className="text-sm font-medium dark:text-slate-400">Gestiona tus títulos y certificaciones profesionales.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
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
                <CardFooter className="bg-slate-50/30 dark:bg-slate-900/30 p-4 flex justify-end">
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
              <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/30 dark:shadow-none rounded-2xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                <CardHeader className="bg-slate-50/30 dark:bg-slate-900/30 border-b border-slate-100/60 dark:border-slate-800/60 p-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-teal-50 dark:bg-teal-500/10 rounded-xl">
                      <Camera className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black dark:text-slate-100">Galería de Consultorio</CardTitle>
                      <CardDescription className="text-sm font-medium dark:text-slate-400">Muestra tu espacio de trabajo a tus futuros pacientes.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
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
                <CardFooter className="bg-slate-50/30 dark:bg-slate-900/30 p-4 flex justify-end">
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

        {/* --- TAB: SECURITY --- */}
        <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Form {...securityForm}>
            <form onSubmit={securityForm.handleSubmit(onSaveSecurity)} className="space-y-6">
              <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/30 dark:shadow-none rounded-2xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                <CardHeader className="bg-slate-50/30 dark:bg-slate-900/30 border-b border-slate-100/60 dark:border-slate-800/60 p-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-teal-50 dark:bg-teal-500/10 rounded-xl">
                      <Lock className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black dark:text-slate-100">Seguridad de la Cuenta</CardTitle>
                      <CardDescription className="text-sm font-medium dark:text-slate-400">Protege tu acceso y credenciales profesionales.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
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
                <CardFooter className="bg-slate-50/30 dark:bg-slate-900/30 p-4 flex justify-end">
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
          <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/30 dark:shadow-none rounded-2xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
            <CardHeader className="bg-slate-50/30 dark:bg-slate-900/30 border-b border-slate-100/60 dark:border-slate-800/60 p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-teal-50 dark:bg-teal-500/10 rounded-xl">
                  <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black dark:text-slate-100">Verificación de Credenciales</CardTitle>
                  <CardDescription className="text-sm font-medium dark:text-slate-400">Sube tus títulos y diplomas para obtener el sello oficial de NUREA.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
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
