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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent className="h-max md:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isSpanish ? "Subir Foto de Perfil" : "Upload Profile Photo"}
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <Input
            disabled={isPending}
            onChange={handleFileChange}
            type="file"
            accept="image/*"
          />
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}
          {photo?.file && (
            <div className="bg-accent relative aspect-square w-full overflow-hidden rounded-lg">
              <Cropper
                image={photo.url}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
                classes={{
                  containerClassName: isPending
                    ? 'opacity-80 pointer-events-none'
                    : '',
                }}
              />
            </div>
          )}
        </DialogBody>

        <DialogFooter className="grid w-full grid-cols-2">
          <Button
            className="w-full"
            variant="outline"
            disabled={isPending}
            onClick={handleClose}
          >
            {isSpanish ? "Cancelar" : "Cancel"}
          </Button>

          <Button
            className="w-full"
            type="button"
            onClick={handleUpdate}
            disabled={isPending || !photo?.file}
          >
            {isPending 
              ? (isSpanish ? "Subiendo..." : "Uploading...")
              : (isSpanish ? "Actualizar" : "Update")}
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
  pixelCrop: Area,
  rotation = 0,
  flip: Flip = { horizontal: false, vertical: false },
): Promise<{ url: string; file: Blob | null } | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to create 2D context')
  }

  const rotRad = getRadianAngle(rotation)

  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation,
  )

  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  ctx.drawImage(image, 0, 0)

  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
  )

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(data, 0, 0)

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
    })
  })
}
