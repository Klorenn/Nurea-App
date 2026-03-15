import { Metadata } from "next"
import { FileText, Calendar, Mail, ShieldCheck, CreditCard, Users, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Términos y Condiciones de Servicio",
  description: "Términos y condiciones de uso de la plataforma NUREA para servicios de telemedicina en Chile.",
}

export default function TerminosPage() {
  return (
    <>
      {/* Header Section */}
      <div className="not-prose mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400 mb-4">
          <FileText className="h-6 w-6" />
          <span className="text-sm font-medium uppercase tracking-wider">Documento Legal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Términos y Condiciones de Servicio
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Última actualización: 14 de marzo de 2026</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>Versión 1.0</span>
        </div>
      </div>

      {/* Content */}
      <section>
        <div className="not-prose mb-8 flex items-start gap-4 p-5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <AlertCircle className="h-6 w-6 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Resumen Importante</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              NUREA es una plataforma tecnológica que conecta pacientes con profesionales de salud 
              verificados. No somos un centro médico. La responsabilidad de la atención médica 
              recae en el profesional tratante.
            </p>
          </div>
        </div>

        <h2>1. Naturaleza del Servicio</h2>
        <p>
          NUREA es una <strong>plataforma tecnológica</strong> que facilita la conexión entre pacientes 
          y profesionales de la salud debidamente verificados. NUREA actúa exclusivamente como 
          <strong> intermediario tecnológico</strong> y proveedor de software de gestión.
        </p>
        <p>
          NUREA <strong>no es un centro médico, hospital ni proveedor de servicios de salud directo</strong>. 
          La responsabilidad de la atención médica, diagnósticos y tratamientos recae única y 
          exclusivamente en el profesional de la salud tratante.
        </p>
      </section>

      <section>
        <h2>2. Verificación de Profesionales</h2>
        <div className="not-prose my-6 p-5 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            <h4 className="font-semibold text-slate-900 dark:text-white">Garantía NUREA</h4>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            El 100% de los profesionales en NUREA están verificados en la Superintendencia de Salud de Chile.
          </p>
        </div>
        <p>
          Todo profesional que ofrezca sus servicios en NUREA debe contar con su <strong>título habilitante</strong> y 
          estar inscrito en el <strong>Registro Nacional de Prestadores Individuales (RNPI)</strong> de la 
          Superintendencia de Salud de Chile.
        </p>
        <p>
          NUREA se reserva el derecho de suspender o eliminar cualquier cuenta que no cumpla con este 
          requisito en cualquier momento.
        </p>
      </section>

      <section>
        <h2>3. Política de Pagos y Cancelaciones</h2>
        <p className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Protección Mutua mediante Depósito en Garantía
        </p>
        <p>
          Para garantizar la seriedad de las reservas, NUREA utiliza un sistema de <strong>&quot;Depósito en Garantía&quot;</strong>. 
          Al agendar, el pago del paciente queda resguardado de forma segura.
        </p>

        <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
          <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Cancelaciones del Paciente</h4>
            </div>
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Cancelación con <strong>+48 horas</strong>: reembolso del 100%</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✗</span>
                <span>Inasistencias (no-show) o cancelaciones tardías: sin reembolso</span>
              </li>
            </ul>
          </div>

          <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Cancelaciones del Profesional</h4>
            </div>
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Si el profesional no asiste o cancela: <strong>reembolso íntegro y automático</strong></span>
              </li>
            </ul>
          </div>
        </div>

        <p>
          Este sistema protege el tiempo del profesional ante cancelaciones de último momento, 
          mientras garantiza la seguridad del dinero del paciente.
        </p>
      </section>

      <section>
        <h2>4. Uso Adecuado de la Plataforma</h2>
        <p>Los usuarios se comprometen a:</p>
        <ul>
          <li>Proporcionar <strong>información veraz</strong> en todo momento</li>
          <li>Mantener un <strong>trato respetuoso</strong> con profesionales y otros usuarios</li>
          <li>Utilizar el sistema de videollamadas y mensajería <strong>exclusivamente para fines relacionados con su salud y bienestar</strong></li>
        </ul>
        <p>
          El incumplimiento de estas normas puede resultar en la suspensión o eliminación de la cuenta.
        </p>
      </section>

      {/* Contact Section */}
      <div className="not-prose mt-12 p-6 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          ¿Tienes preguntas?
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Si tienes dudas sobre estos Términos de Servicio, contáctanos:
        </p>
        <a 
          href="mailto:legal@nurea.app"
          className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline font-medium"
        >
          <Mail className="h-4 w-4" />
          legal@nurea.app
        </a>
      </div>
    </>
  )
}
