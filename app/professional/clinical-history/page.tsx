"use client"

import { useState, useEffect, Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { 
  FileText, 
  Plus, 
  Loader2,
  Calendar,
  User,
  Trash2,
  Edit,
  Save,
  X
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"

function ClinicalHistoryPageContent() {
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  const patientId = searchParams.get("patientId")
  const isSpanish = language === "es"
  
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patientId || null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    patientId: "",
    appointmentId: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    if (patientId) {
      setSelectedPatientId(patientId)
      loadNotes(patientId)
    } else {
      loadPatients()
    }
  }, [patientId])

  useEffect(() => {
    if (selectedPatientId) {
      loadNotes(selectedPatientId)
    }
  }, [selectedPatientId])

  const loadPatients = async () => {
    try {
      const response = await fetch('/api/professional/patients')
      const data = await response.json()
      if (data.success) {
        setPatients(data.patients || [])
      }
    } catch (error) {
      console.error("Error loading patients:", error)
    }
  }

  const loadNotes = async (patientId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/professional/clinical-notes?patientId=${patientId}`)
      const data = await response.json()
      if (data.success) {
        setNotes(data.notes || [])
      }
    } catch (error) {
      console.error("Error loading notes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (note?: any) => {
    if (note) {
      setEditingNote(note)
      setFormData({
        patientId: note.patient_id,
        appointmentId: note.appointment_id || "",
        notes: note.notes,
        date: note.date,
      })
    } else {
      setEditingNote(null)
      setFormData({
        patientId: selectedPatientId || "",
        appointmentId: "",
        notes: "",
        date: new Date().toISOString().split("T")[0],
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingNote) {
        // Update
        const response = await fetch('/api/professional/clinical-notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingNote.id,
            notes: formData.notes,
            date: formData.date,
          }),
        })
        const data = await response.json()
        if (data.success && selectedPatientId) {
          loadNotes(selectedPatientId)
          setDialogOpen(false)
        }
      } else {
        // Create
        const response = await fetch('/api/professional/clinical-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const data = await response.json()
        if (data.success && selectedPatientId) {
          loadNotes(selectedPatientId)
          setDialogOpen(false)
        }
      }
    } catch (error) {
      console.error("Error saving note:", error)
      alert(isSpanish ? "Error al guardar la nota" : "Error saving note")
    }
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm(isSpanish ? "¿Estás seguro de eliminar esta nota?" : "Are you sure you want to delete this note?")) {
      return
    }

    try {
      const response = await fetch(`/api/professional/clinical-notes?id=${noteId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success && selectedPatientId) {
        loadNotes(selectedPatientId)
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      alert(isSpanish ? "Error al eliminar la nota" : "Error deleting note")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      isSpanish ? "es-ES" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    )
  }

  return (
    <RouteGuard requiredRole="professional">
      <DashboardLayout role="professional">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {isSpanish ? "Historial Clínico" : "Clinical History"}
              </h1>
              <p className="text-muted-foreground">
                {isSpanish 
                  ? "Notas privadas sobre tus pacientes"
                  : "Private notes about your patients"}
              </p>
            </div>
            {selectedPatientId && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                {isSpanish ? "Nueva Nota" : "New Note"}
              </Button>
            )}
          </div>

          {/* Patient Selector */}
          {!patientId && (
            <Card>
              <CardContent className="p-4">
                <Label className="mb-2 block">
                  {isSpanish ? "Seleccionar Paciente" : "Select Patient"}
                </Label>
                <select
                  value={selectedPatientId || ""}
                  onChange={(e) => setSelectedPatientId(e.target.value || null)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">{isSpanish ? "Selecciona un paciente..." : "Select a patient..."}</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>
          )}

          {/* Notes List */}
          {!selectedPatientId ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {isSpanish 
                    ? "Selecciona un paciente para ver su historial clínico"
                    : "Select a patient to view their clinical history"}
                </p>
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">
                  {isSpanish 
                    ? "No hay notas clínicas para este paciente"
                    : "No clinical notes for this patient"}
                </p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isSpanish ? "Crear Primera Nota" : "Create First Note"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{formatDate(note.date)}</p>
                            {note.appointment && (
                              <p className="text-sm text-muted-foreground">
                                {isSpanish ? "Cita:" : "Appointment:"} {new Date(`${note.appointment.appointment_date}T${note.appointment.appointment_time}`).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(note)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(note.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap text-sm">{note.notes}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Create/Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingNote 
                    ? (isSpanish ? "Editar Nota Clínica" : "Edit Clinical Note")
                    : (isSpanish ? "Nueva Nota Clínica" : "New Clinical Note")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>{isSpanish ? "Fecha" : "Date"}</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{isSpanish ? "Notas" : "Notes"}</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={10}
                    placeholder={isSpanish ? "Escribe tus notas clínicas aquí..." : "Write your clinical notes here..."}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {isSpanish ? "Cancelar" : "Cancel"}
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSpanish ? "Guardar" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}

export default function ClinicalHistoryPage() {
  return (
    <Suspense fallback={
      <RouteGuard requiredRole="professional">
        <DashboardLayout role="professional">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </RouteGuard>
    }>
      <ClinicalHistoryPageContent />
    </Suspense>
  )
}

