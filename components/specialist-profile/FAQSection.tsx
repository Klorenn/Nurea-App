'use client'

import { HelpCircle } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQSectionProps {
  faqs: FAQItem[]
  isSpanish?: boolean
  className?: string
}

/**
 * FAQ: expandable questions (¿Cómo sé si necesito terapia?, etc.).
 */
export function FAQSection({
  faqs,
  isSpanish = true,
  className,
}: FAQSectionProps) {
  if (faqs.length === 0) return null

  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50',
        className
      )}
      aria-labelledby="faq-heading"
    >
      <h2
        id="faq-heading"
        className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white"
      >
        <HelpCircle className="h-5 w-5 text-teal-600" />
        {isSpanish ? 'Preguntas frecuentes' : 'FAQ'}
      </h2>
      <Accordion type="single" collapsible className="mt-4">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-sm font-medium text-slate-900 hover:no-underline dark:text-white">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-slate-600 dark:text-slate-400">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
