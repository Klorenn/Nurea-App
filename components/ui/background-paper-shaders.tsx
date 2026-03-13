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

  // Colores para modo claro: teal más suave y fluido
  const lightColors = ["#a7f3d0", "#6ee7b7", "#34d399", "#10b981", "#5eead4"]
  const lightBackground = "#5eead4"

  // Colores para modo oscuro: teal oscuro con más profundidad
  const darkColors = ["#021a19", "#042f2e", "#134e4a", "#0f766e", "#0d9488"]
  const darkBackground = "#021a19"

  const colors = isDark ? darkColors : lightColors
  const backgroundColor = isDark ? darkBackground : lightBackground

  return (
    <div 
      className="fixed inset-0 w-full h-full -z-10 overflow-hidden transition-colors duration-500"
      style={{ backgroundColor }}
    >
      <MeshGradient
        className="w-full h-full absolute inset-0"
        colors={colors}
        speed={0.4}
      />

      {/* Soft ambient lighting for depth - slower and smoother */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/3 w-[500px] h-[500px] ${
            isDark ? "bg-teal-700/10" : "bg-white/15"
          } rounded-full blur-[100px]`}
          style={{ 
            animation: "pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          }}
        />
        <div
          className={`absolute bottom-1/4 right-1/3 w-[400px] h-[400px] ${
            isDark ? "bg-teal-600/10" : "bg-teal-200/20"
          } rounded-full blur-[80px]`}
          style={{ 
            animation: "pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            animationDelay: "2s"
          }}
        />
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${
            isDark ? "bg-teal-800/8" : "bg-white/10"
          } rounded-full blur-[120px]`}
          style={{ 
            animation: "pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            animationDelay: "4s"
          }}
        />
      </div>
    </div>
  )
}
