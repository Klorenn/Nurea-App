"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  value: string
  className?: string
  icon?: React.ComponentType<{ className?: string; size?: number }>
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
  ...props
}: AnimatedInputProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const showLabel = isFocused || value.length > 0

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
        className="outline-none border-b-2 border-teal-300/50 dark:border-teal-400/50 py-2.5 px-0 pr-8 w-full text-base font-medium text-white bg-transparent placeholder-transparent focus:border-teal-500 dark:focus:border-teal-400 transition-colors disabled:opacity-50 relative z-0 password-input-fix"
        style={{
          WebkitBoxShadow: props.type === "password" ? "0 0 0 1000px transparent inset" : undefined,
          WebkitTextFillColor: "rgb(255, 255, 255)",
          caretColor: "rgb(255, 255, 255)",
        }}
      />
    </div>
  )
}

