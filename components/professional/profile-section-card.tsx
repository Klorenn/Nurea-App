"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Pencil } from "lucide-react"

/**
 * Bloque de configuración tipo Doctoralia: columna izquierda (título + descripción),
 * columna derecha (card blanco con contenido y botón Editar).
 */
export interface ProfileSectionCardProps {
  title: string
  description: string
  children: React.ReactNode
  onEdit?: () => void
  isEditing?: boolean
  editLabel?: string
  className?: string
}

export function ProfileSectionCard({
  title,
  description,
  children,
  onEdit,
  isEditing,
  editLabel = "Editar",
  className,
}: ProfileSectionCardProps) {
  return (
    <div className={cn("w-full", className)}>
      <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm overflow-hidden">
        <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {title}
          </span>
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className={cn(
                "h-8 px-3 text-xs font-medium text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400",
                isEditing && "text-teal-600 dark:text-teal-400"
              )}
            >
              {isEditing ? (
                <>
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-teal-100 dark:bg-teal-900/50 mr-1.5 text-teal-600 dark:text-teal-400 text-[10px]">✔</span>
                  {editLabel}
                </>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  {editLabel}
                </>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-3">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

