"use client"

import { Navbar } from "@/components/navbar"
import { StackedCircularFooter } from "@/components/ui/stacked-circular-footer"
import { FileText, Users, Calendar, MessageCircle, CreditCard, Star, AlertCircle, Mail } from "lucide-react"
import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 md:pt-28 md:pb-16">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Términos de Uso de NUREA
            </h1>
            <p className="text-sm text-muted-foreground">
              Última actualización: 2026
            </p>
          </div>

          {/* Introduction */}
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Bienvenido/a a <strong className="text-foreground">NUREA</strong>. Gracias por confiar en nosotros.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              NUREA es una plataforma digital diseñada para facilitar el encuentro entre personas que buscan atención en salud y profesionales de la salud en Chile. Nuestro objetivo es hacer este proceso más humano, claro y accesible.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Estos términos explican cómo funciona NUREA y qué puedes esperar de nosotros. Están escritos en lenguaje simple porque creemos que la información legal debe ser comprensible, no intimidante.
            </p>
          </div>

          <div className="border-t border-border/40 pt-8"></div>

          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">1. ¿Qué es NUREA?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  NUREA es una <strong className="text-foreground">plataforma tecnológica de intermediación</strong>. Esto significa que:
                </p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                  <li>No prestamos servicios médicos.</li>
                  <li>No realizamos diagnósticos ni tratamientos.</li>
                  <li>No reemplazamos la relación directa entre paciente y profesional de la salud.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Nuestro rol es facilitar la búsqueda, comunicación y agendamiento de citas.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">2. ¿Quiénes pueden usar NUREA?</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Pacientes</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Personas que buscan atención con profesionales de la salud.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Profesionales de la salud</h3>
                    <p className="text-muted-foreground leading-relaxed mb-2">Actualmente:</p>
                    <ul className="space-y-1 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                      <li>Psicólogas y Psicólogos</li>
                      <li>Psiquiatras</li>
                      <li>Dentistas / Odontólogos</li>
                      <li>Kinesiólogas y Kinesiólogos</li>
                      <li>Matronas y Matrones</li>
                      <li>Nutricionistas</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-2">
                      NUREA podrá incorporar nuevas especialidades en el futuro.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">3. Registro y uso de la cuenta</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Al crear una cuenta en NUREA, te comprometes a:
                </p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                  <li>Entregar información verdadera y actualizada.</li>
                  <li>Usar la plataforma de forma responsable y respetuosa.</li>
                  <li>Mantener la confidencialidad de tus accesos.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  NUREA podrá suspender cuentas que incumplan estos principios. Siempre te notificaremos antes de tomar esta medida, salvo en casos de conducta claramente inapropiada.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  <strong className="text-foreground">Consentimiento informado digital:</strong> Al crear tu cuenta y usar NUREA, confirmas que has leído y comprendido estos términos, y que aceptas usarlos de forma responsable.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">4. Reservas, cancelaciones y reprogramaciones</h2>
                <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                  <li>Las citas se reservan directamente con cada profesional.</li>
                  <li>Cada profesional define su política de cancelación y reprogramación.</li>
                  <li>NUREA muestra esta información para que puedas decidir con claridad.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  NUREA no es responsable por cancelaciones, retrasos o cambios realizados por los profesionales.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">5. Consultas online y mensajería</h2>
                <p className="text-muted-foreground leading-relaxed">
                  NUREA ofrece herramientas de mensajería y videollamada seguras.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Es importante que sepas que:
                </p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                  <li>Estas herramientas no reemplazan una atención médica presencial cuando esta es necesaria.</li>
                  <li>El contenido de las consultas es responsabilidad exclusiva del profesional.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">6. Pagos y suscripciones (profesionales)</h2>
                <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                  <li>Los planes para profesionales se pagan de forma mensual.</li>
                  <li>No existen contratos de permanencia forzada.</li>
                  <li>Puedes cancelar tu suscripción en cualquier momento.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Los valores y condiciones pueden cambiar, lo que será informado oportunamente.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">7. Reseñas y contenido</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Las reseñas en NUREA buscan ayudar a la comunidad.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Por eso:
                </p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                  <li>Deben ser reales y respetuosas.</li>
                  <li>NUREA podrá moderar o eliminar contenido ofensivo, falso o inapropiado.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">8. Limitación de responsabilidad</h2>
                <p className="text-muted-foreground leading-relaxed">
                  NUREA no es responsable por:
                </p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                  <li>Diagnósticos, tratamientos o decisiones clínicas.</li>
                  <li>Resultados de la atención médica.</li>
                  <li>Conflictos entre pacientes y profesionales.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Cada profesional es responsable de la atención que brinda.
                </p>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">9. Cambios en estos términos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  NUREA puede actualizar estos Términos de Uso.
                  Cuando esto ocurra, lo informaremos de manera clara a los usuarios.
                </p>
              </div>
            </div>
          </section>

          {/* Section 10 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">10. Tus derechos como usuario</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Como usuario de NUREA, tienes derecho a:
                </p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside ml-4">
                  <li>Acceder a tu información personal en cualquier momento.</li>
                  <li>Corregir datos incorrectos o desactualizados.</li>
                  <li>Solicitar la eliminación de tu cuenta y datos personales.</li>
                  <li>Recibir respuestas claras a tus consultas.</li>
                  <li>Ser informado sobre cambios importantes en estos términos.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Para ejercer cualquiera de estos derechos, escríbenos a <a href="mailto:soporte@nurea.app" className="text-primary hover:underline font-medium">soporte@nurea.app</a>. Responderemos en un plazo razonable.
                </p>
              </div>
            </div>
          </section>

          {/* Section 11 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-foreground">11. Contacto</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Si tienes dudas sobre estos términos, preguntas sobre tu cuenta, o necesitas ejercer tus derechos, puedes escribirnos a:
                </p>
                <p className="text-foreground">
                  <a 
                    href="mailto:soporte@nurea.app" 
                    className="text-primary hover:underline font-medium"
                  >
                    soporte@nurea.app
                  </a>
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Nos comprometemos a responder todas las consultas en un plazo máximo de 5 días hábiles.
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
