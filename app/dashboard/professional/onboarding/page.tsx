"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, 
  GraduationCap, 
  Stethoscope, 
  MapPin, 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check,
  Loader2,
  Globe,
  Camera,
  Info,
  Monitor,
  Building2,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

// --- Types ---
interface EducationEntry {
  institution: string
  degree: string
  graduation_year: string
}

interface OnboardingData {
  years_experience: number
  bio: string
  languages: string[]
  education: EducationEntry[]
  conditions_treated: string[]
  clinic_images: string[]
  consultation_type: 'online' | 'in-person' | 'both'
  clinic_address: string
  clinic_office: string
  clinic_city: string
}

const STORAGE_KEY = "nurea_pro_onboarding_step"

export default function ProfessionalOnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  
  // --- UI State ---
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)

  // --- Form Data ---
  const [data, setData] = useState<OnboardingData>({
    years_experience: 1,
    bio: "",
    languages: ["Español"],
    education: [],
    conditions_treated: [],
    clinic_images: [],
    consultation_type: 'both',
    clinic_address: "",
    clinic_office: "",
    clinic_city: ""
  })

  // --- Step Content Configuration ---
  const steps = [
    { title: "Trayectoria", icon: User },
    { title: "Formación", icon: GraduationCap },
    { title: "Especialidades", icon: Stethoscope },
    { title: "Espacio", icon: Camera },
    { title: "Modalidad", icon: MapPin },
  ]

  // --- Persistence: Load Existing Data ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      
      try {
        const { data: prof, error } = await supabase
          .from("professionals")
          .select("*")
          .eq("id", user.id)
          .single()

        if (prof) {
          setData({
            years_experience: prof.years_experience || 1,
            bio: prof.bio || "",
            languages: prof.languages || ["Español"],
            education: prof.education || [],
            conditions_treated: prof.conditions_treated || [],
            clinic_images: prof.clinic_images || [],
            consultation_type: prof.consultation_type || 'both',
            clinic_address: prof.clinic_address || "",
            clinic_office: prof.clinic_office || "",
            clinic_city: prof.clinic_city || ""
          })
          
          // Restore step from local storage or default
          const savedStep = localStorage.getItem(STORAGE_KEY)
          if (savedStep) setCurrentStep(parseInt(savedStep))
        }
      } catch (err) {
        console.error("Error loading onboarding data:", err)
      } finally {
        setInitialLoading(false)
      }
    }
    fetchData()
  }, [user, supabase])

  // --- Persistence: Save to Supabase ---
  const saveProgress = async (nextStep?: number) => {
    if (!user) return
    setSaveLoading(true)
    try {
      const { error } = await supabase
        .from("professionals")
        .update({
          years_experience: data.years_experience,
          bio: data.bio,
          languages: data.languages,
          education: data.education,
          conditions_treated: data.conditions_treated,
          clinic_images: data.clinic_images,
          consultation_type: data.consultation_type,
          clinic_address: data.clinic_address,
          clinic_office: data.clinic_office,
          clinic_city: data.clinic_city,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)

      if (error) throw error
      
      if (nextStep) {
        setCurrentStep(nextStep)
        localStorage.setItem(STORAGE_KEY, nextStep.toString())
        window.scrollTo(0, 0)
      }
    } catch (err) {
      console.error("Error saving progress:", err)
      toast.error("Error al guardar el progreso")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleNext = async () => {
    // Validations per step
    if (currentStep === 1) {
      if (!data.bio || data.bio.length < 50) {
        toast.error("Tu biografía debe tener al menos 50 caracteres")
        return
      }
    }
    if (currentStep === 2 && data.education.length === 0) {
      toast.error("Añade al menos un título académico")
      return
    }

    if (currentStep < 5) {
      await saveProgress(currentStep + 1)
    } else {
      // Final submission
      if (!user?.id) return
      setLoading(true)
      try {
        const { error } = await supabase
          .from("professionals")
          .update({ is_onboarded: true })
          .eq("id", user.id)
        
        if (error) throw error
        
        toast.success("¡Onboarding completado!")
        localStorage.removeItem(STORAGE_KEY)
        router.push("/dashboard/professional")
      } catch (err) {
        toast.error("Error al finalizar")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      localStorage.setItem(STORAGE_KEY, prevStep.toString())
    }
  }

  // --- Education Handlers ---
  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, { institution: "", degree: "", graduation_year: "" }]
    }))
  }

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    const newEdu = [...data.education]
    newEdu[index] = { ...newEdu[index], [field]: value }
    setData(prev => ({ ...prev, education: newEdu }))
  }

  // --- Conditions (Tags) Handlers ---
  const [tagInput, setTagInput] = useState("")
  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!data.conditions_treated.includes(tagInput.trim())) {
        setData(prev => ({ 
          ...prev, 
          conditions_treated: [...prev.conditions_treated, tagInput.trim()] 
        }))
      }
      setTagInput("")
    }
  }

  // --- Image Upload Handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !user?.id) return

    setSaveLoading(true)
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Math.random()}.${fileExt}`
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('clinic-photos')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('clinic-photos')
          .getPublicUrl(fileName)

        setData(prev => ({ ...prev, clinic_images: [...prev.clinic_images, publicUrl] }))
      }
      toast.success("Imágenes subidas correctamente")
    } catch (err) {
      console.error(err)
      toast.error("Error al subir imágenes")
    } finally {
      setSaveLoading(false)
    }
  }

  if (initialLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      <p className="text-slate-500 font-medium animate-pulse">Cargando tu progreso...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Progress Navigation */}
        <div className="relative">
          <div className="flex justify-between mb-2">
             {steps.map((step, idx) => {
               const Icon = step.icon
               const active = currentStep >= idx + 1
               return (
                 <div key={idx} className="flex flex-col items-center gap-2 z-10 w-20">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                      active ? "bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-500/20" : "bg-white border-slate-200 text-slate-400"
                    )}>
                      {currentStep > idx + 1 ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider text-center", active ? "text-teal-700" : "text-slate-400")}>
                      {step.title}
                    </span>
                 </div>
               )
             })}
          </div>
          <Progress value={((currentStep - 1) / (steps.length - 1)) * 100} className="absolute top-5 left-0 w-full h-1 -z-10 bg-slate-200" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "circOut" }}
          >
            <Card className="border-border/30 shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    {(() => { const Icon = steps[currentStep-1].icon; return <Icon className="h-5 w-5 text-teal-600" />; })()}
                  </div>
                  {currentStep}. {steps[currentStep-1].title}
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium ml-12">
                   {currentStep === 1 && "Define tu marca personal y experiencia."}
                   {currentStep === 2 && "Hitos académicos que generan confianza en tus pacientes."}
                   {currentStep === 3 && "Ayúdanos a conectarte con los pacientes indicados."}
                   {currentStep === 4 && "Una imagen dice más que mil palabras sobre tu consulta."}
                   {currentStep === 5 && "Configura cómo y dónde atenderás a tus pacientes."}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 pt-6 space-y-8">
                
                {/* --- STEP 1: IDENTITY --- */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid gap-3">
                      <Label className="text-sm font-bold flex items-center gap-2">
                        Años de experiencia profesional
                        <Info className="h-3 w-3 text-teal-500" />
                      </Label>
                      <Input 
                        type="number" 
                        value={data.years_experience}
                        onChange={(e) => setData({...data, years_experience: parseInt(e.target.value)})}
                        className="max-w-[120px] rounded-xl h-11 border-slate-200"
                      />
                      <p className="text-[11px] text-slate-400">Indica el tiempo total desde tu titulación profesional.</p>
                    </div>

                    <div className="grid gap-3">
                      <Label className="text-sm font-bold">Biografía Profesional</Label>
                      <Textarea 
                        placeholder="Soy especialista en clínica de adultos con enfoque en..."
                        className="min-h-[160px] rounded-2xl border-slate-200 resize-none p-4"
                        value={data.bio}
                        onChange={(e) => setData({...data, bio: e.target.value})}
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-[11px] text-slate-400">Cuéntale a tus pacientes sobre tu metodología y especialidad.</p>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", data.bio.length < 50 ? "bg-orange-50 text-orange-600" : "bg-teal-50 text-teal-600")}>
                          {data.bio.length} / 50 min.
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <Label className="text-sm font-bold">Idiomas</Label>
                      <div className="flex flex-wrap gap-2">
                        {["Español", "Inglés", "Portugués", "Francés"].map(lang => (
                          <Button
                            key={lang}
                            variant={data.languages.includes(lang) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setData(prev => ({
                                ...prev,
                                languages: prev.languages.includes(lang) ? prev.languages.filter(l => l !== lang) : [...prev.languages, lang]
                              }))
                            }}
                            className={cn("rounded-full h-9 px-4 transition-all", data.languages.includes(lang) ? "bg-teal-600 hover:bg-teal-700" : "border-slate-200 hover:border-teal-200")}
                          >
                            {lang}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- STEP 2: EDUCATION --- */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    {data.education.map((edu, idx) => (
                      <div key={idx} className="p-6 rounded-[1.5rem] bg-slate-50/50 border border-slate-100 relative group">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-full h-8 w-8"
                          onClick={() => setData({...data, education: data.education.filter((_, i) => i !== idx)})}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="grid sm:grid-cols-2 gap-6">
                           <div className="grid gap-2">
                             <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Institución</Label>
                             <Input 
                               placeholder="Ej: PUC / U. de Chile"
                               className="rounded-xl h-11"
                               value={edu.institution}
                               onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                             />
                           </div>
                           <div className="grid gap-2">
                             <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Título / Especialidad</Label>
                             <Input 
                               placeholder="Ej: Especialidad en Cardiología"
                               className="rounded-xl h-11"
                               value={edu.degree}
                               onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                             />
                           </div>
                           <div className="grid gap-2">
                             <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Año de Egreso</Label>
                             <Input 
                               type="number"
                               placeholder="AAAA"
                               className="rounded-xl h-11"
                               value={edu.graduation_year}
                               onChange={(e) => updateEducation(idx, 'graduation_year', e.target.value)}
                             />
                           </div>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      onClick={addEducation}
                      className="w-full h-14 rounded-2xl border-2 border-dashed bg-teal-50/30 border-teal-600/20 text-teal-600 hover:bg-teal-50 hover:border-teal-600/40 font-bold transition-all"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar otro título académico
                    </Button>
                  </div>
                )}

                {/* --- STEP 3: TAGS --- */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                     <div className="grid gap-3">
                        <Label className="text-sm font-bold">Enfermedades y condiciones frecuentes</Label>
                        <div className="relative">
                          <Input 
                            placeholder="Escribe y presiona Enter..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={addTag}
                            className="rounded-xl h-12 pr-12 border-slate-200 focus:border-teal-500"
                          />
                          <Badge className="absolute right-3 top-2.5 bg-teal-50 text-teal-600 border-teal-200">Enter</Badge>
                        </div>
                        <p className="text-[11px] text-slate-400">Esto es vital para que los pacientes te encuentren por síntomas específicos.</p>
                     </div>

                     <div className="flex flex-wrap gap-2 min-h-[140px] p-6 rounded-[2rem] bg-teal-50/20 border border-dashed border-teal-600/20 items-start align-top">
                        {data.conditions_treated.length === 0 && (
                          <div className="m-auto text-center opacity-40 italic flex flex-col items-center">
                            <Stethoscope className="h-8 w-8 mb-2" />
                            <p className="text-sm">No has añadido etiquetas aún.</p>
                          </div>
                        )}
                        {data.conditions_treated.map(tag => (
                          <Badge 
                            key={tag} 
                            className="bg-white border-teal-100 text-teal-700 px-3 py-1.5 h-9 rounded-full gap-2 shadow-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all cursor-pointer group"
                            onClick={() => setData({...data, conditions_treated: data.conditions_treated.filter(t => t !== tag)})}
                          >
                            {tag}
                            <X className="h-3 w-4 opacity-40 group-hover:opacity-100" />
                          </Badge>
                        ))}
                     </div>
                  </div>
                )}

                {/* --- STEP 4: GALLERY --- */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       {data.clinic_images.map((img, idx) => (
                         <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
                            <img src={img} className="w-full h-full object-cover" />
                            <button 
                              className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setData({...data, clinic_images: data.clinic_images.filter((_, i) => i !== idx)})}
                            >
                              <X className="h-3.5 w-3.5 text-red-500" />
                            </button>
                         </div>
                       ))}
                       <label className="aspect-square rounded-2xl border-2 border-dashed border-teal-600/20 bg-teal-50/20 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50/50 hover:border-teal-600/40 transition-all group">
                          <Upload className="h-8 w-8 text-teal-600 mb-2 group-hover:-translate-y-1 transition-transform" />
                          <span className="text-[10px] font-black uppercase text-teal-600">Subir Foto</span>
                          <Input type="file" multiple className="hidden" onChange={handleFileUpload} accept="image/*" />
                       </label>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 text-[11px] text-slate-500 font-medium leading-relaxed flex gap-3">
                       <Info className="h-4 w-4 text-teal-600 shrink-0" />
                       Las fotos de tu consulta transmiten profesionalismo y ayudan al paciente a visualizar su próxima visita. Te recomendamos subir imágenes luminosas y ordenadas.
                    </div>
                  </div>
                )}

                {/* --- STEP 5: MODALITY --- */}
                {currentStep === 5 && (
                  <div className="space-y-8">
                    <div className="grid gap-4">
                       <Label className="text-sm font-bold">¿Cómo atenderás a tus pacientes?</Label>
                       <div className="grid sm:grid-cols-3 gap-4">
                          {[
                            { value: 'online', label: 'Online', icon: Monitor },
                            { value: 'in-person', label: 'Presencial', icon: Building2 },
                            { value: 'both', label: 'Ambos', icon: CheckCircle2 },
                          ].map(item => (
                            <div 
                              key={item.value}
                              onClick={() => setData({...data, consultation_type: item.value as any})}
                              className={cn(
                                "flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all cursor-pointer h-full text-center",
                                data.consultation_type === item.value 
                                  ? "border-teal-600 bg-teal-50/30 shadow-sm" 
                                  : "border-slate-100 bg-white hover:bg-slate-50"
                              )}
                            >
                               <item.icon className={cn("h-6 w-6 mb-2", data.consultation_type === item.value ? "text-teal-600" : "text-slate-400")} />
                               <span className="text-sm font-bold">{item.label}</span>
                            </div>
                          ))}
                       </div>
                    </div>

                    {data.consultation_type !== 'online' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }}
                        className="space-y-6 overflow-hidden"
                      >
                         <Separator />
                         <div className="grid gap-6">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-teal-600" />
                              Dirección de consulta
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-6">
                               <div className="grid gap-2">
                                  <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Dirección (Calle y Número)</Label>
                                  <Input 
                                    className="rounded-xl h-11"
                                    value={data.clinic_address}
                                    onChange={(e) => setData({...data, clinic_address: e.target.value})}
                                  />
                               </div>
                               <div className="grid gap-2">
                                  <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Piso / Oficina / Depto</Label>
                                  <Input 
                                    className="rounded-xl h-11"
                                    value={data.clinic_office}
                                    onChange={(e) => setData({...data, clinic_office: e.target.value})}
                                  />
                               </div>
                               <div className="grid gap-2">
                                  <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Ciudad / Comuna</Label>
                                  <Input 
                                    className="rounded-xl h-11"
                                    placeholder="Ej: Santiago, Las Condes"
                                    value={data.clinic_city}
                                    onChange={(e) => setData({...data, clinic_city: e.target.value})}
                                  />
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </CardContent>

              {/* Botones de navegación */}
              <div className="p-8 bg-slate-50/50 flex justify-between border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  onClick={handleBack} 
                  disabled={currentStep === 1 || saveLoading}
                  className="rounded-xl h-12 px-8 font-bold text-slate-500 hover:bg-white"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Regresar
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={saveLoading || loading}
                  className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-12 px-10 font-bold shadow-xl shadow-teal-500/20 group"
                >
                  {saveLoading || loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : currentStep === 5 ? (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  )}
                  {currentStep === 5 ? "Finalizar Configuración" : "Guardar y Continuar"}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
           Tu progreso se guarda automáticamente al presionar siguiente
        </p>
      </div>
    </div>
  )
}
