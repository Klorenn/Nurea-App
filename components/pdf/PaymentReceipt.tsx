import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottom: '2pt solid #14B8A6',
    paddingBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
  },
  companyInfo: {
    textAlign: 'right',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14B8A6',
    marginBottom: 5,
  },
  folio: {
    fontSize: 12,
    color: '#64748B',
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#14B8A6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 140,
    fontSize: 11,
    color: '#64748B',
  },
  value: {
    flex: 1,
    fontSize: 11,
    color: '#0F172A',
  },
  amountBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    border: '1pt solid #E2E8F0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#14B8A6',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTop: '1pt solid #E2E8F0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 9,
    color: '#94A3B8',
    lineHeight: 1.5,
  },
  badge: {
    marginTop: 10,
    fontSize: 8,
    color: '#0D9488',
    fontWeight: 'bold',
  }
});

interface PaymentReceiptProps {
  folio: string;
  date: string;
  patientName: string;
  doctorName: string;
  doctorRNPI: string;
  amount: string;
  currency?: string;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  folio,
  date,
  patientName,
  doctorName,
  doctorRNPI,
  amount,
  currency = 'CLP',
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>NUREA</Text>
          <Text style={styles.folio}>Recibo No: {folio}</Text>
        </View>
        <View style={styles.companyInfo}>
          <Text style={{ fontSize: 10, color: '#0F172A' }}>Tu Centro de Salud Digital</Text>
          <Text style={{ fontSize: 9, color: '#64748B' }}>www.nurea.cl</Text>
        </View>
      </View>

      {/* Date Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Pago</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha:</Text>
          <Text style={styles.value}>{date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Concepto:</Text>
          <Text style={styles.value}>Consulta Médica Telemedicina</Text>
        </View>
      </View>

      {/* Patient Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emitido a</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Paciente:</Text>
          <Text style={styles.value}>{patientName}</Text>
        </View>
      </View>

      {/* Doctor Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prestador</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Profesional:</Text>
          <Text style={styles.value}>{doctorName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>RNPI (Superintendencia):</Text>
          <Text style={styles.value}>{doctorRNPI || 'Verificando...'}</Text>
        </View>
        <Text style={styles.badge}>Prestador verificado en el Registro Nacional de Prestadores Individuales (SIS)</Text>
      </View>

      {/* Total Section */}
      <View style={styles.amountBox}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Monto Total Pagado</Text>
          <Text style={styles.totalValue}>
            {currency === 'CLP' ? `$${parseFloat(amount).toLocaleString('es-CL')}` : `${amount} ${currency}`}
          </Text>
        </View>
      </View>

      {/* Legal Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Este documento es un comprobante de pago electrónico emitido por NUREA.
        </Text>
        <Text style={styles.footerText}>
          Válido para fines de registro y respaldo de atención médica. NUREA actúa como plataforma de intermediación.
        </Text>
      </View>
    </Page>
  </Document>
);
