import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"

export interface BookingConfirmationProfessionalProps {
  professionalName: string
  patientName: string
  date: string
  time: string
  isOnline: boolean
}

export function BookingConfirmationProfessional({
  professionalName,
  patientName,
  date,
  time,
  isOnline,
}: BookingConfirmationProfessionalProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Nueva cita agendada: {patientName} — Nurea</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>NUREA</Heading>
            <Text style={headerSubtitle}>Nueva cita agendada</Text>
          </Section>
          <Section style={content}>
            <Heading as="h2" style={h2}>
              Hola {professionalName},
            </Heading>
            <Text style={paragraph}>
              Un paciente ha agendado una cita contigo.
            </Text>
            <Section style={infoBox}>
              <Text style={infoRow}>
                <strong>Paciente:</strong> {patientName}
              </Text>
              <Text style={infoRow}>
                <strong>Fecha:</strong> {date}
              </Text>
              <Text style={infoRow}>
                <strong>Hora:</strong> {time}
              </Text>
              <Text style={infoRow}>
                <strong>Tipo:</strong> {isOnline ? "Consulta online" : "Consulta presencial"}
              </Text>
            </Section>
            <Text style={paragraph}>
              Revisa tu panel de profesional para ver el detalle y el enlace de videollamada (si aplica).
            </Text>
            <Text style={paragraphSmall}>
              ¿Necesitas ayuda? Escríbenos a soporte@nurea.app
            </Text>
          </Section>
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>NUREA — Conectando pacientes con profesionales de la salud</Text>
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

const paragraphSmall = {
  color: "#6b7280",
  fontSize: "13px",
  margin: "16px 0 0",
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
