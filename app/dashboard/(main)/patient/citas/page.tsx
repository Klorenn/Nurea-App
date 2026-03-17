import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import PatientAppointments from "../PatientAppointments";

export default async function PatientCitasPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    redirect("/login");
  }

  const appointments = await prisma.appointment.findMany({
    where: { patientEmail: user.email },
    include: { slot: true, professional: true, review: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Mis citas</h1>
      <PatientAppointments appointments={appointments} />
    </div>
  );
}
