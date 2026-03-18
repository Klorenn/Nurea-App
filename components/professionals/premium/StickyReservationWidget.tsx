"use client"

import { useState } from "react"
import { Calendar, Check, Video, MapPin, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AvailabilityPreview } from "./AvailabilityPreview"

interface StickyReservationWidgetProps {
  professionalId: string
  price: number
  currency?: string
  durationMinutes?: number
  serviceLabel?: string
  onBook: () => void
  hasTelemedicine?: boolean
  hasInPerson?: boolean
  isSpanish?: boolean
}

export function StickyReservationWidget({
  professionalId,
  price,
  currency = "CLP",
  durationMinutes = 60,
  serviceLabel,
  onBook,
  hasTelemedicine = true,
  hasInPerson = true,
  isSpanish = true,
}: StickyReservationWidgetProps) {
  const [modality, setModality] = useState<"online" | "in-person">(
    hasTelemedicine ? "online" : "in-person"
  )

  return (
    <div className="bg-slate-50/80 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-24">
      {/* Barra superior minimalista */}
      <div className="bg-teal-600 px-4 py-2.5 text-center">
        <h2 className="text-white font-medium text-sm">
          {isSpanish ? "Agendar cita" : "Book appointment"}
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Paso 1: Modalidad */}
        {(hasTelemedicine || hasInPerson) && (
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
              <Check className="h-3 w-3 text-teal-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                {hasInPerson && (
                  <button
                    type="button"
                    onClick={() => setModality("in-person")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors",
                      modality === "in-person"
                        ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <MapPin className="h-4 w-4" />
                    {isSpanish ? "Presencial" : "In-person"}
                  </button>
                )}
                {hasTelemedicine && (
                  <button
                    type="button"
                    onClick={() => setModality("online")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors",
                      modality === "online"
                        ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <Video className="h-4 w-4" />
                    {isSpanish ? "Online" : "Online"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Servicio y precio */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
            <Check className="h-3 w-3 text-teal-600" />
          </div>
          <div className="min-w-0 flex-1 flex items-center justify-between rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-800/50">
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {serviceLabel || (isSpanish ? "Consulta" : "Consultation")} · {price.toLocaleString("es-CL")} {currency}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
          </div>
        </div>

        {/* Disponibilidad: días en fila, slots bajo cada día */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
            <Check className="h-3 w-3 text-teal-600" />
          </div>
          <div className="min-w-0 flex-1">
            <AvailabilityPreview
              professionalId={professionalId}
              days={4}
              maxSlotsPerDay={5}
              isSpanish={isSpanish}
              // Use Supabase availability (same source of truth as the profile editor)
              useProfessionalsApi
            />
            <button
              type="button"
              className="mt-2 text-sm text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              {isSpanish ? "Mostrar más horas" : "Show more times"}
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={onBook}
          className="w-full h-11 rounded-md text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white border-0"
        >
          <Calendar className="h-4 w-4 mr-2 shrink-0" />
          {isSpanish ? "Agendar cita" : "Book appointment"}
        </Button>
      </div>
    </div>
  )
}
