"use client"

import Link from "next/link"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"

export function Footer() {
  const { language, setLanguage } = useLanguage()
  const t = useTranslations(language)

  return (
    <footer className="border-t border-border/40 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* <CHANGE> Updated footer structure for NUREA marketplace */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          <div className="md:col-span-2">
            <h3 className="font-sans text-xl font-semibold text-primary mb-2">NUREA</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {t.footer.tagline}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="h-4 w-4" />
                  {language === "es" ? "Español" : "English"}
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
          </div>

          <div>
            <h4 className="font-medium mb-4">{t.footer.forPatients}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/search" className="hover:text-foreground transition-colors">
                  {t.footer.findProfessionals}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/appointments" className="hover:text-foreground transition-colors">
                  {t.footer.bookAppointment}
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">
                  {t.footer.howItWorks}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">{t.footer.forProfessionals}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/signup" className="hover:text-foreground transition-colors">
                  {t.footer.joinNurea}
                </Link>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground transition-colors">
                  {t.footer.pricingPlans}
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground transition-colors">
                  {t.footer.referralProgram}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">{t.footer.company}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  {t.footer.aboutUs}
                </a>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
                  {t.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-foreground transition-colors">
                  {t.footer.termsOfService}
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  {t.footer.contact}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>{t.footer.copyright}</p>
          <p className="text-xs">{t.footer.madeWithCare}</p>
        </div>
      </div>
    </footer>
  )
}
