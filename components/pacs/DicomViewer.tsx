"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  ZoomIn, 
  Hand, 
  SunMedium, 
  Ruler, 
  RefreshCcw,
  Maximize,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

// In a real implementation we would import cornerstone here:
// import * as cornerstone from "cornerstone-core";
// import * as cornerstoneTools from "cornerstone-tools";
// import * as cornerstoneMath from "cornerstone-math";
// import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
// import * as dicomParser from "dicom-parser";

interface DicomViewerProps {
  dicomUrl: string;
}

export default function DicomViewer({ dicomUrl }: DicomViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState("Wwwc"); // Window/Level by default
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Cornerstone Initialization and WADO Image Loading simulation
  useEffect(() => {
    let isMounted = true;
    
    // Attempt dynamically loading cornerstone async to avoid SSR issues
    const initCornerstone = async () => {
      try {
        // Here we would configure cornerstoneWADOImageLoader and register tools
        // cornerstoneTools.init();
        // cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
        // cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
        
        // Since we don't have a reliable testing file to load out of the box without CORS,
        // we'll mock the cornerstone loading logic for the showcase of the UI.
        const element = viewerRef.current;
        if (!element) return;

        // Simulate downloading large DICOM file
        setTimeout(() => {
          if (isMounted) setIsLoaded(true);
        }, 1500);

      } catch (err) {
        console.error("Error initializing cornerstone", err);
        if (isMounted) setLoadError(true);
      }
    };

    initCornerstone();

    return () => {
      isMounted = false;
      // Cleanup cornerstone element here
      // if (viewerRef.current) {
      //   cornerstone.disable(viewerRef.current);
      // }
    };
  }, [dicomUrl]);

  // Handle changing the active tool
  const handleToolChange = (toolName: string) => {
    setActiveTool(toolName);
    // In actual implementation:
    // cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
  };

  const tools = [
    { id: "Wwwc", icon: <SunMedium className="h-5 w-5" />, label: "Brillo/Contraste" },
    { id: "Zoom", icon: <ZoomIn className="h-5 w-5" />, label: "Zoom" },
    { id: "Pan", icon: <Hand className="h-5 w-5" />, label: "Paneo" },
    { id: "Length", icon: <Ruler className="h-5 w-5" />, label: "Medir (Regla)" },
  ];

  return (
    <div className="relative flex flex-col h-full w-full bg-[#030712] rounded-xl overflow-hidden border border-[#1f2937]">    
      {/* Top Toolbar (Dark Gray) */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#111827] border-b border-[#1f2937] text-gray-300">
        <div className="flex space-x-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolChange(tool.id)}
              className={cn(
                "p-2 rounded-md transition-colors",
                activeTool === tool.id 
                  ? "bg-[#374151] text-white shadow-sm" 
                  : "hover:bg-[#1f2937] hover:text-white"
              )}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
          <div className="w-px h-6 bg-[#374151] self-center mx-2" />
          <button className="p-2 rounded-md hover:bg-[#1f2937] hover:text-white transition-colors" title="Restaurar Visor">
            <RefreshCcw className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="hidden sm:inline-block">WL: 128 / WW: 256</span>
          <span className="hidden sm:inline-block">Zoom: 1.0x</span>
          <button className="p-2 rounded-md hover:bg-[#1f2937] hover:text-white transition-colors" title="Pantalla Completa">
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Viewport Area (Deep Black) */}
      <div 
        ref={viewerRef} 
        className="flex-1 relative w-full h-full bg-black flex items-center justify-center select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Placeholder rendering since WADO loader needs an actual DICOM instance context */}
        {!isLoaded && !loadError && (
          <div className="flex flex-col items-center justify-center space-y-4 text-[#4b5563]">
            <Download className="h-10 w-10 animate-pulse" />
            <p className="font-mono text-sm tracking-wider">M O N T A N D O   I M A G E N ...</p>
          </div>
        )}

        {loadError && (
          <div className="text-red-500 font-mono text-sm">
            ERROR: NO SE PUDO CARGAR EL ARCHIVO DICOM.
          </div>
        )}

        {isLoaded && (
          <>
            {/* Simulated Medical Image (Chest X-Ray Placeholder or mock visual) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-gray-700 to-black opacity-30 mix-blend-overlay pointer-events-none" />
            <div className="w-2/3 h-5/6 rounded-3xl border border-white/5 bg-[url('https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=1000&auto=format&fit=crop')] bg-contain bg-center bg-no-repeat grayscale contrast-150 brightness-75">
               {/* Medical Overlays (DICOM Metadata overlay) */}
               <div className="absolute top-4 left-4 text-[#14b8a6] text-xs font-mono drop-shadow-md">
                 <p>PACIENTE: Anónimo</p>
                 <p>ID: NR-{Math.floor(Math.random() * 9000) + 1000}</p>
                 <p>SEXO: M</p>
               </div>
               <div className="absolute top-4 right-4 text-[#14b8a6] text-xs font-mono drop-shadow-md text-right">
                 <p>NUREA CLINICA</p>
                 <p>{new Date().toLocaleDateString()}</p>
                 <p>MOD: DX</p>
               </div>
               <div className="absolute bottom-4 left-4 text-[#14b8a6] text-xs font-mono drop-shadow-md">
                 <p>W: 4096 L: 2048</p>
                 <p>Zoom: 100%</p>
               </div>
               <div className="absolute bottom-4 right-4 text-[#14b8a6] text-xs font-mono drop-shadow-md text-right">
                 <p>Acc: 981273912</p>
                 <p>Thick: 0.0 mm</p>
               </div>
            </div>
            {/* Visual Ruler Mock (if ruler is active) */}
            {activeTool === "Length" && (
              <div className="absolute w-48 h-px bg-yellow-400 rotate-45 transform inset-1/2 flex items-center justify-center pointer-events-none">
                <span className="bg-black/50 text-yellow-400 text-[10px] px-1 absolute -top-4 font-mono">4.2 cm</span>
                <div className="w-2 h-2 rounded-full border border-yellow-400 absolute left-0" />
                <div className="w-2 h-2 rounded-full border border-yellow-400 absolute right-0" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
