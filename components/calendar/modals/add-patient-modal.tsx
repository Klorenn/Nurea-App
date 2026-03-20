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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "sonner"
import { Loader2, UserPlus, Mail, Phone, Calendar as CalendarIcon, Plus } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

const formSchema = z.object({
  firstName: z.string().min(2, "El nombre es obligatorio"),
  lastName: z.string().min(2, "El apellido es obligatorio"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
})

interface AddPatientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (patientId: string) => void
}

export function AddPatientModal({ open, onOpenChange, onSuccess }: AddPatientModalProps) {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [loading, setLoading] = React.useState(false)
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const response = await fetch("/api/professional/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Error al crear paciente")

      toast.success(isSpanish ? "Paciente creado correctamente" : "Patient created successfully")
      
      // Invalidar cache para actualizar lista de pacientes inmediatamente
      queryClient.invalidateQueries({ queryKey: ['/api/professional/patients'] })
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      
      onSuccess(data.patientId)
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
        <div className="bg-teal-600 p-8 text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">{isSpanish ? "Nuevo Paciente" : "New Patient"}</DialogTitle>
          <DialogDescription className="text-white/70 font-medium">
            {isSpanish ? "Añade un paciente a tu base de datos para agendar citas." : "Add a patient to your database to schedule appointments."}
          </DialogDescription>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isSpanish ? "Nombre" : "First Name"}</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} className="rounded-xl h-12 bg-slate-50 border-slate-100 focus:ring-2 focus:ring-teal-500/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isSpanish ? "Apellido" : "Last Name"}</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} className="rounded-xl h-12 bg-slate-50 border-slate-100 focus:ring-2 focus:ring-teal-500/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input placeholder="john@example.com" {...field} className="pl-11 rounded-xl h-12 bg-slate-50 border-slate-100 focus:ring-2 focus:ring-teal-500/20" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isSpanish ? "Teléfono" : "Phone"}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="+56 9..." {...field} className="pl-11 rounded-xl h-12 bg-slate-50 border-slate-100 focus:ring-2 focus:ring-teal-500/20" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isSpanish ? "F. Nacimiento" : "Birth Date"}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input type="date" {...field} className="pl-11 rounded-xl h-12 bg-slate-50 border-slate-100 focus:ring-2 focus:ring-teal-500/20" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 font-black shadow-lg shadow-teal-500/20">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {isSpanish ? "Crear Paciente" : "Create Patient"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
