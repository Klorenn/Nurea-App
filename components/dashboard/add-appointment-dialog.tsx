"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "sonner"
import { Loader2, UserPlus, Search } from "lucide-react"
import { AddPatientDialog } from "./add-patient-dialog"

interface AddAppointmentDialogProps {
  isOpen: boolean
  onClose: () => void
  initialDate?: Date
  initialTime?: string
  professionalId: string
  onSuccess: () => void
}

export function AddAppointmentDialog({ 
  isOpen, 
  onClose, 
  initialDate, 
  initialTime,
  professionalId,
  onSuccess 
}: AddAppointmentDialogProps) {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [fetchingPatients, setFetchingPatients] = useState(false)
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)

  const [formData, setFormData] = useState({
    patientId: "",
    date: initialDate ? initialDate.toISOString().split("T")[0] : "",
    time: initialTime || "09:00",
    type: "online",
    duration: "60",
  })

  useEffect(() => {
    if (isOpen) {
      fetchPatients()
    }
  }, [isOpen])

  useEffect(() => {
    if (initialDate) {
      setFormData(prev => ({ ...prev, date: initialDate.toISOString().split("T")[0] }))
    }
    if (initialTime) {
      setFormData(prev => ({ ...prev, time: initialTime }))
    }
  }, [initialDate, initialTime])

  const fetchPatients = async () => {
    setFetchingPatients(true)
    try {
      const response = await fetch("/api/professional/patients")
      const data = await response.json()
      if (data.success) {
        setPatients(data.patients || [])
      }
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setFetchingPatients(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.patientId) {
      toast.error(isSpanish ? "Selecciona un paciente" : "Select a patient")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId,
          patientId: formData.patientId,
          appointmentDate: formData.date,
          appointmentTime: formData.time,
          type: formData.type,
          duration: parseInt(formData.duration),
          createdBySpecialist: true
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(isSpanish ? "Cita agendada correctamente" : "Appointment scheduled successfully")
        onSuccess()
        onClose()
      } else {
        toast.error(data.message || (isSpanish ? "Error al agendar cita" : "Error scheduling appointment"))
      }
    } catch (error) {
      console.error("Error scheduling appointment:", error)
      toast.error(isSpanish ? "Error de servidor" : "Server error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isSpanish ? "Agendar Nueva Cita" : "Schedule New Appointment"}</DialogTitle>
            <DialogDescription>
              {isSpanish 
                ? "Selecciona un paciente y configura los detalles de la cita." 
                : "Select a patient and configure the appointment details."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>{isSpanish ? "Paciente" : "Patient"}</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-teal-600 hover:text-teal-700 gap-1 px-1"
                  onClick={() => setIsAddPatientOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  {isSpanish ? "Nuevo Paciente" : "New Patient"}
                </Button>
              </div>
              <Select value={formData.patientId} onValueChange={(val) => setFormData({ ...formData, patientId: val })}>
                <SelectTrigger>
                  <SelectValue placeholder={isSpanish ? "Seleccionar paciente..." : "Select patient..."} />
                </SelectTrigger>
                <SelectContent>
                  {fetchingPatients ? (
                    <div className="p-2 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>{isSpanish ? "Cargando..." : "Loading..."}</span>
                    </div>
                  ) : patients.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      {isSpanish ? "No hay pacientes registrados" : "No patients registered"}
                    </div>
                  ) : (
                    patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.first_name} {p.last_name} ({p.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aptDate">{isSpanish ? "Fecha" : "Date"}</Label>
                <Input
                  id="aptDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aptTime">{isSpanish ? "Hora" : "Time"}</Label>
                <Input
                  id="aptTime"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isSpanish ? "Tipo" : "Type"}</Label>
                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in-person">{isSpanish ? "Presencial" : "In-person"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isSpanish ? "Duración (min)" : "Duration (min)"}</Label>
                <Select value={formData.duration} onValueChange={(val) => setFormData({ ...formData, duration: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="45">45</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                    <SelectItem value="90">90</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSpanish ? "Confirmar Cita" : "Confirm Appointment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AddPatientDialog 
        isOpen={isAddPatientOpen} 
        onClose={() => setIsAddPatientOpen(false)}
        onSuccess={(patientId) => {
          fetchPatients()
          setFormData(prev => ({ ...prev, patientId }))
        }}
      />
    </>
  )
}
