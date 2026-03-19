import { Html, Head, Preview, Body, Container, Heading, Text, Link, Section, Button } from '@react-email/components'
import * as React from 'react'

interface WelcomeProfessionalEmailProps {
  doctorName: string
  professionalSlug: string
}

export default function WelcomeProfessionalEmail({ doctorName, professionalSlug }: WelcomeProfessionalEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>¡Felicidades! Tu perfil en NUREA ha sido verificado</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: '"Inter", sans-serif' }}>
        <Container style={{ margin: '40px auto', padding: '32px', maxWidth: '600px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <Heading style={{ color: '#0f766e', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
            ¡Felicidades, {doctorName}!
          </Heading>
          <Text style={{ fontSize: '16px', color: '#475569', textAlign: 'center', marginBottom: '32px' }}>
            Tu perfil ha sido verificado exitosamente por nuestro equipo legal y médico. Ya eres parte oficial de NUREA.
          </Text>

          <Section style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
            <Heading as="h3" style={{ fontSize: '16px', color: '#0f766e', marginTop: 0 }}>Paso 1: Configura tu Agenda</Heading>
            <Text style={{ fontSize: '14px', color: '#475569' }}>
              Define tus bloques de horarios disponibles desde el panel de control para que los pacientes puedan comenzar a agendar citas contigo de inmediato.
            </Text>
          </Section>

          <Section style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
            <Heading as="h3" style={{ fontSize: '16px', color: '#0f766e', marginTop: 0 }}>Paso 2: Revisa tu Perfil Público</Heading>
            <Text style={{ fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
              Tu perfil ya está visible para miles de pacientes. Revisa cómo se ve tu página pública y asegúrate de que toda la información esté actualizada.
            </Text>
            <Link 
              href={`https://nureapp.com/professionals/${professionalSlug}`}
              style={{ color: '#0ea5e9', fontSize: '14px', fontWeight: '500', textDecoration: 'underline' }}
            >
              nureapp.com/professionals/{professionalSlug}
            </Link>
          </Section>

          <Section style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', marginBottom: '32px' }}>
            <Heading as="h3" style={{ fontSize: '16px', color: '#0f766e', marginTop: 0 }}>Paso 3: Cobros y Finanzas</Heading>
            <Text style={{ fontSize: '14px', color: '#475569' }}>
              La coordinación y el pago de las consultas se realizan directamente con tus pacientes (por ejemplo por chat). Si aún no lo has hecho, activa tu suscripción en la sección de planes para acceder a agenda, perfil y mensajería.
            </Text>
          </Section>

          <Section style={{ textAlign: 'center' }}>
            <Button 
              href="https://nureapp.com/dashboard/professional"
              style={{ 
                backgroundColor: '#0f766e', 
                color: '#ffffff', 
                fontSize: '16px', 
                fontWeight: '600',
                padding: '12px 32px', 
                borderRadius: '8px', 
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Ir a mi Panel de Control
            </Button>
          </Section>

          <Text style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '40px' }}>
            © {new Date().getFullYear()} NUREA Health. Todos los derechos reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
