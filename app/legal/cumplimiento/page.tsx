import { Metadata } from "next"
import { Scale, Calendar, Mail, ShieldCheck, Globe, Eye, Edit, Trash2, Ban } from "lucide-react"

export const metadata: Metadata = {
  title: "Cumplimiento Normativo",
  description: "Cumplimiento de NUREA con la Ley 19.628 de Protección de Datos de Chile y estándares internacionales como HIPAA.",
}

export default function CumplimientoPage() {
  return (
    <>
      {/* Header Section */}
      <div className="not-prose mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400 mb-4">
          <Scale className="h-6 w-6" />
          <span className="text-sm font-medium uppercase tracking-wider">Cumplimiento Regulatorio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Cumplimiento Normativo
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Ley 19.628 y Estándares Internacionales
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Última actualización: 14 de marzo de 2026</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>Versión 1.0</span>
        </div>
      </div>

      {/* Compliance Badges */}
      <div className="not-prose mb-10 grid gap-4 sm:grid-cols-2">
        <div className="p-5 bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/30 dark:to-slate-900 rounded-xl border border-teal-200 dark:border-teal-800">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            <h4 className="font-semibold text-slate-900 dark:text-white">Ley 19.628</h4>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Cumplimiento estricto con la legislación chilena de Protección de la Vida Privada
          </p>
        </div>
        <div className="p-5 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-slate-900 dark:text-white">Estándares HIPAA</h4>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Arquitectura diseñada basándose en lineamientos de clase mundial
          </p>
        </div>
      </div>

      {/* Content */}
      <section>
        <h2>1. Ley 19.628 sobre Protección de la Vida Privada (Chile)</h2>
        <p>
          NUREA cumple <strong>estrictamente</strong> con la legislación chilena vigente respecto al 
          tratamiento de datos personales y datos sensibles.
        </p>
        <p>
          Entendemos que la información de salud requiere el <strong>nivel más alto de confidencialidad</strong>, 
          y por ello hemos implementado todas las medidas técnicas y organizativas necesarias para 
          garantizar su protección.
        </p>
      </section>

      <section>
        <h2>2. Derechos ARCO del Paciente</h2>
        <p>
          Todo usuario de NUREA tiene derecho a ejercer los <strong>Derechos ARCO</strong> sobre sus datos personales:
        </p>

        <div className="not-prose my-6 grid gap-4">
          <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Acceso</h4>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">A</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Conocer qué datos personales tenemos en nuestro sistema y cómo los utilizamos.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Rectificación</h4>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">R</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Solicitar la corrección de datos inexactos o incompletos.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Cancelación</h4>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">C</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Solicitar la eliminación de su cuenta y datos.
              <span className="block mt-1 text-xs text-slate-500 dark:text-slate-400">
                * Sujeto a las obligaciones legales de retención de fichas clínicas reguladas por el Ministerio de Salud
              </span>
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <Ban className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Oposición</h4>
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">O</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Oponerse al uso de sus datos para fines específicos.
            </p>
          </div>
        </div>

        <p>
          Para ejercer estos derechos, puede contactar a nuestro equipo de Privacidad a través 
          de <strong>soporte@nurea.app</strong>.
        </p>
      </section>

      <section>
        <h2>3. Inspiración en Estándares HIPAA</h2>
        <p>
          Aunque la ley <strong>HIPAA</strong> (Health Insurance Portability and Accountability Act) es 
          una normativa de los Estados Unidos, en NUREA hemos diseñado nuestra arquitectura de software 
          basándonos en sus estrictos lineamientos de seguridad.
        </p>
        
        <div className="not-prose my-6 p-5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
            Implementamos controles basados en HIPAA:
          </h4>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✓</span>
              <span><strong>Seguridad Técnica:</strong> Encriptación, controles de acceso, auditoría</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✓</span>
              <span><strong>Seguridad Física:</strong> Centros de datos certificados</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✓</span>
              <span><strong>Seguridad Administrativa:</strong> Políticas, capacitación, gestión de riesgos</span>
            </li>
          </ul>
        </div>

        <p>
          Esto garantiza que la plataforma cumpla con <strong>estándares de clase mundial</strong> en 
          la protección de información de salud.
        </p>
      </section>

      {/* Contact Section */}
      <div className="not-prose mt-12 p-6 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Ejercer tus Derechos ARCO
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Para consultas sobre cumplimiento o para ejercer tus derechos, contacta a nuestro equipo:
        </p>
        <a 
          href="mailto:soporte@nurea.app"
          className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline font-medium"
        >
          <Mail className="h-4 w-4" />
          soporte@nurea.app
        </a>
      </div>
    </>
  )
}
