import type React from "react"
import type { Metadata } from "next"
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google"
import { LanguageProvider } from "@/contexts/language-context"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/providers/query-provider"
import { Toaster } from "sonner"
import { AnalyticsClient } from "@/components/analytics-client"
import "./globals.css"
import "./auth.css"
import "./dashboard.css"

import { NuraChatDynamic } from "@/components/nura/nura-chat-wrapper"

/* ─── Rebrand abril 2026 ─────────────────────────────────────────────
   Inter         → body / UI                           (--font-inter)
   Fraunces      → display serif, headings editoriales (--font-fraunces)
   JetBrains Mono → eyebrows, micro labels, code       (--font-jetbrains-mono)
───────────────────────────────────────────────────────────────────── */
const InterFont = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
})
const FrauncesFont = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
  preload: true,
})
const JetBrainsMonoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nurea.app'),
  title: {
    default: "NUREA - Tu Plataforma de Salud",
    template: "%s | NUREA"
  },
  description: "Conecta con profesionales de la salud confiables en Chile. Reserva horas, gestiona tu salud y accede a servicios médicos de calidad.",
  keywords: ["salud", "horas médicas", "Chile", "profesionales de la salud", "telemedicina", "reserva de horas", "doctores", "pacientes", "servicios médicos"],
  authors: [{ name: "NUREA" }],
  creator: "NUREA",
  publisher: "NUREA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "/",
    siteName: "NUREA",
    title: "NUREA - Tu Plataforma de Salud",
    description: "Conecta con profesionales de la salud confiables en Chile. Reserva horas, gestiona tu salud y accede a servicios médicos de calidad.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NUREA - Tu Plataforma de Salud",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NUREA - Tu Plataforma de Salud",
    description: "Conecta con profesionales de la salud confiables en Chile. Reserva horas, gestiona tu salud y accede a servicios médicos de calidad.",
    images: ["/og-image.jpg"],
    creator: "@nurea",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add when available: google: "your-google-verification-code",
    // Add when available: yandex: "your-yandex-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nurea.app'
  
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#3d4f48" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NUREA" />
        <link rel="apple-touch-startup-image" href="/icons/splash.png" />
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        
        {/* Preconnect to Supabase if using */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
        )}
        
        {/* Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "NUREA",
              "description": "Plataforma que conecta pacientes con profesionales de la salud confiables en Chile",
              "url": siteUrl,
              "logo": `${siteUrl}/logo.png`,
              "sameAs": [
                // Add social media URLs when available
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Atención al Cliente",
                "areaServed": "CL",
                "availableLanguage": ["es", "en"]
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "NUREA",
              "url": siteUrl,
              "description": "Conecta con profesionales de la salud confiables en Chile",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${siteUrl}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalBusiness",
              "name": "NUREA - Tu Plataforma de Salud",
              "description": "Plataforma online para conectar pacientes con profesionales de la salud en Chile",
              "url": siteUrl,
              "areaServed": {
                "@type": "Country",
                "name": "Chile"
              },
              "medicalSpecialty": [
                "Medicina General",
                "Psicología",
                "Cardiología",
                "Dermatología"
              ]
            })
          }}
        />
      </head>
      <body className={`${InterFont.variable} ${FrauncesFont.variable} ${JetBrainsMonoFont.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <QueryProvider>
            <LanguageProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
              <AnalyticsClient />
              <NuraChatDynamic />
            </LanguageProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
