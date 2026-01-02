"use client"

import React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type LuminousCTAButtonProps = {
  text?: string
  icon?: React.ReactNode
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  variant?: "cyan" | "purple" | "green" | "orange" | "navy"
  className?: string
}

const variantStyles = {
  cyan: {
    background: "linear-gradient(rgb(46, 192, 255) 0%, rgb(46, 192, 255) 100%)",
    backgroundColor: "rgb(46, 192, 255)",
    boxShadow:
      "rgba(56, 195, 255, 0.78) 0px 0.6px 0.6px -0.8px, rgba(56, 195, 255, 0.75) 0px 1.8px 1.6px -1.6px, rgba(56, 195, 255, 0.69) 0px 3.8px 3.6px -2.4px, rgba(56, 195, 255, 0.56) 0px 8.6px 7.8px -3.2px, rgba(56, 195, 255, 0.2) 0px 22px 19.8px -4px",
    boxShadowHover:
      "rgba(255, 255, 255, 0.2) 0px 0px 3px 4px inset, rgba(56, 195, 255, 0.78) 0px 0.6px 0.6px -0.8px, rgba(56, 195, 255, 0.75) 0px 1.8px 1.6px -1.6px, rgba(56, 195, 255, 0.69) 0px 3.8px 3.6px -2.4px, rgba(56, 195, 255, 0.56) 0px 8.6px 7.8px -3.2px, rgba(56, 195, 255, 0.2) 0px 22px 19.8px -4px, rgb(0, 247, 255) 0px -9.6px 9.6px 0px inset",
    glowColor: "rgb(120, 255, 237)",
  },
  purple: {
    background: "linear-gradient(rgb(168, 85, 247) 0%, rgb(147, 51, 234) 100%)",
    backgroundColor: "rgb(168, 85, 247)",
    boxShadow:
      "rgba(168, 85, 247, 0.78) 0px 0.6px 0.6px -0.8px, rgba(168, 85, 247, 0.75) 0px 1.8px 1.6px -1.6px, rgba(168, 85, 247, 0.69) 0px 3.8px 3.6px -2.4px, rgba(168, 85, 247, 0.56) 0px 8.6px 7.8px -3.2px, rgba(168, 85, 247, 0.2) 0px 22px 19.8px -4px",
    boxShadowHover:
      "rgba(255, 255, 255, 0.2) 0px 0px 3px 4px inset, rgba(168, 85, 247, 0.78) 0px 0.6px 0.6px -0.8px, rgba(168, 85, 247, 0.75) 0px 1.8px 1.6px -1.6px, rgba(168, 85, 247, 0.69) 0px 3.8px 3.6px -2.4px, rgba(168, 85, 247, 0.56) 0px 8.6px 7.8px -3.2px, rgba(168, 85, 247, 0.2) 0px 22px 19.8px -4px, rgb(196, 120, 255) 0px -9.6px 9.6px 0px inset",
    glowColor: "rgb(196, 120, 255)",
  },
  green: {
    background: "linear-gradient(rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%)",
    backgroundColor: "rgb(34, 197, 94)",
    boxShadow:
      "rgba(34, 197, 94, 0.78) 0px 0.6px 0.6px -0.8px, rgba(34, 197, 94, 0.75) 0px 1.8px 1.6px -1.6px, rgba(34, 197, 94, 0.69) 0px 3.8px 3.6px -2.4px, rgba(34, 197, 94, 0.56) 0px 8.6px 7.8px -3.2px, rgba(34, 197, 94, 0.2) 0px 22px 19.8px -4px",
    boxShadowHover:
      "rgba(255, 255, 255, 0.2) 0px 0px 3px 4px inset, rgba(34, 197, 94, 0.78) 0px 0.6px 0.6px -0.8px, rgba(34, 197, 94, 0.75) 0px 1.8px 1.6px -1.6px, rgba(34, 197, 94, 0.69) 0px 3.8px 3.6px -2.4px, rgba(34, 197, 94, 0.56) 0px 8.6px 7.8px -3.2px, rgba(34, 197, 94, 0.2) 0px 22px 19.8px -4px, rgb(134, 239, 172) 0px -9.6px 9.6px 0px inset",
    glowColor: "rgb(134, 239, 172)",
  },
  orange: {
    background: "linear-gradient(rgb(249, 115, 22) 0%, rgb(234, 88, 12) 100%)",
    backgroundColor: "rgb(249, 115, 22)",
    boxShadow:
      "rgba(249, 115, 22, 0.78) 0px 0.6px 0.6px -0.8px, rgba(249, 115, 22, 0.75) 0px 1.8px 1.6px -1.6px, rgba(249, 115, 22, 0.69) 0px 3.8px 3.6px -2.4px, rgba(249, 115, 22, 0.56) 0px 8.6px 7.8px -3.2px, rgba(249, 115, 22, 0.2) 0px 22px 19.8px -4px",
    boxShadowHover:
      "rgba(255, 255, 255, 0.2) 0px 0px 3px 4px inset, rgba(249, 115, 22, 0.78) 0px 0.6px 0.6px -0.8px, rgba(249, 115, 22, 0.75) 0px 1.8px 1.6px -1.6px, rgba(249, 115, 22, 0.69) 0px 3.8px 3.6px -2.4px, rgba(249, 115, 22, 0.56) 0px 8.6px 7.8px -3.2px, rgba(249, 115, 22, 0.2) 0px 22px 19.8px -4px, rgb(253, 186, 116) 0px -9.6px 9.6px 0px inset",
    glowColor: "rgb(253, 186, 116)",
  },
  navy: {
    background: "linear-gradient(rgb(30, 58, 138) 0%, rgb(23, 37, 84) 100%)",
    backgroundColor: "rgb(30, 58, 138)",
    boxShadow:
      "rgba(30, 58, 138, 0.78) 0px 0.6px 0.6px -0.8px, rgba(30, 58, 138, 0.75) 0px 1.8px 1.6px -1.6px, rgba(30, 58, 138, 0.69) 0px 3.8px 3.6px -2.4px, rgba(30, 58, 138, 0.56) 0px 8.6px 7.8px -3.2px, rgba(30, 58, 138, 0.2) 0px 22px 19.8px -4px",
    boxShadowHover:
      "rgba(255, 255, 255, 0.2) 0px 0px 3px 4px inset, rgba(30, 58, 138, 0.78) 0px 0.6px 0.6px -0.8px, rgba(30, 58, 138, 0.75) 0px 1.8px 1.6px -1.6px, rgba(30, 58, 138, 0.69) 0px 3.8px 3.6px -2.4px, rgba(30, 58, 138, 0.56) 0px 8.6px 7.8px -3.2px, rgba(30, 58, 138, 0.2) 0px 22px 19.8px -4px, rgb(96, 165, 250) 0px -9.6px 9.6px 0px inset",
    glowColor: "rgb(96, 165, 250)",
  },
}

export const LuminousCTAButton = ({
  text = "Discuss a Project",
  icon,
  onClick,
  loading = false,
  disabled = false,
  variant = "cyan",
  className,
}: LuminousCTAButtonProps) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const variantStyle = variantStyles[variant]
  const isDisabled = disabled || loading

  return (
    <motion.button
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      onMouseEnter={() => !isDisabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-6 py-3 text-white transition-all duration-300",
        isDisabled && "cursor-not-allowed opacity-50",
        !isDisabled && "cursor-pointer hover:scale-105 active:scale-95",
        className,
      )}
      style={{
        background: variantStyle.background,
        backgroundColor: variantStyle.backgroundColor,
        boxShadow: isHovered && !isDisabled ? variantStyle.boxShadowHover : variantStyle.boxShadow,
        WebkitFontSmoothing: "antialiased",
      }}
      whileHover={
        !isDisabled
          ? {
              scale: 1.05,
            }
          : {}
      }
      whileTap={
        !isDisabled
          ? {
              scale: 0.95,
            }
          : {}
      }
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
    >
      <motion.div
        className="absolute -right-[46px] -bottom-[25px] -top-2 left-[210.2px] z-[1] w-3.5 bg-white opacity-30 blur-[10px] mix-blend-overlay"
        style={{
          transform: "matrix(0.970296, -0.241922, 0.241922, 0.970296, -6.96286, 0)",
          transformOrigin: "7px 38.6px",
        }}
        animate={
          !isDisabled
            ? {
                left: ["210.2px", "-46px", "210.2px"],
              }
            : {}
        }
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      <svg
        className="pointer-events-none absolute left-[-35px] top-[26px] h-[63px] w-[213px]"
        viewBox="0 0 213 63"
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient
            id={`glow-${variant}`}
            cy="0.5"
            cx="0.5"
            r="0.5"
            gradientTransform="translate(0.5, 0.5) scale(1 1) translate(-0.5, -0.5)"
          >
            <stop offset="0" stopColor={variantStyle.glowColor} stopOpacity="1" />
            <stop offset="1" stopColor="rgba(46, 192, 255, 0)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="106.5" cy="31.5" rx="106.5" ry="31.5" fill={`url(#glow-${variant})`} />
      </svg>

      <span
        className="relative z-10 whitespace-nowrap font-medium"
        style={{
          fontSize: "16px",
          letterSpacing: "-0.4px",
          textTransform: "capitalize",
          lineHeight: "24px",
        }}
      >
        {text}
      </span>

      {loading ? (
        <Loader2 className="relative z-10 h-5 w-5 animate-spin" />
      ) : (
        icon || <ArrowRight className="relative z-10 h-5 w-5" />
      )}
    </motion.button>
  )
}
