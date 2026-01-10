import type { Metadata } from "next"

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // In a real implementation, you would fetch professional data here
  // For now, we'll use default metadata
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

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
