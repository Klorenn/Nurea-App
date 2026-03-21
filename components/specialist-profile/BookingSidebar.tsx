'use client'

import { useState } from 'react'
import { Calendar, Video, MapPin, Info, ShieldCheck, Clock, Banknote, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { AvailabilityPreview } from '@/components/professionals/premium/AvailabilityPreview'
import type { SpecialistService } from '@/lib/specialist-profile-types'

export type BookingMode = 'online' | 'in-person'

export interface BookingSidebarProps {
  professionalId: string
  services: SpecialistService[]
  defaultPrice: number
  defaultDuration?: number
  currency?: string
  hasOnline?: boolean
  hasInPerson?: boolean
  insuranceOptions?: string[]
  paymentMethods?: string[]
  isSpanish?: boolean
  onBook: () => void
  noAvailability?: boolean
}

/** Derive the locked modality from a service. Returns null if the user can choose freely. */
function getLockedMode(service: SpecialistService | null): BookingMode | null {
  if (!service || !service.modality || service.modality === 'both') return null
  return service.modality as BookingMode
}

/** Default mode when no lock: prefer online, fallback in-person */
function defaultMode(hasOnline: boolean, hasInPerson: boolean): BookingMode {
  return hasOnline ? 'online' : 'in-person'
}

export function BookingSidebar({
  professionalId,
  services,
  defaultPrice,
  defaultDuration = 60,
  currency = 'CLP',
  hasOnline = true,
  hasInPerson = false,
  insuranceOptions = [],
  paymentMethods = [],
  isSpanish = true,
  onBook,
  noAvailability = false,
}: BookingSidebarProps) {
  const [selectedService, setSelectedService] = useState<SpecialistService | null>(
    services[0] ?? null
  )
  const [freeMode, setFreeMode] = useState<BookingMode>(defaultMode(hasOnline, hasInPerson))
  const [insurance, setInsurance] = useState<string>(insuranceOptions[0] ?? '')

  // The locked mode from the selected service (null = user can choose)
  const lockedMode = getLockedMode(selectedService)
  const mode: BookingMode = lockedMode ?? freeMode

  const handleServiceChange = (id: string) => {
    const s = services.find((svc) => svc.id === id) ?? null
    setSelectedService(s)
    // If new service has a specific modality, update freeMode for when user later selects 'both'
    const lock = getLockedMode(s)
    if (!lock) {
      // keep current freeMode
    }
  }

  const price = selectedService?.price ?? defaultPrice
  const duration = selectedService?.durationMinutes ?? defaultDuration
  const hasServices = services.length > 0
  // Show modality section only if the professional has both modalities configured
  const canChooseModality = hasOnline && hasInPerson

  return (
    <aside className="sticky top-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:border-slate-800 dark:bg-slate-900">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 px-6 py-5">
        <p className="mb-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-teal-200">
          {isSpanish ? 'Agenda tu cita' : 'Book your appointment'}
        </p>
        <h2 className="text-xl font-bold leading-tight text-white">
          {isSpanish ? 'Reservar consulta' : 'Book consultation'}
        </h2>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">

        {/* ── Tipo de consulta ───────────────────────────────── */}
        <div className="px-5 py-4">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {isSpanish ? 'Tipo de consulta' : 'Consultation type'}
          </p>

          {!hasServices ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center dark:border-slate-700 dark:bg-slate-800/40">
              <p className="text-sm text-slate-400">
                {isSpanish ? 'Sin consultas configuradas aún.' : 'No consultations configured yet.'}
              </p>
            </div>
          ) : services.length === 1 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {services[0].name}
              </p>
            </div>
          ) : (
            <Select value={selectedService?.id ?? ''} onValueChange={handleServiceChange}>
              <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-700">
                <SelectValue placeholder={isSpanish ? 'Elegir consulta' : 'Choose consultation'} />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="flex items-center gap-2">
                      {s.modality === 'online' && <Video className="h-3.5 w-3.5 text-teal-600" />}
                      {s.modality === 'in-person' && <MapPin className="h-3.5 w-3.5 text-slate-500" />}
                      {(!s.modality || s.modality === 'both') && <span className="h-3.5 w-3.5" />}
                      {s.name}
                      <span className="ml-auto text-xs text-slate-400">
                        {s.price === 0 ? (isSpanish ? 'Gratis' : 'Free') : `$${s.price.toLocaleString('es-CL')}`}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Price + Duration */}
          {hasServices && (
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="mb-0.5 text-[11px] text-slate-400">
                  {isSpanish ? 'Valor de la consulta' : 'Consultation fee'}
                </p>
                {price === 0 ? (
                  <p className="text-3xl font-bold tracking-tight text-teal-600 dark:text-teal-400">
                    {isSpanish ? 'Gratis' : 'Free'}
                  </p>
                ) : (
                  <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    ${price.toLocaleString('es-CL')}
                    <span className="ml-1.5 text-sm font-normal text-slate-400">{currency}</span>
                  </p>
                )}
              </div>
              <div className="mb-1 flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{duration} min</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Modalidad ──────────────────────────────────────── */}
        {canChooseModality && (
          <div className="px-5 py-4">
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                {isSpanish ? 'Modalidad' : 'Mode'}
              </p>
              {lockedMode && (
                <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                  <Lock className="h-3 w-3" />
                  {isSpanish ? 'Fijada por el servicio' : 'Set by service'}
                </span>
              )}
              {!lockedMode && (
                <span className="group relative inline-flex cursor-help">
                  <Info className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-slate-500" />
                  <span className="pointer-events-none absolute right-0 top-full z-30 mt-2 w-64 rounded-xl bg-slate-900 px-4 py-3 text-xs leading-relaxed text-slate-100 shadow-2xl opacity-0 transition-opacity group-hover:opacity-100">
                    {isSpanish
                      ? 'La consulta online funciona igual que una visita presencial, pero por videollamada segura desde donde tú estés.'
                      : 'Online consultations work like an in-person visit, but over a secure video call.'}
                  </span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* In-person */}
              <button
                type="button"
                disabled={lockedMode === 'online'}
                onClick={() => !lockedMode && setFreeMode('in-person')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all duration-150',
                  mode === 'in-person'
                    ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm dark:border-teal-600 dark:bg-teal-900/30 dark:text-teal-300'
                    : lockedMode === 'online'
                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400'
                )}
              >
                <MapPin className="h-4 w-4" />
                {isSpanish ? 'Presencial' : 'In-person'}
                {lockedMode === 'in-person' && <Lock className="h-3 w-3 text-teal-500" />}
              </button>

              {/* Online */}
              <button
                type="button"
                disabled={lockedMode === 'in-person'}
                onClick={() => !lockedMode && setFreeMode('online')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all duration-150',
                  mode === 'online'
                    ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm dark:border-teal-600 dark:bg-teal-900/30 dark:text-teal-300'
                    : lockedMode === 'in-person'
                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400'
                )}
              >
                <Video className="h-4 w-4" />
                Online
                {lockedMode === 'online' && <Lock className="h-3 w-3 text-teal-500" />}
              </button>
            </div>
          </div>
        )}

        {/* ── Previsión ──────────────────────────────────────── */}
        {insuranceOptions.length > 0 && (
          <div className="px-5 py-4">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              {isSpanish ? 'Previsión' : 'Insurance'}
            </p>
            <Select value={insurance} onValueChange={setInsurance}>
              <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {insuranceOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* ── Horarios ───────────────────────────────────────── */}
        <div className="px-5 py-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {isSpanish ? 'Horarios disponibles' : 'Available times'}
          </p>
          {noAvailability ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">
              {isSpanish ? 'El profesional aún no ha configurado su horario.' : 'Schedule not configured yet.'}
            </p>
          ) : (
            <AvailabilityPreview
              professionalId={professionalId}
              days={5}
              maxSlotsPerDay={5}
              isSpanish={isSpanish}
              useProfessionalsApi
            />
          )}
        </div>

        {/* ── Métodos de pago ────────────────────────────────── */}
        {paymentMethods.length > 0 && (
          <div className="px-5 py-4">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              {isSpanish ? 'Métodos de pago' : 'Payment methods'}
            </p>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Banknote className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  {method}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA ────────────────────────────────────────────── */}
        <div className="space-y-3 px-5 py-4">
          <Button
            onClick={onBook}
            className="h-12 w-full rounded-xl bg-teal-600 text-base font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-[0.985]"
          >
            <Calendar className="mr-2 h-5 w-5" />
            {isSpanish ? 'Reservar consulta' : 'Book consultation'}
          </Button>

          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <p className="text-center text-xs text-slate-400 dark:text-slate-500">
              {isSpanish
                ? 'El pago se coordina directamente con el especialista.'
                : 'Payment is coordinated directly with the specialist.'}
            </p>
          </div>
        </div>

      </div>
    </aside>
  )
}
