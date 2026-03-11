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

export interface VerificationCodeEmailProps {
  userName: string
  validationCode: string
}

export function VerificationCodeEmail({
  userName,
  validationCode,
}: VerificationCodeEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Tu código de verificación NUREA — {validationCode}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Section style={header}>
              <Heading style={headerTitle}>NUREA</Heading>
              <Text style={headerSubtitle}>Código de verificación</Text>
            </Section>
            <Section style={content}>
              <Heading as="h2" style={h2}>
                Hola {userName},
              </Heading>
              <Text style={paragraph}>
                Usa el siguiente código para completar tu verificación. Es personal e intransferible.
              </Text>
              <Section style={codeBox}>
                <Text style={codeText}>{validationCode}</Text>
              </Section>
              <Text style={paragraphSmall}>
                Si no has solicitado este código, puedes ignorar este correo. Tu cuenta sigue segura.
              </Text>
            </Section>
            <Hr style={hr} />
            <Section style={footer}>
              <Text style={footerText}>
                Este código expira en <strong>10 minutos</strong>.
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
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)",
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
  margin: "0 0 24px",
}

const codeBox = {
  backgroundColor: "#f1f5f9",
  borderRadius: "10px",
  padding: "24px 32px",
  margin: "24px 0",
  textAlign: "center" as const,
}

const codeText = {
  color: "#0f172a",
  fontSize: "32px",
  fontWeight: "700",
  letterSpacing: "0.2em",
  margin: "0",
  fontVariantNumeric: "tabular-nums" as const,
}

const paragraphSmall = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
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
