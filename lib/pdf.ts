import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { PaymentReceipt } from '@/components/pdf/PaymentReceipt';

export async function generatePaymentReceiptBuffer(data: {
  folio: string;
  date: string;
  patientName: string;
  doctorName: string;
  doctorRNPI: string;
  amount: string;
}) {
  return await renderToBuffer(
    React.createElement(PaymentReceipt, data) as any
  );
}
