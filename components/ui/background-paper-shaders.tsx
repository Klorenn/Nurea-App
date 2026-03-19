"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { MeshGradient } from "@paper-design/shaders-react"

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

  const backgroundColor = isDark ? "#081016" : "#fbfdfc"
  const colors = isDark 
    ? ["#023A3B", "#056157", "#098C82"] 
    : ["#CFEBE9", "#9BD8D4", "#E0F5F4"]

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
