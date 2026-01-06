"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import ThemeSwitch from "@/components/ui/theme-switch"
import { LanguageSelector } from "@/components/ui/language-selector"
import { useAuth } from "@/hooks/use-auth"
import { UserDropdown } from "@/components/ui/user-dropdown"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const { user, loading } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <h2 className="font-sans text-2xl font-semibold text-primary">NUREA</h2>
            <span className="ml-2 text-xs text-muted-foreground">.app</span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.howItWorks}
            </a>
            <a href="#for-professionals" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.forProfessionals}
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.pricing}
            </a>
          </div>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <UserDropdown
                role={user.user_metadata?.role || "patient"}
                user={{
                  name: user.user_metadata?.first_name
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`
                    : user.email?.split("@")[0] || "Usuario",
                  email: user.email || "",
                  avatar: user.user_metadata?.avatar_url,
                  initials: user.user_metadata?.first_name?.[0] || user.email?.charAt(0).toUpperCase() || "U",
                  status: "online",
                }}
              />
            ) : (
              <>
                <Button variant="ghost" size="sm" className="h-9 px-4 text-sm hidden sm:inline-flex" asChild>
                  <Link href="/login">{t.nav.signIn}</Link>
                </Button>
                <Button size="sm" className="h-9 px-6 text-sm rounded-full font-medium" asChild>
                  <Link href="/signup">{t.nav.getStarted}</Link>
                </Button>
              </>
            )}
            <LanguageSelector />
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </nav>
  )
}
