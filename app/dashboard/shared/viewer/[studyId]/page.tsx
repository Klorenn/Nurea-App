import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PacsWorkspace from "@/components/pacs/PacsWorkspace";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NUREA PACS - Visor Radiológico",
  description: "Visor DICOM Zero-Footprint para NUREA",
};

export default async function ViewerPage({
  params,
}: {
  params: { studyId: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch study — RLS enforces access control server-side
  const { data: study, error } = await supabase
    .from("imaging_studies")
    .select("*")
    .eq("id", params.studyId)
    .single();

  // Graceful mock for demo or if table not yet migrated
  const studyData = error || !study
    ? {
        id: params.studyId,
        patient_id: "mock",
        study_type: "RX",
        modality: "DX",
        accession_number: "981273912",
        dicom_web_endpoint: "wado-rs://mock",
        report_text: "",
        report_status: "pending",
      }
    : study;

  // Fetch user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isProfessional =
    profile?.role === "professional" || profile?.role === "admin";

  return (
    <div className="h-screen w-full bg-black flex overflow-hidden">
      <PacsWorkspace
        study={studyData}
        isProfessional={isProfessional}
        userId={user.id}
      />
    </div>
  );
}
