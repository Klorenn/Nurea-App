import Link from "next/link"
import Image from "next/image"
import '../landing.css'

export default function PrivacyPage() {
  return (
    <>
      <nav className="nav" id="nav">
        <div className="container nav-inner">
          <Link href="/" className="logo">
            <Image src="/logos/nurea-logo.svg" alt="Logo Nurea" width={32} height={32} priority />
            <span>Nurea</span>
          </Link>
          <ul className="nav-links">
            <li><a href="#features">Plataforma</a></li>
            <li><a href="#how">Cómo funciona</a></li>
            <li><a href="#pricing">Precios</a></li>
            <li><a href="#blog">Recursos</a></li>
            <li><a href="#faq">Ayuda</a></li>
          </ul>
          <div className="nav-cta">
            <Link href="/login" className="btn btn-ghost">Iniciar sesión</Link>
            <Link href="/register" className="btn btn-primary">Empezar gratis
              <span className="btn-arrow">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </span>
            </Link>
          </div>
        </div>
      </nav>

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
                  <p><strong>Dirección:</strong> Nurea SpA, Santiago, Chile</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}