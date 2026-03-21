import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/documents/prescription/[id]
 * 
 * Generates a professional PDF prescription document.
 * Security: Only the patient who owns the record can download it.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  function escapeHtml(str: string | null | undefined): string {
    if (!str) return ''
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

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

    // Fetch the medical record with professional info
    const { data: record, error: recordError } = await supabase
      .from("medical_records")
      .select(`
        id,
        patient_id,
        reason_for_visit,
        diagnosis,
        diagnosis_code,
        treatment,
        prescription,
        follow_up_instructions,
        created_at,
        is_signed,
        signed_at,
        professional:profiles!medical_records_professional_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq("id", id)
      .single()

    if (recordError || !record) {
      return NextResponse.json(
        { error: "not_found", message: "Documento no encontrado" },
        { status: 404 }
      )
    }

    // Security: Verify the requesting user is the patient
    if (record.patient_id !== user.id) {
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

    // Get professional's registration number
    const { data: professionalData } = await supabase
      .from("professionals")
      .select("registration_number")
      .eq("id", (record.professional as any)?.id)
      .single()

    const professional = (Array.isArray(record.professional) ? record.professional[0] : record.professional) as { first_name: string; last_name: string; email: string } | null
    const professionalName = professional 
      ? `Dr. ${professional.first_name || ''} ${professional.last_name || ''}`.trim()
      : 'Profesional de Salud'
    
    const patientName = patientProfile 
      ? `${patientProfile.first_name || ''} ${patientProfile.last_name || ''}`.trim()
      : 'Paciente'

    const rnpi = professionalData?.registration_number || 'No registrado'

    const createdDate = new Date(record.created_at).toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })

    const signedDate = record.signed_at 
      ? new Date(record.signed_at).toLocaleDateString("es-CL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : createdDate

    // Generate HTML document (will be rendered as printable page)
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receta Médica - NUREA</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f8fafc;
      padding: 40px;
      min-height: 100vh;
    }
    
    .document {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 48px;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #0d9488;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
    }
    
    .logo-text {
      font-size: 32px;
      font-weight: 700;
      color: #0d9488;
      letter-spacing: -0.5px;
    }
    
    .logo-subtitle {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 2px;
    }
    
    .doc-info {
      text-align: right;
      color: #64748b;
      font-size: 13px;
    }
    
    .doc-info p {
      margin: 4px 0;
    }
    
    .doc-number {
      font-family: monospace;
      font-size: 11px;
      background: #f1f5f9;
      padding: 4px 8px;
      border-radius: 4px;
      margin-top: 8px;
    }
    
    .title {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .title h1 {
      font-size: 28px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
    }
    
    .title p {
      color: #64748b;
      font-size: 14px;
    }
    
    .section {
      margin-bottom: 28px;
    }
    
    .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0d9488;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .info-item label {
      font-size: 12px;
      color: #64748b;
      display: block;
      margin-bottom: 4px;
    }
    
    .info-item p {
      font-size: 15px;
      font-weight: 500;
      color: #1e293b;
    }
    
    .content-box {
      background: #f0fdfa;
      border-left: 4px solid #0d9488;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 12px 0;
    }
    
    .content-box p {
      color: #334155;
      font-size: 14px;
      line-height: 1.7;
      white-space: pre-wrap;
    }
    
    .diagnosis-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      padding: 8px 16px;
      border-radius: 8px;
      margin-top: 8px;
    }
    
    .diagnosis-badge code {
      font-family: monospace;
      background: #0d9488;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .diagnosis-badge span {
      color: #0369a1;
      font-size: 14px;
      font-weight: 500;
    }
    
    .signature-section {
      margin-top: 48px;
      display: flex;
      justify-content: flex-end;
    }
    
    .signature-box {
      text-align: center;
      width: 280px;
    }
    
    .signature-line {
      border-top: 1px solid #94a3b8;
      margin-bottom: 12px;
      margin-top: 80px;
    }
    
    .signature-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 15px;
    }
    
    .signature-rnpi {
      color: #64748b;
      font-size: 13px;
      margin-top: 4px;
    }
    
    .signature-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #047857;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 500;
      margin-top: 12px;
    }
    
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
    }
    
    .footer p {
      color: #94a3b8;
      font-size: 11px;
      margin: 4px 0;
    }
    
    .footer a {
      color: #0d9488;
      text-decoration: none;
    }
    
    .print-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0d9488;
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.4);
      transition: all 0.2s;
    }
    
    .print-btn:hover {
      background: #0f766e;
      transform: translateY(-2px);
    }
    
    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .document {
        box-shadow: none;
        padding: 24px;
      }
      
      .print-btn {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="document">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">N</div>
        <div>
          <div class="logo-text">NUREA</div>
          <div class="logo-subtitle">Plataforma de Telemedicina</div>
        </div>
      </div>
      <div class="doc-info">
        <p><strong>Fecha:</strong> ${signedDate}</p>
        <p class="doc-number">Ref: ${id.slice(0, 8).toUpperCase()}</p>
      </div>
    </div>
    
    <div class="title">
      <h1>📋 Ficha Clínica</h1>
      <p>Documento médico oficial generado por NUREA</p>
    </div>
    
    <div class="section">
      <h3 class="section-title">Información del Paciente</h3>
      <div class="info-grid">
        <div class="info-item">
          <label>Nombre completo</label>
          <p>${escapeHtml(patientName)}</p>
        </div>
        <div class="info-item">
          <label>Email</label>
          <p>${escapeHtml(patientProfile?.email || user.email)}</p>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Profesional Tratante</h3>
      <div class="info-grid">
        <div class="info-item">
          <label>Nombre</label>
          <p>${escapeHtml(professionalName)}</p>
        </div>
        <div class="info-item">
          <label>RNPI (Registro Nacional)</label>
          <p>${escapeHtml(rnpi)}</p>
        </div>
      </div>
    </div>
    
    ${record.reason_for_visit ? `
    <div class="section">
      <h3 class="section-title">Motivo de Consulta</h3>
      <div class="content-box">
        <p>${escapeHtml(record.reason_for_visit)}</p>
      </div>
    </div>
    ` : ''}

    ${record.diagnosis ? `
    <div class="section">
      <h3 class="section-title">Diagnóstico</h3>
      ${record.diagnosis_code ? `
      <div class="diagnosis-badge">
        <code>${escapeHtml(record.diagnosis_code)}</code>
        <span>CIE-10</span>
      </div>
      ` : ''}
      <div class="content-box">
        <p>${escapeHtml(record.diagnosis)}</p>
      </div>
    </div>
    ` : ''}

    ${record.treatment ? `
    <div class="section">
      <h3 class="section-title">Plan de Tratamiento</h3>
      <div class="content-box">
        <p>${escapeHtml(record.treatment)}</p>
      </div>
    </div>
    ` : ''}

    ${record.prescription ? `
    <div class="section">
      <h3 class="section-title">💊 Prescripción Médica</h3>
      <div class="content-box">
        <p>${escapeHtml(record.prescription)}</p>
      </div>
    </div>
    ` : ''}

    ${record.follow_up_instructions ? `
    <div class="section">
      <h3 class="section-title">Indicaciones de Seguimiento</h3>
      <div class="content-box">
        <p>${escapeHtml(record.follow_up_instructions)}</p>
      </div>
    </div>
    ` : ''}
    
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line"></div>
        <p class="signature-name">${escapeHtml(professionalName)}</p>
        <p class="signature-rnpi">RNPI: ${escapeHtml(rnpi)}</p>
        ${record.is_signed ? `
        <div class="signature-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Firmado digitalmente el ${escapeHtml(signedDate)}
        </div>
        ` : ''}
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
    console.error("Error generating prescription:", error)
    return NextResponse.json(
      { error: "server_error", message: "Error al generar el documento" },
      { status: 500 }
    )
  }
}
