import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"

export interface BookingConfirmationProps {
  patientName: string
  doctorName: string
  date: string
  time: string
  meetingLink?: string | null
}

export function BookingConfirmation({
  patientName,
  doctorName,
  date,
  time,
  meetingLink,
}: BookingConfirmationProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Tu cita con {doctorName} está confirmada — Nurea</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>NUREA</Heading>
            <Text style={headerSubtitle}>Cita confirmada</Text>
          </Section>
          <Section style={content}>
            <Heading as="h2" style={h2}>
              Hola {patientName},
            </Heading>
            <Text style={paragraph}>
              Tu cita con <strong>{doctorName}</strong> ha sido confirmada.
            </Text>
            <Section style={infoBox}>
              <Text style={infoRow}>
                <strong>Fecha:</strong> {date}
              </Text>
              <Text style={infoRow}>
                <strong>Hora:</strong> {time}
              </Text>
              {meetingLink ? (
                <Text style={infoRow}>
                  <strong>Videollamada:</strong>{" "}
                  <Link href={meetingLink} style={link}>
                    Unirse a la consulta online
                  </Link>
                </Text>
              ) : null}
            </Section>
            {meetingLink ? (
              <Button href={meetingLink} style={button}>
                Unirse a la videollamada
              </Button>
            ) : null}
            <Text style={paragraph}>
              Te recordaremos 24 horas antes. Si necesitas cambiar o cancelar, puedes hacerlo desde tu panel.
            </Text>
            <Button href="https://nurea.app/dashboard/appointments" style={buttonSecondary}>
              Ver mis citas
            </Button>
          </Section>
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>NUREA — Conectando pacientes con profesionales de la salud</Text>
            <Text style={footerText}>¿Necesitas ayuda? Escríbenos a soporte@nurea.app</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
}

const container = {
  margin: "0 auto",
  padding: "24px",
  maxWidth: "560px",
}

const header = {
  background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
  borderRadius: "12px 12px 0 0",
  padding: "28px 24px",
  textAlign: "center" as const,
}

const headerTitle = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  letterSpacing: "0.02em",
  margin: "0",
}

const headerSubtitle = {
  color: "rgba(255,255,255,0.9)",
  fontSize: "14px",
  margin: "8px 0 0",
}

const content = {
  backgroundColor: "#ffffff",
  padding: "32px 24px",
  border: "1px solid #e5e7eb",
  borderTop: "none",
  borderRadius: "0 0 12px 12px",
}

const h2 = {
  color: "#111827",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px",
}

const paragraph = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px",
}

const infoBox = {
  backgroundColor: "#f0fdfa",
  borderLeft: "4px solid #0d9488",
  borderRadius: "6px",
  padding: "16px",
  margin: "20px 0",
}

const infoRow = {
  color: "#374151",
  fontSize: "14px",
  margin: "4px 0",
}

const link = {
  color: "#0d9488",
  textDecoration: "underline",
}

const button = {
  backgroundColor: "#0d9488",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
  display: "inline-block",
  margin: "8px 0 16px",
}

const buttonSecondary = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  color: "#374151",
  fontSize: "14px",
  fontWeight: "600",
  padding: "10px 20px",
  textDecoration: "none",
  display: "inline-block",
  margin: "8px 0 0",
}

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
}

const footer = {
  padding: "0 24px",
}

const footerText = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "4px 0",
}
