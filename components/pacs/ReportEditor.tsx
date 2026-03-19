"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extension-placeholder";
import {
  Save, CheckCircle2, FileText, Send, RefreshCcw,
  Mic, MicOff, AlertCircle, Sparkles, ChevronDown,
  Bold, Italic, List, ListOrdered, Heading2, Loader2,
  Plus, Trash2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  is_default: boolean;
}

// Default starter templates when none exist in DB
const STARTER_TEMPLATES: Omit<Template, "id">[] = [
  {
    name: "Radiografía de Tórax Normal",
    category: "rx",
    content: `<h2>HALLAZGOS</h2><p>Silueta cardíaca de tamaño y morfología dentro de límites normales. Índice cardiotorácico conservado. Trama broncovascular pulmonar simétrica sin alteraciones significativas. Senos costofrénicos libres y agudos bilateralmente. Sin evidencia de derrame pleural, neumotórax o consolidaciones. Diafragma de aspecto normal.</p><h2>IMPRESIÓN DIAGNÓSTICA</h2><p>Radiografía de tórax PA sin alteraciones significativas.</p><h2>SUGERENCIAS</h2><p>Sin sugerencias adicionales. Correlacionar con cuadro clínico.</p>`,
    is_default: true,
  },
  {
    name: "Ecografía Abdominal Normal",
    category: "eco",
    content: `<h2>HALLAZGOS</h2><p><strong>Hígado:</strong> Tamaño y ecogenicidad conservados, sin lesiones focales identificables. Vía biliar intrahepática no dilatada.</p><p><strong>Vesícula biliar:</strong> De paredes finas, sin litiasis ni engrosamiento.</p><p><strong>Páncreas:</strong> Visualización parcial por interposición gaseosa, sin signos de alteración en el segmento visible.</p><p><strong>Bazo:</strong> Tamaño y ecogenicidad normal, sin lesiones.</p><p><strong>Riñones:</strong> Tamaño y morfología conservados bilateralmente, sin dilatación pielocálicial ni litiasis.</p><h2>IMPRESIÓN DIAGNÓSTICA</h2><p>Ecografía abdominal sin hallazgos patológicos de relevancia.</p><h2>SUGERENCIAS</h2><p>Sin sugerencias adicionales.</p>`,
    is_default: false,
  },
  {
    name: "TAC de Cerebro Sin Contraste Normal",
    category: "tac",
    content: `<h2>HALLAZGOS</h2><p>Estudio tomográfico de cráneo sin administración de medio de contraste. Parénquima cerebral de densidad y morfología conservadas, sin lesiones hiperdensas ni hipodensas. Sistema ventricular de tamaño y posición normal, sin desviación de línea media. Surcos corticales de amplitud normal para la edad del paciente. Sin evidencia de colecciones extra-axiales. Estructuras de la fosa posterior sin alteraciones.</p><h2>IMPRESIÓN DIAGNÓSTICA</h2><p>TAC de cerebro sin contraste sin evidencia de lesiones agudas.</p><h2>SUGERENCIAS</h2><p>Sin sugerencias adicionales. Correlacionar con cuadro clínico.</p>`,
    is_default: false,
  },
];

interface ReportEditorProps {
  studyId: string;
  modality?: string;
  initialReportText?: string;
  onSave: (text: string, isFinal: boolean) => Promise<void>;
  isSaving: boolean;
}

export default function ReportEditor({
  studyId,
  modality = "RX",
  initialReportText = "",
  onSave,
  isSaving,
}: ReportEditorProps) {
  const supabase = createClient();
  const [status, setStatus] = useState<"editing" | "saved">("editing");
  const [isDictating, setIsDictating] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiHighlighted, setAiHighlighted] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");

  const recognitionRef = useRef<any>(null);
  const isDictatingRef = useRef(isDictating);

  useEffect(() => { isDictatingRef.current = isDictating; }, [isDictating]);

  // ── Tiptap Editor ─────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: "Escriba notas de hallazgos aquí, o use el dictado por voz, luego presione '✨ Redactar con Nura' para transformarlos en un informe formal...",
      }),
    ],
    content: initialReportText || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-6 py-4 text-gray-800 dark:text-gray-200 leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      if (status === "saved") setStatus("editing");
      if (aiHighlighted) setAiHighlighted(false);
    },
    immediatelyRender: false,
  });

  // ── Load Templates from DB ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchTemplates = async () => {
      setTemplatesLoading(true);
      const { data, error } = await supabase
        .from("report_templates")
        .select("*")
        .order("name", { ascending: true });

      if (data && data.length > 0) {
        setTemplates(data);
      } else {
        // Use starter templates as fallbacks (no DB write needed — they're in-memory)
        setTemplates(STARTER_TEMPLATES.map((t, i) => ({ ...t, id: `local-${i}` })));
      }
      setTemplatesLoading(false);
    };
    fetchTemplates();
  }, []);

  // ── Apply Template ─────────────────────────────────────────────────────────
  const applyTemplate = (template: Template) => {
    if (!editor) return;
    editor.commands.setContent(template.content);
    setStatus("editing");
    toast.success(`Plantilla "${template.name}" cargada`);
  };

  // ── Save Current as Template ───────────────────────────────────────────────
  const saveAsTemplate = async () => {
    if (!newTemplateName.trim() || !editor) return;
    const content = editor.getHTML();
    const { data, error } = await supabase
      .from("report_templates")
      .insert({ name: newTemplateName, category: modality?.toLowerCase() || "general", content, is_default: false })
      .select()
      .single();
    if (data) {
      setTemplates(prev => [...prev.filter(t => !t.id.startsWith("local-")), data]);
      toast.success("Plantilla guardada en tu biblioteca");
    }
    setShowSaveTemplate(false);
    setNewTemplateName("");
  };

  // ── NuraRad AI ─────────────────────────────────────────────────────────────
  const generateWithNura = async () => {
    if (!editor) return;
    const rawNotes = editor.getText();
    if (rawNotes.trim().length < 10) {
      toast.error("Escribe algunas notas primero para que Nura pueda redactar el informe.");
      return;
    }

    setIsAILoading(true);
    try {
      const res = await fetch("/api/nura/radiology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: rawNotes, modality }),
      });

      const { report, error } = await res.json();
      if (!res.ok || error) throw new Error(error || "Error de IA");

      // Inject AI-generated content and highlight it
      editor.commands.setContent(report);
      
      // Apply highlight to all text to show it's AI-generated
      editor.commands.selectAll();
      editor.commands.setHighlight({ color: "#fef08a" }); // yellow highlight
      
      // Move cursor to beginning for review
      editor.commands.setTextSelection(0);
      
      setAiHighlighted(true);
      toast.success("✨ Informe generado. Revisa y edita antes de firmar.", { duration: 6000 });
      setStatus("editing");
    } catch (err: any) {
      toast.error(err.message || "Error al generar informe con Nura");
    } finally {
      setIsAILoading(false);
    }
  };

  // ── Clear AI highlight ─────────────────────────────────────────────────────
  const clearAiHighlight = () => {
    if (!editor) return;
    editor.commands.selectAll();
    editor.commands.unsetHighlight();
    setAiHighlighted(false);
  };

  // ── Speech Recognition ─────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Dictado no disponible en este navegador");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "es-CL";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
      }
      if (transcript && editor) {
        let text = transcript.trim();
        // Voice commands
        text = text.replace(/nuevo p[aá]rrafo/gi, "\n\n");
        text = text.replace(/punto final/gi, ".\n\n");
        text = text.replace(/punto aparte/gi, ".\n");
        text = text.replace(/punto y seguido/gi, ". ");
        editor.commands.insertContent(text + " ");
        if (status === "saved") setStatus("editing");
      }
    };
    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed") setSpeechError("Permiso de micrófono denegado.");
      setIsDictating(false);
    };
    recognition.onend = () => {
      if (isDictatingRef.current) {
        try { recognition.start(); } catch { setIsDictating(false); }
      } else {
        setIsDictating(false);
      }
    };
    recognitionRef.current = recognition;

    return () => { try { recognition.stop(); } catch {} };
  }, [editor]);

  const toggleDictation = () => {
    if (!recognitionRef.current) return;
    if (isDictating) {
      recognitionRef.current.stop();
      setIsDictating(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsDictating(true);
        setSpeechError("");
        editor?.commands.focus();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const getContent = () => editor?.getHTML() || "";

  const handleSaveDraft = async () => {
    try {
      await onSave(getContent(), false);
      setStatus("saved");
      setTimeout(() => setStatus("editing"), 3000);
    } catch (err) { console.error(err); }
  };

  const handleFinish = async () => {
    try {
      if (aiHighlighted) clearAiHighlight();
      await onSave(getContent(), true);
    } catch (err) { console.error(err); }
  };

  // ── Tiptap Toolbar helpers ─────────────────────────────────────────────────
  const ToolbarBtn = ({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded transition-colors",
        active
          ? "bg-[#0f766e]/10 text-[#0f766e] dark:text-teal-400"
          : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] border-l border-border">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex-none px-5 py-3.5 border-b border-border bg-gray-50/80 dark:bg-[#1e293b]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-[#0f766e] shrink-0" />
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono tracking-tight leading-tight">
                INFORME RADIOLÓGICO
              </h2>
              <p className="text-[10px] text-gray-400 font-mono">
                {studyId.substring(0, 8).toUpperCase()} · {modality}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn(
              "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full",
              status === "saved"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            )}>
              {status === "saved" ? "✓ GUARDADO" : "● EN EDICIÓN"}
            </span>
            {speechError && (
              <span className="text-[10px] text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {speechError}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Floating Smart Toolbar ─────────────────────────────────── */}
      <div className="flex-none flex items-center gap-1 px-4 py-2 border-b border-border/60 bg-white dark:bg-[#0f172a] flex-wrap">

        {/* Rich Text Tools */}
        <div className="flex items-center gap-0.5 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5 mr-2">
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive("bold")}
            title="Negrita"
          ><Bold className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive("italic")}
            title="Cursiva"
          ><Italic className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor?.isActive("heading", { level: 2 })}
            title="Encabezado"
          ><Heading2 className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive("bulletList")}
            title="Lista"
          ><List className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive("orderedList")}
            title="Lista numerada"
          ><ListOrdered className="w-3.5 h-3.5" /></ToolbarBtn>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mr-1" />

        {/* 🎤 Voice Dictation */}
        <button
          type="button"
          onClick={toggleDictation}
          disabled={!!speechError}
          title={isDictating ? "Detener dictado" : "Dictar por voz"}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
            isDictating
              ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          {isDictating ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          🎤 {isDictating ? "Grabando..." : "Voz"}
        </button>

        {/* 📄 Templates Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              📄 Plantillas <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Cargar Plantilla</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {templatesLoading ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : templates.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">Sin plantillas disponibles</div>
            ) : (
              templates.map(t => (
                <DropdownMenuItem key={t.id} onClick={() => applyTemplate(t)} className="cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{t.category}</p>
                  </div>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowSaveTemplate(true)} className="cursor-pointer text-[#0f766e] font-semibold">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Guardar plantilla actual
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ✨ NuraRad AI Button */}
        <button
          type="button"
          onClick={generateWithNura}
          disabled={isAILoading}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
            isAILoading
              ? "bg-violet-100 dark:bg-violet-900/20 text-violet-600 cursor-not-allowed"
              : "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-md shadow-violet-500/25"
          )}
        >
          {isAILoading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generando...</>
          ) : (
            <><Sparkles className="w-3.5 h-3.5" /> ✨ Redactar con Nura</>
          )}
        </button>

        {/* Clear AI highlight */}
        {aiHighlighted && (
          <button
            type="button"
            onClick={clearAiHighlight}
            title="Quitar resaltado de IA"
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300 transition-all"
          >
            <X className="w-3 h-3" /> Quitar Resaltado
          </button>
        )}

        {/* Dictating live indicator */}
        {isDictating && (
          <div className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-full px-2.5 py-1 border border-teal-200 dark:border-teal-800 ml-auto">
            <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0">
              <Image src="/nura-avatar.png" alt="Nura" fill className="object-cover" />
            </div>
            <div className="flex items-end gap-px h-4">
              {[0, 150, 300, 450, 150].map((delay, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-teal-500 rounded-full animate-bounce"
                  style={{ height: `${8 + (i % 3) * 4}px`, animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Escuchando
            </span>
          </div>
        )}
      </div>

      {/* ── AI Generated Notice Banner ─────────────────────────────── */}
      {aiHighlighted && (
        <div className="flex-none px-4 py-2.5 bg-yellow-50 dark:bg-yellow-900/10 border-b border-yellow-200 dark:border-yellow-800/40 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            <strong>Informe redactado por Nura. Revisa, edita y verifica todos los hallazgos antes de firmar.</strong>{" "}
            El texto resaltado indica contenido generado por IA.
          </p>
        </div>
      )}

      {/* ── Save Template Modal (inline) ──────────────────────────── */}
      {showSaveTemplate && (
        <div className="flex-none px-4 py-3 bg-blue-50 dark:bg-blue-900/10 border-b border-blue-200 dark:border-blue-800/40 flex items-center gap-3">
          <input
            autoFocus
            value={newTemplateName}
            onChange={e => setNewTemplateName(e.target.value)}
            placeholder="Nombre de la plantilla (ej: ECO Abdominal Normal)"
            className="flex-1 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#0f766e]"
            onKeyDown={e => { if (e.key === "Enter") saveAsTemplate(); if (e.key === "Escape") setShowSaveTemplate(false); }}
          />
          <Button size="sm" onClick={saveAsTemplate} disabled={!newTemplateName.trim()} className="bg-[#0f766e] text-white text-xs h-8">
            Guardar
          </Button>
          <button type="button" onClick={() => setShowSaveTemplate(false)} className="text-gray-500 hover:text-gray-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}



      {/* ── Editor Content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>

      {/* ── Footer Actions ─────────────────────────────────────────── */}
      <div className="flex-none p-4 border-t border-border bg-gray-50 dark:bg-[#1e293b] flex justify-between items-center gap-3 flex-wrap">
        <p className="text-xs text-gray-400">
          {status === "saved" ? "✓ Cambios guardados" : "⚠ Borrador sin guardar"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={isSaving || status === "saved"}
            className="text-xs font-semibold h-8"
          >
            {isSaving ? (
              <><RefreshCcw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Guardando...</>
            ) : status === "saved" ? (
              <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-green-500" /> Guardado</>
            ) : (
              <><Save className="w-3.5 h-3.5 mr-1.5" /> Guardar Borrador</>
            )}
          </Button>
          <Button
            size="sm"
            className="bg-[#0f766e] hover:bg-[#115e59] text-white text-xs font-bold h-8 shadow-lg shadow-teal-500/20 px-4"
            disabled={!editor?.getText().trim() || isSaving}
            onClick={handleFinish}
          >
            <Send className="w-3.5 h-3.5 mr-1.5" /> Firmar y Finalizar
          </Button>
        </div>
      </div>

      {/* ── Tiptap Prose Styles ────────────────────────────────────── */}
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          font-size: 0.9rem;
        }
        .tiptap h2 {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #0f766e;
          border-bottom: 1px solid #d1fae5;
          padding-bottom: 0.25rem;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .dark .tiptap h2 {
          color: #2dd4bf;
          border-bottom-color: #134e4a;
        }
        .tiptap mark {
          background-color: #fef08a;
          border-radius: 0.15rem;
          padding: 0 0.1rem;
        }
        .dark .tiptap mark {
          background-color: #713f12;
          color: #fef9c3;
        }
      `}</style>
    </div>
  );
}
