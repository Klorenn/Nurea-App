"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { loadingFullViewportClassName } from "@/lib/loading-layout"

interface DashboardLoadingProps {
  /** "es" | "en" — controls copy language. Defaults to Spanish. */
  language?: "es" | "en"
  /** Optional override for the heading. */
  title?: string
  /** Optional override for the subtitle. */
  subtitle?: string
  /** Pass a custom background class (defaults to brand surface). */
  className?: string
}

/**
 * NUREA-branded full-viewport loading screen.
 *
 * Uses the canonical sage palette + Fraunces serif so it matches the
 * rest of the app instead of looking like a generic teal spinner.
 *
 * Pegado al diseño:
 *   bg     → var(--bg)        #f8faf9 (sage-tinted off-white)
 *   logo   → /logos/nurea-logo.png inside a sage-100 chip with halo
 *   title  → Fraunces 500, ink
 *   sub    → Inter, ink-soft
 *   line   → animated sage-500 sweep
 */
export function DashboardLoading({
  language = "es",
  title,
  subtitle,
  className,
}: DashboardLoadingProps) {
  const heading =
    title ??
    (language === "es" ? "Cargando tu dashboard" : "Loading your dashboard")
  const sub =
    subtitle ??
    (language === "es"
      ? "Un momento, estamos preparando tu espacio."
      : "Just a moment, setting things up.")

  return (
    <div
      className={loadingFullViewportClassName(
        className ?? "bg-[var(--bg)] text-[var(--ink)]"
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col items-center text-center gap-6 px-6"
      >
        {/* Logo chip + halo */}
        <div className="relative">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl blur-2xl bg-[var(--sage-300)]/40"
            animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative h-16 w-16 rounded-2xl bg-[var(--sage-100)] ring-1 ring-[var(--sage-300)]/60 shadow-sm flex items-center justify-center overflow-hidden">
            <Image
              src="/logos/nurea-logo.png"
              alt="NUREA"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
          </div>
        </div>

        {/* Copy */}
        <div className="space-y-1.5 max-w-xs">
          <p
            className="text-2xl font-medium tracking-tight text-[var(--ink)]"
            style={{ fontFamily: "var(--font-fraunces, ui-serif, Georgia, serif)" }}
          >
            {heading}
          </p>
          <p className="text-sm text-[var(--ink-soft)]">{sub}</p>
        </div>

        {/* Sage progress sweep */}
        <div
          aria-hidden="true"
          className="relative h-[3px] w-40 rounded-full overflow-hidden bg-[var(--line-soft)]"
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-[var(--sage-500)]"
            animate={{ x: ["-100%", "300%"] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </div>
  )
}

export default DashboardLoading
