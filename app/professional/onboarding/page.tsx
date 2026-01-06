"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Progress } from "@/components/ui/progress"
import { normalizeAvailability } from "@/lib/utils/availability-helpers"

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

  // Step 1: Basic Info
  const [specialty, setSpecialty] = useState("")
  const [bio, setBio] = useState("")
  const [yearsExperience, setYearsExperience] = useState("")
  const [location, setLocation] = useState("")

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
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || (isSpanish ? "Error al guardar" : "Error saving"))
      }

      if (finalStep && data.isComplete) {
        // Onboarding complete, redirect to dashboard
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
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <Card className="mb-6">
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
            <CardContent className="space-y-6">
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
                        <Textarea
                          id="clinicAddress"
                          value={clinicAddress}
                          onChange={(e) => setClinicAddress(e.target.value)}
                          placeholder={isSpanish ? "Dirección completa..." : "Full address..."}
                          rows={3}
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
              <div className="flex justify-between pt-6">
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
                    disabled={saving}
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
        </div>
      </div>
    </RouteGuard>
  )
}

