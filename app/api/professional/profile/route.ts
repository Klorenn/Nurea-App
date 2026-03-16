import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/professional/profile
 * Obtiene el perfil completo del profesional actual
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para ver tu perfil.'
        },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea profesional
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

    // Obtener datos del profesional
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select(`
        *,
        profile:profiles!professionals_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url,
          phone,
          email
        )
      `)
      .eq('id', user.id)
      .single()

    if (professionalError) {
      console.error('Error fetching professional profile:', professionalError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos obtener tu perfil. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Formatear respuesta
    const formattedProfile = {
      // Información básica
      firstName: professional.profile?.first_name || '',
      lastName: professional.profile?.last_name || '',
      title: professional.specialty || '',
      bio: professional.bio || '',
      bioExtended: professional.bio_extended || '',
      avatarUrl: professional.profile?.avatar_url || '',
      
      // Especialidades y servicios
      specialties: professional.services || [],
      languages: professional.languages || [],
      
      // Consultas y precios
      consultationType: professional.consultation_type || 'both',
      onlinePrice: professional.online_price || professional.consultation_price || 0,
      inPersonPrice: professional.in_person_price || professional.consultation_price || 0,
      videoPlatform: professional.video_platform || 'google-meet',
      clinicAddress: professional.clinic_address || professional.location || '',
      
      // Disponibilidad
      availability: professional.availability || {},
      
      // Configuración de pago
      bankAccount: professional.bank_account || '',
      bankName: professional.bank_name || '',
      
      // Registro profesional
      registrationNumber: professional.registration_number || '',
      registrationInstitution: professional.registration_institution || '',
      
      // Metadatos
      location: professional.location || '',
      yearsExperience: professional.years_experience || 0,
    }

    return NextResponse.json({
      success: true,
      profile: formattedProfile
    })
  } catch (error) {
    console.error('Get professional profile error:', error)
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
 * PUT /api/professional/profile
 * Actualiza el perfil del profesional
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para actualizar tu perfil.'
        },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea profesional
    const { data: currentProfessional } = await supabase
      .from('professionals')
      .select('*, profile:profiles!professionals_id_fkey(first_name, last_name, role)')
      .eq('id', user.id)
      .single()

    const role = Array.isArray(currentProfessional?.profile) ? currentProfessional?.profile[0]?.role : currentProfessional?.profile?.role

    if (role !== 'professional') {
      return NextResponse.json(
        { 
          error: 'forbidden',
          message: 'Solo los profesionales pueden actualizar su perfil.'
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      title,
      bio,
      bioExtended,
      specialties,
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

    // Actualizar perfil en tabla profiles
    if (firstName !== undefined || lastName !== undefined) {
      const profileUpdate: any = {
        updated_at: new Date().toISOString(),
      }
      
      if (firstName !== undefined && firstName !== null && firstName.trim() !== '') {
        profileUpdate.first_name = firstName.trim()
      }
      if (lastName !== undefined && lastName !== null && lastName.trim() !== '') {
        profileUpdate.last_name = lastName.trim()
      }

      if (Object.keys(profileUpdate).length > 1) { // More than just updated_at
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', user.id)

        if (profileError) {
          console.error('Error updating profile:', profileError)
          // Log but don't fail - profile update is secondary to professional update
        }
      }
    }

    // Preparar datos para actualizar tabla professionals (solo campos definidos y no nulos)
    const professionalUpdate: any = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined && title !== null) professionalUpdate.specialty = title.trim() || null
    if (bio !== undefined && bio !== null) professionalUpdate.bio = bio.trim() || null
    if (bioExtended !== undefined && bioExtended !== null) professionalUpdate.bio_extended = bioExtended.trim() || null
    if (specialties !== undefined && specialties !== null) professionalUpdate.services = Array.isArray(specialties) ? specialties : []
    if (languages !== undefined && languages !== null) professionalUpdate.languages = Array.isArray(languages) ? languages : []
    if (consultationType !== undefined && consultationType !== null) professionalUpdate.consultation_type = consultationType
    if (onlinePrice !== undefined && onlinePrice !== null) professionalUpdate.online_price = typeof onlinePrice === 'number' ? onlinePrice : parseFloat(onlinePrice) || null
    if (inPersonPrice !== undefined && inPersonPrice !== null) professionalUpdate.in_person_price = typeof inPersonPrice === 'number' ? inPersonPrice : parseFloat(inPersonPrice) || null
    if (videoPlatform !== undefined && videoPlatform !== null) professionalUpdate.video_platform = videoPlatform.trim() || null
    if (clinicAddress !== undefined && clinicAddress !== null) professionalUpdate.clinic_address = clinicAddress.trim() || null
    if (availability !== undefined && availability !== null) professionalUpdate.availability = availability
    if (bankAccount !== undefined && bankAccount !== null) professionalUpdate.bank_account = bankAccount.trim() || null
    if (bankName !== undefined && bankName !== null) professionalUpdate.bank_name = bankName.trim() || null
    if (registrationNumber !== undefined && registrationNumber !== null) professionalUpdate.registration_number = registrationNumber.trim() || null
    if (registrationInstitution !== undefined && registrationInstitution !== null) professionalUpdate.registration_institution = registrationInstitution.trim() || null
    if (location !== undefined && location !== null) professionalUpdate.location = location.trim() || null
    if (yearsExperience !== undefined && yearsExperience !== null) professionalUpdate.years_experience = typeof yearsExperience === 'number' ? yearsExperience : parseInt(yearsExperience) || null

    // 🛡️ Lógica de Sello de Verificación: Romper sello si cambian datos críticos
    let sealBroken = false;
    let securityAlertTriggered = false;
    
    // Comparar valores nuevos con los actuales
    if (currentProfessional?.verification_status === 'verified' || currentProfessional?.verified === true) {
      const currentFirstName = Array.isArray(currentProfessional?.profile) ? currentProfessional.profile[0]?.first_name : currentProfessional?.profile?.first_name;
      const currentLastName = Array.isArray(currentProfessional?.profile) ? currentProfessional.profile[0]?.last_name : currentProfessional?.profile?.last_name;
      
      const changedFirstName = firstName !== undefined && firstName.trim() !== currentFirstName;
      const changedLastName = lastName !== undefined && lastName.trim() !== currentLastName;
      const changedSpecialty = title !== undefined && title.trim() !== currentProfessional?.specialty;
      const changedRnpi = registrationNumber !== undefined && registrationNumber.trim() !== currentProfessional?.registration_number;

      if (changedFirstName || changedLastName || changedSpecialty || changedRnpi) {
        sealBroken = true;
        professionalUpdate.verification_status = 'pending'; // In the DB this triggers verified=false
        professionalUpdate.verified = false;
        securityAlertTriggered = true;
        // In theory we should set is_public to false, but the schema doesn't have is_public 
        // We rely on verified=false to hide them in public directories.
      }
    }

    // Si se actualiza el precio online o presencial, también actualizar consultation_price como fallback
    if (onlinePrice !== undefined || inPersonPrice !== undefined) {
      const fallbackPrice = onlinePrice || inPersonPrice
      if (fallbackPrice !== undefined && fallbackPrice !== null) {
        professionalUpdate.consultation_price = typeof fallbackPrice === 'number' ? fallbackPrice : parseFloat(fallbackPrice) || 0
      }
    }

    // Actualizar profesional
    const { data: updatedProfessional, error: professionalError } = await supabase
      .from('professionals')
      .update(professionalUpdate)
      .eq('id', user.id)
      .select()
      .single()

    if (professionalError) {
      console.error('Error updating professional:', professionalError)
      return NextResponse.json(
        { 
          error: 'update_failed',
          message: 'No pudimos actualizar tu perfil. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Si se rompió el sello, enviar alerta de seguridad al Admin Notification Center
    if (securityAlertTriggered) {
      const currentFirstName = Array.isArray(currentProfessional?.profile) ? currentProfessional.profile[0]?.first_name : currentProfessional?.profile?.first_name;
      const currentLastName = Array.isArray(currentProfessional?.profile) ? currentProfessional.profile[0]?.last_name : currentProfessional?.profile?.last_name;
      const doctorName = `${currentFirstName || ''} ${currentLastName || ''}`.trim() || 'Especialista';
      
      try {
        await supabase.from('admin_notifications').insert({
          type: 'SECURITY_ALERT',
          message: `⚠️ Alerta Crítica: El Dr. ${doctorName} modificó datos críticos (RNPI, Especialidad o Nombre) y su perfil fue bloqueado automáticamente. Ha vuelto a estado pendiente.`,
          professional_id: user.id,
          is_read: false
        });
        
        // Llamar endpoint para notificar admin por email
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        fetch(`${siteUrl}/api/admin/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ professionalId: user.id, doctorName })
        }).catch(err => console.error("Error sending admin email notification", err));
        
      } catch (alertError) {
        console.error('Error creating security alert:', alertError)
      }
    }

    return NextResponse.json({
      success: true,
      message: sealBroken ? 'Perfil actualizado. Alerta: Has modificado datos críticos. Tu cuenta está en revisión y ha sido temporalmente ocultada.' : 'Perfil actualizado exitosamente.',
      sealBroken,
      profile: updatedProfessional
    })
  } catch (error) {
    console.error('Update professional profile error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

