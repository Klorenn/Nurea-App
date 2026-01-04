"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SmokeyBackground, LoginForm } from "@/components/smokey-login"

export default function SmokeyLoginPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <SmokeyBackground backdropBlurAmount="md" color="#14B8A6" />
      
      <Link
        href="/"
        className="absolute top-8 left-8 z-10 flex items-center gap-2 text-sm font-bold text-white/90 hover:text-white transition-colors backdrop-blur-sm bg-white/10 px-4 py-2 rounded-xl border border-white/20"
      >
        <ArrowLeft className="h-4 w-4" /> {process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost') ? 'Back to Home' : 'Volver'}
      </Link>

      <div className="relative z-10 w-full flex items-center justify-center">
        <LoginForm />
      </div>
    </main>
  )
}

