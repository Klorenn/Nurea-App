"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { CategoryWithSpecialties } from "@/types"

interface CategoryTabsProps {
  categories: CategoryWithSpecialties[]
  selectedCategory: string | null
  onSelect: (slug: string | null) => void
  loading?: boolean
  lang?: string
}

export function CategoryTabs({
  categories,
  selectedCategory,
  onSelect,
  loading = false,
  lang = "es"
}: CategoryTabsProps) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-11 w-40 rounded-full bg-muted/50 animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    )
  }

  const allLabel = lang === "es" ? "Todos" : "All"

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <motion.button
        onClick={() => onSelect(null)}
        className={cn(
          "relative px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0",
          "flex items-center gap-2",
          selectedCategory === null
            ? "text-white"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {selectedCategory === null && (
          <motion.div
            layoutId="category-pill"
            className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-500 rounded-full"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10">✨</span>
        <span className="relative z-10">{allLabel}</span>
      </motion.button>

      {categories.map((category) => (
        <motion.button
          key={category.slug}
          onClick={() => onSelect(category.slug)}
          className={cn(
            "relative px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0",
            "flex items-center gap-2",
            selectedCategory === category.slug
              ? "text-white"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {selectedCategory === category.slug && (
            <motion.div
              layoutId="category-pill"
              className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-500 rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{category.icon}</span>
          <span className="relative z-10">{category.name}</span>
          {category.professionalCount > 0 && (
            <span className={cn(
              "relative z-10 text-xs px-1.5 py-0.5 rounded-full",
              selectedCategory === category.slug
                ? "bg-white/20"
                : "bg-accent"
            )}>
              {category.professionalCount}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  )
}
