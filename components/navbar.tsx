"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import ThemeSwitch from "@/components/ui/theme-switch"
import { LanguageSelector } from "@/components/ui/language-selector"
import { useAuth } from "@/hooks/use-auth"
import { UserDropdown } from "@/components/ui/user-dropdown"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinkClass =
  "text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 rounded-sm active:opacity-80 transition-colors"

interface NavbarProps {
  sticky?: boolean
}

export function Navbar({ sticky = true }: NavbarProps) {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const { user, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { href: "#how-it-works", label: t.nav.howItWorks },
    { href: "#for-professionals", label: t.nav.forProfessionals },
    { href: "#pricing", label: t.nav.pricing },
  ]

  return (
    <nav
      className={cn(
        "left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border",
        sticky ? "fixed top-0" : "relative"
      )}
      aria-label={language === "es" ? "Navegación principal" : "Main navigation"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 rounded-sm"
            aria-label="NUREA - Inicio"
          >
            <h2 className="font-sans text-2xl font-semibold text-primary">NUREA</h2>
            <span className="ml-2 text-xs text-muted-foreground">.app</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map(({ href, label }) => (
              <a key={href} href={href} className={navLinkClass}>
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" aria-hidden="true" />
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-4 text-sm hidden sm:inline-flex hover:opacity-90 active:opacity-80"
                  asChild
                >
                  <Link href="/login" aria-label={t.nav.signIn}>
                    {t.nav.signIn}
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="h-9 px-6 text-sm rounded-full font-medium hover:opacity-95 active:opacity-90 hover:shadow-md active:shadow-sm transition-all"
                  asChild
                >
                <Link href="/login" aria-label={t.nav.getStarted}>
                    {t.nav.getStarted}
                  </Link>
                </Button>
              </>
            )}
            <LanguageSelector />
            <ThemeSwitch />

            {/* Mobile menu trigger */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9 rounded-md hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-primary/30 active:opacity-80"
                  aria-label={language === "es" ? "Abrir menú de navegación" : "Open navigation menu"}
                  aria-expanded={menuOpen}
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <nav className="flex flex-col gap-1 pt-8" aria-label={language === "es" ? "Menú" : "Menu"}>
                  {navLinks.map(({ href, label }) => (
                    <a
                      key={href}
                      href={href}
                      className={cn(navLinkClass, "block py-3 px-4 rounded-lg")}
                      onClick={() => setMenuOpen(false)}
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
