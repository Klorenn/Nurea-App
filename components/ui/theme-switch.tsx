"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const ThemeSwitch = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) => {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  const toggleTheme = useCallback(() => {
    const newTheme = isDark ? "light" : "dark"
    setTheme(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('nurea-theme', newTheme)
    }
  }, [isDark, setTheme])

  if (!mounted) {
    return (
      <button
        className={cn(
          "flex items-center justify-center h-8 w-8 rounded-full",
          "text-muted-foreground",
          className
        )}
        disabled
      />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center justify-center h-8 w-8 rounded-full",
        "text-muted-foreground hover:text-foreground",
        "hover:bg-accent/50 transition-all",
        "z-50 pointer-events-auto cursor-pointer",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      {...props}
    >
      {isDark ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </button>
  )
}

export default ThemeSwitch

