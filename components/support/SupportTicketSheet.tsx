"use client"

import React, { useState } from 'react'
import { 
  HelpCircle, 
  Send, 
  MessageSquare, 
  LifeBuoy, 
  Loader2, 
  CheckCircle2,
  X
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { motion, AnimatePresence } from "framer-motion"

export function SupportTicketSheet() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Debes iniciar sesión para enviar un ticket")
      return
    }

    if (!subject.trim() || !message.trim()) {
      toast.error("Por favor completa todos los campos")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: subject.trim(),
          message: message.trim(),
          priority: 'medium',
          user_role: user.user_metadata?.role || 'patient'
        })

      if (error) throw error

      setSuccess(true)
      setSubject("")
      setMessage("")
      toast.success("Ticket enviado con éxito")
      
      setTimeout(() => {
        setSuccess(false)
        setOpen(false)
      }, 2500)
    } catch (err) {
      console.error("Error sending support ticket:", err)
      toast.error("Error al enviar el ticket. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-2xl shadow-teal-500/30 z-[60] group flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          aria-label="Ayuda"
        >
          <HelpCircle className="h-7 w-7 transition-transform group-hover:rotate-12" />
          <span className="absolute right-full mr-4 bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
            ¿Necesitas ayuda?
          </span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="sm:max-w-md border-l border-slate-200 dark:border-slate-800 p-0 overflow-hidden">
        <div className="h-full flex flex-col bg-white dark:bg-slate-950">
          <SheetHeader className="p-8 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-teal-100 dark:bg-teal-900/40 p-2 rounded-xl">
                <LifeBuoy className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-white">Centro de Ayuda</SheetTitle>
            </div>
            <SheetDescription className="text-slate-500 dark:text-slate-400">
              Nuestro equipo técnico responderá a tu solicitud en menos de 12 horas.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full mb-2">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ticket Enviado</h3>
                  <p className="text-slate-500 max-w-[240px]">
                    Hemos recibido tu mensaje. Pronto nos pondremos en contacto contigo vía email.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-bold text-slate-700 dark:text-slate-300">Asunto</Label>
                    <Input
                      id="subject"
                      placeholder="Ej: Problema con la agenda"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={loading}
                      className="rounded-xl border-slate-200 focus:ring-teal-500 h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-bold text-slate-700 dark:text-slate-300">Mensaje</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe tu problema o duda con el mayor detalle posible..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={loading}
                      className="min-h-[180px] rounded-xl border-slate-200 focus:ring-teal-500 resize-none py-4"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg transition-all active:scale-[0.98]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Enviar Ticket
                        </>
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div className="p-8 border-t border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10">
            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
              <MessageSquare className="h-4 w-4" />
              <span>También puedes enviarnos un mensaje vía WhatsApp si es urgente.</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
