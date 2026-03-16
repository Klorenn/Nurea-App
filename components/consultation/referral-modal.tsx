"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Link as LinkIcon, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface Specialty {
  id: string
  name_es: string
  name_en: string
}

interface Professional {
  id: string
  first_name: string
  last_name: string
}

interface ReferralModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  appointmentId: string
  isSpanish: boolean
}

export function ReferralModal({ isOpen, onOpenChange, patientId, appointmentId, isSpanish }: ReferralModalProps) {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const supabase = createClient()

  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [selectedProfessional, setSelectedProfessional] = useState("")
  const [reason, setReason] = useState("")
  const [attachSummary, setAttachSummary] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadSpecialties()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedSpecialty) {
      loadProfessionalsForSpecialty(selectedSpecialty)
    } else {
      setProfessionals([])
      setSelectedProfessional("")
    }
  }, [selectedSpecialty])

  const loadSpecialties = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("specialties")
        .select("id, name_es, name_en")
        .eq("is_active", true)
        .order("name_es")
      
      if (error) throw error
      setSpecialties(data || [])
    } catch (error) {
      console.error("Error loading specialties", error)
    } finally {
      setLoading(false)
    }
  }

  const loadProfessionalsForSpecialty = async (specialtyId: string) => {
    setLoading(true)
    try {
      // First, get the subset of professionals with that specialty via the junction table or main table
      const { data, error } = await supabase
        .from("professional_specialties")
        .select(`
          professional_id,
          professionals!inner(
            id,
            profiles!inner(first_name, last_name)
          )
        `)
        .eq("specialty_id", specialtyId)

      if (error) throw error
      
      const profs = (data || []).map((item: any) => ({
        id: item.professionals.id,
        first_name: item.professionals.profiles.first_name,
        last_name: item.professionals.profiles.last_name,
      }))
      
      setProfessionals(profs)
    } catch (error) {
      console.error("Error loading professionals", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedSpecialty || !reason.trim()) {
      toast.error(isSpanish ? "Debe seleccionar una especialidad y escribir un motivo" : "Must select specialty and write a reason")
      return
    }

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user")

      const { error } = await supabase
        .from("referrals")
        .insert({
          appointment_id: appointmentId,
          patient_id: patientId,
          referring_professional_id: user.id,
          target_specialty_id: selectedSpecialty,
          target_professional_id: selectedProfessional || null,
          reason,
          summary_attached: attachSummary,
          status: 'pending'
        })
      
      if (error) throw error

      toast.success(isSpanish ? "Derivación enviada correctamente" : "Referral sent successfully", {
        icon: <LinkIcon className="h-4 w-4" />
      })
      
      onOpenChange(false)
      // reset form
      setSelectedSpecialty("")
      setSelectedProfessional("")
      setReason("")
      setAttachSummary(false)

    } catch (error: any) {
      console.error("Error saving referral:", error)
      toast.error(isSpanish ? "Error al enviar la derivación" : "Error sending referral")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-indigo-600" />
            {isSpanish ? "Derivar Paciente" : "Refer Patient"}
          </DialogTitle>
          <DialogDescription>
            {isSpanish 
              ? "Crea una orden de interconsulta para derivar al paciente a otro especialista de NUREA." 
              : "Create an interconsultation order to refer the patient to another NUREA specialist."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>{isSpanish ? "Especialidad de Destino *" : "Target Specialty *"}</Label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder={isSpanish ? "Seleccionar especialidad..." : "Select specialty..."} />
              </SelectTrigger>
              <SelectContent>
                {specialties.map(spec => (
                  <SelectItem key={spec.id} value={spec.id}>
                    {isSpanish ? spec.name_es : spec.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{isSpanish ? "Doctor Específico (Opcional)" : "Specific Doctor (Optional)"}</Label>
            <Select value={selectedProfessional} onValueChange={setSelectedProfessional} disabled={loading || professionals.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={
                  professionals.length === 0 && selectedSpecialty 
                    ? (isSpanish ? "No hay doctores en esta especialidad" : "No doctors in this specialty")
                    : (isSpanish ? "Cualquier doctor" : "Any doctor")
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{isSpanish ? "Cualquier doctor" : "Any doctor"}</SelectItem>
                {professionals.map(prof => (
                  <SelectItem key={prof.id} value={prof.id}>
                    Dr/a. {prof.first_name} {prof.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{isSpanish ? "Motivo de la Derivación *" : "Reason for Referral *"}</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isSpanish ? "Describa brevemente por qué deriva al paciente..." : "Briefly describe why you are referring..."}
              className="resize-none h-24 text-sm"
            />
          </div>

          <div className="flex items-center space-x-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
            <Checkbox 
              id="attach-summary" 
              checked={attachSummary} 
              onCheckedChange={(c) => setAttachSummary(!!c)} 
            />
            <label
              htmlFor="attach-summary"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-indigo-900 dark:text-indigo-200"
            >
              {isSpanish ? "Adjuntar resumen de esta consulta a la derivación" : "Attach this consultation summary to referral"}
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isSpanish ? "Cancelar" : "Cancel"}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || !selectedSpecialty || !reason.trim()}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
            {isSpanish ? "Enviar Derivación" : "Send Referral"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
