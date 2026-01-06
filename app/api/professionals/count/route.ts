import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/professionals/count
 * Returns the real count of professionals in the database and first 3 avatars
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Count professionals from the professionals table
    const { count, error } = await supabase
      .from('professionals')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error counting professionals:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      // Return a default count if there's an error (to avoid breaking the UI)
      const response = NextResponse.json({ 
        count: 0,
        professionals: [],
        error: 'Failed to count professionals'
      })
      // Add cache headers to prevent stale data
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      return response
    }

    // Get first 3 professionals with their avatars for display (excluding test professional from count but including in avatars if exists)
    // Handle foreign key relationship gracefully
    let avatars: string[] = []
    try {
      // First, try to get the test professional avatar if it exists
      const TEST_PROFESSIONAL_ID = 'nurea-doctor-test'
      const { data: testProf } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', TEST_PROFESSIONAL_ID)
        .maybeSingle()
      
      if (testProf?.avatar_url) {
        avatars.push(testProf.avatar_url)
      }

      // Get other professionals (excluding test professional)
      const { data: professionals, error: profError } = await supabase
        .from('professionals')
        .select(`
          id,
          profile:profiles!professionals_id_fkey(
            avatar_url
          )
        `)
        .neq('id', TEST_PROFESSIONAL_ID)
        .limit(3 - avatars.length) // Fill remaining slots
        .order('created_at', { ascending: false })

      if (!profError && professionals && Array.isArray(professionals)) {
        professionals.forEach((prof: any) => {
          // Handle both nested profile object and direct avatar_url
          const avatarUrl = prof.profile?.avatar_url || prof.avatar_url
          if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim() !== '' && avatars.length < 3) {
            avatars.push(avatarUrl)
          }
        })
      } else if (profError) {
        // If foreign key query fails, try a simpler query without the relationship
        console.warn('Foreign key query failed, trying alternative:', profError)
        const { data: simpleProfessionals } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('role', 'professional')
          .neq('id', TEST_PROFESSIONAL_ID)
          .not('avatar_url', 'is', null)
          .limit(3 - avatars.length)
        
        if (simpleProfessionals && Array.isArray(simpleProfessionals)) {
          simpleProfessionals.forEach((prof: any) => {
            if (prof.avatar_url && typeof prof.avatar_url === 'string' && avatars.length < 3) {
              avatars.push(prof.avatar_url)
            }
          })
        }
      }
      
      // Limit to maximum 3 avatars
      avatars = avatars.slice(0, 3)
    } catch (avatarError) {
      // If avatar fetching fails completely, just return empty array
      console.warn('Error fetching professional avatars:', avatarError)
      avatars = []
    }

    const result = {
      count: count || 0,
      professionals: avatars,
      timestamp: new Date().toISOString() // Add timestamp for cache busting
    }
    
    console.log('Professionals count API result:', {
      count: result.count,
      avatarsCount: result.professionals.length,
      timestamp: result.timestamp
    })
    
    const response = NextResponse.json(result)
    // Add cache headers to ensure fresh data on each request
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error('Error in professionals count API:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    const errorResponse = NextResponse.json({ 
      count: 0,
      professionals: [],
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    return errorResponse
  }
}

