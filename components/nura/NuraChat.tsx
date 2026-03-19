"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, X, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
}

const NuraIcon = ({ size = 24, className }: { size?: number, className?: string }) => {
  return (
    <div 
      className={cn("relative flex items-center justify-center rounded-full overflow-hidden shrink-0", className)} 
      style={{ width: size, height: size }}
    >
      <img 
        src="/nura-avatar.png" 
        alt="Nura" 
        className="w-full h-full object-cover relative z-10 bg-teal-50 dark:bg-teal-950/50"
        onError={(e) => {
          // Si la imagen no está presente en public/, mostramos el bot con un fondo limpio
          e.currentTarget.style.opacity = '0';
        }}
      />
      <div className="absolute z-0 flex items-center justify-center inset-0 text-teal-600 dark:text-teal-400 opacity-80">
        <Bot size={size * 0.7} />
      </div>
    </div>
  );
};

export function NuraChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content: "¡Hola! Soy Nura, tu asistente inteligente en NUREA. ¿En qué puedo ayudarte hoy?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState("patient");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (profile) setUserRole(profile.role);
      }
    };
    fetchUser();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const navInput = input.trim();
    setInput("");
    
    const newMessages = [
      ...messages,
      { id: Date.now().toString(), role: "user" as const, content: navInput }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/nura/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          userRole
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Algo salió mal");

      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "model", content: data.content }
      ]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "model", content: "Lo siento, tuve un problema al procesar tu mensaje." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[580px] max-h-[85vh] flex flex-col bg-slate-50 dark:bg-slate-950 rounded-[28px] shadow-2xl shadow-teal-500/10 border border-slate-200/60 dark:border-slate-800/60 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-teal-500 text-white p-4 px-5 flex justify-between items-center shrink-0 shadow-sm relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-0.5 rounded-full flex items-center justify-center relative shadow-inner bg-white/20">
                  <NuraIcon size={34} />
                  <span className="absolute -top-0 -right-0 w-3.5 h-3.5 bg-green-400 border-2 border-teal-500 rounded-full z-20"></span>
                </div>
                <div>
                  <h3 className="font-semibold text-[15px] leading-tight flex items-center gap-1.5">
                    Nura
                    <Sparkles size={14} className="text-teal-200" />
                  </h3>
                  <p className="text-[11px] text-teal-100 font-medium">IA Asistente de NUREA</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
                aria-label="Cerrar chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 pb-2 space-y-6">
              {messages.map((message) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={message.id}
                  className={cn(
                    "flex gap-3 max-w-[88%]",
                    message.role === "user" ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-auto p-0",
                    message.role === "user" 
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-500" 
                      : "bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 shadow-sm"
                  )}>
                    {message.role === "user" ? <User size={14} /> : <NuraIcon size={32} />}
                  </div>
                  
                  <div className={cn(
                    "px-5 py-3 text-[14px] shadow-sm leading-relaxed",
                    message.role === "user" 
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-[20px] rounded-br-[4px]" 
                      : "bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/50 text-slate-700 dark:text-slate-300 rounded-[20px] rounded-bl-[4px]"
                  )}>
                    {message.role === "user" ? (
                      <p className="whitespace-pre-wrap whitespace-normal break-words">{message.content}</p>
                    ) : (
                      <div className="break-words w-full">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            strong: ({node, ...props}) => <strong className="text-teal-700 dark:text-teal-400 font-bold" {...props} />,
                            ul: ({node, ...props}) => <ul className="ml-4 list-disc space-y-1 my-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="ml-4 list-decimal space-y-1 my-2" {...props} />,
                            li: ({node, ...props}) => <li className="pl-1" {...props} />,
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            h1: ({node, ...props}) => <h1 className="text-teal-700 dark:text-teal-400 font-bold text-lg mt-3 mb-1" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-teal-700 dark:text-teal-400 font-bold text-base mt-3 mb-1" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-teal-700 dark:text-teal-400 font-semibold text-sm mt-2 mb-1" {...props} />,
                            a: ({node, ...props}) => <a className="text-teal-600 dark:text-teal-400 underline hover:text-teal-800 dark:hover:text-teal-300 transition-colors" {...props} />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 max-w-[85%]"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 flex items-center justify-center mt-auto shadow-sm border border-teal-200/50 dark:border-teal-800/50 p-0">
                    <NuraIcon size={32} />
                  </div>
                  <div className="px-5 py-4 rounded-[20px] rounded-bl-[4px] bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/50 flex items-center gap-1.5 shadow-sm">
                    <motion.div className="w-1.5 h-1.5 bg-teal-500 dark:bg-teal-400 rounded-full flex-shrink-0" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-teal-500 dark:bg-teal-400 rounded-full flex-shrink-0" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-teal-500 dark:bg-teal-400 rounded-full flex-shrink-0" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/60 relative z-10 pt-2 pb-1">
              
              {/* Suggested Prompts */}
              {messages.length === 1 && (
                <div className="flex px-5 pt-2 pb-2 gap-2 overflow-x-auto scrollbar-hide no-scrollbar -mt-1">
                  {(() => {
                    const btnClass = "text-[12px] font-medium whitespace-nowrap bg-transparent hover:bg-teal-50 text-teal-700 dark:text-teal-300 dark:hover:bg-teal-900/40 px-3.5 py-1.5 rounded-full transition-colors border border-teal-200 dark:border-teal-800";
                    if (pathname?.startsWith("/dashboard/professional")) {
                      return (
                        <>
                          <button onClick={() => setInput("Información para especialistas (Comisiones y Pagos)")} className={btnClass}>Información para especialistas (Comisiones y Pagos)</button>
                          <button onClick={() => setInput("¿Cómo configuro mi agenda? (Disponibilidad)")} className={btnClass}>¿Cómo configuro mi agenda?</button>
                          <button onClick={() => setInput("¿Cómo funciona el Sello de Verificación SIS?")} className={btnClass}>¿Cómo funciona el Sello de Verificación SIS?</button>
                        </>
                      );
                    } else if (pathname?.startsWith("/dashboard/patient")) {
                      return (
                        <>
                          <button onClick={() => setInput("¿Cómo agendo una cita y obtengo mi boleta?")} className={btnClass}>¿Cómo agendo una cita y obtengo mi boleta?</button>
                          <button onClick={() => setInput("Busco un especialista")} className={btnClass}>Busco un especialista</button>
                          <button onClick={() => setInput("¿Qué es NUREA y por qué es segura?")} className={btnClass}>¿Qué es NUREA y por qué es segura?</button>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <button onClick={() => setInput("¿Qué es NUREA y por qué es segura?")} className={btnClass}>¿Qué es NUREA y por qué es segura?</button>
                          <button onClick={() => setInput("¿Cómo agendo una cita y obtengo mi boleta?")} className={btnClass}>¿Cómo agendo una cita y obtengo mi boleta?</button>
                          <button onClick={() => setInput("Información para especialistas (Comisiones y Pagos)")} className={btnClass}>Información para especialistas (Comisiones y Pagos)</button>
                          <button onClick={() => setInput("¿Cómo funciona el Sello de Verificación SIS?")} className={btnClass}>¿Cómo funciona el Sello de Verificación SIS?</button>
                        </>
                      );
                    }
                  })()}
                </div>
              )}
              
              <div className="p-3 px-4">
                <form onSubmit={handleSubmit} className="flex gap-2.5 items-end bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-[24px] border border-slate-200/60 dark:border-slate-700/60 focus-within:border-teal-300 dark:focus-within:border-teal-700 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Pregúntale a Nura..."
                    className="flex-1 max-h-32 min-h-[44px] resize-none bg-transparent rounded-2xl px-4 py-3 text-[14px] focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className={cn(
                      "rounded-full shrink-0 w-11 h-11 mb-0.5 mr-0.5 shadow-sm transition-all",
                      input.trim() 
                        ? "bg-teal-500 hover:bg-teal-600 text-white" 
                        : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                    )}
                    disabled={!input.trim() || isLoading}
                  >
                    <Send size={18} className={input.trim() ? "translate-x-[1px]" : ""} />
                  </Button>
                </form>
              </div>
              
              <div className="pb-3 text-center text-[11px] text-slate-400 font-medium">
                Nura puede cometer errores.
              </div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-teal-500 text-white rounded-full shadow-xl shadow-teal-500/20 hover:bg-teal-600 transition-colors border-2 border-white/10 dark:border-slate-800"
        aria-label="Abrir asistente Nura"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
              <X size={26} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.15 }} className="w-full h-full flex items-center justify-center">
              <NuraIcon size={52} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
