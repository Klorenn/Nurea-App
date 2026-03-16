import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPreference } from "@/lib/mercadopago";
import { getJitsiMeetingUrl } from "@/lib/utils/jitsi";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check Kill Switch
    const { data: settings } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'payments_enabled')
      .single();

    if (settings?.value === false) {
      return NextResponse.json(
        { error: "payments_disabled", message: "Los pagos están temporalmente desactivados." },
        { status: 503 }
      );
    }

    // Verify authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      professionalId, 
      appointmentDate, 
      appointmentTime, 
      type = "online",
      duration = 60 
    } = body;

    // Get patient profile
    const { data: patientProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", user.id)
      .single();

    // Get professional info
    const { data: professional } = await supabase
      .from("professionals")
      .select(`
        id,
        online_price,
        in_person_price,
        consultation_price,
        profile:profiles!professionals_id_fkey(first_name, last_name)
      `)
      .eq("id", professionalId)
      .single();

    if (!professional) {
      return NextResponse.json({ error: "professional_not_found" }, { status: 404 });
    }

    // Determine price
    let price = professional.consultation_price || 45000;
    if (type === "online" && professional.online_price) {
      price = professional.online_price;
    } else if (type === "in-person" && professional.in_person_price) {
      price = professional.in_person_price;
    }

    const professionalProfile = professional.profile as any;
    const professionalName = professionalProfile 
      ? `Dr. ${professionalProfile.first_name || ''} ${professionalProfile.last_name || ''}`.trim()
      : 'Profesional de Salud';

    // Create pending appointment
    const appointmentId = crypto.randomUUID();
    const meetingLink = type === "online" ? getJitsiMeetingUrl(appointmentId) : null;

    const { error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        id: appointmentId,
        patient_id: user.id,
        professional_id: professionalId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        duration_minutes: duration,
        type,
        status: "pending",
        is_online: type === "online",
        payment_status: "pending",
        price: price,
        meeting_link: meetingLink,
      });

    if (appointmentError) throw appointmentError;

    // Create Mercado Pago Preference
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    const preference = await createPreference({
      items: [
        {
          title: `Consulta con ${professionalName}`,
          unit_price: price,
          quantity: 1,
          currency_id: "CLP"
        }
      ],
      payer: {
        email: patientProfile?.email || user.email,
        name: patientProfile?.first_name,
        surname: patientProfile?.last_name
      },
      back_urls: {
        success: `${baseUrl}/dashboard/appointments?payment=success&appointment=${appointmentId}`,
        failure: `${baseUrl}/professionals/${professionalId}?payment=failure`,
        pending: `${baseUrl}/dashboard/appointments?payment=pending&appointment=${appointmentId}`,
      },
      auto_return: "approved",
      external_reference: appointmentId,
      metadata: {
        appointmentId,
        patientId: user.id,
        professionalId
      }
    });

    return NextResponse.json({
      success: true,
      url: preference.init_point, // For production
      sandbox_url: preference.sandbox_init_point, // For testing
      preferenceId: preference.id,
      appointmentId
    });

  } catch (error: any) {
    console.error("Mercado Pago Preference Error:", error);
    return NextResponse.json({ error: "preference_creation_failed", message: error.message }, { status: 500 });
  }
}
