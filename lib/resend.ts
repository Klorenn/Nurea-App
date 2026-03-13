import { Resend } from "resend"

const apiKey = process.env.RESEND_API_KEY

const MAX_IDEMPOTENCY_KEY_LENGTH = 256
const RETRY_MAX = 3
const RETRY_DELAYS_MS = [1000, 2000, 4000]

/**
 * Build idempotency key: `<event-type>/<entity-id>`. Max 256 chars (Resend limit).
 * Prevents duplicate emails when retrying failed requests.
 */
export function buildIdempotencyKey(eventType: string, entityId: string): string {
  const key = `${eventType}/${entityId}`.slice(0, MAX_IDEMPOTENCY_KEY_LENGTH)
  return key
}

/**
 * Resend error codes that should trigger a retry (429 rate limit, 500 server error).
 * Do NOT retry on 400, 401, 403, 409, 422.
 */
function isRetryableResendError(error: { statusCode?: number | null; name?: string } | null): boolean {
  if (!error) return false
  const code = error.statusCode
  const name = (error.name || "").toLowerCase()
  if (code === 429 || name === "rate_limit_exceeded") return true
  if (code === 500 || name === "application_error" || name === "internal_server_error") return true
  return false
}

/**
 * Send a single email with idempotency key and retry on 429/500 (exponential backoff).
 * Use for transactional emails. Same idempotency key is used on retries so Resend returns original response if the first attempt succeeded.
 */
export async function sendSingleWithRetry(
  resend: Resend,
  payload: Parameters<Resend["emails"]["send"]>[0],
  idempotencyKey: string
): Promise<ReturnType<Resend["emails"]["send"]>> {
  const key = idempotencyKey.slice(0, MAX_IDEMPOTENCY_KEY_LENGTH)
  let lastResult: Awaited<ReturnType<Resend["emails"]["send"]>> = { data: null, error: null, headers: null }

  for (let attempt = 0; attempt <= RETRY_MAX; attempt++) {
    lastResult = await resend.emails.send(payload, { idempotencyKey: key })

    if (!lastResult.error) return lastResult
    if (!isRetryableResendError(lastResult.error)) return lastResult
    if (attempt === RETRY_MAX) return lastResult

    const delayMs = RETRY_DELAYS_MS[attempt] ?? 4000
    await new Promise((r) => setTimeout(r, delayMs))
  }

  return lastResult
}

/**
 * Send a batch of emails (max 100) with idempotency key and retry on 429/500.
 * Format: batch-<event-type>/<batch-id>. No attachments or scheduling in batch.
 */
export async function sendBatchWithRetry(
  resend: Resend,
  payload: Parameters<Resend["batch"]["send"]>[0],
  idempotencyKey: string
): Promise<ReturnType<Resend["batch"]["send"]>> {
  const key = idempotencyKey.slice(0, MAX_IDEMPOTENCY_KEY_LENGTH)
  let lastResult: Awaited<ReturnType<Resend["batch"]["send"]>> = { data: null, error: null, headers: null }

  for (let attempt = 0; attempt <= RETRY_MAX; attempt++) {
    lastResult = await resend.batch.send(payload, { idempotencyKey: key })

    if (!lastResult.error) return lastResult
    if (!isRetryableResendError(lastResult.error)) return lastResult
    if (attempt === RETRY_MAX) return lastResult

    const delayMs = RETRY_DELAYS_MS[attempt] ?? 4000
    await new Promise((r) => setTimeout(r, delayMs))
  }

  return lastResult
}

/**
 * Shared Resend client. Uses RESEND_API_KEY from env.
 * Dominio verificado: nurea.app
 */
function getResend(): Resend {
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to .env.local (get your key at https://resend.com/api-keys)."
    )
  }
  return new Resend(apiKey)
}

export { getResend }
