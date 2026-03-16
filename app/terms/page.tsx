import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShieldCheck, FileText, Activity } from "lucide-react"

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
            <p className="text-lg text-slate-600 dark:text-slate-400">Última actualización: Marzo 2026</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <p className="lead text-lg mb-8 font-medium">
              Este documento establece los lineamientos contractuales entre NUREA ("la Plataforma") y el usuario (Pacientes y Profesionales). Al utilizar nuestros servicios, usted acepta íntegramente estos términos, diseñados conforme a la normativa chilena aplicable (Leyes 20.584 y 19.628).
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
              <Activity className="h-6 w-6 text-teal-600" />
              1. Naturaleza del Servicio
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              NUREA es una <strong>plataforma tecnológica de intermediación</strong>. No somos un prestador institucional de salud ni un centro médico, y no prestamos servicios de salud por nosotros mismos. La responsabilidad legal, clínica y ética del acto médico recae exclusiva y enteramente sobre el profesional de salud con quien usted agenda la cita.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-teal-600" />
              2. Verificación de Especialistas ("Protocolo de Sello")
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Los profesionales de la salud declaran bajo juramento que toda la información entregada a la Plataforma es verídica y verificable. Los profesionales autorizan expresamente a NUREA a:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2 mt-4">
              <li>Validar su Registro Nacional de Prestadores Individuales (RNPI) contra la base de datos oficial de la Superintendencia de Salud de Chile.</li>
              <li>Requerir la carga de su Cédula de Identidad y Certificados de Título en nuestros servidores de control (KYP).</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              <strong>Nota de Seguridad:</strong> Cualquier intento de modificación posterior de datos críticos (como el RNPI, la Especialidad o el Nombre Completo) resultará en la inmediata cancelación temporal de su perfil público y en el bloqueo automático bajo nuestro "Sello de Verificación" hasta que se complete una nueva auditoría manual.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4">
              3. Comisiones, Agendamiento y Pagos
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Los pagos realizados mediante NUREA son procesados a través de intermediarios financieros regulados (Stripe). NUREA retiene, de manera automática, una <strong>comisión del 5%</strong> sobre el costo de la consulta del profesional por concepto de costos de intermediación, pasarela de pagos y mantenimiento de la plataforma tecnológica. 
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              Los reembolsos al paciente derivadas de inasistencias injustificadas por parte del profesional se gestionarán íntegramente a través de la plataforma, restituyendo los fondos al usuario con base en los protocolos operativos.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4">
              4. Condiciones sobre Telemedicina
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Al hacer uso del servicio de consulta en línea, el paciente acepta de manera expresa e informada que <strong>la telemedicina tiene limitaciones intrínsecas</strong>. Este formato remoto no permite exámenes físicos directos ni evaluaciones exhaustivas de emergencia, y por tanto, no reemplaza la urgencia presencial.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              El profesional médico es el único responsable técnico de determinar si los síntomas y condiciones del paciente son aptos para ser tratados de forma digital, o si requieren derivación obligatoria y física a un centro de salud de forma inmediata.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
