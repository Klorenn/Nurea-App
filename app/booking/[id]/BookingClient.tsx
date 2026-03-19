"use client"

import { useState } from "react"
import { BookingModal } from "@/components/booking-modal"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, Calendar as CalendarIcon, Clock, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VerifiedBadge } from "@/components/verified-badge"

interface BookingClientProps {
  professional: any
}

export default function BookingClient({ professional }: BookingClientProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(true)

  const isSpanish = true // Default for now or detect from context

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Finalizar Reserva
          </h1>
          <p className="text-slate-500">
            Estás agendando una cita con {professional.name}
          </p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <Avatar className="h-24 w-24 rounded-3xl border-4 border-white shadow-lg">
                <AvatarImage src={professional.imageUrl} />
                <AvatarFallback>{professional.name?.[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{professional.name}</h2>
                  {professional.verified && <VerifiedBadge variant="compact" isSpanish={isSpanish} />}
                </div>
                <p className="text-slate-500 font-medium mb-4">{professional.specialty}</p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-teal-600" />
                    <span>Próxima disponibilidad hoy</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-teal-600" />
                    <span>60 min / sesión</span>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-auto">
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
                >
                  Abrir Calendario
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex items-center justify-center gap-4 text-slate-400 text-sm">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Pago Seguro Mercado Pago</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>+1000 pacientes atendidos</span>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        professionalId={professional.id}
        professionalName={professional.name}
        stellarWallet={professional.stellar_wallet}
        offersInPerson={professional.consultationTypes?.includes("in-person")}
        isSpanish={isSpanish}
      />
      
      <Footer />
    </main>
  )
}
