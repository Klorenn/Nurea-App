import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured")
  return new Stripe(key, { apiVersion: "2024-12-18.acacia" as any })
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { data: professional, error: proError } = await supabase
      .from('professionals')
      .select('stripe_account_id, payouts_enabled')
      .eq('id', user.id)
      .single()

    if (proError || !professional || !professional.stripe_account_id) {
      return NextResponse.json({ 
        isConnected: false,
        payoutsEnabled: false
      })
    }

    const stripe = getStripeClient()
    const account = await stripe.accounts.retrieve(professional.stripe_account_id)
    
    // Update local state if payouts_enabled changed on Stripe
    if (account.payouts_enabled !== professional.payouts_enabled) {
      await supabase
        .from('professionals')
        .update({ payouts_enabled: account.payouts_enabled })
        .eq('id', user.id)
    }

    const balance = await stripe.balance.retrieve({
      stripeAccount: professional.stripe_account_id
    })

    return NextResponse.json({
      isConnected: true,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      balance: {
        available: balance.available,
        pending: balance.pending
      },
      accountEmail: account.email,
      id: account.id
    })
  } catch (error) {
    console.error('Fetch Stripe account error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
