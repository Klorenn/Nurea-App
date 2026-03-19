import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { generatePaymentReceiptBuffer } from "@/lib/pdf"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // 1. Verify user is patient of this finance record or admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse("Unauthorized", { status: 401 })

    const { data: financeRecord, error } = await supabase
      .from('finances')
      .select('*, patient:profiles(first_name, last_name, email), professional:profiles(first_name, last_name), prof_data:professionals(registration_number)')
      .eq('id', id)
      .single()

    if (error || !financeRecord) {
      return new NextResponse("Receipt not found", { status: 404 })
    }

    // Check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    if (financeRecord.patient_id !== user.id && !isAdmin) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // 2. Generate PDF
    const patientName = `${(financeRecord.patient as any).first_name || ''} ${(financeRecord.patient as any).last_name || ''}`.trim() || "Paciente"
    const doctorName = `${(financeRecord.professional as any).first_name || ''} ${(financeRecord.professional as any).last_name || ''}`.trim() || "Profesional"
    const profData = (financeRecord.prof_data as any)

    const pdfBuffer = await generatePaymentReceiptBuffer({
      folio: financeRecord.receipt_folio || `REC-${financeRecord.id.slice(0,8)}`,
      date: new Date(financeRecord.created_at).toLocaleDateString('es-CL'),
      patientName,
      doctorName,
      doctorRNPI: profData?.registration_number || '',
      amount: financeRecord.total_amount.toString(),
    })

    // 3. Return PDF response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recibo-nurea-${financeRecord.receipt_folio}.pdf"`,
      },
    })

  } catch (error: any) {
    console.error("Error generating receipt on-demand:", error)
    return new NextResponse(error.message, { status: 500 })
  }
}
