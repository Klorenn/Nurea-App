import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Explorar Especialistas | NUREA",
  description: "Encuentra al profesional de salud ideal para ti. Filtra por especialidad, modalidad, precio y disponibilidad.",
  openGraph: {
    title: "Explorar Especialistas | NUREA",
    description: "Encuentra al profesional de salud ideal para ti.",
    type: "website",
  },
}

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
