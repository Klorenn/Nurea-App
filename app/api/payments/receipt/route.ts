import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('id')
    const format = searchParams.get('format') || 'pdf' // pdf, json

    if (!paymentId) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, proporciona el ID del pago.'
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para descargar el recibo.'
        },
        { status: 401 }
      )
    }

    // Obtener el pago con información completa
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        appointment:appointments(
          *,
          professional:profiles!appointments_professional_id_fkey(
            id,
            first_name,
            last_name
          )
        ),
        patient:profiles!payments_patient_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', paymentId)
      .eq('patient_id', user.id)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { 
          error: 'payment_not_found',
          message: 'No se encontró el pago o no tienes permiso para verlo.'
        },
        { status: 404 }
      )
    }

    // Generar recibo
    const receipt = {
      receiptNumber: `NUREA-${payment.id.substring(0, 8).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      patient: {
        name: `${payment.patient?.first_name} ${payment.patient?.last_name}`,
        email: payment.patient?.email,
      },
      professional: {
        name: `${payment.appointment?.professional?.first_name} ${payment.appointment?.professional?.last_name}`,
      },
      appointment: {
        date: payment.appointment?.appointment_date,
        time: payment.appointment?.appointment_time,
        type: payment.appointment?.type,
      },
      payment: {
        amount: payment.amount,
        currency: payment.currency,
        method: payment.payment_method,
        status: payment.status,
        paidAt: payment.paid_at,
      },
      legalNotice: 'NUREA actúa como intermediario tecnológico. No presta servicios médicos. El pago es por servicios del profesional de salud indicado.',
    }

    if (format === 'json') {
      return NextResponse.json(receipt, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="recibo-${receipt.receiptNumber}.json"`
        }
      })
    }

    // Para PDF, generar HTML que se puede convertir a PDF
    // En producción, usar una librería como puppeteer o @react-pdf/renderer
    const htmlReceipt = generateHTMLReceipt(receipt)

    return new NextResponse(htmlReceipt, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="recibo-${receipt.receiptNumber}.html"`
      }
    })
  } catch (error) {
    console.error('Generate receipt error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

function generateHTMLReceipt(receipt: any) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Recibo ${receipt.receiptNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: bold; color: #14B8A6; }
    .receipt-number { font-size: 18px; margin-top: 10px; }
    .section { margin-bottom: 30px; }
    .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #14B8A6; padding-bottom: 5px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .label { font-weight: bold; }
    .legal { margin-top: 40px; padding: 20px; background: #f5f5f5; border-radius: 8px; font-size: 12px; color: #666; }
    .total { font-size: 24px; font-weight: bold; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #14B8A6; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">NUREA</div>
    <div class="receipt-number">Recibo ${receipt.receiptNumber}</div>
  </div>
  
  <div class="section">
    <div class="section-title">Información del Paciente</div>
    <div class="row"><span class="label">Nombre:</span> <span>${receipt.patient.name}</span></div>
    <div class="row"><span class="label">Email:</span> <span>${receipt.patient.email}</span></div>
  </div>
  
  <div class="section">
    <div class="section-title">Información del Profesional</div>
    <div class="row"><span class="label">Profesional:</span> <span>${receipt.professional.name}</span></div>
  </div>
  
  <div class="section">
    <div class="section-title">Detalles de la Cita</div>
    <div class="row"><span class="label">Fecha:</span> <span>${receipt.appointment.date}</span></div>
    <div class="row"><span class="label">Hora:</span> <span>${receipt.appointment.time}</span></div>
    <div class="row"><span class="label">Tipo:</span> <span>${receipt.appointment.type === 'online' ? 'Consulta Online' : 'Consulta Presencial'}</span></div>
  </div>
  
  <div class="section">
    <div class="section-title">Detalles del Pago</div>
    <div class="row"><span class="label">Método:</span> <span>${receipt.payment.method}</span></div>
    <div class="row"><span class="label">Fecha de Pago:</span> <span>${receipt.payment.paidAt ? new Date(receipt.payment.paidAt).toLocaleDateString() : 'N/A'}</span></div>
    <div class="row"><span class="label">Estado:</span> <span>${receipt.payment.status === 'paid' ? 'Pagado' : receipt.payment.status}</span></div>
  </div>
  
  <div class="total">
    Total: $${receipt.payment.amount.toLocaleString()} ${receipt.payment.currency.toUpperCase()}
  </div>
  
  <div class="legal">
    <strong>Aviso Legal:</strong> ${receipt.legalNotice}
  </div>
</body>
</html>
  `
}

