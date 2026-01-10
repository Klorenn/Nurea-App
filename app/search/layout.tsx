import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Search Professionals",
  description: "Find and book appointments with trusted healthcare professionals in Chile",
  openGraph: {
    title: "Search Healthcare Professionals | NUREA",
    description: "Find and book appointments with trusted healthcare professionals in Chile",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Search Healthcare Professionals | NUREA",
    description: "Find and book appointments with trusted healthcare professionals in Chile",
  },
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
