import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Shield } from "lucide-react"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: {
    template: "%s | NUREA Legal",
    default: "Documentación Legal | NUREA",
  },
  description: "Documentación legal, términos de servicio y políticas de privacidad de NUREA.",
}

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <Image
                src="/logo.png"
                alt="NUREA"
                width={28}
                height={28}
                className="h-7 w-7 rounded-md"
              />
              <span className="font-medium">NUREA</span>
            </Link>

            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Centro Legal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Document Content */}
      <main className="flex-1">
        <article className="max-w-3xl mx-auto py-12 sm:py-16 px-6">
          <div className="prose prose-slate dark:prose-invert prose-teal max-w-none
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-h1:text-3xl prose-h1:sm:text-4xl prose-h1:mb-4
            prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-lg prose-h3:sm:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-slate-600 prose-p:dark:text-slate-300 prose-p:leading-relaxed
            prose-li:text-slate-600 prose-li:dark:text-slate-300
            prose-strong:text-slate-900 prose-strong:dark:text-white
            prose-a:text-teal-600 prose-a:dark:text-teal-400 prose-a:no-underline hover:prose-a:underline
          ">
            {children}
          </div>
        </article>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
