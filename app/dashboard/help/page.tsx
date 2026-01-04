"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  HelpCircle, 
  Mail, 
  MessageCircle, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Heart,
  Users,
  Copy
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { motion, AnimatePresence } from "framer-motion"

interface FAQItem {
  question: string
  questionEn: string
  answer: string
  answerEn: string
}

const faqItems: FAQItem[] = [
  {
    question: "¿Qué es NUREA?",
    questionEn: "What is NUREA?",
    answer: "NUREA es una plataforma que conecta pacientes con profesionales de la salud. Actuamos como intermediario tecnológico: facilitamos la búsqueda, agendamiento y comunicación, pero no prestamos servicios médicos directos.",
    answerEn: "NUREA is a platform that connects patients with healthcare professionals. We act as a technology intermediary: we facilitate search, scheduling, and communication, but we do not provide direct medical services."
  },
  {
    question: "¿NUREA presta servicios médicos?",
    questionEn: "Does NUREA provide medical services?",
    answer: "No. NUREA no presta servicios médicos. Somos una plataforma tecnológica que conecta pacientes con profesionales de la salud. Los servicios médicos son prestados directamente por los profesionales que elijas.",
    answerEn: "No. NUREA does not provide medical services. We are a technology platform that connects patients with healthcare professionals. Medical services are provided directly by the professionals you choose."
  },
  {
    question: "¿Qué hago en caso de emergencia médica?",
    questionEn: "What should I do in case of a medical emergency?",
    answer: "NUREA no es para emergencias. Si tienes una emergencia médica, llama inmediatamente al 131 (SAMU) o acude a la urgencia más cercana. El chat de NUREA es solo para comunicación no urgente con tu profesional.",
    answerEn: "NUREA is not for emergencies. If you have a medical emergency, call 131 immediately or go to the nearest emergency room. NUREA's chat is only for non-urgent communication with your professional."
  },
  {
    question: "¿Cómo contacto a soporte?",
    questionEn: "How do I contact support?",
    answer: "Puedes escribirnos a soporte@nurea.app desde tu correo o hacer clic en el botón de abajo. Te responderemos en un plazo máximo de 24 horas. Para temas urgentes relacionados con tu salud, contacta directamente a tu profesional.",
    answerEn: "You can email us at soporte@nurea.app from your email or click the button below. We'll respond within 24 hours. For urgent health-related matters, contact your professional directly."
  },
  {
    question: "¿Mis datos están seguros?",
    questionEn: "Is my data safe?",
    answer: "Sí. Todos tus datos están encriptados y almacenados de forma segura. Solo tú y los profesionales autorizados pueden acceder a tu información. NUREA cumple con estándares de protección de datos personales.",
    answerEn: "Yes. All your data is encrypted and stored securely. Only you and authorized professionals can access your information. NUREA complies with personal data protection standards."
  },
  {
    question: "¿Puedo cancelar o reagendar una cita?",
    questionEn: "Can I cancel or reschedule an appointment?",
    answer: "Sí, puedes cancelar o reagendar tus citas desde tu panel en cualquier momento. Recuerda revisar las políticas de cancelación de cada profesional, ya que pueden variar según el tiempo de anticipación.",
    answerEn: "Yes, you can cancel or reschedule your appointments from your dashboard at any time. Remember to check each professional's cancellation policies, as they may vary depending on advance notice."
  },
  {
    question: "¿Cómo funciona el pago?",
    questionEn: "How does payment work?",
    answer: "El pago se realiza antes de la cita a través de nuestra plataforma segura. NUREA actúa como intermediario: recibimos el pago y lo transferimos al profesional después de la consulta. Puedes descargar tus recibos desde tu panel de pagos.",
    answerEn: "Payment is made before the appointment through our secure platform. NUREA acts as an intermediary: we receive the payment and transfer it to the professional after the consultation. You can download your receipts from your payments dashboard."
  },
  {
    question: "¿Puedo confiar en los profesionales de NUREA?",
    questionEn: "Can I trust NUREA professionals?",
    answer: "Todos los profesionales en NUREA pasan por un proceso de verificación. Sin embargo, la relación profesional-paciente es directa. NUREA facilita la conexión, pero no garantiza resultados médicos específicos.",
    answerEn: "All professionals on NUREA go through a verification process. However, the professional-patient relationship is direct. NUREA facilitates the connection but does not guarantee specific medical outcomes."
  }
]

export default function HelpPage() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const isSpanish = language === "es"
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const supportEmail = "soporte@nurea.app"

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <DashboardLayout role="patient">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <HelpCircle className="h-8 w-8 text-primary" />
              {isSpanish ? "Centro de Ayuda" : "Help Center"}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {isSpanish 
                ? "Estamos aquí para ayudarte. Encuentra respuestas y contáctanos cuando lo necesites."
                : "We're here to help. Find answers and contact us when you need to."}
            </p>
          </div>
        </div>

        {/* Qué hace NUREA */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-primary" />
              {isSpanish ? "¿Qué hace NUREA?" : "What does NUREA do?"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm mb-1">
                      {isSpanish ? "Conectamos" : "We connect"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isSpanish 
                        ? "Facilitamos que encuentres profesionales de la salud confiables y agendes citas de forma simple."
                        : "We make it easy to find trusted healthcare professionals and schedule appointments simply."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm mb-1">
                      {isSpanish ? "Gestionamos" : "We manage"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isSpanish 
                        ? "Procesamos pagos de forma segura y facilitamos la comunicación entre paciente y profesional."
                        : "We process payments securely and facilitate communication between patient and professional."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm mb-1">
                      {isSpanish ? "Protegemos" : "We protect"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isSpanish 
                        ? "Tus datos están encriptados y solo tú y tus profesionales autorizados tienen acceso."
                        : "Your data is encrypted and only you and your authorized professionals have access."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm mb-1">
                      {isSpanish ? "Somos intermediarios" : "We are intermediaries"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isSpanish 
                        ? "Actuamos como plataforma tecnológica. No prestamos servicios médicos directos."
                        : "We act as a technology platform. We do not provide direct medical services."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm mb-1">
                      {isSpanish ? "Cumplimos estándares" : "We meet standards"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isSpanish 
                        ? "Respetamos la privacidad y protección de datos personales según normativa vigente."
                        : "We respect privacy and personal data protection according to current regulations."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Qué NO hace NUREA */}
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              {isSpanish ? "¿Qué NO hace NUREA?" : "What does NUREA NOT do?"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-900/50 border border-orange-200 dark:border-orange-800">
                <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm mb-1">
                    {isSpanish ? "No prestamos servicios médicos" : "We do not provide medical services"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isSpanish 
                      ? "Los servicios médicos son prestados directamente por los profesionales que elijas. NUREA solo facilita la conexión."
                      : "Medical services are provided directly by the professionals you choose. NUREA only facilitates the connection."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-900/50 border border-orange-200 dark:border-orange-800">
                <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm mb-1">
                    {isSpanish ? "No garantizamos resultados médicos" : "We do not guarantee medical outcomes"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isSpanish 
                      ? "Cada profesional es responsable de sus propias decisiones y tratamientos. NUREA no interviene en la relación clínica."
                      : "Each professional is responsible for their own decisions and treatments. NUREA does not intervene in the clinical relationship."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-900/50 border border-orange-200 dark:border-orange-800">
                <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm mb-1">
                    {isSpanish ? "No somos para emergencias" : "We are not for emergencies"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isSpanish 
                      ? "NUREA no es una plataforma de emergencias. Para urgencias médicas, llama al 131 o acude a urgencias."
                      : "NUREA is not an emergency platform. For medical emergencies, call 131 or go to the emergency room."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergencias - Destacado */}
        <Card className="border-red-300 dark:border-red-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                    {isSpanish ? "¿Tienes una emergencia médica?" : "Do you have a medical emergency?"}
                  </h3>
                  <p className="text-base text-red-800 dark:text-red-200 leading-relaxed">
                    {isSpanish 
                      ? "NUREA no es para emergencias. Si tienes una emergencia médica, llama inmediatamente al 131 (SAMU) o acude a la urgencia más cercana. No uses el chat de NUREA para emergencias."
                      : "NUREA is not for emergencies. If you have a medical emergency, call 131 immediately or go to the nearest emergency room. Do not use NUREA's chat for emergencies."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="border-red-300 dark:border-red-700 bg-white dark:bg-gray-900 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => window.open("tel:131", "_blank")}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {isSpanish ? "Llamar al 131" : "Call 131"}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-300 dark:border-red-700 bg-white dark:bg-gray-900 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => window.open("https://www.saludresponde.cl/", "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {isSpanish ? "Salud Responde" : "Health Response"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {isSpanish ? "Preguntas Frecuentes" : "Frequently Asked Questions"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isSpanish 
                ? "Respuestas rápidas a las dudas más comunes"
                : "Quick answers to the most common questions"}
            </p>
          </div>
          
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-border/40 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => toggleFAQ(index)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-2">
                          {isSpanish ? item.question : item.questionEn}
                        </h3>
                        <AnimatePresence>
                          {openFAQ === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="text-sm text-muted-foreground leading-relaxed pt-2 border-t border-border/40 mt-2">
                                {isSpanish ? item.answer : item.answerEn}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8 rounded-lg"
                      >
                        {openFAQ === index ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contacto */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-primary" />
              {isSpanish ? "¿Necesitas ayuda?" : "Need help?"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-4">
                {isSpanish 
                  ? "Estamos aquí para ayudarte. Escríbenos y te responderemos lo antes posible."
                  : "We're here to help. Write to us and we'll respond as soon as possible."}
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-card border border-border/40 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {isSpanish ? "Correo de Soporte" : "Support Email"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isSpanish ? "Respuesta en 24 horas" : "Response within 24 hours"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/30 border border-border/40">
                    <code className="text-sm font-mono flex-1">{supportEmail}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(supportEmail)
                        alert(isSpanish ? "Correo copiado" : "Email copied")
                      }}
                      title={isSpanish ? "Copiar correo" : "Copy email"}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    className="w-full rounded-xl"
                    onClick={() => window.location.href = `mailto:${supportEmail}`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {isSpanish ? "Abrir Correo" : "Open Email"}
                  </Button>
                </div>

                <div className="p-5 rounded-xl bg-card border border-border/40 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {isSpanish ? "Información Importante" : "Important Information"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isSpanish ? "Tiempos de respuesta" : "Response times"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span>
                        {isSpanish 
                          ? "Soporte general: 24 horas"
                          : "General support: 24 hours"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <span>
                        {isSpanish 
                          ? "Para temas de salud urgentes, contacta a tu profesional directamente"
                          : "For urgent health matters, contact your professional directly"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span>
                        {isSpanish 
                          ? "Emergencias médicas: llama al 131"
                          : "Medical emergencies: call 131"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Legal Breve */}
        <Card className="border-border/40 bg-muted/30">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">
                  {isSpanish ? "Información Legal" : "Legal Information"}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isSpanish 
                    ? "NUREA actúa como intermediario tecnológico. No prestamos servicios médicos directos. Los profesionales son responsables de sus propias decisiones clínicas. Para más información, consulta nuestros Términos y Condiciones y Política de Privacidad."
                    : "NUREA acts as a technology intermediary. We do not provide direct medical services. Professionals are responsible for their own clinical decisions. For more information, see our Terms and Conditions and Privacy Policy."}
                </p>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => window.open("/legal/terms", "_blank")}
                  >
                    {isSpanish ? "Términos y Condiciones" : "Terms and Conditions"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => window.open("/legal/privacy", "_blank")}
                  >
                    {isSpanish ? "Política de Privacidad" : "Privacy Policy"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

