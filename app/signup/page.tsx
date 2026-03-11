import { redirect } from "next/navigation"

export default function SignupRedirectPage() {
  // Ruta legacy de /signup: redirige al flujo de registro de pacientes.
  redirect("/auth/register?role=patient")
}

