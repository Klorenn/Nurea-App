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
      className="bg-white transition-all duration-200"
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: open ? "1.5px solid #0d9488" : "1px solid #e2e8f0",
        boxShadow: open ? "0 0 0 3px rgba(13,148,136,0.08)" : undefined,
      }}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left transition-colors hover:bg-slate-50"
        style={{
          padding: "15px 22px",
          background: open ? "#f0fdfa" : undefined,
          borderBottom: open ? "1px solid #e0fdf4" : undefined,
        }}
      >
        {/* Left: icon + titles */}
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center shrink-0"
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              ...iconStyles[iconVariant],
            }}
          >
            {icon}
          </span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{title}</p>
            <p style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>{subtitle}</p>
          </div>
        </div>

        {/* Right: preview + edit button + chevron */}
        <div className="flex items-center gap-2.5 shrink-0 ml-4">
          {!open && preview && (
            <span
              className="hidden sm:block text-right truncate"
              style={{ fontSize: 12, color: "#94a3b8", maxWidth: 200 }}
            >
              {preview}
            </span>
          )}
          {open && editButton}
          <span
            className="flex items-center justify-center"
            style={{
              width: 20,
              height: 20,
              transition: "transform 0.2s",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <ChevronDown
              style={{ width: 16, height: 16, stroke: open ? "#0d9488" : "#94a3b8" }}
            />
          </span>
        </div>
      </button>

      {/* Content */}
      {open && <div>{children}</div>}
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
      className="flex items-center"
      style={{
        padding: editing ? "13px 22px 13px 19px" : "13px 22px",
        borderBottom: "1px solid #f8fafc",
        gap: 16,
        background: editing ? "#fafffe" : undefined,
        borderLeft: editing ? "3px solid #0d9488" : undefined,
      }}
    >
      <span
        className="shrink-0"
        style={{ fontSize: 12.5, color: "#94a3b8", fontWeight: 500, width: 160, minWidth: 100 }}
      >
        {label}
      </span>

      {editing ? (
        <div className="flex-1">{editContent}</div>
      ) : (
        <>
          <span
            className={cn("flex-1", isEmpty ? "italic" : "")}
            style={{
              fontSize: 13.5,
              fontWeight: isEmpty ? 400 : 600,
              color: isEmpty ? "#cbd5e1" : "#1e293b",
            }}
          >
            {isEmpty ? emptyText : value}
          </span>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="shrink-0 flex items-center justify-center transition-all"
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                border: "1px solid transparent",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f1f5f9"
                e.currentTarget.style.borderColor = "#e2e8f0"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.borderColor = "transparent"
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#cbd5e1"
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
      className="flex items-center"
      style={{ padding: "13px 22px", borderBottom: "1px solid #f8fafc", gap: 16 }}
    >
      <div className="flex-1">
        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>{label}</p>
        <p style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
