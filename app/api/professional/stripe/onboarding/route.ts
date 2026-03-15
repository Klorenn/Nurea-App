import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured")
  return new Stripe(key, { apiVersion: "2024-12-18.acacia" as any })
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    // Get professional data
    const { data: professional, error: proError } = await supabase
      .from('professionals')
      .select('id, stripe_account_id, profile:profiles!professionals_id_fkey(email, first_name, last_name)')
      .eq('id', user.id)
      .single()

    if (proError || !professional) {
      return NextResponse.json({ error: 'professional_not_found' }, { status: 404 })
    }

    const stripe = getStripeClient()
    let stripeAccountId = professional.stripe_account_id

    // Create Stripe account if it doesn't exist
    if (!stripeAccountId) {
      const proProfile = professional.profile as any
      const account = await stripe.accounts.create({
        type: 'express',
        email: proProfile?.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        individual: {
          first_name: proProfile?.first_name,
          last_name: proProfile?.last_name,
        },
        metadata: {
          professionalId: professional.id,
        }
      })
      
      stripeAccountId = account.id

      // Save stripe_account_id to database
      await supabase
        .from('professionals')
        .update({ stripe_account_id: stripeAccountId })
        .eq('id', professional.id)
    }

    // Create account link for onboarding
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/dashboard/professional/payouts?refresh=true`,
      return_url: `${baseUrl}/dashboard/professional/payouts?success=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Stripe onboarding error:', error)
    return NextResponse.json({ error: 'server_error', message: 'Error al iniciar onboarding de Stripe' }, { status: 500 })
  }
}
