"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Lock
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

// --- Schemas ---
const generalSchema = z.object({
  bio: z.string().min(50, "La biografía debe tener al menos 50 caracteres"),
  years_experience: z.number().min(0),
})

const clinicalSchema = z.object({
  conditions_treated: z.array(z.string()),
  consultation_type: z.enum(['online', 'in-person', 'both']),
  clinic_address: z.string().optional(),
  clinic_city: z.string().optional(),
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
  const { user } = useAuth()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // --- Forms ---
  const generalForm = useForm<z.infer<typeof generalSchema>>({
    resolver: zodResolver(generalSchema),
    defaultValues: { bio: "", years_experience: 0 }
  })

  const clinicalForm = useForm<z.infer<typeof clinicalSchema>>({
    resolver: zodResolver(clinicalSchema),
    defaultValues: { 
      conditions_treated: [], 
      consultation_type: 'both',
      clinic_address: "",
      clinic_city: ""
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
        const { data, error } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          generalForm.reset({
            bio: data.bio || "",
            years_experience: data.years_experience || 0
          })
          clinicalForm.reset({
            conditions_treated: data.conditions_treated || [],
            consultation_type: data.consultation_type || 'both',
            clinic_address: data.clinic_address || "",
            clinic_city: data.clinic_city || ""
          })
          educationForm.reset({
            education: data.education || []
          })
          galleryForm.reset({
            clinic_images: data.clinic_images || []
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [user, supabase, generalForm, clinicalForm, educationForm, galleryForm])

  // --- Save Handlers ---
  const onSaveGeneral = async (values: z.infer<typeof generalSchema>) => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          bio: values.bio,
          years_experience: values.years_experience
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
          clinic_city: values.clinic_city
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

  // --- Tag Management ---
  const [tagInput, setTagInput] = useState("")
  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const currentTags = clinicalForm.getValues("conditions_treated")
      if (!currentTags.includes(tagInput.trim())) {
        clinicalForm.setValue("conditions_treated", [...currentTags, tagInput.trim()], { shouldDirty: true })
      }
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    const currentTags = clinicalForm.getValues("conditions_treated")
    clinicalForm.setValue("conditions_treated", currentTags.filter(t => t !== tag), { shouldDirty: true })
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      <p className="text-slate-500 font-medium">Cargando perfil...</p>
    </div>
  )

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Ajustes de Perfil
          </h1>
          <p className="text-slate-500 font-medium">Gestiona cómo te ven tus pacientes en NUREA.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.open(`/professionals/${user?.id}`, '_blank')}
          className="rounded-xl border-slate-200 gap-2 hover:bg-slate-50"
        >
          <ExternalLink className="h-4 w-4" />
          Ver Perfil Público
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200 mb-8 w-full sm:w-auto h-auto flex-wrap">
          <TabsTrigger value="general" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <User className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="clinical" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <Stethoscope className="h-4 w-4 mr-2" />
            Clínica
          </TabsTrigger>
          <TabsTrigger value="studies" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <GraduationCap className="h-4 w-4 mr-2" />
            Estudios
          </TabsTrigger>
          <TabsTrigger value="gallery" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <Camera className="h-4 w-4 mr-2" />
            Galería
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <Lock className="h-4 w-4 mr-2" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* --- TAB: GENERAL --- */}
        <TabsContent value="general">
          <Form {...generalForm}>
            <form onSubmit={generalForm.handleSubmit(onSaveGeneral)} className="space-y-6">
              <Card className="border-border/40 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-xl font-bold">Información General</CardTitle>
                  <CardDescription>Detalles básicos sobre tu trayectoria profesional.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={generalForm.control}
                      name="years_experience"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Años de experiencia</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                              className="rounded-xl h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={generalForm.control}
                    name="bio"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Biografía Profesional</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field}
                            className="min-h-[200px] rounded-2xl resize-none p-4"
                            placeholder="Describe tu enfoque, especialidad y lo que ofreces a tus pacientes..."
                          />
                        </FormControl>
                        <FormDescription className="flex justify-between">
                          <span>Cuéntanos sobre tu metodología de trabajo.</span>
                          <span className={cn(field.value.length < 50 ? "text-orange-600" : "text-teal-600")}>
                            {field.value.length} / 50 min.
                          </span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="bg-slate-50/50 p-6 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!generalForm.formState.isDirty || saving}
                    className="bg-teal-600 hover:bg-teal-700 rounded-xl px-8 font-bold"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar Cambios
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* --- TAB: CLINICAL --- */}
        <TabsContent value="clinical">
          <Form {...clinicalForm}>
            <form onSubmit={clinicalForm.handleSubmit(onSaveClinical)} className="space-y-6">
              <Card className="border-border/40 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-xl font-bold">Información Clínica</CardTitle>
                  <CardDescription>Define cómo y qué enfermedades atiendes.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <Label className="font-bold">Modalidad de Atención</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { id: 'online', label: 'Online', icon: Monitor },
                        { id: 'in-person', label: 'Presencial', icon: Building2 },
                        { id: 'both', label: 'Ambos', icon: CheckCircle2 }
                      ].map((type) => (
                        <div 
                          key={type.id}
                          onClick={() => clinicalForm.setValue("consultation_type", type.id as any, { shouldDirty: true })}
                          className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer h-24",
                            clinicalForm.watch("consultation_type") === type.id 
                              ? "border-teal-600 bg-teal-50/30" 
                              : "border-slate-100 hover:bg-slate-50"
                          )}
                        >
                          <type.icon className={cn("h-5 w-5 mb-2", clinicalForm.watch("consultation_type") === type.id ? "text-teal-600" : "text-slate-400")} />
                          <span className="text-sm font-bold">{type.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={clinicalForm.control}
                      name="clinic_address"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Dirección Consulta</FormLabel>
                          <FormControl>
                            <Input {...field} className="rounded-xl h-11" placeholder="Ej: Av. Providencia 1234" />
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
                          <FormLabel className="font-bold">Ciudad / Comuna</FormLabel>
                          <FormControl>
                            <Input {...field} className="rounded-xl h-11" placeholder="Ej: Santiago / Las Condes" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="font-bold">Condiciones y Enfermedades que tratas</Label>
                    <div className="flex gap-2">
                       <Input 
                         placeholder="Escribe y presiona Enter..."
                         value={tagInput}
                         onChange={(e) => setTagInput(e.target.value)}
                         onKeyDown={addTag}
                         className="rounded-xl h-11"
                       />
                       <Button type="button" onClick={() => addTag({ key: 'Enter', preventDefault: () => {} } as any)} variant="outline" className="rounded-xl h-11 w-11 p-0">
                         <Plus className="h-4 w-4" />
                       </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 min-h-[100px] items-start">
                      {clinicalForm.watch("conditions_treated").length === 0 && (
                        <p className="text-slate-400 italic text-sm m-auto">No has añadido etiquetas.</p>
                      )}
                      {clinicalForm.watch("conditions_treated").map(tag => (
                        <Badge 
                          key={tag} 
                          className="bg-white border-teal-100 text-teal-700 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer group rounded-full px-3 py-1 gap-2 border shadow-sm"
                          onClick={() => removeTag(tag)}
                        >
                          {tag}
                          <X className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 p-6 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!clinicalForm.formState.isDirty || saving}
                    className="bg-teal-600 hover:bg-teal-700 rounded-xl px-8 font-bold"
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
        <TabsContent value="studies">
          <Form {...educationForm}>
            <form onSubmit={educationForm.handleSubmit(onSaveEducation)} className="space-y-6">
              <Card className="border-border/40 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-xl font-bold">Historial Académico</CardTitle>
                  <CardDescription>Gestiona tus títulos y certificaciones profesionales.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {eduFields.map((field, index) => (
                    <div key={field.id} className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 relative group animate-in fade-in zoom-in duration-300">
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all h-8 w-8"
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
                              <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Institución</FormLabel>
                              <Input {...field} className="rounded-xl h-10" />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={educationForm.control}
                          name={`education.${index}.degree`}
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Título / Especialidad</FormLabel>
                              <Input {...field} className="rounded-xl h-10" />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={educationForm.control}
                          name={`education.${index}.graduation_year`}
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Año de Egreso</FormLabel>
                              <Input type="number" {...field} className="rounded-xl h-10" />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => appendEdu({ institution: "", degree: "", graduation_year: "" })}
                    className="w-full h-14 rounded-2xl border-2 border-dashed bg-teal-50/20 border-teal-600/20 text-teal-600 hover:bg-teal-50 hover:border-teal-600/40 font-bold transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Nuevo Título
                  </Button>
                </CardContent>
                <CardFooter className="bg-slate-50/50 p-6 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!educationForm.formState.isDirty || saving}
                    className="bg-teal-600 hover:bg-teal-700 rounded-xl px-8 font-bold"
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
        <TabsContent value="gallery">
          <Form {...galleryForm}>
            <form onSubmit={galleryForm.handleSubmit(onSaveGallery)} className="space-y-6">
              <Card className="border-border/40 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-xl font-bold">Galería de Consultorio</CardTitle>
                  <CardDescription>Muestra tu espacio de trabajo a tus futuros pacientes.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {galleryForm.watch("clinic_images").map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm group animate-in zoom-in duration-300">
                        <img src={img} className="w-full h-full object-cover" alt="Clínica" />
                        <button 
                          type="button"
                          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                          onClick={() => {
                            const imgs = galleryForm.getValues("clinic_images")
                            galleryForm.setValue("clinic_images", imgs.filter((_, i) => i !== idx), { shouldDirty: true })
                          }}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-teal-600/20 bg-teal-50/20 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50/50 hover:border-teal-600/40 transition-all group">
                        <Upload className="h-8 w-8 text-teal-600 mb-2 group-hover:-translate-y-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase text-teal-600">Subir Nueva</span>
                        <input type="file" multiple className="hidden" onChange={handleFileUpload} accept="image/*" />
                    </label>
                  </div>
                  <div className="flex gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-bold">Nota importante</p>
                      <p className="opacity-90">Al subir imágenes, estas se cargan en el servidor pero **debes presionar "Guardar Cambios"** para que se vinculen permanentemente a tu perfil.</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 p-6 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!galleryForm.formState.isDirty || saving}
                    className="bg-teal-600 hover:bg-teal-700 rounded-xl px-8 font-bold"
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
        <TabsContent value="security">
          <Form {...securityForm}>
            <form onSubmit={securityForm.handleSubmit(onSaveSecurity)} className="space-y-6">
              <Card className="border-border/40 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Seguridad de la Cuenta</CardTitle>
                      <CardDescription>Protege tu acceso y credenciales profesionales.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid gap-6 max-w-md">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Correo Electrónico</p>
                        <p className="text-sm font-medium text-slate-900">{user?.email}</p>
                      </div>
                    </div>

                    <FormField
                      control={securityForm.control}
                      name="new_password"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Nueva Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="rounded-xl h-11" placeholder="Mínimo 8 caracteres" />
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
                          <FormLabel className="font-bold">Confirmar Nueva Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="rounded-xl h-11" placeholder="Repite tu contraseña" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />
                  
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-xs flex gap-3">
                    <Key className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Si cambias tu contraseña, se cerrará la sesión en otros dispositivos por seguridad.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 p-6 flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-slate-900 hover:bg-black text-white rounded-xl px-8 font-bold"
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
      </Tabs>

      {/* Persistence Warning */}
      <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-widest pt-4">
        <Info className="h-3 w-3" />
        Tus cambios no son públicos hasta que presionas guardar cambios
      </div>
    </div>
  )
}
