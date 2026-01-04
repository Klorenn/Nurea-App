"use client"

import { useState } from "react"
import { Facebook, Instagram, Linkedin, Youtube, Globe, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

interface Social {
  name: string
  href: string
  icon: React.ReactNode
}

interface SocialIconsProps {
  socials?: Social[]
  className?: string
  variant?: "default" | "minimal"
}

const defaultSocials: Social[] = [
  {
    name: "Website",
    href: "#",
    icon: <Globe className="size-[18px]" />,
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: <Linkedin className="size-[18px]" />,
  },
  {
    name: "Instagram",
    href: "#",
    icon: <Instagram className="size-[18px]" />,
  },
  {
    name: "Facebook",
    href: "#",
    icon: <Facebook className="size-[18px]" />,
  },
  {
    name: "YouTube",
    href: "#",
    icon: <Youtube className="size-[18px]" />,
  },
  {
    name: "Email",
    href: "#",
    icon: <Mail className="size-[18px]" />,
  },
]

export function SocialIcons({ socials = defaultSocials, className, variant = "default" }: SocialIconsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {socials.map((social, index) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center size-9 rounded-lg bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-all duration-200"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            aria-label={social.name}
          >
            <span
              className={cn(
                "transition-all duration-200",
                hoveredIndex === index ? "scale-110 text-teal-700 dark:text-teal-300" : ""
              )}
            >
              {social.icon}
            </span>
          </a>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("relative flex items-center gap-0.5 px-1.5 py-1.5 rounded-2xl bg-teal-950/50 dark:bg-teal-900/20 border border-teal-200/20 dark:border-teal-800/30", className)}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none" />

      {socials.map((social, index) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center size-10 rounded-xl transition-colors duration-200"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          aria-label={social.name}
        >
          <span
            className={cn(
              "absolute inset-1 rounded-lg bg-teal-500/10 transition-all duration-300 ease-out",
              hoveredIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-90"
            )}
          />

          <span
            className={cn(
              "relative z-10 transition-all duration-300 ease-out",
              hoveredIndex === index ? "text-teal-400 scale-110" : "text-teal-600/60 dark:text-teal-400/60"
            )}
          >
            {social.icon}
          </span>

          <span
            className={cn(
              "absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-teal-400 transition-all duration-300 ease-out",
              hoveredIndex === index ? "w-3 opacity-100" : "w-0 opacity-0"
            )}
          />

          <span
            className={cn(
              "absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-teal-600 text-white text-[11px] font-medium whitespace-nowrap transition-all duration-300 ease-out shadow-lg",
              hoveredIndex === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
            )}
          >
            {social.name}
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-2 rotate-45 bg-teal-600" />
          </span>
        </a>
      ))}
    </div>
  )
}

