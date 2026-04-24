"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "sonner"
import { 
  MessageCircle, 
  Star, 
  CheckCircle2, 
  Clock, 
  User,
  Send,
  Filter,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Feedback {
  id: string
  user_id: string
  rating: number
  comment: string | null
  category: string
  status: string
  responded_by: string | null
  response: string | null
  created_at: string
  user?: {
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }
}

export default function FeedbackPage() {
  const { language } = useLanguage()
  const isES = language === "es"
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const loadFeedback = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("feedback")
        .select("*, user:profiles(first_name, last_name, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(50)

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setFeedbackList(data || [])
    } catch (err) {
      console.error("[feedback] load error", err)
    } finally {
      setLoading(false)
    }
  }, [supabase, statusFilter])

  useEffect(() => {
    loadFeedback()
  }, [loadFeedback])

  const handleRespond = async (feedbackId: string) => {
    if (!responseText.trim()) {
      toast.error(isES ? "Escribe una respuesta" : "Write a response")
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from("feedback")
        .update({
          status: "responded",
          response: responseText.trim(),
          responded_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", feedbackId)

      if (error) throw error

      toast.success(isES ? "Respuesta enviada" : "Response sent")
      setRespondingTo(null)
      setResponseText("")
      loadFeedback()
    } catch (err) {
      console.error("[respond] error", err)
      toast.error(isES ? "Error al responder" : "Error responding")
    } finally {
      setSubmitting(false)
    }
  }

  const handleArchive = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from("feedback")
        .update({ status: "archived", updated_at: new Date().toISOString() })
        .eq("id", feedbackId)

      if (error) throw error
      toast.success(isES ? "Archivado" : "Archived")
      loadFeedback()
    } catch (err) {
      console.error("[archive] error", err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      case "reviewed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "responded":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return isES ? "Pendiente" : "Pending"
      case "reviewed":
        return isES ? "Revisado" : "Reviewed"
      case "responded":
        return isES ? "Respondido" : "Responded"
      case "archived":
        return isES ? "Archivado" : "Archived"
      default:
        return status
    }
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isES ? "Feedback" : "Feedback"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isES 
              ? "Gestiona los comentarios de usuarios" 
              : "Manage user feedback"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isES ? "Todos" : "All"}</SelectItem>
              <SelectItem value="pending">{isES ? "Pendientes" : "Pending"}</SelectItem>
              <SelectItem value="reviewed">{isES ? "Revisados" : "Reviewed"}</SelectItem>
              <SelectItem value="responded">{isES ? "Respondidos" : "Responded"}</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={loadFeedback} variant="outline">
            {isES ? "Actualizar" : "Refresh"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{isES ? "No hay feedback" : "No feedback yet"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((fb) => (
            <div
              key={fb.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {fb.user?.avatar_url ? (
                      <img 
                        src={fb.user.avatar_url} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {fb.user?.first_name} {fb.user?.last_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(fb.created_at).toLocaleDateString(isES ? "es-CL" : "en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fb.status)}`}>
                    {getStatusLabel(fb.status)}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < fb.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200 dark:text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {fb.comment && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-slate-700 dark:text-slate-300">
                  {fb.comment}
                </div>
              )}

              {fb.response && (
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4 text-teal-700 dark:text-teal-300">
                  <p className="text-xs font-medium mb-1">{isES ? "Respuesta:" : "Response:"}</p>
                  {fb.response}
                </div>
              )}

              {respondingTo === fb.id ? (
                <div className="space-y-3 pt-2">
                  <Textarea
                    placeholder={isES ? "Escribe tu respuesta..." : "Write your response..."}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRespondingTo(null)
                        setResponseText("")
                      }}
                    >
                      {isES ? "Cancelar" : "Cancel"}
                    </Button>
                    <Button
                      onClick={() => handleRespond(fb.id)}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {isES ? "Enviar respuesta" : "Send response"}
                    </Button>
                  </div>
                </div>
              ) : fb.status === "pending" && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleArchive(fb.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {isES ? "Archivar" : "Archive"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setRespondingTo(fb.id)}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    {isES ? "Responder" : "Respond"}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}