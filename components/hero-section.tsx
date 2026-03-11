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
// import { FonasaLogo } from "@/components/ui/fonasa-logo" // Disabled temporarily

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
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`)
  }
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center px-4 py-16 md:py-20 overflow-hidden bg-transparent" aria-label={t.hero.title}>

      {/* Decorative elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-10 w-full min-w-0">
        <div className="space-y-6 min-w-0">
          <h1 className="font-sans text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground text-balance leading-tight break-words">
            {t.hero.title} <span className="text-primary italic">{t.hero.titleHighlight}</span>
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
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-muted-foreground font-light break-words">
            {t.hero.subtitle}
          </p>
        </div>

        <div className="bg-card shadow-2xl shadow-primary/10 rounded-3xl p-4 md:p-6 max-w-5xl mx-auto border border-border flex flex-col md:flex-row gap-4 items-stretch md:items-center w-full min-w-0">
          <div className="relative flex-1 w-full min-w-0 group">
            <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10 pointer-events-none" aria-hidden="true" />
            <Input
              placeholder={t.hero.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch()
                }
              }}
              className="pl-12 h-14 bg-accent/30 border-none rounded-2xl focus-visible:ring-primary/20 w-full min-w-0"
              aria-label={t.hero.searchPlaceholder}
            />
          </div>

          <div className="relative flex-1 w-full min-w-0">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" aria-hidden="true" />
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="pl-12 h-14 bg-accent/30 border-none rounded-2xl focus:ring-primary/20 w-full min-w-0" aria-label={t.hero.locationPlaceholder}>
                <SelectValue placeholder={t.hero.locationPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="santiago">Santiago</SelectItem>
                <SelectItem value="valparaiso">Valparaíso</SelectItem>
                <SelectItem value="concepcion">Concepción</SelectItem>
                <SelectItem value="remote">Online / Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            size="lg"
            onClick={handleSearch}
            className="h-14 px-8 md:px-10 rounded-2xl text-base md:text-lg font-medium shadow-lg shadow-primary/20 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] active:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 transition-all w-full md:w-auto shrink-0 flex items-center justify-center"
            aria-label={t.hero.searchButton}
          >
            <Search className="mr-2 h-5 w-5" aria-hidden="true" />
            {t.hero.searchButton}
          </Button>
        </div>

        {/* FONASA section - Disabled, will be enabled soon */}
        {/* <div className="flex flex-wrap items-center justify-center gap-8 pt-4">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest w-full mb-2">
            {t.hero.trustedBy}
          </p>
          <div className="flex items-center gap-3 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <FonasaLogo className="h-10 w-auto" />
          </div>
        </div> */}
      </div>
    </section>
  )
}
