"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface AnimatedTabsProps {
  tabs?: Tab[]
  defaultTab?: string
  className?: string
}

const AnimatedTabs = ({ tabs = [], defaultTab, className }: AnimatedTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0]?.id || "")

  if (!tabs?.length) return null

  return (
    <div className={cn("w-full flex flex-col gap-y-1", className)}>
      <div className="flex gap-1 flex-wrap bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-3 py-1.5 text-sm font-medium rounded-lg outline-none transition-colors",
              activeTab === tab.id
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-white dark:bg-slate-700 shadow-sm rounded-lg"
                transition={{ type: "spring", duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden bg-white dark:bg-slate-900">
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {tab.content}
              </motion.div>
            )
        )}
      </div>
    </div>
  )
}

export { AnimatedTabs }
export type { Tab }
