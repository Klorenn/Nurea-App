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
} from "@react-email/components";
import * as React from "react";

export interface AppointmentReminderEmailProps {
  userName: string;
  professionalName: string;
  appointmentDate: string;
  appointmentTime: string;
  patientPortalLink?: string;
}

export function AppointmentReminderEmail({
  userName,
  professionalName,
  appointmentDate,
  appointmentTime,
  patientPortalLink,
}: AppointmentReminderEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Recordatorio: tu cita con {professionalName} — NUREA</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Section style={header}>
              <Heading style={headerTitle}>NUREA</Heading>
              <Text style={headerSubtitle}>Recordatorio de cita</Text>
            </Section>
            <Section style={content}>
              <Heading as="h2" style={h2}>
                Hola {userName},
              </Heading>
              <Text style={paragraph}>
                Te recordamos que tienes una cita programada:
              </Text>
              <Section style={infoBox}>
                <Text style={infoLabel}>Profesional</Text>
                <Text style={infoValue}>{professionalName}</Text>
                <Text style={infoLabel}>Fecha</Text>
                <Text style={infoValue}>{appointmentDate}</Text>
                <Text style={infoLabel}>Hora</Text>
                <Text style={infoValue}>{appointmentTime}</Text>
              </Section>
              <Text style={paragraph}>
                Si necesitas cancelar o reprogramar, hazlo con al menos 24 horas
                de antelación desde tu panel de citas.
              </Text>
              {patientPortalLink && (
                <Section style={buttonWrapper}>
                  <a href={patientPortalLink} style={button}>
                    Ver mis citas
                  </a>
                </Section>
              )}
            </Section>
            <Hr style={hr} />
            <Section style={footer}>
              <Text style={footerCopyright}>
                © {new Date().getFullYear()} NUREA. Todos los derechos
                reservados.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f8fafc",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "24px 16px",
  maxWidth: "560px",
};

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)",
  overflow: "hidden" as const,
};

const header = {
  background: "linear-gradient(135deg, #0f766e 0%, #009485 100%)",
  padding: "28px 24px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  letterSpacing: "0.02em",
  margin: "0",
};

const headerSubtitle = {
  color: "rgba(255, 255, 255, 0.92)",
  fontSize: "14px",
  margin: "8px 0 0",
};

const content = {
  padding: "32px 24px",
};

const h2 = {
  color: "#111827",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const paragraph = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const infoBox = {
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
};

const infoLabel = {
  color: "#64748b",
  fontSize: "12px",
  margin: "8px 0 4px",
};

const infoValue = {
  color: "#0f172a",
  fontSize: "15px",
  fontWeight: "600",
  margin: "0",
};

const buttonWrapper = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  backgroundColor: "#0f766e",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  padding: "14px 28px",
  textDecoration: "none",
  display: "inline-block",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "0",
};

const footer = {
  padding: "20px 24px",
};

const footerCopyright = {
  color: "#94a3b8",
  fontSize: "11px",
  margin: "0",
};
