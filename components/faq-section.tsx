"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"

export function FaqSection() {
  const { language } = useLanguage()
  const t = useTranslations(language)

  const faqs = language === "es" ? [
    {
      question: "¿Cómo encuentro al profesional de salud adecuado?",
      answer:
        "Puedes buscar por especialidad, ubicación o cobertura de seguro. Cada profesional tiene un perfil completo con reseñas, disponibilidad y precios. También puedes filtrar por tipo de consulta (online o presencial).",
    },
    {
      question: "¿Necesito tener seguro de salud para usar NUREA?",
      answer:
        "No necesariamente. Muchos profesionales aceptan pagos directos. Sin embargo, algunos profesionales trabajan con seguros como FONASA o ISAPRE. Puedes filtrar por profesionales que aceptan tu seguro.",
    },
    {
      question: "¿Cómo funcionan las consultas online?",
      answer:
        "Las consultas online se realizan a través de nuestra plataforma segura de video. Recibirás un enlace de reunión antes de tu cita. Solo necesitas una conexión a internet estable y un dispositivo con cámara.",
    },
    {
      question: "¿Puedo cancelar o reprogramar una cita?",
      answer:
        "Sí, puedes cancelar o reprogramar tu cita desde tu panel de control. Las políticas de cancelación varían según el profesional, pero generalmente puedes hacer cambios con al menos 24 horas de anticipación.",
    },
    {
      question: "¿Qué hace que NUREA sea diferente de otras plataformas?",
      answer:
        "NUREA se enfoca en la conexión humana y la confianza. Todos nuestros profesionales son verificados, y la plataforma está diseñada pensando en el paciente. Ofrecemos herramientas completas para gestionar tu salud de manera integral.",
    },
    {
      question: "¿Cómo funciona NUREA?",
      answer:
        "NUREA conecta pacientes con profesionales de la salud. La coordinación y el pago de la consulta se realizan directamente con el especialista a través del chat seguro de la plataforma.",
    },
    {
      question: "¿Qué documentos necesito para verificarme como profesional?",
      answer:
        "Para garantizar la seguridad de los pacientes, solicitamos tu Cédula de Identidad (ambos lados) y el certificado de la Superintendencia de Salud (SIS). Una vez validados, obtendrás el sello de verificación en tu perfil.",
    },
    {
      question: "¿Cómo pago mi consulta?",
      answer:
        "El pago de la consulta se coordina directamente con el especialista (por ejemplo por chat: enlace de pago externo, transferencia o instrucciones que te indique). NUREA no cobra ni procesa el pago de la consulta; solo conecta y facilita la comunicación y la agenda.",
    },
    {
      question: "¿Puedo cancelar mi suscripción en cualquier momento?",
      answer:
        "Absolutamente. Puedes cancelar tu suscripción en cualquier momento con un solo clic. Sin complicaciones, sin preguntas. Tu acceso continúa hasta el final de tu período de facturación actual.",
    },
  ] : [
    {
      question: "How do I find the right healthcare professional?",
      answer:
        "You can search by specialty, location, or insurance coverage. Each professional has a complete profile with reviews, availability, and prices. You can also filter by consultation type (online or in-person).",
    },
    {
      question: "Do I need health insurance to use NUREA?",
      answer:
        "Not necessarily. Many professionals accept direct payments. However, some professionals work with insurances like FONASA or ISAPRE. You can filter by professionals who accept your insurance.",
    },
    {
      question: "How do online consultations work?",
      answer:
        "Online consultations are conducted through our secure video platform. You'll receive a meeting link before your appointment. You just need a stable internet connection and a device with a camera.",
    },
    {
      question: "Can I cancel or reschedule an appointment?",
      answer:
        "Yes, you can cancel or reschedule your appointment from your dashboard. Cancellation policies vary by professional, but generally you can make changes with at least 24 hours notice.",
    },
    {
      question: "What makes NUREA different from other platforms?",
      answer:
        "NUREA focuses on human connection and trust. All our professionals are verified, and the platform is designed with the patient in mind. We offer comprehensive tools to manage your health holistically.",
    },
    {
      question: "How does NUREA work?",
      answer:
        "NUREA connects patients with healthcare professionals. Appointment coordination and consultation payment are done directly with the specialist through the platform's secure chat.",
    },
    {
      question: "What documents do I need to be verified as a professional?",
      answer:
        "To ensure patient safety, we request your ID Card (both sides) and the certificate from the Superintendency of Health (SIS). Once validated, you will get the verification seal on your profile.",
    },
    {
      question: "How do I pay for my consultation?",
      answer:
        "Consultation payment is coordinated directly with the specialist (e.g. via chat: external payment link, bank transfer, or instructions they provide). NUREA does not charge or process consultation payments; it only connects you and facilitates communication and scheduling.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Absolutely. You can cancel your subscription at any time with just one click. No hassles, no questions asked. Your access continues until the end of your current billing period.",
    },
  ]

  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-transparent relative" aria-labelledby="faq-title">
      <div className="max-w-3xl mx-auto w-full min-w-0">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-sm font-medium text-white mb-2">{t.landing.faq.questions}</p>
          <h2 id="faq-title" className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-white mb-4 break-words">
            {t.landing.faq.title}
          </h2>
          <p className="text-lg text-white/90 break-words">{t.landing.faq.subtitle}</p>
        </div>

        <Accordion type="single" collapsible className="w-full" aria-label={language === "es" ? "Preguntas frecuentes" : "Frequently asked questions"}>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-base font-medium text-white hover:text-white/80 focus-visible:text-white/90 focus-visible:ring-white/20">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-white/90">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
