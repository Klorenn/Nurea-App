"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { Loader2, ShieldCheck } from "lucide-react"
import { loadingFullViewportClassName } from "@/lib/loading-layout"

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const supabase = useRef(createClient()).current

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace("/login")
      return
    }

    const check = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, onboarding_completed")
          .eq("id", user.id)
          .single()

        if (profile?.onboarding_completed) {
          router.replace(`/dashboard/${profile.role ?? "patient"}`)
          return
        }
      } catch (err) {
        console.error("[OnboardingLayout] error checking profile:", err)
      } finally {
        setChecking(false)
      }
    }

    check()
  }, [user, loading, router, supabase])

  if (loading || checking) {
    return (
      <div className={loadingFullViewportClassName("bg-slate-50 dark:bg-slate-950")}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Nurea logo" className="h-8 w-auto" />
            <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              NUREA
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
            <span>Sesión segura</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">{children}</main>

      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-500" />
          <span>Datos protegidos · Ley 19.628</span>
        </div>
      </footer>
    </div>
  )
}
