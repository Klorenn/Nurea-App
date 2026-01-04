"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

interface LogoutButtonProps {
  onClick: () => void
  className?: string
}

export function LogoutButton({ onClick, className }: LogoutButtonProps) {
  const { language } = useLanguage()
  const label = language === "es" ? "Cerrar sesión" : "Log out"

  return (
    <Button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden w-full justify-start font-medium text-foreground h-auto py-2 px-2",
        className
      )}
      variant="ghost"
    >
      <span className="block transition-opacity duration-500 group-hover:opacity-0 whitespace-nowrap">
        {label}
      </span>
      <i className="absolute inset-0 z-10 grid w-1/4 place-items-center bg-primary-foreground/15 transition-all duration-500 group-hover:w-full rounded-lg">
        <ArrowLeft
          className="opacity-60"
          size={16}
          strokeWidth={2}
          aria-hidden="true"
        />
      </i>
    </Button>
  )
}

