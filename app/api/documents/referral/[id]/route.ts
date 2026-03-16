import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/documents/referral/[id]
 * 
 * Generates an "Orden de Interconsulta" PDF document.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: "missing_id", message: "ID de documento requerido" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "unauthorized", message: "Debes iniciar sesión" },
        { status: 401 }
      )
    }

    // Fetch the referral
    const { data: referral, error: recordError } = await supabase
      .from("referrals")
      .select(`
        id,
        patient_id,
        reason,
        created_at,
        referring_professional:professionals!referrals_referring_professional_id_fkey(
          id,
          registration_number,
          profiles!professionals_id_fkey(first_name, last_name, email)
        ),
        target_specialty:specialties(name_es),
        target_professional:professionals!referrals_target_professional_id_fkey(
          profiles!professionals_id_fkey(first_name, last_name)
        )
      `)
      .eq("id", id)
      .single()

    if (recordError || !referral) {
      return NextResponse.json(
        { error: "not_found", message: "Documento no encontrado" },
        { status: 404 }
      )
    }

    // Security: Verify the requesting user is the patient (or an admin, but here we just check patient)
    if (referral.patient_id !== user.id) {
      return NextResponse.json(
        { error: "forbidden", message: "No tienes permiso para acceder a este documento" },
        { status: 403 }
      )
    }

    // Get patient info
    const { data: patientProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", user.id)
      .single()

    const profObj: any = referral.referring_professional
    const professionalName = profObj?.profiles 
      ? `Dr. ${profObj.profiles.first_name || ''} ${profObj.profiles.last_name || ''}`.trim()
      : 'Profesional de Salud'
      
    const rnpi = profObj?.registration_number || 'No registrado'

    const targetSpecObj: any = referral.target_specialty
    const targetSpecName = targetSpecObj?.name_es || "Especialidad no especificada"

    const targetProfObj: any = referral.target_professional
    const targetProfName = targetProfObj?.profiles 
      ? `Dr. ${targetProfObj.profiles.first_name} ${targetProfObj.profiles.last_name}`
      : "Cualquier especialista disponible"
    
    const patientName = patientProfile 
      ? `${patientProfile.first_name || ''} ${patientProfile.last_name || ''}`.trim()
      : 'Paciente'

    const createdDate = new Date(referral.created_at).toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })

    // Generate HTML document (will be rendered as printable page)
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Orden de Interconsulta - NUREA</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; padding: 40px; min-height: 100vh; }
    .document { max-width: 800px; margin: 0 auto; background: white; padding: 48px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #6366f1; padding-bottom: 24px; margin-bottom: 32px; }
    .logo { display: flex; align-items: center; gap: 12px; }
    .logo-icon { width: 56px; height: 56px; background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 24px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .logo-text { font-size: 32px; font-weight: 700; color: #4f46e5; letter-spacing: -0.5px; }
    .logo-subtitle { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
    .doc-info { text-align: right; color: #64748b; font-size: 13px; }
    .doc-info p { margin: 4px 0; }
    .doc-number { font-family: monospace; font-size: 11px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; margin-top: 8px; }
    .title { text-align: center; margin-bottom: 32px; }
    .title h1 { font-size: 28px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
    .title p { color: #64748b; font-size: 14px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #4f46e5; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-item label { font-size: 12px; color: #64748b; display: block; margin-bottom: 4px; }
    .info-item p { font-size: 15px; font-weight: 500; color: #1e293b; }
    .content-box { background: #eef2ff; border-left: 4px solid #4f46e5; border-radius: 8px; padding: 16px 20px; margin: 12px 0; }
    .content-box p { color: #334155; font-size: 14px; line-height: 1.7; white-space: pre-wrap; }
    .signature-section { margin-top: 48px; display: flex; justify-content: flex-end; }
    .signature-box { text-align: center; width: 280px; }
    .signature-line { border-top: 1px solid #94a3b8; margin-bottom: 12px; margin-top: 80px; }
    .signature-name { font-weight: 600; color: #1e293b; font-size: 15px; }
    .signature-rnpi { color: #64748b; font-size: 13px; margin-top: 4px; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; }
    .footer p { color: #94a3b8; font-size: 11px; margin: 4px 0; }
    .footer a { color: #4f46e5; text-decoration: none; }
    .print-btn { position: fixed; bottom: 24px; right: 24px; background: #4f46e5; color: white; border: none; padding: 16px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4); transition: all 0.2s; }
    .print-btn:hover { background: #4338ca; transform: translateY(-2px); }
    @media print { body { padding: 0; background: white; } .document { box-shadow: none; padding: 24px; } .print-btn { display: none; } }
  </style>
</head>
<body>
  <div class="document">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </div>
        <div>
          <div class="logo-text">NUREA</div>
          <div class="logo-subtitle">Derivación Médica</div>
        </div>
      </div>
      <div class="doc-info">
        <p><strong>Fecha:</strong> ${createdDate}</p>
        <p class="doc-number">Ref: ${id.slice(0, 8).toUpperCase()}</p>
      </div>
    </div>
    
    <div class="title">
      <h1>📋 Orden de Interconsulta</h1>
      <p>Documento oficial de derivación generado por NUREA</p>
    </div>
    
    <div class="section">
      <h3 class="section-title">Información Principal</h3>
      <div class="info-grid">
        <div class="info-item">
          <label>Paciente</label>
          <p>${patientName}</p>
        </div>
        <div class="info-item">
          <label>Especialidad de Destino</label>
          <p>${targetSpecName}</p>
        </div>
        <div class="info-item">
          <label>Profesional Emitente</label>
          <p>${professionalName}</p>
        </div>
        <div class="info-item">
          <label>Doctor Solicitado (Opcional)</label>
          <p>${targetProfName}</p>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h3 class="section-title">Motivo de Interconsulta</h3>
      <div class="content-box">
        <p>${referral.reason}</p>
      </div>
    </div>
    
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line"></div>
        <p class="signature-name">${professionalName}</p>
        <p class="signature-rnpi">RNPI: ${rnpi}</p>
      </div>
    </div>
    
    <div class="footer">
      <p>Documento generado a través de <a href="https://nurea.app">NUREA</a> - Plataforma de Telemedicina</p>
      <p>Este documento tiene validez legal según la Ley 20.584 sobre derechos y deberes de los pacientes</p>
      <p>www.nurea.app • soporte@nurea.app</p>
    </div>
  </div>
  
  <button class="print-btn" onclick="window.print()">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="6 9 6 2 18 2 18 9"></polyline>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
      <rect x="6" y="14" width="12" height="8"></rect>
    </svg>
    Imprimir / Descargar PDF
  </button>
</body>
</html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })

  } catch (error) {
    console.error("Error generating referral:", error)
    return NextResponse.json(
      { error: "server_error", message: "Error al generar el documento" },
      { status: 500 }
    )
  }
}
