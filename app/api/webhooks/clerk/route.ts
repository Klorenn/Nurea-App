import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const svix_id = req.headers.get('svix-id')
  const svix_timestamp = req.headers.get('svix-timestamp')
  const svix_signature = req.headers.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    )
  }

  const body = await req.text()

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    )
  }

  // Handle user.created event
  if (evt.type === 'user.created') {
    const { id, first_name, last_name, email_addresses, unsafe_metadata } = evt.data

    const userType = (unsafe_metadata?.userType as string) || 'patient'
    const dateOfBirth = (unsafe_metadata?.dateOfBirth as string) || null

    try {
      // Create profile in Supabase
      const { error: profileError } = await supabase.from('profiles').insert({
        id,
        first_name: first_name || '',
        last_name: last_name || '',
        role: userType === 'profesional' ? 'professional' : 'patient',
        date_of_birth: dateOfBirth,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error('Failed to create profile:', profileError)
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        )
      }

      // If user is professional, create professional profile entry
      if (userType === 'profesional') {
        const { error: profError } = await supabase.from('professionals').insert({
          id,
          specialty: '',
          bio: '',
          consultation_type: 'online',
          consultation_price: 0,
          online_price: 0,
          in_person_price: 0,
          availability: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profError) {
          console.error('Failed to create professional profile:', profError)
        }
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Webhook error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ success: true })
}
