import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Wait a bit for the trigger to potentially run first
      await new Promise(resolve => setTimeout(resolve, 500))

      // Check if this is a new user (first time login with Google)
      let { data: profile } = await supabase
        .from('profiles')
        .select('date_of_birth, email_verified')
        .eq('id', data.user.id)
        .single()

      // If profile doesn't exist, create it manually
      if (!profile) {
        const userMetadata = data.user.user_metadata || {}
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            first_name: userMetadata.first_name || userMetadata.full_name?.split(' ')[0] || '',
            last_name: userMetadata.last_name || userMetadata.full_name?.split(' ').slice(1).join(' ') || '',
            role: userMetadata.role || 'patient',
            email_verified: data.user.email_confirmed_at !== null,
          })

        if (!profileError) {
          // Fetch the newly created profile
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('date_of_birth, email_verified')
            .eq('id', data.user.id)
            .single()
          profile = newProfile
        } else {
          console.error('Profile creation error in callback:', profileError)
        }
      }

      // Check if email is verified
      const emailVerified = data.user.email_confirmed_at !== null

      // Check if profile is complete
      const profileComplete = profile?.date_of_birth && emailVerified

      // Obtener el rol del usuario para redirección correcta
      const { data: roleData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const userRole = roleData?.role || 'patient'

      // Determine redirect destination
      let redirectPath = next
      
      if (!profileComplete) {
        // Redirect to complete profile page
        redirectPath = '/complete-profile'
      } else if (!emailVerified) {
        // Redirect to email verification page
        redirectPath = '/verify-email'
      } else {
        // Redirigir según el rol
        if (userRole === 'professional') {
          // Check if onboarding is complete by checking professional record
          // Use maybeSingle() to handle missing records gracefully
          const { data: professional, error: professionalError } = await supabase
            .from('professionals')
            .select('specialty, bio, consultation_type, online_price, in_person_price, availability, bank_account, bank_name, registration_number, registration_institution')
            .eq('id', data.user.id)
            .maybeSingle()

          // If professional record doesn't exist or there's an error, redirect to onboarding
          if (professionalError || !professional) {
            redirectPath = '/professional/onboarding'
          } else {
            // Check critical fields
            const hasSpecialty = professional.specialty && typeof professional.specialty === 'string' && professional.specialty.trim() !== ''
            const hasBio = professional.bio && typeof professional.bio === 'string' && professional.bio.trim() !== ''
            const hasConsultationType = professional.consultation_type && typeof professional.consultation_type === 'string' && professional.consultation_type !== ''
            const consultationType = professional.consultation_type || 'both'
            const hasOnlinePrice = consultationType === 'online' || consultationType === 'both' 
              ? (professional.online_price && professional.online_price > 0) 
              : true
            const hasInPersonPrice = consultationType === 'in-person' || consultationType === 'both'
              ? (professional.in_person_price && professional.in_person_price > 0)
              : true
            const availability = professional.availability || {}
            const hasAvailability = Object.keys(availability).some((day: string) => {
              const dayData = availability[day]
              return dayData?.available === true && dayData?.hours && typeof dayData.hours === 'string' && dayData.hours.trim() !== ''
            })
            const hasBankAccount = professional.bank_account && typeof professional.bank_account === 'string' && professional.bank_account.trim() !== ''
            const hasBankName = professional.bank_name && typeof professional.bank_name === 'string' && professional.bank_name.trim() !== ''
            const hasRegistrationNumber = professional.registration_number && typeof professional.registration_number === 'string' && professional.registration_number.trim() !== ''
            const hasRegistrationInstitution = professional.registration_institution && typeof professional.registration_institution === 'string' && professional.registration_institution.trim() !== ''

            const isComplete = hasSpecialty && hasBio && hasConsultationType && hasOnlinePrice && 
                              hasInPersonPrice && hasAvailability && hasBankAccount && 
                              hasBankName && hasRegistrationNumber && hasRegistrationInstitution

            if (isComplete) {
              redirectPath = '/professional/dashboard'
            } else {
              redirectPath = '/professional/onboarding'
            }
          }
        } else if (userRole === 'admin') {
          redirectPath = '/admin'
        } else {
          redirectPath = '/dashboard'
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

