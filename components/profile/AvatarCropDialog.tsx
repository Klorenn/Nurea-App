"use client"

import { useState, useEffect, useCallback } from "react"
import Cropper, { Area } from "react-easy-crop"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

interface AvatarCropDialogProps {
  open: boolean
  file: File | null
  onOpenChange: (open: boolean) => void
  onConfirm: (file: File) => Promise<void> | void
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })
}

async function getCroppedBlob(imageSrc: string, croppedAreaPixels: Area): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("No se pudo crear el contexto del canvas")
  }

  const { width, height, x, y } = croppedAreaPixels
  canvas.width = width
  canvas.height = height

  ctx.drawImage(image, x, y, width, height, 0, 0, width, height)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error("No se pudo generar la imagen recortada"))
    }, "image/jpeg", 0.9)
  })
}

export function AvatarCropDialog({ open, file, onOpenChange, onConfirm }: AvatarCropDialogProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!file) {
      setImageUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!imageUrl || !croppedAreaPixels || !file) return
    setSaving(true)
    try {
      const blob = await getCroppedBlob(imageUrl, croppedAreaPixels)
      const croppedFile = new File([blob], file.name || "avatar.jpg", { type: "image/jpeg" })
      await onConfirm(croppedFile)
      onOpenChange(false)
    } catch (err) {
      console.error("Error cropping avatar:", err)
    } finally {
      setSaving(false)
    }
  }, [imageUrl, croppedAreaPixels, file, onConfirm, onOpenChange])

  if (!imageUrl) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar foto de perfil</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative w-full aspect-square bg-muted rounded-2xl overflow-hidden">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Zoom</p>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={([value]) => setZoom(value)}
            />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="rounded-xl"
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={saving} className="rounded-xl">
            {saving ? "Guardando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

