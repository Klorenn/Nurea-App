"use client"

import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { FileCheck, Shield, DollarSign, Scale, CheckCircle2, AlertCircle, Clock, FileText, UserCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, type Variants, type Transition } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ProfessionalsInfo() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const isSpanish = language === "es"

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemSpringTransition: Transition = {
    type: "spring",
    stiffness: 100,
    damping: 15,
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: itemSpringTransition,
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
              {isSpanish ? "Información para Profesionales" : "Information for Professionals"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isSpanish 
                ? "Requisitos, proceso de verificación, comisiones y responsabilidades legales"
                : "Requirements, verification process, commissions, and legal responsibilities"}
            </p>
          </motion.div>

          {/* Requisitos */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {isSpanish ? "Requisitos para Unirse" : "Requirements to Join"}
                    </CardTitle>
                    <CardDescription>
                      {isSpanish 
                        ? "Documentación y credenciales necesarias"
                        : "Required documentation and credentials"}
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
                        {isSpanish ? "Requisitos Básicos" : "Basic Requirements"}
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                        <li>• {isSpanish ? "Título profesional válido en Chile" : "Valid professional degree in Chile"}</li>
                        <li>• {isSpanish ? "Registro en colegio profesional correspondiente (si aplica)" : "Registration with corresponding professional college (if applicable)"}</li>
                        <li>• {isSpanish ? "Cédula de identidad vigente" : "Valid identity card"}</li>
                        <li>• {isSpanish ? "Correo electrónico profesional" : "Professional email"}</li>
                        <li>• {isSpanish ? "Cuenta bancaria para recibir pagos" : "Bank account to receive payments"}</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {isSpanish ? "Documentos a Subir" : "Documents to Upload"}
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                        <li>• {isSpanish ? "Copia del título profesional" : "Copy of professional degree"}</li>
                        <li>• {isSpanish ? "Certificado de registro profesional" : "Professional registration certificate"}</li>
                        <li>• {isSpanish ? "Cédula de identidad (ambos lados)" : "Identity card (both sides)"}</li>
                        <li>• {isSpanish ? "Foto profesional (opcional pero recomendado)" : "Professional photo (optional but recommended)"}</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-primary" />
                        {isSpanish ? "Especialidades Permitidas" : "Allowed Specialties"}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {isSpanish 
                          ? "NUREA acepta profesionales de las siguientes áreas:"
                          : "NUREA accepts professionals from the following areas:"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          isSpanish ? "Médicos" : "Doctors",
                          isSpanish ? "Psicólogos" : "Psychologists",
                          isSpanish ? "Nutricionistas" : "Nutritionists",
                          isSpanish ? "Kinesiólogos" : "Physiotherapists",
                          isSpanish ? "Terapeutas" : "Therapists",
                          isSpanish ? "Enfermeros" : "Nurses",
                          isSpanish ? "Otros profesionales de la salud" : "Other health professionals"
                        ].map((specialty) => (
                          <Badge key={specialty} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-1">
                            {isSpanish ? "Importante:" : "Important:"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isSpanish 
                              ? "Todos los documentos son revisados manualmente por nuestro equipo. El proceso de verificación puede tomar entre 2 a 5 días hábiles."
                              : "All documents are manually reviewed by our team. The verification process may take 2 to 5 business days."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Proceso de Verificación */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {isSpanish ? "Proceso de Verificación" : "Verification Process"}
                    </CardTitle>
                    <CardDescription>
                      {isSpanish 
                        ? "Pasos para ser verificado como profesional en NUREA"
                        : "Steps to be verified as a professional on NUREA"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        {isSpanish ? "Registro Inicial" : "Initial Registration"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isSpanish 
                          ? "Crea tu cuenta seleccionando 'Soy Profesional'. Completa tu perfil básico con nombre, especialidad y años de experiencia."
                          : "Create your account by selecting 'I'm a Professional'. Complete your basic profile with name, specialty, and years of experience."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        {isSpanish ? "Subida de Documentos" : "Document Upload"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isSpanish 
                          ? "Sube los documentos requeridos (título, registro profesional, cédula) a través de tu panel. Asegúrate de que sean claros y legibles."
                          : "Upload required documents (degree, professional registration, ID) through your panel. Make sure they are clear and legible."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        {isSpanish ? "Revisión por Administradores" : "Review by Administrators"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isSpanish 
                          ? "Nuestro equipo revisa manualmente cada documento. Verificamos la autenticidad, validez y correspondencia con los datos de tu perfil."
                          : "Our team manually reviews each document. We verify authenticity, validity, and correspondence with your profile data."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">4</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        {isSpanish ? "Aprobación o Solicitud de Aclaraciones" : "Approval or Request for Clarifications"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isSpanish 
                          ? "Si todo está correcto, recibirás un correo de aprobación y tu perfil será verificado. Si hay problemas, te contactaremos para aclaraciones."
                          : "If everything is correct, you'll receive an approval email and your profile will be verified. If there are issues, we'll contact you for clarifications."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">5</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        {isSpanish ? "Activación de Perfil" : "Profile Activation"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isSpanish 
                          ? "Una vez verificado, tu perfil estará visible para pacientes. Podrás configurar tu agenda, tarifas y comenzar a recibir citas."
                          : "Once verified, your profile will be visible to patients. You can configure your schedule, fees, and start receiving appointments."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">
                        {isSpanish ? "Tiempo de Procesamiento:" : "Processing Time:"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isSpanish 
                          ? "El proceso completo generalmente toma entre 2 a 5 días hábiles. Te notificaremos por correo electrónico en cada etapa del proceso."
                          : "The complete process generally takes 2 to 5 business days. We'll notify you by email at each stage of the process."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Comisiones */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {isSpanish ? "Suscripción y cobro de consultas" : "Subscription and consultation billing"}
                    </CardTitle>
                    <CardDescription>
                      {isSpanish 
                        ? "Acceso a la plataforma y coordinación con pacientes"
                        : "Platform access and coordination with patients"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {isSpanish ? "Suscripción NUREA" : "NUREA Subscription"}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {isSpanish 
                          ? "Los profesionales abonan una suscripción mensual para acceder a la plataforma: perfil, agenda, chat y herramientas. Esta suscripción se factura por NUREA (por ejemplo vía Mercado Pago) y es independiente del cobro de tus consultas."
                          : "Professionals pay a monthly subscription to access the platform: profile, calendar, chat and tools. This subscription is billed by NUREA (e.g. via Mercado Pago) and is separate from how you charge for consultations."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {isSpanish ? "Cobro de consultas" : "Charging for consultations"}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {isSpanish 
                          ? "La coordinación y el pago de la consulta se realizan directamente entre tú y el paciente, por ejemplo a través del chat seguro de la plataforma (enlace de pago externo, transferencia, instrucciones). NUREA no retiene comisiones ni actúa como intermediario del pago de la consulta."
                          : "Coordination and payment of the consultation are done directly between you and the patient, for example through the platform's secure chat (external payment link, bank transfer, instructions). NUREA does not retain commissions or act as intermediary for consultation payments."}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-1">
                            {isSpanish ? "Importante:" : "Important:"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isSpanish 
                              ? "Cualquier reembolso o disputa relacionada con el pago de una consulta es materia exclusiva entre el paciente y el profesional."
                              : "Any refund or dispute related to consultation payment is solely between the patient and the professional."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Responsabilidades Legales */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {isSpanish ? "Responsabilidades Legales" : "Legal Responsibilities"}
                    </CardTitle>
                    <CardDescription>
                      {isSpanish 
                        ? "Rol de NUREA y responsabilidades del profesional"
                        : "NUREA's role and professional responsibilities"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {isSpanish ? "Rol de NUREA" : "NUREA's Role"}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {isSpanish 
                        ? "NUREA actúa exclusivamente como un intermediario tecnológico. Esto significa:"
                        : "NUREA acts exclusively as a technology intermediary. This means:"}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                      <li>• {isSpanish ? "Facilitamos la conexión entre pacientes y profesionales" : "We facilitate connection between patients and professionals"}</li>
                      <li>• {isSpanish ? "Procesamos pagos de forma segura" : "We process payments securely"}</li>
                      <li>• {isSpanish ? "Proporcionamos herramientas de gestión" : "We provide management tools"}</li>
                      <li>• <strong className="text-foreground">{isSpanish ? "NO prestamos servicios médicos directos" : "We do NOT provide direct medical services"}</strong></li>
                      <li>• <strong className="text-foreground">{isSpanish ? "NO somos responsables de la atención médica" : "We are NOT responsible for medical care"}</strong></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {isSpanish ? "Responsabilidades del Profesional" : "Professional Responsibilities"}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {isSpanish 
                        ? "Como profesional de la salud en NUREA, eres responsable de:"
                        : "As a health professional on NUREA, you are responsible for:"}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                      <li>• {isSpanish ? "Prestar servicios médicos de calidad y conforme a estándares profesionales" : "Providing quality medical services in accordance with professional standards"}</li>
                      <li>• {isSpanish ? "Mantener tu registro profesional vigente y actualizado" : "Maintaining your professional registration current and updated"}</li>
                      <li>• {isSpanish ? "Cumplir con el secreto profesional y confidencialidad" : "Complying with professional secrecy and confidentiality"}</li>
                      <li>• {isSpanish ? "Obtener consentimiento informado cuando sea necesario" : "Obtaining informed consent when necessary"}</li>
                      <li>• {isSpanish ? "Mantener registros médicos adecuados" : "Maintaining adequate medical records"}</li>
                      <li>• {isSpanish ? "Cumplir con la legislación chilena aplicable" : "Complying with applicable Chilean legislation"}</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-start gap-3">
                      <Scale className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">
                          {isSpanish ? "Aspectos Legales Importantes:" : "Important Legal Aspects:"}
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• {isSpanish ? "La relación médico-paciente es directa entre tú y el paciente" : "The doctor-patient relationship is direct between you and the patient"}</li>
                          <li>• {isSpanish ? "NUREA no interviene en decisiones clínicas" : "NUREA does not intervene in clinical decisions"}</li>
                          <li>• {isSpanish ? "Debes tener seguro de responsabilidad profesional (recomendado)" : "You must have professional liability insurance (recommended)"}</li>
                          <li>• {isSpanish ? "Debes cumplir con normativas de telemedicina si ofreces consultas online" : "You must comply with telemedicine regulations if you offer online consultations"}</li>
                        </ul>
                      </div>
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
                  {isSpanish ? "¿Listo para unirte a NUREA?" : "Ready to join NUREA?"}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  {isSpanish 
                    ? "Comienza el proceso de registro y verificación. Nuestro equipo te ayudará en cada paso."
                    : "Start the registration and verification process. Our team will help you at every step."}
                </p>
                <Link href="/auth/register?role=professional">
                  <Button size="lg" className="w-full sm:w-auto">
                    {isSpanish ? "Registrarse como Profesional" : "Register as Professional"}
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

