"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Camera,
  CheckCircle2,
  Loader2,
  Info,
  Sparkles,
  Stethoscope,
  FileText,
  User,
  Ticket,
  Crown,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { trackEvent } from "@/lib/utils/analytics"

const SPECIALTIES = [
  { value: "psicologia", label: "Psicología", labelEn: "Psychology" },
  { value: "psiquiatria", label: "Psiquiatría", labelEn: "Psychiatry" },
  { value: "medicina-general", label: "Medicina General", labelEn: "General Medicine" },
  { value: "nutricion", label: "Nutrición y Dietética", labelEn: "Nutrition & Dietetics" },
  { value: "kinesiologia", label: "Kinesiología", labelEn: "Physical Therapy" },
  { value: "dermatologia", label: "Dermatología", labelEn: "Dermatology" },
  { value: "cardiologia", label: "Cardiología", labelEn: "Cardiology" },
  { value: "pediatria", label: "Pediatría", labelEn: "Pediatrics" },
  { value: "ginecologia", label: "Ginecología", labelEn: "Gynecology" },
  { value: "neurologia", label: "Neurología", labelEn: "Neurology" },
  { value: "traumatologia", label: "Traumatología", labelEn: "Orthopedics" },
  { value: "medicina-interna", label: "Medicina Interna", labelEn: "Internal Medicine" },
  { value: "endocrinologia", label: "Endocrinología", labelEn: "Endocrinology" },
  { value: "gastroenterologia", label: "Gastroenterología", labelEn: "Gastroenterology" },
  { value: "otra", label: "Otra Especialidad", labelEn: "Other Specialty" },
]

const MAX_BIO_LENGTH = 500

export default function ProfessionalOnboardingPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { user } = useAuth()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isSpanish = language === "es"

  // Onboarding flow deprecated: redirect directly to new profile editor
  useEffect(() => {
    if (!user) return
    router.replace("/dashboard/professional/profile")
  }, [user, router])

  // Form state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [specialty, setSpecialty] = useState("")
  const [rnpiNumber, setRnpiNumber] = useState("")
  const [bio, setBio] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [isVip, setIsVip] = useState(false)
  const [checkingCode, setCheckingCode] = useState(false)

  // Load existing data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, avatar_url")
        .eq("id", user.id)
        .single()

      if (profile) {
        setFirstName(profile.first_name || "")
        if (profile.avatar_url) {
          setAvatarUrl(profile.avatar_url)
        }
      }

      // Also check professionals table for existing data
      const { data: professional } = await supabase
        .from("professionals")
        .select("specialty, registration_number, bio")
        .eq("id", user.id)
        .maybeSingle()

      if (professional) {
        if (professional.specialty) setSpecialty(professional.specialty)
        if (professional.registration_number) setRnpiNumber(professional.registration_number)
        if (professional.bio) setBio(professional.bio)
      }
    }

    loadProfile()
  }, [user?.id, supabase])

  const validateCode = async (code: string) => {
    if (!code || code.length < 3) return
    setCheckingCode(true)
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single()
      
      if (data && data.uses_count < data.max_uses) {
        setIsVip(true)
        toast.success(
          isSpanish 
            ? "¡Código VIP activado! Bienvenido/a a la élite fundadora." 
            : "VIP Code activated! Welcome to the founding elite.",
          { icon: <Crown className="h-5 w-5 text-amber-500" /> }
        )
      } else {
        setIsVip(false)
      }
    } catch (e) {
      setIsVip(false)
    } finally {
      setCheckingCode(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error(isSpanish ? "Solo se permiten imágenes" : "Only images are allowed")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(isSpanish ? "La imagen no debe superar 5MB" : "Image must be under 5MB")
      return
    }

    setAvatarFile(file)
    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setAvatarUrl(previewUrl)
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user?.id) return avatarUrl

    setIsUploading(true)
    try {
      const fileExt = avatarFile.name.split(".").pop()
      const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error(isSpanish ? "Error al subir la foto" : "Error uploading photo")
      return avatarUrl
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!user?.id) return

    // Validation
    if (!specialty) {
      toast.error(isSpanish ? "Selecciona tu especialidad" : "Select your specialty")
      return
    }

    if (!rnpiNumber.trim()) {
      toast.error(isSpanish ? "Ingresa tu número RNPI" : "Enter your RNPI number")
      return
    }

    if (!bio.trim() || bio.length < 50) {
      toast.error(
        isSpanish 
          ? "La biografía debe tener al menos 50 caracteres" 
          : "Bio must be at least 50 characters"
      )
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Upload avatar if changed
      const finalAvatarUrl = await uploadAvatar()

      // 2. Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          avatar_url: finalAvatarUrl,
          is_onboarded: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      // 3. Check if professional record exists
      const { data: existingPro } = await supabase
        .from("professionals")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()

      const specialtyLabel = SPECIALTIES.find(s => s.value === specialty)?.label || specialty

      if (existingPro) {
        // Update existing professional record
        const { error: proError } = await supabase
          .from("professionals")
          .update({
            specialty: specialtyLabel,
            registration_number: rnpiNumber.trim(),
            bio: bio.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (proError) throw proError
        if (proError) throw proError
      } else {
        // Create new professional record
        const { error: proError } = await supabase
          .from("professionals")
          .insert({
            id: user.id,
            specialty: specialtyLabel,
            registration_number: rnpiNumber.trim(),
            bio: bio.trim(),
            referral_code_used: isVip ? referralCode.toUpperCase() : null,
            is_vip: isVip,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (proError) throw proError
        
        // Update code usage count
        if (isVip) {
          await supabase.rpc('increment_referral_usage', { code_param: referralCode.toUpperCase() })
        }
      }

      trackEvent('onboarding_finish', { 
        specialty: specialtyLabel,
        is_vip: isVip,
        referral_code: isVip ? referralCode.toUpperCase() : null
      })

      // Success!
      toast.success(
        isVip 
          ? (isSpanish 
              ? `¡Bienvenido Doctor/a Pionero/a! Gracias por confiar en la salud del futuro.` 
              : `Welcome Pioneer Doctor! Thank you for trusting in the future of health.`)
          : (isSpanish 
              ? `¡Perfil configurado con éxito! Bienvenido/a a bordo, Dr/a. ${firstName}` 
              : `Profile setup complete! Welcome aboard, Dr. ${firstName}`),
        {
          icon: isVip ? <Crown className="h-5 w-5 text-amber-500" /> : <Sparkles className="h-5 w-5 text-teal-500" />,
          duration: 6000,
        }
      )

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard/professional")
        router.refresh()
      }, 1500)

    } catch (error) {
      console.error("Onboarding error:", error)
      toast.error(
        isSpanish 
          ? "Error al guardar. Intenta nuevamente." 
          : "Error saving. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = specialty && rnpiNumber.trim().length >= 5 && bio.trim().length >= 50

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20"
          >
            <Stethoscope className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {isSpanish ? "Configura tu Perfil" : "Set Up Your Profile"}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {isSpanish 
              ? "Completa tu información para comenzar a recibir pacientes en NUREA"
              : "Complete your information to start receiving patients on NUREA"}
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-slate-200/60 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          <CardContent className="p-6 sm:p-8 space-y-8">
            
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isSpanish ? "Foto de Perfil" : "Profile Photo"}
              </Label>
              
              <div className="relative group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className={cn(
                    "relative w-32 h-32 rounded-full overflow-hidden",
                    "border-4 border-dashed border-slate-200 dark:border-slate-700",
                    "hover:border-teal-400 dark:hover:border-teal-500",
                    "transition-all duration-300 group",
                    "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
                    avatarUrl && "border-solid border-teal-500"
                  )}
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <User className="h-12 w-12 text-slate-400" />
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className={cn(
                    "absolute inset-0 bg-black/50 flex items-center justify-center",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  )}>
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </button>

                {/* Status Badge */}
                {avatarUrl && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </motion.div>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                {isSpanish 
                  ? "Haz clic para subir o cambiar tu foto"
                  : "Click to upload or change your photo"}
              </p>
            </div>

            {/* Specialty Select */}
            <div className="space-y-2">
              <Label htmlFor="specialty" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isSpanish ? "Especialidad Principal" : "Main Specialty"}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger 
                  id="specialty"
                  className="h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-teal-500"
                >
                  <SelectValue placeholder={isSpanish ? "Selecciona tu especialidad" : "Select your specialty"} />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((spec) => (
                    <SelectItem key={spec.value} value={spec.value}>
                      {isSpanish ? spec.label : spec.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* RNPI Number */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="rnpi" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isSpanish ? "Número RNPI" : "RNPI Number"}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-slate-400 hover:text-teal-500 transition-colors">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs p-3">
                      <p className="text-sm">
                        {isSpanish 
                          ? "Tu número de Registro Nacional de Prestadores Individuales es vital para emitir recetas y bonos. Lo puedes encontrar en tu certificado de la Superintendencia de Salud."
                          : "Your National Individual Provider Registry number is essential for issuing prescriptions and vouchers. You can find it on your Health Superintendency certificate."}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="rnpi"
                type="text"
                placeholder={isSpanish ? "Ej: 123456-7" : "E.g., 123456-7"}
                value={rnpiNumber}
                onChange={(e) => setRnpiNumber(e.target.value)}
                className="h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-teal-500"
              />
            </div>

            {/* Referral Code (Gamification) */}
            <div className="space-y-4 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 relative overflow-hidden group">
              {isVip && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-amber-500/5 pointer-events-none"
                />
              )}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <Ticket className={cn("h-5 w-5", isVip ? "text-amber-500" : "text-slate-400")} />
                  <Label htmlFor="referral" className="text-sm font-semibold">
                    {isSpanish ? "¿Tienes un código de invitación?" : "Do you have an invitation code?"}
                  </Label>
                </div>
                {isVip && (
                  <Badge className="bg-amber-500 text-white border-none animate-pulse">
                    VIP FOUNDER
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 relative z-10">
                <Input
                  id="referral"
                  placeholder="NUREA50"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className={cn(
                    "font-mono tracking-widest uppercase transition-all",
                    isVip ? "border-amber-500 ring-amber-500 bg-amber-50/50" : ""
                  )}
                  disabled={isVip}
                />
                {!isVip && (
                  <Button 
                    type="button" 
                    variant="outline"
                    disabled={!referralCode || checkingCode}
                    onClick={() => validateCode(referralCode)}
                  >
                    {checkingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSpanish ? "Validar" : "Validate")}
                  </Button>
                )}
              </div>
              {isVip ? (
                <p className="text-xs text-amber-600 font-medium">
                  {isSpanish 
                    ? "¡Acceso Exclusivo Activado! Tu perfil tendrá prioridad en las búsquedas." 
                    : "Exclusive Access Activated! Your profile will have search priority."}
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  {isSpanish 
                    ? "Los códigos VIP son entregados a la red de fundadores seleccionados."
                    : "VIP codes are given to the selected founder network."}
                </p>
              )}
            </div>

            {/* Bio Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isSpanish ? "Biografía Profesional" : "Professional Bio"}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <span className={cn(
                  "text-xs",
                  bio.length > MAX_BIO_LENGTH 
                    ? "text-red-500" 
                    : bio.length >= 50 
                      ? "text-teal-600" 
                      : "text-slate-400"
                )}>
                  {bio.length}/{MAX_BIO_LENGTH}
                </span>
              </div>
              <Textarea
                id="bio"
                placeholder={
                  isSpanish 
                    ? "Cuéntale a tus pacientes sobre tu experiencia, formación y enfoque terapéutico..." 
                    : "Tell your patients about your experience, training, and therapeutic approach..."
                }
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
                className="min-h-[140px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-teal-500 resize-none"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isSpanish 
                  ? "Mínimo 50 caracteres. Esta descripción aparecerá en tu perfil público."
                  : "Minimum 50 characters. This description will appear on your public profile."}
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting || isUploading}
                className={cn(
                  "w-full h-14 text-lg font-semibold rounded-xl",
                  "bg-gradient-to-r from-teal-600 to-emerald-600",
                  "hover:from-teal-700 hover:to-emerald-700",
                  "shadow-lg shadow-teal-500/20",
                  "transition-all duration-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isSubmitting || isUploading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {isSpanish ? "Guardando..." : "Saving..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    {isSpanish ? "Finalizar Configuración" : "Complete Setup"}
                  </span>
                )}
              </Button>
            </div>

            {/* Helper Text */}
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              {isSpanish 
                ? "Podrás editar esta información después desde tu configuración"
                : "You can edit this information later from your settings"}
            </p>

          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            {isSpanish ? "Datos encriptados" : "Encrypted data"}
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            {isSpanish ? "Ley 19.628" : "Law 19.628"}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
