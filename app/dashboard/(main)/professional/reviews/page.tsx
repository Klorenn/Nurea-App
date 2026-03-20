"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Star, Loader2, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string | null
  patient: {
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  } | null
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const starSize = size === "lg" ? "h-5 w-5" : "h-4 w-4"
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(starSize, n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200")}
        />
      ))}
    </div>
  )
}

export default function ProfessionalReviewsPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const supabase = createClient()

  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          patient:profiles!reviews_patient_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false })

      if (!error) {
        setReviews((data || []) as unknown as Review[])
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isSpanish ? "Opiniones" : "Reviews"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSpanish
            ? "Las valoraciones que tus pacientes han dejado tras las consultas."
            : "Ratings your patients have left after consultations."}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="font-medium text-muted-foreground">
              {isSpanish ? "Aún no tienes opiniones" : "No reviews yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isSpanish
                ? "Las opiniones de tus pacientes aparecerán aquí tras completar consultas."
                : "Patient reviews will appear here after completing consultations."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Aggregate Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{isSpanish ? "Valoración media" : "Average rating"}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <span className="text-5xl font-black text-slate-900 dark:text-white">
                  {avgRating.toFixed(1)}
                </span>
                <div className="space-y-1">
                  <StarRating rating={Math.round(avgRating)} size="lg" />
                  <p className="text-sm text-muted-foreground">
                    {reviews.length} {isSpanish ? "opiniones" : "reviews"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{isSpanish ? "Distribución" : "Distribution"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {distribution.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-right text-muted-foreground">{star}</span>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="w-5 text-right text-muted-foreground">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Reviews List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-teal-600" />
                {isSpanish ? "Todas las opiniones" : "All reviews"}
              </CardTitle>
              <CardDescription>
                {isSpanish ? "Las opiniones son anónimas para los demás pacientes." : "Reviews are anonymous to other patients."}
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/50">
              {reviews.map((review) => {
                const name = review.patient
                  ? `${review.patient.first_name?.[0] ?? "P"}. ${review.patient.last_name ?? ""}`.trim()
                  : (isSpanish ? "Paciente" : "Patient")
                const initials = review.patient
                  ? `${review.patient.first_name?.[0] ?? ""}${review.patient.last_name?.[0] ?? ""}`
                  : "P"
                const dateStr = review.created_at
                  ? new Date(review.created_at).toLocaleDateString(isSpanish ? "es-CL" : "en-US", {
                      year: "numeric", month: "short", day: "numeric",
                    })
                  : ""

                return (
                  <div key={review.id} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={review.patient?.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-teal-100 text-teal-700 font-semibold text-sm">
                          {initials.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-medium text-sm">{name}</span>
                          <span className="text-xs text-muted-foreground">{dateStr}</span>
                        </div>
                        <StarRating rating={review.rating} />
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            "{review.comment}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
