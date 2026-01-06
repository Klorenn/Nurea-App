import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { hasAnyAvailability } from '@/lib/utils/availability-helpers'

/**
 * GET /api/professional/onboarding/status
 * Check if onboarding is complete and what fields are missing
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para ver tu estado de onboarding.'
        },
        { status: 401 }
      )
    }

    // Verify that the user is a professional
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'professional') {
      return NextResponse.json(
        { 
          error: 'forbidden',
          message: 'Solo los profesionales pueden acceder a esta información.'
        },
        { status: 403 }
      )
    }

    // Get professional data - use maybeSingle() to handle missing records gracefully
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    // If professional record doesn't exist, treat as incomplete onboarding
    if (professionalError || !professional) {
      // Return incomplete status with all fields missing
      return NextResponse.json({
        success: true,
        isComplete: false,
        missingFields: ['specialty', 'bio', 'consultation_type', 'online_price', 'in_person_price', 'availability', 'bank_account', 'bank_name', 'registration_number', 'registration_institution'],
        professional: {
          specialty: '',
          bio: '',
          consultationType: '',
          onlinePrice: 0,
          inPersonPrice: 0,
          availability: {},
          bankAccount: '',
          bankName: '',
          registrationNumber: '',
          registrationInstitution: '',
        }
      })
    }

    // Check which critical fields are missing
    const missingFields: string[] = []
    
    if (!professional.specialty || (typeof professional.specialty === 'string' && professional.specialty.trim() === '')) {
      missingFields.push('specialty')
    }
    
    if (!professional.bio || (typeof professional.bio === 'string' && professional.bio.trim() === '')) {
      missingFields.push('bio')
    }
    
    if (!professional.consultation_type || (typeof professional.consultation_type === 'string' && professional.consultation_type === '')) {
      missingFields.push('consultation_type')
    }
    
    // Check prices based on consultation type
    const consultationType = professional.consultation_type || 'both'
    if (consultationType === 'online' || consultationType === 'both') {
      if (!professional.online_price || professional.online_price === 0) {
        missingFields.push('online_price')
      }
    }
    if (consultationType === 'in-person' || consultationType === 'both') {
      if (!professional.in_person_price || professional.in_person_price === 0) {
        missingFields.push('in_person_price')
      }
    }
    
    // Check availability - at least one day must be available (soporta formato antiguo y nuevo)
    const availability = professional.availability || {}
    const hasAvailability = hasAnyAvailability(availability, consultationType || 'both')
    if (!hasAvailability) {
      missingFields.push('availability')
    }
    
    if (!professional.bank_account || (typeof professional.bank_account === 'string' && professional.bank_account.trim() === '')) {
      missingFields.push('bank_account')
    }
    
    if (!professional.bank_name || (typeof professional.bank_name === 'string' && professional.bank_name.trim() === '')) {
      missingFields.push('bank_name')
    }
    
    if (!professional.registration_number || (typeof professional.registration_number === 'string' && professional.registration_number.trim() === '')) {
      missingFields.push('registration_number')
    }
    
    if (!professional.registration_institution || (typeof professional.registration_institution === 'string' && professional.registration_institution.trim() === '')) {
      missingFields.push('registration_institution')
    }

    const isComplete = missingFields.length === 0

    return NextResponse.json({
      success: true,
      isComplete,
      missingFields,
      professional: {
        specialty: professional.specialty || '',
        bio: professional.bio || '',
        consultationType: professional.consultation_type || '',
        onlinePrice: professional.online_price || 0,
        inPersonPrice: professional.in_person_price || 0,
        availability: professional.availability || {},
        bankAccount: professional.bank_account || '',
        bankName: professional.bank_name || '',
        registrationNumber: professional.registration_number || '',
        registrationInstitution: professional.registration_institution || '',
      }
    })
  } catch (error) {
    console.error('Get onboarding status error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/professional/onboarding
 * Save onboarding data (can be called multiple times as user progresses)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para guardar tu información.'
        },
        { status: 401 }
      )
    }

    // Verify that the user is a professional
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'professional') {
      return NextResponse.json(
        { 
          error: 'forbidden',
          message: 'Solo los profesionales pueden actualizar esta información.'
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      specialty,
      bio,
      bioExtended,
      services,
      languages,
      consultationType,
      onlinePrice,
      inPersonPrice,
      videoPlatform,
      clinicAddress,
      availability,
      bankAccount,
      bankName,
      registrationNumber,
      registrationInstitution,
      location,
      yearsExperience,
    } = body

    // Prepare update object
    const professionalUpdate: any = {
      updated_at: new Date().toISOString(),
    }

    if (specialty !== undefined) professionalUpdate.specialty = specialty
    if (bio !== undefined) professionalUpdate.bio = bio
    if (bioExtended !== undefined) professionalUpdate.bio_extended = bioExtended
    if (services !== undefined) professionalUpdate.services = services
    if (languages !== undefined) professionalUpdate.languages = languages
    if (consultationType !== undefined) professionalUpdate.consultation_type = consultationType
    if (onlinePrice !== undefined) professionalUpdate.online_price = onlinePrice
    if (inPersonPrice !== undefined) professionalUpdate.in_person_price = inPersonPrice
    if (videoPlatform !== undefined) professionalUpdate.video_platform = videoPlatform
    if (clinicAddress !== undefined) professionalUpdate.clinic_address = clinicAddress
    if (availability !== undefined) professionalUpdate.availability = availability
    if (bankAccount !== undefined) professionalUpdate.bank_account = bankAccount
    if (bankName !== undefined) professionalUpdate.bank_name = bankName
    if (registrationNumber !== undefined) professionalUpdate.registration_number = registrationNumber
    if (registrationInstitution !== undefined) professionalUpdate.registration_institution = registrationInstitution
    if (location !== undefined) professionalUpdate.location = location
    if (yearsExperience !== undefined) professionalUpdate.years_experience = yearsExperience

    // If updating prices, also update consultation_price as fallback
    if (onlinePrice !== undefined || inPersonPrice !== undefined) {
      professionalUpdate.consultation_price = onlinePrice || inPersonPrice || 0
    }

    // Check if professional record exists, if not create it
    const { data: existingProfessional } = await supabase
      .from('professionals')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    let updatedProfessional
    let professionalError

    if (!existingProfessional) {
      // Create professional record if it doesn't exist
      const { data: newProfessional, error: createError } = await supabase
        .from('professionals')
        .insert({
          id: user.id,
          ...professionalUpdate,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      updatedProfessional = newProfessional
      professionalError = createError
    } else {
      // Update existing professional record
      const { data: updated, error: updateError } = await supabase
        .from('professionals')
        .update(professionalUpdate)
        .eq('id', user.id)
        .select()
        .single()
      
      updatedProfessional = updated
      professionalError = updateError
    }

    if (professionalError || !updatedProfessional) {
      console.error('Error saving professional:', professionalError)
      return NextResponse.json(
        { 
          error: 'update_failed',
          message: 'No pudimos guardar tu información. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Check if onboarding is now complete
    const missingFields: string[] = []
    
    if (!updatedProfessional.specialty || updatedProfessional.specialty.trim() === '') {
      missingFields.push('specialty')
    }
    if (!updatedProfessional.bio || updatedProfessional.bio.trim() === '') {
      missingFields.push('bio')
    }
    if (!updatedProfessional.consultation_type || updatedProfessional.consultation_type === '') {
      missingFields.push('consultation_type')
    }
    
    const consultationTypeCheck = updatedProfessional.consultation_type || 'both'
    if (consultationTypeCheck === 'online' || consultationTypeCheck === 'both') {
      if (!updatedProfessional.online_price || updatedProfessional.online_price === 0) {
        missingFields.push('online_price')
      }
    }
    if (consultationTypeCheck === 'in-person' || consultationTypeCheck === 'both') {
      if (!updatedProfessional.in_person_price || updatedProfessional.in_person_price === 0) {
        missingFields.push('in_person_price')
      }
    }
    
    // Check availability - at least one day must be available (soporta formato antiguo y nuevo)
    const availabilityCheck = updatedProfessional.availability || {}
    const hasAvailability = hasAnyAvailability(availabilityCheck, consultationTypeCheck || 'both')
    if (!hasAvailability) {
      missingFields.push('availability')
    }
    
    if (!updatedProfessional.bank_account || updatedProfessional.bank_account.trim() === '') {
      missingFields.push('bank_account')
    }
    if (!updatedProfessional.bank_name || updatedProfessional.bank_name.trim() === '') {
      missingFields.push('bank_name')
    }
    if (!updatedProfessional.registration_number || updatedProfessional.registration_number.trim() === '') {
      missingFields.push('registration_number')
    }
    if (!updatedProfessional.registration_institution || updatedProfessional.registration_institution.trim() === '') {
      missingFields.push('registration_institution')
    }

    const isComplete = missingFields.length === 0

    return NextResponse.json({
      success: true,
      message: 'Información guardada exitosamente.',
      isComplete,
      missingFields,
      professional: updatedProfessional
    })
  } catch (error) {
    console.error('Save onboarding error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

