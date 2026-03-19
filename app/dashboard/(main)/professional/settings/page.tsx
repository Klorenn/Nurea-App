import { redirect } from "next/navigation"

export default function ProfessionalSettingsPage() {
  // Esta ruta queda como alias legado: redirigimos siempre al nuevo editor unificado.
  redirect("/dashboard/professional/profile")
}
