import { redirect } from "next/navigation"

// Ruta legacy del login "smokey" (fondo con nubes + teal).
// Reemplazada por /login con el nuevo rediseño Nurea.
export default function SmokeyLegacyPage() {
  redirect("/login")
}
