"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

interface RatingInteractionProps {
  onChange?: (rating: number) => void
  className?: string
  value?: number
  disabled?: boolean
}

const ratingData = [
  { emoji: "😔", label: { es: "Terrible", en: "Terrible" }, color: "from-red-400 to-red-500", shadowColor: "shadow-red-500/30" },
  { emoji: "😕", label: { es: "Malo", en: "Poor" }, color: "from-orange-400 to-orange-500", shadowColor: "shadow-orange-500/30" },
  { emoji: "😐", label: { es: "Regular", en: "Okay" }, color: "from-yellow-400 to-yellow-500", shadowColor: "shadow-yellow-500/30" },
  { emoji: "🙂", label: { es: "Bueno", en: "Good" }, color: "from-lime-400 to-lime-500", shadowColor: "shadow-lime-500/30" },
  { emoji: "😍", label: { es: "Excelente", en: "Amazing" }, color: "from-emerald-400 to-emerald-500", shadowColor: "shadow-emerald-500/30" },
]

export function RatingInteraction({ onChange, className, value = 0, disabled = false }: RatingInteractionProps) {
  const { language } = useLanguage()
  const [rating, setRating] = useState(value)
  const [hoverRating, setHoverRating] = useState(0)

  const handleClick = (selectedValue: number) => {
    if (disabled) return
    setRating(selectedValue)
    onChange?.(selectedValue)
  }

  const displayRating = hoverRating || rating
  const activeData = displayRating > 0 ? ratingData[displayRating - 1] : null

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* Emoji rating buttons */}
      <div className="flex items-center gap-3">
        {ratingData.map((item, i) => {
          const emojiValue = i + 1
          const isActive = emojiValue <= displayRating
          const isExact = emojiValue === displayRating

          return (
            <button
              key={emojiValue}
              type="button"
              onClick={() => handleClick(emojiValue)}
              onMouseEnter={() => !disabled && setHoverRating(emojiValue)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={disabled}
              className="group relative focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Calificar ${emojiValue}: ${item.label[language]}`}
            >
              <div
                className={cn(
                  "relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ease-out",
                  isActive ? "scale-110" : "scale-100 group-hover:scale-105",
                  disabled && "cursor-not-allowed",
                )}
              >
                {/* Emoji with smooth grayscale transition */}
                <span
                  className={cn(
                    "text-3xl transition-all duration-300 ease-out select-none",
                    isActive
                      ? "grayscale-0 drop-shadow-lg"
                      : "grayscale opacity-40 group-hover:opacity-70 group-hover:grayscale-[0.3]",
                  )}
                >
                  {item.emoji}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="relative h-7 w-32">
        {/* Default "Califícanos" text */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out",
            displayRating > 0 ? "opacity-0 blur-md scale-95" : "opacity-100 blur-0 scale-100",
          )}
        >
          <span className="text-sm font-medium text-muted-foreground">
            {language === "es" ? "Califícanos" : "Rate us"}
          </span>
        </div>

        {/* Rating labels with blur in/out effect */}
        {ratingData.map((item, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out",
              displayRating === i + 1 ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-105",
            )}
          >
            <span className="text-sm font-semibold tracking-wide text-foreground">
              {item.label[language]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

