import { Resend } from "resend"

const apiKey = process.env.RESEND_API_KEY

/**
 * Shared Resend client. Uses RESEND_API_KEY from env.
 * Replace `re_xxxxxxxxx` in .env.local with your real API key from https://resend.com/api-keys
 */
function getResend(): Resend {
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to .env.local (get your key at https://resend.com/api-keys)."
    )
  }
  return new Resend(apiKey)
}

/** Default "from" address; override with EMAIL_FROM in production (e.g. NUREA <noreply@tudominio.com>) */
const DEFAULT_FROM = process.env.EMAIL_FROM ?? "NUREA <onboarding@resend.dev>"

export { getResend, DEFAULT_FROM }
