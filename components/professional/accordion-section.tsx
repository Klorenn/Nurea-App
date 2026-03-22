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
  // not in spec Props table but required to implement spec requirement: "Editar button in accordion header (right side, next to chevron)" for Bio accordion
  editButton?: React.ReactNode
}

const iconBg: Record<AccordionSectionProps["iconVariant"], string> = {
  teal:   "bg-teal-50 text-teal-600",
  blue:   "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
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
        "rounded-xl transition-all duration-200",
        open
          ? "border-[1.5px] border-teal-600 shadow-[0_0_0_3px_rgba(13,148,136,0.08)] bg-white"
          : "border border-slate-200 bg-white hover:bg-slate-50/80"
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        style={{
          background: open ? "#f0fdfa" : undefined,
          borderRadius: open ? "10px 10px 0 0" : "10px",
          borderBottom: open ? "1px solid #e0fdf4" : undefined,
        }}
      >
        {/* Icon */}
        <span className={cn("p-2 rounded-lg shrink-0", iconBg[iconVariant])}>
          {icon}
        </span>

        {/* Title + subtitle */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>

        {/* Preview + extra button + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {!open && (
            <span className="text-xs text-slate-500 truncate max-w-[140px] hidden sm:block">
              {preview}
            </span>
          )}
          {open && editButton}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              open ? "rotate-180 text-teal-600" : "text-slate-400"
            )}
          />
        </div>
      </button>

      {/* Content */}
      {open && (
        <div className="px-4 pb-4 pt-3 space-y-1">
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
        "flex items-center gap-3 py-2.5 px-3 rounded-lg",
        editing ? "border-l-[3px] border-teal-600 bg-[#fafffe]" : ""
      )}
    >
      <span
        className="shrink-0 text-slate-400"
        style={{ fontSize: "12.5px", width: 160, minWidth: 120 }}
      >
        {label}
      </span>

      {editing ? (
        <div className="flex-1">{editContent}</div>
      ) : (
        <>
          <span
            className={cn(
              "flex-1 font-semibold",
              isEmpty ? "text-slate-300 italic" : "text-slate-800"
            )}
            style={{ fontSize: "13.5px" }}
          >
            {isEmpty ? emptyText : value}
          </span>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
