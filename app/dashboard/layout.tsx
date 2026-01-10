import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your appointments, messages, payments, and healthcare journey",
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
