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

export interface WelcomeEmailProps {
  userName: string
  role: "patient" | "professional"
  dashboardLink: string
}

export function WelcomeEmail({ userName, role, dashboardLink }: WelcomeEmailProps) {
  const isProfessional = role === "professional"
  const ctaLabel = isProfessional
    ? "Ir a mi panel"
    : "Explorar profesionales"
  const subtitle = isProfessional
    ? "Completa tu perfil y empieza a recibir consultas"
    : "Encuentra profesionales de salud y agenda tu primera cita"

  return (
    <Html lang="es">
      <Head />
      <Preview>Bienvenido a NUREA — Tu cuenta está lista</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Section style={header}>
              <Heading style={headerTitle}>NUREA</Heading>
              <Text style={headerSubtitle}>Bienvenido a bordo</Text>
            </Section>
            <Section style={content}>
              <Heading as="h2" style={h2}>
                Hola {userName},
              </Heading>
              <Text style={paragraph}>
                Tu cuenta en NUREA ya está creada. {subtitle}.
              </Text>
              <Text style={paragraph}>
                Revisa tu correo para verificar tu email y luego inicia sesión para completar tu perfil.
              </Text>
              <Section style={buttonWrapper}>
                <Button href={dashboardLink} style={button}>
                  {ctaLabel}
                </Button>
              </Section>
              <Text style={paragraphSmall}>
                Si tienes dudas, escribe a soporte@nurea.app. Estamos para ayudarte.
              </Text>
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

const paragraphSmall = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
}

const buttonWrapper = {
  textAlign: "center" as const,
  margin: "28px 0 24px",
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
