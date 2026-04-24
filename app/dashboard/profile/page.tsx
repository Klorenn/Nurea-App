"use client"


import { useUser } from "@clerk/nextjs"
import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, Calendar, MapPin, Save, Edit2, Loader2, Shield, Eye } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { AvatarCropDialog } from "@/components/profile/AvatarCropDialog"
import { GoogleAddressInput } from "@/components/ui/google-address-input"
import { mutate } from "swr"

export default function ProfilePage() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const { user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [initialEmail, setInitialEmail] = useState<string>("")
  const [emailPassword, setEmailPassword] = useState<string>("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [cropOpen, setCropOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    healthInsurance: "",
    showPhone: true,
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
            fullName: data.profile.full_name || "",
            email: user.email || "",
            phone: data.profile.phone || "",
            dateOfBirth: data.profile.date_of_birth || "",
            gender: data.profile.gender || "",
            address: data.profile.address || "",
            healthInsurance: data.profile.health_insurance || "",
            showPhone: data.profile.show_phone !== false,
          })
          setInitialEmail(user.email || "")
        } else {
          setFormData({
            fullName: "",
            email: user.email || "",
            phone: "",
            dateOfBirth: "",
            gender: "",
            address: "",
            healthInsurance: "",
            showPhone: true,
          })
          setInitialEmail(user.email || "")
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        setFormData({
          fullName: "",
          email: user.email || "",
          phone: "",
          dateOfBirth: "",
          gender: "",
          address: "",
          healthInsurance: "",
          showPhone: true,
        })
        setInitialEmail(user.email || "")
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
      const emailChanged = formData.email && formData.email !== initialEmail

      if (emailChanged) {
        if (!emailPassword.trim()) {
          setError(
            language === "es"
              ? "Para cambiar tu correo debes ingresar tu contraseña."
              : "To change your email, please enter your password."
          )
          setLoading(false)
          return
        }

        const emailResponse = await fetch("/api/user/change-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newEmail: formData.email,
            password: emailPassword,
          }),
        })

        const emailData = await emailResponse.json()

        if (!emailResponse.ok || !emailData.success) {
          const message =
            emailData.message ||
            (language === "es"
              ? "No se pudo actualizar el correo"
              : "Could not update email")
          throw new Error(message)
        }

        setInitialEmail(formData.email)
        setEmailPassword("")
      }

      // Validate required fields
      if (!formData.dateOfBirth) {
        setError(language === "es" ? "La fecha de nacimiento es obligatoria." : "Date of birth is required.")
        setLoading(false)
        return
      }

      // Preparar datos solo con valores definidos
      const updateData: any = {}
      if (formData.fullName?.trim()) updateData.full_name = formData.fullName.trim()
      if (formData.phone?.trim()) updateData.phone = formData.phone.trim()
      if (formData.dateOfBirth) updateData.date_of_birth = formData.dateOfBirth
      if (formData.address?.trim()) updateData.address = formData.address.trim()
      if (formData.healthInsurance !== undefined) updateData.health_insurance = formData.healthInsurance
      if (formData.gender) updateData.gender = formData.gender
      updateData.show_phone = formData.showPhone

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
      // Invalidate the unified profile key
      mutate(["profile", user?.id])
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
      setError(error instanceof Error ? error.message : (language === "es" ? "No se pudo guardar el perfil" : "Could not save profile"))
      setSuccess(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return

    if (!file.type.startsWith("image/")) {
      setError(
        language === "es" ? "Solo se permiten archivos de imagen." : "Only image files are allowed."
      )
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        language === "es"
          ? "La imagen no debe superar los 5MB."
          : "Image size must be under 5MB."
      )
      return
    }

    setError(null)
    setAvatarFile(file)
    setCropOpen(true)
  }

  const uploadAvatarFile = async (file: File) => {
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/user/upload-avatar", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data?.success) {
        const message =
          data?.message ||
          (language === "es"
            ? "No se pudo actualizar la foto de perfil"
            : "Could not update profile photo")
        throw new Error(message)
      }

      if (data.avatarUrl) {
        setAvatarUrl(data.avatarUrl as string)
      }
      setSuccess(
        language === "es"
          ? "Foto de perfil actualizada correctamente"
          : "Profile photo updated successfully"
      )
      // Invalidate both potential keys
      mutate(`profile-avatar-${user?.id}`)
      mutate("/api/user/profile")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error uploading avatar:", error)
      setError(
        language === "es"
          ? "No se pudo actualizar la foto de perfil"
          : "Could not update profile photo"
      )
    } finally {
      setUploadingAvatar(false)
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
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="text-2xl">
                    {formData.fullName?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-bold text-lg">
                    {formData.fullName}
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
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {language === "es" ? "Nombre Completo" : "Full Name"}
                </Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="rounded-xl"
                    disabled={loading}
                  />
                ) : (
                  <p className="text-sm font-medium py-2">{formData.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {language === "es" ? "Correo Electrónico" : "Email"}
                </Label>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl"
                      disabled={loading}
                    />
                    {formData.email !== initialEmail && (
                      <div className="space-y-1">
                        <Label htmlFor="emailPassword" className="text-xs flex items-center gap-1 text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          {language === "es"
                            ? "Ingresa tu contraseña para confirmar el cambio de correo"
                            : "Enter your password to confirm the email change"}
                        </Label>
                        <Input
                          id="emailPassword"
                          type="password"
                          value={emailPassword}
                          onChange={(e) => setEmailPassword(e.target.value)}
                          className="rounded-xl text-sm"
                          disabled={loading}
                        />
                      </div>
                    )}
                  </div>
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
                  <span className="text-red-500">*</span>
                </Label>
                {isEditing ? (
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="rounded-xl"
                    required
                    disabled={loading}
                  />
                ) : (
                  <p className="text-sm font-medium py-2">
                    {formData.dateOfBirth || (language === "es" ? "No agregado" : "Not added")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {language === "es" ? "Género" : "Gender"}
                </Label>
                {isEditing ? (
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    disabled={loading}
                  >
                    <option value="">{language === "es" ? "Selecciona" : "Select"}</option>
                    <option value="M">{language === "es" ? "Hombre" : "Male"}</option>
                    <option value="F">{language === "es" ? "Mujer" : "Female"}</option>
                    <option value="other">{language === "es" ? "Prefiero no especificar" : "Prefer not to say"}</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium py-2">
                    {formData.gender === "F"
                      ? language === "es" ? "Mujer" : "Female"
                      : formData.gender === "M"
                      ? language === "es" ? "Hombre" : "Male"
                      : formData.gender === "other"
                      ? language === "es" ? "Prefiero no especificar" : "Prefer not to say"
                      : language === "es" ? "No agregado" : "Not added"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {language === "es" ? "Mostrar teléfono en perfil" : "Show phone on profile"}
                </Label>
                <div className="flex items-center justify-between rounded-xl border border-input bg-background px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {language === "es" ? "Visible para especialistas" : "Visible to specialists"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {language === "es"
                        ? "Los profesionales podrán ver tu número de teléfono"
                        : "Professionals will be able to see your phone number"}
                    </p>
                  </div>
                  <Switch
                    checked={formData.showPhone}
                    onCheckedChange={(v) => setFormData({ ...formData, showPhone: v })}
                    disabled={!isEditing || loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {language === "es" ? "Dirección" : "Address"}
                </Label>
                {isEditing ? (
                  <GoogleAddressInput
                    value={formData.address}
                    onChange={(val) => setFormData({ ...formData, address: val })}
                    className="rounded-xl"
                    placeholder={language === "es" ? "Busca tu dirección..." : "Search your address..."}
                    disabled={loading}
                    language={language as "es" | "en"}
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
      <AvatarCropDialog
        open={cropOpen && !!avatarFile}
        file={avatarFile}
        onOpenChange={(open) => {
          setCropOpen(open)
          if (!open) {
            setAvatarFile(null)
          }
        }}
        onConfirm={uploadAvatarFile}
      />
    </DashboardLayout>
  )
}

