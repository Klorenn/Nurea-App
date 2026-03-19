"use client"

import { useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Upload, X } from "lucide-react"

interface AvatarDropzoneProps {
  avatarUrl?: string | null
  onFileChange: (file: File | null) => void
  disabled?: boolean
  helpText?: string
  accept?: string
}

export function AvatarDropzone({
  avatarUrl,
  onFileChange,
  disabled,
  helpText,
  accept = "image/*",
}: AvatarDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const effectivePreviewUrl = useMemo(() => {
    return previewUrl || avatarUrl || null
  }, [previewUrl, avatarUrl])

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null)
      return
    }
    const nextPreviewUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(nextPreviewUrl)

    return () => {
      URL.revokeObjectURL(nextPreviewUrl)
    }
  }, [selectedFile])

  const setFileFromInput = (file: File | null) => {
    if (disabled) return
    if (!file) return
    if (!file.type.startsWith("image/")) return

    setSelectedFile(file)
    onFileChange(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (disabled) return

    const file = e.dataTransfer.files?.[0] || null
    setIsDragging(false)
    setFileFromInput(file)
  }

  const handlePickFile = () => {
    if (disabled) return
    const el = document.getElementById("avatar-dropzone-file-input") as HTMLInputElement | null
    el?.click()
  }

  const clearFile = () => {
    if (disabled) return
    setSelectedFile(null)
    setPreviewUrl(null)
    onFileChange(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-24 w-24 ring-1 ring-teal-500/30">
          {effectivePreviewUrl ? (
            <AvatarImage src={effectivePreviewUrl} alt="Avatar preview" className="object-cover" />
          ) : (
            <AvatarFallback>Foto</AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 text-left">
          {helpText ? <p className="text-sm text-slate-600">{helpText}</p> : null}
          <p className="text-xs text-slate-500 mt-1">
            {effectivePreviewUrl ? "Puedes cambiar la imagen si lo deseas." : "Arrastra una imagen o selecciona un archivo."}
          </p>
        </div>
      </div>

      <div
        onDragEnter={() => !disabled && setIsDragging(true)}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handlePickFile()
        }}
        onClick={handlePickFile}
        className={cn(
          "relative rounded-2xl border-2 border-dashed p-6 transition-all cursor-pointer",
          isDragging ? "border-teal-500/70 bg-teal-50/60" : "border-slate-300 hover:border-teal-500/50 bg-white"
        )}
      >
        <input
          id="avatar-dropzone-file-input"
          type="file"
          accept={accept}
          disabled={disabled}
          className="hidden"
          onChange={(e) => setFileFromInput(e.target.files?.[0] || null)}
        />

        <div className="flex flex-col items-center justify-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center ring-1 ring-teal-500/20">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">
              {selectedFile ? "Imagen seleccionada" : "Drag & drop tu avatar"}
            </p>
            <p className="text-xs text-slate-600">
              {selectedFile ? selectedFile.name : "o haz clic para elegir un archivo (JPG/PNG/WEBP)"}
            </p>
          </div>
        </div>
      </div>

      {effectivePreviewUrl && selectedFile ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Vista previa lista. La imagen se subirá al finalizar el último paso.
          </p>
          <Button type="button" variant="outline" onClick={clearFile} className="border-slate-200">
            <X className="w-4 h-4 mr-2" />
            Quitar
          </Button>
        </div>
      ) : null}
    </div>
  )
}

