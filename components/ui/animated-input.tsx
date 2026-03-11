"use client"

import { useState } from "react"
import { motion, type Variants, type Transition } from "framer-motion"
import { cn } from "@/lib/utils"

const inputBaseClass =
  "w-full h-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 py-2 px-3 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-colors disabled:opacity-50"

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
      <div className={cn("flex flex-col gap-1.5", className)}>
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700 dark:text-slate-300 tracking-normal"
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
    <div className={cn("relative z-0 h-10", className)}>
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 left-0 pointer-events-none flex items-center gap-2 z-10 text-slate-700 dark:text-slate-300 tracking-normal"
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
        className="outline-none h-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 py-2 pl-3 pr-8 w-full text-sm text-slate-900 dark:text-slate-50 placeholder-transparent focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-colors disabled:opacity-50 relative z-0 password-input-fix"
      />
    </div>
  )
}

