"use client"

import * as React from "react"
import { AnimatePresence, motion, MotionConfig } from "framer-motion"
import useMeasure from "react-use-measure"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { LanguageSelector } from "@/components/ui/language-selector"

const transition = {
  type: "spring" as const,
  bounce: 0.1,
  duration: 0.25,
}

export interface ToolbarItem {
  id: number
  label: string
  icon: React.ReactNode
  content: React.ReactNode
  href?: string
}

interface ToolbarProps {
  items: ToolbarItem[]
  role?: "patient" | "professional"
  variant?: "floating" | "sidebar"
}

export function Toolbar({ items, role = "patient", variant = "floating" }: ToolbarProps) {
  const [active, setActive] = React.useState<number | null>(null)
  const [contentRef, { height: contentHeight }] = useMeasure()
  const [menuRef, { width: containerWidth }] = useMeasure()
  const [isOpen, setIsOpen] = React.useState(false)
  const [maxWidth, setMaxWidth] = React.useState(0)
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()

  React.useEffect(() => {
    if (!containerWidth || maxWidth > 0) return
    setMaxWidth(containerWidth)
  }, [containerWidth, maxWidth])

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setActive(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleItemClick = (item: ToolbarItem) => {
    if (!isOpen) {
      setIsOpen(true)
    }
    if (active === item.id) {
      setIsOpen(false)
      setActive(null)
      return
    }
    setActive(item.id)
    
    // Navigate if href is provided
    if (item.href) {
      router.push(item.href)
    }
  }

  const containerClass = variant === "sidebar" 
    ? "w-full" 
    : "fixed bottom-6 left-6 z-50"

  return (
    <MotionConfig transition={transition}>
      <div className={containerClass} ref={toolbarRef}>
        <div className={cn(
          variant === "sidebar" 
            ? "bg-transparent" 
            : "bg-background/95 backdrop-blur-md rounded-2xl shadow-lg shadow-primary/10"
        )}>
          <div className="overflow-hidden">
            <AnimatePresence initial={false} mode="sync">
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0 }}
                  animate={{ height: contentHeight || 0 }}
                  exit={{ height: 0 }}
                  style={{ width: maxWidth }}
                >
                  <div ref={contentRef} className="p-3">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: active === item.id ? 1 : 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div
                          className={cn(
                            "px-2 pt-2 text-sm",
                            active === item.id ? "block" : "hidden"
                          )}
                        >
                          {item.content}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className={cn(
            "flex flex-col gap-2",
            variant === "sidebar" ? "p-0" : "p-2"
          )} ref={menuRef}>
            <div className={cn(
              "flex",
              variant === "sidebar" ? "flex-wrap gap-1 justify-center" : "space-x-1"
            )}>
              {items.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    variant === "sidebar" 
                      ? "h-9 w-9 rounded-lg transition-all" 
                      : "h-10 w-10 rounded-xl transition-all",
                    active === item.id 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "hover:bg-primary/10 hover:text-primary"
                  )}
                  onClick={() => handleItemClick(item)}
                  title={item.label}
                >
                  <span className="sr-only">{item.label}</span>
                  {item.icon}
                </Button>
              ))}
            </div>
            <div className={cn(
              "flex justify-center pt-2",
              variant === "sidebar" ? "border-t border-border/40 mt-2" : "border-t border-border/40"
            )}>
              <LanguageSelector compact={variant === "sidebar"} />
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  )
}

