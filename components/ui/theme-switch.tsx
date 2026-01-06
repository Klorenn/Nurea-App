"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const ThemeSwitch = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { resolvedTheme, setTheme, theme } = useTheme()
  const [checked, setChecked] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Si el tema es "system", usar resolvedTheme
      const isDark = resolvedTheme === "dark"
      setChecked(isDark)
    }
  }, [resolvedTheme, mounted])

  const handleCheckedChange = useCallback(
    (isChecked: boolean) => {
      setChecked(isChecked)
      // Siempre establecer el tema explícitamente (no "system") para que persista
      const newTheme = isChecked ? "dark" : "light"
      setTheme(newTheme)
      // Asegurar que se guarde en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('nurea-theme', newTheme)
      }
    },
    [setTheme],
  )

  if (!mounted) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center",
          "h-8 w-14 rounded-full border px-1.5",
          "bg-white/60 dark:bg-neutral-900/90 backdrop-blur-md shadow-sm",
          "border-gray-200 dark:border-neutral-700",
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center", // center the whole control
        "h-9 w-16 rounded-full border-2 px-1.5", // slightly larger for better visibility
        "bg-white/90 dark:bg-neutral-900/95 backdrop-blur-md shadow-lg",
        "border-gray-300 dark:border-neutral-600",
        "z-50", // Ensure it's above other elements
        "hover:shadow-xl transition-shadow",
        className
      )}
      {...props}
    >
      {/* The real shadcn Switch (full-size, same structure) */}
      <Switch
        checked={checked}
        onCheckedChange={handleCheckedChange}
        className={cn(
          // root (track) - transparent to show parent background
          "peer absolute inset-0 h-full w-full rounded-full bg-transparent transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2",
          "z-50 pointer-events-auto", // Ensure it's clickable
          // tune the default thumb size & z-index so it slides over icons
          "[&>span]:h-5 [&>span]:w-5 [&>span]:rounded-full [&>span]:bg-white dark:[&>span]:bg-gray-200 [&>span]:shadow-md [&>span]:z-20 [&>span]:border [&>span]:border-gray-200 dark:[&>span]:border-gray-600",
          // override default translate distances for smaller track
          "data-[state=unchecked]:[&>span]:translate-x-0.5",
          "data-[state=checked]:[&>span]:translate-x-[32px]", // adjusted for w-16
          "data-[state=checked]:bg-transparent"
        )}
      />

      {/* Icons overlaid inside the track, perfectly centered left/right */}
      <span
        className={cn(
          "pointer-events-none absolute left-1.5 inset-y-0 z-0",
          "flex items-center justify-center"
        )}
      >
        <SunIcon
          size={16}
          className={cn(
            "transition-all duration-200 ease-out",
            checked 
              ? "text-gray-400 dark:text-gray-500" 
              : "text-amber-500 dark:text-amber-400 scale-110"
          )}
        />
      </span>

      <span
        className={cn(
          "pointer-events-none absolute right-1.5 inset-y-0 z-0",
          "flex items-center justify-center"
        )}
      >
        <MoonIcon
          size={16}
          className={cn(
            "transition-all duration-200 ease-out",
            checked 
              ? "text-blue-500 dark:text-blue-400 scale-110" 
              : "text-gray-400 dark:text-gray-500"
          )}
        />
      </span>
    </div>
  )
}

export default ThemeSwitch

