"use client"

import { ProfessionalWelcomeGuide } from "@/components/professional/ProfessionalWelcomeGuide"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { loadingDashboardInsetClassName } from "@/lib/loading-layout"

export default function ProfessionalWelcomePage() {
  const { user, loading: authLoading } = useAuth()
  const [profData, setProfData] = useState<{ name: string; slug: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProf() {
      if (!user) return
      
      const { data, error } = await supabase
        .from('professionals')
        .select('slug, profiles(first_name, last_name)')
        .eq('id', user.id)
        .single()
      
      if (!error && data) {
        const firstName = Array.isArray(data.profiles) ? data.profiles[0]?.first_name : (data.profiles as any)?.first_name
        const lastName = Array.isArray(data.profiles) ? data.profiles[0]?.last_name : (data.profiles as any)?.last_name
        setProfData({
          name: `${firstName || ''} ${lastName || ''}`.trim() || 'Especialista',
          slug: data.slug || user.id
        })
      }
      setLoading(false)
    }

    if (!authLoading && user) {
      fetchProf()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])

  if (loading || authLoading) {
    return (
      <div className={loadingDashboardInsetClassName("bg-background")}>
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (!profData) {
    return (
      <div className={loadingDashboardInsetClassName("bg-background text-slate-500 font-medium text-center px-4")}>
        No se pudo cargar la información del perfil.
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <ProfessionalWelcomeGuide 
        doctorName={profData.name} 
        slug={profData.slug} 
      />
    </div>
  )
}
