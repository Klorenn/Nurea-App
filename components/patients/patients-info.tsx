"use client"

import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { Database, Shield, Lock, FileText, MessageSquare, Calendar, CreditCard, Eye, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, type Variants } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PatientsInfo() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const isSpanish = language === "es"

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      } as any,
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 } as any,
    },
  }

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {isSpanish ? "Cómo funciona NUREA" : "How NUREA Works"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isSpanish 
                ? "Información transparente sobre cómo usamos tu información y protegemos tu privacidad"
                : "Transparent information about how we use your information and protect your privacy"}
            </p>
          </motion.div>

          {/* Funcionamiento Real */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {isSpanish ? "Funcionamiento Real" : "How It Works"}
                    </CardTitle>
                    <CardDescription>
                      {isSpanish 
                        ? "Proceso paso a paso de cómo usas NUREA"
                        : "Step-by-step process of how you use NUREA"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {isSpanish ? "Búsqueda y Selección" : "Search and Selection"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {isSpanish 
                            ? "Busca profesionales por especialidad y ubicación. Revisa perfiles, experiencias y reseñas."
                            : "Search for professionals by specialty and location. Review profiles, experience, and reviews."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {isSpanish ? "Agendar Cita" : "Book Appointment"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {isSpanish 
                            ? "Selecciona fecha, horario y modalidad (online o presencial). El sistema verifica disponibilidad en tiempo real."
                            : "Select date, time, and modality (online or in-person). The system verifies availability in real-time."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {isSpanish ? "Reserva Segura y Transparente" : "Secure & Transparent Booking"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {isSpanish 
                            ? "Tu pago se procesa de forma segura al agendar. Cancelaciones con 48+ horas de anticipación tienen devolución garantizada."
                            : "Your payment is processed securely when booking. Cancellations 48+ hours in advance are eligible for a full refund."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-primary">4</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {isSpanish ? "Comunicación y Consulta" : "Communication and Consultation"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {isSpanish 
                            ? "Comunícate con el profesional de forma segura. Asiste a tu cita (online o presencial) según lo acordado."
                            : "Communicate with the professional securely. Attend your appointment (online or in-person) as agreed."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-primary">5</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {isSpanish ? "Documentos y Seguimiento" : "Documents and Follow-up"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {isSpanish 
                            ? "Accede a documentos médicos asociados a tus citas. Descarga recibos y mantén un historial organizado."
                            : "Access medical documents associated with your appointments. Download receipts and keep an organized history."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-primary">6</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {isSpanish ? "Gestión Continua" : "Ongoing Management"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {isSpanish 
                            ? "Reagenda, cancela o completa citas. Todo desde tu panel de control, en menos de 30 segundos."
                            : "Reschedule, cancel, or complete appointments. Everything from your dashboard, in less than 30 seconds."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Datos Almacenados */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {isSpanish ? "Qué Datos Almacenamos" : "Data We Store"}
                    </CardTitle>
                    <CardDescription>
                      {isSpanish 
                        ? "Información clara sobre qué guardamos y por qué"
                        : "Clear information about what we store and why"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {isSpanish ? "Datos de Perfil" : "Profile Data"}
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                        <li>• {isSpanish ? "Nombre completo" : "Full name"}</li>
                        <li>• {isSpanish ? "Correo electrónico" : "Email address"}</li>
                        <li>• {isSpanish ? "Fecha de nacimiento" : "Date of birth"}</li>
                        <li>• {isSpanish ? "Teléfono (opcional)" : "Phone (optional)"}</li>
                        <li>• {isSpanish ? "Preferencias de comunicación" : "Communication preferences"}</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {isSpanish ? "Datos de Citas" : "Appointment Data"}
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                        <li>• {isSpanish ? "Fechas y horarios agendados" : "Scheduled dates and times"}</li>
                        <li>• {isSpanish ? "Profesional seleccionado" : "Selected professional"}</li>
                        <li>• {isSpanish ? "Modalidad (online/presencial)" : "Modality (online/in-person)"}</li>
                        <li>• {isSpanish ? "Estado de la cita" : "Appointment status"}</li>
                        <li>• {isSpanish ? "Notas opcionales" : "Optional notes"}</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        {isSpanish ? "Datos de Pagos" : "Payment Data"}
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                        <li>• {isSpanish ? "Historial de transacciones" : "Transaction history"}</li>
                        <li>• {isSpanish ? "Monto y fecha de pago" : "Amount and payment date"}</li>
                        <li>• {isSpanish ? "Estado de pago" : "Payment status"}</li>
                        <li>• {isSpanish ? "Recibos descargables" : "Downloadable receipts"}</li>
                        <li>• <strong className="text-foreground">{isSpanish ? "NO almacenamos datos de tarjetas" : "We do NOT store card data"}</strong></li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {isSpanish ? "Documentos Médicos" : "Medical Documents"}
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                        <li>• {isSpanish ? "Documentos que subes o recibes" : "Documents you upload or receive"}</li>
                        <li>• {isSpanish ? "Asociados a citas específicas" : "Associated with specific appointments"}</li>
                        <li>• {isSpanish ? "Metadatos (nombre, fecha, tipo)" : "Metadata (name, date, type)"}</li>
                        <li>• {isSpanish ? "Almacenados de forma encriptada" : "Stored encrypted"}</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        {isSpanish ? "Mensajes" : "Messages"}
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                        <li>• {isSpanish ? "Conversaciones con profesionales" : "Conversations with professionals"}</li>
                        <li>• {isSpanish ? "Archivos adjuntos" : "Attached files"}</li>
                        <li>• {isSpanish ? "Historial completo y persistente" : "Complete and persistent history"}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">
                        {isSpanish ? "Lo que NO almacenamos:" : "What we do NOT store:"}
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• {isSpanish ? "Datos de tarjetas de crédito completos" : "Complete credit card data"}</li>
                        <li>• {isSpanish ? "Historiales clínicos completos" : "Complete medical histories"}</li>
                        <li>• {isSpanish ? "Información médica detallada sin tu consentimiento" : "Detailed medical information without your consent"}</li>
                        <li>• {isSpanish ? "Datos de terceros para marketing" : "Third-party data for marketing"}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Seguridad */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {isSpanish ? "Seguridad y Privacidad" : "Security and Privacy"}
                    </CardTitle>
                    <CardDescription>
                      {isSpanish 
                        ? "Medidas técnicas y legales que protegen tu información"
                        : "Technical and legal measures that protect your information"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary" />
                        {isSpanish ? "Encriptación" : "Encryption"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isSpanish 
                          ? "Todos los datos se transmiten mediante HTTPS (SSL/TLS). Los documentos médicos se almacenan encriptados en servidores seguros."
                          : "All data is transmitted via HTTPS (SSL/TLS). Medical documents are stored encrypted on secure servers."}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Eye className="h-4 w-4 text-primary" />
                        {isSpanish ? "Control de Acceso" : "Access Control"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isSpanish 
                          ? "Solo tú y los profesionales autorizados pueden ver tu información. Row Level Security (RLS) garantiza que cada usuario solo accede a sus propios datos."
                          : "Only you and authorized professionals can see your information. Row Level Security (RLS) ensures each user only accesses their own data."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" />
                        {isSpanish ? "Almacenamiento Seguro" : "Secure Storage"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isSpanish 
                          ? "Utilizamos Supabase, una plataforma con certificaciones de seguridad (SOC 2, ISO 27001). Los datos se almacenan en servidores con redundancia y backups automáticos."
                          : "We use Supabase, a platform with security certifications (SOC 2, ISO 27001). Data is stored on servers with redundancy and automatic backups."}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {isSpanish ? "Cumplimiento Legal" : "Legal Compliance"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isSpanish 
                          ? "Cumplimos con la Ley Nº 19.628 de Protección de la Vida Privada de Chile. Tienes derecho a acceder, rectificar y eliminar tus datos personales."
                          : "We comply with Chile's Law Nº 19.628 on Privacy Protection. You have the right to access, rectify, and delete your personal data."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">
                        {isSpanish ? "Tu información es privada:" : "Your information is private:"}
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• {isSpanish ? "No vendemos ni compartimos datos con terceros para marketing" : "We do not sell or share data with third parties for marketing"}</li>
                        <li>• {isSpanish ? "Solo compartimos información necesaria para el funcionamiento del servicio" : "We only share information necessary for service operation"}</li>
                        <li>• {isSpanish ? "Puedes solicitar la eliminación de tu cuenta en cualquier momento" : "You can request account deletion at any time"}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA */}
          <motion.div variants={itemVariants} className="text-center">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {isSpanish ? "¿Listo para comenzar?" : "Ready to get started?"}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  {isSpanish 
                    ? "Crea tu cuenta gratuita y comienza a gestionar tu salud de forma simple y segura."
                    : "Create your free account and start managing your health simply and securely."}
                </p>
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    {isSpanish ? "Crear cuenta como Paciente" : "Create Patient Account"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

