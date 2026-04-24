"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "sonner"
import { MessageCircle, Clock, CheckCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface Category {
  id: string
  name: string
  name_en?: string
  description: string
  description_en?: string
  slug: string
  icon: string
  color: string
  posts_count: number
}

interface Post {
  id: string
  title: string
  content: string
  views_count: number
  replies_count: number
  is_pinned: boolean
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
    slug: string
    color: string
  }
}

const defaultCategories: Category[] = [
  { id: "1", name: "Salud General", name_en: "General Health", description: "Preguntas sobre salud y bienestar", slug: "salud-general", icon: "Heart", color: "#0f766e", posts_count: 0 },
  { id: "2", name: "Salud Mental", name_en: "Mental Health", description: "Espacio para discusiones sobre salud mental", slug: "salud-mental", icon: "Brain", color: "#7c3aed", posts_count: 0 },
  { id: "3", name: "Nutrición", name_en: "Nutrition", description: "Consejos sobre alimentación saludable", slug: "nutricion", icon: "Apple", color: "#16a34a", posts_count: 0 },
  { id: "4", name: "Embarazo y Maternidad", name_en: "Pregnancy", description: "Consultas sobre embarazo y cuidado infantil", slug: "embarazo", icon: "Baby", color: "#ec4899", posts_count: 0 },
  { id: "5", name: "Deportes y Fitness", name_en: "Sports", description: "Salud relacionada con actividad física", slug: "deportes", icon: "Dumbbell", color: "#f59e0b", posts_count: 0 },
  { id: "6", name: "Consultas a Especialistas", name_en: "Specialists", description: "Preguntas para profesionales de la salud", slug: "especialistas", icon: "Stethoscope", color: "#3b82f6", posts_count: 0 },
]

interface ForumCategoriesProps {
  onSelectCategory?: (categoryId: string | null) => void
  selectedCategory?: string | null
}

export function ForumCategories({ onSelectCategory, selectedCategory }: ForumCategoriesProps) {
  const { language } = useLanguage()
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/forum/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-4 text-center text-muted-foreground">Cargando...</div>

  return (
    <div className="space-y-2">
      <Button
        variant={!selectedCategory ? "default" : "outline"}
        className="w-full justify-start gap-2"
        onClick={() => onSelectCategory?.(null)}
      >
        <MessageCircle className="h-4 w-4" />
        {language === "es" ? "Todas" : "All"}
      </Button>

      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={selectedCategory === cat.id ? "default" : "outline"}
          className="w-full justify-start gap-2"
          style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
          onClick={() => onSelectCategory?.(cat.id)}
        >
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
          <span className="flex-1 text-left truncate">{language === "es" ? cat.name : (cat.name_en || cat.name)}</span>
        </Button>
      ))}
    </div>
  )
}

export function ForumPostList({ categoryId }: { categoryId?: string | null }) {
  const { language } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (categoryId) params.set("category_id", categoryId)
    params.set("limit", "20")

    fetch(`/api/forum/posts?${params}`)
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [categoryId])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-CL", { day: "numeric", month: "short" })
  }

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-lg font-medium">{language === "es" ? "Aún no hay preguntas" : "No questions yet"}</p>
        <p className="text-sm text-muted-foreground mt-2">{language === "es" ? "Sé el primero en preguntar" : "Be the first to ask"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/dashboard/forum/post/${post.id}`)}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {post.author ? getInitials(`${post.author.first_name} ${post.author.last_name}`) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                {post.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}>
                    {post.category.name}
                  </span>
                )}
                <h3 className="font-medium mt-1 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.content?.slice(0, 150)}...</p>
                {post.author && (
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="font-medium">{post.author.first_name}</span>
                    {post.author.role === "professional" && <CheckCircle className="h-3 w-3 text-teal-500" />}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(post.created_at)}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post.replies_count}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ForumMain() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetch("/api/forum/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data?.categories?.[0]?.id) {
          setDefaultCategoryId(data.categories[0].id)
        }
      })
      .catch(() => {})
  }, [])

  const effectiveCategoryId = selectedCategory || defaultCategoryId

  return (
    <div className="space-y-6">
      <ForumCategories
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat === selectedCategory ? null : cat)}
      />
      <CreatePostForm
        categoryId={effectiveCategoryId}
        onSuccess={() => setRefreshKey(k => k + 1)}
      />
      <ForumPostList categoryId={selectedCategory} key={refreshKey} />
    </div>
  )
}

export function CreatePostForm({ categoryId, onSuccess }: { categoryId: string | null; onSuccess?: () => void }) {
  const { language } = useLanguage()
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error(language === "es" ? "Completa todos los campos" : "Fill all fields")
      return
    }
    if (!user) {
      toast.error(language === "es" ? "Debes iniciar sesión para publicar" : "You must sign in to publish")
      return
    }
    if (!categoryId) {
      toast.error(language === "es" ? "No hay categoría disponible" : "No category available")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: categoryId, title, content }),
      })

      if (!res.ok) throw new Error("Failed")
      toast.success(language === "es" ? "¡Pregunta publicada!" : "Question published!")
      setTitle("")
      setContent("")
      onSuccess?.()
    } catch (_err) {
      toast.error(language === "es" ? "Error al publicar. Ejecuta el SQL del foro en Supabase." : "Error publishing")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">{language === "es" ? "Tu pregunta" : "Your question"}</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={language === "es" ? "¿Qué quieres preguntar?" : "What do you want to ask?"} className="w-full px-3 py-2 border rounded-lg" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">{language === "es" ? "Detalles" : "Details"}</label>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={language === "es" ? "Explica más..." : "Explain more..."} rows={4} className="w-full" />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (language === "es" ? "Publicando..." : "Publishing...") : (language === "es" ? "Publicar" : "Publish")}
      </Button>
    </form>
  )
}