"use client"

import { useEffect, useState } from "react"
import { MeshGradient } from "@paper-design/shaders-react"
import { useTheme } from "next-themes"

export function PaperShaderBackground() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Colores para modo claro: verde agua más visible
  const lightColors = ["#B2DFDB", "#80CBC4", "#4DD0E1", "#14B8A6"]
  const lightBackground = "#E0F2F1"

  // Colores para modo oscuro: verde agua y gris oscuro
  const darkColors = ["#030712", "#111827", "#1F2937", "#14B8A6"]
  const darkBackground = "#000000"

  const colors = isDark ? darkColors : lightColors
  const backgroundColor = isDark ? darkBackground : lightBackground

  return (
    <div 
      className="fixed inset-0 w-full h-full -z-10 overflow-hidden"
      style={{ backgroundColor }}
    >
      <MeshGradient
        className="w-full h-full absolute inset-0"
        colors={colors}
        speed={1.2}
      />

      {/* Lighting overlay effects - reduced for performance */}
      <div className="absolute inset-0 pointer-events-none will-change-opacity">
        <div
          className={`absolute top-1/4 left-1/3 w-32 h-32 ${
            isDark ? "bg-teal-900/10" : "bg-teal-300/30"
          } rounded-full blur-3xl animate-pulse`}
          style={{ animationDuration: "3s", willChange: "opacity" }}
        />
        <div
          className={`absolute bottom-1/3 right-1/4 w-24 h-24 ${
            isDark ? "bg-teal-800/10" : "bg-teal-400/30"
          } rounded-full blur-2xl animate-pulse`}
          style={{ animationDuration: "2s", animationDelay: "1s", willChange: "opacity" }}
        />
      </div>
    </div>
  )
}
