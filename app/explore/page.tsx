"use client"

import { Suspense } from "react"
import { ExploreContent } from "./explore-content"
import { Navbar } from "@/components/navbar"
import { Loader2 } from "lucide-react"

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar sticky={false} />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
