'use client'

import { useState } from 'react'
import { Calendar, Check, Video, MapPin, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  isSpanish?: boolean
  onBook: () => void
  /** When true, show no slots message instead of calendar */
  noAvailability?: boolean
}

/**
 * Sticky booking sidebar: mode toggle, service selector, price, insurance, first visit, calendar, CTA.
 * Step-by-step feel with checkmarks. Handles no-availability state.
 */
export function BookingSidebar({
  professionalId,
  services,
  defaultPrice,
  defaultDuration = 60,
  currency = 'CLP',
  hasOnline = true,
  hasInPerson = false,
  insuranceOptions = [],
  isSpanish = true,
  onBook,
  noAvailability = false,
}: BookingSidebarProps) {
  const [mode, setMode] = useState<BookingMode>(hasOnline ? 'online' : 'in-person')
  const [selectedService, setSelectedService] = useState<SpecialistService | null>(
    services[0] ?? null
  )
  const [insurance, setInsurance] = useState<string>(insuranceOptions[0] ?? '')
  const [firstVisit, setFirstVisit] = useState<'yes' | 'no'>('yes')

  const price = selectedService?.price ?? defaultPrice
  const duration = selectedService?.durationMinutes ?? defaultDuration
  const isPriceConfigured = price > 0
  const isScheduleConfigured = !noAvailability

  return (
    <aside className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900/50 overflow-hidden">
      <div className="bg-teal-600 px-4 py-3 text-center">
        <h2 className="text-base font-semibold text-white">
          {isSpanish ? 'Agendar cita' : 'Book appointment'}
        </h2>
      </div>

      <div className="space-y-5 p-4">
        {/* 1. Mode: Online / Presencial */}
        {(hasOnline || hasInPerson) && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50">
              <Check className="h-3.5 w-3.5 text-teal-600" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                {isSpanish ? 'Modalidad' : 'Mode'}
              </p>
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-700">
                {hasInPerson && (
                  <button
                    type="button"
                    onClick={() => setMode('in-person')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors',
                      mode === 'in-person'
                        ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                        : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    <MapPin className="h-4 w-4" />
                    {isSpanish ? 'Presencial' : 'In-person'}
                  </button>
                )}
                {hasOnline && (
                  <button
                    type="button"
                    onClick={() => setMode('online')}
                    className={cn(
                      'relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors',
                      mode === 'online'
                        ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                        : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    <Video className="h-4 w-4" />
                    {isSpanish ? 'Online' : 'Online'}
                    <span className="group relative inline-flex">
                      <Info className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" />
                      <span className="pointer-events-none absolute right-0 top-full z-30 mt-2 w-64 rounded-xl bg-slate-900 px-4 py-3 text-xs leading-relaxed font-normal text-slate-50 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        {isSpanish
                          ? 'La consulta online funciona igual que una visita presencial, pero por videollamada segura desde donde tú estés.'
                          : 'Online consultations work like an in-person visit, but over a secure video call from wherever you are.'}
                      </span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Service selector + Price (BIG) */}
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
              isPriceConfigured
                ? 'bg-teal-100 dark:bg-teal-900/50'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
            )}
          >
            <Check
              className={cn(
                'h-3.5 w-3.5',
                isPriceConfigured ? 'text-teal-600' : 'text-slate-400'
              )}
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              {isSpanish ? 'Servicio' : 'Service'}
            </p>
            {services.length > 0 ? (
              <Select
                value={selectedService?.id ?? ''}
                onValueChange={(id) => {
                  const s = services.find((s) => s.id === id)
                  if (s) setSelectedService(s)
                }}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder={isSpanish ? 'Elegir servicio' : 'Choose service'} />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} · ${s.price.toLocaleString('es-CL')} {s.currency ?? currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {isSpanish ? 'Consulta' : 'Consultation'} · ${defaultPrice.toLocaleString('es-CL')} {currency}
                </span>
              </div>
            )}
            {isPriceConfigured ? (
              <>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  ${price.toLocaleString('es-CL')}{' '}
                  <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{currency}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {duration} {isSpanish ? 'min' : 'min'}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {isSpanish ? 'Horario o precio aún no configurados.' : 'Schedule or price not configured yet.'}
              </p>
            )}
          </div>
        </div>

        {/* 3. Insurance / Previsión */}
        {insuranceOptions.length > 0 && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50">
              <Check className="h-3.5 w-3.5 text-teal-600" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                {isSpanish ? 'Previsión' : 'Insurance'}
              </p>
              <Select value={insurance} onValueChange={setInsurance}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {insuranceOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* 4. First visit? */}
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
              firstVisit === 'yes'
                ? 'bg-teal-100 dark:bg-teal-900/50'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
            )}
          >
            <Check
              className={cn(
                'h-3.5 w-3.5',
                firstVisit === 'yes' ? 'text-teal-600' : 'text-slate-400 dark:text-slate-500'
              )}
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              {isSpanish ? '¿Primera vez?' : 'First visit?'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFirstVisit('yes')}
                className={cn(
                  'flex-1 rounded-xl border py-2 text-sm font-medium transition-colors',
                  firstVisit === 'yes'
                    ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                    : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                )}
              >
                {isSpanish ? 'Sí' : 'Yes'}
              </button>
              <button
                type="button"
                onClick={() => setFirstVisit('no')}
                className={cn(
                  'flex-1 rounded-xl border py-2 text-sm font-medium transition-colors',
                  firstVisit === 'no'
                    ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                    : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                )}
              >
                {isSpanish ? 'No' : 'No'}
              </button>
            </div>
          </div>
        </div>

        {/* 5. Calendar / Slots */}
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50">
            <Check className="h-3.5 w-3.5 text-teal-600" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {isSpanish ? 'Horarios disponibles' : 'Available times'}
            </p>
            {noAvailability ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isSpanish ? 'Horario no configurado aún.' : 'Schedule not configured yet.'}
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
        </div>

        {/* CTA */}
        <Button
          onClick={onBook}
          className="w-full h-12 rounded-xl bg-teal-600 text-base font-semibold text-white shadow-sm hover:bg-teal-700"
        >
          <Calendar className="mr-2 h-5 w-5" />
          {isSpanish ? 'Agendar cita' : 'Book appointment'}
        </Button>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          {isSpanish ? 'Reserva segura. Puedes cancelar sin costo.' : 'Secure booking. You can cancel for free.'}
        </p>
      </div>
    </aside>
  )
}
