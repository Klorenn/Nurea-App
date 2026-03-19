import { createClient } from "@/lib/supabase/client"

export interface AdvancedSearchResult {
  id: string
  professional_id: string
  profile_id: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  specialty: string | null
  bio: string | null
  city: string | null
  rating: number | null
  review_count: number | null
  relevance: number | null
}

/**
 * Client-side helper to call the buscar_profesionales RPC.
 * Returns up to 50 results ordered by relevance.
 */
export async function buscarProfesionales(query: string, limit = 20) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc<AdvancedSearchResult>(
    "buscar_profesionales",
    {
      p_query: query,
      p_limit: limit,
    } as any
  )

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in buscar_profesionales RPC:", error)
    }
    throw error
  }

  return data ?? []
}

