"use client"

import { Navbar } from "@/components/navbar"
import { StackedCircularFooter } from "@/components/ui/stacked-circular-footer"
import { ShieldCheck, Database, Heart, Eye, Users, Lock, Cookie, Mail, FileText } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 md:pt-28 md:pb-16">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Política de Privacidad de NUREA
            </h1>
            <p className="text-sm text-muted-foreground">
              Última actualización: Enero 2025
            </p>
          </div>

          {/* Introduction */}
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              En <strong className="text-foreground">NUREA</strong>, tu privacidad es fundamental. Queremos que sepas, de forma clara, cómo cuidamos tu información.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Esta política se rige por la legislación chilena vigente, especialmente la <strong className="text-foreground">Ley Nº 19.628 sobre Protección de la Vida Privada</strong>. Está escrita en lenguaje simple porque creemos que debes entender cómo protegemos tus datos, sin necesidad de ser abogado.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong className="text-foreground">Nuestra promesa:</strong> No vendemos ni compartimos tu información con terceros para marketing. Solo usamos tus datos para hacer que NUREA funcione mejor para ti.
            </p>
          </div>

          <div className="border-t border-border/40 pt-8"></div>

          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">1. Información que recopilamos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Solo recopilamos la información necesaria para que NUREA funcione. Esto incluye:
                </p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                  <li><strong className="text-foreground">Datos básicos:</strong> Nombre, correo electrónico, teléfono (si lo proporcionas).</li>
                  <li><strong className="text-foreground">Perfil:</strong> Información que eliges compartir en tu perfil (especialidad, ubicación, etc.).</li>
                  <li><strong className="text-foreground">Citas:</strong> Fechas, horarios y profesionales con quienes agendas.</li>
                  <li><strong className="text-foreground">Técnica:</strong> Información básica de tu dispositivo y navegador para mejorar la seguridad.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  <strong className="text-foreground">Lo que NO recopilamos:</strong> No pedimos información médica detallada, historiales clínicos completos, ni datos que no sean necesarios para usar la plataforma.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">2. Para qué usamos tu información</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Usamos tus datos únicamente para:
                </p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                  <li><strong className="text-foreground">Hacer que NUREA funcione:</strong> Gestionar tu cuenta, agendar citas, permitir comunicación.</li>
                  <li><strong className="text-foreground">Mejorar tu experiencia:</strong> Entender cómo usas la plataforma para hacerla mejor.</li>
                  <li><strong className="text-foreground">Mantener la seguridad:</strong> Proteger tu cuenta y detectar actividades sospechosas.</li>
                  <li><strong className="text-foreground">Cumplir obligaciones legales:</strong> Cuando la ley lo requiera.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  <strong className="text-foreground">Nunca usamos tus datos para:</strong> Vender productos, enviar spam, o compartir con terceros para marketing. Tu información es tuya, no nuestra mercancía.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">3. Datos de salud y documentos médicos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Entendemos que la información de salud es especialmente sensible. Por eso:
                </p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                  <li><strong className="text-foreground">No solicitamos:</strong> Historiales clínicos completos, diagnósticos detallados, ni información médica que no sea necesaria para agendar una cita.</li>
                  <li><strong className="text-foreground">Documentos médicos:</strong> Si subes documentos (resultados de laboratorio, recetas, etc.), están encriptados y solo accesibles para ti y el profesional autorizado.</li>
                  <li><strong className="text-foreground">Mensajes:</strong> Las conversaciones entre paciente y profesional son privadas y encriptadas.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  <strong className="text-foreground">Importante:</strong> La información clínica compartida durante una consulta es responsabilidad directa del profesional de la salud. NUREA actúa como intermediario tecnológico y no tiene acceso al contenido clínico de las consultas.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">4. Compartición de información</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Tu información solo se comparte cuando es estrictamente necesario:
                </p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                  <li><strong className="text-foreground">Con el profesional:</strong> Cuando agendas una cita, compartimos tu nombre y datos de contacto necesarios para la atención.</li>
                  <li><strong className="text-foreground">Con proveedores técnicos:</strong> Usamos servicios como Supabase (almacenamiento) y procesadores de pago. Todos tienen estándares de seguridad altos y están obligados a proteger tus datos.</li>
                  <li><strong className="text-foreground">Por ley:</strong> Si una autoridad competente lo solicita legalmente, debemos cumplir.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  <strong className="text-foreground">Lo que nunca hacemos:</strong> NUREA no vende, arrienda, ni comparte tus datos personales con terceros para marketing, publicidad, o cualquier otro fin comercial. Tu información no es nuestra mercancía.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">5. Seguridad de la información</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Protegemos tu información con:
                </p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                  <li><strong className="text-foreground">Encriptación:</strong> Todos los datos sensibles están encriptados en tránsito y en reposo.</li>
                  <li><strong className="text-foreground">Accesos controlados:</strong> Solo personal autorizado puede acceder a información personal, y solo cuando es necesario.</li>
                  <li><strong className="text-foreground">Buenas prácticas:</strong> Seguimos estándares de seguridad reconocidos y actualizamos nuestros sistemas regularmente.</li>
                  <li><strong className="text-foreground">Monitoreo:</strong> Revisamos constantemente la seguridad de la plataforma.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  <strong className="text-foreground">Transparencia:</strong> Si ocurriera un incidente de seguridad que afecte tus datos, te notificaremos de forma clara y oportuna, según lo requiera la ley.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Aun así, ningún sistema es 100% infalible. Por eso trabajamos constantemente en mejorar y te pedimos que uses contraseñas seguras y no compartas tu cuenta.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">6. Tus derechos sobre tus datos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Según la Ley 19.628 de Chile y principios internacionales de protección de datos, tienes derecho a:
                </p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                  <li><strong className="text-foreground">Acceder:</strong> Saber qué información tenemos sobre ti y cómo la usamos.</li>
                  <li><strong className="text-foreground">Rectificar:</strong> Corregir datos incorrectos o desactualizados.</li>
                  <li><strong className="text-foreground">Eliminar:</strong> Solicitar que borremos tu información (salvo cuando la ley requiera conservarla).</li>
                  <li><strong className="text-foreground">Portabilidad:</strong> Obtener una copia de tus datos en formato legible.</li>
                  <li><strong className="text-foreground">Oponerte:</strong> Solicitar que no usemos ciertos datos para fines específicos.</li>
                  <li><strong className="text-foreground">Revocar consentimiento:</strong> Retirar tu consentimiento en cualquier momento.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  <strong className="text-foreground">Cómo ejercer tus derechos:</strong> Escríbenos a <a href="mailto:privacidad@nurea.app" className="text-primary hover:underline font-medium">privacidad@nurea.app</a> indicando qué derecho quieres ejercer. Responderemos en un plazo máximo de 10 días hábiles.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  <strong className="text-foreground">Consentimiento informado:</strong> Al usar NUREA, das tu consentimiento para que procesemos tus datos según esta política. Puedes retirarlo en cualquier momento, aunque esto puede limitar algunas funcionalidades de la plataforma.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">7. Cookies y tecnologías similares</h2>
                <p className="text-muted-foreground leading-relaxed">
                  NUREA utiliza cookies y tecnologías similares para:
                </p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                  <li><strong className="text-foreground">Funcionalidad esencial:</strong> Mantener tu sesión activa, recordar tus preferencias.</li>
                  <li><strong className="text-foreground">Seguridad:</strong> Detectar actividades sospechosas y proteger tu cuenta.</li>
                  <li><strong className="text-foreground">Mejora:</strong> Entender cómo se usa la plataforma para mejorarla (de forma anónima).</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  <strong className="text-foreground">Tu control:</strong> Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades. No usamos cookies de terceros para publicidad o seguimiento.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">8. Cambios en esta política</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Si modificamos esta Política de Privacidad, te lo informaremos de manera clara:
                </p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                  <li>Actualizaremos la fecha de "Última actualización" en esta página.</li>
                  <li>Te notificaremos por email si los cambios son significativos.</li>
                  <li>Mostraremos un aviso en la plataforma cuando inicies sesión.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Si no estás de acuerdo con los cambios, puedes cerrar tu cuenta en cualquier momento. El uso continuado de NUREA después de los cambios implica tu aceptación.
                </p>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">9. Contacto y reclamos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Si tienes dudas, quieres ejercer tus derechos, o tienes una preocupación sobre privacidad:
                </p>
                <p className="text-foreground">
                  <strong>Email:</strong> <a 
                    href="mailto:privacidad@nurea.app" 
                    className="text-primary hover:underline font-medium"
                  >
                    privacidad@nurea.app
                  </a>
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  <strong className="text-foreground">Compromiso de respuesta:</strong> Nos comprometemos a responder todas las consultas en un plazo máximo de 10 días hábiles.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  <strong className="text-foreground">Autoridad de control:</strong> Si consideras que no hemos respetado tus derechos, puedes presentar un reclamo ante la autoridad competente en Chile (actualmente no existe una autoridad específica de protección de datos, pero puedes consultar con el SERNAC o un abogado especializado).
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-border/40 pt-8"></div>

          {/* Footer note */}
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2026 <strong className="text-foreground">NUREA</strong>. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
      <StackedCircularFooter />
    </main>
  )
}
