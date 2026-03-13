"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"

interface PriceRangeFilterProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  currency?: string
  lang?: string
}

export function PriceRangeFilter({
  min,
  max,
  value,
  onChange,
  currency = "CLP",
  lang = "es"
}: PriceRangeFilterProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const formatPrice = (price: number) => {
    if (currency === "CLP") {
      return `$${(price / 1000).toFixed(0)}k`
    }
    return new Intl.NumberFormat(lang === "es" ? "es-CL" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(price)
  }

  const handleChange = (newValue: number[]) => {
    const sorted = [newValue[0], newValue[1]].sort((a, b) => a - b) as [number, number]
    setLocalValue(sorted)
  }

  const handleCommit = (newValue: number[]) => {
    const sorted = [newValue[0], newValue[1]].sort((a, b) => a - b) as [number, number]
    onChange(sorted)
  }

  const label = lang === "es" ? "Rango de precio" : "Price range"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">
          {formatPrice(localValue[0])} - {formatPrice(localValue[1])}
        </span>
      </div>
      
      <div className="px-1">
        <Slider
          value={localValue}
          min={min}
          max={max}
          step={1000}
          onValueChange={handleChange}
          onValueCommit={handleCommit}
          className="cursor-pointer"
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  )
}
