"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ErrorStateProps {
  title?: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function ErrorState({
  title,
  message,
  action,
  className,
}: ErrorStateProps) {
  return (
    <Card className={cn("border-border/40", className)}>
      <CardContent className="p-12 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        {title && (
          <p className="text-lg font-semibold mb-2">{title}</p>
        )}
        <p className="text-muted-foreground mb-4">{message}</p>
        {action && (
          <Button 
            className="rounded-xl"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
