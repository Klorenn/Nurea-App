import os

terms_content = """import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShieldCheck, FileText, Activity, DollarSign, AlertCircle, Mail } from "lucide-react"
import '../landing.css'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <Navbar />
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-medium text-[var(--ink)] mb-4 serif tracking-tight">
              Términos y Condiciones
            </h1>
            <p className="text-lg text-[var(--ink-soft)]">Última actualización: Abril 2026</p>
          </div>

          <div className="space-y-16 text-[17px] leading-[1.7] text-[var(--ink-soft)]">
            <section>
              <p className="text-xl font-medium text-[var(--ink)] leading-snug mb-8">
                Bienvenido a Nurea. Este documento establece los términos y condiciones de uso de nuestra plataforma. Al acceder y utilizar Nurea, usted acepta estos términos en su totalidad.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-[var(--ink)] mb-6 flex items-center gap-3 serif">
                <Activity className="h-6 w-6 text-[var(--sage-700)]" />
                1. Naturaleza de Nurea
              </h2>
              <p className="mb-4">
                Nurea es una plataforma digital que conecta pacientes con profesionales de la salud verificados. <strong className="text-[var(--ink)] font-semibold">No somos un prestador de servicios de salud</strong>. La responsabilidad clínica, ética y legal de cada consulta recae exclusivamente en el profesional que la proporciona.
              </p>
              <p className="mb-4">
                Nurea facilita la comunicación, el agendamiento y la coordinación entre pacientes y profesionales, pero no:
              </p>
              <ul className="list-disc pl-6 space-y-3 marker:text-[var(--sage-300)]">
                <li>Proporciona diagnósticos ni tratamientos médicos.</li>
                <li>Interviene en decisiones clínicas.</li>
                <li>Asume responsabilidad legal por actos médicos.</li>
                <li>Actúa como intermediario financiero en consultas.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-[var(--ink)] mb-6 flex items-center gap-3 serif">
                <ShieldCheck className="h-6 w-6 text-[var(--sage-700)]" />
                2. Verificación de Profesionales
              </h2>
              <p className="mb-4">
                Cada profesional en Nurea pasa por un proceso de verificación riguroso que incluye:
              </p>
              <ul className="list-disc pl-6 space-y-3 marker:text-[var(--sage-300)]">
                <li>Validación de colegiatura activa contra registros oficiales.</li>
                <li>Verificación de identidad mediante documentos acreditados.</li>
                <li>Confirmación de especialidades y credenciales profesionales.</li>
                <li>Revisión de antecedentes éticos y legales.</li>
              </ul>
              <p className="mt-6 p-6 bg-[var(--sage-100)] rounded-2xl text-[var(--ink)]">
                La verificación no garantiza la calidad del servicio médico, pero sí que el profesional es quien dice ser y cumple con estándares legales y éticos básicos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-[var(--ink)] mb-6 flex items-center gap-3 serif">
                <DollarSign className="h-6 w-6 text-[var(--sage-700)]" />
                3. Modelo Sin Comisiones
              </h2>
              <p className="mb-4">
                <strong className="text-[var(--ink)] font-semibold">Pacientes:</strong> No pagan comisión a Nurea. Pagan únicamente al profesional la tarifa que ha definido. Nurea es gratis para pacientes.
              </p>
              <p className="mb-4">
                <strong className="text-[var(--ink)] font-semibold">Profesionales:</strong> Pueden contratar un plan de suscripción para acceder a herramientas de agenda, perfil y comunicación. Las tarifas se facturan según el plan elegido y son completamente independientes del pago de consultas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-[var(--ink)] mb-6 flex items-center gap-3 serif">
                <AlertCircle className="h-6 w-6 text-[var(--sage-700)]" />
                4. Limitaciones y Responsabilidad
              </h2>
              <p className="mb-4">
                <strong className="text-[var(--ink)] font-semibold">Telemedicina:</strong> Acepta que la consulta en línea tiene limitaciones. No permite exámenes físicos directos y no es apropiada para emergencias.
              </p>
              <p className="mb-4">
                <strong className="text-[var(--ink)] font-semibold">Confidencialidad:</strong> Toda comunicación está cifrada extremo a extremo. Nurea no accede al contenido clínico.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-[var(--ink)] mb-6 flex items-center gap-3 serif">
                <Mail className="h-6 w-6 text-[var(--sage-700)]" />
                5. Contacto Legal
              </h2>
              <div className="p-8 border border-[var(--line)] rounded-2xl">
                <p className="mb-2"><strong>Email:</strong> <a href="mailto:legal@nurea.app" className="text-[var(--sage-700)] hover:underline">legal@nurea.app</a></p>
                <p><strong>Dirección:</strong> Nurea Health, SpA, Santiago, Chile</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
"""

privacy_content = """import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShieldCheck, Lock, EyeOff, Database, Share2, User, Cookie } from "lucide-react"
import '../landing.css'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <Navbar />
      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-medium text-[var(--ink)] mb-4 serif tracking-tight">
              Política de Privacidad
            </h1>
            <p className="text-lg text-[var(--ink-soft)]">Última actualización: Abril 2026</p>
          </div>

          <div className="space-y-16 text-[17px] leading-[1.7] text-[var(--ink-soft)]">
            <section>
              <p className="text-xl font-medium text-[var(--ink)] leading-snug mb-8">
                La privacidad es fundamental en Nurea. Este documento explica qué datos recopilamos, cómo los utilizamos, cómo los protegemos y sus derechos respecto a ellos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-[var(--ink)] mb-6 flex items-center gap-3 serif">
                <Database className="h-6 w-6 text-[var(--sage-700)]" />
                1. Qué Datos Recopilamos
              </h2>
              <ul className="list-disc pl-6 space-y-3 marker:text-[var(--sage-300)] mb-6">
                <li><strong className="text-[var(--ink)] font-semibold">Datos de Registro:</strong> Nombre, correo, teléfono, tipo de cuenta.</li>
                <li><strong className="text-[var(--ink)] font-semibold">Datos Médicos:</strong> Para pacientes, historial de citas. Para profesionales, colegiatura y especialidades.</li>
                <li><strong className="text-[var(--ink)] font-semibold">Interacción:</strong> Mensajes cifrados y registros de acceso.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-[var(--ink)] mb-6 flex items-center gap-3 serif">
                <ShieldCheck className="h-6 w-6 text-[var(--sage-700)]" />
                2. Cómo Utilizamos los Datos
              </h2>
              <p className="mb-4">Utilizamos sus datos para proporcionar el servicio, procesar suscripciones y verificar identidades. <strong className="text-[var(--ink)] font-semibold">Nunca vendemos datos personales a terceros.</strong></p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-[var(--ink)] mb-6 flex items-center gap-3 serif">
                <Lock className="h-6 w-6 text-[var(--sage-700)]" />
                3. Protección y Cifrado
              </h2>
              <p className="mb-4">
                Protegemos la información mediante <strong className="text-[var(--ink)] font-semibold">cifrado extremo a extremo</strong>. Ni siquiera el equipo de Nurea puede acceder al contenido clínico de sus consultas o mensajes.
              </p>
              <div className="p-6 bg-[var(--sage-100)] rounded-2xl text-[var(--ink)] mt-6">
                Cumplimos con las normativas locales e internacionales de protección de datos aplicables a servicios de salud digital.
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-[var(--ink)] mb-6 flex items-center gap-3 serif">
                <User className="h-6 w-6 text-[var(--sage-700)]" />
                4. Sus Derechos
              </h2>
              <p className="mb-4">
                Tiene derecho a acceder, rectificar, cancelar (Derecho al Olvido) o solicitar la portabilidad de sus datos en cualquier momento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-[var(--ink)] mb-6 flex items-center gap-3 serif">
                <Mail className="h-6 w-6 text-[var(--sage-700)]" />
                5. Contacto de Privacidad
              </h2>
              <div className="p-8 border border-[var(--line)] rounded-2xl">
                <p className="mb-2"><strong>Email:</strong> <a href="mailto:privacy@nurea.app" className="text-[var(--sage-700)] hover:underline">privacy@nurea.app</a></p>
                <p><strong>Dirección:</strong> Nurea Health, SpA, Santiago, Chile</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
"""

with open("app/terms/page.tsx", "w") as f:
    f.write(terms_content)
    
with open("app/privacy/page.tsx", "w") as f:
    f.write(privacy_content)

print("Updated legal pages.")
