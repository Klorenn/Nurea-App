"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-border/40", className)}>
      <CardContent className="p-12 text-center">
        {Icon && (
          <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        )}
        <p className="text-muted-foreground font-medium mb-2">
          {title}
        </p>
        {description && (
          <p className="text-sm text-muted-foreground mb-4">
            {description}
          </p>
        )}
        {action && (
          <div className="mt-4">
            {action.href ? (
              <Button className="rounded-xl transition-transform hover:scale-105 active:scale-95" asChild>
                <Link href={action.href}>
                  {action.label}
                </Link>
              </Button>
            ) : action.onClick ? (
              <Button 
                className="rounded-xl transition-transform hover:scale-105 active:scale-95"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
