/**
 * Script de migración: Asignar specialty_id a profesionales existentes
 * basado en el campo 'specialty' (texto libre).
 * 
 * Uso:
 *   npx tsx scripts/migrate-specialties.ts --dry-run  # Preview sin cambios
 *   npx tsx scripts/migrate-specialties.ts            # Ejecutar migración
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Mapeo de nombres comunes a slugs de especialidades
const SPECIALTY_MAPPING: Record<string, string> = {
  // Español
  'cardiología': 'cardiologia',
  'cardiologo': 'cardiologia',
  'cardióloga': 'cardiologia',
  'dermatología': 'dermatologia',
  'dermatologo': 'dermatologia',
  'dermatóloga': 'dermatologia',
  'pediatría': 'pediatria',
  'pediatra': 'pediatria',
  'ginecología': 'ginecologia',
  'ginecólogo': 'ginecologia',
  'ginecóloga': 'ginecologia',
  'psiquiatría': 'psiquiatria',
  'psiquiatra': 'psiquiatria',
  'neurología': 'neurologia',
  'neurólogo': 'neurologia',
  'neuróloga': 'neurologia',
  'oftalmología': 'oftalmologia',
  'oftalmólogo': 'oftalmologia',
  'oftalmóloga': 'oftalmologia',
  'traumatología': 'traumatologia',
  'traumatólogo': 'traumatologia',
  'urología': 'urologia',
  'urólogo': 'urologia',
  'gastroenterología': 'gastroenterologia',
  'gastroenterólogo': 'gastroenterologia',
  'neumología': 'neumologia',
  'neumólogo': 'neumologia',
  'endocrinología': 'endocrinologia',
  'endocrinólogo': 'endocrinologia',
  'reumatología': 'reumatologia',
  'reumatólogo': 'reumatologia',
  'nefrología': 'nefrologia',
  'nefrólogo': 'nefrologia',
  'hematología': 'hematologia',
  'hematólogo': 'hematologia',
  'oncología': 'oncologia',
  'oncólogo': 'oncologia',
  'geriatría': 'geriatria',
  'geriatra': 'geriatria',
  'medicina general': 'medicina-general',
  'médico general': 'medicina-general',
  'medicina interna': 'medicina-interna',
  'medicina familiar': 'medicina-familiar',
  'cirugía general': 'cirugia-general',
  'cirujano': 'cirugia-general',
  'anestesiología': 'anestesiologia',
  'anestesiólogo': 'anestesiologia',
  
  // Salud Integral
  'psicología': 'psicologia',
  'psicólogo': 'psicologia',
  'psicóloga': 'psicologia',
  'psicología clínica': 'psicologia-clinica',
  'nutrición': 'nutricion',
  'nutricionista': 'nutricion',
  'nutriólogo': 'nutricion',
  'fisioterapia': 'fisioterapia',
  'fisioterapeuta': 'fisioterapia',
  'kinesiología': 'kinesiologia',
  'kinesiólogo': 'kinesiologia',
  'odontología': 'odontologia',
  'odontólogo': 'odontologia',
  'dentista': 'odontologia',
  'ortodoncia': 'ortodoncia',
  'ortodoncista': 'ortodoncia',
  'fonoaudiología': 'fonoaudiologia',
  'fonoaudiólogo': 'fonoaudiologia',
  'terapia ocupacional': 'terapia-ocupacional',
  'terapeuta ocupacional': 'terapia-ocupacional',
  'matronería': 'matroneria',
  'matrona': 'matroneria',
  'enfermería': 'enfermeria',
  'enfermero': 'enfermeria',
  'enfermera': 'enfermeria',
  
  // Inglés
  'cardiology': 'cardiologia',
  'dermatology': 'dermatologia',
  'pediatrics': 'pediatria',
  'gynecology': 'ginecologia',
  'psychiatry': 'psiquiatria',
  'neurology': 'neurologia',
  'ophthalmology': 'oftalmologia',
  'psychology': 'psicologia',
  'nutrition': 'nutricion',
  'physiotherapy': 'fisioterapia',
  'dentistry': 'odontologia',
  'general medicine': 'medicina-general',
}

async function migrateSpecialties(dryRun: boolean = false) {
  console.log('🔄 Iniciando migración de especialidades...')
  console.log(`   Modo: ${dryRun ? 'DRY RUN (sin cambios)' : 'EJECUCIÓN REAL'}`)
  console.log('')

  // 1. Obtener todas las especialidades
  const { data: specialties, error: specError } = await supabase
    .from('specialties')
    .select('id, slug, name_es, name_en')

  if (specError) {
    console.error('❌ Error al obtener especialidades:', specError.message)
    console.log('   ¿Has ejecutado las migraciones SQL primero?')
    return
  }

  console.log(`✅ ${specialties?.length || 0} especialidades encontradas en la BD`)

  // Crear mapa slug -> id
  const slugToId: Record<string, string> = {}
  specialties?.forEach(spec => {
    slugToId[spec.slug] = spec.id
  })

  // 2. Obtener profesionales sin specialty_id
  const { data: professionals, error: profError } = await supabase
    .from('professionals')
    .select('id, specialty, specialty_id')
    .is('specialty_id', null)

  if (profError) {
    console.error('❌ Error al obtener profesionales:', profError.message)
    return
  }

  console.log(`📋 ${professionals?.length || 0} profesionales necesitan migración`)
  console.log('')

  if (!professionals || professionals.length === 0) {
    console.log('✨ Nada que migrar - todos los profesionales ya tienen specialty_id')
    return
  }

  // 3. Mapear cada profesional
  const updates: { id: string; specialty_id: string; original: string }[] = []
  const unmapped: { id: string; specialty: string }[] = []

  for (const prof of professionals) {
    if (!prof.specialty) {
      unmapped.push({ id: prof.id, specialty: '(vacío)' })
      continue
    }

    const normalizedSpecialty = prof.specialty.toLowerCase().trim()
    let matchedSlug = SPECIALTY_MAPPING[normalizedSpecialty]

    // Buscar coincidencia parcial si no hay exacta
    if (!matchedSlug) {
      for (const [key, slug] of Object.entries(SPECIALTY_MAPPING)) {
        if (normalizedSpecialty.includes(key) || key.includes(normalizedSpecialty)) {
          matchedSlug = slug
          break
        }
      }
    }

    if (matchedSlug && slugToId[matchedSlug]) {
      updates.push({
        id: prof.id,
        specialty_id: slugToId[matchedSlug],
        original: prof.specialty
      })
    } else {
      unmapped.push({ id: prof.id, specialty: prof.specialty })
    }
  }

  // 4. Mostrar resultados
  console.log('📊 Resultados del mapeo:')
  console.log(`   ✅ Mapeados: ${updates.length}`)
  console.log(`   ⚠️  Sin mapear: ${unmapped.length}`)
  console.log('')

  if (updates.length > 0) {
    console.log('📝 Actualizaciones a realizar:')
    for (const upd of updates.slice(0, 10)) {
      const spec = specialties?.find(s => s.id === upd.specialty_id)
      console.log(`   - ${upd.id.slice(0, 8)}... "${upd.original}" → ${spec?.name_es}`)
    }
    if (updates.length > 10) {
      console.log(`   ... y ${updates.length - 10} más`)
    }
    console.log('')
  }

  if (unmapped.length > 0) {
    console.log('⚠️  Profesionales sin mapear (necesitan revisión manual):')
    for (const un of unmapped.slice(0, 10)) {
      console.log(`   - ${un.id.slice(0, 8)}... "${un.specialty}"`)
    }
    if (unmapped.length > 10) {
      console.log(`   ... y ${unmapped.length - 10} más`)
    }
    console.log('')
  }

  // 5. Ejecutar actualizaciones
  if (!dryRun && updates.length > 0) {
    console.log('🚀 Ejecutando actualizaciones...')
    
    let successCount = 0
    let errorCount = 0

    for (const upd of updates) {
      const { error } = await supabase
        .from('professionals')
        .update({ specialty_id: upd.specialty_id })
        .eq('id', upd.id)

      if (error) {
        console.error(`   ❌ Error actualizando ${upd.id}:`, error.message)
        errorCount++
      } else {
        successCount++
      }
    }

    console.log('')
    console.log('📊 Resumen de ejecución:')
    console.log(`   ✅ Actualizados: ${successCount}`)
    console.log(`   ❌ Errores: ${errorCount}`)
  }

  console.log('')
  console.log('✨ Migración completada')
}

// Ejecutar
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run') || args.includes('-d')

migrateSpecialties(dryRun)
