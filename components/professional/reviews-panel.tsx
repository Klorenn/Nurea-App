"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { X } from "lucide-react"
import { toast } from "sonner"

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  reply_text: string | null
  replied_at: string | null
  patient: { first_name: string; last_name: string } | null
}

interface ReviewsPanelProps {
  professionalId: string
  onClose: () => void
}

const COLORS = [
  "bg-teal-100 text-teal-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-orange-100 text-orange-700",
]

export function ReviewsPanel({ professionalId, onClose }: ReviewsPanelProps) {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchReviews() {
      const { data } = await supabase
        .from("reviews")
        .select(
          "id, rating, comment, created_at, reply_text, replied_at, patient:profiles(first_name, last_name)"
        )
        .eq("doctor_id", professionalId)
        .order("created_at", { ascending: false })
      setReviews((data as unknown as Review[]) ?? [])
      setLoading(false)
    }
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professionalId])

  const avg =
    reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null

  const unanswered = reviews.filter((r) => r.replied_at === null).length

  async function handleReply(reviewId: string) {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/professional/reviews/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: reviewId, reply_text: replyText.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, reply_text: replyText.trim(), replied_at: new Date().toISOString() }
            : r
        )
      )
      setReplyingTo(null)
      setReplyText("")
      toast.success("Respuesta publicada")
    } catch (e: any) {
      toast.error(e.message ?? "Error al publicar")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border-[1.5px] border-teal-600 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-teal-100 bg-teal-50/40">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Valoraciones de pacientes{avg ? ` — ${avg} ★` : ""}
          </h3>
          {unanswered > 0 && (
            <p className="text-xs text-teal-600 font-medium mt-0.5">
              {unanswered} sin responder
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Reviews list */}
      <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
        {loading && (
          <div className="px-5 py-8 text-center text-sm text-slate-400">
            Cargando valoraciones…
          </div>
        )}
        {!loading && reviews.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-slate-400">
            Aún no tienes valoraciones.
          </div>
        )}
        {reviews.map((review, i) => {
          const name = review.patient
            ? `${review.patient.first_name} ${review.patient.last_name}`
            : "Paciente"
          const initials = name
            .split(" ")
            .map((w) => w[0] ?? "")
            .slice(0, 2)
            .join("")
            .toUpperCase()
          const colorClass = COLORS[i % COLORS.length]
          const isReplying = replyingTo === review.id

          return (
            <div key={review.id} className="px-5 py-4 space-y-2">
              {/* Patient info row */}
              <div className="flex items-start gap-3">
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}
                >
                  {initials}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{name}</span>
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(review.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  {/* Stars */}
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <span key={si} className={si < review.rating ? "text-amber-400" : "text-slate-200"}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-sm text-slate-600 pl-12">{review.comment}</p>
              )}

              {/* Reply block or reply form */}
              {review.reply_text ? (
                <div className="ml-12 pl-3 border-l-[3px] border-teal-600">
                  <p className="text-xs font-semibold text-teal-700 mb-0.5">Tu respuesta</p>
                  <p className="text-sm text-slate-600">{review.reply_text}</p>
                </div>
              ) : isReplying ? (
                <div className="ml-12 space-y-2">
                  <textarea
                    className="w-full rounded-lg border border-teal-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-400 text-sm p-2.5 resize-none outline-none text-slate-700"
                    rows={3}
                    maxLength={500}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Escribe tu respuesta…"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyText("")
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={submitting || !replyText.trim()}
                      onClick={() => handleReply(review.id)}
                      className="text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {submitting ? "Publicando…" : "Publicar"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ml-12">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(review.id)
                      setReplyText("")
                    }}
                    className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    Responder
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
