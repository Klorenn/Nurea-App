"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, Calendar, MapPin, Save, Edit2, Loader2, Shield } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function ProfilePage() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    healthInsurance: "",
  })

  const HEALTH_INSURANCE_OPTIONS = [
    { value: "", labelEs: "Sin previsión", labelEn: "None" },
    { value: "fonasa", labelEs: "Fonasa", labelEn: "Fonasa" },
    { value: "cruz_blanca", labelEs: "Cruz Blanca", labelEn: "Cruz Blanca" },
    { value: "colmena", labelEs: "Colmena", labelEn: "Colmena" },
    { value: "banmedica", labelEs: "Banmédica", labelEn: "Banmédica" },
    { value: "consalud", labelEs: "Consalud", labelEn: "Consalud" },
    { value: "vida_tres", labelEs: "Vida Tres", labelEn: "Vida Tres" },
    { value: "other", labelEs: "Otra", labelEn: "Other" },
  ]

  // Cargar datos del perfil desde la API
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return
      
      setLoadingProfile(true)
      try {
        const response = await fetch("/api/user/profile")
        const data = await response.json()
        
        if (data.profile) {
          setFormData({
            firstName: data.profile.first_name || user.user_metadata?.first_name || "",
            lastName: data.profile.last_name || user.user_metadata?.last_name || "",
            email: user.email || "",
            phone: data.profile.phone || "",
            dateOfBirth: data.profile.date_of_birth || "",
            address: data.profile.address || "",
            healthInsurance: data.profile.health_insurance || "",
          })
        } else {
          setFormData({
            firstName: user.user_metadata?.first_name || "",
            lastName: user.user_metadata?.last_name || "",
            email: user.email || "",
            phone: "",
            dateOfBirth: "",
            address: "",
            healthInsurance: "",
          })
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        // Fallback a user_metadata
        setFormData({
          firstName: user.user_metadata?.first_name || "",
          lastName: user.user_metadata?.last_name || "",
          email: user.email || "",
          phone: "",
          dateOfBirth: "",
          address: "",
          healthInsurance: "",
        })
      } finally {
        setLoadingProfile(false)
      }
    }

    if (user) {
      loadProfile()
    }
  }, [user])

  const handleSave = async () => {
    setLoading(true)
    try {
      // Preparar datos solo con valores definidos
      const updateData: any = {}
      if (formData.firstName?.trim()) updateData.first_name = formData.firstName.trim()
      if (formData.lastName?.trim()) updateData.last_name = formData.lastName.trim()
      if (formData.phone?.trim()) updateData.phone = formData.phone.trim()
      if (formData.dateOfBirth) updateData.date_of_birth = formData.dateOfBirth
      if (formData.address?.trim()) updateData.address = formData.address.trim()
      if (formData.healthInsurance !== undefined) updateData.health_insurance = formData.healthInsurance

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.message || data.error || (language === "es" ? "Error al guardar el perfil" : "Error saving profile")
        throw new Error(errorMessage)
      }

      setSuccess(language === "es" ? "Perfil actualizado correctamente" : "Profile updated successfully")
      setError(null)
      setIsEditing(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
      setError(error instanceof Error ? error.message : (language === "es" ? "No se pudo guardar el perfil" : "Could not save profile"))
      setSuccess(null)
    } finally {
      setLoading(false)
    }
  }

  if (loadingProfile) {
    return (
      <DashboardLayout role="patient">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="patient">
      <div className="space-y-8 pb-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
            <div className="h-5 w-5 text-red-500 shrink-0 mt-0.5">⚠️</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-start gap-3">
            <div className="h-5 w-5 text-green-500 shrink-0 mt-0.5">✓</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">{success}</p>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t.dashboard.profile}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === "es" 
                ? "Gestiona tu información personal"
                : "Manage your personal information"}
            </p>
          </div>
          {!isEditing ? (
            <Button className="rounded-xl font-bold" onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" /> {t.dashboard.edit}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setIsEditing(false)}>
                {t.dashboard.cancel}
              </Button>
              <Button className="rounded-xl font-bold" onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" /> {loading ? (language === "es" ? "Guardando..." : "Saving...") : t.dashboard.save}
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Picture */}
          <Card className="border-border/40">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32 rounded-2xl border-2 border-border/40">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {formData.firstName?.[0] || ""}{formData.lastName?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" className="rounded-xl w-full">
                    {language === "es" ? "Cambiar Foto" : "Change Photo"}
                  </Button>
                )}
                <div className="text-center">
                  <p className="font-bold text-lg">
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === "es" ? "Paciente" : "Patient"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="md:col-span-2 border-border/40">
            <CardHeader>
              <CardTitle>
                {language === "es" ? "Información Personal" : "Personal Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {language === "es" ? "Nombre" : "First Name"}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="rounded-xl"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-sm font-medium py-2">{formData.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {language === "es" ? "Apellido" : "Last Name"}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="rounded-xl"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-sm font-medium py-2">{formData.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {language === "es" ? "Correo Electrónico" : "Email"}
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-xl"
                    disabled={loading}
                  />
                ) : (
                  <p className="text-sm font-medium py-2">{formData.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {language === "es" ? "Teléfono" : "Phone"}
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-xl"
                    placeholder={language === "es" ? "+56 9 1234 5678" : "+56 9 1234 5678"}
                    disabled={loading}
                  />
                ) : (
                  <p className="text-sm font-medium py-2">
                    {formData.phone || (language === "es" ? "No agregado" : "Not added")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {language === "es" ? "Fecha de Nacimiento" : "Date of Birth"}
                </Label>
                {isEditing ? (
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="rounded-xl"
                    disabled={loading}
                  />
                ) : (
                  <p className="text-sm font-medium py-2">
                    {formData.dateOfBirth || (language === "es" ? "No agregado" : "Not added")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {language === "es" ? "Dirección" : "Address"}
                </Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="rounded-xl"
                    placeholder={language === "es" ? "Tu dirección" : "Your address"}
                    disabled={loading}
                  />
                ) : (
                  <p className="text-sm font-medium py-2">
                    {formData.address || (language === "es" ? "No agregado" : "Not added")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthInsurance" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {language === "es" ? "Previsión de Salud" : "Health Insurance"}
                </Label>
                {isEditing ? (
                  <select
                    id="healthInsurance"
                    value={formData.healthInsurance}
                    onChange={(e) => setFormData({ ...formData, healthInsurance: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    disabled={loading}
                  >
                    {HEALTH_INSURANCE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {language === "es" ? opt.labelEs : opt.labelEn}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm font-medium py-2">
                    {formData.healthInsurance
                      ? (HEALTH_INSURANCE_OPTIONS.find((o) => o.value === formData.healthInsurance)?.[language === "es" ? "labelEs" : "labelEn"] || formData.healthInsurance)
                      : (language === "es" ? "No agregado" : "Not added")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Information */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>
              {language === "es" ? "Información de Salud" : "Health Information"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-muted-foreground">
                  {t.dashboard.bloodType}
                </Label>
                <p className="font-medium">
                  {language === "es" ? "No agregado" : "Not added"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">
                  {t.dashboard.allergies}
                </Label>
                <p className="font-medium">
                  {language === "es" ? "No agregado" : "Not added"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">
                  {t.dashboard.nextCheckup}
                </Label>
                <p className="font-medium">
                  {language === "es" ? "No programado" : "Not scheduled"}
                </p>
              </div>
            </div>
            {isEditing && (
              <Button variant="outline" className="mt-4 rounded-xl">
                {language === "es" ? "Editar Información de Salud" : "Edit Health Information"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

