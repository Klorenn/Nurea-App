import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_MESSAGE =
  "Hola, gracias por agendar conmigo. El pago de la consulta se coordina directamente por este chat (transferencia, bono u otro medio que acordemos).";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user is a professional
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "professional") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from("professionals")
      .select("booking_auto_message, consultation_types")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({
      bookingAutoMessage: data?.booking_auto_message?.trim() || DEFAULT_MESSAGE,
      consultationTypes: (data?.consultation_types as unknown[]) ?? [],
    });
  } catch (e) {
    console.error("Booking settings GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user is a professional
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "professional") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { bookingAutoMessage } = body as { bookingAutoMessage: string | null };

    if (typeof bookingAutoMessage === 'string' && bookingAutoMessage.length > 2000) {
      return NextResponse.json({ error: 'invalid_input', message: 'El mensaje no puede superar los 2000 caracteres.' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("professionals")
      .update({
        booking_auto_message:
          typeof bookingAutoMessage === "string"
            ? bookingAutoMessage.trim() || null
            : null,
      })
      .eq("id", user.id);

    if (error) {
      console.error('Booking settings PATCH update error:', error)
      return NextResponse.json({ error: 'update_failed', message: 'No se pudo guardar la configuración.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      bookingAutoMessage:
        typeof bookingAutoMessage === "string"
          ? bookingAutoMessage.trim() || DEFAULT_MESSAGE
          : DEFAULT_MESSAGE,
    });
  } catch (e) {
    console.error("Booking settings PATCH error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
