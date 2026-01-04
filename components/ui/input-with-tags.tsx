"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"

interface Tag {
  text: string
  onRemove: () => void
}

const Tag = ({ text, onRemove }: Tag) => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.span
      initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8, y: -10 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1, y: 0 }}
      exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8, y: -10 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
        type: "spring",
      }}
      className="bg-teal-100 dark:bg-teal-900/30 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 shadow-sm border border-teal-200/50 dark:border-teal-800/50 text-teal-700 dark:text-teal-300 font-medium"
    >
      {text}
      <motion.button
        whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
        onClick={onRemove}
        className="bg-transparent text-xs h-fit flex items-center rounded-full justify-center text-teal-600 dark:text-teal-400 p-0.5 hover:bg-teal-200/50 dark:hover:bg-teal-800/50 transition-colors"
        aria-label="Remove tag"
      >
        <X className="w-3.5 h-3.5" />
      </motion.button>
    </motion.span>
  )
}

interface InputWithTagsProps {
  placeholder?: string
  className?: string
  limit?: number
  value?: string[]
  onChange?: (tags: string[]) => void
  predefinedTags?: string[]
  allowCustomTags?: boolean
}

const InputWithTags = ({
  placeholder,
  className,
  limit = 10,
  value,
  onChange,
  predefinedTags = [],
  allowCustomTags = true,
}: InputWithTagsProps) => {
  const { language } = useLanguage()
  const shouldReduceMotion = useReducedMotion()
  const [internalTags, setInternalTags] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const tags = value ?? internalTags

  const handleTagsChange = (newTags: string[]) => {
    if (onChange) {
      onChange(newTags)
    } else {
      setInternalTags(newTags)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      if (!limit || tags.length < limit) {
        const newTag = inputValue.trim()
        if (!tags.includes(newTag)) {
          handleTagsChange([...tags, newTag])
          setInputValue("")
          setShowSuggestions(false)
        }
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const handleTagClick = (tag: string) => {
    if (!tags.includes(tag) && (!limit || tags.length < limit)) {
      handleTagsChange([...tags, tag])
      setInputValue("")
      setShowSuggestions(false)
    }
  }

  const removeTag = (indexToRemove: number) => {
    handleTagsChange(tags.filter((_, index) => index !== indexToRemove))
  }

  const filteredSuggestions = predefinedTags.filter(
    (tag) => !tags.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase())
  )

  return (
    <div className={cn("flex flex-col gap-2 w-full relative", className)}>
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.98 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <motion.input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowSuggestions(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder || (language === "es" ? "Buscar por especialidad..." : "Search by specialty...")}
          whileHover={shouldReduceMotion ? {} : { scale: 1.005 }}
          whileFocus={shouldReduceMotion ? {} : { scale: 1.005 }}
          className="w-full px-4 py-3 bg-accent/50 dark:bg-accent/20 border border-teal-200/30 dark:border-teal-800/30 rounded-xl backdrop-blur-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 dark:focus:border-teal-500 transition-all"
          disabled={limit ? tags.length >= limit : false}
        />
        {limit && tags.length >= limit && (
          <p className="text-xs text-muted-foreground mt-1">
            {language === "es" ? `Límite de ${limit} filtros alcanzado` : `Limit of ${limit} filters reached`}
          </p>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && inputValue && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-teal-200/30 dark:border-teal-800/30 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {filteredSuggestions.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="w-full text-left px-4 py-2 hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-colors text-sm text-foreground"
              >
                {tag}
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Predefined Tags */}
      {predefinedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {predefinedTags
            .filter((tag) => !tags.includes(tag))
            .map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1.5 rounded-lg text-sm border border-teal-200/30 dark:border-teal-800/30 bg-background hover:bg-teal-50 dark:hover:bg-teal-950/20 text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                + {tag}
              </button>
            ))}
        </div>
      )}

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {tags.map((tag, index) => (
            <Tag key={`${tag}-${index}`} text={tag} onRemove={() => removeTag(index)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export { InputWithTags }

