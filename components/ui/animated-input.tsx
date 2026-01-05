"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle } from "lucide-react"

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  value: string
  className?: string
  icon?: React.ComponentType<{ className?: string; size?: number }>
  error?: string
  touched?: boolean
  showValidation?: boolean
}

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
}

const letterVariants = {
  initial: {
    y: 0,
    color: "rgb(255, 255, 255)", // white
  },
  animate: {
    y: "-120%",
    color: "rgb(20 184 166)", // teal-500 when animated
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
}

export const AnimatedInput = ({
  label,
  className = "",
  value,
  icon: Icon,
  error,
  touched = false,
  showValidation = false,
  ...props
}: AnimatedInputProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const showLabel = isFocused || value.length > 0
  const showError = touched && error && showValidation
  const showValid = touched && !error && value.length > 0 && showValidation

  return (
    <div className={cn("relative z-0", className)}>
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 left-0 pointer-events-none text-white flex items-center gap-2 z-10"
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
            <Icon size={16} className="inline-block text-white" />
          </motion.span>
        )}
        {label.split("").map((char, index) => (
          <motion.span
            key={index}
            className="inline-block text-xs font-bold text-white"
            variants={letterVariants}
            style={{ willChange: "transform" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.div>

      <input
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={value}
        {...props}
        autoComplete={props.type === "password" ? (props.id?.includes("signup") ? "new-password" : "current-password") : props.autoComplete}
        className={cn(
          "outline-none border-b-2 py-2.5 px-0 pr-8 w-full text-base font-medium text-white bg-transparent placeholder-transparent transition-colors disabled:opacity-50 relative z-0 password-input-fix",
          showError 
            ? "border-red-400 dark:border-red-500 focus:border-red-500 dark:focus:border-red-400"
            : showValid
            ? "border-green-400 dark:border-green-500 focus:border-green-500 dark:focus:border-green-400"
            : "border-teal-300/50 dark:border-teal-400/50 focus:border-teal-500 dark:focus:border-teal-400"
        )}
        aria-invalid={showError}
        aria-describedby={showError ? `${props.id}-error` : undefined}
        style={{
          WebkitBoxShadow: props.type === "password" ? "0 0 0 1000px transparent inset" : undefined,
          WebkitTextFillColor: "rgb(255, 255, 255)",
          caretColor: "rgb(255, 255, 255)",
        }}
      />
      {showValidation && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20">
          {showValid && (
            <CheckCircle2 className="h-5 w-5 text-green-400" aria-hidden="true" />
          )}
          {showError && (
            <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          )}
        </div>
      )}
      {showError && (
        <p id={`${props.id}-error`} className="text-xs text-red-400 mt-1 px-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

