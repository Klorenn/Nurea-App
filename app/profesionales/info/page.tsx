"use client"

import { Navbar } from "@/components/navbar"
import { StackedCircularFooter } from "@/components/ui/stacked-circular-footer"
import { PaperShaderBackground } from "@/components/ui/background-paper-shaders"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import { 
  Shield, 
  FileCheck, 
  CheckCircle2, 
  FileText, 
  DollarSign,
  AlertCircle,
  ArrowRight,
  Stethoscope,
  Clock,
  Users,
  CreditCard,
  Mail
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfesionalesInfoPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
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
                <Stethoscope className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                {isSpanish ? "Información para Profesionales" : "Information for Professionals"}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {isSpanish 
                  ? "Todo lo que necesitas saber sobre requisitos, proceso de verificación, comisiones y responsabilidades legales en NUREA."
                  : "Everything you need to know about requirements, verification process, commissions, and legal responsibilities on NUREA."}
              </p>
            </motion.div>

            {/* CTA Section */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/auth/register?role=professional">
                  {isSpanish ? "Unirme como Profesional" : "Join as Professional"}
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

            {/* Section 1: Requisitos */}
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    {isSpanish ? "1. Requisitos para unirse" : "1. Requirements to join"}
                  </h2>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>{isSpanish ? "Especialidades aceptadas" : "Accepted specialties"}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-muted-foreground mb-3">
                          {isSpanish 
                            ? "Actualmente aceptamos profesionales de las siguientes especialidades:"
                            : "We currently accept professionals from the following specialties:"}
                        </p>
                        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                          <li>{isSpanish ? "Psicólogas y Psicólogos" : "Psychologists"}</li>
                          <li>{isSpanish ? "Psiquiatras" : "Psychiatrists"}</li>
                          <li>{isSpanish ? "Dentistas / Odontólogos" : "Dentists"}</li>
                          <li>{isSpanish ? "Kinesiólogas y Kinesiólogos" : "Physical Therapists"}</li>
                          <li>{isSpanish ? "Matronas y Matrones" : "Midwives"}</li>
                          <li>{isSpanish ? "Nutricionistas" : "Nutritionists"}</li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-3">
                          {isSpanish 
                            ? "NUREA podrá incorporar nuevas especialidades en el futuro."
                            : "NUREA may incorporate new specialties in the future."}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>{isSpanish ? "Documentación requerida" : "Required documentation"}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                          <li>{isSpanish ? "Título profesional válido" : "Valid professional degree"}</li>
                          <li>{isSpanish ? "Registro profesional vigente (si aplica)" : "Current professional registration (if applicable)"}</li>
                          <li>{isSpanish ? "Documento de identidad" : "Identity document"}</li>
                          <li>{isSpanish ? "Comprobante de domicilio" : "Proof of address"}</li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-3">
                          {isSpanish 
                            ? "Todos los documentos deben estar vigentes y ser legibles."
                            : "All documents must be current and legible."}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>{isSpanish ? "Información del perfil" : "Profile information"}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                          <li>{isSpanish ? "Nombre completo" : "Full name"}</li>
                          <li>{isSpanish ? "Especialidad y años de experiencia" : "Specialty and years of experience"}</li>
                          <li>{isSpanish ? "Bio profesional (corta y humana)" : "Professional bio (short and human)"}</li>
                          <li>{isSpanish ? "Modalidades de atención (online/presencial)" : "Consultation types (online/in-person)"}</li>
                          <li>{isSpanish ? "Tarifas de consulta" : "Consultation fees"}</li>
                          <li>{isSpanish ? "Horarios de disponibilidad" : "Availability schedules"}</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </motion.section>

            <div className="border-t border-border/40 pt-8"></div>

            {/* Section 2: Proceso de Verificación */}
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    {isSpanish ? "2. Proceso de verificación" : "2. Verification process"}
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-2">
                          {isSpanish ? "Registro inicial" : "Initial registration"}
                        </h3>
                        <p className="text-muted-foreground">
                          {isSpanish 
                            ? "Crea tu cuenta como profesional. Completa tu perfil con información básica y sube los documentos requeridos."
                            : "Create your account as a professional. Complete your profile with basic information and upload required documents."}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-2">
                          {isSpanish ? "Revisión de documentos" : "Document review"}
                        </h3>
                        <p className="text-muted-foreground">
                          {isSpanish 
                            ? "Nuestro equipo de administración revisa tus documentos y perfil. Este proceso puede tomar entre 2 a 5 días hábiles."
                            : "Our administration team reviews your documents and profile. This process may take 2 to 5 business days."}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-2">
                          {isSpanish ? "Aprobación o solicitud de correcciones" : "Approval or request for corrections"}
                        </h3>
                        <p className="text-muted-foreground">
                          {isSpanish 
                            ? "Si todo está correcto, tu cuenta será verificada y podrás comenzar a recibir pacientes. Si hay correcciones necesarias, te contactaremos por email."
                            : "If everything is correct, your account will be verified and you can start receiving patients. If corrections are needed, we'll contact you by email."}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-2">
                          {isSpanish ? "Cuenta verificada" : "Verified account"}
                        </h3>
                        <p className="text-muted-foreground">
                          {isSpanish 
                            ? "Una vez verificada, tu perfil aparecerá en las búsquedas con un badge de verificación. Podrás gestionar tu agenda, recibir pagos y comunicarte con pacientes."
                            : "Once verified, your profile will appear in searches with a verification badge. You'll be able to manage your schedule, receive payments, and communicate with patients."}
                        </p>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">
                          {isSpanish ? "Nota importante:" : "Important note:"}
                        </strong>
                        {" "}
                        {isSpanish 
                          ? "La verificación es un proceso continuo. Si tu registro profesional expira o hay cambios en tu situación, debes actualizar tu información."
                          : "Verification is an ongoing process. If your professional registration expires or there are changes in your situation, you must update your information."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            <div className="border-t border-border/40 pt-8"></div>

            {/* Section 3: Comisiones */}
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    {isSpanish ? "3. Comisiones y pagos" : "3. Commissions and payments"}
                  </h2>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          {isSpanish ? "Comisión de NUREA" : "NUREA commission"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-muted-foreground">
                          {isSpanish 
                            ? "NUREA cobra una comisión del 15% sobre cada consulta pagada. Esta comisión cubre:"
                            : "NUREA charges a 15% commission on each paid consultation. This commission covers:"}
                        </p>
                        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4 mt-3">
                          <li>{isSpanish ? "Gestión de pagos seguros" : "Secure payment processing"}</li>
                          <li>{isSpanish ? "Mantenimiento de la plataforma" : "Platform maintenance"}</li>
                          <li>{isSpanish ? "Soporte técnico" : "Technical support"}</li>
                          <li>{isSpanish ? "Marketing y visibilidad" : "Marketing and visibility"}</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          {isSpanish ? "Proceso de pago" : "Payment process"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-muted-foreground">
                          {isSpanish 
                            ? "El paciente paga antes de la cita. NUREA retiene la comisión y transfiere el 85% restante a tu cuenta bancaria en un plazo de 3 a 5 días hábiles después de la consulta completada."
                            : "The patient pays before the appointment. NUREA retains the commission and transfers the remaining 85% to your bank account within 3 to 5 business days after the completed consultation."}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          {isSpanish ? "Tarifas que defines tú" : "Fees you set"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-muted-foreground">
                          {isSpanish 
                            ? "Tú defines tus tarifas de consulta. NUREA no interviene en la fijación de precios. Puedes tener diferentes tarifas para consultas online y presenciales."
                            : "You set your consultation fees. NUREA does not intervene in pricing. You can have different fees for online and in-person consultations."}
                        </p>
                      </CardContent>
                    </Card>

                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">
                          {isSpanish ? "Ejemplo:" : "Example:"}
                        </strong>
                        {" "}
                        {isSpanish 
                          ? "Si cobras $50.000 CLP por consulta, recibirás $42.500 CLP (85%) y NUREA retiene $7.500 CLP (15%)."
                          : "If you charge $50,000 CLP per consultation, you'll receive $42,500 CLP (85%) and NUREA retains $7,500 CLP (15%)."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            <div className="border-t border-border/40 pt-8"></div>

            {/* Section 4: Responsabilidades Legales */}
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    {isSpanish ? "4. Responsabilidades legales" : "4. Legal responsibilities"}
                  </h2>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          {isSpanish ? "NUREA como intermediario tecnológico" : "NUREA as technology intermediary"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-muted-foreground">
                          {isSpanish 
                            ? "NUREA es una plataforma de intermediación tecnológica. Esto significa que:"
                            : "NUREA is a technology intermediation platform. This means that:"}
                        </p>
                        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4 mt-3">
                          <li>{isSpanish ? "NUREA NO presta servicios médicos" : "NUREA does NOT provide medical services"}</li>
                          <li>{isSpanish ? "NUREA NO realiza diagnósticos ni tratamientos" : "NUREA does NOT perform diagnoses or treatments"}</li>
                          <li>{isSpanish ? "NUREA NO interviene en la relación clínica" : "NUREA does NOT intervene in the clinical relationship"}</li>
                          <li>{isSpanish ? "NUREA facilita la conexión y gestión de pagos" : "NUREA facilitates connection and payment management"}</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-primary" />
                          {isSpanish ? "Tu responsabilidad como profesional" : "Your responsibility as a professional"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-muted-foreground mb-3">
                          {isSpanish 
                            ? "Como profesional de la salud, eres responsable de:"
                            : "As a healthcare professional, you are responsible for:"}
                        </p>
                        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                          <li>{isSpanish ? "La calidad y ética de la atención médica que brindas" : "The quality and ethics of the medical care you provide"}</li>
                          <li>{isSpanish ? "Mantener tu registro profesional vigente" : "Maintaining your current professional registration"}</li>
                          <li>{isSpanish ? "Cumplir con el secreto profesional y confidencialidad" : "Complying with professional secrecy and confidentiality"}</li>
                          <li>{isSpanish ? "Informar a los pacientes sobre tu práctica y limitaciones" : "Informing patients about your practice and limitations"}</li>
                          <li>{isSpanish ? "Mantener información actualizada en tu perfil" : "Keeping information updated in your profile"}</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          {isSpanish ? "Protección de datos" : "Data protection"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-muted-foreground">
                          {isSpanish 
                            ? "Debes cumplir con la Ley Nº 19.628 de Protección de la Vida Privada de Chile. Los datos de tus pacientes son confidenciales y solo deben usarse para la atención médica."
                            : "You must comply with Chile's Law Nº 19.628 on Privacy Protection. Your patients' data is confidential and should only be used for medical care."}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          {isSpanish ? "Consentimiento informado" : "Informed consent"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-muted-foreground">
                          {isSpanish 
                            ? "Debes obtener el consentimiento informado de tus pacientes antes de realizar cualquier procedimiento. NUREA facilita el registro digital de este consentimiento."
                            : "You must obtain informed consent from your patients before performing any procedure. NUREA facilitates the digital registration of this consent."}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </motion.section>

            <div className="border-t border-border/40 pt-8"></div>

            {/* CTA Final */}
            <motion.div variants={itemVariants} className="text-center space-y-6 bg-primary/5 rounded-2xl p-8 border border-primary/20">
              <Stethoscope className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-3xl font-bold text-foreground">
                {isSpanish ? "¿Listo para unirte a NUREA?" : "Ready to join NUREA?"}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {isSpanish 
                  ? "Únete a nuestra comunidad de profesionales y comienza a gestionar tu práctica de forma simple y eficiente."
                  : "Join our community of professionals and start managing your practice simply and efficiently."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/auth/register?role=professional">
                    {isSpanish ? "Unirme como Profesional" : "Join as Professional"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link href="/legal/terms">
                    {isSpanish ? "Ver Términos y Condiciones" : "View Terms and Conditions"}
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {isSpanish 
                  ? "¿Tienes preguntas? Contáctanos en "
                  : "Have questions? Contact us at "}
                <a href="mailto:soporte@nurea.app" className="text-primary hover:underline font-medium">
                  soporte@nurea.app
                </a>
              </p>
            </motion.div>
          </motion.div>
        </div>

        <StackedCircularFooter />
      </div>
    </main>
  )
}

