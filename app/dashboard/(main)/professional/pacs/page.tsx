import React from "react"
import { Metadata } from "next"
import DICOMUploader from "@/components/professional/DICOMUploader"

export const metadata: Metadata = {
  title: "Cargar Estudio PACS | NUREA",
  description: "Carga segura de imágenes médicas DICOM",
}

export default function PacsUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Imágenes Médicas (PACS)</h1>
        <p className="text-muted-foreground">
          Estación de carga exclusiva para profesionales verificados.
        </p>
      </div>
      <DICOMUploader />
    </div>
  )
}
