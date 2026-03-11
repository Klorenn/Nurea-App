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

export interface ResetPasswordEmailProps {
  userName: string
  resetLink: string
}

export function ResetPasswordEmail({ userName, resetLink }: ResetPasswordEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Restablece tu contraseña de NUREA — enlace seguro</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Section style={header}>
              <Heading style={headerTitle}>NUREA</Heading>
              <Text style={headerSubtitle}>Recuperación de contraseña</Text>
            </Section>
            <Section style={content}>
              <Heading as="h2" style={h2}>
                Hola {userName},
              </Heading>
              <Text style={paragraph}>
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. No te
                preocupes: solo tú puedes completar este proceso desde este correo.
              </Text>
              <Text style={paragraph}>
                Haz clic en el botón de abajo para elegir una nueva contraseña. El enlace es de un
                solo uso y caduca en 1 hora.
              </Text>
              <Section style={buttonWrapper}>
                <Button href={resetLink} style={button}>
                  Restablecer mi contraseña
                </Button>
              </Section>
              <Text style={fallbackLabel}>Si el botón no funciona, copia y pega este enlace en tu navegador:</Text>
              <Link href={resetLink} style={fallbackLink}>
                {resetLink}
              </Link>
            </Section>
            <Hr style={hr} />
            <Section style={footer}>
              <Text style={footerText}>
                Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no se
                modificará.
              </Text>
              <Text style={footerCopyright}>© {new Date().getFullYear()} NUREA. Todos los derechos reservados.</Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f8fafc",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
}

const container = {
  margin: "0 auto",
  padding: "24px 16px",
  maxWidth: "560px",
}

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)",
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

const fallbackLabel = {
  color: "#64748b",
  fontSize: "13px",
  margin: "16px 0 6px",
}

const fallbackLink = {
  color: "#009485",
  fontSize: "13px",
  wordBreak: "break-all" as const,
}

const hr = {
  borderColor: "#e2e8f0",
  margin: "0",
}

const footer = {
  padding: "20px 24px",
}

const footerText = {
  color: "#94a3b8",
  fontSize: "12px",
  margin: "0 0 8px",
}

const footerCopyright = {
  color: "#94a3b8",
  fontSize: "11px",
  margin: "0",
}
