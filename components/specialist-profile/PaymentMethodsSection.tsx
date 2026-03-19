'use client'

import { CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentMethodsSectionProps {
  methods: string[]
  isSpanish?: boolean
  className?: string
}

/**
 * "Formas de pago": muestra cómo puede pagar el paciente (Transferencia, Efectivo, etc.).
 */
export function PaymentMethodsSection({
  methods,
  isSpanish = true,
  className,
}: PaymentMethodsSectionProps) {
  if (!methods || methods.length === 0) return null

  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50',
        className
      )}
      aria-labelledby="payments-heading"
    >
      <h2
        id="payments-heading"
        className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white"
      >
        <CreditCard className="h-5 w-5 text-teal-600" />
        {isSpanish ? 'Formas de pago' : 'Payment methods'}
      </h2>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {isSpanish
          ? 'El pago se realiza directamente con el profesional, según las opciones indicadas.'
          : 'Payment is made directly to the professional using the options below.'}
      </p>
      <ul className="mt-3 flex flex-wrap gap-2 text-sm text-slate-700 dark:text-slate-300">
        {methods.map((m) => (
          <li
            key={m}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 dark:border-slate-700 dark:bg-slate-800"
          >
            {m}
          </li>
        ))}
      </ul>
    </section>
  )
}

