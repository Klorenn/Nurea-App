"use client"

import { useState } from "react"
import { motion, type Variants, type Transition } from "framer-motion"
import { cn } from "@/lib/utils"

const inputBaseClass =
  "w-full rounded-lg border-2 border-teal-300/50 dark:border-teal-400/50 bg-white dark:bg-gray-900 py-2.5 px-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-muted-foreground focus:border-teal-500 dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors disabled:opacity-50"

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  value: string
  className?: string
  icon?: React.ComponentType<{ className?: string; size?: number }>
  /** 'floating' = label inside input; 'stacked' = label above input, no overlap */
  variant?: "floating" | "stacked"
}

const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
}

const letterSpringTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
}

const letterVariants: Variants = {
  initial: {
    y: 0,
    color: "rgb(15, 23, 42)", // slate-900 for light mode
  },
  animate: {
    y: "-120%",
    color: "rgb(20 184 166)",
    transition: letterSpringTransition,
  },
}

export const AnimatedInput = ({
  label,
  className = "",
  value,
  icon: Icon,
  variant = "floating",
  id,
  ...props
}: AnimatedInputProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const showLabel = isFocused || value.length > 0

  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700 dark:text-slate-200 tracking-normal"
        >
          {label}
        </label>
        <input
          id={id}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          {...props}
          autoComplete={props.type === "password" ? (id?.includes("signup") ? "new-password" : "current-password") : props.autoComplete}
          className={cn(inputBaseClass, className)}
        />
      </div>
    )
  }

  return (
    <div className={cn("relative z-0 min-h-[3.25rem]", className)}>
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 left-0 pointer-events-none flex items-center gap-2 z-10 text-slate-600 dark:text-slate-100 tracking-normal"
        variants={containerVariants}
        initial="initial"
        animate={showLabel ? "animate" : "initial"}
      >
        {Icon && (
          <motion.span
            variants={letterVariants}
            className="inline-block"
            style={{ willChange: "transform" }}
          >
            <Icon size={16} className="inline-block" />
          </motion.span>
        )}
        {label.split("").map((char, index) => (
          <motion.span
            key={index}
            className="inline-block text-xs font-bold"
            variants={letterVariants}
            style={{ willChange: "transform" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.div>

      <input
        id={id}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={value}
        {...props}
        autoComplete={props.type === "password" ? (id?.includes("signup") ? "new-password" : "current-password") : props.autoComplete}
        className="outline-none border-b-2 border-teal-300/50 dark:border-teal-400/50 py-2.5 px-0 pr-8 w-full text-base font-medium text-slate-900 dark:text-white bg-transparent placeholder-transparent focus:border-teal-500 dark:focus:border-teal-400 transition-colors disabled:opacity-50 relative z-0 password-input-fix"
      />
    </div>
  )
}

