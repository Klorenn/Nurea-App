import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface ConsultationType {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  modality: "online" | "in-person" | "both";
  description?: string;
}

/**
 * GET /api/professional/consultation-types
 * Returns the authenticated professional's consultation_types array.
 */
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
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "professional") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error: fetchError } = await supabase
      .from("professionals")
      .select("consultation_types")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("[CONSULTATION-TYPES:GET] DB fetch error:", fetchError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json({
      consultationTypes: (data?.consultation_types as ConsultationType[]) ?? [],
    });
  } catch (e) {
    console.error("[CONSULTATION-TYPES:GET] Unexpected error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/professional/consultation-types
 * Replaces the entire consultation_types array for the authenticated professional.
 *
 * Body: { consultationTypes: ConsultationType[] }
 */
export async function PUT(req: NextRequest) {
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
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "professional") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { consultationTypes } = body as { consultationTypes: ConsultationType[] };

    if (!Array.isArray(consultationTypes)) {
      return NextResponse.json(
        { error: "invalid_input", message: "consultationTypes must be an array." },
        { status: 400 }
      );
    }

    // Validate each item: must have name and price > 0
    for (const [i, item] of consultationTypes.entries()) {
      if (!item.name || typeof item.name !== "string" || item.name.trim() === "") {
        return NextResponse.json(
          {
            error: "invalid_input",
            message: `Item at index ${i} is missing a valid 'name'.`,
          },
          { status: 400 }
        );
      }
      if (typeof item.price !== "number" || item.price < 0) {
        return NextResponse.json(
          {
            error: "invalid_input",
            message: `Item at index ${i} must have a valid 'price' (0 or greater).`,
          },
          { status: 400 }
        );
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from("professionals")
      .upsert({ id: user.id, consultation_types: consultationTypes }, { onConflict: "id" })
      .select("consultation_types")
      .maybeSingle();

    if (updateError) {
      console.error("[CONSULTATION-TYPES:PUT] DB update error:", updateError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      consultationTypes: (updated?.consultation_types as ConsultationType[]) ?? consultationTypes,
    });
  } catch (e) {
    console.error("[CONSULTATION-TYPES:PUT] Unexpected error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
