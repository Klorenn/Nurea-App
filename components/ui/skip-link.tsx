"use client"

import { useLanguage } from "@/contexts/language-context"

export function SkipLink() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {isSpanish ? "Saltar al contenido principal" : "Skip to main content"}
    </a>
  )
}

