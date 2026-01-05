"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const matchesCtrl = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey
        const matchesMeta = shortcut.metaKey ? event.metaKey : !event.metaKey
        const matchesShift = shortcut.shiftKey ? event.shiftKey : !event.shiftKey
        const matchesAlt = shortcut.altKey ? event.altKey : !event.altKey

        if (matchesKey && matchesCtrl && matchesMeta && matchesShift && matchesAlt) {
          // Only prevent default if it's a custom shortcut (not browser defaults)
          if (shortcut.ctrlKey || shortcut.metaKey) {
            event.preventDefault()
          }
          shortcut.action()
        }
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts])
}

// Common keyboard shortcuts for the application
export function useAppKeyboardShortcuts() {
  const router = useRouter()
  const { language } = useLanguage()
  const isSpanish = language === "es"

  useKeyboardShortcuts([
    {
      key: "k",
      metaKey: true,
      action: () => {
        // Open search (Cmd+K)
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i], input[placeholder*="buscar" i]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      },
      description: isSpanish ? "Buscar (Cmd+K)" : "Search (Cmd+K)",
    },
    {
      key: "/",
      action: () => {
        // Open search with /
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i], input[placeholder*="buscar" i]') as HTMLInputElement
        if (searchInput && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          event?.preventDefault()
          searchInput.focus()
        }
      },
      description: isSpanish ? "Buscar (/)" : "Search (/)",
    },
  ])
}

