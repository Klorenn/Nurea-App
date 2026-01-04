"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const languages = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇺🇸" },
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
      {/* Trigger Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium",
          compact 
            ? "bg-transparent border-border/40 hover:bg-accent/50" 
            : "bg-white/90 dark:bg-neutral-900/95 backdrop-blur-md shadow-lg border-2 border-gray-300 dark:border-neutral-600",
          "text-foreground",
          "hover:bg-accent/50 dark:hover:bg-accent/20 transition-all",
          "z-50 pointer-events-auto cursor-pointer"
        )}
      >
        <span className="text-base">{selected.flag}</span>
        {!compact && <span className="hidden sm:inline text-xs">{selected.label}</span>}
        <ChevronDown className="h-3 w-3" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-48 rounded-xl overflow-hidden z-50",
            "bg-white/90 dark:bg-neutral-900/95 backdrop-blur-xl",
            "shadow-lg border border-gray-200 dark:border-neutral-700",
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
                "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors",
                selected.code === lang.code
                  ? "font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20"
                  : "text-gray-800 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
              )}
            >
              <span>{lang.flag}</span>
              <span className="flex-1">{lang.label}</span>
              {selected.code === lang.code && (
                <Check className="h-4 w-4 text-teal-500 dark:text-teal-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

