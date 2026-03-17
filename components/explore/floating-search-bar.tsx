"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Calendar as CalendarIcon, X, SlidersHorizontal, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface FloatingSearchBarProps {
  initialQuery?: string
  initialLocation?: string
  onSearch: (filters: { search?: string, location?: string, date?: Date }) => void
  isSpanish?: boolean
}

export function FloatingSearchBar({
  initialQuery = "",
  initialLocation = "",
  onSearch,
  isSpanish = true
}: FloatingSearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [location, setLocation] = useState(initialLocation)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [activeSegment, setActiveSegment] = useState<"query" | "location" | "date" | null>(null)

  const handleSearch = () => {
    onSearch({ search: query, location, date })
    setActiveSegment(null)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <motion.div 
        layout
        className={cn(
          "relative flex flex-col md:flex-row items-stretch p-1 rounded-2xl md:rounded-full bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300",
          activeSegment && "ring-2 ring-teal-500/20"
        )}
      >
        {/* Qué - Especialidad */}
        <div 
          className={cn(
            "flex-1 flex flex-col justify-center px-6 py-2 md:py-3 rounded-xl md:rounded-full transition-colors cursor-pointer group",
            activeSegment === "query" ? "bg-slate-100 dark:bg-slate-800 shadow-inner" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
          )}
          onClick={() => setActiveSegment("query")}
        >
          <label className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-0.5">
            {isSpanish ? "Especialidad" : "Specialty"}
          </label>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isSpanish ? "¿Qué buscas?" : "What are you looking for?"}
              className="border-none bg-transparent p-0 h-auto focus-visible:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
              onFocus={() => setActiveSegment("query")}
            />
          </div>
        </div>

        <div className="hidden md:block w-px h-8 self-center bg-slate-200 dark:bg-slate-800" />

        {/* Dónde - Ubicación */}
        <div 
          className={cn(
            "flex-[0.8] flex flex-col justify-center px-6 py-2 md:py-3 rounded-xl md:rounded-full transition-colors cursor-pointer group",
            activeSegment === "location" ? "bg-slate-100 dark:bg-slate-800 shadow-inner" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
          )}
          onClick={() => setActiveSegment("location")}
        >
          <label className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-0.5">
            {isSpanish ? "Ubicación" : "Location"}
          </label>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={isSpanish ? "Ciudad o zona" : "City or area"}
              className="border-none bg-transparent p-0 h-auto focus-visible:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
              onFocus={() => setActiveSegment("location")}
            />
          </div>
        </div>

        <div className="hidden md:block w-px h-8 self-center bg-slate-200 dark:bg-slate-800" />

        {/* Cuándo - Fecha */}
        <div 
          className={cn(
            "flex-[0.7] flex flex-col justify-center px-6 py-2 md:py-3 rounded-xl md:rounded-full transition-colors cursor-pointer group",
            activeSegment === "date" ? "bg-slate-100 dark:bg-slate-800 shadow-inner" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
          )}
          onClick={() => setActiveSegment("date")}
        >
          <label className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-0.5">
            {isSpanish ? "Fecha" : "Date"}
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-white">
                <CalendarIcon className="h-4 w-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                <span className={cn(!date && "text-slate-400")}>
                  {date ? format(date, "PPP", { locale: isSpanish ? es : undefined }) : (isSpanish ? "¿Cuándo?" : "When?")}
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-slate-200 dark:border-slate-800" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d)
                  setActiveSegment(null)
                }}
                disabled={(date) => date < new Date()}
                initialFocus
                className="p-3 bg-white dark:bg-slate-900"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Botón Buscar */}
        <div className="p-1 flex items-center">
          <Button 
            onClick={handleSearch}
            className="md:w-14 md:h-14 md:rounded-full md:p-0 bg-teal-600 hover:bg-teal-700 text-white shadow-lg w-full rounded-xl"
          >
            <Search className="h-5 w-5 mr-2 md:mr-0" />
            <span className="md:hidden font-bold">{isSpanish ? "Buscar" : "Search"}</span>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
