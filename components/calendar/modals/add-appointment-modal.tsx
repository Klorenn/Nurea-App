"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "sonner"
import { Loader2, Calendar as CalendarIcon, Clock, Video, Building2, Search, User, Check } from "lucide-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const formSchema = z.object({
  patientId: z.string().min(1, "Selecciona un paciente"),
  date: z.string().min(1, "La fecha es obligatoria"),
  time: z.string().min(1, "La hora es obligatoria"),
  type: z.enum(["online", "in-person"]),
  duration: z.string().min(1, "La duración es obligatoria"),
  notes: z.string().optional(),
})

interface Patient {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar_url?: string
}

interface AddAppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  patients: Patient[]
  initialDate?: Date
}

export function AddAppointmentModal({ 
  open, 
  onOpenChange, 
  onSuccess, 
  patients,
  initialDate 
}: AddAppointmentModalProps) {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [loading, setLoading] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      date: initialDate ? format(initialDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      time: initialDate ? format(initialDate, "HH:mm") : "09:00",
      type: "online",
      duration: "60",
      notes: "",
    },
  })

  // Sync date/time when initialDate changes (e.g., clicking a specific slot)
  React.useEffect(() => {
    if (initialDate) {
      form.setValue("date", format(initialDate, "yyyy-MM-dd"))
      form.setValue("time", format(initialDate, "HH:mm"))
    }
  }, [initialDate, form])

  const filteredPatients = patients.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const response = await fetch("/api/appointments/create-by-professional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Error al crear cita")

      toast.success(isSpanish ? "Cita agendada correctamente" : "Appointment scheduled successfully")
      onSuccess()
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
            <CalendarIcon className="h-6 w-6 text-teal-400" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">{isSpanish ? "Agendar Cita" : "Schedule Appointment"}</DialogTitle>
          <DialogDescription className="text-white/50 font-medium">
            {isSpanish ? "Asigna una hora a un paciente de tu base de datos." : "Assign a time to a patient from your database."}
          </DialogDescription>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
            
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isSpanish ? "Seleccionar Paciente" : "Select Patient"}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:ring-teal-500/20">
                        <SelectValue placeholder={isSpanish ? "Selecciona un paciente..." : "Select patient..."} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-slate-200">
                      <div className="p-2 border-b border-slate-50">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            placeholder={isSpanish ? "Buscar..." : "Search..."} 
                            className="pl-9 h-9 text-xs border-none bg-slate-50 focus:ring-0" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      {filteredPatients.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500">{isSpanish ? "No hay resultados" : "No results"}</div>
                      ) : (
                        filteredPatients.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="rounded-xl h-12 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={p.avatar_url} />
                                <AvatarFallback className="bg-teal-100 text-teal-700 text-[10px] font-black">{p.first_name?.[0] ?? ""}{p.last_name?.[0] ?? ""}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-bold text-sm leading-none">{p.first_name} {p.last_name}</span>
                                <span className="text-[10px] text-slate-500">{p.email}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isSpanish ? "Fecha" : "Date"}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="rounded-xl h-12 bg-slate-50 border-slate-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isSpanish ? "Hora" : "Time"}</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="rounded-xl h-12 bg-slate-50 border-slate-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isSpanish ? "Tipo" : "Type"}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="online">{isSpanish ? "Videollamada" : "Video Call"}</SelectItem>
                        <SelectItem value="in-person">{isSpanish ? "Presencial" : "In-Person"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isSpanish ? "Duración (min)" : "Duration (min)"}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                        <SelectItem value="90">90 min</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 font-black shadow-lg shadow-teal-500/20">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                {isSpanish ? "Confirmar Cita" : "Confirm Appointment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
