import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check Kill Switch - pagos de citas deshabilitados por defecto
    // Los profesionales manejan sus pagos directamente via chat/perfil
    const { data: settings } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'payments_enabled')
      .single();

    if (settings?.value === false) {
      return NextResponse.json(
        { 
          error: "payments_disabled", 
          message: "Los pagos directa via plataforma están temporalmente desactivados. Por favor, contacta al profesional directamente para coordinar el pago." 
        },
        { status: 503 }
      );
    }

    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Este endpoint ya no se usa para pagos de citas
    // Los profesionales manejan sus pagos directamente via:
    // - Chat: preset de mensaje con instrucciones de pago
    // - Perfil: información de pago en su perfil
    return NextResponse.json(
      { 
        error: "payment_method_not_available", 
        message: "Por favor, coordina el pago directamente con el profesional vía chat o en su perfil." 
      },
      { status: 410 }
    );

  } catch (error: any) {
    console.error("Mercado Pago Preference Error:", error);
    return NextResponse.json({ error: "preference_creation_failed", message: error.message }, { status: 500 });
  }
}
