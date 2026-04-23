"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

interface AccordionSectionProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  iconVariant: "teal" | "blue" | "violet"
  preview: string
  children: React.ReactNode
  defaultOpen?: boolean
  editButton?: React.ReactNode
}

const iconStyles: Record<AccordionSectionProps["iconVariant"], React.CSSProperties> = {
  teal:   { background: "#f0fdfa", color: "#0d9488" },
  blue:   { background: "#eff6ff", color: "#3b82f6" },
  violet: { background: "#f5f3ff", color: "#7c3aed" },
}

export function AccordionSection({
  title,
  subtitle,
  icon,
  iconVariant,
  preview,
  children,
  defaultOpen = false,
  editButton,
}: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className={cn(
        "bg-white transition-all duration-200 rounded-2xl overflow-hidden",
        open 
          ? "border-2 border-teal-500 shadow-lg shadow-teal-100/50 dark:shadow-teal-900/20" 
          : "border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
      )}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between text-left transition-colors",
          open 
            ? "bg-gradient-to-r from-teal-50/50 to-transparent dark:from-teal-950/30" 
            : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
        )}
        style={{ padding: "18px 20px" }}
      >
        {/* Left: icon + titles */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <span
            className="flex items-center justify-center shrink-0 shadow-sm"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              ...iconStyles[iconVariant],
            }}
          >
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-slate-900 dark:text-white truncate">{title}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">{subtitle}</p>
          </div>
        </div>

        {/* Right: preview + edit button + chevron */}
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {!open && preview && (
            <span
              className="hidden sm:block text-right truncate text-sm text-slate-400 dark:text-slate-500 max-w-[180px]"
            >
              {preview}
            </span>
          )}
          {open && editButton}
          <span
            className={cn(
              "flex items-center justify-center rounded-lg transition-all duration-200",
              open ? "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400" : "text-slate-400 dark:text-slate-500"
            )}
            style={{ width: 28, height: 28 }}
          >
            <ChevronDown className="h-5 w-5" />
          </span>
        </div>
      </button>

      {/* Content */}
      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── FieldRow ────────────────────────────────────────────────────────────────

interface FieldRowProps {
  label: string
  value: string | React.ReactNode
  emptyText?: string
  onEdit?: () => void
  editing?: boolean
  editContent?: React.ReactNode
}

export function FieldRow({
  label,
  value,
  emptyText = "Sin completar",
  onEdit,
  editing,
  editContent,
}: FieldRowProps) {
  const isEmpty = !value || (typeof value === "string" && value.trim() === "")

  return (
    <div
      className={cn(
        "flex items-center transition-all",
        editing 
          ? "bg-teal-50/30 dark:bg-teal-950/20 border-l-4 border-l-teal-500 pl-4 pr-5 py-3" 
          : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-5 py-3 border-b border-slate-100 dark:border-slate-800"
      )}
      style={{ gap: 16 }}
    >
      <span
        className="shrink-0 text-sm text-slate-500 dark:text-slate-400 font-medium w-36 min-w-[100px]"
      >
        {label}
      </span>

      {editing ? (
        <div className="flex-1">{editContent}</div>
      ) : (
        <>
          <span
            className={cn("flex-1 text-sm", isEmpty ? "italic text-slate-400 dark:text-slate-600" : "text-slate-800 dark:text-slate-200 font-semibold")}
          >
            {isEmpty ? emptyText : value}
          </span>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="shrink-0 flex items-center justify-center rounded-lg p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:text-teal-400 dark:hover:bg-teal-950/30 transition-all"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ─── ToggleRow ────────────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}

export function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: ToggleRowProps) {
  return (
    <div
      className="flex items-center px-5 py-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
      style={{ gap: 16, borderBottom: "1px solid #f1f5f9" }}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
