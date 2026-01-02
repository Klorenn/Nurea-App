"use client"

import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

export function Navbar() {
  const [language, setLanguage] = useState("ES")

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* <CHANGE> Updated branding for NUREA */}
          <div className="flex items-center">
            <h2 className="font-sans text-2xl font-semibold text-primary">NUREA</h2>
            <span className="ml-2 text-xs text-muted-foreground">.app</span>
          </div>

          {/* <CHANGE> Healthcare marketplace navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#find-professionals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Find Professionals
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#for-professionals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              For Professionals
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </div>

          {/* <CHANGE> Language selector and auth buttons */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sm gap-2">
                  <Globe className="h-4 w-4" />
                  {language}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage("ES")}>
                  Español
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("EN")}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" className="text-sm">
              Sign In
            </Button>
            <Button size="sm" className="text-sm rounded-full">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
