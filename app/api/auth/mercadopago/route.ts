import { NextResponse } from "next/server"

/**
 * This endpoint previously handled MercadoPago marketplace OAuth for split payments.
 * NUREA no longer processes patient-to-doctor payments.
 * Professionals subscribe to NUREA directly via MercadoPago pre-approvals.
 */
export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/dashboard/professional/payments", request.url))
}
