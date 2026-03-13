import {
  Body,
  Button,
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

export interface SupportTicketReplyEmailProps {
  userName: string
  ticketSubject: string
  adminResponse: string
  supportLink: string
}

export function SupportTicketReplyEmail({
  userName,
  ticketSubject,
  adminResponse,
  supportLink,
}: SupportTicketReplyEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>NUREA Soporte te ha respondido: {ticketSubject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Section style={header}>
              <Heading style={headerTitle}>NUREA</Heading>
              <Text style={headerSubtitle}>Nueva respuesta de soporte</Text>
            </Section>
            <Section style={content}>
              <Heading as="h2" style={h2}>
                Hola {userName},
              </Heading>
              <Text style={paragraph}>
                El equipo de NUREA ha respondido a tu ticket de soporte.
              </Text>
              <Section style={infoBox}>
                <Text style={infoLabel}>Asunto</Text>
                <Text style={infoValue}>{ticketSubject}</Text>
              </Section>
              <Text style={responseLabel}>Respuesta:</Text>
              <Section style={responseBox}>
                <Text style={responseText}>{adminResponse}</Text>
              </Section>
              <Section style={buttonWrapper}>
                <Button href={supportLink} style={button}>
                  Ver ticket y responder
                </Button>
              </Section>
            </Section>
            <Hr style={hr} />
            <Section style={footer}>
              <Text style={footerCopyright}>
                © {new Date().getFullYear()} NUREA. Todos los derechos reservados.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f8fafc",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
}

const container = {
  margin: "0 auto",
  padding: "24px 16px",
  maxWidth: "560px",
}

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)",
  overflow: "hidden" as const,
}

const header = {
  background: "linear-gradient(135deg, #0f766e 0%, #009485 100%)",
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
  color: "rgba(255, 255, 255, 0.92)",
  fontSize: "14px",
  margin: "8px 0 0",
}

const content = {
  padding: "32px 24px",
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
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
  padding: "12px 16px",
  margin: "16px 0",
}

const infoLabel = {
  color: "#64748b",
  fontSize: "12px",
  margin: "0 0 4px",
}

const infoValue = {
  color: "#0f172a",
  fontSize: "15px",
  fontWeight: "600",
  margin: "0",
}

const responseLabel = {
  color: "#475569",
  fontSize: "14px",
  fontWeight: "600",
  margin: "16px 0 8px",
}

const responseBox = {
  backgroundColor: "#f8fafc",
  borderLeft: "4px solid #0f766e",
  borderRadius: "6px",
  padding: "16px",
  margin: "0 0 20px",
}

const responseText = {
  color: "#334155",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
}

const buttonWrapper = {
  textAlign: "center" as const,
  margin: "24px 0",
}

const button = {
  backgroundColor: "#0f766e",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  padding: "14px 28px",
  textDecoration: "none",
  display: "inline-block",
}

const hr = {
  borderColor: "#e2e8f0",
  margin: "0",
}

const footer = {
  padding: "20px 24px",
}

const footerCopyright = {
  color: "#94a3b8",
  fontSize: "11px",
  margin: "0",
}
