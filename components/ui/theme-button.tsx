"use client"

import { Theme } from "@/components/ui/theme"

export function ThemeButton() {
  return (
    <div className="flex items-center gap-3">
      <Theme variant="button" size="sm" showLabel />
      <Theme variant="button" size="md" showLabel />
      <Theme variant="button" size="lg" showLabel />
    </div>
  )
}