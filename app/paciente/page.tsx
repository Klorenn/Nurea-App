import { redirect } from "next/navigation";

export default function PacienteRedirect() {
  redirect("/dashboard/patient");
}
