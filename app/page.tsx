"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { LAUNCH_TARGET_DATE, getTimeLeftUntil, useLaunchCountdown, type TimeLeft } from "@/lib/countdown"

/* ============================================================================
   Nurea · Landing · abril 2026
   Replica fiel del HTML original con Fraunces + Inter + JetBrains Mono,
   paleta sage + terracotta, cuenta regresiva al 10 · dic · 2026 y las
   14 especialidades reales del proyecto Nurea.
============================================================================ */

/* ─── DATA ───────────────────────────────────────────────────────────────── */

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "#features", label: "Plataforma" },
  { href: "#how", label: "Cómo funciona" },
  { href: "#pricing", label: "Precios" },
  { href: "#demo", label: "Ver demo" },
  { href: "#faq", label: "Ayuda" },
]

const CLIENT_LOGOS = [
  { name: "Vidalta", shape: "round" },
  { name: "MediCentro", shape: "square" },
  { name: "Serena", shape: "diamond" },
  { name: "Orbe Salud", shape: "round" },
  { name: "Calma", shape: "square" },
] as const

const STATS = [
  { target: 12400, suffix: "+", label: "Profesionales verificados en Chile" },
  { target: 48_000, suffix: "+", label: "Horas de consulta facilitadas" },
  { target: 48, suffix: "h", label: "Tiempo medio hasta primera cita" },
  { target: 98, suffix: "%", label: "Pacientes que recomendarían Nurea" },
] as const

const SPECIALTIES = [
  { n: "01", name: "Psicología", count: "3.240" },
  { n: "02", name: "Medicina General", count: "1.820" },
  { n: "03", name: "Nutrición y Dietética", count: "1.485" },
  { n: "04", name: "Kinesiología", count: "2.105" },
  { n: "05", name: "Dermatología", count: "860" },
  { n: "06", name: "Pediatría", count: "1.290" },
  { n: "07", name: "Psiquiatría", count: "580" },
  { n: "08", name: "Ginecología", count: "920" },
  { n: "09", name: "Cardiología", count: "410" },
  { n: "10", name: "Neurología", count: "370" },
  { n: "11", name: "Traumatología", count: "640" },
  { n: "12", name: "Endocrinología", count: "310" },
] as const

const HOW_STEPS = [
  {
    n: "01",
    t: "Cuéntanos qué buscas",
    d: "Responde unas preguntas cuidadas. Sin cuestionarios invasivos, sin venderte nada.",
  },
  {
    n: "02",
    t: "Descubre profesionales afines",
    d: "Recibe una selección hecha a medida. Lee sus enfoques, mira su disponibilidad y elige con calma.",
  },
  {
    n: "03",
    t: "Empieza cuando estés listo",
    d: "Reserva en segundos. Paga solo al confirmar. Cancela o mueve la cita sin culpa.",
  },
] as const

const TESTIMONIALS = [
  {
    q: "Nurea me devolvió horas cada semana. Lo que antes era gestión ahora es tiempo con mis pacientes.",
    n: "Laura Mendoza",
    r: "Psicóloga clínica · Santiago",
    grad: "linear-gradient(135deg, oklch(0.78 0.06 170), oklch(0.65 0.08 160))",
  },
  {
    q: "La verificación me da tranquilidad. Sé que cada profesional comparte los mismos estándares.",
    n: "Carlos Ruiz",
    r: "Nutricionista · Providencia",
    grad: "linear-gradient(135deg, oklch(0.8 0.08 60), oklch(0.68 0.1 45))",
  },
  {
    q: "Por primera vez siento que una plataforma entiende que el cuidado es un proceso, no una transacción.",
    n: "María Alonso",
    r: "Kinesióloga · Ñuñoa",
    grad: "linear-gradient(135deg, oklch(0.82 0.05 340), oklch(0.7 0.07 330))",
  },
] as const

const BLOG_POSTS = [
  {
    featured: true,
    meta: "Guía clínica · 8 min",
    t: "Cómo construir una primera sesión que invite a volver (sin que se sienta un interrogatorio).",
    e: "Tres marcos prácticos para abrir el espacio terapéutico con calma, basados en evidencia y en las voces de 200 profesionales de la red.",
    grad: "linear-gradient(135deg, oklch(0.82 0.06 170), oklch(0.62 0.08 160))",
  },
  {
    featured: false,
    meta: "Tendencias · 5 min",
    t: "El nuevo lenguaje del bienestar: qué buscan los pacientes en 2026.",
    e: "",
    grad: "linear-gradient(160deg, oklch(0.78 0.08 60), oklch(0.6 0.1 40))",
  },
  {
    featured: false,
    meta: "Práctica profesional · 6 min",
    t: "Fijar tarifas sin ansiedad: una conversación honesta sobre el valor del cuidado.",
    e: "",
    grad: "linear-gradient(160deg, oklch(0.75 0.05 230), oklch(0.55 0.07 220))",
  },
] as const

const FAQS = [
  {
    q: "¿Cómo verifican a los profesionales?",
    a: "Cada profesional presenta su título, cédula de identidad y registro en la Superintendencia de Salud cuando corresponde. Nuestro equipo clínico revisa manualmente cada caso antes de la incorporación a la red y repite revisión cada seis meses.",
  },
  {
    q: "¿Los pacientes pagan alguna comisión?",
    a: "No. Los pacientes solo pagan la tarifa que el profesional define, sin costos adicionales de plataforma ni suscripciones ocultas.",
  },
  {
    q: "¿Qué pasa si necesito cancelar una hora?",
    a: "Puedes cancelar hasta 24 horas antes sin costo. Con menos de 24 horas, la política la define cada profesional y siempre es visible antes de reservar.",
  },
  {
    q: "¿La información clínica está protegida?",
    a: "Sí. Conversaciones, notas y archivos están cifrados extremo a extremo. Cumplimos con la Ley 19.628 chilena y con los estándares ISO 27001 y SOC 2 Tipo II.",
  },
  {
    q: "¿Cuándo lanzamos oficialmente?",
    a: "El 10 de diciembre de 2026. Puedes crear tu cuenta ahora para recibir acceso temprano y actualizaciones del producto.",
  },
  {
    q: "¿Hay permanencia si contrato el plan Profesional?",
    a: "Ninguna. Puedes cambiar o cancelar tu plan cuando quieras, y tus datos se conservan durante 60 días por si decides volver.",
  },
] as const

const PLANS: {
  name: string
  desc: string
  monthly: number | "free" | "custom"
  yearly: number | "free" | "custom"
  period: string
  cta: string
  href: string
  ctaStyle: "outline" | "terracotta"
  featured?: boolean
  badge?: string
  features: string[]
}[] = [
  {
    name: "Exploración",
    desc: "Para pacientes que inician su camino.",
    monthly: "free",
    yearly: "free",
    period: "Siempre gratis",
    cta: "Crear cuenta",
    href: "/signup",
    ctaStyle: "outline",
    features: [
      "Acceso completo a la red",
      "Reserva de horas sin comisión",
      "Historial privado de sesiones",
      "Soporte por correo",
    ],
  },
  {
    name: "Profesional",
    desc: "Para consultas independientes que crecen.",
    monthly: 19_900,
    yearly: 15_900,
    period: "por profesional / mes",
    cta: "Empezar 14 días gratis",
    href: "/signup?role=pro",
    ctaStyle: "terracotta",
    featured: true,
    badge: "Más elegido",
    features: [
      "Perfil verificado y destacado",
      "Agenda con sincronización total",
      "Videoconsulta ilimitada",
      "Cobros y facturación automática",
      "Soporte prioritario 7 días",
    ],
  },
  {
    name: "Clínica",
    desc: "Equipos y centros de salud multidisciplinares.",
    monthly: "custom",
    yearly: "custom",
    period: "Desde 5 profesionales",
    cta: "Agendar una llamada",
    href: "mailto:clinicas@nurea.app",
    ctaStyle: "outline",
    features: [
      "Todo lo del plan Profesional",
      "Panel multi-profesional",
      "Informes clínicos agregados",
      "Integraciones con ficha clínica",
      "Gestor de cuenta dedicado",
    ],
  },
]

/* ─── HELPERS ────────────────────────────────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            window.setTimeout(
              () => e.target.classList.add("nurea-in"),
              (i % 6) * 60,
            )
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    )
    document.querySelectorAll(".nurea-reveal").forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function formatCount(n: number) {
  return Math.floor(n).toLocaleString("es-CL")
}

function AnimatedCount({
  target,
  suffix,
  duration = 1600,
}: {
  target: number
  suffix: string
  duration?: number
}) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || started.current) return
          started.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setValue(target * eased)
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          io.disconnect()
        })
      },
      { threshold: 0.4 },
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [target, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {formatCount(value)}
      <span className="text-[0.5em] align-baseline ml-1" style={{ color: "var(--sage-500)" }}>
        {suffix}
      </span>
    </span>
  )
}

function formatCLP(n: number) {
  return "$" + n.toLocaleString("es-CL")
}

/* ─── ICONS (inline, stroke currentColor, match HTML) ───────────────────── */

const Ico = {
  arrow: (size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  ),
  search: (size = 22) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  shield: (size = 22) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M9 12l2 2 4-4" />
      <path d="M12 2l8.5 4.5v5c0 5-3.5 9.5-8.5 10.5-5-1-8.5-5.5-8.5-10.5v-5L12 2z" />
    </svg>
  ),
  chat: (size = 22) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  calendar: (size = 22) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  layers: (size = 22) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  note: (size = 22) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  ),
  globe: (size = 22) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </svg>
  ),
  check: (size = 10) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
  heart: (size = 20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  plus: (size = 12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  play: (size = 28) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
}

/* ─── NAV ────────────────────────────────────────────────────────────────── */

import Image from "next/image"

function Logo() {
  return (
    <Link
      href="/"
      className="nurea-logo-group flex-shrink-0 flex items-center gap-2.5 no-underline"
      style={{
        fontFamily: "var(--font-fraunces)",
        fontSize: 22,
        fontWeight: 500,
        letterSpacing: "-0.02em",
        color: "var(--ink)",
      }}
      aria-label="Nurea — Inicio"
    >
      <div className="relative inline-block h-[32px] w-[32px]">
        <Image
          src="/logo.png"
          alt="Nurea"
          fill
          className="object-contain"
          sizes="32px"
        />
      </div>
      <span>Nurea</span>
    </Link>
  )
}

function Nav({ daysLeft }: { daysLeft: number }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className="sticky top-0 z-[100] w-full transition-all duration-300"
      style={{
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        background: scrolled
          ? "color-mix(in oklab, var(--bg) 92%, transparent)"
          : "color-mix(in oklab, var(--bg) 75%, transparent)",
        borderBottom: `1px solid ${scrolled ? "var(--line-soft)" : "transparent"}`,
      }}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-8 px-6 sm:px-8" style={{ height: 68 }}>
        <Logo />

        <ul
          className="hidden items-center gap-1.5 rounded-full border p-[5px] md:flex"
          style={{ borderColor: "var(--line-soft)", background: "var(--bg-warm)" }}
        >
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="inline-block rounded-full px-4 py-2 text-[13.5px] font-medium transition-all duration-200"
                style={{ color: "var(--ink-soft)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--ink)"
                  e.currentTarget.style.background = "var(--bg)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--ink-soft)"
                  e.currentTarget.style.background = "transparent"
                }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2.5 text-[13.5px] font-medium sm:inline-flex"
            style={{ color: "var(--ink)" }}
          >
            Iniciar sesión
          </Link>

          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-full pl-4 pr-2.5 py-2 text-[13.5px] font-medium transition-all"
            style={{ background: "var(--ink)", color: "var(--bg)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--sage-900)"
              e.currentTarget.style.transform = "translateY(-1px)"
              e.currentTarget.style.boxShadow = "0 8px 20px -8px oklch(0.25 0.03 170 / 0.4)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--ink)"
              e.currentTarget.style.transform = ""
              e.currentTarget.style.boxShadow = ""
            }}
          >
            Empezar gratis
            <span
              className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5"
              style={{ background: "var(--sage-500)", color: "white" }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ─── HERO ───────────────────────────────────────────────────────────────── */

function CountdownChip({ t }: { t: TimeLeft }) {
  const parts: [number, string][] = [
    [t.days, "días"],
    [t.hours, "hrs"],
    [t.minutes, "min"],
    [t.seconds, "seg"],
  ]
  return (
    <div
      className="mt-10 inline-flex flex-wrap items-center gap-2 rounded-2xl border p-3"
      style={{ borderColor: "var(--line)", background: "var(--bg-warm)" }}
    >
      <span
        className="pl-1 pr-2 text-[10px]"
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          color: "var(--ink-mute)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        Lanzamiento
      </span>
      {parts.map(([v, l], i) => (
        <div key={l} className="flex items-center gap-2">
          <div className="flex flex-col items-center rounded-xl px-3 py-1.5" style={{ background: "var(--bg)" }}>
            <span
              className="tabular-nums"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontSize: 22,
                lineHeight: 1,
                color: "var(--ink)",
                letterSpacing: "-0.02em",
              }}
            >
              {String(v).padStart(2, "0")}
            </span>
            <span
              className="mt-1 text-[9px]"
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                color: "var(--ink-mute)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              {l}
            </span>
          </div>
          {i < parts.length - 1 && (
            <span className="text-[10px]" style={{ color: "var(--ink-mute)" }}>
              ·
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function HeroVisual() {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const mainRef = useRef<HTMLDivElement | null>(null)
  const bookRef = useRef<HTMLDivElement | null>(null)
  const statRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap || !window.matchMedia("(hover: hover)").matches) return
    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      if (mainRef.current)
        mainRef.current.style.transform = `translate(${x * -10}px, ${y * -10}px)`
      if (bookRef.current)
        bookRef.current.style.transform = `translate(${x * 12}px, ${y * 12}px)`
      if (statRef.current)
        statRef.current.style.transform = `translate(${x * 15}px, ${y * -8}px)`
    }
    const onLeave = () => {
      if (mainRef.current) mainRef.current.style.transform = ""
      if (bookRef.current) bookRef.current.style.transform = ""
      if (statRef.current) statRef.current.style.transform = ""
    }
    wrap.addEventListener("mousemove", onMove)
    wrap.addEventListener("mouseleave", onLeave)
    return () => {
      wrap.removeEventListener("mousemove", onMove)
      wrap.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto w-full max-w-[520px] justify-self-end"
      style={{ aspectRatio: "0.95" }}
    >
      {/* Main card */}
      <div
        ref={mainRef}
        className="absolute top-0 left-0 overflow-hidden"
        style={{
          width: "68%",
          height: "78%",
          borderRadius: 40,
          background: "linear-gradient(160deg, var(--sage-100), var(--sage-200))",
          boxShadow:
            "0 30px 60px -30px oklch(0.3 0.04 170 / 0.2), 0 10px 20px -10px oklch(0.3 0.04 170 / 0.12)",
          transition: "transform 0.5s cubic-bezier(0.2, 0.9, 0.3, 1)",
        }}
      >
        <div className="flex h-full flex-col justify-between p-7">
          <span
            className="inline-flex items-center gap-1.5 self-start rounded-full bg-white px-3 py-1.5 text-[12px]"
            style={{ color: "var(--sage-700)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--sage-500)" }} />
            Disponible hoy
          </span>
          <div
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: 26,
              lineHeight: 1.1,
              color: "var(--sage-900)",
              maxWidth: "92%",
              letterSpacing: "-0.02em",
            }}
          >
            Encontrar el cuidado adecuado, sin la ansiedad.
          </div>
          <div
            className="flex items-center gap-3.5 rounded-2xl p-4"
            style={{
              background: "color-mix(in oklab, white 70%, transparent)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              className="h-[52px] w-[52px] flex-shrink-0 rounded-full"
              style={{
                background: "linear-gradient(135deg, oklch(0.7 0.07 60), oklch(0.55 0.09 45))",
              }}
            />
            <div className="min-w-0">
              <div className="text-[14px] font-semibold leading-tight" style={{ color: "var(--ink)" }}>
                Dra. Laura Mendoza
              </div>
              <div className="text-[12px]" style={{ color: "var(--ink-mute)" }}>
                Psicología clínica · 4.9 ★
              </div>
            </div>
            <span
              className="ml-auto shrink-0 rounded-full px-3.5 py-2 text-[12px] font-medium"
              style={{ background: "var(--ink)", color: "white" }}
            >
              Reservar
            </span>
          </div>
        </div>
      </div>

      {/* Booking card */}
      <div
        ref={bookRef}
        className="absolute bg-white"
        style={{
          bottom: "8%",
          right: 0,
          width: "58%",
          padding: 22,
          borderRadius: 28,
          boxShadow:
            "0 30px 60px -30px oklch(0.3 0.04 170 / 0.2), 0 10px 20px -10px oklch(0.3 0.04 170 / 0.12)",
          transition: "transform 0.5s cubic-bezier(0.2, 0.9, 0.3, 1)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[14px] font-semibold" style={{ color: "var(--ink)" }}>
            Reserva tu hora
          </div>
          <div className="text-[12px]" style={{ color: "var(--ink-mute)" }}>
            Abril
          </div>
        </div>
        <div className="mb-3.5 grid grid-cols-7 gap-1">
          {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
            <div
              key={d}
              className="flex aspect-square items-center justify-center text-[10px] font-medium"
              style={{ color: "var(--ink-mute)" }}
            >
              {d}
            </div>
          ))}
          {[
            { n: 20, k: "avail" },
            { n: 21, k: "avail" },
            { n: 22, k: "active" },
            { n: 23, k: "avail" },
            { n: 24, k: "" },
            { n: 25, k: "" },
            { n: 26, k: "" },
          ].map((d) => (
            <div
              key={d.n}
              className="flex aspect-square items-center justify-center rounded-[8px] text-[11px]"
              style={{
                background:
                  d.k === "active"
                    ? "var(--ink)"
                    : d.k === "avail"
                    ? "var(--sage-100)"
                    : "transparent",
                color:
                  d.k === "active"
                    ? "white"
                    : d.k === "avail"
                    ? "var(--sage-700)"
                    : "var(--ink-soft)",
                fontWeight: d.k === "active" ? 600 : 400,
              }}
            >
              {d.n}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { t: "09:00", picked: false },
            { t: "11:30", picked: false },
            { t: "16:00", picked: true },
            { t: "18:30", picked: false },
          ].map((s) => (
            <span
              key={s.t}
              className="rounded-full px-2.5 py-1.5 text-[11px]"
              style={{
                background: s.picked ? "var(--terracotta)" : "var(--bg-warm)",
                color: s.picked ? "white" : "var(--ink-soft)",
              }}
            >
              {s.t}
            </span>
          ))}
        </div>
      </div>

      {/* Floating stat */}
      <div
        ref={statRef}
        className="animate-nurea-float absolute flex items-center gap-3.5 bg-white"
        style={{
          top: "4%",
          right: "2%",
          padding: "16px 20px",
          borderRadius: 28,
          boxShadow:
            "0 30px 60px -30px oklch(0.3 0.04 170 / 0.2), 0 10px 20px -10px oklch(0.3 0.04 170 / 0.12)",
          zIndex: 3,
        }}
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "var(--sage-100)", color: "var(--sage-700)" }}
        >
          {Ico.heart(20)}
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: 22,
              fontWeight: 500,
              lineHeight: 1,
              color: "var(--ink)",
            }}
          >
            98%
          </div>
          <div className="mt-0.5 text-[11px]" style={{ color: "var(--ink-mute)" }}>
            Pacientes satisfechos
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero({ timeLeft }: { timeLeft: TimeLeft }) {
  return (
    <section className="relative overflow-hidden" style={{ padding: "80px 0 120px" }}>
      <div
        aria-hidden
        className="animate-nurea-drift pointer-events-none absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          background: "var(--sage-200)",
          top: -250,
          right: -150,
          filter: "blur(100px)",
          opacity: 0.6,
        }}
      />
      <div
        aria-hidden
        className="animate-nurea-drift-rev pointer-events-none absolute rounded-full"
        style={{
          width: 480,
          height: 480,
          background: "var(--terracotta)",
          bottom: -150,
          left: -120,
          filter: "blur(100px)",
          opacity: 0.3,
        }}
      />
      <div
        aria-hidden
        className="animate-nurea-float pointer-events-none absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          background: "var(--sage-300)",
          top: "25%",
          left: "5%",
          filter: "blur(50px)",
          opacity: 0.25,
        }}
      />

      <div className="relative z-[1] mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-12 px-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <div
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border"
            style={{
              padding: "6px 14px 6px 8px",
              background: "var(--sage-100)",
              borderColor: "var(--sage-200)",
              fontSize: 13,
              color: "var(--sage-700)",
            }}
          >
            <span
              className="relative inline-block h-[18px] w-[18px] rounded-full"
              style={{ background: "var(--sage-500)" }}
            >
              <span
                aria-hidden
                className="absolute inset-1 rounded-full bg-white"
              />
            </span>
            Lanzamos el 10 de diciembre de 2026
          </div>

          <h1
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: "clamp(44px, 6vw, 76px)",
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              fontWeight: 400,
              color: "var(--ink)",
              marginBottom: 28,
            }}
          >
            El puente entre
            <br />
            pacientes y{" "}
            <em
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--sage-500)",
              }}
            >
              profesionales
              <br />
              de la salud
            </em>
            .
          </h1>

          <p
            className="max-w-[520px]"
            style={{
              fontSize: 19,
              lineHeight: 1.55,
              color: "var(--ink-soft)",
              marginBottom: 40,
            }}
          >
            Una plataforma serena y segura donde quienes buscan cuidado se encuentran con quienes
            mejor pueden ofrecerlo en Chile. Menos fricción, más accesibilidad, y todo el tiempo
            que la salud merece.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full px-7 py-4 text-[15px] font-medium transition-all"
              style={{ background: "var(--ink)", color: "var(--bg)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--sage-900)"
                e.currentTarget.style.transform = "translateY(-1px)"
                e.currentTarget.style.boxShadow = "0 8px 20px -8px oklch(0.25 0.03 170 / 0.4)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--ink)"
                e.currentTarget.style.transform = ""
                e.currentTarget.style.boxShadow = ""
              }}
            >
              Crear mi cuenta
              {Ico.arrow(16)}
            </Link>
            <Link
              href="/signup?role=pro"
              className="inline-flex items-center gap-2 rounded-full border px-7 py-4 text-[15px] font-medium transition-colors"
              style={{ borderColor: "var(--line)", color: "var(--ink)", background: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--ink)"
                e.currentTarget.style.background = "var(--bg-warm)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--line)"
                e.currentTarget.style.background = "transparent"
              }}
            >
              Soy profesional
            </Link>
          </div>

          <div
            className="mt-12 flex flex-wrap items-center gap-5 text-[13px]"
            style={{ color: "var(--ink-mute)" }}
          >
            <div className="flex">
              {[
                "linear-gradient(135deg, oklch(0.78 0.06 170), oklch(0.65 0.08 160))",
                "linear-gradient(135deg, oklch(0.8 0.08 60), oklch(0.68 0.1 45))",
                "linear-gradient(135deg, oklch(0.75 0.05 230), oklch(0.62 0.07 220))",
                "linear-gradient(135deg, oklch(0.82 0.05 340), oklch(0.7 0.07 330))",
              ].map((g, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full"
                  style={{
                    background: g,
                    border: "2px solid var(--bg)",
                    marginLeft: i === 0 ? 0 : -8,
                  }}
                />
              ))}
            </div>
            <div>
              <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
                +120 profesionales fundadores
              </strong>{" "}
              preparándose para el lanzamiento en Chile.
            </div>
          </div>

          <CountdownChip t={timeLeft} />
        </div>

        <HeroVisual />
      </div>
    </section>
  )
}

/* ─── LOGOS ──────────────────────────────────────────────────────────────── */

function LogosStrip() {
  return (
    <section
      className="py-[60px]"
      style={{ borderTop: "1px solid var(--line-soft)", borderBottom: "1px solid var(--line-soft)" }}
    >
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-10 px-6 sm:px-8">
        <div className="max-w-[220px] text-[13px]" style={{ color: "var(--ink-mute)" }}>
          Respaldados por instituciones de salud líderes en Chile
        </div>
        <div className="flex flex-wrap items-center gap-12" style={{ opacity: 0.65 }}>
          {CLIENT_LOGOS.map((l) => (
            <div
              key={l.name}
              className="flex items-center gap-2 transition-opacity"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "var(--ink-soft)",
              }}
            >
              <span
                className="h-[22px] w-[22px]"
                style={{
                  background: "var(--ink-soft)",
                  borderRadius: l.shape === "round" ? "50%" : l.shape === "diamond" ? 4 : 6,
                  transform: l.shape === "diamond" ? "rotate(45deg)" : undefined,
                }}
              />
              {l.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── STATS ─────────────────────────────────────────────────────────────── */

function SectionEyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 ${center ? "justify-center" : ""}`}
      style={{
        fontFamily: "var(--font-jetbrains-mono)",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        color: "var(--sage-500)",
        marginBottom: 20,
      }}
    >
      <span className="inline-block h-px w-6" style={{ background: "var(--sage-500)" }} />
      {children}
      {center && <span className="inline-block h-px w-6" style={{ background: "var(--sage-500)" }} />}
    </div>
  )
}

function SectionTitle({
  children,
  size = "lg",
  center = false,
  className = "",
}: {
  children: React.ReactNode
  size?: "lg" | "md"
  center?: boolean
  className?: string
}) {
  return (
    <h2
      className={className}
      style={{
        fontFamily: "var(--font-fraunces)",
        fontSize: size === "lg" ? "clamp(34px, 4.5vw, 52px)" : "clamp(28px, 3.6vw, 40px)",
        lineHeight: 1.05,
        letterSpacing: "-0.03em",
        fontWeight: 400,
        color: "var(--ink)",
        textAlign: center ? "center" : "left",
      }}
    >
      {children}
    </h2>
  )
}

function Stats() {
  return (
    <section className="py-[120px]">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
        <div className="nurea-reveal mb-[72px] max-w-[680px]">
          <SectionEyebrow>Impacto real</SectionEyebrow>
          <SectionTitle>
            Acortamos la distancia entre
            <br />
            la <em style={{ fontStyle: "italic", color: "var(--sage-500)", fontWeight: 300 }}>necesidad</em>{" "}
            y el{" "}
            <em style={{ fontStyle: "italic", color: "var(--sage-500)", fontWeight: 300 }}>cuidado</em>.
          </SectionTitle>
        </div>
        <div
          className="nurea-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="px-0 py-9"
              style={{
                borderRight: i < STATS.length - 1 ? "1px solid var(--line)" : "none",
                paddingLeft: i === 0 ? 0 : 32,
                paddingRight: 28,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontSize: 64,
                  fontWeight: 400,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  color: "var(--ink)",
                  marginBottom: 12,
                }}
              >
                <AnimatedCount target={s.target} suffix={s.suffix} />
              </div>
              <div className="text-[14px] leading-[1.4]" style={{ color: "var(--ink-soft)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── FEATURES (bento) ──────────────────────────────────────────────────── */

function FeatureCard({
  span,
  rowSpan,
  large,
  icon,
  title,
  desc,
  children,
}: {
  span: number
  rowSpan?: number
  large?: boolean
  icon: React.ReactNode
  title: string
  desc: string
  children?: React.ReactNode
}) {
  return (
    <div
      className="nurea-feature-card nurea-reveal relative flex flex-col overflow-hidden border p-8"
      style={{
        background: "var(--bg)",
        borderColor: "var(--line-soft)",
        borderRadius: 28,
        gridColumn: `span ${span}`,
        gridRow: rowSpan ? `span ${rowSpan}` : undefined,
      }}
    >
      <div
        className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ background: "var(--sage-100)", color: "var(--sage-700)" }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: "var(--font-fraunces)",
          fontSize: large ? 36 : 24,
          letterSpacing: "-0.02em",
          marginBottom: 10,
          color: "var(--ink)",
          lineHeight: 1.15,
        }}
      >
        {title}
      </h3>
      <p
        className={large ? "max-w-[440px] text-[16px]" : "text-[14px]"}
        style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}
      >
        {desc}
      </p>
      {children && <div className="mt-auto pt-7">{children}</div>}
    </div>
  )
}

function Features() {
  return (
    <section
      id="features"
      className="py-[120px]"
      style={{ background: "var(--bg-warm)", borderRadius: "48px 48px 0 0" }}
    >
      <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
        <div className="mb-20 grid grid-cols-1 items-end gap-14 lg:grid-cols-2">
          <div className="nurea-reveal">
            <SectionEyebrow>La plataforma</SectionEyebrow>
            <SectionTitle>
              Todo lo que necesitas para cuidar{" "}
              <em style={{ fontStyle: "italic", color: "var(--sage-500)", fontWeight: 300 }}>mejor</em>
              , o ser{" "}
              <em style={{ fontStyle: "italic", color: "var(--sage-500)", fontWeight: 300 }}>
                mejor cuidado
              </em>
              .
            </SectionTitle>
          </div>
          <p
            className="nurea-reveal max-w-[460px] text-[17px]"
            style={{ color: "var(--ink-soft)" }}
          >
            Un espacio pensado con detalle, donde cada herramienta responde a una realidad del
            cuidado: descubrir, reservar, conversar, acompañar.
          </p>
        </div>

        <div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6"
          style={{ gridAutoRows: "minmax(260px, auto)" }}
        >
          <FeatureCard
            span={4}
            rowSpan={2}
            large
            icon={Ico.search()}
            title="Descubre al profesional adecuado, sin la ansiedad de empezar."
            desc="Búsqueda contextual por especialidad, enfoque, idioma, modalidad y presupuesto. Los resultados aprenden de lo que valoras."
          >
            <div
              className="mb-4 flex items-center gap-3 rounded-full border px-4 py-3.5"
              style={{ background: "var(--bg-warm)", borderColor: "var(--line)" }}
            >
              <span style={{ color: "var(--ink-mute)" }}>{Ico.search(16)}</span>
              <span className="text-[14px]" style={{ color: "var(--ink-soft)" }}>
                Busca por especialidad, condición o precio
              </span>
              <span
                className="animate-nurea-blink ml-1 inline-block"
                style={{ width: 1.5, height: 14, background: "var(--sage-500)" }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { t: "Psicología", active: true },
                { t: "Ansiedad" },
                { t: "Terapia online" },
                { t: "$20.000–$45.000" },
                { t: "Español" },
              ].map((c) => (
                <span
                  key={c.t}
                  className="rounded-full border px-3.5 py-1.5 text-[12px]"
                  style={{
                    background: c.active ? "var(--ink)" : "var(--bg-warm)",
                    color: c.active ? "white" : "var(--ink-soft)",
                    borderColor: c.active ? "var(--ink)" : "var(--line)",
                  }}
                >
                  {c.t}
                </span>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard
            span={2}
            rowSpan={2}
            icon={Ico.shield()}
            title="Verificación real."
            desc="Cada profesional pasa por validación de título, antecedentes y referencias. Confianza, no marketing."
          >
            <div className="flex flex-col gap-2.5">
              {[
                "Título profesional verificado",
                "Identidad validada con cédula",
                "Registro SIS vigente",
                "Ética profesional al día",
              ].map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-2.5 text-[13px]"
                  style={{ color: "var(--ink-soft)" }}
                >
                  <span
                    className="flex h-[18px] w-[18px] items-center justify-center rounded-full"
                    style={{ background: "var(--sage-200)", color: "var(--sage-700)" }}
                  >
                    {Ico.check(10)}
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard
            span={3}
            icon={Ico.chat()}
            title="Conversaciones privadas y cifradas."
            desc="Mensajes, notas y expedientes protegidos con cifrado extremo a extremo."
          >
            <div
              className="mb-2 max-w-[80%] rounded-[18px_18px_18px_4px] px-4 py-3 text-[13px]"
              style={{ background: "var(--bg-warm)", color: "var(--ink)" }}
            >
              Hola Laura, ¿podríamos mover la cita del jueves?
            </div>
            <div
              className="ml-auto max-w-[80%] rounded-[18px_18px_4px_18px] px-4 py-3 text-[13px]"
              style={{ background: "var(--sage-200)", color: "var(--sage-900)" }}
            >
              Claro, tengo disponible a las 17:00. ¿Te funciona?
            </div>
          </FeatureCard>

          <FeatureCard
            span={3}
            icon={Ico.calendar()}
            title="Agenda que respira contigo."
            desc="Sincronización con Google, iCloud y Outlook. Recordatorios amables, no invasivos."
          >
            {[
              {
                name: "Martes, 16:00",
                spec: "Dra. Mendoza · 50 min",
                badge: "Confirmada",
                g: "linear-gradient(135deg, oklch(0.78 0.06 170), oklch(0.65 0.08 160))",
              },
              {
                name: "Viernes, 11:30",
                spec: "Dr. Ruiz · 30 min",
                badge: "Próxima",
                g: "linear-gradient(135deg, oklch(0.8 0.08 60), oklch(0.68 0.1 45))",
              },
            ].map((r) => (
              <div
                key={r.name}
                className="mb-2 flex items-center gap-3 rounded-2xl border p-3"
                style={{ background: "var(--bg)", borderColor: "var(--line-soft)" }}
              >
                <div className="h-9 w-9 flex-shrink-0 rounded-full" style={{ background: r.g }} />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
                    {r.name}
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--ink-mute)" }}>
                    {r.spec}
                  </div>
                </div>
                <span
                  className="ml-auto rounded-full px-2.5 py-1 text-[11px]"
                  style={{ background: "var(--sage-100)", color: "var(--sage-700)" }}
                >
                  {r.badge}
                </span>
              </div>
            ))}
          </FeatureCard>

          <FeatureCard
            span={2}
            icon={Ico.layers()}
            title="Pagos transparentes."
            desc="Una tarifa clara, boleta automática y devoluciones sin preguntas incómodas."
          />
          <FeatureCard
            span={2}
            icon={Ico.note()}
            title="Seguimiento compartido."
            desc="Notas, tareas entre sesiones y un espejo amable del progreso, solo entre tú y tu profesional."
          />
          <FeatureCard
            span={2}
            icon={Ico.globe()}
            title="Dentro o fuera del consultorio."
            desc="Videoconsulta integrada con calidad clínica. O presencial, cuando eso acerque más."
          />
        </div>
      </div>
    </section>
  )
}

/* ─── HOW ───────────────────────────────────────────────────────────────── */

function How() {
  return (
    <section id="how" className="py-[140px]" style={{ background: "var(--bg-warm)" }}>
      <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
        <div className="nurea-reveal mx-auto mb-20 text-center">
          <SectionEyebrow center>Cómo funciona</SectionEyebrow>
          <SectionTitle center>
            Tres pasos, y el tiempo que necesites para{" "}
            <em style={{ fontStyle: "italic", color: "var(--sage-500)", fontWeight: 300 }}>decidir</em>.
          </SectionTitle>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3">
          <div
            aria-hidden
            className="pointer-events-none absolute hidden md:block"
            style={{
              top: 54,
              left: "10%",
              right: "10%",
              height: 1,
              background:
                "linear-gradient(to right, transparent, var(--sage-200), var(--sage-200), transparent)",
            }}
          />
          {HOW_STEPS.map((s) => (
            <div
              key={s.n}
              className="nurea-step nurea-reveal relative px-6 text-center"
            >
              <div
                className="nurea-step-num mx-auto mb-7 flex h-[108px] w-[108px] items-center justify-center rounded-full border"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--line)",
                  fontFamily: "var(--font-fraunces)",
                  fontSize: 32,
                  fontWeight: 400,
                  color: "var(--sage-700)",
                }}
              >
                {s.n}
              </div>
              <h3
                className="mb-3"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontSize: 24,
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  color: "var(--ink)",
                }}
              >
                {s.t}
              </h3>
              <p
                className="mx-auto max-w-[280px] text-[15px] leading-[1.5]"
                style={{ color: "var(--ink-soft)" }}
              >
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── SPECIALTIES ───────────────────────────────────────────────────────── */

function Specs() {
  return (
    <section id="specs" className="py-[120px]" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-10">
          <div className="nurea-reveal max-w-2xl">
            <SectionEyebrow>Especialidades en Chile</SectionEyebrow>
            <SectionTitle>
              Una red amplia,
              <br />
              un cuidado{" "}
              <em style={{ fontStyle: "italic", color: "var(--sage-500)", fontWeight: 300 }}>
                cercano
              </em>
              .
            </SectionTitle>
          </div>
          <Link
            href="/explore"
            className="nurea-reveal inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-[14px] font-medium"
            style={{ borderColor: "var(--line)", color: "var(--ink)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--ink)"
              e.currentTarget.style.background = "var(--bg-warm)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--line)"
              e.currentTarget.style.background = "transparent"
            }}
          >
            Explorar todas {Ico.arrow(14)}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {SPECIALTIES.map((s) => (
            <Link
              key={s.n}
              href={`/explore?specialty=${encodeURIComponent(s.name)}`}
              className="nurea-spec-card nurea-reveal flex aspect-square flex-col justify-between border p-6"
              style={{
                background: "var(--bg-warm)",
                borderColor: "var(--line-soft)",
                borderRadius: 20,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--sage-300)"
                e.currentTarget.style.background = "var(--sage-100)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--line-soft)"
                e.currentTarget.style.background = "var(--bg-warm)"
              }}
            >
              <div
                className="relative text-[11px]"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  color: "var(--ink-mute)",
                }}
              >
                {s.n}
              </div>
              <div
                className="relative"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontSize: 22,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  color: "var(--ink)",
                }}
              >
                {s.name}
              </div>
              <div
                className="relative flex items-center gap-2 text-[12px]"
                style={{ color: "var(--ink-soft)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--sage-500)" }} />
                {s.count} profesionales
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── DEMO ──────────────────────────────────────────────────────────────── */

function Demo() {
  return (
    <section
      id="demo"
      className="relative overflow-hidden py-[120px]"
      style={{ background: "var(--sage-900)", color: "var(--bg)" }}
    >
      <div
        aria-hidden
        className="absolute rounded-full"
        style={{
          width: 800,
          height: 800,
          background: "radial-gradient(circle, var(--sage-500), transparent 70%)",
          opacity: 0.15,
          top: -400,
          right: -300,
          filter: "blur(80px)",
        }}
      />
      <div className="relative mx-auto max-w-[1240px] px-6 sm:px-8">
        <div className="nurea-reveal mx-auto mb-16 max-w-[760px] text-center">
          <div
            className="mb-5 inline-flex items-center gap-2.5 justify-center"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "var(--sage-200)",
            }}
          >
            <span className="inline-block h-px w-6" style={{ background: "var(--sage-200)" }} />
            Ver en acción
            <span className="inline-block h-px w-6" style={{ background: "var(--sage-200)" }} />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: "clamp(34px, 4.5vw, 52px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "var(--bg)",
              marginBottom: 20,
            }}
          >
            Una demostración de{" "}
            <em style={{ fontStyle: "italic", color: "var(--sage-200)", fontWeight: 300 }}>
              dos minutos
            </em>
            .
          </h2>
          <p
            className="text-[17px]"
            style={{ color: "color-mix(in oklab, var(--bg) 70%, transparent)" }}
          >
            Mira cómo una paciente encuentra a su profesional ideal, reserva su primera hora y
            recibe acompañamiento entre sesiones — todo dentro de Nurea.
          </p>
        </div>

        <div
          className="nurea-reveal relative mx-auto max-w-[960px] cursor-pointer overflow-hidden transition-transform duration-500"
          style={{
            aspectRatio: "16 / 9",
            borderRadius: 24,
            background: "linear-gradient(135deg, var(--sage-700), var(--sage-500))",
            boxShadow: "0 40px 80px -40px oklch(0.4 0.08 170 / 0.6)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = ""
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(45deg, transparent 0 24px, oklch(0.4 0.05 170 / 0.15) 24px 25px)",
              opacity: 0.6,
            }}
          />
          <div
            className="absolute top-6 left-6 text-[11px]"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              color: "color-mix(in oklab, white 70%, transparent)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            [ Placeholder · Video demo 1920×1080 ]
          </div>
          <div
            className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform"
            style={{ background: "var(--bg)", color: "var(--sage-900)" }}
          >
            <span
              className="animate-nurea-pulse-ring absolute rounded-full"
              style={{
                inset: -12,
                border: "1px solid color-mix(in oklab, white 40%, transparent)",
              }}
            />
            {Ico.play(28)}
          </div>
          <div
            className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-[13px] text-white"
          >
            <span>Recorrido por la plataforma</span>
            <span style={{ fontFamily: "var(--font-jetbrains-mono)" }}>02:14</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── TESTIS ─────────────────────────────────────────────────────────────── */

function Testis() {
  return (
    <section className="py-[120px]">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
        <div className="nurea-reveal mb-5 max-w-[680px]">
          <SectionEyebrow>Voces de la red</SectionEyebrow>
          <SectionTitle>
            Profesionales que{" "}
            <em style={{ fontStyle: "italic", color: "var(--sage-500)", fontWeight: 300 }}>
              eligen
            </em>{" "}
            a Nurea.
          </SectionTitle>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.n}
              className="nurea-reveal flex flex-col border p-8 transition-all duration-300"
              style={{
                background: "var(--bg)",
                borderColor: "var(--line-soft)",
                borderRadius: 28,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--sage-200)"
                e.currentTarget.style.background = "var(--sage-100)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--line-soft)"
                e.currentTarget.style.background = "var(--bg)"
              }}
            >
              <p
                className="flex-grow"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontSize: 20,
                  lineHeight: 1.4,
                  letterSpacing: "-0.01em",
                  color: "var(--ink)",
                  marginBottom: 24,
                }}
              >
                “{t.q}”
              </p>
              <div
                className="flex items-center gap-3 pt-5"
                style={{ borderTop: "1px solid var(--line-soft)" }}
              >
                <div
                  className="h-10 w-10 flex-shrink-0 rounded-full"
                  style={{ background: t.grad }}
                />
                <div>
                  <div className="text-[14px] font-semibold" style={{ color: "var(--ink)" }}>
                    {t.n}
                  </div>
                  <div className="text-[12px]" style={{ color: "var(--ink-mute)" }}>
                    {t.r}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── PRICING ───────────────────────────────────────────────────────────── */

function Pricing() {
  const [yearly, setYearly] = useState(false)
  const toggleRef = useRef<HTMLDivElement | null>(null)
  const [pill, setPill] = useState({ left: 4, width: 0 })

  const reposition = useCallback(() => {
    const wrap = toggleRef.current
    if (!wrap) return
    const active = wrap.querySelector<HTMLButtonElement>(`button[data-period="${yearly ? "yearly" : "monthly"}"]`)
    if (!active) return
    setPill({ left: active.offsetLeft, width: active.offsetWidth })
  }, [yearly])

  useEffect(() => {
    reposition()
    window.addEventListener("resize", reposition)
    return () => window.removeEventListener("resize", reposition)
  }, [reposition])

  return (
    <section id="pricing" className="py-[120px]" style={{ background: "var(--bg-warm)" }}>
      <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
        <div className="nurea-reveal mx-auto mb-[72px] max-w-[720px] text-center">
          <SectionEyebrow center>Precios</SectionEyebrow>
          <SectionTitle center>
            Transparente para pacientes,
            <br />
            <em style={{ fontStyle: "italic", color: "var(--sage-500)", fontWeight: 300 }}>justo</em>{" "}
            para profesionales.
          </SectionTitle>

          <div
            ref={toggleRef}
            className="relative mt-8 inline-flex rounded-full border p-1"
            style={{ background: "var(--bg)", borderColor: "var(--line)" }}
          >
            <span
              className="nurea-pricing-pill absolute rounded-full"
              style={{
                top: 4,
                height: "calc(100% - 8px)",
                background: "var(--ink)",
                left: pill.left,
                width: pill.width,
                zIndex: 1,
              }}
            />
            <button
              data-period="monthly"
              onClick={() => setYearly(false)}
              className="relative z-[2] rounded-full px-5 py-2 text-[13px] font-medium transition-colors"
              style={{ color: !yearly ? "var(--bg)" : "var(--ink-soft)" }}
            >
              Mensual
            </button>
            <button
              data-period="yearly"
              onClick={() => setYearly(true)}
              className="relative z-[2] rounded-full px-5 py-2 text-[13px] font-medium transition-colors"
              style={{ color: yearly ? "var(--bg)" : "var(--ink-soft)" }}
            >
              Anual
              <span
                className="ml-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{ background: "var(--sage-200)", color: "var(--sage-700)" }}
              >
                −20%
              </span>
            </button>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-5 md:grid-cols-3">
          {PLANS.map((p) => {
            const featured = !!p.featured
            const price = yearly ? p.yearly : p.monthly
            const priceLabel =
              price === "free" ? "Gratis" : price === "custom" ? "A medida" : formatCLP(price)
            const isNumeric = typeof price === "number"
            return (
              <div
                key={p.name}
                className="nurea-reveal relative flex flex-col border p-9 transition-transform"
                style={{
                  background: featured ? "var(--sage-900)" : "var(--bg)",
                  borderColor: featured ? "var(--sage-900)" : "var(--line)",
                  color: featured ? "var(--bg)" : "var(--ink)",
                  borderRadius: 28,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = ""
                }}
              >
                {featured && (
                  <span
                    className="absolute rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.05em]"
                    style={{
                      top: -12,
                      left: 32,
                      background: "var(--terracotta)",
                      color: "white",
                    }}
                  >
                    {p.badge}
                  </span>
                )}
                <div
                  className="mb-2"
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontSize: 22,
                    color: featured ? "var(--bg)" : "var(--ink)",
                  }}
                >
                  {p.name}
                </div>
                <div
                  className="mb-7 text-[13px]"
                  style={{
                    color: featured
                      ? "color-mix(in oklab, var(--bg) 60%, transparent)"
                      : "var(--ink-mute)",
                    minHeight: 36,
                  }}
                >
                  {p.desc}
                </div>

                <div
                  className="mb-1 flex items-baseline gap-2"
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontSize: isNumeric ? 54 : 42,
                    fontWeight: 400,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    color: featured ? "var(--bg)" : "var(--ink)",
                  }}
                >
                  {priceLabel}
                </div>
                <div
                  className="mb-7 text-[13px]"
                  style={{
                    color: featured
                      ? "color-mix(in oklab, var(--bg) 60%, transparent)"
                      : "var(--ink-mute)",
                  }}
                >
                  {yearly && isNumeric ? "por profesional / mes · anual" : p.period}
                </div>

                <Link
                  href={p.href}
                  className="mb-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-medium transition-all"
                  style={
                    p.ctaStyle === "terracotta"
                      ? { background: "var(--terracotta)", color: "white" }
                      : featured
                      ? {
                          border: "1px solid color-mix(in oklab, white 30%, transparent)",
                          color: "white",
                          background: "transparent",
                        }
                      : { border: "1px solid var(--line)", color: "var(--ink)", background: "transparent" }
                  }
                  onMouseEnter={(e) => {
                    if (p.ctaStyle === "terracotta") {
                      e.currentTarget.style.background = "var(--terracotta-deep)"
                      e.currentTarget.style.transform = "translateY(-1px)"
                    } else if (featured) {
                      e.currentTarget.style.background = "var(--sage-700)"
                      e.currentTarget.style.borderColor = "var(--sage-700)"
                    } else {
                      e.currentTarget.style.borderColor = "var(--ink)"
                      e.currentTarget.style.background = "var(--bg-warm)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (p.ctaStyle === "terracotta") {
                      e.currentTarget.style.background = "var(--terracotta)"
                      e.currentTarget.style.transform = ""
                    } else if (featured) {
                      e.currentTarget.style.background = "transparent"
                      e.currentTarget.style.borderColor =
                        "color-mix(in oklab, white 30%, transparent)"
                    } else {
                      e.currentTarget.style.borderColor = "var(--line)"
                      e.currentTarget.style.background = "transparent"
                    }
                  }}
                >
                  {p.cta} {Ico.arrow(14)}
                </Link>

                <ul className="flex flex-col gap-3">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-[14px]"
                      style={{
                        color: featured
                          ? "color-mix(in oklab, var(--bg) 80%, transparent)"
                          : "var(--ink-soft)",
                      }}
                    >
                      <span
                        className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: featured ? "var(--sage-700)" : "var(--sage-100)",
                          color: featured ? "var(--sage-100)" : "var(--sage-700)",
                        }}
                      >
                        {Ico.check(9)}
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─── BLOG ───────────────────────────────────────────────────────────────── */

function Blog() {
  return (
    <section className="py-[120px]">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-10">
          <div className="nurea-reveal max-w-2xl">
            <SectionEyebrow>Diario de Nurea</SectionEyebrow>
            <SectionTitle>
              Lecturas que{" "}
              <em style={{ fontStyle: "italic", color: "var(--sage-500)", fontWeight: 300 }}>
                acompañan
              </em>
              <br />
              la práctica del cuidado.
            </SectionTitle>
          </div>
          <a
            href="#"
            className="nurea-reveal inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-[14px] font-medium"
            style={{ borderColor: "var(--line)", color: "var(--ink)" }}
          >
            Ver todos los artículos {Ico.arrow(14)}
          </a>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.4fr_1fr_1fr]">
          {BLOG_POSTS.map((p, i) => (
            <article
              key={i}
              className="nurea-reveal flex cursor-pointer flex-col transition-transform duration-300 hover:-translate-y-1"
            >
              <div
                className="relative mb-5 overflow-hidden"
                style={{
                  aspectRatio: p.featured ? "4/3" : "16/10",
                  borderRadius: 20,
                  background: p.grad,
                }}
              >
                {i === 0 && (
                  <div
                    aria-hidden
                    className="absolute rounded-full"
                    style={{
                      width: "60%",
                      height: "60%",
                      top: "20%",
                      left: "20%",
                      background:
                        "radial-gradient(circle at 30% 30%, oklch(0.95 0.02 90 / 0.7), transparent)",
                    }}
                  />
                )}
              </div>
              <div
                className="mb-3 text-[11px]"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--sage-500)",
                }}
              >
                {p.meta}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontSize: p.featured ? 30 : 22,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: 12,
                  color: "var(--ink)",
                }}
              >
                {p.t}
              </h3>
              {p.e && (
                <p className="text-[14px] leading-[1.5]" style={{ color: "var(--ink-soft)" }}>
                  {p.e}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── FAQ ────────────────────────────────────────────────────────────────── */

function Faq() {
  const [open, setOpen] = useState<number>(0)
  return (
    <section id="faq" className="py-[120px]" style={{ background: "var(--bg-warm)" }}>
      <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="nurea-reveal">
            <SectionEyebrow>Preguntas frecuentes</SectionEyebrow>
            <SectionTitle>
              Todo lo que quizá
              <br />
              te estás{" "}
              <em style={{ fontStyle: "italic", color: "var(--sage-500)", fontWeight: 300 }}>
                preguntando
              </em>
              .
            </SectionTitle>
            <p className="mb-7 mt-6 text-[16px]" style={{ color: "var(--ink-soft)" }}>
              ¿Algo más que resolver? Hablamos contigo, sin apuros.
            </p>
            <a
              href="mailto:hola@nurea.app"
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-[14px] font-medium"
              style={{ borderColor: "var(--line)", color: "var(--ink)" }}
            >
              Contactar con el equipo {Ico.arrow(14)}
            </a>
          </div>

          <div className="nurea-reveal">
            {FAQS.map((f, i) => {
              const isOpen = open === i
              return (
                <div
                  key={f.q}
                  className="cursor-pointer py-6"
                  style={{
                    borderTop: "1px solid var(--line)",
                    borderBottom: i === FAQS.length - 1 ? "1px solid var(--line)" : undefined,
                  }}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div
                      className="flex-1"
                      style={{
                        fontFamily: "var(--font-fraunces)",
                        fontSize: 20,
                        fontWeight: 400,
                        letterSpacing: "-0.01em",
                        color: isOpen ? "var(--sage-700)" : "var(--ink)",
                        transition: "color 0.2s",
                      }}
                    >
                      {f.q}
                    </div>
                    <div
                      className={`nurea-faq-toggle flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${
                        isOpen ? "open" : ""
                      }`}
                      style={{
                        background: isOpen ? "var(--sage-900)" : "var(--bg)",
                        borderColor: isOpen ? "var(--sage-900)" : "var(--line)",
                        color: isOpen ? "white" : "var(--ink)",
                      }}
                    >
                      {Ico.plus(12)}
                    </div>
                  </div>
                  <div
                    className="overflow-hidden pr-12 text-[15px] leading-[1.55]"
                    style={{
                      color: "var(--ink-soft)",
                      maxHeight: isOpen ? 320 : 0,
                      marginTop: isOpen ? 16 : 0,
                      transition:
                        "max-height 0.4s ease, margin-top 0.3s",
                    }}
                  >
                    {f.a}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── CTA ───────────────────────────────────────────────────────────────── */

function CtaBlock({ timeLeft }: { timeLeft: TimeLeft }) {
  return (
    <section className="py-[120px] text-center">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
        <div
          className="nurea-reveal relative overflow-hidden px-10 py-[100px]"
          style={{
            background: "var(--sage-900)",
            color: "var(--bg)",
            borderRadius: 48,
          }}
        >
          <div
            aria-hidden
            className="absolute rounded-full"
            style={{
              width: 600,
              height: 600,
              top: -200,
              left: -100,
              background: "radial-gradient(circle, var(--sage-500), transparent 70%)",
              opacity: 0.3,
              filter: "blur(60px)",
            }}
          />
          <div
            aria-hidden
            className="absolute rounded-full"
            style={{
              width: 600,
              height: 600,
              bottom: -200,
              right: -100,
              background: "radial-gradient(circle, var(--terracotta), transparent 70%)",
              opacity: 0.2,
              filter: "blur(60px)",
            }}
          />
          <h2
            className="relative mx-auto mt-6 max-w-[780px]"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: "clamp(38px, 5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              fontWeight: 400,
              color: "var(--bg)",
              marginBottom: 24,
            }}
          >
            El cuidado empieza con una
            <br />
            conversación{" "}
            <em style={{ fontStyle: "italic", color: "var(--sage-200)", fontWeight: 300 }}>
              tranquila
            </em>
            .
          </h2>
          <p
            className="relative mx-auto max-w-[540px] text-[18px]"
            style={{ color: "color-mix(in oklab, var(--bg) 70%, transparent)", marginBottom: 40 }}
          >
            Únete a Nurea hoy. Gratis para pacientes, catorce días sin costo para profesionales.
          </p>
          <div className="relative flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full px-7 py-4 text-[15px] font-medium transition-transform"
              style={{ background: "var(--terracotta)", color: "white" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--terracotta-deep)"
                e.currentTarget.style.transform = "translateY(-1px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--terracotta)"
                e.currentTarget.style.transform = ""
              }}
            >
              Crear mi cuenta {Ico.arrow(16)}
            </Link>
            <a
              href="mailto:hola@nurea.app"
              className="inline-flex items-center gap-2 rounded-full border px-7 py-4 text-[15px] font-medium"
              style={{
                borderColor: "color-mix(in oklab, white 30%, transparent)",
                color: "white",
              }}
            >
              Hablar con el equipo
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── FOOTER ─────────────────────────────────────────────────────────────── */

function Footer() {
  const [sent, setSent] = useState(false)
  return (
    <footer className="pt-20 pb-10" style={{ borderTop: "1px solid var(--line-soft)" }}>
      <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
        <div className="mb-14 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p
              className="mt-5 max-w-[280px] text-[14px] leading-[1.5]"
              style={{ color: "var(--ink-soft)" }}
            >
              La plataforma que conecta pacientes y profesionales de la salud en Chile con el
              cuidado que la salud merece.
            </p>
            <form
              className="mt-6 flex max-w-[280px] rounded-full border p-1 transition-colors"
              style={{ borderColor: "var(--line)", background: "var(--bg)" }}
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
            >
              <input
                type="email"
                placeholder="Tu correo"
                required
                className="flex-1 border-none bg-transparent px-3.5 py-2 text-[13px] outline-none"
                style={{ color: "var(--ink)" }}
              />
              <button
                type="submit"
                className="rounded-full border-none px-3.5 py-2 text-[12px]"
                style={{ background: "var(--ink)", color: "white" }}
              >
                {sent ? "Gracias ✓" : "Avísame"}
              </button>
            </form>
          </div>

          {[
            {
              h: "Plataforma",
              links: [
                ["Para pacientes", "/pacientes"],
                ["Para profesionales", "/profesionales"],
                ["Para clínicas", "mailto:clinicas@nurea.app"],
                ["Integraciones", "#"],
              ],
            },
            {
              h: "Recursos",
              links: [
                ["Diario", "#blog"],
                ["Guías clínicas", "#"],
                ["Centro de ayuda", "#"],
                ["Estado del servicio", "#"],
              ],
            },
            {
              h: "Empresa",
              links: [
                ["Sobre Nurea", "#"],
                ["Manifiesto", "#"],
                ["Trabaja con nosotros", "#"],
                ["Prensa", "#"],
              ],
            },
            {
              h: "Legal",
              links: [
                ["Privacidad", "/legal/privacy"],
                ["Términos", "/legal/terms"],
                ["Cookies", "#"],
                ["Código ético", "#"],
              ],
            },
          ].map((col) => (
            <div key={col.h}>
              <h4
                className="mb-5 text-[13px] font-semibold"
                style={{
                  color: "var(--ink)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {col.h}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-[14px] transition-colors"
                      style={{ color: "var(--ink-soft)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--sage-700)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-soft)")}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-wrap items-center justify-between gap-5 pt-10 text-[13px]"
          style={{ borderTop: "1px solid var(--line-soft)", color: "var(--ink-mute)" }}
        >
          <div>© {new Date().getFullYear()} Nurea SpA — Temuco, Chile. Lanzamiento 10 · dic · 2026.</div>
          <div className="flex gap-6">
            {["Ley 19.628", "ISO 27001", "SOC 2"].map((l) => (
              <a key={l} href="#" style={{ color: "var(--ink-mute)" }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── PAGE ──────────────────────────────────────────────────────────────── */

export default function HomePage() {
  // La cuenta regresiva lee launch_date desde platform_settings (Supabase).
  // Si la tabla no responde, cae de inmediato al LAUNCH_TARGET_DATE hardcoded.
  const { timeLeft } = useLaunchCountdown(LAUNCH_TARGET_DATE)

  useReveal()

  return (
    <main
      id="main-content"
      className="min-h-screen"
      style={{
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "var(--font-inter)",
      }}
    >
      <Nav daysLeft={timeLeft.days} />
      <Hero timeLeft={timeLeft} />
      <LogosStrip />
      <Stats />
      <Features />
      <How />
      <Specs />
      <Demo />
      <Testis />
      <Pricing />
      <Blog />
      <Faq />
      <CtaBlock timeLeft={timeLeft} />
      <Footer />
    </main>
  )
}
