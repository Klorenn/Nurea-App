"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Stethoscope } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { motion } from "framer-motion"
import { trackEvent } from "@/lib/utils/analytics"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
}

export function HeroSection() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim())
    }
    if (location) {
      params.set("location", location)
    }
    router.push(`/explore${params.toString() ? `?${params.toString()}` : ""}`)
  }

  const isEs = language === "es"

  return (
    <section 
      className="relative min-h-[90vh] flex items-center justify-center px-4 py-20 md:py-28 overflow-hidden bg-transparent"
      aria-label={isEs ? "Sección principal" : "Hero section"}
    >
      {/* Content */}
      <motion.div 
        className="relative z-10 max-w-5xl mx-auto text-center space-y-8 w-full"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Main heading */}
        <motion.div className="space-y-6" variants={fadeInUp}>
          <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            {/* First line - deep blue-gray for maximum contrast */}
            <span className="text-[#1e3a5f] dark:text-white drop-shadow-sm">
              {isEs ? "Atención médica que" : "Healthcare that feels"}
            </span>
            <br />
            <span className="text-[#1e3a5f] dark:text-white drop-shadow-sm">
              {isEs ? "se siente " : ""}
            </span>
            {/* "humana" - rich deep cyan coordinated with button */}
            <span className="italic text-[#0d9488] dark:text-teal-400 drop-shadow-[0_1px_2px_rgba(13,148,136,0.3)]">
              {isEs ? "más humana" : "more human"}
            </span>
            {/* Animated white period - blinking cursor style */}
            <motion.span
              className="inline-block ml-2 text-white dark:text-white"
              animate={{
                opacity: [1, 1, 0, 0, 1, 1],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                times: [0, 0.5, 0.5, 0.75, 0.75, 1],
                ease: "linear",
              }}
              aria-hidden="true"
            >
              .
            </motion.span>
          </h1>
          
          {/* Secondary text - dark medium gray for high contrast */}
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-[#374151] dark:text-slate-300 font-normal"
            variants={fadeInUp}
          >
            {isEs 
              ? "Encuentra y agenda citas con los mejores profesionales de la salud en Chile. Confianza, cuidado y accesibilidad en un solo lugar."
              : "Find and schedule appointments with the best health professionals in Chile. Trust, care, and accessibility in one place."
            }
          </motion.p>

        </motion.div>

        {/* Search Box - White rounded elevated panel */}
        <motion.div 
          className="relative bg-white dark:bg-slate-900 rounded-2xl p-3 md:p-4 max-w-4xl mx-auto shadow-[0_10px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_50px_rgba(0,0,0,0.4)]"
          variants={fadeInUp}
        >
          <div className="relative flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Specialty Input */}
            <div className="relative flex-1 group">
              <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-teal-600 transition-colors z-10" aria-hidden="true" />
              <Input
                placeholder={isEs ? "Especialidad (ej. Psicólogo, Pediatra)" : "Specialty (e.g. Psychologist, Pediatrician)"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-12 h-14 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus-visible:ring-teal-500/40 focus-visible:border-teal-500 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium"
                aria-label={t.hero.searchPlaceholder}
              />
            </div>

            {/* Separator */}
            <div className="hidden md:block w-px h-10 bg-slate-200 dark:bg-slate-700" />

            {/* Location Select */}
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 z-10" aria-hidden="true" />
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger 
                  className="pl-12 h-14 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-teal-500/40 text-slate-800 dark:text-white font-medium [&>span]:text-slate-500 dark:[&>span]:text-slate-400 [&[data-state=open]>span]:text-slate-800 dark:[&[data-state=open]>span]:text-white"
                  aria-label={t.hero.locationPlaceholder}
                >
                  <SelectValue placeholder={isEs ? "Ubicación" : "Location"} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-xl">
                  <SelectItem value="santiago">Santiago</SelectItem>
                  <SelectItem value="valparaiso">Valparaíso</SelectItem>
                  <SelectItem value="concepcion">Concepción</SelectItem>
                  <SelectItem value="remote">{isEs ? "Online / Remoto" : "Online / Remote"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button - Solid dark turquoise */}
            <Button
              size="lg"
              onClick={handleSearch}
              className="h-14 px-8 rounded-xl text-base font-semibold bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-[0_4px_20px_rgba(13,148,136,0.35)] hover:shadow-[0_6px_25px_rgba(13,148,136,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
            >
              <Search className="mr-2 h-5 w-5" />
              {isEs ? "Buscar" : "Search"}
            </Button>
          </div>
        </motion.div>

      </motion.div>
    </section>
  )
}
