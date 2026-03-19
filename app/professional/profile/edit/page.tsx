"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Save,
  Upload,
  Globe,
  Video,
  Home,
  DollarSign,
  Calendar,
  MapPin,
  X,
  CheckCircle2,
  Settings,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLanguage } from "@/contexts/language-context"
import { GoogleAddressInput } from "@/components/ui/google-address-input"

export default function ProfessionalProfileEditPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  
  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Basic info
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [gender, setGender] = useState<"M" | "F" | "">("")
  const [title, setTitle] = useState("")
  const [bio, setBio] = useState("")
  const [bioExtended, setBioExtended] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [specialties, setSpecialties] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [newSpecialty, setNewSpecialty] = useState("")
  const [newLanguage, setNewLanguage] = useState("")

  // Services & Pricing
  const [onlineEnabled, setOnlineEnabled] = useState(true)
  const [inPersonEnabled, setInPersonEnabled] = useState(true)
  const [onlinePrice, setOnlinePrice] = useState("")
  const [inPersonPrice, setInPersonPrice] = useState("")
  const [videoPlatform, setVideoPlatform] = useState("google-meet")
  const [clinicAddress, setClinicAddress] = useState("")

  // Payment settings
  const [bankAccount, setBankAccount] = useState("")
  const [bankName, setBankName] = useState("")

  // Registration
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [registrationInstitution, setRegistrationInstitution] = useState("")

  // Load profile data on mount
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/professional/profile")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || (isSpanish ? "Error al cargar perfil" : "Error loading profile"))
      }

      const profile = data.profile
      
      // Set all form fields
      setFirstName(profile.firstName || "")
      setLastName(profile.lastName || "")
      setGender(profile.gender === "F" ? "F" : profile.gender === "M" ? "M" : "")
      setTitle(profile.title || "")
      setBio(profile.bio || "")
      setBioExtended(profile.bioExtended || "")
      setAvatarUrl(profile.avatarUrl || "")
      setSpecialties(profile.specialties || [])
      setLanguages(profile.languages || [])
      setOnlinePrice(profile.onlinePrice?.toString() || "")
      setInPersonPrice(profile.inPersonPrice?.toString() || "")
      setVideoPlatform(profile.videoPlatform || "google-meet")
      setClinicAddress(profile.clinicAddress || "")
      setBankAccount(profile.bankAccount || "")
      setBankName(profile.bankName || "")
      setRegistrationNumber(profile.registrationNumber || "")
      setRegistrationInstitution(profile.registrationInstitution || "")
      
      // Set consultation types
      const consultationType = profile.consultationType || "both"
      setOnlineEnabled(consultationType === "online" || consultationType === "both")
      setInPersonEnabled(consultationType === "in-person" || consultationType === "both")
    } catch (err) {
      console.error("Error loading profile:", err)
      setError(err instanceof Error ? err.message : (isSpanish ? "Error al cargar perfil" : "Error loading profile"))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Validation
      if (!firstName.trim() || !lastName.trim()) {
        throw new Error(isSpanish ? "Nombre y apellido son requeridos" : "First name and last name are required")
      }
      if (!title.trim()) {
        throw new Error(isSpanish ? "Título profesional es requerido" : "Professional title is required")
      }
      if (onlineEnabled && (!onlinePrice || parseFloat(onlinePrice) <= 0)) {
        throw new Error(isSpanish ? "Precio para consulta online es requerido" : "Online consultation price is required")
      }
      if (inPersonEnabled && (!inPersonPrice || parseFloat(inPersonPrice) <= 0)) {
        throw new Error(isSpanish ? "Precio para consulta presencial es requerido" : "In-person consultation price is required")
      }

      // Determine consultation type
      let consultationType = "both"
      if (onlineEnabled && !inPersonEnabled) {
        consultationType = "online"
      } else if (inPersonEnabled && !onlineEnabled) {
        consultationType = "in-person"
      }

      const response = await fetch("/api/professional/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          gender: gender === "" ? null : gender,
          title: title.trim(),
          bio: bio.trim(),
          bioExtended: bioExtended.trim(),
          specialties,
          languages,
          consultationType,
          onlinePrice: onlineEnabled ? parseFloat(onlinePrice) : undefined,
          inPersonPrice: inPersonEnabled ? parseFloat(inPersonPrice) : undefined,
          videoPlatform,
          clinicAddress: clinicAddress.trim(),
          bankAccount: bankAccount.trim(),
          bankName: bankName.trim(),
          registrationNumber: registrationNumber.trim(),
          registrationInstitution: registrationInstitution.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || (isSpanish ? "Error al guardar perfil" : "Error saving profile"))
      }

      setSuccess(isSpanish ? "Perfil actualizado exitosamente" : "Profile updated successfully")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error saving profile:", err)
      setError(err instanceof Error ? err.message : (isSpanish ? "Error al guardar perfil" : "Error saving profile"))
    } finally {
      setSaving(false)
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()])
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (spec: string) => {
    setSpecialties(specialties.filter((s) => s !== spec))
  }

  const addLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage)) {
      setLanguages([...languages, newLanguage])
      setNewLanguage("")
    }
  }

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang))
  }

  if (loading) {
    return (
      <DashboardLayout role="professional">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="professional">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" /> {isSpanish ? "Configuración de Perfil" : "Profile Settings"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isSpanish ? "Personaliza tu perfil público e información profesional" : "Customize your public profile and professional information"}
            </p>
          </div>
          <Button 
            className="rounded-xl font-bold" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isSpanish ? "Guardando..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> {isSpanish ? "Guardar Cambios" : "Save Changes"}
              </>
            )}
          </Button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl p-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <p>{success}</p>
          </div>
        )}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="bg-accent/20 p-1 rounded-xl w-full sm:w-auto mb-6">
            <TabsTrigger
              value="basic"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              {isSpanish ? "Información Básica" : "Basic Info"}
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              {isSpanish ? "Servicios y Precios" : "Services & Pricing"}
            </TabsTrigger>
            <TabsTrigger
              value="availability"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              {isSpanish ? "Disponibilidad" : "Availability"}
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              {isSpanish ? "Preferencias" : "Preferences"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card className="border-border/40 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-accent/5 p-6 border-b border-border/40">
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription>Upload a professional headshot (recommended: 400x400px)</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex items-center gap-8">
                  <Avatar className="h-32 w-32 border-4 border-border/40">
                    <AvatarImage src={avatarUrl || "/prof-1.jpg"} />
                    <AvatarFallback>
                      {firstName[0]?.toUpperCase() || ""}{lastName[0]?.toUpperCase() || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-3">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return

                        // Validar tamaño
                        if (file.size > 2 * 1024 * 1024) {
                          setError(isSpanish ? "El archivo es demasiado grande. Máximo 2MB." : "File is too large. Max size 2MB.")
                          return
                        }

                        // Validar tipo
                        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
                        if (!allowedTypes.includes(file.type)) {
                          setError(isSpanish ? "Tipo de archivo no permitido." : "File type not allowed.")
                          return
                        }

                        setSaving(true)
                        setError(null)

                        try {
                          const formData = new FormData()
                          formData.append('file', file)

                          const response = await fetch('/api/professional/upload-avatar', {
                            method: 'POST',
                            body: formData,
                          })

                          const data = await response.json()

                          if (!response.ok) {
                            throw new Error(data.message || 'Error al subir avatar')
                          }

                          setAvatarUrl(data.avatarUrl)
                          setSuccess(isSpanish ? "Avatar actualizado exitosamente" : "Avatar updated successfully")
                          setTimeout(() => setSuccess(null), 3000)
                        } catch (err) {
                          setError(err instanceof Error ? err.message : (isSpanish ? "Error al subir avatar" : "Error uploading avatar"))
                        } finally {
                          setSaving(false)
                          // Reset input
                          e.target.value = ''
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      className="rounded-xl bg-transparent"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isSpanish ? "Subiendo..." : "Uploading..."}
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" /> {isSpanish ? "Subir Nueva Foto" : "Upload New Photo"}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {isSpanish ? "JPG, PNG o GIF. Tamaño máximo 2MB" : "JPG, PNG or GIF. Max size 2MB"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-accent/5 p-6 border-b border-border/40">
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>This information will be visible on your public profile</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{isSpanish ? "Nombre" : "First Name"}</Label>
                    <Input 
                      id="firstName" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="rounded-xl bg-accent/20 border-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{isSpanish ? "Apellido" : "Last Name"}</Label>
                    <Input 
                      id="lastName" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="rounded-xl bg-accent/20 border-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">{isSpanish ? "Eres hombre o mujer" : "Are you male or female"}</Label>
                    <Select
                      value={gender}
                      onValueChange={(v: any) => setGender(v)}
                    >
                      <SelectTrigger className="rounded-xl bg-accent/20 border-none">
                        <SelectValue placeholder={isSpanish ? "Selecciona" : "Select"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{isSpanish ? "Selecciona" : "Select"}</SelectItem>
                        <SelectItem value="M">{isSpanish ? "Hombre" : "Male"}</SelectItem>
                        <SelectItem value="F">{isSpanish ? "Mujer" : "Female"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">{isSpanish ? "Título Profesional" : "Professional Title"}</Label>
                  <Input 
                    id="title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-xl bg-accent/20 border-none" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">{isSpanish ? "Biografía" : "Biography"}</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="min-h-[150px] rounded-xl bg-accent/20 border-none resize-none"
                    placeholder={isSpanish ? "Cuéntale a los pacientes sobre tu experiencia y enfoque..." : "Tell patients about your background and approach..."}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isSpanish ? "Cuéntale a los pacientes sobre tu experiencia y enfoque" : "Tell patients about your background and approach"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bioExtended">{isSpanish ? "Biografía Extendida" : "Extended Biography"}</Label>
                  <Textarea
                    id="bioExtended"
                    value={bioExtended}
                    onChange={(e) => setBioExtended(e.target.value)}
                    className="min-h-[150px] rounded-xl bg-accent/20 border-none resize-none"
                    placeholder={isSpanish ? "Información adicional sobre tu práctica profesional..." : "Additional information about your professional practice..."}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-accent/5 p-6 border-b border-border/40">
                <CardTitle>Specialties & Languages</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <Label>Specialties</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {specialties.map((spec) => (
                      <Badge
                        key={spec}
                        variant="secondary"
                        className="bg-accent/30 text-accent-foreground border-none rounded-xl px-4 py-2 flex items-center gap-2"
                      >
                        {spec}
                        <button
                          onClick={() => removeSpecialty(spec)}
                          className="ml-1 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={isSpanish ? "Agregar especialidad..." : "Add specialty..."}
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addSpecialty()}
                      className="rounded-xl bg-accent/20 border-none"
                    />
                    <Button onClick={addSpecialty} variant="outline" className="rounded-xl bg-transparent">
                      {isSpanish ? "Agregar" : "Add"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Languages</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {languages.map((lang) => (
                      <Badge
                        key={lang}
                        variant="outline"
                        className="rounded-xl px-4 py-2 flex items-center gap-2 bg-accent/10"
                      >
                        <Globe className="h-3 w-3" /> {lang}
                        <button
                          onClick={() => removeLanguage(lang)}
                          className="ml-1 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select value={newLanguage} onValueChange={setNewLanguage}>
                      <SelectTrigger className="rounded-xl bg-accent/20 border-none">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="Italian">Italian</SelectItem>
                        <SelectItem value="Portuguese">Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addLanguage} variant="outline" className="rounded-xl bg-transparent">
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card className="border-border/40 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-accent/5 p-6 border-b border-border/40">
                <CardTitle>Consultation Types</CardTitle>
                <CardDescription>Select the consultation modes you offer</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-6 rounded-2xl border-2 border-border/40 bg-accent/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Video className="h-6 w-6 text-primary" />
                        <div>
                          <h3 className="font-bold">Online Consultation</h3>
                          <p className="text-sm text-muted-foreground">Video sessions via platform</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={onlineEnabled}
                        onChange={(e) => setOnlineEnabled(e.target.checked)}
                        className="w-5 h-5 rounded" 
                      />
                    </div>
                    {onlineEnabled && (
                      <div className="space-y-3">
                        <Label>{isSpanish ? "Plataforma de Video Preferida" : "Video Platform Preference"}</Label>
                        <Select value={videoPlatform} onValueChange={setVideoPlatform}>
                          <SelectTrigger className="rounded-xl bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="google-meet">Google Meet</SelectItem>
                            <SelectItem value="zoom">Zoom</SelectItem>
                            <SelectItem value="platform">NUREA Platform</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="space-y-2">
                          <Label>{isSpanish ? "Precio por Sesión (CLP)" : "Price per Session (CLP)"}</Label>
                          <Input
                            type="number"
                            value={onlinePrice}
                            onChange={(e) => setOnlinePrice(e.target.value)}
                            className="rounded-xl bg-accent/20 border-none"
                            placeholder="45000"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-6 rounded-2xl border-2 border-border/40 bg-accent/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Home className="h-6 w-6 text-secondary" />
                        <div>
                          <h3 className="font-bold">{isSpanish ? "Consulta Presencial" : "In-person Consultation"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {isSpanish ? "En tu ubicación de consulta" : "At your clinic location"}
                          </p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={inPersonEnabled}
                        onChange={(e) => setInPersonEnabled(e.target.checked)}
                        className="w-5 h-5 rounded" 
                      />
                    </div>
                    {inPersonEnabled && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>{isSpanish ? "Dirección de Consulta" : "Clinic Address"}</Label>
                          <GoogleAddressInput
                            value={clinicAddress}
                            onChange={(val) => setClinicAddress(val)}
                            placeholder={isSpanish ? "Busca tu dirección..." : "Search your address..."}
                            className="rounded-xl bg-accent/20 border-none"
                            language={isSpanish ? "es" : "en"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{isSpanish ? "Precio por Sesión (CLP)" : "Price per Session (CLP)"}</Label>
                          <Input
                            type="number"
                            value={inPersonPrice}
                            onChange={(e) => setInPersonPrice(e.target.value)}
                            className="rounded-xl bg-accent/20 border-none"
                            placeholder="50000"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <Card className="border-border/40 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-accent/5 p-6 border-b border-border/40">
                <CardTitle>Availability Calendar</CardTitle>
                <CardDescription>Set your working hours and availability</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Calendar integration coming soon. For now, you can manage availability through your dashboard.
                  </p>
                  <Button variant="outline" className="rounded-xl bg-transparent">
                    <Calendar className="mr-2 h-4 w-4" /> Open Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-border/40 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-accent/5 p-6 border-b border-border/40">
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure how you receive payments</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{isSpanish ? "Cuenta Bancaria (Privada)" : "Bank Account (Private)"}</Label>
                    <Input
                      placeholder={isSpanish ? "Número de cuenta" : "Account number"}
                      type="password"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="rounded-xl bg-accent/20 border-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {isSpanish 
                        ? "Esta información es privada y solo se usa para procesamiento de pagos"
                        : "This information is private and only used for payment processing"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>{isSpanish ? "Banco" : "Bank Name"}</Label>
                    <Select value={bankName} onValueChange={setBankName}>
                      <SelectTrigger className="rounded-xl bg-accent/20 border-none">
                        <SelectValue placeholder={isSpanish ? "Seleccionar banco" : "Select bank"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banco-chile">Banco de Chile</SelectItem>
                        <SelectItem value="banco-estado">Banco Estado</SelectItem>
                        <SelectItem value="santander">Santander</SelectItem>
                        <SelectItem value="bci">BCI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isSpanish ? "Número de Registro Profesional" : "Professional Registration Number"}</Label>
                    <Input
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder={isSpanish ? "PSI-12345" : "PSI-12345"}
                      className="rounded-xl bg-accent/20 border-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isSpanish ? "Institución de Registro" : "Registration Institution"}</Label>
                    <Input
                      value={registrationInstitution}
                      onChange={(e) => setRegistrationInstitution(e.target.value)}
                      placeholder={isSpanish ? "Colegio de Psicólogos de Chile" : "Colegio de Psicólogos de Chile"}
                      className="rounded-xl bg-accent/20 border-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

