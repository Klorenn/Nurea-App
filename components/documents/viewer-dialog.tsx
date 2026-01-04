"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Download, FileText, Calendar, User, X, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"

interface ViewerDialogProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
}

export function ViewerDialog({ isOpen, onClose, documentId }: ViewerDialogProps) {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const isSpanish = language === "es"
  const [loading, setLoading] = useState(true)
  const [document, setDocument] = useState<any>(null)
  const [viewUrl, setViewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && documentId) {
      loadDocument()
    }
  }, [isOpen, documentId])

  const loadDocument = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/documents/view?id=${documentId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "No se pudo cargar el documento")
      }

      setDocument(data.document)
      setViewUrl(data.viewUrl)
    } catch (error) {
      console.error("Load document error:", error)
      setError(error instanceof Error ? error.message : "Error al cargar el documento")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/documents/download?id=${documentId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "No se pudo descargar el documento")
      }

      // Abrir URL de descarga
      window.open(data.downloadUrl, '_blank')
    } catch (error) {
      console.error("Download error:", error)
      alert(error instanceof Error ? error.message : "Error al descargar el documento")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === "es" ? "es-ES" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {isSpanish ? "Visualizar Documento" : "View Document"}
          </DialogTitle>
          <DialogDescription>
            {isSpanish 
              ? "Documento médico protegido y seguro"
              : "Protected and secure medical document"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <X className="h-12 w-12 text-destructive" />
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" onClick={onClose} className="rounded-xl">
              {isSpanish ? "Cerrar" : "Close"}
            </Button>
          </div>
        ) : document && viewUrl ? (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Document Info */}
            <Card className="border-border/40">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-lg">{document.name}</h3>
                    {document.description && (
                      <p className="text-sm text-muted-foreground">{document.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        <span>{formatFileSize(document.file_size)}</span>
                      </div>
                      {document.professional && (
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>
                            {isSpanish ? "Profesional:" : "Professional:"} {document.professional.first_name} {document.professional.last_name}
                          </span>
                        </div>
                      )}
                      {document.appointment && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(document.appointment.appointment_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button onClick={handleDownload} className="rounded-xl" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {isSpanish ? "Descargar" : "Download"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Document Viewer */}
            <div className="flex-1 border border-border/40 rounded-xl overflow-hidden bg-accent/5">
              {document.file_type === 'application/pdf' ? (
                <iframe
                  src={viewUrl}
                  className="w-full h-full min-h-[500px]"
                  title={document.name}
                />
              ) : document.file_type.startsWith('image/') ? (
                <div className="flex items-center justify-center h-full min-h-[500px] p-4">
                  <img
                    src={viewUrl}
                    alt={document.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[500px] p-8">
                  <div className="text-center space-y-4">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
                    <p className="text-muted-foreground">
                      {isSpanish 
                        ? "Este tipo de archivo no se puede visualizar en el navegador. Por favor, descárgalo para verlo."
                        : "This file type cannot be viewed in the browser. Please download it to view."}
                    </p>
                    <Button onClick={handleDownload} className="rounded-xl">
                      <Download className="h-4 w-4 mr-2" />
                      {isSpanish ? "Descargar para Ver" : "Download to View"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-green-800 dark:text-green-300">
                    {isSpanish 
                      ? "Este documento está protegido y encriptado. Solo tú y el profesional autorizado tienen acceso."
                      : "This document is protected and encrypted. Only you and the authorized professional have access."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

