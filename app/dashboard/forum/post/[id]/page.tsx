"use client"
import { useUser } from "@/hooks/use-user"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "sonner"
import { ArrowLeft, Clock, Eye, MessageCircle, Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

interface Post {
  id: string
  title: string
  content: string
  views_count: number
  replies_count: number
  created_at: string
  author: {
    id: string
    first_name: string
    last_name: string
    avatar_url: string
    role: string
  }
  category: {
    name: string
    color: string
  }
}

interface Reply {
  id: string
  content: string
  is_best_answer: boolean
  created_at: string
  author: {
    id: string
    first_name: string
    last_name: string
    avatar_url: string
    role: string
  }
}

export default function ForumPostPage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLanguage()
  const { user } = useUser()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/forum/posts?post_id=${postId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.posts?.[0]) setPost(data.posts[0])
      })

    fetch(`/api/forum/replies?post_id=${postId}`)
      .then((res) => res.json())
      .then((data) => {
        setReplies(data.replies || [])
      })
      .finally(() => setLoading(false))
  }, [postId])

  const handleReply = async () => {
    if (!replyContent.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/forum/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, content: replyContent }),
      })

      if (!res.ok) throw new Error("Failed to submit reply")

      const data = await res.json()
      setReplies([...replies, data.reply])
      setReplyContent("")
      toast.success(language === "es" ? "Respuesta publicada!" : "Reply published!")
    } catch (err) {
      toast.error(language === "es" ? "Error al responder" : "Error replying")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-CL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>{language === "es" ? "Post no encontrado" : "Post not found"}</p>
        <Button onClick={() => router.push("/dashboard/forum")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === "es" ? "Volver al foro" : "Back to forum"}
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" onClick={() => router.push("/dashboard/forum")} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {language === "es" ? "Volver al foro" : "Back to forum"}
      </Button>

      {/* Post principal */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
            >
              {post.category.name}
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(`${post.author.first_name} ${post.author.last_name}`)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {post.author.first_name} {post.author.last_name}
                </span>
                {post.author.role === "professional" && (
                  <CheckCircle className="h-4 w-4 text-teal-500" />
                )}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span>{formatDate(post.created_at)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.views_count} vistas
                </span>
              </div>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
        </CardContent>
      </Card>

      {/* Respuestas */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          {replies.length} {language === "es" ? "respuestas" : "answers"}
        </h2>

        {replies.map((reply) => (
          <Card
            key={reply.id}
            className={`mb-4 ${reply.is_best_answer ? "border-teal-500 bg-teal-50 dark:bg-teal-950/20" : ""}`}
          >
            <CardContent className="p-4">
              {reply.is_best_answer && (
                <div className="flex items-center gap-2 text-teal-600 text-sm font-medium mb-2">
                  <CheckCircle className="h-4 w-4" />
                  {language === "es" ? "Mejor respuesta" : "Best answer"}
                </div>
              )}

              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply.author.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(`${reply.author.first_name} ${reply.author.last_name}`)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {reply.author.first_name} {reply.author.last_name}
                    </span>
                    {reply.author.role === "professional" && (
                      <CheckCircle className="h-3 w-3 text-teal-500" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(reply.created_at)}
                    </span>
                  </div>

                  <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {replies.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{language === "es" ? "Aún no hay respuestas" : "No answers yet"}</p>
            <p className="text-sm">
              {language === "es"
                ? "Sé el primero en responder"
                : "Be the first to answer"}
            </p>
          </div>
        )}
      </div>

      {/* Formulario de respuesta */}
      {user ? (
        <div className="bg-muted/30 p-4 rounded-lg">
          <h3 className="font-medium mb-2">
            {language === "es" ? "Tu respuesta" : "Your answer"}
          </h3>
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={language === "es"
              ? "Escribe tu respuesta..."
              : "Write your answer..."}
            rows={4}
            className="mb-3"
          />
          <Button onClick={handleReply} disabled={submitting || !replyContent.trim()}>
            <Send className="h-4 w-4 mr-2" />
            {submitting
              ? language === "es"
                ? "Enviando..."
                : "Sending..."
              : language === "es"
              ? "Publicar respuesta"
              : "Post answer"}
          </Button>
        </div>
      ) : (
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">
            {language === "es"
              ? "Inicia sesión para responder"
              : "Sign in to answer"}
          </p>
        </div>
      )}
    </div>
  )
}