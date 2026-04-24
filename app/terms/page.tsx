import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShieldCheck, FileText, Activity, DollarSign, AlertCircle, Mail } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-4 bg-teal-100 dark:bg-teal-900/30 rounded-full mb-6">
              <FileText className="h-8 w-8 text-teal-700 dark:text-teal-400" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Términos y Condiciones de Uso</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">Última actualización: Abril 2026</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <p className="lead text-lg mb-8 font-medium">
              Bienvenido a Nurea. Este documento establece los términos y condiciones de uso de nuestra plataforma. Al acceder y utilizar Nurea, usted acepta estos términos en su totalidad. Si no está de acuerdo, por favor no utilice nuestro servicio.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
              <Activity className="h-6 w-6 text-teal-600" />
              1. Naturaleza de Nurea
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Nurea es una plataforma digital que conecta pacientes con profesionales de la salud verificados. <strong>No somos un prestador de servicios de salud</strong>. La responsabilidad clínica, ética y legal de cada consulta recae exclusivamente en el profesional que la proporciona.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              Nurea facilita la comunicación, el agendamiento y la coordinación entre pacientes y profesionales, pero no:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2 mt-4">
              <li>Proporciona diagnósticos ni tratamientos médicos</li>
              <li>Interviene en decisiones clínicas</li>
              <li>Asume responsabilidad legal por actos médicos</li>
              <li>Actúa como intermediario financiero en consultas</li>
            </ul>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-teal-600" />
              2. Verificación de Profesionales
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Cada profesional en Nurea pasa por un proceso de verificación riguroso que incluye:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2 mt-4">
              <li>Validación de colegiatura activa contra registros oficiales</li>
              <li>Verificación de identidad mediante documentos acreditados</li>
              <li>Confirmación de especialidades y credenciales profesionales</li>
              <li>Revisión de antecedentes éticos y legales</li>
              <li>Auditorías periódicas de cumplimiento</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              La verificación no garantiza la calidad del servicio médico, pero sí que el profesional es quien dice ser y cumple con estándares legales y éticos básicos.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-teal-600" />
              3. Modelo Sin Comisiones
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              <strong>Pacientes:</strong> No pagáis comisión a Nurea. Pagáis únicamente al profesional la tarifa que ha definido. Nurea es gratis para pacientes.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              <strong>Profesionales:</strong> Podéis contratar un plan de suscripción (Profesional, Clínica) para acceder a herramientas de agenda, perfil y comunicación. Las tarifas de suscripción se facturan según el plan elegido y son completamente independientes del pago de vuestras consultas.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              No retenemos comisiones por consultas realizadas a través de la plataforma. El modelo es transparente: la suscripción cubre acceso a herramientas, no extracción de valor clínico.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-teal-600" />
              4. Limitaciones y Responsabilidad
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              <strong>Telemedicina:</strong> Aceptáis que la consulta en línea tiene limitaciones. No permite exámenes físicos directos y no es apropiada para emergencias. El profesional es responsable de determinar si es seguro atender de forma remota.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              <strong>Confidencialidad:</strong> Toda comunicación está cifrada extremo a extremo. Nurea no accede al contenido clínico de vuestras consultas.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              <strong>Limitación de Responsabilidad:</strong> Nurea proporciona la plataforma "tal cual". No somos responsables de:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2 mt-4">
              <li>Resultados clínicos de consultas realizadas en la plataforma</li>
              <li>Errores médicos o negligencia profesional</li>
              <li>Daños derivados de fallos técnicos (salvo negligencia grave nuestra)</li>
            </ul>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4">
              5. Cambios en estos Términos
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Podemos actualizar estos términos en cualquier momento. Los cambios serán notificados por correo a usuarios registrados. El uso continuado de Nurea tras una actualización implica aceptación de los nuevos términos. Os recomendamos que reviséis esta página periódicamente.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
              <Mail className="h-6 w-6 text-teal-600" />
              6. Contacto
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Si tenéis preguntas sobre estos términos, podéis contactarnos en:
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              <strong>Email:</strong> <a href="mailto:legal@nurea.com" className="text-teal-600 dark:text-teal-400 hover:underline">legal@nurea.com</a>
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              <strong>Dirección:</strong> Nurea Health, S.L., Madrid y Ciudad de México
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
