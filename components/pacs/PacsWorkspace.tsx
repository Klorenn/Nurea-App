"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ReportEditor from "./ReportEditor";

// Dynamic import for DICOM canvas — avoids SSR document/window errors
const DicomViewerClient = dynamic(() => import("./DicomViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 w-full h-full bg-black flex items-center justify-center font-mono text-gray-400">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-[#14b8a6] animate-spin mb-4" />
        <p>CARGANDO MOTOR DICOM...</p>
      </div>
    </div>
  ),
});

interface PacsWorkspaceProps {
  study: any;
  isProfessional: boolean;
  userId: string;
}

export default function PacsWorkspace({ study, isProfessional, userId }: PacsWorkspaceProps) {
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleSaveReport = async (text: string, isFinal: boolean) => {
    if (!study.id || study.id === "mock") {
      if (isFinal) {
        toast.success("Informe firmado y enviado (Demo)");
        router.push("/dashboard/professional");
      } else {
        toast.success("Borrador guardado (Demo)");
      }
      return;
    }

    setIsSaving(true);
    try {
      const status = isFinal ? "final" : "draft";
      const { error } = await supabase
        .from("imaging_studies")
        .update({ report_text: text, report_status: status })
        .eq("id", study.id);

      if (error) throw error;

      if (isFinal) {
        toast.success("✓ Informe firmado y enviado correctamente");
        router.push("/dashboard/professional");
      }
    } catch (e) {
      console.error("Failed to save report:", e);
      toast.error("Error al guardar el informe");
      throw e;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-full h-full text-foreground bg-black">
      {/* DICOM Viewer Panel */}
      <div className={`transition-all duration-300 ${isProfessional ? "w-[58%] lg:w-[65%]" : "w-full"} h-full`}>
        <DicomViewerClient dicomUrl={study.dicom_web_endpoint} />
      </div>

      {/* RIS Report Panel — Professional only */}
      {isProfessional && (
        <div className="w-[42%] lg:w-[35%] h-full bg-white dark:bg-[#0f172a] shadow-[-8px_0_20px_-4px_rgba(0,0,0,0.6)] z-10 overflow-hidden">
          <ReportEditor
            studyId={study.id}
            modality={study.modality || study.study_type || "RX"}
            initialReportText={study.report_text || ""}
            onSave={handleSaveReport}
            isSaving={isSaving}
          />
        </div>
      )}

      {/* Patient view: read-only final report overlay */}
      {!isProfessional && study.report_status === "final" && study.report_text && (
        <div className="absolute bottom-10 right-10 bg-black/80 backdrop-blur-md border border-white/10 p-6 rounded-xl max-w-sm text-white font-mono shadow-2xl z-20">
          <h3 className="text-[#14b8a6] mb-2 border-b border-[#14b8a6]/30 pb-2 font-bold tracking-wider text-sm">
            IMPRESIÓN DIAGNÓSTICA
          </h3>
          <div
            className="text-sm opacity-90 leading-relaxed font-sans prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: study.report_text }}
          />
        </div>
      )}
    </div>
  );
}
