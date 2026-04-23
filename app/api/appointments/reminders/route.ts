import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAppointmentReminder } from "@/lib/email-service";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

/**
 * GET/POST /api/appointments/reminders
 *
 * Envía recordatorios por email para citas confirmadas en las próximas 24–25 h.
 * Para cron (Vercel, etc.): llamar con header Authorization: Bearer <CRON_SECRET>.
 *
 * Vercel crons (vercel.json):
 *   { "path": "/api/appointments/reminders", "schedule": "0 8 * * *" }
 */
async function handler(request: Request) {
  const startTime = Date.now();
  const cronId = `reminders-${Date.now()}`;

  if (process.env.NODE_ENV === "production") {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const appointments = await prisma.appointment.findMany({
      where: {
        status: "confirmed",
        slot: {
          startTime: {
            gte: in24h,
            lte: in25h,
          },
        },
      },
      include: {
        slot: true,
        professional: true,
      },
      orderBy: { slot: { startTime: "asc" } },
    });

    if (appointments.length === 0) {
      return NextResponse.json({
        success: true,
        remindersSent: 0,
        durationMs: Date.now() - startTime,
      });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";
    const patientPortalLink = `${baseUrl}/dashboard/patient`;

    let remindersSent = 0;
    let remindersFailed = 0;

    for (const appt of appointments) {
      try {
        const appointmentDate = format(appt.slot.startTime, "EEEE d 'de' MMMM yyyy", { locale: es });
        const appointmentTime = format(appt.slot.startTime, "HH:mm");

        const result = await sendAppointmentReminder({
          appointmentId: appt.id,
          to: appt.patientEmail,
          userName: appt.patientName.trim() || "Paciente",
          professionalName: appt.professional.name,
          appointmentDate,
          appointmentTime,
          patientPortalLink,
        });

        if (result.success) {
          remindersSent++;
        } else {
          remindersFailed++;
          console.error(`[CRON ${cronId}] Reminder failed for ${appt.id}:`, result.error);
        }
      } catch (err) {
        remindersFailed++;
        console.error(`[CRON ${cronId}] Error sending reminder for ${appt.id}:`, err);
      }
    }

    const durationMs = Date.now() - startTime;
    return NextResponse.json({
      success: true,
      remindersSent,
      remindersFailed,
      totalProcessed: appointments.length,
      durationMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[CRON ${cronId}] Fatal error:`, error);
    return NextResponse.json(
      {
        error: "server_error",
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export const GET = handler;
export const POST = handler;
