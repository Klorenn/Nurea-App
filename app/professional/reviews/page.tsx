"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, MessageCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

interface Review {
  id: string
  userName: string
  rating: number
  comment: string
  date: string
  appointmentId: string
  reply?: string
}

export default function ReviewsManagementPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "1",
      userName: "Nicolas M.",
      rating: 5,
      comment: "Dr. Vargas is exceptionally empathetic and professional. Her guidance has been transformative for my mental health.",
      date: "2024-10-01",
      appointmentId: "NR-99231",
    },
    {
      id: "2",
      userName: "Camila S.",
      rating: 5,
      comment: "Great experience. The online sessions are very convenient and the platform works flawlessly.",
      date: "2024-09-15",
      appointmentId: "NR-98112",
    },
  ])

  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) return
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, reply: replyText.trim() } : r))
    )
    setReplyText("")
    setReplyingToId(null)
  }

  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0

  return (
    <RouteGuard requiredRole="professional">
      <DashboardLayout role="professional">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isSpanish ? "Gestión de Reseñas" : "Reviews Management"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isSpanish ? "Lee comentarios y responde a tus pacientes" : "Read comments and reply to your patients"}
              </p>
            </div>
          </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="border-border/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isSpanish ? "Total Reseñas" : "Total Reviews"}
                  </p>
                  <p className="text-3xl font-bold mt-1">{reviews.length}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Star className="h-6 w-6 fill-current" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isSpanish ? "Calificación Promedio" : "Average Rating"}
                  </p>
                  <p className="text-3xl font-bold mt-1">{averageRating.toFixed(1)}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <Star className="h-6 w-6 fill-current" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isSpanish ? "5 Estrellas" : "5 Stars"}
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {reviews.filter((r) => r.rating === 5).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                  <Star className="h-6 w-6 fill-primary text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">
            {isSpanish ? "Todas las Reseñas" : "All Reviews"}
          </h2>
          {reviews.length === 0 ? (
            <Card className="border-border/40">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  {isSpanish ? "No hay reseñas aún." : "No reviews yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="border-border/40 hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                        {review.userName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg">{review.userName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString(
                            isSpanish ? "es-CL" : "en-US",
                            { year: "numeric", month: "long", day: "numeric" }
                          )}
                        </p>
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "h-4 w-4",
                                star <= review.rating ? "fill-primary text-primary" : "fill-none text-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground leading-relaxed mt-2">"{review.comment}"</p>
                        {review.appointmentId && (
                          <Badge variant="outline" className="w-fit mt-2">
                            {isSpanish ? "Cita" : "Appointment"}: {review.appointmentId}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        className="shrink-0"
                        onClick={() => setReplyingToId(review.id)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {isSpanish ? "Responder al paciente" : "Reply to patient"}
                      </Button>
                    </div>
                    {review.reply && (
                      <div className="pl-16 border-l-2 border-primary/30 py-2">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {isSpanish ? "Tu respuesta" : "Your reply"}
                        </p>
                        <p className="text-sm">{review.reply}</p>
                      </div>
                    )}
                    {replyingToId === review.id && (
                      <div className="pl-16 space-y-2">
                        <Label>{isSpanish ? "Escribe tu respuesta" : "Write your reply"}</Label>
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={isSpanish ? "Gracias por tu comentario..." : "Thank you for your feedback..."}
                          className="min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setReplyingToId(null); setReplyText("") }}>
                            {isSpanish ? "Cancelar" : "Cancel"}
                          </Button>
                          <Button size="sm" onClick={() => handleReply(review.id)} disabled={!replyText.trim()}>
                            {isSpanish ? "Enviar respuesta" : "Send reply"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      </DashboardLayout>
    </RouteGuard>
  )
}

