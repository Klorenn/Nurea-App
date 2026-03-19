import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import * as z from 'zod'

const sexSchema = z.enum(['M', 'F'])

const dateOfBirthSchema = z
  .string()
  .min(1, 'Fecha de nacimiento requerida')
  .refine((v) => {
    const d = new Date(`${v}T00:00:00`)
    return !Number.isNaN(d.getTime())
  }, 'Fecha inválida')
  .refine((v) => {
    const d = new Date(`${v}T00:00:00`)
    const today = new Date()
    let age = today.getFullYear() - d.getFullYear()
    const monthDiff = today.getMonth() - d.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) age -= 1
    return age >= 18
  }, 'Debes ser mayor de 18 años')

const patientGoalSchema = z.enum(['consulta_medica', 'psicologia', 'ver_examenes', 'otra'])

const patientOnboardingSchema = z
  .object({
    avatarUrl: z.string().url(),
    dateOfBirth: dateOfBirthSchema,
    gender: sexSchema,
    phone: z.string().min(1, 'Teléfono requerido'),

    allergiesEnabled: z.boolean(),
    allergiesText: z.string().nullable().optional(),
    chronicEnabled: z.boolean(),
    chronicText: z.string().nullable().optional(),

    currentMedications: z.string().min(1, 'Medicamentos requeridos'),
    patientGoal: patientGoalSchema,
  })
  .superRefine((val, ctx) => {
    if (val.allergiesEnabled && !val.allergiesText?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indica tus alergias',
        path: ['allergiesText'],
      })
    }
    if (val.chronicEnabled && !val.chronicText?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indica tus enfermedades crónicas',
        path: ['chronicText'],
      })
    }
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
    const parsed = patientOnboardingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', message: parsed.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 },
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'patient') {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const val = parsed.data

    const updateData = {
      id: user.id,
      date_of_birth: val.dateOfBirth,
      gender: val.gender,
      phone: val.phone.trim(),
      allergies: val.allergiesEnabled ? val.allergiesText?.trim() : null,
      chronic_diseases: val.chronicEnabled ? val.chronicText?.trim() : null,
      current_medications: val.currentMedications.trim(),
      patient_goal: val.patientGoal,
      avatar_url: val.avatarUrl,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase.from('profiles').upsert(updateData, { onConflict: 'id' })

    if (updateError) {
      return NextResponse.json(
        { error: 'update_failed', message: updateError.message },
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

