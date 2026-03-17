"use client"

import { motion } from "framer-motion"
import { Sparkles, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface NuraAIInsightsProps {
  tags?: string[]
  isSpanish?: boolean
}

export function NuraAIInsights({
  tags = ["Empático", "Puntual", "Explicaciones claras"],
  isSpanish = true,
}: NuraAIInsightsProps) {
  return (
    <div className="bg-slate-900 dark:bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden border border-white/5">
      {/* Animated Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-teal-500/20 rounded-full blur-[80px]" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-emerald-500/20 rounded-full blur-[60px]" />
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2">
          <div className="bg-teal-500/10 p-2 rounded-xl">
            <Sparkles className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-teal-400">
              Nura AI Insights
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {isSpanish ? "Análisis Inteligente de Reseñas" : "Smart Review Analysis"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 + 0.5 }}
              className="group flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="bg-emerald-500/20 p-1 rounded-md">
                <Check className="h-3 w-3 text-emerald-400" />
              </div>
              <span className="text-xs font-black tracking-tight text-white/90">
                {tag}
              </span>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
          {isSpanish 
            ? "Basado en el análisis de sentimientos de las últimas 50 opiniones verificadas."
            : "Based on sentiment analysis of the last 50 verified reviews."}
        </p>
      </div>
    </div>
  )
}
