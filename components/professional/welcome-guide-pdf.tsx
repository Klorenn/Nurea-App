import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts if needed, but standard ones are safer for initial implementation
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#0f766e',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#0f766e',
    fontWeight: 'medium',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 15,
    backgroundColor: '#f8fafc',
    padding: 8,
  },
  card: {
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  whatsapp: {
    marginTop: 10,
    fontSize: 11,
    color: '#0f766e',
    fontWeight: 'bold',
  }
});

interface PDFProps {
  doctorName: string;
  slug: string;
}

export const WelcomeGuidePDF = ({ doctorName, slug }: PDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Guía de Éxito NUREA</Text>
        <Text style={styles.subtitle}>¡Bienvenido a la élite de la salud digital, Dr/a. {doctorName}!</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Checklist de Configuración (5 Minutos)</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. Completa tu Perfil Profesional</Text>
          <Text style={styles.cardText}>
            Asegúrate de que tu biografía destaque tus logros y tu especialidad principal esté correctamente indexada. Un perfil completo genera un 40% más de confianza en los pacientes.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. Abre tu Agenda Digital</Text>
          <Text style={styles.cardText}>
            Define tus bloques horarios en el panel de control. NUREA optimiza tus espacios para evitar inasistencias mediante recordatorios automáticos.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>3. Suscripción y acceso</Text>
          <Text style={styles.cardText}>
            Activa tu suscripción en la sección Planes (Mercado Pago) para acceder a agenda, perfil y chat. El cobro de consultas se coordina directamente con tus pacientes por chat.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>4. Tu Nueva URL Profesional (SEO)</Text>
          <Text style={styles.cardText}>
            Tu perfil ya está optimizado para Google: nureapp.com/professionals/{slug}. Compártelo en tus redes sociales para recibir agendamientos directos.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 NUREA | Tu Centro de Salud Digital</Text>
        <Text style={styles.whatsapp}>¿Necesitas ayuda? Contacta a tu ejecutivo de cuenta vía WhatsApp</Text>
      </View>
    </Page>
  </Document>
);
