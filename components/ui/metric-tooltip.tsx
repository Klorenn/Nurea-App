/**
 * Metric Tooltip Component
 * 
 * Muestra tooltips informativos para métricas y estadísticas
 */

import { ReactNode } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricTooltipProps {
  content: string
  children?: ReactNode
  className?: string
}

export function MetricTooltip({ content, children, className }: MetricTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <Info className={cn("h-4 w-4 text-muted-foreground cursor-help", className)} />
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
