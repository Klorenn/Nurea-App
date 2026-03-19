"use client"

import { Navbar } from "@/components/navbar"
import { StackedCircularFooter } from "@/components/ui/stacked-circular-footer"
import { PaperShaderBackground } from "@/components/ui/background-paper-shaders"
import { useLanguage } from "@/contexts/language-context"
import { motion, type Variants } from "framer-motion"
import { 
  Shield, 
  Database, 
  Lock, 
  Eye, 
  FileText, 
  Calendar, 
  MessageCircle, 
  CreditCard, 
  Search,
  CheckCircle2,
  ArrowRight,
  User,
  Clock,
  Heart
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PacientesInfoPage() {
  const { language } = useLanguage()
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
    <main className="min-h-screen relative">
      <PaperShaderBackground />
      <div className="relative z-10">
        <Navbar />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-28 md:pb-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
                <User className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                {isSpanish ? "Información para Pacientes" : "Information for Patients"}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {isSpanish 
                  ? "Todo lo que necesitas saber sobre cómo funciona NUREA, qué datos almacenamos y cómo protegemos tu información."
                  : "Everything you need to know about how NUREA works, what data we store, and how we protect your information."}
              </p>
            </motion.div>

            {/* CTA Section */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/auth/register?role=patient">
                  {isSpanish ? "Crear cuenta como Paciente" : "Create Patient Account"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/login">
                  {isSpanish ? "Ya tengo cuenta" : "I already have an account"}
                </Link>
              </Button>
            </motion.div>

            <div className="border-t border-border/40 pt-8"></div>

            {/* Section 1: Funcionamiento Real */}
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    {isSpanish ? "1. ¿Cómo funciona NUREA?" : "1. How does NUREA work?"}
                  </h2>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Search className="h-5 w-5 text-primary" />
                          {isSpanish ? "Búsqueda de profesionales" : "Search for professionals"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-muted-foreground">
                        <p>{isSpanish 
                          ? "Puedes buscar profesionales de la salud por especialidad y ubicación. Verás su perfil, disponibilidad, tarifas y modalidad de atención (online o presencial)."
                          : "You can search for healthcare professionals by specialty and location. You'll see their profile, availability, fees, and consultation type (online or in-person)."}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          {isSpanish ? "Agendamiento de citas" : "Appointment scheduling"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-muted-foreground">
                        <p>{isSpanish 
                          ? "Seleccionas fecha, hora y modalidad. El sistema te muestra los horarios disponibles del profesional. Puedes agendar en menos de 30 segundos."
                          : "You select date, time, and consultation type. The system shows you the professional's available times. You can book in less than 30 seconds."}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          {isSpanish ? "Pago previo" : "Pre-payment"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-muted-foreground">
                        <p>{isSpanish 
                          ? "La coordinación y el pago de la consulta se realizan directamente con el especialista a través del chat seguro de la plataforma."
                          : "Appointment coordination and payment are done directly with the specialist through the platform's secure chat."}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5 text-primary" />
                          {isSpanish ? "Comunicación segura" : "Secure communication"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-muted-foreground">
                        <p>{isSpanish 
                          ? "Puedes comunicarte con tu profesional a través de mensajería segura dentro de la plataforma. Los mensajes están encriptados y solo tú y el profesional pueden verlos."
                          : "You can communicate with your professional through secure messaging within the platform. Messages are encrypted and only you and the professional can see them."}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </motion.section>

            <div className="border-t border-border/40 pt-8"></div>

            {/* Section 2: Datos Almacenados */}
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    {isSpanish ? "2. ¿Qué datos almacenamos?" : "2. What data do we store?"}
                  </h2>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>{isSpanish ? "Datos de cuenta" : "Account data"}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                          <li>{isSpanish ? "Nombre completo" : "Full name"}</li>
                          <li>{isSpanish ? "Correo electrónico" : "Email address"}</li>
                          <li>{isSpanish ? "Teléfono (opcional)" : "Phone number (optional)"}</li>
                          <li>{isSpanish ? "Fecha de nacimiento" : "Date of birth"}</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>{isSpanish ? "Datos de citas" : "Appointment data"}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                          <li>{isSpanish ? "Historial de citas agendadas" : "History of scheduled appointments"}</li>
                          <li>{isSpanish ? "Fechas, horarios y modalidad" : "Dates, times, and consultation type"}</li>
                          <li>{isSpanish ? "Estado de pago" : "Payment status"}</li>
                          <li>{isSpanish ? "Notas que agregues (opcional)" : "Notes you add (optional)"}</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>{isSpanish ? "Mensajes y documentos" : "Messages and documents"}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                          <li>{isSpanish ? "Mensajes intercambiados con profesionales" : "Messages exchanged with professionals"}</li>
                          <li>{isSpanish ? "Documentos médicos que subas (resultados de laboratorio, recetas, etc.)" : "Medical documents you upload (lab results, prescriptions, etc.)"}</li>
                          <li>{isSpanish ? "Solo tú y el profesional pueden acceder a estos datos" : "Only you and the professional can access this data"}</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">
                          {isSpanish ? "Lo que NO almacenamos:" : "What we do NOT store:"}
                        </strong>
                        {" "}
                        {isSpanish 
                          ? "No almacenamos historiales clínicos completos, diagnósticos detallados ni información médica que no sea necesaria para el funcionamiento de la plataforma."
                          : "We do not store complete medical histories, detailed diagnoses, or medical information that is not necessary for the platform to function."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            <div className="border-t border-border/40 pt-8"></div>

            {/* Section 3: Seguridad */}
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    {isSpanish ? "3. Seguridad y privacidad" : "3. Security and privacy"}
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="h-5 w-5 text-primary" />
                          {isSpanish ? "Encriptación" : "Encryption"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {isSpanish 
                            ? "Todos tus datos están encriptados con estándares de nivel bancario (SSL/TLS). Los documentos médicos se almacenan en servidores seguros con acceso restringido."
                            : "All your data is encrypted with bank-level standards (SSL/TLS). Medical documents are stored on secure servers with restricted access."}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="h-5 w-5 text-primary" />
                          {isSpanish ? "Control de acceso" : "Access control"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {isSpanish 
                            ? "Solo tú y el profesional con quien tienes una cita pueden ver tus mensajes y documentos. NUREA no accede a tu información médica."
                            : "Only you and the professional you have an appointment with can see your messages and documents. NUREA does not access your medical information."}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                          {isSpanish ? "Cumplimiento legal" : "Legal compliance"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {isSpanish 
                            ? "Cumplimos con la Ley Nº 19.628 de Protección de la Vida Privada de Chile. Tus datos están protegidos por ley."
                            : "We comply with Chile's Law Nº 19.628 on Privacy Protection. Your data is protected by law."}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          {isSpanish ? "Tus derechos" : "Your rights"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {isSpanish 
                            ? "Puedes solicitar acceso, corrección o eliminación de tus datos en cualquier momento. Contacta a soporte@nurea.app"
                            : "You can request access, correction, or deletion of your data at any time. Contact support@nurea.app"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </motion.section>

            <div className="border-t border-border/40 pt-8"></div>

            {/* Section 4: Flujo de Uso Real */}
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    {isSpanish ? "4. Flujo de uso paso a paso" : "4. Step-by-step usage flow"}
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-2">
                          {isSpanish ? "Crear cuenta" : "Create account"}
                        </h3>
                        <p className="text-muted-foreground">
                          {isSpanish 
                            ? "Regístrate como paciente. Solo necesitas nombre, email y contraseña. Verificamos tu email para proteger tu cuenta."
                            : "Sign up as a patient. You only need name, email, and password. We verify your email to protect your account."}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-2">
                          {isSpanish ? "Buscar profesional" : "Search for professional"}
                        </h3>
                        <p className="text-muted-foreground">
                          {isSpanish 
                            ? "Busca por especialidad y ubicación. Revisa perfiles, disponibilidad y tarifas. Agrega a favoritos los que te interesen."
                            : "Search by specialty and location. Review profiles, availability, and fees. Add to favorites those that interest you."}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-2">
                          {isSpanish ? "Agendar cita" : "Schedule appointment"}
                        </h3>
                        <p className="text-muted-foreground">
                          {isSpanish 
                            ? "Selecciona fecha, hora y modalidad. El sistema te muestra disponibilidad en tiempo real. Puedes agendar en menos de 30 segundos."
                            : "Select date, time, and consultation type. The system shows you real-time availability. You can book in less than 30 seconds."}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-2">
                          {isSpanish ? "Realizar pago" : "Make payment"}
                        </h3>
                        <p className="text-muted-foreground">
                          {isSpanish 
                            ? "Paga de forma segura con tarjeta de crédito o débito. El pago se procesa antes de la cita. Recibirás confirmación inmediata."
                            : "Pay securely with credit or debit card. Payment is processed before the appointment. You'll receive immediate confirmation."}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        5
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-2">
                          {isSpanish ? "Asistir a la cita" : "Attend appointment"}
                        </h3>
                        <p className="text-muted-foreground">
                          {isSpanish 
                            ? "Recibirás recordatorios por email. Si es online, accede al enlace de la reunión. Si es presencial, ve a la dirección indicada."
                            : "You'll receive email reminders. If it's online, access the meeting link. If it's in-person, go to the indicated address."}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        6
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-2">
                          {isSpanish ? "Seguimiento" : "Follow-up"}
                        </h3>
                        <p className="text-muted-foreground">
                          {isSpanish 
                            ? "Puedes comunicarte con el profesional a través de mensajería segura, subir documentos si es necesario, y agendar citas de seguimiento."
                            : "You can communicate with the professional through secure messaging, upload documents if needed, and schedule follow-up appointments."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            <div className="border-t border-border/40 pt-8"></div>

            {/* CTA Final */}
            <motion.div variants={itemVariants} className="text-center space-y-6 bg-primary/5 rounded-2xl p-8 border border-primary/20">
              <Heart className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-3xl font-bold text-foreground">
                {isSpanish ? "¿Listo para comenzar?" : "Ready to get started?"}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {isSpanish 
                  ? "Crea tu cuenta gratuita y comienza a cuidar tu salud de forma simple y segura."
                  : "Create your free account and start taking care of your health simply and securely."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/auth/register?role=patient">
                    {isSpanish ? "Crear cuenta como Paciente" : "Create Patient Account"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link href="/legal/privacy">
                    {isSpanish ? "Ver Política de Privacidad" : "View Privacy Policy"}
                  </Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <StackedCircularFooter />
      </div>
    </main>
  )
}

