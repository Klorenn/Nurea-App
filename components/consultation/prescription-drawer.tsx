"use client"

import { useState } from "react"
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Pill, 
  Plus, 
  Trash2, 
  Download, 
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface PrescriptionItem {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

interface PrescriptionDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  items: PrescriptionItem[]
  onItemsChange: (items: PrescriptionItem[]) => void
  patientName: string
  appointmentId: string
  isSpanish?: boolean
}

const FREQUENCY_OPTIONS = [
  { value: "once_daily", label: "1 vez al día", labelEn: "Once daily" },
  { value: "twice_daily", label: "2 veces al día", labelEn: "Twice daily" },
  { value: "three_daily", label: "3 veces al día", labelEn: "Three times daily" },
  { value: "four_daily", label: "4 veces al día", labelEn: "Four times daily" },
  { value: "every_8h", label: "Cada 8 horas", labelEn: "Every 8 hours" },
  { value: "every_12h", label: "Cada 12 horas", labelEn: "Every 12 hours" },
  { value: "as_needed", label: "Según necesidad (SOS)", labelEn: "As needed (PRN)" },
  { value: "before_meals", label: "Antes de las comidas", labelEn: "Before meals" },
  { value: "after_meals", label: "Después de las comidas", labelEn: "After meals" },
  { value: "at_bedtime", label: "Al acostarse", labelEn: "At bedtime" },
]

const DURATION_OPTIONS = [
  { value: "3_days", label: "3 días", labelEn: "3 days" },
  { value: "5_days", label: "5 días", labelEn: "5 days" },
  { value: "7_days", label: "7 días", labelEn: "7 days" },
  { value: "10_days", label: "10 días", labelEn: "10 days" },
  { value: "14_days", label: "14 días", labelEn: "14 days" },
  { value: "21_days", label: "21 días", labelEn: "21 days" },
  { value: "30_days", label: "30 días (1 mes)", labelEn: "30 days (1 month)" },
  { value: "60_days", label: "60 días (2 meses)", labelEn: "60 days (2 months)" },
  { value: "90_days", label: "90 días (3 meses)", labelEn: "90 days (3 months)" },
  { value: "continuous", label: "Tratamiento continuo", labelEn: "Continuous treatment" },
]

export function PrescriptionDrawer({
  isOpen,
  onOpenChange,
  items,
  onItemsChange,
  patientName,
  appointmentId,
  isSpanish = true,
}: PrescriptionDrawerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [newItem, setNewItem] = useState<Partial<PrescriptionItem>>({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  })

  const addItem = () => {
    if (!newItem.name || !newItem.dosage || !newItem.frequency || !newItem.duration) {
      toast.error(
        isSpanish 
          ? "Completa todos los campos requeridos" 
          : "Complete all required fields"
      )
      return
    }

    const item: PrescriptionItem = {
      id: crypto.randomUUID(),
      name: newItem.name,
      dosage: newItem.dosage,
      frequency: newItem.frequency,
      duration: newItem.duration,
      instructions: newItem.instructions,
    }

    onItemsChange([...items, item])
    setNewItem({
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    })

    toast.success(isSpanish ? "Medicamento agregado" : "Medication added")
  }

  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id))
  }

  const getFrequencyLabel = (value: string) => {
    const option = FREQUENCY_OPTIONS.find((o) => o.value === value)
    return isSpanish ? option?.label : option?.labelEn
  }

  const getDurationLabel = (value: string) => {
    const option = DURATION_OPTIONS.find((o) => o.value === value)
    return isSpanish ? option?.label : option?.labelEn
  }

  const generatePDF = async () => {
    if (items.length === 0) {
      toast.error(
        isSpanish 
          ? "Agrega al menos un medicamento" 
          : "Add at least one medication"
      )
      return
    }

    setIsGenerating(true)
    try {
      // Generate PDF using browser's print functionality
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        throw new Error("Could not open print window")
      }

      const currentDate = new Date().toLocaleDateString(isSpanish ? "es-CL" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })

      const medicationsHTML = items.map((item, index) => `
        <div style="margin-bottom: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; border-left: 3px solid #0d9488;">
          <div style="font-weight: 600; font-size: 15px; color: #1e293b; margin-bottom: 4px;">
            ${index + 1}. ${item.name}
          </div>
          <div style="font-size: 14px; color: #475569;">
            <strong>${isSpanish ? "Dosis:" : "Dosage:"}</strong> ${item.dosage}
          </div>
          <div style="font-size: 14px; color: #475569;">
            <strong>${isSpanish ? "Frecuencia:" : "Frequency:"}</strong> ${getFrequencyLabel(item.frequency)}
          </div>
          <div style="font-size: 14px; color: #475569;">
            <strong>${isSpanish ? "Duración:" : "Duration:"}</strong> ${getDurationLabel(item.duration)}
          </div>
          ${item.instructions ? `
            <div style="font-size: 13px; color: #64748b; margin-top: 6px; font-style: italic;">
              ${item.instructions}
            </div>
          ` : ""}
        </div>
      `).join("")

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${isSpanish ? "Receta Médica" : "Medical Prescription"} - NUREA</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              color: #1e293b;
              line-height: 1.5;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0d9488;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .logo {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            
            .logo-icon {
              width: 48px;
              height: 48px;
              background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 700;
              font-size: 20px;
            }
            
            .logo-text {
              font-size: 28px;
              font-weight: 700;
              color: #0d9488;
              letter-spacing: -0.5px;
            }
            
            .date {
              text-align: right;
              color: #64748b;
              font-size: 14px;
            }
            
            .title {
              text-align: center;
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 8px;
              color: #1e293b;
            }
            
            .subtitle {
              text-align: center;
              font-size: 14px;
              color: #64748b;
              margin-bottom: 30px;
            }
            
            .patient-info {
              background: #f0fdfa;
              border-radius: 12px;
              padding: 16px 20px;
              margin-bottom: 24px;
            }
            
            .patient-info h3 {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #0d9488;
              margin-bottom: 4px;
            }
            
            .patient-info p {
              font-size: 18px;
              font-weight: 600;
              color: #1e293b;
            }
            
            .medications-title {
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #64748b;
              margin-bottom: 16px;
              font-weight: 600;
            }
            
            .medications {
              margin-bottom: 40px;
            }
            
            .signature-section {
              margin-top: 60px;
              display: flex;
              justify-content: flex-end;
            }
            
            .signature-box {
              text-align: center;
              width: 250px;
            }
            
            .signature-line {
              border-top: 1px solid #94a3b8;
              margin-bottom: 8px;
              margin-top: 60px;
            }
            
            .signature-text {
              font-size: 12px;
              color: #64748b;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
            }
            
            @media print {
              body {
                padding: 20px;
              }
              
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <div class="logo-icon">N</div>
              <span class="logo-text">NUREA</span>
            </div>
            <div class="date">
              ${currentDate}
            </div>
          </div>
          
          <h1 class="title">${isSpanish ? "Receta Médica" : "Medical Prescription"}</h1>
          <p class="subtitle">${isSpanish ? "Documento válido para dispensación en farmacias" : "Valid document for pharmacy dispensing"}</p>
          
          <div class="patient-info">
            <h3>${isSpanish ? "Paciente" : "Patient"}</h3>
            <p>${patientName}</p>
          </div>
          
          <div class="medications">
            <h3 class="medications-title">${isSpanish ? "Medicamentos Prescritos" : "Prescribed Medications"}</h3>
            ${medicationsHTML}
          </div>
          
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <p class="signature-text">${isSpanish ? "Firma y Timbre del Profesional" : "Professional Signature & Stamp"}</p>
              <p class="signature-text" style="margin-top: 4px; font-weight: 500;">RNPI: _____________</p>
            </div>
          </div>
          
          <div class="footer">
            <p>${isSpanish ? "Receta generada a través de NUREA - Plataforma de Telemedicina" : "Prescription generated through NUREA - Telemedicine Platform"}</p>
            <p style="margin-top: 4px;">www.nurea.app • ${isSpanish ? "Ref:" : "Ref:"} ${appointmentId.slice(0, 8).toUpperCase()}</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `)

      printWindow.document.close()

      toast.success(
        isSpanish 
          ? "Receta generada correctamente" 
          : "Prescription generated successfully",
        { icon: <CheckCircle2 className="h-4 w-4" /> }
      )
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error(
        isSpanish 
          ? "Error al generar la receta" 
          : "Error generating prescription"
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-hidden flex flex-col">
        <SheetHeader className="shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-emerald-600" />
            {isSpanish ? "Crear Receta Médica" : "Create Prescription"}
          </SheetTitle>
          <SheetDescription>
            {isSpanish 
              ? `Receta para ${patientName}` 
              : `Prescription for ${patientName}`}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 mt-6">
          <div className="space-y-6 pb-6">
            {/* Add New Medication Form */}
            <Card className="border-dashed border-2 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  <Plus className="h-4 w-4" />
                  {isSpanish ? "Agregar Medicamento" : "Add Medication"}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">
                      {isSpanish ? "Nombre del medicamento *" : "Medication name *"}
                    </Label>
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder={isSpanish ? "Ej: Sertralina" : "E.g.: Sertraline"}
                      className="h-9 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">
                      {isSpanish ? "Dosis *" : "Dosage *"}
                    </Label>
                    <Input
                      value={newItem.dosage}
                      onChange={(e) => setNewItem({ ...newItem, dosage: e.target.value })}
                      placeholder={isSpanish ? "Ej: 50mg" : "E.g.: 50mg"}
                      className="h-9 text-sm mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">
                        {isSpanish ? "Frecuencia *" : "Frequency *"}
                      </Label>
                      <Select
                        value={newItem.frequency}
                        onValueChange={(v) => setNewItem({ ...newItem, frequency: v })}
                      >
                        <SelectTrigger className="h-9 text-sm mt-1">
                          <SelectValue placeholder={isSpanish ? "Seleccionar" : "Select"} />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {isSpanish ? opt.label : opt.labelEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">
                        {isSpanish ? "Duración *" : "Duration *"}
                      </Label>
                      <Select
                        value={newItem.duration}
                        onValueChange={(v) => setNewItem({ ...newItem, duration: v })}
                      >
                        <SelectTrigger className="h-9 text-sm mt-1">
                          <SelectValue placeholder={isSpanish ? "Seleccionar" : "Select"} />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {isSpanish ? opt.label : opt.labelEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">
                      {isSpanish ? "Instrucciones adicionales" : "Additional instructions"}
                    </Label>
                    <Textarea
                      value={newItem.instructions}
                      onChange={(e) => setNewItem({ ...newItem, instructions: e.target.value })}
                      placeholder={isSpanish ? "Ej: Tomar con alimentos" : "E.g.: Take with food"}
                      className="h-16 text-sm mt-1 resize-none"
                    />
                  </div>

                  <Button 
                    onClick={addItem}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isSpanish ? "Agregar a la receta" : "Add to prescription"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Items */}
            {items.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {isSpanish ? "Medicamentos en la receta" : "Medications in prescription"}
                  </h4>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <Card key={item.id} className="bg-slate-50 dark:bg-slate-900/50">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs shrink-0">
                                {index + 1}
                              </Badge>
                              <span className="font-medium text-sm truncate">
                                {item.name}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                              <p>{item.dosage} • {getFrequencyLabel(item.frequency)}</p>
                              <p>{getDurationLabel(item.duration)}</p>
                              {item.instructions && (
                                <p className="italic text-slate-400">{item.instructions}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {items.length === 0 && (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                <Pill className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {isSpanish 
                    ? "Agrega medicamentos a la receta" 
                    : "Add medications to the prescription"}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        <div className="shrink-0 space-y-3">
          <Button
            onClick={generatePDF}
            disabled={items.length === 0 || isGenerating}
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isSpanish ? "Generar PDF de Receta" : "Generate Prescription PDF"}
          </Button>

          {items.length > 0 && (
            <p className="text-xs text-center text-slate-400">
              {isSpanish 
                ? "El PDF se abrirá en una nueva ventana para imprimir o guardar" 
                : "PDF will open in a new window for printing or saving"}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
