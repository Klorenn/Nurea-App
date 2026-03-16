"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, Stethoscope, Mail, Phone, Lock, Search, Globe, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Magic step variants for framer motion
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95
  })
};

export default function ProfessionalOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHoveringNura, setIsHoveringNura] = useState(false);

  // Form State
  const [inviteCode, setInviteCode] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState("");

  const [identityData, setIdentityData] = useState({ rut: "", specialty: "" });
  const [sisValidating, setSisValidating] = useState(false);
  
  const [contactData, setContactData] = useState({ email: "", phone: "" });
  
  const [slug, setSlug] = useState("");

  const nextStep = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const handleVIPCode = (e: React.FormEvent) => {
    e.preventDefault();
    setValidatingCode(true);
    setCodeError("");
    
    // Simulate validation
    setTimeout(() => {
      if (inviteCode.toLowerCase() === "nureavip" || inviteCode === "1234") {
        setValidatingCode(false);
        nextStep();
      } else {
        setValidatingCode(false);
        setCodeError("Código inválido. Por favor intenta nuevamente.");
      }
    }, 1500);
  };

  const handleSISValidation = () => {
    setSisValidating(true);
    setTimeout(() => {
      setSisValidating(false);
      nextStep();
    }, 2000);
  };

  const getNuraMessage = () => {
    switch(step) {
      case 0: return "¡Hola! Ingresa tu código de invitación exclusivo para comenzar.";
      case 1: return "¡Qué alegría tenerte aquí, Doctor/a! Esto nos ayuda a verificar tu prestigio médico.";
      case 2: return "Prometemos no enviarte spam, solo notificaciones importantes sobre tus citas.";
      case 3: return "Crea tu consultorio digital hoy. ¿Cómo quieres que te encuentren tus pacientes?";
      default: return "¿En qué te puedo ayudar hoy?";
    }
  };

  const handleSubmit = async () => {
    // Finish onboarding
    router.push("/dashboard/professional");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* TRUST SIDEBAR */}
      <div className="md:w-1/3 lg:w-2/5 relative bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-8 md:p-12 flex flex-col justify-between overflow-hidden">
        {/* Background Decorative Elemets */}
        <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full justify-center space-y-12">
          <div>
            <div className="flex items-center space-x-3 mb-10">
              {/* NUREA Owl Logo Placeholder */}
              <div className="relative w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center p-2">
                <Image 
                  src="/nura-avatar.png" 
                  alt="Nura Logo Búho" 
                  width={36} 
                  height={36} 
                  className="object-contain"
                  onError={(e) => {
                    // Fallback to stethoscope icon if image doesn't exist yet
                    (e.target as HTMLImageElement).style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>';
                  }}
                />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                NUREA
              </h1>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
              Diseñado para los <span className="text-indigo-300">mejores</span> especialistas.
            </h2>
            <p className="text-lg text-indigo-100 font-medium opacity-80 mb-10 max-w-sm">
              Únete a la plataforma de salud que prioriza tu prestigio y tu tiempo.
            </p>
          </div>

          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start space-x-4 glass-panel p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <div className="bg-emerald-500/20 p-2 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Sin costo mensual</h3>
                <p className="text-indigo-200 text-sm mt-1">Olvídate de las suscripciones fijas.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start space-x-4 glass-panel p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <div className="bg-emerald-500/20 p-2 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Solo 5% de comisión</h3>
                <p className="text-indigo-200 text-sm mt-1">Por cada cita efectiva, nada más.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-start space-x-4 glass-panel p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <div className="bg-emerald-500/20 p-2 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Boletas automáticas</h3>
                <p className="text-indigo-200 text-sm mt-1">Sincronizado con el SII (Chile).</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 relative flex flex-col">
        {/* Nura Helper Bubble */}
        <div className="absolute top-6 right-6 lg:top-10 lg:right-10 z-50 flex items-start justify-end max-w-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 p-4 rounded-2xl rounded-tr-sm mr-4 mt-2 max-w-[240px]"
            >
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {getNuraMessage()}
              </p>
            </motion.div>
          </AnimatePresence>
          <div 
            className={cn(
              "w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-1 cursor-pointer transition-transform duration-300",
              isHoveringNura ? "scale-110" : "scale-100"
            )}
            onMouseEnter={() => setIsHoveringNura(true)}
            onMouseLeave={() => setIsHoveringNura(false)}
          >
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
               <Image 
                  src="/nura-avatar.png" 
                  alt="Nura Avatar" 
                  width={64} 
                  height={64} 
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl">🦉</span>';
                  }}
                />
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-16 lg:px-24 mx-auto w-full max-w-3xl overflow-hidden py-24 sm:py-16">
          <AnimatePresence custom={direction} mode="wait">
            
            {/* STEP 0: VIP INVITATION */}
            {step === 0 && (
              <motion.div
                key="step0"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <div className="text-center md:text-left mb-10">
                  <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-6 text-indigo-600 dark:text-indigo-400">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Acceso Exclusivo</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">
                    NUREA es actualmente por invitación. Ingresa tu código VIP para continuar.
                  </p>
                </div>

                <form onSubmit={handleVIPCode} className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="vip-code" className="text-lg">Código de Invitación VIP</Label>
                    <Input 
                      id="vip-code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Ej: NUREA-PRO-2026"
                      className="text-lg md:text-xl py-6 md:py-8 pl-6 bg-white dark:bg-slate-900 border-2 focus-visible:ring-indigo-500 rounded-2xl uppercase tracking-widest"
                      required
                      autoFocus
                    />
                    {codeError && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm font-medium pl-2">
                        {codeError}
                      </motion.p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full text-lg py-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                    disabled={validatingCode || !inviteCode}
                  >
                    {validatingCode ? (
                      <span className="flex items-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="mr-3">
                          <Search className="w-5 h-5"/>
                        </motion.div>
                        Verificando código...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Acceder <ChevronRight className="w-5 h-5 ml-2" />
                      </span>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <div className="mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Tu Identidad Médica</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Validaremos tus credenciales con la Superintendencia de Salud.
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="rut" className="text-lg text-slate-700 dark:text-slate-300">RUT (Sin puntos, con guión)</Label>
                    <Input 
                      id="rut"
                      value={identityData.rut}
                      onChange={(e) => setIdentityData({ ...identityData, rut: e.target.value })}
                      placeholder="12345678-9"
                      className="text-lg py-7 px-5 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 rounded-2xl transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-lg text-slate-700 dark:text-slate-300">Especialidad Principal</Label>
                    <Select onValueChange={(v) => setIdentityData({ ...identityData, specialty: v })}>
                      <SelectTrigger className="w-full text-lg py-7 px-5 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 rounded-2xl transition-all h-[auto]">
                        <SelectValue placeholder="Selecciona tu especialidad" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-700">
                        <SelectItem value="cardiologia" className="py-3 text-base">Cardiología</SelectItem>
                        <SelectItem value="dermatologia" className="py-3 text-base">Dermatología</SelectItem>
                        <SelectItem value="medicina_general" className="py-3 text-base">Medicina General</SelectItem>
                        <SelectItem value="neurologia" className="py-3 text-base">Neurología</SelectItem>
                        <SelectItem value="pediatria" className="py-3 text-base">Pediatría</SelectItem>
                        <SelectItem value="psicologia" className="py-3 text-base">Psicología Clínca</SelectItem>
                        <SelectItem value="psiquiatria" className="py-3 text-base">Psiquiatría</SelectItem>
                        <SelectItem value="traumatologia" className="py-3 text-base">Traumatología</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <Button variant="ghost" size="lg" onClick={prevStep} className="rounded-2xl py-7 px-6 text-slate-500">
                      <ChevronLeft className="w-5 h-5 mr-1" /> Atrás
                    </Button>
                    <Button 
                      size="lg" 
                      onClick={handleSISValidation}
                      className="flex-1 text-lg py-7 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01]"
                      disabled={sisValidating || !identityData.rut || !identityData.specialty}
                    >
                      {sisValidating ? (
                        <span className="flex items-center">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="mr-3">
                            <Search className="w-5 h-5"/>
                          </motion.div>
                          Validando en SIS...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Stethoscope className="w-5 h-5 mr-2" /> Validar con SIS <ChevronRight className="w-5 h-5 ml-2" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CONTACT */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <div className="mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Canales de Contacto</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">
                    ¿Dónde prefieres recibir las notificaciones de tus pacientes?
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-lg text-slate-700 dark:text-slate-300">Correo Electrónico</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <Input 
                        id="email"
                        type="email"
                        value={contactData.email}
                        onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                        placeholder="doctor@clinica.cl"
                        className="text-lg py-7 pl-14 pr-5 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 rounded-2xl transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-lg text-slate-700 dark:text-slate-300">Teléfono Celular</Label>
                    <div className="flex">
                      <div className="flex items-center justify-center bg-slate-200 dark:bg-slate-700 px-4 rounded-l-2xl border-r border-slate-300 dark:border-slate-600">
                        <span className="text-lg font-medium text-slate-700 dark:text-slate-200">🇨🇱 +56</span>
                      </div>
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-5 h-5" />
                        </div>
                        <Input 
                          id="phone"
                          type="tel"
                          value={contactData.phone}
                          onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                          placeholder="9 1234 5678"
                          className="text-lg py-7 pl-12 pr-5 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 rounded-r-2xl rounded-l-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <Button variant="ghost" size="lg" onClick={prevStep} className="rounded-2xl py-7 px-6 text-slate-500">
                      <ChevronLeft className="w-5 h-5 mr-1" /> Atrás
                    </Button>
                    <Button 
                      size="lg" 
                      onClick={nextStep}
                      className="flex-1 text-lg py-7 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01]"
                      disabled={!contactData.email || !contactData.phone}
                    >
                      Continuar <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: DIGITAL CONSULTING ROOM (SLUG) */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <div className="mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Tu Consultorio Digital</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Crea tu enlace único. Será tu nueva carta de presentación médica.
                  </p>
                </div>

                <div className="space-y-12">
                  <div className="space-y-4">
                    <Label htmlFor="slug" className="text-lg text-slate-700 dark:text-slate-300">Enlace Profesional</Label>
                    
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-indigo-500 font-semibold z-10 text-lg">
                        nurea.cl/
                      </div>
                      <Input 
                        id="slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="dr-soto"
                        className="text-xl md:text-2xl font-medium py-8 md:py-10 pl-[100px] bg-white dark:bg-slate-900 border-4 border-indigo-100 dark:border-indigo-900/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 rounded-2xl shadow-sm transition-all text-slate-800 dark:text-slate-200"
                      />
                      
                      {slug.length > 3 && (
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full text-sm font-semibold">
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Disponible
                        </div>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm pl-2">
                      Usa solo letras, números y guiones. Puedes cambiarlo después.
                    </p>
                  </div>

                  {/* Preview Card */}
                  <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl shrink-0 opacity-80 scale-95 origin-top hidden sm:block">
                     <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center"><Globe className="w-4 h-4 mr-2" /> Vista Previa del Perfil</p>
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0 shadow-inner"></div>
                        <div>
                          <div className="h-4 w-32 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
                          <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                     </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <Button variant="ghost" size="lg" onClick={prevStep} className="rounded-2xl py-7 px-6 text-slate-500">
                      <ChevronLeft className="w-5 h-5 mr-1" /> Atrás
                    </Button>
                    <Button 
                      size="lg" 
                      onClick={handleSubmit}
                      className="flex-1 text-lg py-7 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01]"
                      disabled={slug.length < 3}
                    >
                      <span className="flex items-center">
                        Crear mi perfil médico <ChevronRight className="w-5 h-5 ml-2" />
                      </span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Step Indicators */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-2 z-10">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                step === i ? "w-8 bg-indigo-600 dark:bg-indigo-500" : "w-2 bg-slate-300 dark:bg-slate-700",
                step > i ? "bg-indigo-300 dark:bg-indigo-800" : ""
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
