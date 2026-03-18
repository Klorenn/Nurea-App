import { NextRequest, NextResponse } from "next/server";
import { hasAnyAvailability } from "@/lib/utils/availability-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { genderizeSpecialtyLabel } from "@/lib/utils/genderize-specialty";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const professionalId = searchParams.get("professionalId");
    if (!professionalId) {
      return NextResponse.json(
        { error: "professionalId required" },
        { status: 400 }
      );
    }

    // Usamos admin (service role) para saltarnos RLS: este endpoint debe ser
    // consistente con `/api/explore` y con la configuración guardada en la BD.
    const supabase = createAdminClient();

    // 1) Buscar profesional en Supabase.
    // `bio_extended` puede no existir en algunos entornos (según migraciones aplicadas),
    // así que lo intentamos y si falla por columna faltante, re-consultamos sin ese campo.
    const selectProfessionalFieldsWithExtended = `
      id,
      specialty,
      consultation_type,
      bio,
      bio_extended,
      availability
    `;

    const selectProfessionalFieldsWithoutExtended = `
      id,
      specialty,
      consultation_type,
      bio,
      availability
    `;

    let professionalById: any = null;
    let selectError: any = null;

    const firstAttempt = await supabase
      .from("professionals")
      .select(selectProfessionalFieldsWithExtended)
      .eq("id", professionalId)
      .maybeSingle();

    professionalById = firstAttempt.data;
    selectError = firstAttempt.error;

    if (!professionalById && selectError?.message?.toLowerCase()?.includes("bio_extended")) {
      const retryAttempt = await supabase
        .from("professionals")
        .select(selectProfessionalFieldsWithoutExtended)
        .eq("id", professionalId)
        .maybeSingle();
      professionalById = retryAttempt.data;
    }

    const professional = professionalById;

    if (!professional) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }

    // 2) Buscar perfil (para nombre + avatar) en una consulta separada.
    let profile: any = null;
    const { data: profileWithGender, error: profileGenderError } = await supabase
      .from("profiles")
      .select("first_name,last_name,avatar_url,gender")
      .eq("id", professional.id)
      .maybeSingle();

    if (profileGenderError && profileGenderError.message.toLowerCase().includes("gender")) {
      const { data: profileWithoutGender } = await supabase
        .from("profiles")
        .select("first_name,last_name,avatar_url")
        .eq("id", professional.id)
        .maybeSingle();
      profile = profileWithoutGender;
    } else {
      profile = profileWithGender;
    }

    const rawConsultationType = professional.consultation_type;
    const consultationType: "online" | "in-person" | "both" =
      rawConsultationType === "online" ||
      rawConsultationType === "in-person" ||
      rawConsultationType === "both"
        ? rawConsultationType
        : "both";

    // If it doesn't have any configured availability, the UI should show the
    // "Calendario no disponible" message (this is the intended condition).
    if (!hasAnyAvailability(professional.availability, consultationType)) {
      return NextResponse.json(
        { error: "Professional calendar not configured" },
        { status: 404 }
      );
    }

    const name = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
    const gender = profile?.gender as "M" | "F" | undefined;

    return NextResponse.json({
      supabaseUserId: professional.id,
      name: name || professional.specialty || "Profesional",
      specialty: genderizeSpecialtyLabel(professional.specialty || "", gender),
      avatarUrl: profile?.avatar_url || null,
      bio: professional.bio || professional.bio_extended || "",
      consultationType,
    });
  } catch (e) {
    console.error("Calendar professional lookup error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
