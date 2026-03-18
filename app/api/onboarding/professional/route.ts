import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import * as z from 'zod'

const consultationTypeSchema = z.enum(['online', 'in-person', 'both'])
const nuraAiToneSchema = z.enum(['clinico_tecnico', 'empatico_cercano', 'directo_resumido'])

const professionalOnboardingSchema = z
  .object({
    avatarUrl: z.string().url(),

    specialtyPrincipalId: z.string().uuid(),
    specialtySubId: z.string().uuid(),
    registrationNumber: z.string().min(1, 'Registro médico requerido'),

    yearsExperience: z.number().int().min(0, 'Años de experiencia inválidos'),
    consultationType: consultationTypeSchema,
    professionalSlogan: z.string().min(1, 'Frase o lema requerido'),

    nuraAiTone: nuraAiToneSchema,
  })

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = professionalOnboardingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', message: parsed.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 },
      )
    }

    const val = parsed.data

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'professional') {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    // Verify principal/sub relationship in specialties table
    const { data: subSpecialty } = await supabase
      .from('specialties')
      .select('id, parent_id, name_es')
      .eq('id', val.specialtySubId)
      .single()

    if (!subSpecialty) {
      return NextResponse.json({ error: 'invalid_specialty_sub' }, { status: 400 })
    }

    if (subSpecialty.parent_id !== val.specialtyPrincipalId) {
      return NextResponse.json({ error: 'invalid_specialty_relationship' }, { status: 400 })
    }

    const { data: principalSpecialty } = await supabase
      .from('specialties')
      .select('id, name_es')
      .eq('id', val.specialtyPrincipalId)
      .single()

    const principalName = principalSpecialty?.name_es ?? ''
    if (!principalName) {
      return NextResponse.json({ error: 'invalid_specialty_principal' }, { status: 400 })
    }

    // Store profile completion flag at profiles level.
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: val.avatarUrl,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (profileUpdateError) {
      return NextResponse.json(
        { error: 'profile_update_failed', message: profileUpdateError.message },
        { status: 500 },
      )
    }

    const professionalUpdate = {
      specialty_id: val.specialtySubId,
      specialty: principalName, // legacy compatibility
      registration_number: val.registrationNumber.trim(),
      years_experience: val.yearsExperience,
      consultation_type: val.consultationType,
      professional_slogan: val.professionalSlogan.trim(),
      nura_ai_tone: val.nuraAiTone,
      // Keep `bio` populated since other parts of the app reuse it.
      bio: val.professionalSlogan.trim(),
      bio_extended: val.professionalSlogan.trim(),
      updated_at: new Date().toISOString(),
    }

    const { error: professionalError } = await supabase
      .from('professionals')
      .upsert({
        id: user.id,
        ...professionalUpdate,
      })
      .select('id')
      .single()

    if (professionalError) {
      return NextResponse.json(
        { error: 'professional_update_failed', message: professionalError.message },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'server_error', message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}

