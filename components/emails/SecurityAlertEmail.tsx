import { Html, Head, Preview, Body, Container, Heading, Text, Link } from '@react-email/components'
import * as React from 'react'

interface SecurityAlertEmailProps {
  doctorName: string
  professionalId: string
}

export default function SecurityAlertEmail({ doctorName, professionalId }: SecurityAlertEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>⚠️ Alerta de Seguridad Crítica en NUREA</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ margin: '0 auto', padding: '20px', maxWidth: '600px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
          <Heading style={{ color: '#e53e3e' }}>⚠️ Alerta de Seguridad Crítica</Heading>
          <Text style={{ fontSize: '16px', color: '#4a5568' }}>
            El profesional <strong>{doctorName}</strong> ha modificado datos críticos de su perfil (RNPI, Nombre o Especialidad).
          </Text>
          <Text style={{ fontSize: '16px', color: '#4a5568' }}>
            Su perfil ha sido bloqueado automáticamente y se encuentra de nuevo en estado pendiente de verificación. 
            Por favor, revisa y valida los nuevos datos en el panel de administración a la brevedad posible.
          </Text>
          <Link 
            href={`http://localhost:3000/admin/verifications`} 
            style={{ 
              display: 'inline-block', 
              padding: '12px 24px', 
              backgroundColor: '#e53e3e', 
              color: '#ffffff', 
              textDecoration: 'none', 
              borderRadius: '4px',
              marginTop: '16px',
              fontWeight: 'bold'
            }}
          >
            Revisar Panel de Verificaciones
          </Link>
        </Container>
      </Body>
    </Html>
  )
}
