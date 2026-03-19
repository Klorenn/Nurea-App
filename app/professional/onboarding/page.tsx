"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { GoogleAddressInput } from "@/components/ui/google-address-input"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  User,
  Briefcase,
  Video,
  Home,
  Calendar,
  DollarSign,
  FileText,
  X,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Crown
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { normalizeAvailability } from "@/lib/utils/availability-helpers"
import { trackEvent } from "@/lib/utils/analytics"
import { toast } from "sonner"

const TOTAL_STEPS = 6

export default function ProfessionalOnboardingPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedData, setSavedData] = useState<any>(null)
  const [inviteCode, setInviteCode] = useState("")
  const [isInviteValid, setIsInviteValid] = useState(false)
  const [isValidatingInvite, setIsValidatingInvite] = useState(false)
  const [inviteMessage, setInviteMessage] = useState<string | null>(null)
  
  // Hard Gate State
  const [accessGranted, setAccessGranted] = useState(false)
  const [hardGateCode, setHardGateCode] = useState("")
  const [isVerifyingGate, setIsVerifyingGate] = useState(false)
  const [gateError, setGateError] = useState<string | null>(null)
  
  // Waitlist State
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState("")
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false)
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)

  // Step 1: Basic Info
  const [specialty, setSpecialty] = useState("")
  const [bio, setBio] = useState("")
  const [yearsExperience, setYearsExperience] = useState("")
  const [location, setLocation] = useState("")

  const validateInvite = async () => {
    if (!inviteCode) return
    setIsValidatingInvite(true)
    setInviteMessage(null)
    try {
      const response = await fetch("/api/auth/verify-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode }),
      })
      const data = await response.json()
      if (data.valid) {
        setIsInviteValid(true)
        setInviteMessage(data.message)
      } else {
        setIsInviteValid(false)
        setInviteMessage(data.message)
      }
    } catch (err) {
      setInviteMessage(isSpanish ? "Error al validar el código" : "Error validating code")
    } finally {
      setIsValidatingInvite(false)
    }
  }

  const handleVerifyHardGate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hardGateCode) return
    
    setIsVerifyingGate(true)
    setGateError(null)
    
    try {
      const response = await fetch("/api/auth/verify-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: hardGateCode }),
      })
      
      const data = await response.json()
      
      if (data.valid) {
        setAccessGranted(true)
        setInviteCode(hardGateCode)
        setIsInviteValid(true)
        setInviteMessage(data.message)
        trackEvent('hard_gate_success', { code: hardGateCode })
      } else {
        setGateError(data.message)
      }
    } catch (err) {
      setGateError(isSpanish ? "Error de conexión" : "Connection error")
    } finally {
      setIsVerifyingGate(false)
    }
  }

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!waitlistEmail) return
    
    setIsJoiningWaitlist(true)
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitlistEmail }),
      })
      
      if (response.ok) {
        setWaitlistSuccess(true)
        toast.success(isSpanish ? "¡Te has unido a la lista de espera!" : "Joined waitlist!")
      }
    } catch (err) {
      toast.error(isSpanish ? "Error al unirse" : "Error joining")
    } finally {
      setIsJoiningWaitlist(false)
    }
  }

  // Step 2: Services & Languages
  const [services, setServices] = useState<string[]>([])
  const [newService, setNewService] = useState("")
  const [languages, setLanguages] = useState<string[]>([])
  const [newLanguage, setNewLanguage] = useState("")

  // Step 3: Consultation Setup
  const [consultationType, setConsultationType] = useState<"online" | "in-person" | "both">("both")
  const [onlinePrice, setOnlinePrice] = useState("")
  const [inPersonPrice, setInPersonPrice] = useState("")
  const [videoPlatform, setVideoPlatform] = useState("google-meet")
  const [clinicAddress, setClinicAddress] = useState("")

  // Step 4: Availability (nuevo formato con horarios por tipo)
  const [availability, setAvailability] = useState<any>({
    monday: { online: { available: false, hours: "" }, "in-person": { available: false, hours: "" } },
    tuesday: { online: { available: false, hours: "" }, "in-person": { available: false, hours: "" } },
    wednesday: { online: { available: false, hours: "" }, "in-person": { available: false, hours: "" } },
    thursday: { online: { available: false, hours: "" }, "in-person": { available: false, hours: "" } },
    friday: { online: { available: false, hours: "" }, "in-person": { available: false, hours: "" } },
    saturday: { online: { available: false, hours: "" }, "in-person": { available: false, hours: "" } },
    sunday: { online: { available: false, hours: "" }, "in-person": { available: false, hours: "" } },
  })

  // Step 5: Payment Info
  const [bankAccount, setBankAccount] = useState("")
  const [bankName, setBankName] = useState("")

  // Step 6: Professional Registration
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [registrationInstitution, setRegistrationInstitution] = useState("")

  useEffect(() => {
    loadExistingData()
  }, [])

  const loadExistingData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/professional/onboarding/status")
      const data = await response.json()

      // Handle both success and error cases gracefully
      if (response.ok && data.success !== false) {
        const prof = data.professional || {}
        
        // Load existing data into form (safely check for values)
        if (prof.specialty && typeof prof.specialty === 'string') setSpecialty(prof.specialty)
        if (prof.bio && typeof prof.bio === 'string') setBio(prof.bio)
        if (prof.onlinePrice && typeof prof.onlinePrice === 'number') setOnlinePrice(prof.onlinePrice.toString())
        if (prof.inPersonPrice && typeof prof.inPersonPrice === 'number') setInPersonPrice(prof.inPersonPrice.toString())
        if (prof.availability && typeof prof.availability === 'object') {
          // Normalizar disponibilidad al nuevo formato si viene en formato antiguo
          const normalized = normalizeAvailability(prof.availability, prof.consultationType || consultationType || 'both')
          setAvailability(normalized)
        }
        if (prof.consultationType && typeof prof.consultationType === 'string') {
          setConsultationType(prof.consultationType as "online" | "in-person" | "both")
        }
        if (prof.bankAccount && typeof prof.bankAccount === 'string') setBankAccount(prof.bankAccount)
        if (prof.bankName && typeof prof.bankName === 'string') setBankName(prof.bankName)
        if (prof.registrationNumber && typeof prof.registrationNumber === 'string') setRegistrationNumber(prof.registrationNumber)
        if (prof.registrationInstitution && typeof prof.registrationInstitution === 'string') setRegistrationInstitution(prof.registrationInstitution)
        
        setSavedData(data)
        
        // If already complete, redirect to dashboard
        if (data.isComplete === true) {
          router.push("/professional/dashboard")
        }
      } else {
        // API returned an error, but we can still show the form
        // The form will create the professional record when saved
        console.warn("Onboarding status check returned error, showing empty form:", data)
        setSavedData({ success: false, isComplete: false, missingFields: [] })
      }
    } catch (err) {
      console.error("Error loading existing data:", err)
      // Don't block the form - allow user to fill it out
      // The save function will create the record if it doesn't exist
      setSavedData({ success: false, isComplete: false, missingFields: [] })
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = async (finalStep: boolean = false) => {
    setSaving(true)
    setError(null)
    
    try {
      const response = await fetch("/api/professional/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialty,
          bio,
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
          location,
          services,
          languages,
          consultationType,
          onlinePrice: onlinePrice ? parseFloat(onlinePrice) : undefined,
          inPersonPrice: inPersonPrice ? parseFloat(inPersonPrice) : undefined,
          videoPlatform,
          clinicAddress,
          availability,
          bankAccount,
          bankName,
          registrationNumber,
          registrationInstitution,
          referralCodeUsed: isInviteValid ? inviteCode : undefined,
          isVip: isInviteValid,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || (isSpanish ? "Error al guardar" : "Error saving"))
      }

      if (finalStep && data.isComplete) {
        // Onboarding complete, track and redirect
        trackEvent('professional_registration_success', {
          invite_code: isInviteValid ? inviteCode : null,
          is_vip: isInviteValid,
          specialty
        })
        router.push("/professional/dashboard")
      } else if (finalStep && !data.isComplete) {
        setError(isSpanish 
          ? "Por favor completa todos los campos requeridos"
          : "Please complete all required fields")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (isSpanish ? "Error al guardar" : "Error saving"))
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async () => {
    // Validate current step before proceeding
    if (!validateStep(currentStep)) {
      return
    }

    // Save progress
    await saveProgress(false)

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!specialty.trim()) {
          setError(isSpanish ? "La especialidad es requerida" : "Specialty is required")
          return false
        }
        if (!bio.trim()) {
          setError(isSpanish ? "La biografía es requerida" : "Bio is required")
          return false
        }
        if (!isInviteValid) {
          setError(isSpanish ? "Debes validar un código de invitación VIP" : "You must validate a VIP invitation code")
          return false
        }
        return true
      case 2:
        if (services.length === 0) {
          setError(isSpanish ? "Agrega al menos un servicio" : "Add at least one service")
          return false
        }
        if (languages.length === 0) {
          setError(isSpanish ? "Agrega al menos un idioma" : "Add at least one language")
          return false
        }
        return true
      case 3:
        if (consultationType === "online" || consultationType === "both") {
          if (!onlinePrice || parseFloat(onlinePrice) <= 0) {
            setError(isSpanish ? "El precio online es requerido" : "Online price is required")
            return false
          }
        }
        if (consultationType === "in-person" || consultationType === "both") {
          if (!inPersonPrice || parseFloat(inPersonPrice) <= 0) {
            setError(isSpanish ? "El precio presencial es requerido" : "In-person price is required")
            return false
          }
          if (!clinicAddress.trim()) {
            setError(isSpanish ? "La dirección de la clínica es requerida" : "Clinic address is required")
            return false
          }
        }
        return true
      case 4:
        // Verificar disponibilidad según el tipo de consulta
        const hasAvailability = Object.keys(availability).some((day: string) => {
          const dayData = availability[day]
          if (!dayData) return false
          
          if (consultationType === 'online') {
            return dayData.online?.available === true && dayData.online?.hours && dayData.online.hours.trim() !== ""
          } else if (consultationType === 'in-person') {
            return dayData['in-person']?.available === true && dayData['in-person']?.hours && dayData['in-person'].hours.trim() !== ""
          } else {
            // both: necesita al menos un tipo con disponibilidad
            return (
              (dayData.online?.available === true && dayData.online?.hours && dayData.online.hours.trim() !== "") ||
              (dayData['in-person']?.available === true && dayData['in-person']?.hours && dayData['in-person'].hours.trim() !== "")
            )
          }
        })
        if (!hasAvailability) {
          setError(isSpanish ? "Configura al menos un día con horarios" : "Configure at least one day with hours")
          return false
        }
        return true
      case 5:
        if (!bankAccount.trim()) {
          setError(isSpanish ? "La cuenta bancaria es requerida" : "Bank account is required")
          return false
        }
        if (!bankName.trim()) {
          setError(isSpanish ? "El nombre del banco es requerido" : "Bank name is required")
          return false
        }
        return true
      case 6:
        if (!registrationNumber.trim()) {
          setError(isSpanish ? "El número de registro es requerido" : "Registration number is required")
          return false
        }
        if (!registrationInstitution.trim()) {
          setError(isSpanish ? "La institución de registro es requerida" : "Registration institution is required")
          return false
        }
        return true
      default:
        return true
    }
  }

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()])
      setNewService("")
    }
  }

  const removeService = (service: string) => {
    setServices(services.filter((s) => s !== service))
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()])
      setNewLanguage("")
    }
  }

  const removeLanguage = (language: string) => {
    setLanguages(languages.filter((l) => l !== language))
  }

  const toggleDayAvailability = (day: string, type: 'online' | 'in-person') => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        [type]: {
          ...availability[day]?.[type],
          available: !availability[day]?.[type]?.available,
          hours: availability[day]?.[type]?.hours || "",
        },
      },
    })
  }

  const updateDayHours = (day: string, type: 'online' | 'in-person', hours: string) => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        [type]: {
          ...availability[day]?.[type],
          available: availability[day]?.[type]?.available || false,
          hours,
        },
      },
    })
  }

  const dayNames: { [key: string]: { es: string; en: string } } = {
    monday: { es: "Lunes", en: "Monday" },
    tuesday: { es: "Martes", en: "Tuesday" },
    wednesday: { es: "Miércoles", en: "Wednesday" },
    thursday: { es: "Jueves", en: "Thursday" },
    friday: { es: "Viernes", en: "Friday" },
    saturday: { es: "Sábado", en: "Saturday" },
    sunday: { es: "Domingo", en: "Sunday" },
  }

  if (loading) {
    return (
      <RouteGuard requiredRole="professional">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard requiredRole="professional">
      <div className="min-h-screen bg-background py-8 px-4 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {!accessGranted && !savedData?.isComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-[2rem] bg-slate-950 flex items-center justify-center shadow-2xl border border-white/10 ring-8 ring-slate-100 dark:ring-slate-800">
                  <ShieldCheck className="h-10 w-10 text-teal-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900">
                  <Crown className="h-3 w-3 text-white" />
                </div>
              </div>

              <div className="space-y-3 max-w-md">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {isSpanish ? "Acceso Exclusivo NUREA" : "NUREA Exclusive Access"}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isSpanish 
                    ? "NUREA se encuentra actualmente en fase privada. Introduce tu código de acceso exclusivo para continuar al onboarding profesional."
                    : "NUREA is currently in private phase. Enter your exclusive access code to proceed to professional onboarding."}
                </p>
              </div>

              {!showWaitlist ? (
                <form onSubmit={handleVerifyHardGate} className="w-full max-w-sm space-y-4">
                  <div className="relative group">
                    <Input
                      type="text"
                      placeholder="ESCRIBE TU CÓDIGO AQUÍ"
                      value={hardGateCode}
                      onChange={(e) => setHardGateCode(e.target.value.toUpperCase())}
                      className="h-14 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-teal-500 rounded-2xl text-center font-mono text-xl tracking-widest uppercase transition-all shadow-inner"
                      disabled={isVerifyingGate}
                    />
                    <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 opacity-50 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  
                  {gateError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-500/10 py-2 rounded-lg inline-block px-4"
                    >
                      {gateError}
                    </motion.p>
                  )}

                  <Button 
                    type="submit" 
                    disabled={!hardGateCode || isVerifyingGate}
                    className="w-full h-14 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl text-lg font-bold shadow-xl shadow-teal-500/10 group overflow-hidden relative"
                  >
                    {isVerifyingGate ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {isSpanish ? "Desbloquear Acceso" : "Unlock Access"}
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    )}
                  </Button>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setShowWaitlist(true)}
                      className="text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors underline underline-offset-4"
                    >
                      {isSpanish ? "¿No tienes un código? Únete a la lista de espera" : "Don't have a code? Join the waitlist"}
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-sm space-y-4"
                >
                  {waitlistSuccess ? (
                    <div className="p-6 bg-teal-50 dark:bg-teal-500/10 rounded-2xl border border-teal-200 dark:border-teal-500/20 text-teal-700 dark:text-teal-300">
                      <CheckCircle2 className="h-10 w-10 mx-auto mb-4" />
                      <h3 className="font-bold mb-1">{isSpanish ? "¡Estás en la lista!" : "You're on the list!"}</h3>
                      <p className="text-sm opacity-80">
                        {isSpanish ? "Te avisaremos en cuanto abramos más cupos para especialistas." : "We'll let you know as soon as we open more spots for specialists."}
                      </p>
                      <Button variant="ghost" onClick={() => setShowWaitlist(false)} className="mt-4 text-xs">
                        {isSpanish ? "Volver" : "Back"}
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleJoinWaitlist} className="space-y-4">
                      <div className="space-y-1 text-left">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2">
                          Email corporativo / profesional
                        </Label>
                        <Input
                          type="email"
                          placeholder="doctor@ejemplo.com"
                          value={waitlistEmail}
                          onChange={(e) => setWaitlistEmail(e.target.value)}
                          className="h-12 rounded-xl focus:ring-teal-500"
                          disabled={isJoiningWaitlist}
                        />
                      </div>
                      <Button 
                        disabled={!waitlistEmail || isJoiningWaitlist}
                        className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold"
                      >
                        {isJoiningWaitlist ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSpanish ? "Solicitar Acceso" : "Request Access")}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setShowWaitlist(false)}
                        className="text-xs text-slate-500 hover:underline"
                      >
                        {isSpanish ? "Tengo un código" : "I have a code"}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <>
              {/* Progress Header */}
              <Card className="mb-6 overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-2xl">
                {isSpanish ? "Configuración de Perfil Profesional" : "Professional Profile Setup"}
              </CardTitle>
              <CardDescription>
                {isSpanish 
                  ? "Completa tu perfil para comenzar a recibir pacientes"
                  : "Complete your profile to start receiving patients"}
              </CardDescription>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>
                    {isSpanish ? "Paso" : "Step"} {currentStep} {isSpanish ? "de" : "of"} {TOTAL_STEPS}
                  </span>
                  <span>{Math.round((currentStep / TOTAL_STEPS) * 100)}%</span>
                </div>
                <Progress value={(currentStep / TOTAL_STEPS) * 100} className="h-2" />
              </div>
            </CardHeader>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="mb-6 border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentStep === 1 && <User className="h-5 w-5" />}
                {currentStep === 2 && <Briefcase className="h-5 w-5" />}
                {currentStep === 3 && <Video className="h-5 w-5" />}
                {currentStep === 4 && <Calendar className="h-5 w-5" />}
                {currentStep === 5 && <DollarSign className="h-5 w-5" />}
                {currentStep === 6 && <FileText className="h-5 w-5" />}
                {currentStep === 1 && (isSpanish ? "Información Básica" : "Basic Information")}
                {currentStep === 2 && (isSpanish ? "Servicios e Idiomas" : "Services & Languages")}
                {currentStep === 3 && (isSpanish ? "Configuración de Consultas" : "Consultation Setup")}
                {currentStep === 4 && (isSpanish ? "Disponibilidad" : "Availability")}
                {currentStep === 5 && (isSpanish ? "Información de Pago" : "Payment Information")}
                {currentStep === 6 && (isSpanish ? "Registro Profesional" : "Professional Registration")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[calc(100vh-300px)] overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="specialty">
                      {isSpanish ? "Especialidad / Título Profesional" : "Specialty / Professional Title"} *
                    </Label>
                    <Input
                      id="specialty"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder={isSpanish ? "Ej: Psicólogo Clínico" : "E.g: Clinical Psychologist"}
                    />
                  </div>

                  {/* VIP Invitation Block */}
                  <div className="p-6 rounded-[2rem] border-2 border-dashed border-teal-500/30 bg-teal-500/5 relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                        <Ticket className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <Label className="text-base font-bold text-slate-900 dark:text-white">
                          {isSpanish ? "Código de Invitación VIP" : "VIP Invitation Code"} *
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {isSpanish ? "Requerido para el lanzamiento privado" : "Required for private launch"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={inviteCode}
                        onChange={(e) => {
                          setInviteCode(e.target.value.toUpperCase())
                          setIsInviteValid(false)
                          setInviteMessage(null)
                        }}
                        placeholder="NUREA50"
                        className={cn(
                          "font-mono text-lg tracking-widest h-12 bg-white dark:bg-slate-950",
                          isInviteValid && "border-teal-500 ring-teal-500 bg-teal-50/50"
                        )}
                        disabled={isInviteValid || isValidatingInvite}
                      />
                      {!isInviteValid ? (
                        <Button 
                          type="button" 
                          onClick={validateInvite}
                          disabled={!inviteCode || isValidatingInvite}
                          className="h-12 px-6 bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          {isValidatingInvite ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            isSpanish ? "Validar" : "Validate"
                          )}
                        </Button>
                      ) : (
                        <div className="h-12 px-4 flex items-center justify-center rounded-xl bg-teal-500 text-white shadow-lg shadow-teal-500/20">
                          <ShieldCheck className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {inviteMessage && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "mt-3 text-sm font-medium flex items-center gap-2",
                          isInviteValid ? "text-teal-600 dark:text-teal-400" : "text-red-500"
                        )}
                      >
                        {isInviteValid ? <Crown className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {inviteMessage}
                      </motion.p>
                    )}
                    
                    {isInviteValid && (
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <Badge className="bg-amber-500 text-white border-none animate-pulse">
                          FOUNDER VIP
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bio">
                      {isSpanish ? "Biografía" : "Biography"} *
                    </Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={isSpanish ? "Describe tu experiencia y enfoque profesional..." : "Describe your experience and professional approach..."}
                      rows={5}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yearsExperience">
                        {isSpanish ? "Años de Experiencia" : "Years of Experience"}
                      </Label>
                      <Input
                        id="yearsExperience"
                        type="number"
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">
                        {isSpanish ? "Ubicación" : "Location"}
                      </Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={isSpanish ? "Ej: Santiago, Chile" : "E.g: Santiago, Chile"}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Services & Languages */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label>
                      {isSpanish ? "Servicios / Especialidades" : "Services / Specialties"} *
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
                        placeholder={isSpanish ? "Agregar servicio..." : "Add service..."}
                      />
                      <Button type="button" onClick={addService}>
                        {isSpanish ? "Agregar" : "Add"}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {services.map((service) => (
                        <Badge key={service} variant="secondary" className="flex items-center gap-1">
                          {service}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeService(service)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>
                      {isSpanish ? "Idiomas" : "Languages"} *
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                        placeholder={isSpanish ? "Agregar idioma..." : "Add language..."}
                      />
                      <Button type="button" onClick={addLanguage}>
                        {isSpanish ? "Agregar" : "Add"}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {languages.map((lang) => (
                        <Badge key={lang} variant="secondary" className="flex items-center gap-1">
                          {lang}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeLanguage(lang)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Consultation Setup */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label>
                      {isSpanish ? "Tipo de Consulta" : "Consultation Type"} *
                    </Label>
                    <Select
                      value={consultationType}
                      onValueChange={(value: "online" | "in-person" | "both") => setConsultationType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">
                          {isSpanish ? "Solo Online" : "Online Only"}
                        </SelectItem>
                        <SelectItem value="in-person">
                          {isSpanish ? "Solo Presencial" : "In-Person Only"}
                        </SelectItem>
                        <SelectItem value="both">
                          {isSpanish ? "Online y Presencial" : "Online and In-Person"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(consultationType === "online" || consultationType === "both") && (
                    <>
                      <div>
                        <Label htmlFor="onlinePrice">
                          {isSpanish ? "Precio Consulta Online (CLP)" : "Online Consultation Price (CLP)"} *
                        </Label>
                        <Input
                          id="onlinePrice"
                          type="number"
                          value={onlinePrice}
                          onChange={(e) => setOnlinePrice(e.target.value)}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="videoPlatform">
                          {isSpanish ? "Plataforma de Video" : "Video Platform"}
                        </Label>
                        <Select value={videoPlatform} onValueChange={setVideoPlatform}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="google-meet">Google Meet</SelectItem>
                            <SelectItem value="zoom">Zoom</SelectItem>
                            <SelectItem value="teams">Microsoft Teams</SelectItem>
                            <SelectItem value="other">{isSpanish ? "Otra" : "Other"}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  {(consultationType === "in-person" || consultationType === "both") && (
                    <>
                      <div>
                        <Label htmlFor="inPersonPrice">
                          {isSpanish ? "Precio Consulta Presencial (CLP)" : "In-Person Consultation Price (CLP)"} *
                        </Label>
                        <Input
                          id="inPersonPrice"
                          type="number"
                          value={inPersonPrice}
                          onChange={(e) => setInPersonPrice(e.target.value)}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="clinicAddress">
                          {isSpanish ? "Dirección de la Clínica" : "Clinic Address"} *
                        </Label>
                        <GoogleAddressInput
                          value={clinicAddress}
                          onChange={(val) => setClinicAddress(val)}
                          placeholder={isSpanish ? "Busca la dirección de tu clínica..." : "Search your clinic address..."}
                          className="rounded-xl"
                          language={isSpanish ? "es" : "en"}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 4: Availability */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    {isSpanish 
                      ? "Configura tus horarios de disponibilidad. Debes tener al menos un día disponible."
                      : "Configure your availability hours. You must have at least one day available."}
                  </p>
                  
                  {consultationType === "both" && (
                    <div className="bg-accent/20 p-4 rounded-lg border border-accent/30">
                      <p className="text-sm font-medium mb-4">
                        {isSpanish 
                          ? "Configura horarios separados para cada tipo de consulta:"
                          : "Configure separate hours for each consultation type:"}
                      </p>
                    </div>
                  )}

                  {Object.keys(availability).map((day) => (
                    <div key={day} className="p-4 border rounded-lg space-y-3">
                      <Label className="font-medium text-base">
                        {dayNames[day][isSpanish ? "es" : "en"]}
                      </Label>
                      
                      {/* Online availability */}
                      {(consultationType === "online" || consultationType === "both") && (
                        <div className="flex items-center gap-4 pl-4 border-l-2 border-primary/30">
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="checkbox"
                              id={`${day}-online`}
                              checked={availability[day]?.online?.available || false}
                              onChange={() => toggleDayAvailability(day, 'online')}
                              className="w-4 h-4"
                            />
                            <Label htmlFor={`${day}-online`} className="font-medium min-w-[100px] flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              {isSpanish ? "Online" : "Online"}
                            </Label>
                          </div>
                          {availability[day]?.online?.available && (
                            <Input
                              value={availability[day]?.online?.hours || ""}
                              onChange={(e) => updateDayHours(day, 'online', e.target.value)}
                              placeholder={isSpanish ? "Ej: 09:00 - 13:00" : "E.g: 09:00 - 13:00"}
                              className="max-w-[200px]"
                            />
                          )}
                        </div>
                      )}
                      
                      {/* In-person availability */}
                      {(consultationType === "in-person" || consultationType === "both") && (
                        <div className="flex items-center gap-4 pl-4 border-l-2 border-secondary/30">
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="checkbox"
                              id={`${day}-in-person`}
                              checked={availability[day]?.['in-person']?.available || false}
                              onChange={() => toggleDayAvailability(day, 'in-person')}
                              className="w-4 h-4"
                            />
                            <Label htmlFor={`${day}-in-person`} className="font-medium min-w-[100px] flex items-center gap-2">
                              <Home className="h-4 w-4" />
                              {isSpanish ? "Presencial" : "In-Person"}
                            </Label>
                          </div>
                          {availability[day]?.['in-person']?.available && (
                            <Input
                              value={availability[day]?.['in-person']?.hours || ""}
                              onChange={(e) => updateDayHours(day, 'in-person', e.target.value)}
                              placeholder={isSpanish ? "Ej: 14:00 - 18:00" : "E.g: 14:00 - 18:00"}
                              className="max-w-[200px]"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Step 5: Payment Info */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bankAccount">
                      {isSpanish ? "Cuenta Bancaria" : "Bank Account"} *
                    </Label>
                    <Input
                      id="bankAccount"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder={isSpanish ? "Número de cuenta..." : "Account number..."}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">
                      {isSpanish ? "Nombre del Banco" : "Bank Name"} *
                    </Label>
                    <Input
                      id="bankName"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder={isSpanish ? "Ej: Banco de Chile" : "E.g: Bank of Chile"}
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Professional Registration */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="registrationNumber">
                      {isSpanish ? "Número de Registro Profesional" : "Professional Registration Number"} *
                    </Label>
                    <Input
                      id="registrationNumber"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder={isSpanish ? "Número de registro..." : "Registration number..."}
                    />
                  </div>
                  <div>
                    <Label htmlFor="registrationInstitution">
                      {isSpanish ? "Institución de Registro" : "Registration Institution"} *
                    </Label>
                    <Input
                      id="registrationInstitution"
                      value={registrationInstitution}
                      onChange={(e) => setRegistrationInstitution(e.target.value)}
                      placeholder={isSpanish ? "Ej: Colegio de Psicólogos de Chile" : "E.g: College of Psychologists of Chile"}
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
                </div>
              </ScrollArea>
              <div className="flex justify-between pt-6 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || saving}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {isSpanish ? "Anterior" : "Previous"}
                </Button>
                {currentStep < TOTAL_STEPS ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={saving || (currentStep === 1 && !isInviteValid)}
                  >
                    {isSpanish ? "Siguiente" : "Next"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => saveProgress(true)}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isSpanish ? "Guardando..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {isSpanish ? "Completar Configuración" : "Complete Setup"}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>
      </div>
    </RouteGuard>
  )
}

