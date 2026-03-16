import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ message: 'Route disabled. Nurea now uses RevenueCat + Stellar.' }, { status: 404 })
}
