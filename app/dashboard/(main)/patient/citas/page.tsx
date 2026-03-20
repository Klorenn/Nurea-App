import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PatientCitasPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    redirect("/login");
  }

  redirect("/dashboard/appointments");
}
