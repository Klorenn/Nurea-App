import "dotenv/config"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendVerificationLink } from "@/lib/email-service"

async function main() {
  const testEmail = "kohcuendepau@gmail.com"
  const resendKey = "re_RczfygD7_HzS429S5hgQqB6WebZkv4ip4"

  process.env.RESEND_API_KEY = resendKey

  console.log("📧 Iniciando prueba de envío para:", testEmail)

  try {
    const supabase = createAdminClient()

    const { data, error: linkError } = await supabase.auth.admin.generateLink({
      type: "signup",
      email: testEmail,
      password: "Password123!",
      options: { redirectTo: "https://nurea.app/verify" },
    })

    if (linkError) throw linkError

    const actionLink =
      (data as any)?.properties?.action_link ?? (data as any)?.action_link
    if (!actionLink) {
      throw new Error("No se encontró action_link en la respuesta de generateLink.")
    }

    const result = await sendVerificationLink({
      to: testEmail,
      userName: "Pau Koh",
      verificationLink: actionLink,
    })

    if (result.success) {
      console.log("✅ ¡Correo enviado con éxito! Revisa tu bandeja de entrada.")
    } else {
      console.error("❌ Error en Resend:", result.error)
      process.exit(1)
    }
  } catch (err) {
    console.error("❌ Error inesperado:", err)
    process.exit(1)
  }
}

main()
