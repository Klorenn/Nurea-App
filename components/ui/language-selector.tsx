"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Globe, Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const languages = [
  { code: "es", label: "Español", short: "ES" },
  { code: "en", label: "English", short: "EN" },
]

interface LanguageSelectorProps {
  compact?: boolean
}

export const LanguageSelector = ({ compact = false }: LanguageSelectorProps) => {
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selected = languages.find((lang) => lang.code === language) || languages[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block z-50" ref={dropdownRef}>
      {/* Ultra-minimal trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center justify-center rounded-full transition-all",
          "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/50",
          "z-50 pointer-events-auto cursor-pointer"
        )}
        aria-label={`Language: ${selected.label}`}
      >
        <Globe className="h-4 w-4" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-36 rounded-xl overflow-hidden z-50",
            "bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl",
            "shadow-xl border border-gray-200/50 dark:border-neutral-700/50",
            "animate-in fade-in slide-in-from-top-2 duration-200"
          )}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as "es" | "en")
                setOpen(false)
              }}
              className={cn(
                "flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-left transition-colors",
                selected.code === lang.code
                  ? "font-medium text-teal-600 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-950/30"
                  : "text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800/50"
              )}
            >
              <span className="text-xs font-semibold text-muted-foreground w-5">{lang.short}</span>
              <span className="flex-1">{lang.label}</span>
              {selected.code === lang.code && (
                <Check className="h-3.5 w-3.5 text-teal-500 dark:text-teal-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

