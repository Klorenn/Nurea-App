"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, Plus, Trash2, Edit, X } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Review {
  id: string
  userName: string
  rating: number
  comment: string
  date: string
  appointmentId: string
}

export default function ReviewsManagementPage() {
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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [newReview, setNewReview] = useState({
    userName: "",
    rating: 5,
    comment: "",
    date: new Date().toISOString().split("T")[0],
    appointmentId: "",
  })

  const handleAddReview = () => {
    if (!newReview.userName || !newReview.comment) return

    const review: Review = {
      id: Date.now().toString(),
      ...newReview,
    }

    setReviews([review, ...reviews])
    setNewReview({
      userName: "",
      rating: 5,
      comment: "",
      date: new Date().toISOString().split("T")[0],
      appointmentId: "",
    })
    setIsAddModalOpen(false)
  }

  const handleDeleteReview = (id: string) => {
    setReviews(reviews.filter((r) => r.id !== id))
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setNewReview({
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      date: review.date,
      appointmentId: review.appointmentId,
    })
    setIsAddModalOpen(true)
  }

  const handleUpdateReview = () => {
    if (!editingReview || !newReview.userName || !newReview.comment) return

    setReviews(
      reviews.map((r) =>
        r.id === editingReview.id
          ? {
              ...r,
              ...newReview,
            }
          : r
      )
    )
    setEditingReview(null)
    setNewReview({
      userName: "",
      rating: 5,
      comment: "",
      date: new Date().toISOString().split("T")[0],
      appointmentId: "",
    })
    setIsAddModalOpen(false)
  }

  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0

  return (
    <DashboardLayout role="professional">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Reseñas</h1>
            <p className="text-muted-foreground mt-1">Administra las reseñas de tus pacientes</p>
          </div>
          <Button className="rounded-xl font-bold" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Agregar Reseña
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="border-border/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reseñas</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Calificación Promedio</p>
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
                  <p className="text-sm font-medium text-muted-foreground">5 Estrellas</p>
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
          <h2 className="text-xl font-bold">Todas las Reseñas</h2>
          {reviews.length === 0 ? (
            <Card className="border-border/40">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No hay reseñas aún. Agrega una para comenzar.</p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="border-border/40 hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {review.userName[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{review.userName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString("es-CL", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
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
                      <p className="text-muted-foreground leading-relaxed">"{review.comment}"</p>
                      {review.appointmentId && (
                        <Badge variant="outline" className="w-fit">
                          Cita: {review.appointmentId}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl bg-transparent"
                        onClick={() => handleEditReview(review)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl bg-transparent text-destructive hover:text-destructive"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingReview ? "Editar Reseña" : "Agregar Nueva Reseña"}</DialogTitle>
            <DialogDescription>
              {editingReview ? "Modifica los detalles de la reseña" : "Crea una nueva reseña para tu perfil"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Nombre del Paciente</Label>
              <Input
                id="userName"
                value={newReview.userName}
                onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                placeholder="Ej: Nicolas M."
                className="rounded-xl bg-accent/20 border-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Calificación</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        star <= newReview.rating ? "fill-primary text-primary" : "fill-none text-muted-foreground/30"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comentario</Label>
              <Textarea
                id="comment"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Escribe el comentario de la reseña..."
                className="min-h-[120px] rounded-xl bg-accent/20 border-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={newReview.date}
                  onChange={(e) => setNewReview({ ...newReview, date: e.target.value })}
                  className="rounded-xl bg-accent/20 border-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentId">ID de Cita (Opcional)</Label>
                <Input
                  id="appointmentId"
                  value={newReview.appointmentId}
                  onChange={(e) => setNewReview({ ...newReview, appointmentId: e.target.value })}
                  placeholder="NR-99231"
                  className="rounded-xl bg-accent/20 border-none"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1 rounded-xl bg-transparent">
                Cancelar
              </Button>
              <Button
                onClick={editingReview ? handleUpdateReview : handleAddReview}
                disabled={!newReview.userName || !newReview.comment}
                className="flex-1 rounded-xl font-bold"
              >
                {editingReview ? "Actualizar" : "Agregar"} Reseña
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

