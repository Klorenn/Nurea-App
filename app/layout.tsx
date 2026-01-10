import type React from "react"
import type { Metadata } from "next"
import { Geist, Lora } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/contexts/language-context"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _geist = Geist({ 
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-sans",
})
const _lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nurea.app'),
  title: {
    default: "NUREA - Healthcare Marketplace",
    template: "%s | NUREA"
  },
  description: "Connect with trusted healthcare professionals in Chile. Book appointments, manage your health journey, and access quality healthcare services.",
  keywords: ["healthcare", "medical appointments", "Chile", "health professionals", "telemedicine", "health marketplace", "doctors", "patients", "medical services"],
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
    title: "NUREA - Healthcare Marketplace",
    description: "Connect with trusted healthcare professionals in Chile. Book appointments, manage your health journey, and access quality healthcare services.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NUREA - Healthcare Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NUREA - Healthcare Marketplace",
    description: "Connect with trusted healthcare professionals in Chile. Book appointments, manage your health journey.",
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
              "description": "Healthcare marketplace connecting patients with trusted healthcare professionals in Chile",
              "url": siteUrl,
              "logo": `${siteUrl}/logo.png`,
              "sameAs": [
                // Add social media URLs when available
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
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
              "description": "Connect with trusted healthcare professionals in Chile",
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
              "name": "NUREA Healthcare Marketplace",
              "description": "Online platform for connecting patients with healthcare professionals in Chile",
              "url": siteUrl,
              "areaServed": {
                "@type": "Country",
                "name": "Chile"
              },
              "medicalSpecialty": [
                "General Practice",
                "Psychology",
                "Cardiology",
                "Dermatology"
              ]
            })
          }}
        />
      </head>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
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
