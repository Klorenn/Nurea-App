"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, Calendar, User, Search, Upload, Shield, Loader2, Lock, Unlock, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { Input } from "@/components/ui/input"
import { UploadDialog } from "@/components/documents/upload-dialog"
import { ViewerDialog } from "@/components/documents/viewer-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { motion, AnimatePresence } from "framer-motion"

export default function DocumentsPage() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const isSpanish = language === "es"
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [viewerDialogOpen, setViewerDialogOpen] = useState(false)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [groupByAppointment, setGroupByAppointment] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== "all") {
        params.append("category", categoryFilter)
      }

      const response = await fetch(`/api/documents/list?${params.toString()}`)
      
      // If not OK (401, 403, 404, 500...) just show empty list, no crash
      if (!response.ok) {
        console.warn("Documents API returned", response.status)
        setDocuments([])
        return
      }

      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      // Network errors, JSON parse errors etc. — show empty, don't crash
      console.error("Load documents error:", error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const handleView = (documentId: string) => {
    setSelectedDocumentId(documentId)
    setViewerDialogOpen(true)
  }

  const handleDownload = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/download?id=${documentId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "No se pudo descargar el documento")
      }

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
      { year: "numeric", month: "short", day: "numeric" }
    )
  }

  const getCategoryLabel = (category: string) => {
    return t.documents.categories[category as keyof typeof t.documents.categories] || category
  }

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [documents, searchQuery, categoryFilter])

  // Agrupar documentos por cita si está activado
  const groupedDocuments = useMemo(() => {
    if (!groupByAppointment) return { ungrouped: filteredDocuments }
    
    const grouped: Record<string, typeof filteredDocuments> = {}
    filteredDocuments.forEach((doc) => {
      const key = doc.appointment_id || 'ungrouped'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(doc)
    })
    
    return grouped
  }, [filteredDocuments, groupByAppointment])

  return (
    <DashboardLayout role="patient">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {t.dashboard.documents}
                </h1>
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                  <Shield className="h-3 w-3 mr-1" />
                  {isSpanish ? "Protegido" : "Protected"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {isSpanish 
                  ? "Todo está protegido y solo tú y tus profesionales autorizados tienen acceso"
                  : "Everything is protected and only you and your authorized professionals have access"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                className="rounded-xl font-bold"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" /> {t.documents.upload}
              </Button>
              <Button 
                variant="outline"
                className="rounded-xl font-bold"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isSpanish ? "Subir Examen" : "Upload Lab/Test"}
              </Button>
            </div>
          </div>
        </div>

        {/* Security Notice - Prominente */}
        <Card className="border-green-300 dark:border-green-700 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/20 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <p className="font-semibold text-base text-green-900 dark:text-green-100">
                    {isSpanish ? "Tus documentos están protegidos" : "Your documents are protected"}
                  </p>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                  {isSpanish 
                    ? "Todos tus documentos están encriptados y almacenados de forma segura. Solo tú y los profesionales autorizados pueden acceder a ellos."
                    : "All your documents are encrypted and stored securely. Only you and authorized professionals can access them."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.documents.search}
                className="pl-10 rounded-xl bg-accent/20 border-none h-12"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(value) => {
              setCategoryFilter(value)
            }}>
              <SelectTrigger className="w-full sm:w-[200px] rounded-xl">
                <SelectValue placeholder={isSpanish ? "Todas las categorías" : "All categories"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isSpanish ? "Todas las categorías" : "All categories"}</SelectItem>
                {Object.entries(t.documents.categories).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Toggle para agrupar por cita (opcional) */}
          {filteredDocuments.some(doc => doc.appointment_id) && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 border border-border/40">
              <Switch
                checked={groupByAppointment}
                onCheckedChange={setGroupByAppointment}
                className="data-[state=checked]:bg-primary"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {isSpanish ? "Agrupar por cita" : "Group by appointment"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isSpanish 
                    ? "Organiza tus documentos según la cita asociada"
                    : "Organize your documents by associated appointment"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-primary opacity-60" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || categoryFilter !== "all" 
                  ? (isSpanish ? "No encontramos documentos" : "No documents found")
                  : t.documents.noDocuments}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery || categoryFilter !== "all"
                  ? (isSpanish 
                      ? "Intenta con otros términos de búsqueda o revisa tus filtros"
                      : "Try different search terms or check your filters")
                  : (isSpanish
                      ? "Los documentos de tus consultas aparecerán aquí automáticamente. También puedes subir documentos si tu profesional te lo solicita."
                      : "Documents from your consultations will appear here automatically. You can also upload documents if your professional requests them.")}
              </p>
              {(!searchQuery && categoryFilter === "all") && (
                <Button 
                  className="rounded-xl"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload className="mr-2 h-4 w-4" /> {t.documents.upload}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence mode="wait">
            {!groupByAppointment ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                {filteredDocuments.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <DocumentCard
                      doc={doc}
                      isSpanish={isSpanish}
                      formatDate={formatDate}
                      formatFileSize={formatFileSize}
                      getCategoryLabel={getCategoryLabel}
                      handleView={handleView}
                      handleDownload={handleDownload}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="grouped"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {Object.entries(groupedDocuments).map(([key, docs]) => {
                  if (key === 'ungrouped') {
                    return (
                      <div key={key} className="space-y-3">
                        {docs.map((doc, index) => (
                          <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <DocumentCard
                              doc={doc}
                              isSpanish={isSpanish}
                              formatDate={formatDate}
                              formatFileSize={formatFileSize}
                              getCategoryLabel={getCategoryLabel}
                              handleView={handleView}
                              handleDownload={handleDownload}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )
                  }
                  
                  const appointmentDate = docs[0]?.appointment?.appointment_date
                  const professional = docs[0]?.professional
                  
                  return (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold text-sm">
                            {isSpanish ? "Cita del" : "Appointment on"} {appointmentDate ? formatDate(appointmentDate) : (isSpanish ? "Fecha no disponible" : "Date not available")}
                          </p>
                          {professional && (
                            <p className="text-xs text-muted-foreground">
                              {professional.first_name} {professional.last_name}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {docs.length} {isSpanish ? "documentos" : "documents"}
                        </Badge>
                      </div>
                      {docs.map((doc, index) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <DocumentCard
                            doc={doc}
                            isSpanish={isSpanish}
                            formatDate={formatDate}
                            formatFileSize={formatFileSize}
                            getCategoryLabel={getCategoryLabel}
                            handleView={handleView}
                            handleDownload={handleDownload}
                            grouped
                          />
                        </motion.div>
                      ))}
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Dialogs */}
      <UploadDialog
        isOpen={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onSuccess={loadDocuments}
      />
      {selectedDocumentId && (
        <ViewerDialog
          isOpen={viewerDialogOpen}
          onClose={() => {
            setViewerDialogOpen(false)
            setSelectedDocumentId(null)
          }}
          documentId={selectedDocumentId}
        />
      )}
    </DashboardLayout>
  )
}

// Componente de Card de Documento
function DocumentCard({
  doc,
  isSpanish,
  formatDate,
  formatFileSize,
  getCategoryLabel,
  handleView,
  handleDownload,
  grouped = false
}: {
  doc: any
  isSpanish: boolean
  formatDate: (date: string) => string
  formatFileSize: (bytes: number) => string
  getCategoryLabel: (category: string) => string
  handleView: (id: string) => void
  handleDownload: (id: string) => void
  grouped?: boolean
}) {
  const getAccessInfo = () => {
    if (doc.access_level === 'patient_only') {
      return {
        icon: Lock,
        text: isSpanish ? "Solo tú" : "Only you",
        color: "text-muted-foreground",
        bgColor: "bg-muted/50"
      }
    }
    if (doc.access_level === 'professional_only') {
      return {
        icon: Lock,
        text: isSpanish ? `Solo ${doc.professional?.first_name || 'profesional'}` : `Only ${doc.professional?.first_name || 'professional'}`,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-950/20"
      }
    }
    return {
      icon: Unlock,
      text: isSpanish ? `Compartido con ${doc.professional?.first_name || 'profesional'}` : `Shared with ${doc.professional?.first_name || 'professional'}`,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    }
  }

  const accessInfo = getAccessInfo()
  const AccessIcon = accessInfo.icon

  return (
    <Card className={`border-border/40 hover:shadow-md transition-all ${grouped ? 'ml-6' : ''}`}>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FileText className="h-7 w-7" />
            </div>
            <div className="flex-1 space-y-3 min-w-0">
              <div>
                <h3 className="font-bold text-lg truncate">{doc.name}</h3>
                {doc.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                )}
              </div>
              
              {/* Información esencial */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Badge variant="outline" className="text-xs font-medium">
                  {getCategoryLabel(doc.category)}
                </Badge>
                
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(doc.uploaded_at)}</span>
                </div>
                
                {doc.professional && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[150px]">
                      {doc.professional.first_name} {doc.professional.last_name}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {formatFileSize(doc.file_size)} • {doc.file_type.split('/')[1]?.toUpperCase() || doc.file_type}
                </div>
              </div>
              
              {/* Permisos de acceso - Prominente */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${accessInfo.bgColor} border border-border/40`}>
                <AccessIcon className={`h-4 w-4 ${accessInfo.color}`} />
                <span className={`text-xs font-medium ${accessInfo.color}`}>
                  {accessInfo.text}
                </span>
              </div>
            </div>
          </div>
          
          {/* Acciones */}
          <div className="flex gap-2 shrink-0">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-xl h-10 w-10"
              onClick={() => handleView(doc.id)}
              aria-label={isSpanish ? "Ver documento" : "View document"}
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-xl h-10 w-10"
              onClick={() => handleDownload(doc.id)}
              aria-label={isSpanish ? "Descargar documento" : "Download document"}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

