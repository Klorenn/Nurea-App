import type React from "react"
import type { Metadata } from "next"
import { Geist, Lora } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/contexts/language-context"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
})

export const metadata: Metadata = {
  title: "NUREA - Healthcare Marketplace",
  description: "Connect with trusted healthcare professionals in Chile. Book appointments, manage your health journey.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <Analytics />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
