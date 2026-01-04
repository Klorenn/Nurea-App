"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, Calendar, User, Search, Upload, Shield, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { Input } from "@/components/ui/input"
import { UploadDialog } from "@/components/documents/upload-dialog"
import { ViewerDialog } from "@/components/documents/viewer-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "No se pudieron cargar los documentos")
      }

      setDocuments(data.documents || [])
    } catch (error) {
      console.error("Load documents error:", error)
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

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  return (
    <DashboardLayout role="patient">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t.dashboard.documents}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === "es" 
                ? "Tus documentos médicos y recetas en un solo lugar"
                : "Your medical documents and prescriptions in one place"}
            </p>
          </div>
          <Button 
            className="rounded-xl font-bold"
            onClick={() => setUploadDialogOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" /> {t.documents.upload}
          </Button>
        </div>

        {/* Security Notice */}
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-green-900 dark:text-green-200 mb-1">
                  {t.documents.secureStorage}
                </p>
                <p className="text-xs text-green-800 dark:text-green-300 leading-relaxed">
                  {t.documents.secureStorageDesc}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
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
            loadDocuments()
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

        {/* Documents List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground font-medium mb-2">
                {t.documents.noDocuments}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {t.documents.noDocumentsDesc}
              </p>
              <Button 
                className="rounded-xl"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" /> {t.documents.upload}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="border-border/40 hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div>
                          <h3 className="font-bold text-lg truncate">{doc.name}</h3>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                            {doc.professional && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>
                                  {doc.professional.first_name} {doc.professional.last_name}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(doc.uploaded_at)}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(doc.category)}
                            </Badge>
                          </div>
                        </div>
                        <div className="pt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(doc.file_size)} • {doc.file_type}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-xl"
                        onClick={() => handleView(doc.id)}
                        title={isSpanish ? "Ver documento" : "View document"}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-xl"
                        onClick={() => handleDownload(doc.id)}
                        title={isSpanish ? "Descargar documento" : "Download document"}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
      </div>
    </DashboardLayout>
  )
}

