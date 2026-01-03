"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"

export function Navbar() {
  const { language, setLanguage } = useLanguage()
  const t = useTranslations(language)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <h2 className="font-sans text-2xl font-semibold text-primary">NUREA</h2>
            <span className="ml-2 text-xs text-muted-foreground">.app</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#find-professionals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.findProfessionals}
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.howItWorks}
            </a>
            <a href="#for-professionals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.forProfessionals}
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.pricing}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sm gap-2">
                  <Globe className="h-4 w-4" />
                  {language.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage("es")}>
                  Español
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" className="text-sm" asChild>
              <Link href="/login">{t.nav.signIn}</Link>
            </Button>
            <Button size="sm" className="text-sm rounded-full" asChild>
              <Link href="/signup">{t.nav.getStarted}</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
