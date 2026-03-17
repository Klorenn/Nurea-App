import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ message: 'Route disabled. Nurea uses Mercado Pago for subscriptions.' }, { status: 404 })
}
