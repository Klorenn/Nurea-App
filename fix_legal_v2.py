import os

with open("app/page.tsx", "r") as f:
    page_content = f.read()

# Extract nav
nav_start = page_content.find('<nav className="nav" id="nav">')
nav_end = page_content.find('</nav>', nav_start) + 6
nav_html = page_content[nav_start:nav_end]

# Extract footer
footer_start = page_content.find('<footer className="footer">')
footer_end = page_content.find('</footer>', footer_start) + 9
footer_html = page_content[footer_start:footer_end]

terms_content = f"""import Link from "next/link"
import Image from "next/image"
import '../landing.css'

export default function TermsPage() {{
  return (
    <>
      {nav_html}

      <div className="hero" style={{ padding: '120px 0 80px' }}>
        <div className="hero-blob hero-blob-1"></div>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="serif" style={{ fontSize: '42px', marginBottom: '16px', color: 'var(--ink)' }}>Términos y Condiciones</h1>
            <p style={{ color: 'var(--ink-soft)', marginBottom: '60px' }}>Última actualización: Abril 2026</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', color: 'var(--ink-soft)', fontSize: '17px', lineHeight: '1.7' }}>
              <div>
                <p style={{ fontSize: '20px', color: 'var(--ink)', lineHeight: '1.4' }}>
                  Bienvenido a Nurea. Este documento establece los términos y condiciones de uso de nuestra plataforma. Al acceder y utilizar Nurea, usted acepta estos términos en su totalidad.
                </p>
              </div>

              <div>
                <h2 className="serif" style={{ fontSize: '26px', color: 'var(--ink)', marginBottom: '16px' }}>
                  1. Naturaleza de Nurea
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  Nurea es una plataforma digital que conecta pacientes con profesionales de la salud verificados. <strong style={{ color: 'var(--ink)' }}>No somos un prestador de servicios de salud</strong>. La responsabilidad clínica, ética y legal de cada consulta recae exclusivamente en el profesional que la proporciona.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  Nurea facilita la comunicación, el agendamiento y la coordinación entre pacientes y profesionales, pero no:
                </p>
                <ul style={{ paddingLeft: '24px', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>Proporciona diagnósticos ni tratamientos médicos.</li>
                  <li>Interviene en decisiones clínicas.</li>
                  <li>Asume responsabilidad legal por actos médicos.</li>
                  <li>Actúa como intermediario financiero en consultas.</li>
                </ul>
              </div>

              <div>
                <h2 className="serif" style={{ fontSize: '26px', color: 'var(--ink)', marginBottom: '16px' }}>
                  2. Verificación de Profesionales
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  Cada profesional en Nurea pasa por un proceso de verificación riguroso que incluye:
                </p>
                <ul style={{ paddingLeft: '24px', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  <li>Validación de colegiatura activa contra registros oficiales.</li>
                  <li>Verificación de identidad mediante documentos acreditados.</li>
                  <li>Confirmación de especialidades y credenciales profesionales.</li>
                  <li>Revisión de antecedentes éticos y legales.</li>
                </ul>
                <div style={{ padding: '24px', background: 'var(--sage-100)', borderRadius: 'var(--r-md)', color: 'var(--ink)' }}>
                  La verificación no garantiza la calidad del servicio médico, pero sí que el profesional es quien dice ser y cumple con estándares legales y éticos básicos.
                </div>
              </div>

              <div>
                <h2 className="serif" style={{ fontSize: '26px', color: 'var(--ink)', marginBottom: '16px' }}>
                  3. Modelo Sin Comisiones
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'var(--ink)' }}>Pacientes:</strong> No pagan comisión a Nurea. Pagan únicamente al profesional la tarifa que ha definido. Nurea es gratis para pacientes.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'var(--ink)' }}>Profesionales:</strong> Pueden contratar un plan de suscripción para acceder a herramientas de agenda, perfil y comunicación. Las tarifas se facturan según el plan elegido y son completamente independientes del pago de consultas.
                </p>
              </div>

              <div>
                <h2 className="serif" style={{ fontSize: '26px', color: 'var(--ink)', marginBottom: '16px' }}>
                  4. Limitaciones y Responsabilidad
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'var(--ink)' }}>Telemedicina:</strong> Acepta que la consulta en línea tiene limitaciones. No permite exámenes físicos directos y no es apropiada para emergencias.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'var(--ink)' }}>Confidencialidad:</strong> Toda comunicación está cifrada extremo a extremo. Nurea no accede al contenido clínico.
                </p>
              </div>

              <div>
                <h2 className="serif" style={{ fontSize: '26px', color: 'var(--ink)', marginBottom: '16px' }}>
                  5. Contacto Legal
                </h2>
                <div style={{ padding: '32px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
                  <p style={{ marginBottom: '8px' }}><strong>Email:</strong> <a href="mailto:legal@nurea.app" style={{ color: 'var(--sage-700)', textDecoration: 'none' }}>legal@nurea.app</a></p>
                  <p><strong>Dirección:</strong> Nurea Health, SpA, Santiago, Chile</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {footer_html}
    </>
  )
}}
"""

privacy_content = f"""import Link from "next/link"
import Image from "next/image"
import '../landing.css'

export default function PrivacyPage() {{
  return (
    <>
      {nav_html}

      <div className="hero" style={{ padding: '120px 0 80px' }}>
        <div className="hero-blob hero-blob-2" style={{ top: '100px', left: '-100px' }}></div>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="serif" style={{ fontSize: '42px', marginBottom: '16px', color: 'var(--ink)' }}>Política de Privacidad</h1>
            <p style={{ color: 'var(--ink-soft)', marginBottom: '60px' }}>Última actualización: Abril 2026</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', color: 'var(--ink-soft)', fontSize: '17px', lineHeight: '1.7' }}>
              <div>
                <p style={{ fontSize: '20px', color: 'var(--ink)', lineHeight: '1.4' }}>
                  La privacidad es fundamental en Nurea. Este documento explica qué datos recopilamos, cómo los utilizamos, cómo los protegemos y sus derechos respecto a ellos.
                </p>
              </div>

              <div>
                <h2 className="serif" style={{ fontSize: '26px', color: 'var(--ink)', marginBottom: '16px' }}>
                  1. Qué Datos Recopilamos
                </h2>
                <ul style={{ paddingLeft: '24px', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><strong style={{ color: 'var(--ink)' }}>Datos de Registro:</strong> Nombre, correo, teléfono, tipo de cuenta.</li>
                  <li><strong style={{ color: 'var(--ink)' }}>Datos Médicos:</strong> Para pacientes, historial de citas. Para profesionales, colegiatura y especialidades.</li>
                  <li><strong style={{ color: 'var(--ink)' }}>Interacción:</strong> Mensajes cifrados y registros de acceso.</li>
                </ul>
              </div>

              <div>
                <h2 className="serif" style={{ fontSize: '26px', color: 'var(--ink)', marginBottom: '16px' }}>
                  2. Cómo Utilizamos los Datos
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  Utilizamos sus datos para proporcionar el servicio, procesar suscripciones y verificar identidades. <strong style={{ color: 'var(--ink)' }}>Nunca vendemos datos personales a terceros.</strong>
                </p>
              </div>

              <div>
                <h2 className="serif" style={{ fontSize: '26px', color: 'var(--ink)', marginBottom: '16px' }}>
                  3. Protección y Cifrado
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  Protegemos la información mediante <strong style={{ color: 'var(--ink)' }}>cifrado extremo a extremo</strong>. Ni siquiera el equipo de Nurea puede acceder al contenido clínico de sus consultas o mensajes.
                </p>
                <div style={{ padding: '24px', background: 'var(--sage-100)', borderRadius: 'var(--r-md)', color: 'var(--ink)' }}>
                  Cumplimos con las normativas locales e internacionales de protección de datos aplicables a servicios de salud digital.
                </div>
              </div>

              <div>
                <h2 className="serif" style={{ fontSize: '26px', color: 'var(--ink)', marginBottom: '16px' }}>
                  4. Sus Derechos
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  Tiene derecho a acceder, rectificar, cancelar (Derecho al Olvido) o solicitar la portabilidad de sus datos en cualquier momento.
                </p>
              </div>

              <div>
                <h2 className="serif" style={{ fontSize: '26px', color: 'var(--ink)', marginBottom: '16px' }}>
                  5. Contacto de Privacidad
                </h2>
                <div style={{ padding: '32px', border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }}>
                  <p style={{ marginBottom: '8px' }}><strong>Email:</strong> <a href="mailto:privacy@nurea.app" style={{ color: 'var(--sage-700)', textDecoration: 'none' }}>privacy@nurea.app</a></p>
                  <p><strong>Dirección:</strong> Nurea Health, SpA, Santiago, Chile</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {footer_html}
    </>
  )
}}
"""

with open("app/terms/page.tsx", "w") as f:
    f.write(terms_content)

with open("app/privacy/page.tsx", "w") as f:
    f.write(privacy_content)

print("Created completely native landing-style terms and privacy pages")
