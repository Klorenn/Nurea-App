"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  MessageSquare,
  Stethoscope,
  Activity,
  Users,
  Video,
  TrendingUp,
  Lock,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

type DashboardMode = "patient" | "professional"

const ESCROW_TOOLTIP_COPY =
  "Depósito en garantía: Tu pago se guarda en una bóveda segura (Smart Contract) y solo se transfiere al especialista cuando la consulta finaliza con éxito. Si se cancela, se te devuelve automáticamente."

const PROFESSIONAL_SCHEDULE = [
  { time: "09:00", patient: "María González", type: "Telemedicina" as const, escrow: true },
  { time: "10:30", patient: "Carlos López", type: "Presencial" as const, escrow: true },
  { time: "12:00", patient: "Ana Martínez", type: "Telemedicina" as const, escrow: true },
]

export function NureaDashboardPreview() {
  const [mode, setMode] = useState<DashboardMode>("patient")
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [tilt, setTilt] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const center = viewportHeight / 2
      const offset = rect.top + rect.height / 2 - center
      const normalized = Math.max(-1, Math.min(1, offset / center))
      setTilt(-normalized * 6)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isPatient = mode === "patient"

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-x-0 top-24 -z-10 hidden h-72 bg-gradient-to-b from-teal-500/20 via-transparent to-transparent blur-3xl sm:block" />

      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Vista previa del panel
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Un panel diseñado para cada tipo de usuario
            </h2>
          </div>
          <div className="relative z-50 inline-flex rounded-full bg-white dark:bg-slate-900/80 p-1 text-xs shadow-md border border-slate-200 dark:border-slate-600/60">
            <button
              type="button"
              onClick={() => setMode("patient")}
              className={cn(
                "rounded-full px-4 py-2 transition-all duration-200",
                isPatient
                  ? "bg-[#009485] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white",
              )}
            >
              Pacientes
            </button>
            <button
              type="button"
              onClick={() => setMode("professional")}
              className={cn(
                "rounded-full px-4 py-2 transition-all duration-200",
                !isPatient
                  ? "bg-[#009485] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white",
              )}
            >
              Profesionales
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="sticky top-28"
          style={{ transform: `perspective(1200px) rotateX(${tilt}deg)` }}
        >
          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200/80 dark:border-slate-600/40 bg-white dark:bg-slate-900/50 shadow-2xl shadow-slate-400/20 dark:shadow-black/20 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-sm font-semibold text-white">
                  N
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight text-slate-950 dark:text-white">
                    NUREA {isPatient ? "Paciente" : "Profesional"}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-500">
                    {isPatient ? "Tu panel de salud" : "Tu práctica en un solo lugar"}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400">
                Vista previa del panel
              </Badge>
            </div>

            {/* Metric cards */}
            <div className="grid gap-4 border-b border-slate-100 dark:border-slate-700/50 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
              {isPatient ? (
                <>
                  <MetricCard
                    icon={Calendar}
                    iconBg="bg-teal-100 dark:bg-teal-500/20"
                    iconColor="text-teal-500"
                    label="Próximas citas"
                    value="2"
                    helper="Esta semana"
                    trend="+1 vs semana pasada"
                  />
                  <MetricCard
                    icon={MessageSquare}
                    iconBg="bg-teal-100 dark:bg-teal-500/20"
                    iconColor="text-teal-500"
                    label="Mensajes nuevos"
                    value="3"
                    helper="En tu bandeja"
                    trend="+12%"
                  />
                  <MetricCard
                    icon={Stethoscope}
                    iconBg="bg-teal-100 dark:bg-teal-500/20"
                    iconColor="text-teal-500"
                    label="Profesionales favoritos"
                    value="5"
                    helper="Siempre a un clic"
                  />
                  <MetricCard
                    icon={Lock}
                    iconBg="bg-teal-100 dark:bg-teal-500/20"
                    iconColor="text-teal-500"
                    label="Pagos asegurados"
                    value="Escrow"
                    helper="Fondos protegidos hasta tu cita"
                    isEscrow
                    tooltipText={ESCROW_TOOLTIP_COPY}
                  />
                </>
              ) : (
                <>
                  <MetricCard
                    icon={Calendar}
                    iconBg="bg-teal-100 dark:bg-teal-500/20"
                    iconColor="text-teal-500"
                    label="Citas de hoy"
                    value="7"
                    helper="Agenda organizada"
                    trend="+2 vs ayer"
                  />
                  <MetricCard
                    icon={Users}
                    iconBg="bg-teal-100 dark:bg-teal-500/20"
                    iconColor="text-teal-500"
                    label="Pacientes activos"
                    value="124"
                    helper="Con seguimiento"
                    trend="+8%"
                  />
                  <MetricCard
                    icon={MessageSquare}
                    iconBg="bg-teal-100 dark:bg-teal-500/20"
                    iconColor="text-teal-500"
                    label="Mensajes por responder"
                    value="4"
                    helper="Mantén el contacto"
                  />
                  <MetricCard
                    icon={Activity}
                    iconBg="bg-teal-100 dark:bg-teal-500/20"
                    iconColor="text-teal-500"
                    label="Ingresos del mes"
                    value="$1.560"
                    helper="Pagos completados vía escrow"
                    trend="+12%"
                  />
                </>
              )}
            </div>

            {/* Content area: Citas para Hoy (Patient) or Agenda de la Mañana (Professional) */}
            <div className="px-4 py-5">
              {isPatient ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold tracking-tight text-slate-950 dark:text-white">
                        Citas para Hoy
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-500">
                        Tus próximas consultas programadas
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-700/50 px-3 py-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Vista de ejemplo
                    </span>
                  </div>
                  <div className="rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 shadow-sm overflow-hidden">
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-500/20">
                        <Video className="h-7 w-7 text-teal-500" aria-hidden />
                      </div>
                      <p className="text-sm font-medium text-slate-950 dark:text-white mb-1">
                        No tienes citas agendadas aún
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-[220px]">
                        Agenda una consulta online cuando lo necesites
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-slate-200 dark:border-slate-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10 hover:border-teal-200 dark:hover:border-teal-500/30 font-medium"
                      >
                        Agendar cita online
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold tracking-tight text-slate-950 dark:text-white">
                        Agenda de la Mañana
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-500">
                        Próximas consultas y estado de pago
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-700/50 px-3 py-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Vista de ejemplo
                    </span>
                  </div>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[43px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-600/60" />
                    <ul className="space-y-0">
                      {PROFESSIONAL_SCHEDULE.map((item, i) => (
                        <li key={i} className="relative flex gap-4 py-3 first:pt-0">
                          <div className="w-14 shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-500 tabular-nums pt-0.5">
                            {item.time}
                          </div>
                          <div className="flex-1 min-w-0 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 px-4 py-3 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-medium text-slate-950 dark:text-white">{item.patient}</p>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[11px] font-medium",
                                  item.type === "Telemedicina"
                                    ? "border-teal-500/50 bg-teal-500/10 text-teal-600 dark:text-teal-400"
                                    : "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                                )}
                              >
                                {item.type}
                              </Badge>
                            </div>
                            {item.escrow && (
                              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-teal-600 dark:text-teal-400">
                                <Lock className="h-3.5 w-3.5" />
                                Escrow bloqueado
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

interface MetricCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  iconBg: string
  iconColor: string
  label: string
  value: string
  helper: string
  trend?: string
  isEscrow?: boolean
  tooltipText?: string
}

function MetricCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  helper,
  trend,
  isEscrow,
  tooltipText,
}: MetricCardProps) {
  return (
    <Card className="border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-shadow rounded-xl">
      <CardHeader className="pb-1 pt-4 px-4">
        <CardTitle className="flex items-center justify-between gap-2 text-xs font-medium text-slate-600 dark:text-slate-500">
          <span className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                iconBg,
                isEscrow && "ring-2 ring-emerald-400/30",
              )}
            >
              <Icon className={cn("h-4 w-4", iconColor)} />
            </span>
            {label}
          </span>
          {trend && (
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-4 px-4">
        {tooltipText ? (
          <div className="group relative flex items-center cursor-help w-fit">
            <span className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</span>
            <Info className="ml-1.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <div
              className="pointer-events-none absolute bottom-full left-0 mb-2 w-64 rounded-md bg-slate-800 p-3 text-xs text-white shadow-lg opacity-0 invisible transition-all duration-200 group-hover:opacity-100 group-hover:visible z-50"
              role="tooltip"
            >
              {tooltipText}
            </div>
          </div>
        ) : (
          <p className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</p>
        )}
        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-500">{helper}</p>
      </CardContent>
    </Card>
  )
}
