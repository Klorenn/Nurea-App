"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { SmokeyBackground } from "@/components/smokey-login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, User, Camera, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperDescription,
  StepperSeparator,
} from "@/components/ui/stepper"
import { AvatarUploader } from "@/components/ui/avatar-uploader"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

function OnboardingContent() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Step 1: Información Personal
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  
  // Step 2: Foto de Perfil
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  
  // Step 3: Información Adicional
  const [phone, setPhone] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleUploadAvatar = async (file: File): Promise<{ success: boolean }> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al subir la foto')
      }

      setAvatarUrl(data.avatarUrl)
      return { success: true }
    } catch (err) {
      console.error('Error uploading avatar:', err)
      throw err
    }
  }

  const handleNext = async () => {
    if (currentStep === 0) {
      // Validar paso 1
      if (!firstName.trim() || !lastName.trim() || !dateOfBirth) {
        setError(isSpanish 
          ? "Por favor completa todos los campos requeridos"
          : "Please complete all required fields")
        return
      }

      // Validar edad
      const birthDate = new Date(dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      if (age < 18) {
        setError(isSpanish
          ? "Debes ser mayor de 18 años para usar NUREA"
          : "You must be at least 18 years old to use NUREA")
        return
      }

      setError(null)
      setCurrentStep(1)
    } else if (currentStep === 1) {
      // Validar paso 2
      if (!avatarUrl) {
        setError(isSpanish
          ? "Por favor sube una foto de perfil"
          : "Please upload a profile photo")
        return
      }

      setError(null)
      setCurrentStep(2)
    } else if (currentStep === 2) {
      // Completar onboarding
      await handleComplete()
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dateOfBirth,
          avatarUrl,
          phone: phone.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || (isSpanish ? "Error al completar el perfil" : "Error completing profile"))
      }

      // Obtener rol del usuario para redirección
      const userRole = data.userRole || 'patient'
      const redirectPath = userRole === 'professional' 
        ? '/professional/onboarding' 
        : '/dashboard'
      
      router.push(redirectPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : (isSpanish ? "Error al completar el perfil" : "Error completing profile"))
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 18)
  const maxDateString = maxDate.toISOString().split("T")[0]

  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - 100)
  const minDateString = minDate.toISOString().split("T")[0]

  if (authLoading) {
    return (
      <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <SmokeyBackground backdropBlurAmount="md" color="#14B8A6" />
        <div className="relative z-10 text-white">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <SmokeyBackground backdropBlurAmount="md" color="#14B8A6" />
      
      <div className="relative z-10 w-full max-w-2xl">
        <div className="w-full p-8 space-y-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              {isSpanish ? "Completar Perfil" : "Complete Profile"}
            </h2>
            <p className="mt-2 text-sm text-gray-200">
              {isSpanish 
                ? "Necesitamos algunos datos para completar tu registro"
                : "We need some information to complete your registration"}
            </p>
          </div>

          {/* Stepper */}
          <Stepper value={currentStep} onValueChange={setCurrentStep} orientation="horizontal">
            <StepperItem step={0} completed={currentStep > 0}>
              <StepperTrigger>
                <StepperIndicator />
                <div className="flex flex-col">
                  <StepperTitle>
                    {isSpanish ? "Información Personal" : "Personal Information"}
                  </StepperTitle>
                  <StepperDescription>
                    {isSpanish ? "Nombres y fecha de nacimiento" : "Name and date of birth"}
                  </StepperDescription>
                </div>
              </StepperTrigger>
              <StepperSeparator />
            </StepperItem>

            <StepperItem step={1} completed={currentStep > 1}>
              <StepperTrigger>
                <StepperIndicator />
                <div className="flex flex-col">
                  <StepperTitle>
                    {isSpanish ? "Foto de Perfil" : "Profile Photo"}
                  </StepperTitle>
                  <StepperDescription>
                    {isSpanish ? "Sube tu foto de perfil" : "Upload your profile photo"}
                  </StepperDescription>
                </div>
              </StepperTrigger>
              <StepperSeparator />
            </StepperItem>

            <StepperItem step={2} completed={false}>
              <StepperTrigger>
                <StepperIndicator />
                <div className="flex flex-col">
                  <StepperTitle>
                    {isSpanish ? "Información Adicional" : "Additional Information"}
                  </StepperTitle>
                  <StepperDescription>
                    {isSpanish ? "Datos opcionales" : "Optional data"}
                  </StepperDescription>
                </div>
              </StepperTrigger>
            </StepperItem>
          </Stepper>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-300 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="space-y-6">
            {/* Step 1: Información Personal */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-teal-200/90 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {isSpanish ? "Nombre" : "First Name"}
                    <span className="text-red-300">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={isSpanish ? "Tu nombre" : "Your first name"}
                    disabled={loading}
                    className="bg-white/10 border-teal-300/50 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-teal-200/90 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {isSpanish ? "Apellido" : "Last Name"}
                    <span className="text-red-300">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={isSpanish ? "Tu apellido" : "Your last name"}
                    disabled={loading}
                    className="bg-white/10 border-teal-300/50 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-teal-200/90 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {isSpanish ? "Fecha de Nacimiento" : "Date of Birth"}
                    <span className="text-red-300">*</span>
                  </Label>
                  <Input
                    type="date"
                    id="dateOfBirth"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    min={minDateString}
                    max={maxDateString}
                    required
                    disabled={loading}
                    className="bg-white/10 border-teal-300/50 text-white placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-300">
                    {isSpanish 
                      ? "Debes ser mayor de 18 años para usar NUREA"
                      : "You must be at least 18 years old to use NUREA"}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Foto de Perfil */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32 border-4 border-white/20">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                      {firstName[0]?.toUpperCase() || ""}{lastName[0]?.toUpperCase() || ""}
                    </AvatarFallback>
                  </Avatar>
                  
                  <AvatarUploader onUpload={handleUploadAvatar}>
                    <Button 
                      type="button"
                      variant="outline"
                      className="bg-white/10 border-teal-300/50 text-white hover:bg-white/20"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isSpanish 
                        ? (avatarUrl ? "Cambiar Foto" : "Subir Foto")
                        : (avatarUrl ? "Change Photo" : "Upload Photo")}
                    </Button>
                  </AvatarUploader>
                  
                  {avatarUrl && (
                    <div className="flex items-center gap-2 text-sm text-teal-200">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{isSpanish ? "Foto subida exitosamente" : "Photo uploaded successfully"}</span>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-300 text-center max-w-md">
                    {isSpanish
                      ? "Por favor sube una foto donde se vea claramente tu rostro. Esta foto será visible en tu perfil."
                      : "Please upload a photo where your face is clearly visible. This photo will be visible on your profile."}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Información Adicional */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-teal-200/90">
                    {isSpanish ? "Teléfono (Opcional)" : "Phone (Optional)"}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={isSpanish ? "+56 9 1234 5678" : "+1 234 567 8900"}
                    disabled={loading}
                    className="bg-white/10 border-teal-300/50 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || loading}
              className="bg-white/10 border-teal-300/50 text-white hover:bg-white/20"
            >
              {isSpanish ? "Atrás" : "Back"}
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSpanish ? "Guardando..." : "Saving..."}
                </>
              ) : currentStep === 2 ? (
                isSpanish ? "Completar Registro" : "Complete Registration"
              ) : (
                isSpanish ? "Siguiente" : "Next"
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <SmokeyBackground backdropBlurAmount="md" color="#14B8A6" />
        <div className="relative z-10 text-white">Cargando...</div>
      </main>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
