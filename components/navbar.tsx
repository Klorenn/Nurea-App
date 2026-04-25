"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import ThemeSwitch from "@/components/ui/theme-switch"
import { LanguageSelector } from "@/components/ui/language-selector"
import { UserDropdown } from "@/components/ui/user-dropdown"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/clerk-shim"

const navLinkClass =
  "text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 rounded-sm active:opacity-80 transition-colors"

interface NavbarProps {
  sticky?: boolean
}

export function Navbar({ sticky = true }: NavbarProps) {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const { user, isLoaded } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const navLinks = [
    { href: "#how-it-works", label: language === "es" ? "Cómo Funciona" : "How it works" },
    { href: "#for-professionals", label: language === "es" ? "Para Profesionales" : "For Professionals" },
    { href: "#pricing", label: language === "es" ? "Precios" : "Pricing" },
  ]

  const ctaLabel = language === "es" ? "Buscar especialista" : "Find a specialist"

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
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 rounded-sm"
            aria-label="NUREA - Inicio"
          >
            <Image
              src="/logos/nurea-logo.png"
              alt="NUREA"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-contain"
              priority
            />
            <span className="font-sans text-xl font-semibold text-foreground tracking-tight">NUREA</span>
            <span className="text-xs text-muted-foreground font-normal">.app</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            {navLinks.map(({ href, label }) => (
              <a key={href} href={href} className={navLinkClass}>
                {label}
              </a>
            ))}
            <Button
              size="sm"
              className="h-10 px-5 rounded-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              asChild
            >
              <Link href="/explore?focus=search">{ctaLabel}</Link>
            </Button>
          </div>

          {/* Esquina derecha: idioma, tema, perfil (perfil al final) */}
          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            <LanguageSelector />
            <ThemeSwitch />
            {!isLoaded ? (
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" aria-hidden="true" />
            ) : user ? (
              <UserDropdown
                role={((user.unsafeMetadata?.userType as string) || "patient") as "patient" | "professional" | "admin"}
                user={{
                  name: user.firstName
                    ? `${user.firstName} ${user.lastName || ""}`
                    : user.primaryEmailAddress?.emailAddress?.split("@")[0] || "Usuario",
                  email: user.primaryEmailAddress?.emailAddress || "",
                  avatar: user.imageUrl,
                  initials: user.firstName?.[0] || user.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() || "U",
                  status: "online",
                }}
              />
            ) : (
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
            )}

            {/* Mobile menu trigger */}
            {hasMounted && (
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
                  <div className="sr-only">
                    <SheetTitle>{language === "es" ? "Menú de navegación" : "Navigation Menu"}</SheetTitle>
                  </div>
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
                    <div className="mt-4 px-4">
                      <Button className="w-full rounded-full font-semibold" size="lg" asChild>
                        <Link href="/explore" onClick={() => setMenuOpen(false)}>
                          {ctaLabel}
                        </Link>
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
