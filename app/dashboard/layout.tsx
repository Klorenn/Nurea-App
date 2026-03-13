import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | NUREA",
  description: "Manage your appointments, messages, payments, and healthcare journey",
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
