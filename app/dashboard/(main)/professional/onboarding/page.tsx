"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import {
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  FileCheck,
  Clock,
  Building2,
  Info,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { VerificationStatusBadge } from "@/components/ui/verified-badge"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { useCategoriesWithSpecialties, useAddProfessionalSpecialty } from "@/hooks/use-specialties"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Specialty, VerificationStatus } from "@/types/database"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
}

const steps = [
  { id: 1, title: "Especialidades", titleEn: "Specialties", icon: Stethoscope },
  { id: 2, title: "Licencia Profesional", titleEn: "Professional License", icon: FileCheck },
  { id: 3, title: "Documentos", titleEn: "Documents", icon: Upload },
  { id: 4, title: "Revisión", titleEn: "Review", icon: ShieldCheck },
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export default function ProfessionalOnboardingPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { user } = useAuth()
  const isSpanish = language === "es"
  
  const { data: categoriesWithSpecialties, isLoading: isLoadingSpecialties } = useCategoriesWithSpecialties()
  const addSpecialty = useAddProfessionalSpecialty()

  // Form state
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>([])
  const [primarySpecialtyId, setPrimarySpecialtyId] = useState<string | null>(null)
  const [licenseNumber, setLicenseNumber] = useState("")
  const [licenseInstitution, setLicenseInstitution] = useState("")
  const [licenseCountry, setLicenseCountry] = useState("CL")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null)
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Validation
  const isStep1Valid = selectedSpecialties.length > 0 && primarySpecialtyId !== null
  const isStep2Valid = licenseNumber.trim().length >= 5 && licenseInstitution.trim().length > 0
  const isStep3Valid = uploadedFile !== null
  const isStep4Valid = acceptTerms && isStep1Valid && isStep2Valid && isStep3Valid

  const handleSpecialtyToggle = (specialty: Specialty) => {
    setSelectedSpecialties(prev => {
      const isSelected = prev.some(s => s.id === specialty.id)
      if (isSelected) {
        const newList = prev.filter(s => s.id !== specialty.id)
        if (primarySpecialtyId === specialty.id) {
          setPrimarySpecialtyId(newList[0]?.id || null)
        }
        return newList
      } else {
        if (prev.length === 0) {
          setPrimarySpecialtyId(specialty.id)
        }
        return [...prev, specialty]
      }
    })
  }

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(
        isSpanish 
          ? 'Formato no permitido. Usa JPG, PNG, WebP o PDF.'
          : 'Invalid format. Use JPG, PNG, WebP or PDF.'
      )
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        isSpanish 
          ? 'El archivo excede el límite de 10MB.'
          : 'File exceeds 10MB limit.'
      )
      return
    }

    setUploadedFile(file)
  }, [isSpanish])

  const handleSubmit = async () => {
    if (!user?.id || !isStep4Valid) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      // 1. Upload file to Storage
      let documentUrl: string | null = null
      let documentName: string | null = null

      if (uploadedFile) {
        const fileExt = uploadedFile.name.split('.').pop()
        const fileName = `${user.id}/license_${Date.now()}.${fileExt}`

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('verification-documents')
          .upload(fileName, uploadedFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw new Error(uploadError.message)

        documentUrl = fileName
        documentName = uploadedFile.name
      }

      // 2. Update professional record with verification info
      const { error: updateError } = await supabase
        .from('professionals')
        .update({
          professional_license_number: licenseNumber,
          license_issuing_institution: licenseInstitution,
          license_country: licenseCountry,
          verification_status: 'under_review',
          verification_document_url: documentUrl,
          verification_document_name: documentName,
        })
        .eq('id', user.id)

      if (updateError) throw new Error(updateError.message)

      // 3. Add specialties
      for (const specialty of selectedSpecialties) {
        await addSpecialty.mutateAsync({
          professionalId: user.id,
          specialtyId: specialty.id,
          isPrimary: specialty.id === primarySpecialtyId,
        })
      }

      // Success!
      setVerificationStatus('under_review')
      toast.success(
        isSpanish 
          ? '¡Documentación enviada! Te notificaremos cuando sea revisada.'
          : 'Documentation submitted! We will notify you when reviewed.'
      )

    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error(
        isSpanish 
          ? 'Error al enviar la documentación. Intenta nuevamente.'
          : 'Error submitting documentation. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  // If already submitted, show status
  if (verificationStatus === 'under_review') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto py-8"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-background to-background overflow-hidden">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
                <Clock className="h-10 w-10 text-blue-500" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">
                  {isSpanish ? 'Documentación en Revisión' : 'Documentation Under Review'}
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {isSpanish 
                    ? 'Nuestro equipo está revisando tu información. Te notificaremos por correo electrónico cuando el proceso esté completo.'
                    : 'Our team is reviewing your information. We will notify you by email when the process is complete.'}
                </p>
              </div>

              <VerificationStatusBadge status="under_review" size="lg" />

              <div className="pt-4">
                <Alert className="text-left border-blue-500/20 bg-blue-500/5">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="text-sm font-medium">
                    {isSpanish ? '¿Qué sigue?' : 'What\'s next?'}
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground">
                    {isSpanish 
                      ? 'El proceso de verificación suele tomar entre 1-3 días hábiles. Mientras tanto, puedes completar tu perfil y configurar tu disponibilidad.'
                      : 'The verification process usually takes 1-3 business days. Meanwhile, you can complete your profile and set up your availability.'}
                  </AlertDescription>
                </Alert>
              </div>

              <Button 
                onClick={() => router.push('/dashboard/professional')}
                className="mt-4"
              >
                {isSpanish ? 'Ir al Dashboard' : 'Go to Dashboard'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto py-6 space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSpanish ? 'Verificación de Credenciales' : 'Credential Verification'}
        </h1>
        <p className="text-muted-foreground">
          {isSpanish 
            ? 'Completa tu perfil profesional para aparecer en el buscador público de NUREA.'
            : 'Complete your professional profile to appear in NUREA\'s public search.'}
        </p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    currentStep >= step.id 
                      ? "bg-[#0f766e] text-white" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={cn(
                  "text-xs mt-2 font-medium text-center",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {isSpanish ? step.title : step.titleEn}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "h-0.5 flex-1 mx-2 transition-colors duration-300",
                  currentStep > step.id ? "bg-[#0f766e]" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-border/40">
            <CardContent className="p-6">
              {/* Step 1: Specialties */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      {isSpanish ? 'Selecciona tus Especialidades' : 'Select your Specialties'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isSpanish 
                        ? 'Elige todas las especialidades en las que ejerces. Marca una como principal.'
                        : 'Choose all the specialties you practice. Mark one as primary.'}
                    </p>
                  </div>

                  {isLoadingSpecialties ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {categoriesWithSpecialties?.map(category => (
                        <div key={category.id} className="space-y-3">
                          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0f766e]" />
                            {isSpanish ? category.name_es : category.name_en}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {category.specialties.map(specialty => {
                              const isSelected = selectedSpecialties.some(s => s.id === specialty.id)
                              const isPrimary = primarySpecialtyId === specialty.id
                              
                              return (
                                <button
                                  key={specialty.id}
                                  type="button"
                                  onClick={() => handleSpecialtyToggle(specialty)}
                                  className={cn(
                                    "relative text-left p-3 rounded-lg border transition-all duration-200",
                                    isSelected 
                                      ? "border-[#0f766e] bg-[#0f766e]/5" 
                                      : "border-border/40 hover:border-[#0f766e]/30 hover:bg-accent/30"
                                  )}
                                >
                                  <div className="flex items-start gap-2">
                                    <div className={cn(
                                      "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5",
                                      isSelected 
                                        ? "border-[#0f766e] bg-[#0f766e]" 
                                        : "border-muted-foreground/30"
                                    )}>
                                      {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                                    </div>
                                    <span className="text-sm font-medium">
                                      {isSpanish ? specialty.name_es : specialty.name_en}
                                    </span>
                                  </div>
                                  {isSelected && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setPrimarySpecialtyId(specialty.id)
                                      }}
                                      className={cn(
                                        "absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded",
                                        isPrimary 
                                          ? "bg-[#0f766e] text-white" 
                                          : "bg-muted text-muted-foreground hover:bg-[#0f766e]/20"
                                      )}
                                    >
                                      {isPrimary 
                                        ? (isSpanish ? 'Principal' : 'Primary')
                                        : (isSpanish ? 'Marcar' : 'Set')}
                                    </button>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedSpecialties.length > 0 && (
                    <div className="pt-4 border-t border-border/40">
                      <p className="text-sm text-muted-foreground mb-2">
                        {isSpanish ? 'Seleccionadas:' : 'Selected:'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSpecialties.map(specialty => (
                          <Badge 
                            key={specialty.id} 
                            variant="outline"
                            className={cn(
                              "pr-1.5",
                              primarySpecialtyId === specialty.id && "bg-[#0f766e]/10 border-[#0f766e]/30"
                            )}
                          >
                            {isSpanish ? specialty.name_es : specialty.name_en}
                            {primarySpecialtyId === specialty.id && (
                              <span className="ml-1 text-[10px] text-[#0f766e]">★</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleSpecialtyToggle(specialty)}
                              className="ml-1 p-0.5 hover:bg-muted rounded"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: License Info */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      {isSpanish ? 'Información de Licencia' : 'License Information'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isSpanish 
                        ? 'Ingresa los datos de tu cédula profesional o registro de colegiado.'
                        : 'Enter your professional license or medical board registration details.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">
                        {isSpanish ? 'Número de Licencia / Cédula Profesional' : 'License / Registration Number'}
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="licenseNumber"
                        placeholder={isSpanish ? "Ej: 12345678-9" : "E.g., 12345678-9"}
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseInstitution">
                        {isSpanish ? 'Institución Emisora' : 'Issuing Institution'}
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="licenseInstitution"
                        placeholder={isSpanish ? "Ej: Colegio Médico de Chile" : "E.g., Chilean Medical Board"}
                        value={licenseInstitution}
                        onChange={(e) => setLicenseInstitution(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseCountry">
                        {isSpanish ? 'País de Emisión' : 'Country of Issue'}
                      </Label>
                      <Select value={licenseCountry} onValueChange={setLicenseCountry}>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CL">🇨🇱 Chile</SelectItem>
                          <SelectItem value="AR">🇦🇷 Argentina</SelectItem>
                          <SelectItem value="MX">🇲🇽 México</SelectItem>
                          <SelectItem value="ES">🇪🇸 España</SelectItem>
                          <SelectItem value="CO">🇨🇴 Colombia</SelectItem>
                          <SelectItem value="PE">🇵🇪 Perú</SelectItem>
                          <SelectItem value="OTHER">
                            {isSpanish ? 'Otro país' : 'Other country'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Alert className="border-amber-500/20 bg-amber-500/5">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-sm">
                      {isSpanish 
                        ? 'Asegúrate de ingresar el número exactamente como aparece en tu documento oficial.'
                        : 'Make sure to enter the number exactly as it appears on your official document.'}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Step 3: Document Upload */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      {isSpanish ? 'Sube tu Documento' : 'Upload your Document'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isSpanish 
                        ? 'Sube una imagen o PDF de tu cédula profesional o título escaneado.'
                        : 'Upload an image or PDF of your professional license or scanned diploma.'}
                    </p>
                  </div>

                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                      uploadedFile 
                        ? "border-[#0f766e]/50 bg-[#0f766e]/5" 
                        : "border-muted-foreground/20 hover:border-[#0f766e]/30"
                    )}
                  >
                    <input
                      type="file"
                      id="document-upload"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {uploadedFile ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-[#0f766e]/10 flex items-center justify-center mx-auto">
                          <FileText className="h-8 w-8 text-[#0f766e]" />
                        </div>
                        <div>
                          <p className="font-medium">{uploadedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setUploadedFile(null)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          {isSpanish ? 'Cambiar archivo' : 'Change file'}
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="document-upload" className="cursor-pointer block space-y-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {isSpanish 
                              ? 'Arrastra tu archivo aquí o haz clic para seleccionar'
                              : 'Drag your file here or click to select'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            JPG, PNG, WebP o PDF • Máximo 10MB
                          </p>
                        </div>
                      </label>
                    )}
                  </div>

                  <Alert className="border-blue-500/20 bg-blue-500/5">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertTitle className="text-sm font-medium">
                      {isSpanish ? 'Documentos aceptados' : 'Accepted documents'}
                    </AlertTitle>
                    <AlertDescription className="text-sm text-muted-foreground">
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>{isSpanish ? 'Cédula profesional (ambos lados)' : 'Professional license (both sides)'}</li>
                        <li>{isSpanish ? 'Título universitario' : 'University diploma'}</li>
                        <li>{isSpanish ? 'Certificado de especialidad' : 'Specialty certificate'}</li>
                        <li>{isSpanish ? 'Registro de colegiado vigente' : 'Current medical board registration'}</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      {isSpanish ? 'Revisa tu Información' : 'Review your Information'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isSpanish 
                        ? 'Confirma que todos los datos son correctos antes de enviar.'
                        : 'Confirm all details are correct before submitting.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Specialties Summary */}
                    <div className="p-4 rounded-lg border border-border/40 bg-muted/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Stethoscope className="h-4 w-4 text-[#0f766e]" />
                        <span className="font-medium text-sm">
                          {isSpanish ? 'Especialidades' : 'Specialties'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedSpecialties.map(specialty => (
                          <Badge 
                            key={specialty.id}
                            variant="outline"
                            className={cn(
                              primarySpecialtyId === specialty.id && "bg-[#0f766e]/10 border-[#0f766e]/30"
                            )}
                          >
                            {isSpanish ? specialty.name_es : specialty.name_en}
                            {primarySpecialtyId === specialty.id && " ★"}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* License Summary */}
                    <div className="p-4 rounded-lg border border-border/40 bg-muted/30">
                      <div className="flex items-center gap-2 mb-3">
                        <FileCheck className="h-4 w-4 text-[#0f766e]" />
                        <span className="font-medium text-sm">
                          {isSpanish ? 'Licencia Profesional' : 'Professional License'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">{isSpanish ? 'Número:' : 'Number:'}</span> {licenseNumber}</p>
                        <p><span className="text-muted-foreground">{isSpanish ? 'Institución:' : 'Institution:'}</span> {licenseInstitution}</p>
                        <p><span className="text-muted-foreground">{isSpanish ? 'País:' : 'Country:'}</span> {licenseCountry}</p>
                      </div>
                    </div>

                    {/* Document Summary */}
                    <div className="p-4 rounded-lg border border-border/40 bg-muted/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Upload className="h-4 w-4 text-[#0f766e]" />
                        <span className="font-medium text-sm">
                          {isSpanish ? 'Documento' : 'Document'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{uploadedFile?.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-border/40">
                    <Checkbox 
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                      {isSpanish 
                        ? 'Confirmo que toda la información proporcionada es verídica y acepto que NUREA verifique mis credenciales profesionales.'
                        : 'I confirm that all provided information is truthful and I accept that NUREA may verify my professional credentials.'}
                    </label>
                  </div>

                  <Alert className="border-[#0f766e]/20 bg-[#0f766e]/5">
                    <ShieldCheck className="h-4 w-4 text-[#0f766e]" />
                    <AlertTitle className="text-sm font-medium">
                      {isSpanish ? 'Proceso de Verificación' : 'Verification Process'}
                    </AlertTitle>
                    <AlertDescription className="text-sm text-muted-foreground">
                      {isSpanish 
                        ? 'Una vez enviada tu documentación, nuestro equipo la revisará en un plazo de 1-3 días hábiles. Recibirás una notificación por correo cuando el proceso esté completo.'
                        : 'Once your documentation is submitted, our team will review it within 1-3 business days. You will receive an email notification when the process is complete.'}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/40">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {isSpanish ? 'Anterior' : 'Previous'}
                </Button>

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !isStep1Valid) ||
                      (currentStep === 2 && !isStep2Valid) ||
                      (currentStep === 3 && !isStep3Valid)
                    }
                    className="gap-2 bg-[#0f766e] hover:bg-[#0f766e]/90"
                  >
                    {isSpanish ? 'Siguiente' : 'Next'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isStep4Valid || isSubmitting}
                    className="gap-2 bg-[#0f766e] hover:bg-[#0f766e]/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isSpanish ? 'Enviando...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        {isSpanish ? 'Enviar para Verificación' : 'Submit for Verification'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
