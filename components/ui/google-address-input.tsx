"use client"

import React, { useEffect, useRef, useState } from "react"
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Check, MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface GoogleAddressInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  language?: "es" | "en"
}

export function GoogleAddressInput({
  value,
  onChange,
  placeholder,
  className,
  disabled,
  language = "es",
}: GoogleAddressInputProps) {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Load API Key and Script
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (key) {
      setApiKey(key)
      // @ts-ignore
      if (!window.google) {
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
        script.async = true
        script.onload = () => setScriptLoaded(true)
        document.head.appendChild(script)
      } else {
        setScriptLoaded(true)
      }
    }
  }, [])

  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here */
    },
    debounce: 300,
    cache: 86400,
    initOnMount: scriptLoaded,
  })

  // Sync internal value with external value on mount or change
  useEffect(() => {
    if (value && value !== inputValue) {
      setValue(value, false)
    }
  }, [value])

  const handleSelect = async (address: string) => {
    setValue(address, false)
    clearSuggestions()
    onChange(address)
    setOpen(false)
  }

  if (!apiKey) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              setValue(e.target.value)
              if (!open) setOpen(true)
            }}
            placeholder={placeholder}
            className={cn("pr-10", className)}
            disabled={disabled || !ready}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {!ready && scriptLoaded ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command className="rounded-xl border shadow-md">
          <CommandList>
            {status !== "OK" && inputValue.length > 2 && (
              <CommandEmpty>
                {language === "es" ? "No se encontraron resultados" : "No results found"}
              </CommandEmpty>
            )}
            <CommandGroup>
              {data.map(({ place_id, description }) => (
                <CommandItem
                  key={place_id}
                  value={description}
                  onSelect={() => handleSelect(description)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{description}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === description ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
