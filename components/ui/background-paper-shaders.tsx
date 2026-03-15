"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

/**
 * Fondo tipo “mesh” en CSS puro (sin WebGL/eval) para cumplir CSP estricta.
 * Sustituye a @paper-design/shaders-react que usa eval() y es bloqueado por CSP.
 */
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

  // Gradientes radiales con los mismos tonos teal/agua, sin eval
  const lightGradient =
    "radial-gradient(ellipse 80% 70% at 20% 30%, #B2DFDB 0%, transparent 50%), " +
    "radial-gradient(ellipse 60% 60% at 80% 20%, #80CBC4 0%, transparent 45%), " +
    "radial-gradient(ellipse 70% 80% at 50% 80%, #4DD0E1 0%, transparent 50%), " +
    "radial-gradient(ellipse 50% 50% at 70% 60%, #14B8A6 0%, transparent 40%)"
  const darkGradient =
    "radial-gradient(ellipse 80% 70% at 20% 30%, #1F2937 0%, transparent 50%), " +
    "radial-gradient(ellipse 60% 60% at 80% 20%, #111827 0%, transparent 45%), " +
    "radial-gradient(ellipse 70% 80% at 50% 80%, #14B8A6 0%, transparent 35%), " +
    "radial-gradient(ellipse 50% 50% at 70% 60%, #030712 0%, transparent 40%)"

  const backgroundColor = isDark ? "#000000" : "#E0F2F1"
  const gradient = isDark ? darkGradient : lightGradient

  return (
    <div
      className="fixed inset-0 w-full h-full -z-10 overflow-hidden"
      style={{
        backgroundColor,
        backgroundImage: gradient,
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/3 w-32 h-32 ${
            isDark ? "bg-teal-900/10" : "bg-teal-300/30"
          } rounded-full blur-3xl animate-pulse`}
          style={{ animationDuration: "4s" }}
        />
      </div>
    </div>
  )
}
