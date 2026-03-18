"use client"

import React from 'react'
import Cropper, { Area, Point } from 'react-easy-crop'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/contexts/language-context'

import { Slider } from '@/components/ui/slider'
import { ZoomIn, ZoomOut, Upload } from 'lucide-react'

interface Props {
  children: React.ReactNode
  onUpload: (file: File) => Promise<{ success: boolean }>
  aspect?: number // default 1 (square)
  maxSizeMB?: number // default 20
  acceptedTypes?: string[] // default jpg, jpeg, png, webp
}

export function AvatarUploader({
  children,
  onUpload,
  aspect = 1,
  maxSizeMB = 20,
  acceptedTypes = ['jpeg', 'jpg', 'png', 'webp'],
}: Props) {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState<number>(1)
  const [isPending, setIsPending] = React.useState<boolean>(false)
  const [photo, setPhoto] = React.useState<{ url: string; file: File | null }>({
    url: '',
    file: null,
  })
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState<boolean>(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    const img_ext = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase()
    const validExt = acceptedTypes.includes(img_ext)

    if (!validExt) {
      setError(isSpanish 
        ? 'El archivo seleccionado no es un tipo de imagen soportado'
        : 'Selected file is not a supported image type')
      return
    }

    if (parseFloat(String(file.size)) / (1024 * 1024) >= maxSizeMB) {
      setError(isSpanish
        ? `La imagen es demasiado grande. Máximo ${maxSizeMB}MB`
        : `Selected image is too large. Maximum ${maxSizeMB}MB`)
      return
    }

    setPhoto({ url: URL.createObjectURL(file), file })
  }

  const handleCropComplete = (_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const handleUpdate = async () => {
    if (photo?.file && croppedAreaPixels) {
      setIsPending(true)
      setError(null)
      try {
        const croppedImg = await getCroppedImg(photo?.url, croppedAreaPixels)
        if (!croppedImg || !croppedImg.file) {
          throw new Error(isSpanish 
            ? 'Error al recortar la imagen'
            : 'Failed to crop image')
        }

        const file = new File(
          [croppedImg.file],
          photo.file?.name ?? 'cropped.jpeg',
          {
            type: photo.file?.type ?? 'image/jpeg',
          },
        )

        const result = await onUpload(file)
        if (result.success) {
          setPhoto({ url: '', file: null })
          setOpen(false)
        } else {
          throw new Error(isSpanish
            ? 'Error al subir la imagen'
            : 'Failed to upload image')
        }
      } catch (err) {
        console.error("AvatarUploader Error:", err)
        setError(err instanceof Error
          ? err.message
          : (isSpanish ? 'Error al procesar la imagen' : 'Failed to process image'))
      } finally {
        setIsPending(false)
      }
    } else {
      setError(isSpanish
        ? 'No se ha seleccionado ninguna imagen para subir'
        : 'No image selected for upload')
    }
  }

  const handleClose = () => {
    if (!isPending) {
      setOpen(false)
      setPhoto({ url: '', file: null })
      setError(null)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose()
        } else {
          setOpen(true)
        }
      }}
    >
      <DialogTrigger asChild onClick={() => setOpen(true)} data-avatar-uploader-trigger>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-white dark:bg-slate-950">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-black">
            {isSpanish ? "Ajustar Foto de Perfil" : "Adjust Profile Photo"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 pt-0 space-y-6">
          {!photo.file ? (
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 transition-colors hover:border-teal-500/50 hover:bg-teal-50/10 group relative overflow-hidden cursor-pointer"
              onClick={() => {
                if (!isPending) {
                  fileInputRef.current?.click()
                }
              }}
            >
              <Upload className="h-12 w-12 text-slate-300 group-hover:text-teal-500 transition-colors mb-4" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 text-center">
                {isSpanish ? "Arrastra tu foto aquí o haz clic para seleccionar" : "Drag your photo here or click to select"}
              </p>
              <Input
                ref={fileInputRef}
                disabled={isPending}
                onChange={handleFileChange}
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          ) : (
            <>
              <div className="bg-slate-100 dark:bg-slate-900 relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                <Cropper
                  image={photo.url}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                  cropShape="round"
                  showGrid={false}
                  classes={{
                    containerClassName: isPending ? 'opacity-50 pointer-events-none' : '',
                  }}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <ZoomOut className="h-4 w-4 text-slate-400" />
                  <Slider
                    value={[zoom]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={([val]) => setZoom(val)}
                    className="flex-1"
                  />
                  <ZoomIn className="h-4 w-4 text-slate-400" />
                </div>
                
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {isSpanish ? "Nombre del archivo" : "File name"}
                  </span>
                  <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                    {photo.file.name}
                  </span>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="text-sm font-bold text-red-600 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 animate-in shake-1">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 gap-3 sm:gap-0">
          <Button
            variant="ghost"
            disabled={isPending}
            onClick={handleClose}
            className="font-bold text-slate-600"
          >
            {isSpanish ? "Cancelar" : "Cancel"}
          </Button>

          <Button
            type="button"
            onClick={handleUpdate}
            disabled={isPending || !photo?.file}
            className="bg-teal-600 hover:bg-teal-700 text-white font-black px-8 rounded-xl shadow-lg shadow-teal-500/20"
          >
            {isPending 
              ? (isSpanish ? "Subiendo..." : "Uploading...")
              : (isSpanish ? "Guardar Cambios" : "Save Changes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180
}

function rotateSize(
  width: number,
  height: number,
  rotation: number,
): { width: number; height: number } {
  const rotRad = getRadianAngle(rotation)

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

type Flip = {
  horizontal: boolean
  vertical: boolean
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<{ url: string; file: Blob | null } | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to create 2D context')
  }

  // Set canvas size to the cropped size
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // Draw the cropped portion of the image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (!file) {
        reject(new Error('Failed to generate cropped image blob'))
        return
      }
      resolve({
        url: URL.createObjectURL(file),
        file,
      })
    }, 'image/jpeg', 0.95)
  })
}
