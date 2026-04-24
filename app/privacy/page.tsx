import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShieldCheck, Lock, EyeOff, Database, Share2, User, Cookie } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-4 bg-teal-100 dark:bg-teal-900/30 rounded-full mb-6">
              <Lock className="h-8 w-8 text-teal-700 dark:text-teal-400" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Política de Privacidad</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">Última actualización: Abril 2026</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <p className="lead text-lg mb-8 font-medium">
              La privacidad es fundamental en Nurea. Este documento explica qué datos recopilamos, cómo los utilizamos, cómo los protegemos y vuestros derechos respecto a ellos.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
              <Database className="h-6 w-6 text-teal-600" />
              1. Qué Datos Recopilamos
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              <strong>Datos de Registro:</strong> Nombre, correo electrónico, teléfono, fecha de nacimiento, tipo de cuenta (paciente/profesional).
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              <strong>Datos Médicos/Profesionales:</strong>
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2 mt-2">
              <li>Para pacientes: Especialidades de interés, historial de citas, notas clínicas compartidas</li>
              <li>Para profesionales: Colegiatura, especialidades, documentos de verificación, disponibilidad, tarifas</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              <strong>Datos de Interacción:</strong> Mensajes cifrados, pagos de suscripción, registros de acceso, datos de uso de la plataforma.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              <strong>Datos Técnicos:</strong> Dirección IP, tipo de dispositivo, navegador, idioma, ubicación aproximada.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-teal-600" />
              2. Cómo Utilizamos Vuestros Datos
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Utilizamos vuestros datos para:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2 mt-4">
              <li>Proporcionar y mejorar nuestro servicio</li>
              <li>Facilitar la comunicación entre pacientes y profesionales</li>
              <li>Procesar pagos de suscripción</li>
              <li>Verificar identidades y credenciales de profesionales</li>
              <li>Enviar notificaciones sobre citas y cambios en la plataforma</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Analizar tendencias de uso para mejorar la experiencia</li>
              <li>Prevenir fraude y abusos</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              <strong>Nunca vendemos datos personales a terceros.</strong>
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-teal-600" />
              3. Protección de Datos
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Vuestros datos están protegidos mediante:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2 mt-4">
              <li><strong>Cifrado extremo a extremo:</strong> Mensajes y notas clínicas son cifrados y solo vosotros (paciente y profesional) podéis acceder</li>
              <li><strong>Cifrado en tránsito (TLS):</strong> Todos los datos en movimiento están encriptados</li>
              <li><strong>Almacenamiento seguro:</strong> Servidores protegidos con contraseñas fuertes, autenticación multi-factor y auditoría</li>
              <li><strong>Control de acceso:</strong> Solo personal autorizado accede a datos, y únicamente cuando es necesario</li>
              <li><strong>Conformidad:</strong> Cumplimos con RGPD, CCPA y normativas de protección de datos aplicables</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              Nurea como corporación <strong>no puede</strong> acceder unilateralmente al contenido de vuestras comunicaciones clínicas.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
              <Share2 className="h-6 w-6 text-teal-600" />
              4. Compartir Datos con Terceros
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Solo compartimos datos cuando:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2 mt-4">
              <li><strong>Vosotros lo autorizáis explícitamente</strong> (p.ej., para descargar un informe clínico)</li>
              <li><strong>Es necesario para proporcionar el servicio</strong> (p.ej., procesadores de pagos como MercadoPago, que tienen sus propias políticas de privacidad)</li>
              <li><strong>Por requerimiento legal</strong> (orden judicial, cuerpos de seguridad pública)</li>
              <li><strong>Para detectar fraude o abusos</strong> (bajo supervisión legal estricta)</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              Los datos clínicos nunca se comparten con terceros comerciales, publicitarios o de análisis.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
              <User className="h-6 w-6 text-teal-600" />
              5. Vuestros Derechos
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Tenéis derecho a:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2 mt-4">
              <li><strong>Acceso:</strong> Solicitar una copia de todos vuestros datos</li>
              <li><strong>Rectificación:</strong> Corregir datos incorrectos</li>
              <li><strong>Cancelación (Derecho al Olvido):</strong> Solicitar eliminación de vuestros datos, sujeto a obligaciones legales</li>
              <li><strong>Portabilidad:</strong> Recibir vuestros datos en formato transferible</li>
              <li><strong>Oposición:</strong> OponerOS a ciertos usos de vuestros datos</li>
              <li><strong>Restricción:</strong> Limitar cómo utilizamos vuestros datos</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              Para ejercer estos derechos, contactad con <a href="mailto:privacy@nurea.com" className="text-teal-600 dark:text-teal-400 hover:underline">privacy@nurea.com</a>. Responderemos en un plazo de 30 días.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
              <Cookie className="h-6 w-6 text-teal-600" />
              6. Cookies y Tecnologías Similares
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Utilizamos cookies para:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2 mt-4">
              <li><strong>Cookies esenciales:</strong> Mantener vuestrá sesión y autenticación</li>
              <li><strong>Cookies de preferencia:</strong> Recordar vuestras preferencias de idioma y tema</li>
              <li><strong>Cookies de análisis:</strong> Entender cómo usáis Nurea (a través de herramientas como Google Analytics)</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              Podéis desactivar cookies no esenciales en vuestras preferencias. Esto puede afectar a algunas funcionalidades.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
              <EyeOff className="h-6 w-6 text-teal-600" />
              7. Retención de Datos
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              <strong>Cuentas activas:</strong> Conservamos vuestros datos mientras vuestra cuenta esté activa.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              <strong>Cuentas desactivadas:</strong> Conservamos los datos durante 60 días para permitiros reactivar la cuenta. Después, se eliminan, salvo:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2 mt-4">
              <li>Datos requeridos por ley (p.ej., registros fiscales)</li>
              <li>Datos necesarios para resolver disputas</li>
              <li>Datos anonimizados para análisis</li>
            </ul>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4">
              8. Cambios en esta Política
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Podemos actualizar esta política ocasionalmente. Os notificaremos por correo sobre cambios significativos. El uso continuado de Nurea implica aceptación de la política actualizada.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-10 mb-4">
              9. Contacto
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Si tenéis preguntas sobre privacidad o deseáis ejercer vuestros derechos:
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              <strong>Email:</strong> <a href="mailto:privacy@nurea.com" className="text-teal-600 dark:text-teal-400 hover:underline">privacy@nurea.com</a>
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              <strong>Dirección:</strong> Nurea Health, S.L., Madrid y Ciudad de México
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              <strong>DPO (Delegado de Protección de Datos):</strong> <a href="mailto:dpo@nurea.com" className="text-teal-600 dark:text-teal-400 hover:underline">dpo@nurea.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
