"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CloudUpload, User, Activity, FileText, Ban, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Mock Nura Owl SVG with stethoscope setup below
const NuraOwlStethoscope = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-3 text-[#14b8a6]">
    {/* Body */}
    <path d="M12 24C12 14.0589 20.0589 6 30 6C39.9411 6 48 14.0589 48 24C48 33.9411 39.9411 42 30 42C20.0589 42 12 33.9411 12 24Z" fill="currentColor" opacity="0.1"/>
    <path d="M24 10C16.8203 10 11 15.8203 11 23V29C11 36.1797 16.8203 42 24 42C31.1797 42 37 36.1797 37 29V23C37 15.8203 31.1797 10 24 10Z" fill="currentColor" opacity="0.2"/>
    <rect x="16" y="2" width="6" height="10" rx="3" fill="currentColor"/>
    <rect x="26" y="2" width="6" height="10" rx="3" fill="currentColor"/>
    <circle cx="20" cy="18" r="3" fill="#0f172a" />
    <circle cx="28" cy="18" r="3" fill="#0f172a" />
    <path d="M24 24L26 21H22L24 24Z" fill="#f59e0b" />
    {/* Stethoscope */}
    <path d="M15 28C15 32.9706 19.0294 37 24 37C28.9706 37 33 32.9706 33 28V24" stroke="#0f766e" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="24" cy="37" r="4" fill="#0f766e" />
    <circle cx="15" cy="23" r="1.5" fill="#0f766e" />
    <circle cx="33" cy="23" r="1.5" fill="#0f766e" />
  </svg>
);

interface ActivePatient {
  id: string;
  name: string;
}

export default function DICOMUploader() {
  const { user } = useAuth();
  const supabase = createClient();
  const [patients, setPatients] = useState<ActivePatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [modality, setModality] = useState<string>("");
  const [note, setNote] = useState<string>("");
  
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Verify Professional Status
  const [isProfessional, setIsProfessional] = useState<boolean | null>(null);

  useEffect(() => {
    const checkProfessionalStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
        
      setIsProfessional(data?.role === "professional" || data?.role === "admin");
      
      if (data?.role === "professional" || data?.role === "admin") {
        fetchPatients();
      }
    };
    checkProfessionalStatus();
  }, [user]);

  const fetchPatients = async () => {
    if (!user) return;
    
    // In a real scenario we'd query distinct patients from appointments
    // For this demonstration we will mock the query fetching the top 3 patients
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("role", "patient")
      .limit(5);

    if (data) {
      setPatients(data.map(p => ({
        id: p.id,
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Paciente Sin Nombre'
      })));
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out non-dicom if necessary, but accept them since extensions might vary.
    // Usually dropping a folder works and we filter by .dcm internally or let the backend validate.
    if (acceptedFiles.length === 0) return;
    setFiles(acceptedFiles);
    setIsSuccess(false);
    setProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    noClick: false,
    noKeyboard: false
  });

  const uploadStudy = async () => {
    if (!selectedPatient || !modality || files.length === 0 || !user) {
      toast.error("Faltan datos requeridos (Paciente, Modalidad o Archivos).");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    
    try {
      // 1. "Upload" simulation (In real life: upload to dicom-studies bucket in Supabase)
      const totalSteps = files.length;
      const uploadedPaths: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        // Mock progress
        const file = files[i];
        const path = `${selectedPatient}/${new Date().getTime()}/${file.name}`;
        
        // Simulating rapid upload batch chunks
        await new Promise(r => setTimeout(r, 20)); // simulated latency
        
        setProgress(Math.round(((i + 1) / totalSteps) * 100));
        uploadedPaths.push(path);
      }
      
      // 2. Register Study into `imaging_studies` table
      const { data: study, error: studyError } = await supabase
        .from("imaging_studies")
        .insert({
          patient_id: selectedPatient,
          professional_id: user.id,
          study_type: modality,
          modality: modality,
          dicom_web_endpoint: `wado-rs://${uploadedPaths[0]}`, // Base endpoint reference
          accession_number: Math.floor(Math.random() * 10000000).toString(),
          report_text: note,
          report_status: "pending"
        })
        .select()
        .single();
        
      if (studyError) throw studyError;

      // 3. Notify Patient
      await supabase.from("notifications").insert({
        profile_id: selectedPatient,
        type: "medical_records", // Or whatever valid type
        title: "Nuevo estudio de imagen",
        message: "Se ha cargado un nuevo estudio de imagen a tu ficha médica.",
        link: `/dashboard/patient/records`,
        is_read: false
      });

      setIsSuccess(true);
      toast.success("Estudio cargado y paciente notificado con éxito.");
      setFiles([]);
      setModality("");
      setNote("");
      setSelectedPatient("");
      
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error en la carga del estudio.");
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = () => {
    setFiles([]);
    setProgress(0);
    setIsUploading(false);
  };

  if (isProfessional === false) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50/50 rounded-xl border border-red-100 dark:bg-red-950/20 dark:border-red-900/50">
        <Ban className="w-10 h-10 text-red-500 mb-3" />
        <h3 className="text-lg font-medium text-red-700 dark:text-red-400">Acceso Denegado</h3>
        <p className="text-sm text-red-600/80 dark:text-red-400/80 text-center max-w-sm mt-1">
          La carga de estudios visuales DICOM es exclusiva para profesionales médicos verificados.
        </p>
      </div>
    );
  }

  if (isProfessional === null) {
    return <div className="h-64 flex items-center justify-center"><RefreshCw className="animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* LEFT: Configuration Pane */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800 p-6 bg-gray-50/50 dark:bg-[#0f172a]/50">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <CloudUpload className="w-5 h-5 mr-2 text-[#0f766e]" />
          Nueva Carga DICOM
        </h2>
        
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              <User className="w-4 h-4 mr-1.5" /> Paciente Activo
            </label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient} disabled={isUploading}>
              <SelectTrigger className="w-full border-gray-300 dark:border-slate-700">
                <SelectValue placeholder="Seleccionar paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              <Activity className="w-4 h-4 mr-1.5" /> Modalidad
            </label>
            <Select value={modality} onValueChange={setModality} disabled={isUploading}>
              <SelectTrigger className="w-full border-gray-300 dark:border-slate-700">
                <SelectValue placeholder="Seleccionar modalidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RX">Rayos X (DX)</SelectItem>
                <SelectItem value="TAC">Tomografía Computarizada (CT)</SelectItem>
                <SelectItem value="RM">Resonancia Magnética (MR)</SelectItem>
                <SelectItem value="ECO">Ecografía (US)</SelectItem>
                <SelectItem value="PET">Tomografía Emisión Positrones (PT)</SelectItem>
                <SelectItem value="OTHER">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              <FileText className="w-4 h-4 mr-1.5" /> Nota Clínica Inicial
            </label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isUploading}
              className="w-full h-24 p-3 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-sm resize-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
              placeholder="Indique motivo del examen, zona u observaciones preliminares..."
            />
          </div>
        </div>
      </div>

      {/* RIGHT: Dropzone Area */}
      <div className="w-full md:w-2/3 p-6 flex flex-col justify-center">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center p-8 bg-[#f0fdfa] dark:bg-[#134e4a]/10 rounded-xl border border-[#ccfbf1] dark:border-[#115e59]/30 h-full text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-[#0f766e] dark:text-[#2dd4bf]" />
            <div>
              <h3 className="text-xl font-bold text-[#115e59] dark:text-[#5eead4] mb-1">¡Estudio Cargado Exitosamente!</h3>
              <p className="text-[#0f766e]/80 dark:text-[#2dd4bf]/80 text-sm">El paciente ha sido notificado y las imágenes ya están disponibles para el Visor Zero-Footprint.</p>
            </div>
            <Button onClick={() => setIsSuccess(false)} variant="outline" className="mt-4 border-[#0f766e] text-[#0f766e] hover:bg-[#0f766e]/10 dark:hover:bg-[#115e59]/50">
              Cargar Otro Estudio
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full space-y-4">
            <div 
              {...getRootProps()} 
              className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-colors ${
                isDragActive 
                  ? 'border-[#0f766e] bg-[#0f766e]/5 dark:bg-[#0f766e]/10' 
                  : 'border-gray-300 dark:border-slate-700 hover:border-[#0f766e]/50 hover:bg-gray-50 dark:hover:bg-[#1e293b]/50'
              } ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
            >
              <input {...getInputProps()} 
                // Using an un-typed prop approach for directory drop
                // This allows folders to be dropped in standard browsers
                {...{
                  webkitdirectory: "true",
                  directory: "true"
                } as any}
              />
              
              <NuraOwlStethoscope />
              
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 text-center mb-1">
                {isDragActive ? "Suelte la carpeta/archivos aquí" : "Arrastra y suelta tu carpeta DICOM o imágenes"}
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center max-w-sm mb-4">
                Solo archivos DICOM originales para garantizar calidad diagnóstica. Extraeremos los metadatos de forma segura.
              </p>
              
              {!isUploading && !isDragActive && (
                <Button type="button" variant="secondary" className="font-semibold" disabled={isUploading}>
                  Explorar Archivos
                </Button>
              )}
            </div>

            {/* Selection Status & Upload Control */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4">
               <div className="flex-1 w-full flex items-center mb-3 sm:mb-0">
                  <div className="flex flex-col w-full">
                    {files.length > 0 ? (
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-semibold text-[#0f766e] dark:text-[#2dd4bf]">{files.length} archivos .dcm apilados</span>
                        {isUploading && <span className="text-xs font-mono text-gray-500">{progress}%</span>}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400 italic">No hay archivos seleccionados</span>
                    )}
                    {(files.length > 0 || isUploading) && (
                       <Progress value={progress} className="h-2 w-full bg-gray-200 dark:bg-slate-700" />
                    )}
                  </div>
               </div>

               <div className="ml-0 sm:ml-6 flex items-center space-x-3 w-full sm:w-auto">
                 {files.length > 0 && !isUploading && (
                   <Button variant="ghost" onClick={cancelUpload} className="text-gray-500 hover:text-red-500" size="sm">
                     Limpiar
                   </Button>
                 )}
                 <Button 
                   onClick={uploadStudy} 
                   className="bg-[#0f766e] hover:bg-[#115e59] text-white font-semibold w-full sm:w-auto"
                   disabled={files.length === 0 || isUploading || !selectedPatient || !modality}
                 >
                   {isUploading ? (
                     <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Procesando Lote...</>
                   ) : (
                     <><CloudUpload className="w-4 h-4 mr-2" /> Subir al PACS</>
                   )}
                 </Button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
