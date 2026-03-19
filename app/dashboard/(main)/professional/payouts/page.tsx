"use client"

import { useEffect, useMemo, useState } from "react"
import { BarChart3, Users, CalendarCheck2, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"

type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show"

interface AppointmentRow {
  id: string
  appointment_date: string
  status: AppointmentStatus
  patient_id: string | null
}

export default function PayoutsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<AppointmentRow[]>([])

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setRows([])
          return
        }

        const since = new Date()
        since.setFullYear(since.getFullYear() - 1)

        const { data, error } = await supabase
          .from("appointments")
          .select("id, appointment_date, status, patient_id")
          .eq("professional_id", user.id)
          .gte("appointment_date", since.toISOString().slice(0, 10))

        if (error) {
          console.error("Error loading stats:", error.message || error)
          setRows([])
          return
        }

        setRows((data || []) as AppointmentRow[])
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [supabase])

  const {
    uniquePatients,
    last30Completed,
    last30Days,
  } = useMemo(() => {
    if (!rows.length) {
      return {
        uniquePatients: 0,
        last30Completed: 0,
        last30Days: [] as { date: string; completed: number }[],
      }
    }

    const patientSet = new Set(rows.map((r) => r.patient_id).filter(Boolean))

    const now = new Date()
    const since30 = new Date()
    since30.setDate(now.getDate() - 29)

    const last30 = rows.filter((r) => {
      const d = new Date(r.appointment_date)
      return d >= since30 && d <= now
    })

    const last30Completed = last30.filter((r) => r.status === "completed").length

    const map = new Map<string, number>()
    for (let i = 0; i < 30; i++) {
      const d = new Date(since30)
      d.setDate(since30.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      map.set(key, 0)
    }
    last30.forEach((r) => {
      if (r.status === "completed") {
        const key = r.appointment_date
        map.set(key, (map.get(key) || 0) + 1)
      }
    })

    const last30Days = Array.from(map.entries()).map(([date, completed]) => ({
      date,
      completed,
    }))

    return {
      uniquePatients: patientSet.size,
      last30Completed,
      last30Days,
    }
  }, [rows])

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-teal-600" />
            Estadísticas de tu práctica
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Revisa cómo está funcionando tu perfil en NUREA: visitas, citas y pacientes atendidos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-teal-500" />
              Visitas a tu perfil
            </CardDescription>
            <CardTitle className="text-3xl font-bold flex items-baseline gap-2">
              <span>—</span>
              <span className="text-xs font-medium text-slate-400">Próximamente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Pronto podrás ver cuántas personas están mirando tu perfil profesional.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CalendarCheck2 className="h-4 w-4 text-emerald-500" />
              Citas completadas (últimos 30 días)
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {last30Completed}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Total de sesiones marcadas como completadas en el último mes.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              Pacientes distintos atendidos
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {uniquePatients}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Número de pacientes únicos que han tenido al menos una cita contigo en el último año.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-600" />
            Actividad de citas (últimos 30 días)
          </CardTitle>
          <CardDescription>
            Vista rápida de cuántas citas completas has tenido cada día.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {last30Days.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aún no hay citas registradas. Cuando empieces a atender pacientes verás aquí tu actividad diaria.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3 text-xs">
              {last30Days.map(({ date, completed }) => (
                <div
                  key={date}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 flex flex-col gap-1"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {new Date(date).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
                  </span>
                  <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {completed}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400">
                    citas
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
