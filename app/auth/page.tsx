import { redirect } from "next/navigation"

// Ruta legacy: antes servía un selector de rol con framer-motion.
// Ahora el onboarding se maneja dentro de /signup (y /signup?role=pro).
export default function AuthLegacyPage() {
  redirect("/login")
}
