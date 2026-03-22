"use client"

import { useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { AnimatedTabs } from "@/components/ui/animated-tabs"
import type { Tab } from "@/components/ui/animated-tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Trash2, Loader2, Pencil, Check, X, ImageOff } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface ConsultationPhoto {
  id: string
  storage_path: string
  description: string | null
  created_at: string
  signedUrl?: string
}

interface ConsultationPhotosProps {
  appointmentId: string
  professionalId: string
  initialPhotos?: ConsultationPhoto[]
  isSpanish?: boolean
}

export function ConsultationPhotos({
  appointmentId,
  professionalId,
  initialPhotos = [],
  isSpanish = true,
}: ConsultationPhotosProps) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photos, setPhotos] = useState<ConsultationPhoto[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDesc, setEditDesc] = useState("")
  const [savingDesc, setSavingDesc] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Upload ──────────────────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ""

    setUploading(true)
    try {
      for (const file of files) {
        const ext = file.name.split(".").pop() ?? "jpg"
        const path = `${professionalId}/${appointmentId}/${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from("consultation-photos")
          .upload(path, file, { upsert: false })

        if (uploadError) {
          toast.error(isSpanish ? `Error al subir ${file.name}` : `Error uploading ${file.name}`)
          continue
        }

        const { data: inserted, error: insertError } = await supabase
          .from("consultation_photos")
          .insert({
            appointment_id: appointmentId,
            professional_id: professionalId,
            storage_path: path,
            description: null,
          })
          .select()
          .single()

        if (insertError || !inserted) {
          toast.error(isSpanish ? "Error al registrar la foto" : "Error registering photo")
          continue
        }

        // Get signed URL for display (private bucket)
        const { data: signedData } = await supabase.storage
          .from("consultation-photos")
          .createSignedUrl(path, 3600)

        setPhotos((prev) => [
          ...prev,
          { ...inserted, signedUrl: signedData?.signedUrl },
        ])
      }
      toast.success(isSpanish ? "Foto(s) subida(s)" : "Photo(s) uploaded")
    } finally {
      setUploading(false)
    }
  }

  // ── Description edit ────────────────────────────────────────────────────────

  const startEditing = (photo: ConsultationPhoto) => {
    setEditingId(photo.id)
    setEditDesc(photo.description ?? "")
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditDesc("")
  }

  const saveDescription = async (photoId: string) => {
    setSavingDesc(true)
    const { error } = await supabase
      .from("consultation_photos")
      .update({ description: editDesc.trim() || null })
      .eq("id", photoId)

    if (error) {
      toast.error(isSpanish ? "Error al guardar descripción" : "Error saving description")
    } else {
      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, description: editDesc.trim() || null } : p))
      )
      setEditingId(null)
      setEditDesc("")
    }
    setSavingDesc(false)
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  const deletePhoto = async (photo: ConsultationPhoto) => {
    setDeletingId(photo.id)
    try {
      await supabase.storage.from("consultation-photos").remove([photo.storage_path])
      await supabase.from("consultation_photos").delete().eq("id", photo.id)
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
      toast.success(isSpanish ? "Foto eliminada" : "Photo deleted")
    } catch {
      toast.error(isSpanish ? "Error al eliminar" : "Error deleting")
    } finally {
      setDeletingId(null)
    }
  }

  // ── Build tabs ──────────────────────────────────────────────────────────────

  const tabs: Tab[] = photos.map((photo, idx) => ({
    id: photo.id,
    label: `Foto ${idx + 1}`,
    content: (
      <div className="flex flex-col gap-0">
        {/* Image */}
        <div className="relative bg-slate-100 dark:bg-slate-800">
          {photo.signedUrl ? (
            <img
              src={photo.signedUrl}
              alt={photo.description ?? `Foto ${idx + 1}`}
              className="w-full max-h-72 object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400">
              <ImageOff className="h-10 w-10" />
            </div>
          )}

          {/* Delete button overlay */}
          <button
            onClick={() => deletePhoto(photo)}
            disabled={deletingId === photo.id}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/90 hover:bg-red-600 text-white shadow transition-opacity opacity-0 hover:opacity-100 group-hover:opacity-100"
            style={{ opacity: 0.85 }}
            title={isSpanish ? "Eliminar foto" : "Delete photo"}
          >
            {deletingId === photo.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Description */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <AnimatePresence mode="wait">
            {editingId === photo.id ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex flex-col gap-2"
              >
                <Textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder={isSpanish ? "Descripción de la foto..." : "Photo description..."}
                  className="text-sm min-h-[60px] resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => saveDescription(photo.id)}
                    disabled={savingDesc}
                    className="h-7 gap-1 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {savingDesc ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    {isSpanish ? "Guardar" : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEditing}
                    className="h-7 gap-1"
                  >
                    <X className="h-3 w-3" />
                    {isSpanish ? "Cancelar" : "Cancel"}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start justify-between gap-2"
              >
                <p className={cn("text-sm flex-1", photo.description ? "text-slate-700 dark:text-slate-300" : "text-slate-400 italic")}>
                  {photo.description ?? (isSpanish ? "Sin descripción" : "No description")}
                </p>
                <button
                  onClick={() => startEditing(photo)}
                  className="shrink-0 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                  title={isSpanish ? "Editar descripción" : "Edit description"}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    ),
  }))

  return (
    <div className="space-y-3">
      {/* Upload button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {photos.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {photos.length} {isSpanish ? (photos.length === 1 ? "foto" : "fotos") : (photos.length === 1 ? "photo" : "photos")}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2 text-teal-600 border-teal-200 hover:bg-teal-50 dark:hover:bg-teal-950/30"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isSpanish ? "Subir foto" : "Upload photo"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Photos */}
      {photos.length === 0 ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:border-teal-400 hover:text-teal-500 transition-colors"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Camera className="h-8 w-8" />
          )}
          <span className="text-sm">
            {uploading
              ? (isSpanish ? "Subiendo..." : "Uploading...")
              : (isSpanish ? "Haz clic para subir fotos" : "Click to upload photos")}
          </span>
        </button>
      ) : (
        <AnimatedTabs tabs={tabs} defaultTab={photos[photos.length - 1]?.id} />
      )}
    </div>
  )
}
