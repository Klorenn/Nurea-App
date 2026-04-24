export const dynamic = 'force-dynamic'

import { ForumMain } from "@/components/forum/forum-main"

export default async function ForumPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Comunidad NUREA
        </h1>
        <p className="text-muted-foreground mt-2">
          Comparte preguntas, consejos y conecta con profesionales de la salud
        </p>
      </div>

      <ForumMain />
    </div>
  )
}