import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const supabase = await createClient()

    // Obtener información del profesional
    const { data: professional } = await supabase
      .from('professionals')
      .select(`
        specialty,
        bio,
        profile:profiles!professionals_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()

    if (!professional) {
      // Fallback a metadata por defecto si no se encuentra
      return {
        title: "Professional Profile",
        description: "View professional profile, book appointments, and access healthcare services",
        openGraph: {
          title: "Healthcare Professional | NUREA",
          description: "View professional profile, book appointments, and access healthcare services",
          type: "profile",
        },
        twitter: {
          card: "summary_large_image",
          title: "Healthcare Professional | NUREA",
          description: "View professional profile, book appointments, and access healthcare services",
        },
      }
    }

    const profileRecord = Array.isArray(professional.profile)
      ? professional.profile[0]
      : professional.profile

    const professionalName = profileRecord
      ? `${profileRecord.first_name || ""} ${profileRecord.last_name || ""}`.trim()
      : "Healthcare Professional"
    const specialty = professional.specialty || "Healthcare Professional"
    const bio = professional.bio
      ? professional.bio.substring(0, 160)
      : `View ${professionalName}'s profile and book appointments`
    const imageUrl =
      profileRecord?.avatar_url ||
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&h=630&fit=crop"

    return {
      title: `${professionalName} - ${specialty} | NUREA`,
      description: bio,
      openGraph: {
        title: `${professionalName} - ${specialty} | NUREA`,
        description: bio,
        type: "profile",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${professionalName} - ${specialty}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${professionalName} - ${specialty} | NUREA`,
        description: bio,
        images: [imageUrl],
      },
    }
  } catch (error) {
    console.error('Error generando metadata dinámica:', error)
    // Fallback a metadata por defecto si hay error
    return {
      title: "Professional Profile",
      description: "View professional profile, book appointments, and access healthcare services",
      openGraph: {
        title: "Healthcare Professional | NUREA",
        description: "View professional profile, book appointments, and access healthcare services",
        type: "profile",
      },
      twitter: {
        card: "summary_large_image",
        title: "Healthcare Professional | NUREA",
        description: "View professional profile, book appointments, and access healthcare services",
      },
    }
  }
}

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
