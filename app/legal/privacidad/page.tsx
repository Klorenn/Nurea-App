import { Metadata } from "next"
import { Shield, Calendar, Mail, Database, Lock, UserX, FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "Aviso de Privacidad y Manejo de Datos",
  description: "Política de privacidad y protección de datos personales de NUREA. Conoce cómo recopilamos, usamos y protegemos tu información.",
}

export default function PrivacidadPage() {
  return (
    <>
      {/* Header Section */}
      <div className="not-prose mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400 mb-4">
          <Shield className="h-6 w-6" />
          <span className="text-sm font-medium uppercase tracking-wider">Privacidad</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Aviso de Privacidad y Manejo de Datos
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

      {/* Key Promise */}
      <div className="not-prose mb-10 p-5 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800">
        <div className="flex gap-4">
          <UserX className="h-6 w-6 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">
              Nuestra Promesa
            </h4>
            <p className="text-sm text-teal-700 dark:text-teal-300">
              NUREA <strong>nunca venderá, alquilará ni compartirá</strong> sus datos médicos con 
              terceros (como farmacéuticas o aseguradoras) sin su consentimiento expreso.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <section>
        <h2>1. Información que Recopilamos</h2>
        <p>
          Para ofrecer nuestros servicios, NUREA recopila los siguientes tipos de información:
        </p>

        <div className="not-prose my-6 grid gap-4">
          <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-medium text-slate-900 dark:text-white">Datos de Identificación</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nombre completo, RUT, fecha de nacimiento
            </p>
          </div>

          <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h4 className="font-medium text-slate-900 dark:text-white">Datos de Contacto</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Correo electrónico, número de teléfono
            </p>
          </div>

          <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h4 className="font-medium text-slate-900 dark:text-white">Datos Sensibles de Salud</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Historial médico, diagnósticos, recetas y notas clínicas generados durante el uso de la plataforma
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>2. Uso de la Información</h2>
        <p>
          Sus datos personales y médicos son utilizados <strong>exclusivamente</strong> para:
        </p>
        <ul>
          <li>
            <strong>Facilitar la consulta de telemedicina</strong> con el profesional elegido
          </li>
          <li>
            <strong>Mantener su Ficha Clínica Electrónica</strong> accesible para usted y su médico tratante
          </li>
          <li>
            <strong>Procesar pagos</strong> y emitir comprobantes o boletas de honorarios
          </li>
        </ul>
        <p>
          No utilizamos sus datos para ningún otro fin sin su consentimiento expreso.
        </p>
      </section>

      <section>
        <h2>3. Privacidad y Terceros</h2>
        <p>
          NUREA <strong>nunca venderá, alquilará ni compartirá</strong> sus datos médicos con terceros 
          (como farmacéuticas o aseguradoras) sin su consentimiento expreso.
        </p>
        <p>
          Sus datos <strong>solo son compartidos</strong> con el profesional de la salud con el que usted 
          decide agendar una cita. Esta información es necesaria para que el profesional pueda brindarle 
          una atención adecuada.
        </p>
      </section>

      <section>
        <h2>4. Seguridad de la Información</h2>
        
        <div className="not-prose my-6 p-5 bg-slate-900 dark:bg-slate-800 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-6 w-6 text-teal-400" />
            <h4 className="font-semibold text-white">Protección de Grado Militar</h4>
          </div>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-teal-400 mt-0.5">🔐</span>
              <span>
                <strong className="text-white">Encriptación de grado militar</strong> tanto en 
                tránsito (TLS 1.3) como en reposo (AES-256)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-400 mt-0.5">🛡️</span>
              <span>
                <strong className="text-white">Políticas de Seguridad a Nivel de Fila (RLS)</strong> que 
                garantizan que nadie, excepto usted y su médico tratante, pueda acceder a su 
                información clínica
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-400 mt-0.5">☁️</span>
              <span>
                <strong className="text-white">Infraestructura en la nube</strong> con los más altos 
                estándares de seguridad y certificaciones internacionales
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Contact Section */}
      <div className="not-prose mt-12 p-6 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          ¿Preguntas sobre tu privacidad?
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Si tienes dudas sobre cómo manejamos tus datos, contáctanos:
        </p>
        <a 
          href="mailto:privacidad@nurea.app"
          className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline font-medium"
        >
          <Mail className="h-4 w-4" />
          privacidad@nurea.app
        </a>
      </div>
    </>
  )
}
