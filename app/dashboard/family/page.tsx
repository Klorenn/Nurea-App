export const dynamic = 'force-dynamic'

"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  UserPlus,
  Calendar,
  Trash2,
  Shield,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
  Info,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import Link from "next/link"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Dependent = {
  id: string
  firstName: string
  lastName: string
  relation: string
  dateOfBirth: string
  rut: string
  verified: boolean
  idDocumentName?: string
}

type ApiDependent = {
  id: string
  first_name: string
  last_name: string
  relationship: string
  dob: string | null
  rut: string
  verified: boolean
  document_url: string | null
}


// --- RUT Validation (Chile) ---
function formatRut(rut: string): string {
  const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase()
  if (clean.length < 2) return clean
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${formatted}-${dv}`
}

function validateRut(rut: string): boolean {
  const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase()
  if (clean.length < 2) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  let sum = 0
  let mult = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * mult
    mult = mult === 7 ? 2 : mult + 1
  }
  const mod = 11 - (sum % 11)
  const expected = mod === 11 ? "0" : mod === 10 ? "K" : String(mod)
  return expected === dv
}

export default function FamilyPage() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const isSpanish = language === "es"
  const [dependents, setDependents] = useState<Dependent[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetch("/api/patient/dependents")
      .then((r) => r.json())
      .then((data) => {
        if (data.dependents) {
          setDependents(
            data.dependents.map((d: ApiDependent) => ({
              id: d.id,
              firstName: d.first_name,
              lastName: d.last_name,
              relation: d.relationship,
              dateOfBirth: d.dob || "",
              rut: d.rut,
              verified: d.verified,
              idDocumentName: d.document_url ? "Documento adjunto" : undefined,
            }))
          )
        }
      })
      .catch((err) => console.error("Error loading dependents:", err))
      .finally(() => setLoadingList(false))
  }, [])
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    relation: "",
    dateOfBirth: "",
    rut: "",
  })
  const [rutError, setRutError] = useState("")
  const [idFile, setIdFile] = useState<File | null>(null)
  const [idFileError, setIdFileError] = useState("")
  const [verifyingId, setVerifyingId] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const handleRutChange = (value: string) => {
    const formatted = formatRut(value)
    setFormData((prev) => ({ ...prev, rut: formatted }))
    if (formatted.replace(/[^0-9kK]/g, "").length >= 8) {
      setRutError(validateRut(formatted) ? "" : "RUT inválido. Verifica el número y dígito verificador.")
    } else {
      setRutError("")
    }
  }

  const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setIdFileError("El archivo es muy grande. Máximo 10MB.")
      return
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!allowed.includes(file.type)) {
      setIdFileError("Formato no admitido. Sube JPG, PNG o PDF.")
      return
    }
    setIdFileError("")
    setIdFile(file)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName.trim() || !formData.lastName.trim()) return

    if (!formData.rut || !validateRut(formData.rut)) {
      setRutError("Ingresa un RUT válido para el familiar.")
      return
    }

    if (!idFile) {
      setIdFileError("Debes adjuntar el carnet de identidad o documento de autorización.")
      return
    }

    setVerifyingId(true)
    try {
      // Paso 1: Subir documento de identidad via /api/documents/upload (bucket 'documents')
      const uploadForm = new FormData()
      uploadForm.append("file", idFile)
      uploadForm.append("name", `CI_${formData.firstName.trim()}_${formData.lastName.trim()}`)
      uploadForm.append("category", "identity")
      uploadForm.append("description", `Documento de identidad de dependiente: ${formData.firstName.trim()} ${formData.lastName.trim()}`)

      const uploadRes = await fetch("/api/documents/upload", {
        method: "POST",
        body: uploadForm,
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.message || "Error al subir el documento de identidad")

      const documentUrl = uploadData.document?.url || uploadData.url || null

      // Paso 2: Crear el dependiente con la URL del documento
      const res = await fetch("/api/patient/dependents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          relationship: formData.relation || (isSpanish ? "Familiar" : "Dependent"),
          dob: formData.dateOfBirth || null,
          rut: formData.rut,
          document_url: documentUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al agregar familiar")

      const d = data.dependent
      setDependents((prev) => [
        ...prev,
        {
          id: d.id,
          firstName: d.first_name,
          lastName: d.last_name,
          relation: d.relationship,
          dateOfBirth: d.dob || "",
          rut: d.rut,
          verified: d.verified,
          idDocumentName: idFile.name,
        },
      ])
      setFormData({ firstName: "", lastName: "", relation: "", dateOfBirth: "", rut: "" })
      setIdFile(null)
      setRutError("")
      setIdFileError("")
      setShowForm(false)
      toast.success(isSpanish ? "Familiar agregado correctamente." : "Family member added successfully.")
    } catch (err: any) {
      console.error("Error adding dependent:", err)
      toast.error(err.message || (isSpanish ? "No se pudo agregar el familiar." : "Could not add family member."))
    } finally {
      setVerifyingId(false)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/patient/dependents?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setDependents((prev) => prev.filter((d) => d.id !== id))
      toast.success(isSpanish ? "Familiar eliminado" : "Family member removed")
    } catch (err) {
      console.error("Error removing dependent:", err)
      toast.error(isSpanish ? "No se pudo eliminar el familiar." : "Could not remove family member.")
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString(isSpanish ? "es-CL" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const relationOptions = isSpanish
    ? ["Hijo", "Hija", "Cónyuge", "Padre", "Madre", "Otro"]
    : ["Son", "Daughter", "Spouse", "Father", "Mother", "Other"]

  return (
    <DashboardLayout role="patient">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isSpanish ? "Familiares" : "Family"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isSpanish
                ? "Agrega dependientes para agendar citas por ellos. Se requiere RUT y documento de identidad."
                : "Add dependents to book appointments on their behalf. RUT and ID document are required."}
            </p>
          </div>
          <Button className="rounded-xl font-bold" onClick={() => setShowForm((v) => !v)}>
            <UserPlus className="mr-2 h-4 w-4" />
            {isSpanish ? "Agregar familiar" : "Add family member"}
          </Button>
        </div>

        {/* Security Info Banner */}
        <Card className="border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-teal-900 dark:text-teal-100">
                  {isSpanish ? "Verificación de identidad requerida" : "Identity verification required"}
                </p>
                <p className="text-xs text-teal-800 dark:text-teal-200 mt-1">
                  {isSpanish
                    ? "Para proteger la salud de tus familiares, solicitamos el RUT y una copia del carnet de identidad (CI) o certificado de nacimiento al agregar dependientes."
                    : "To protect your family's health, we require the RUT and a copy of the ID card or birth certificate when adding dependents."}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 text-teal-700 dark:text-teal-300"
                onClick={() => setInfoOpen(true)}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add Form */}
        {showForm && (
          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                {isSpanish ? "Nuevo familiar" : "New family member"}
              </CardTitle>
              <CardDescription>
                {isSpanish
                  ? "Completa los datos y adjunta el carnet de identidad del menor o familiar."
                  : "Fill in the details and attach the ID card of the minor or family member."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-6">
                {/* Name fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fam-firstName">{isSpanish ? "Nombre *" : "First name *"}</Label>
                    <Input
                      id="fam-firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder={isSpanish ? "Ej. Ana" : "e.g. Ana"}
                      className="rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fam-lastName">{isSpanish ? "Apellido *" : "Last name *"}</Label>
                    <Input
                      id="fam-lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder={isSpanish ? "Ej. García" : "e.g. García"}
                      className="rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fam-relation">{isSpanish ? "Parentesco *" : "Relationship *"}</Label>
                    <select
                      id="fam-relation"
                      value={formData.relation}
                      onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="">{isSpanish ? "Seleccionar" : "Select"}</option>
                      {relationOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fam-dob">{isSpanish ? "Fecha de nacimiento *" : "Date of birth *"}</Label>
                    <Input
                      id="fam-dob"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* RUT Field */}
                <div className="space-y-2">
                  <Label htmlFor="fam-rut" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-teal-600" />
                    {isSpanish ? "RUT del familiar *" : "Family member RUT *"}
                  </Label>
                  <Input
                    id="fam-rut"
                    value={formData.rut}
                    onChange={(e) => handleRutChange(e.target.value)}
                    placeholder="12.345.678-9"
                    className={`rounded-xl font-mono ${rutError ? "border-red-400 focus-visible:ring-red-400" : formData.rut && !rutError ? "border-green-400" : ""}`}
                    maxLength={12}
                    required
                  />
                  {rutError ? (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {rutError}
                    </p>
                  ) : formData.rut && formData.rut.replace(/[^0-9kK]/g, "").length >= 8 && !rutError ? (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> RUT válido
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {isSpanish ? "Formato: 12.345.678-9" : "Format: 12.345.678-9"}
                    </p>
                  )}
                </div>

                {/* ID Document Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-teal-600" />
                    {isSpanish ? "Carnet de Identidad o Documento de Autorización *" : "ID Card or Authorization Document *"}
                  </Label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer hover:bg-accent/20 ${
                      idFile ? "border-green-400 bg-green-50/50 dark:bg-green-950/10" : idFileError ? "border-red-400" : "border-border/60"
                    }`}
                    onClick={() => document.getElementById("fam-id-doc")?.click()}
                  >
                    <input
                      id="fam-id-doc"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleIdFileChange}
                    />
                    {idFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">{idFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIdFile(null)
                            setIdFileError("")
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                        <p className="text-sm font-medium text-muted-foreground">
                          {isSpanish ? "Haz clic para subir el carnet de identidad" : "Click to upload the ID card"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isSpanish ? "JPG, PNG o PDF · Máx. 10MB" : "JPG, PNG or PDF · Max 10MB"}
                        </p>
                      </div>
                    )}
                  </div>
                  {idFileError ? (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {idFileError}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {isSpanish
                        ? "Sube una foto clara del carnet de identidad (anverso) del menor. Este documento solo es utilizado para verificación y no es compartido."
                        : "Upload a clear photo of the ID card (front) of the minor. This document is only used for verification and is not shared."}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="rounded-xl" disabled={verifyingId}>
                    {verifyingId ? (
                      <>
                        <Shield className="mr-2 h-4 w-4 animate-pulse" />
                        {isSpanish ? "Verificando..." : "Verifying..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {isSpanish ? "Agregar y Verificar" : "Add & Verify"}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setShowForm(false)
                      setIdFile(null)
                      setRutError("")
                      setIdFileError("")
                      setFormData({ firstName: "", lastName: "", relation: "", dateOfBirth: "", rut: "" })
                    }}
                  >
                    {t.dashboard.cancel}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Dependents List */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {isSpanish ? "Lista de familiares" : "Family list"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingList ? (
              <div className="flex items-center justify-center py-10">
                <Shield className="h-6 w-6 text-muted-foreground animate-pulse" />
              </div>
            ) : dependents.length > 0 ? (
              <ul className="divide-y divide-border/40">
                {dependents.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {d.firstName} {d.lastName}
                          </p>
                          {d.verified && (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0 text-[10px]">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                          <span>{d.relation}</span>
                          {d.dateOfBirth && (
                            <>
                              <span>·</span>
                              <Calendar className="h-3.5 w-3.5 inline" />
                              {formatDate(d.dateOfBirth)}
                            </>
                          )}
                          {d.rut && (
                            <>
                              <span>·</span>
                              <Shield className="h-3.5 w-3.5 inline text-teal-600" />
                              <span className="font-mono text-xs">{d.rut}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-xl" asChild>
                        <Link href="/search">
                          {isSpanish ? "Agendar cita" : "Book appointment"}
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(d.id)}
                        aria-label={isSpanish ? `Eliminar ${d.firstName}` : `Remove ${d.firstName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-medium mb-2">
                  {isSpanish ? "No has agregado familiares" : "You haven't added any family members yet"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {isSpanish
                    ? "Agrega hijos o dependientes para poder agendar citas por ellos."
                    : "Add children or dependents to book appointments on their behalf."}
                </p>
                <Button className="rounded-xl" onClick={() => setShowForm(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isSpanish ? "Agregar familiar" : "Add family member"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Dialog */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal-600" />
              ¿Por qué pedimos el RUT y CI?
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground pt-2">
                <p>
                  En NUREA, la identidad de cada paciente es fundamental para garantizar que la atención médica sea
                  entregada correctamente y proteger su historial clínico.
                </p>
                <ul className="space-y-2 list-none">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>El <strong>RUT</strong> permite verificar que el paciente existe y es quien dice ser.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>El <strong>carnet de identidad o certificado de nacimiento</strong> confirma el parentesco con el titular.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>El documento solo se usa para <strong>verificación interna</strong> y no se comparte con ningún tercero.</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground border-t border-border/40 pt-3">
                  Tus datos están protegidos bajo la Ley 19.628 de Protección de Datos Personales de Chile.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
