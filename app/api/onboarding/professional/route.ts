import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      avatarUrl,
      phone,
      showPhone,
      professionalTitle,
      gender,
      specialtyId,
      registrationNumber,
      yearsExperience,
      bio,
      professionalSlogan,
      consultationType,
      onlinePrice,
      inPersonPrice,
      clinicAddress,
      nuraAiTone,
      referralCode,
    } = body

    // Verify role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'professional') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Solo los profesionales pueden usar este endpoint.' },
        { status: 403 }
      )
    }

    // Validate bio length
    if (bio && String(bio).trim().length < 100) {
      return NextResponse.json(
        { error: 'Validation', message: 'La biografía debe tener al menos 100 caracteres.' },
        { status: 400 }
      )
    }

    // Validate years of experience
    if (yearsExperience != null) {
      const yoe = Number(yearsExperience)
      if (isNaN(yoe) || yoe < 0 || yoe > 50) {
        return NextResponse.json(
          { error: 'Validation', message: 'Los años de experiencia deben estar entre 0 y 50.' },
          { status: 400 }
        )
      }
    }

    // Validate consultation type
    const validConsultationTypes = ['online', 'in_person', 'both']
    if (consultationType && !validConsultationTypes.includes(consultationType)) {
      return NextResponse.json(
        { error: 'Validation', message: 'Tipo de consulta inválido.' },
        { status: 400 }
      )
    }

    // ── Update profiles table ─────────────────────────────────────────────

    const profileUpdate: Record<string, unknown> = {
      onboarding_completed: true,
      is_onboarded: true,
      updated_at: new Date().toISOString(),
    }

    if (avatarUrl) profileUpdate.avatar_url = avatarUrl
    if (phone) profileUpdate.phone = String(phone).trim()
    profileUpdate.show_phone = showPhone !== false // default true
    if (professionalTitle) profileUpdate.professional_title = String(professionalTitle).trim()
    if (gender && ['M', 'F', 'other'].includes(gender)) profileUpdate.gender = gender

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', user.id)

    if (profileError) {
      console.error('[onboarding/professional] profiles update error:', profileError)
      return NextResponse.json(
        { error: 'DB error', message: 'Error al actualizar el perfil.' },
        { status: 500 }
      )
    }

    // ── Update professionals table ────────────────────────────────────────

    const profUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (specialtyId) profUpdate.specialty_id = specialtyId
    if (registrationNumber) profUpdate.registration_number = String(registrationNumber).trim()
    if (yearsExperience != null) profUpdate.years_experience = Number(yearsExperience)
    if (bio) profUpdate.bio = String(bio).trim()
    if (professionalSlogan) profUpdate.professional_slogan = String(professionalSlogan).trim()
    if (consultationType) profUpdate.consultation_type = consultationType
    if (onlinePrice != null) profUpdate.online_price = Number(onlinePrice)
    if (inPersonPrice != null) profUpdate.in_person_price = Number(inPersonPrice)
    if (clinicAddress) profUpdate.clinic_address = String(clinicAddress).trim()
    if (nuraAiTone) profUpdate.nura_ai_tone = nuraAiTone

    // Check if professional record exists
    const { data: existingPro } = await supabase
      .from('professionals')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    let profError: { message: string } | null = null

    if (existingPro) {
      const { error } = await supabase
        .from('professionals')
        .update(profUpdate)
        .eq('id', user.id)
      profError = error
    } else {
      const { error } = await supabase
        .from('professionals')
        .insert({ id: user.id, ...profUpdate })
      profError = error
    }

    if (profError) {
      console.error('[onboarding/professional] professionals update error:', profError)
      return NextResponse.json(
        { error: 'DB error', message: 'Error al guardar el perfil profesional.' },
        { status: 500 }
      )
    }

    // ── Handle referral code ──────────────────────────────────────────────

    let isVip = false
    if (referralCode) {
      const code = String(referralCode).toUpperCase()
      const { data: refData } = await supabase
        .from('referral_codes')
        .select('uses_count, max_uses')
        .eq('code', code)
        .eq('is_active', true)
        .single()

      if (refData && refData.uses_count < refData.max_uses) {
        isVip = true
        await supabase
          .from('professionals')
          .update({ is_vip: true, referral_code_used: code })
          .eq('id', user.id)

        await supabase.rpc('increment_referral_usage', { code_param: code })
      }
    }

    return NextResponse.json({ success: true, is_vip: isVip })
  } catch (err) {
    console.error('[onboarding/professional] unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Error inesperado.' },
      { status: 500 }
    )
  }
}
