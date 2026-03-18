import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { normalizeAvailability } from "@/lib/utils/availability-helpers"

/**
 * GET /api/professionals/[id]/slots?date=YYYY-MM-DD
 * [id] = Supabase professional UUID (profiles.id o professionals.id).
 * Resuelve a Prisma professional por supabaseUserId; si no existe, devuelve slots de demo.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: supabaseId } = await context.params
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")

    if (!dateParam) {
      return NextResponse.json({ error: "Missing date" }, { status: 400 })
    }

    const supabase = await createClient()

    // Single source of truth: professionals.availability in Supabase.
    const { data: professional, error: profError } = await supabase
      .from("professionals")
      .select("id, availability, consultation_type")
      .eq("id", supabaseId)
      .single()

    if (profError || !professional) {
      return NextResponse.json({ slots: [] })
    }

    const availabilityRaw = professional.availability as any
    const consultationType = (professional.consultation_type ?? "both") as
      | "online"
      | "in-person"
      | "both"

    const normalizedAvailability = normalizeAvailability(availabilityRaw, consultationType)

    // JS: 0..6 => sunday..saturday; editor uses the same keys.
    const targetDate = new Date(`${dateParam}T00:00:00`)
    const dayOfWeek = targetDate.getDay()
    const dayKeyMap: Record<
      number,
      "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"
    > = {
      0: "sunday",
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday",
    }
    const dayKey = dayKeyMap[dayOfWeek]

    const dayData = (availabilityRaw && availabilityRaw[dayKey]) || null
    if (!dayData) return NextResponse.json({ slots: [] })

    const durationMin = Number(dayData.slotDuration ?? 60)
    if (!Number.isFinite(durationMin) || durationMin <= 0) {
      return NextResponse.json({ slots: [] })
    }

    const parseTimeToMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number)
      return h * 60 + m
    }

    const ranges: Array<{ start: string; end: string }> = []
    const addRangeIf = (type: "online" | "in-person") => {
      if (consultationType === "online" && type !== "online") return
      if (consultationType === "in-person" && type !== "in-person") return

      const dayType = normalizedAvailability?.[dayKey]?.[type]
      const hours = dayType?.available ? (dayType?.hours as string | null) : null
      if (!hours) return

      const [startTime, endTime] = hours.split(" - ").map((s: string) => s.trim())
      if (!startTime || !endTime) return
      ranges.push({ start: startTime, end: endTime })
    }

    addRangeIf("online")
    addRangeIf("in-person")

    if (ranges.length === 0) return NextResponse.json({ slots: [] })

    // Existing appointments => slot availability
    const { data: existingAppointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("appointment_time, duration_minutes")
      .eq("professional_id", supabaseId)
      .eq("appointment_date", dateParam)
      .in("status", ["pending", "confirmed"])

    if (appointmentsError) {
      console.error("Error in slots availability appointments query:", appointmentsError)
    }

    const existing = (existingAppointments || []).map((apt: any) => {
      const startMinutes = parseTimeToMinutes(apt.appointment_time)
      const dur = Number(apt.duration_minutes) || 60
      return { startMinutes, endMinutes: startMinutes + dur }
    })

    const overlaps = (slotStart: number, slotEnd: number) => {
      return existing.some((a) => slotStart < a.endMinutes && slotEnd > a.startMinutes)
    }

    const now = new Date()

    // Generate start times using the per-day slotDuration.
    const uniqueStartTimes = new Set<string>()
    for (const r of ranges) {
      const startMinutes = parseTimeToMinutes(r.start)
      const endMinutes = parseTimeToMinutes(r.end)

      for (let cur = startMinutes; cur + durationMin <= endMinutes; cur += durationMin) {
        const hh = Math.floor(cur / 60)
        const mm = cur % 60
        uniqueStartTimes.add(`${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`)
      }
    }

    const startTimesSorted = Array.from(uniqueStartTimes.values()).sort((a, b) => {
      return parseTimeToMinutes(a) - parseTimeToMinutes(b)
    })

    const slots = startTimesSorted
      .map((time) => {
        const slotStartMinutes = parseTimeToMinutes(time)
        const slotEndMinutes = slotStartMinutes + durationMin
        const available = !overlaps(slotStartMinutes, slotEndMinutes)
        return { time, available }
      })
      .filter((s) => {
        const startLocal = new Date(`${dateParam}T${s.time}:00`)
        return startLocal.getTime() >= now.getTime()
      })
      .filter((s) => s.available)
      .map((s) => {
        const startLocal = new Date(`${dateParam}T${s.time}:00`)
        const endLocal = new Date(startLocal.getTime() + durationMin * 60 * 1000)
        return {
          startTime: startLocal.toISOString(),
          endTime: endLocal.toISOString(),
        }
      })

    return NextResponse.json({ slots })
  } catch (error) {
    console.error("Error in GET /api/professionals/[id]/slots", error)
    return NextResponse.json(
      { slots: [], error: "Internal server error" },
      { status: 500 }
    )
  }
}
