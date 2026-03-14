"use client"

import { Suspense } from "react"
import { ExploreContent } from "./explore-content"
import { Navbar } from "@/components/navbar"
import { PaperShaderBackground } from "@/components/ui/background-paper-shaders"
import WavyBackground from "@/components/ui/wavy-background"
import { Loader2 } from "lucide-react"

function LoadingFallback() {
  return (
    <main className="min-h-screen relative">
      <PaperShaderBackground />
      <div className="absolute inset-0 pointer-events-none">
        <WavyBackground className="absolute inset-0" />
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar sticky={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ExploreContent />
    </Suspense>
  )
}
