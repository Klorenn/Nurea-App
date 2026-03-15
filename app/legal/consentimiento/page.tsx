import { Metadata } from "next"
import { Video, Calendar, Mail, AlertTriangle, Phone, Lock, MonitorX } from "lucide-react"

export const metadata: Metadata = {
  title: "Consentimiento Informado para Telemedicina",
  description: "Consentimiento informado para servicios de telemedicina en NUREA. Comprenda los beneficios, riesgos y limitaciones de la atención médica remota.",
}

export default function ConsentimientoPage() {
  return (
    <>
      {/* Header Section */}
      <div className="not-prose mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400 mb-4">
          <Video className="h-6 w-6" />
          <span className="text-sm font-medium uppercase tracking-wider">Consentimiento</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Consentimiento Informado para Telemedicina
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

      {/* Emergency Warning - Most Important */}
      <div className="not-prose mb-10 p-5 bg-red-50 dark:bg-red-950/30 rounded-xl border-2 border-red-300 dark:border-red-800">
        <div className="flex gap-4">
          <Phone className="h-8 w-8 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-red-800 dark:text-red-200 text-lg mb-2">
              ⚠️ NUREA NO ES UN SERVICIO DE URGENCIAS
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              Si usted está experimentando una <strong>emergencia médica, riesgo vital, pensamientos 
              suicidas o dolor de pecho severo</strong>:
            </p>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              <li>• <strong>Cierre esta aplicación inmediatamente</strong></li>
              <li>• Acuda al servicio de urgencias más cercano</li>
              <li>• Llame al <strong className="text-xl">131</strong> (SAMU)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Content */}
      <section>
        <h2>1. ¿Qué es la Telemedicina?</h2>
        <p>
          La telemedicina es la prestación de servicios de salud a distancia mediante tecnologías 
          de la información y comunicación (<strong>videollamadas, chat</strong>).
        </p>
        <p>
          Al utilizar NUREA, usted acepta recibir atención bajo esta modalidad, entendiendo que 
          se trata de una alternativa legítima y segura para muchos tipos de consultas médicas.
        </p>
      </section>

      <section>
        <h2>2. Limitaciones del Servicio</h2>
        
        <div className="not-prose my-6 p-5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
          <div className="flex gap-4">
            <MonitorX className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Importante Comprender
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                La telemedicina tiene limitaciones inherentes, principalmente la <strong>imposibilidad 
                de realizar un examen físico presencial</strong>.
              </p>
            </div>
          </div>
        </div>

        <p>
          El profesional de la salud evaluará si su condición puede ser tratada de forma remota o 
          si requiere <strong>derivación a un centro médico presencial</strong>.
        </p>
        <p>
          Algunas condiciones de salud no pueden ser diagnosticadas o tratadas adecuadamente sin 
          un examen físico directo. En estos casos, el profesional le indicará los pasos a seguir.
        </p>
      </section>

      <section>
        <h2>3. Situaciones de Emergencia</h2>
        <p>
          <strong>NUREA NO ES UN SERVICIO DE URGENCIAS.</strong>
        </p>
        <p>
          Si usted está experimentando:
        </p>
        <ul>
          <li>Una emergencia médica o riesgo vital</li>
          <li>Pensamientos suicidas o de autolesión</li>
          <li>Dolor de pecho severo</li>
          <li>Dificultad respiratoria grave</li>
          <li>Pérdida de conciencia</li>
          <li>Sangrado abundante</li>
        </ul>
        <p>
          <strong>Cierre esta aplicación inmediatamente</strong> y acuda al servicio de urgencias 
          más cercano o llame al <strong>131 (SAMU)</strong>.
        </p>
      </section>

      <section>
        <h2>4. Confidencialidad Continua</h2>
        
        <div className="not-prose my-6 p-5 bg-slate-900 dark:bg-slate-800 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-6 w-6 text-teal-400" />
            <h4 className="font-semibold text-white">Privacidad Total</h4>
          </div>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-teal-400 mt-0.5">🔒</span>
              <span>
                La videollamada entre usted y el profesional es <strong className="text-white">estrictamente 
                confidencial</strong> y está encriptada de extremo a extremo
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-400 mt-0.5">🚫</span>
              <span>
                NUREA <strong className="text-white">no graba ni almacena</strong> el video o audio de 
                sus consultas por motivos de privacidad
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-400 mt-0.5">👨‍⚕️</span>
              <span>
                Solo usted y su profesional de salud tienen acceso al contenido de la consulta
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2>5. Aceptación del Consentimiento</h2>
        <p>
          Al utilizar los servicios de telemedicina de NUREA, usted declara que:
        </p>
        <ul>
          <li>Ha leído y comprendido este documento de consentimiento informado</li>
          <li>Entiende las limitaciones de la telemedicina</li>
          <li>Acepta voluntariamente recibir atención médica bajo esta modalidad</li>
          <li>Comprende que NUREA no es un servicio de urgencias</li>
        </ul>
      </section>

      {/* Contact Section */}
      <div className="not-prose mt-12 p-6 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          ¿Tienes preguntas sobre el consentimiento?
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Si tienes dudas sobre este documento o sobre cómo funciona la telemedicina:
        </p>
        <div className="flex flex-wrap gap-4">
          <a 
            href="mailto:soporte@nurea.app"
            className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline font-medium"
          >
            <Mail className="h-4 w-4" />
            soporte@nurea.app
          </a>
          <span className="text-slate-400">|</span>
          <a 
            href="/support"
            className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
          >
            Centro de Ayuda
          </a>
        </div>
      </div>
    </>
  )
}
