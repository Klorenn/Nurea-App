"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, Shield, AlertCircle, CheckCircle2, X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"

interface UploadDialogProps {
  isOpen: boolean
  onClose: () => void
  appointmentId?: string
  professionalId?: string
  onSuccess?: () => void
}

export function UploadDialog({ isOpen, onClose, appointmentId, professionalId, onSuccess }: UploadDialogProps) {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const isSpanish = language === "es"
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("other")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    { value: "lab_results", label: isSpanish ? "Resultados de Laboratorio" : "Lab Results" },
    { value: "prescription", label: isSpanish ? "Receta Médica" : "Prescription" },
    { value: "consultation_report", label: isSpanish ? "Informe de Consulta" : "Consultation Report" },
    { value: "medical_record", label: isSpanish ? "Historial Médico" : "Medical Record" },
    { value: "imaging", label: isSpanish ? "Imágenes Médicas" : "Medical Imaging" },
    { value: "other", label: isSpanish ? "Otro" : "Other" },
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño (máximo 25MB)
      if (file.size > 25 * 1024 * 1024) {
        alert(isSpanish 
          ? "El archivo es demasiado grande. Máximo 25MB."
          : "File is too large. Maximum 25MB.")
        return
      }

      // Validar tipo
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/tiff',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ]

      if (!allowedTypes.includes(file.type)) {
        alert(isSpanish 
          ? "Tipo de archivo no permitido. Solo PDF, imágenes médicas, Word y texto."
          : "File type not allowed. Only PDF, medical images, Word and text.")
        return
      }

      setSelectedFile(file)
      if (!name) {
        setName(file.name.replace(/\.[^/.]+$/, "")) // Nombre sin extensión
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !name.trim()) {
      alert(isSpanish 
        ? "Por favor, selecciona un archivo y proporciona un nombre."
        : "Please select a file and provide a name.")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('name', name.trim())
      if (description.trim()) {
        formData.append('description', description.trim())
      }
      formData.append('category', category)
      if (appointmentId) {
        formData.append('appointmentId', appointmentId)
      }
      if (professionalId) {
        formData.append('professionalId', professionalId)
      }

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "No se pudo subir el documento")
      }

      alert(data.message || (isSpanish 
        ? "Documento subido exitosamente"
        : "Document uploaded successfully"))

      // Reset form
      setSelectedFile(null)
      setName("")
      setDescription("")
      setCategory("other")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Upload error:", error)
      alert(error instanceof Error ? error.message : "Error al subir el documento")
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            {isSpanish ? "Subir Documento Médico" : "Upload Medical Document"}
          </DialogTitle>
          <DialogDescription>
            {isSpanish 
              ? "Sube tu documento de forma segura. Solo tú y tu profesional autorizado podrán acceder."
              : "Upload your document securely. Only you and your authorized professional will have access."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Security Notice */}
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-green-900 dark:text-green-200 mb-1">
                    {isSpanish ? "Documento Protegido" : "Protected Document"}
                  </p>
                  <p className="text-xs text-green-800 dark:text-green-300 leading-relaxed">
                    {isSpanish 
                      ? "Tu documento será encriptado y almacenado de forma segura. Solo tú y el profesional autorizado podrán acceder a él."
                      : "Your document will be encrypted and stored securely. Only you and the authorized professional will have access to it."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Selection */}
          <div className="space-y-2">
            <Label htmlFor="file">
              {isSpanish ? "Seleccionar Archivo" : "Select File"} *
            </Label>
            <input
              ref={fileInputRef}
              id="file"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.tiff,.doc,.docx,.txt"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl h-24 border-2 border-dashed"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm">
                  {selectedFile 
                    ? selectedFile.name 
                    : (isSpanish ? "Haz clic para seleccionar" : "Click to select")}
                </span>
              </div>
            </Button>
            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-accent/20 rounded-xl border border-border/40">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""
                    }
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Document Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {isSpanish ? "Nombre del Documento" : "Document Name"} *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isSpanish ? "Ej: Resultados de Laboratorio - Oct 2024" : "E.g: Lab Results - Oct 2024"}
              className="rounded-xl"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              {isSpanish ? "Categoría" : "Category"}
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {isSpanish ? "Descripción (opcional)" : "Description (optional)"}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isSpanish 
                ? "Agrega una descripción o notas sobre este documento..."
                : "Add a description or notes about this document..."}
              className="rounded-xl min-h-[100px]"
            />
          </div>

          {/* Allowed File Types */}
          <Card className="border-border/40 bg-accent/10">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                <strong>{isSpanish ? "Tipos permitidos:" : "Allowed types:"}</strong>{" "}
                {isSpanish 
                  ? "PDF, imágenes médicas (JPG, PNG, TIFF), Word (DOC, DOCX), texto (TXT). Máximo 25MB."
                  : "PDF, medical images (JPG, PNG, TIFF), Word (DOC, DOCX), text (TXT). Maximum 25MB."}
              </p>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            {isSpanish ? "Cancelar" : "Cancel"}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={loading || !selectedFile || !name.trim()}
            className="rounded-xl font-bold"
          >
            {loading ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                {isSpanish ? "Subiendo..." : "Uploading..."}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {isSpanish ? "Subir Documento" : "Upload Document"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

