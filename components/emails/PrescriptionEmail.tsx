import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"

interface PrescriptionEmailProps {
  patientName: string
  doctorName: string
  appointmentDate: string
  portalUrl: string
  reviewUrl?: string
}

export const PrescriptionEmail = ({
  patientName = "Paciente",
  doctorName = "Doctor Nurea",
  appointmentDate = "hoy",
  portalUrl = "https://nurea.app/dashboard",
  reviewUrl = "https://nurea.app/dashboard/patient/reviews",
}: PrescriptionEmailProps) => (
  <Html>
    <Head />
    <Preview>Tu receta médica de Nurea está lista</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
           <Text style={logoText}>NUREA</Text>
        </Section>
        <Heading style={h1}>Tu consulta ha finalizado</Heading>
        <Text style={text}>
          Hola <strong>{patientName}</strong>,
        </Text>
        <Text style={text}>
          Tu consulta con el <strong>{doctorName}</strong> del {appointmentDate} ha finalizado con éxito.
        </Text>
        <Text style={text}>
          Adjunto a este correo encontrarás tu receta médica y las instrucciones de tu plan de tratamiento en formato PDF.
        </Text>
        
        <Section style={buttonContainer}>
          <Button style={button} href={portalUrl}>
            Ver en mi Portal de Paciente
          </Button>
        </Section>

        <Hr style={hr} />

        <Section style={reviewSection}>
          <Text style={reviewTitle}>¿Cómo fue tu experiencia con el {doctorName}?</Text>
          <Text style={reviewText}>Tu opinión es fundamental para nosotros y ayuda a que otros pacientes encuentren el mejor cuidado.</Text>
          <Link href={reviewUrl} style={reviewLink}>
            Calificar atención &rarr;
          </Link>
        </Section>

        <Text style={text}>
          Si tienes dudas sobre tu tratamiento, puedes contactar al profesional a través de nuestra plataforma.
        </Text>
        
        <Hr style={hr} />
        
        <Text style={footer}>
          Este es un correo automático de Nurea. Por favor no respondas a este mensaje.
          <br />
          &copy; {new Date().getFullYear()} Nurea Cloud Health Systems.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default PrescriptionEmail

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
}

const header = {
  paddingBottom: "20px",
}

const logoText = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#0d9488",
  margin: "0",
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
}

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
}

const button = {
  backgroundColor: "#0d9488",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
}

const hr = {
  borderColor: "#e6ebf1",
  margin: "40px 0",
}

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "22px",
  textAlign: "center" as const,
}

const reviewSection = {
  backgroundColor: "#f0fdfa",
  padding: "24px",
  borderRadius: "12px",
  textAlign: "center" as const,
  marginBottom: "30px",
}

const reviewTitle = {
  color: "#0d9488",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 10px 0",
}

const reviewText = {
  color: "#4a5568",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 16px 0",
}

const reviewLink = {
  color: "#0d9488",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "underline",
}
