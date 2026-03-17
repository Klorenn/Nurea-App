"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Loader2 } from "lucide-react"
import { AvatarUploader } from "@/components/ui/avatar-uploader"

interface ProfilePhotoUploadProps {
  currentUrl?: string
  onUpload: (file: File) => Promise<{ success: boolean }>
}

export function ProfilePhotoUpload({ currentUrl, onUpload }: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const result = await onUpload(file)
      return result
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
        <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-900 shadow-xl relative">
          <AvatarImage src={currentUrl} className="object-cover" />
          <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-400 text-2xl font-bold">
            {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : "DR"}
          </AvatarFallback>
        </Avatar>
        
        <AvatarUploader onUpload={handleUpload}>
          <Button 
            size="icon" 
            className="absolute bottom-0 right-0 rounded-full h-10 w-10 bg-teal-600 hover:bg-teal-700 text-white shadow-lg border-2 border-white dark:border-slate-900 transition-transform hover:scale-110 active:scale-95"
          >
            <Camera className="h-5 w-5" />
          </Button>
        </AvatarUploader>
      </div>
      
      <div className="text-center">
        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Foto de Perfil</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Sube una foto profesional</p>
      </div>
    </div>
  )
}
