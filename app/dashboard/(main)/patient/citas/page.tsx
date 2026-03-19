import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  // Prisma todavía no está conectado a la misma base que Supabase,
  // así que por ahora mostramos la página sin intentar leer citas.
  const appointments: any[] = [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Mis citas</h1>
      <PatientAppointments appointments={appointments} />
    </div>
  );
}
