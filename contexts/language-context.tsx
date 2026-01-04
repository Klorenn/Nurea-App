"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import type { Language } from "@/lib/i18n"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Set default to Spanish if nothing is saved
    const saved = localStorage.getItem("nurea-language") as Language
    if (saved && (saved === "es" || saved === "en")) {
      setLanguageState(saved)
    } else {
      // Ensure Spanish is the default
      setLanguageState("es")
      localStorage.setItem("nurea-language", "es")
      document.documentElement.lang = "es"
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("nurea-language", lang)
    // Update HTML lang attribute
    document.documentElement.lang = lang
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}

