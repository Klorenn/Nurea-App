"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Paperclip, Circle, AlertTriangle, Clock, Shield, FileText, X, CheckCircle2 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { sanitizeMessage } from "@/lib/utils/sanitize"

interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read: boolean
  file_url?: string
  file_name?: string
  file_type?: string
  sender_name?: string
  sender_avatar?: string
}

interface Contact {
  id: string
  name: string
  avatar?: string
  status?: "online" | "offline"
  lastMessage?: string
  lastMessageTime?: string
  unread?: number
  responseTime?: string // "2-4 horas" o similar
  businessHours?: string
}

interface HealthChatProps {
  currentUserId: string
  currentUserName: string
  currentUserAvatar?: string
  contacts: Contact[]
  role: "patient" | "professional"
  onContactSelect?: (contactId: string) => void
  className?: string
}

export function HealthChat({
  currentUserId,
  currentUserName,
  currentUserAvatar,
  contacts,
  role,
  onContactSelect,
  className,
}: HealthChatProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0] || null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { language } = useLanguage()
  const t = useTranslations(language)
  const supabase = createClient()

  const isSpanish = language === "es"

  // Load messages when contact changes
  useEffect(() => {
    if (!selectedContact) {
      setMessages([])
      return
    }

    const loadMessages = async () => {
      setLoading(true)
      try {
        const { data: sentMessages } = await supabase
          .from("messages")
          .select("*")
          .eq("sender_id", currentUserId)
          .eq("receiver_id", selectedContact.id)
          .order("created_at", { ascending: true })

        const { data: receivedMessages } = await supabase
          .from("messages")
          .select("*")
          .eq("sender_id", selectedContact.id)
          .eq("receiver_id", currentUserId)
          .order("created_at", { ascending: true })

        const allMessages = [...(sentMessages || []), ...(receivedMessages || [])]
        const data = allMessages.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )

        if (!data || data.length === 0) {
          setMessages([])
          setLoading(false)
          return
        }

        // Fetch sender names and avatars
        const messagesWithSenders = await Promise.all(
          data.map(async (msg) => {
            const senderId = msg.sender_id
            const { data: profile } = await supabase
              .from("profiles")
              .select("first_name, last_name, avatar_url")
              .eq("id", senderId)
              .single()

            return {
              ...msg,
              sender_name: profile
                ? `${profile.first_name} ${profile.last_name}`
                : senderId === currentUserId
                  ? currentUserName
                  : selectedContact.name,
              sender_avatar: profile?.avatar_url || undefined,
            }
          })
        )

        setMessages(messagesWithSenders)

        // Mark messages as read
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("sender_id", selectedContact.id)
          .eq("receiver_id", currentUserId)
          .eq("read", false)
      } catch (error) {
        console.error("Error loading messages:", error)
        setMessages([])
      } finally {
        setLoading(false)
      }
    }

    loadMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${currentUserId}:${selectedContact.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or(and(sender_id.eq.${selectedContact.id},receiver_id.eq.${currentUserId}),and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedContact.id}))`,
        },
        async (payload) => {
          const newMsg = payload.new as ChatMessage
          if (newMsg.sender_id === selectedContact.id || newMsg.sender_id === currentUserId) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("first_name, last_name, avatar_url")
              .eq("id", newMsg.sender_id)
              .single()

            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) {
                return prev
              }
              return [
                ...prev,
                {
                  ...newMsg,
                  sender_name: profile
                    ? `${profile.first_name} ${profile.last_name}`
                    : newMsg.sender_id === currentUserId
                      ? currentUserName
                      : selectedContact.name,
                  sender_avatar: profile?.avatar_url || undefined,
                },
              ]
            })

            // Mark as read if from contact
            if (newMsg.sender_id === selectedContact.id) {
              await supabase
                .from("messages")
                .update({ read: true })
                .eq("id", newMsg.id)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedContact, currentUserId, currentUserName, supabase])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(isSpanish 
          ? "El archivo es demasiado grande. Máximo 10MB."
          : "File is too large. Maximum 10MB.")
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUploadFile = async (file: File): Promise<string | null> => {
    try {
      setUploadingFile(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${currentUserId}/${Date.now()}.${fileExt}`
      const filePath = `messages/${fileName}`

      const { data, error } = await supabase.storage
        .from('messages')
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('messages')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error("Error uploading file:", error)
      return null
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedContact || sending) return

    setSending(true)
    try {
      let fileUrl: string | null = null
      let fileName: string | undefined
      let fileType: string | undefined

      if (selectedFile) {
        fileUrl = await handleUploadFile(selectedFile)
        if (!fileUrl) {
          alert(isSpanish 
            ? "No se pudo subir el archivo. Intenta nuevamente."
            : "Could not upload file. Please try again.")
          setSending(false)
          return
        }
        fileName = selectedFile.name
        fileType = selectedFile.type
      }

      // Sanitizar contenido del mensaje antes de enviar
      const messageContent = newMessage.trim() || (selectedFile ? (isSpanish ? "Archivo adjunto" : "File attached") : "")
      const sanitizedContent = sanitizeMessage(messageContent)

      if (!sanitizedContent && !fileUrl) {
        alert(isSpanish 
          ? "El mensaje no puede estar vacío o contener solo caracteres no válidos."
          : "Message cannot be empty or contain only invalid characters.")
        setSending(false)
        return
      }

      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUserId,
          receiver_id: selectedContact.id,
          content: sanitizedContent,
          read: false,
          file_url: fileUrl || null,
          file_name: fileName ? sanitizeMessage(fileName) : null, // Sanitizar nombre de archivo también
          file_type: fileType || null,
        })
        .select()
        .single()

      if (error) throw error

      setMessages((prev) => [
        ...prev,
        {
          ...data,
          sender_name: currentUserName,
          sender_avatar: currentUserAvatar,
        },
      ])

      setNewMessage("")
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      if (onContactSelect) {
        onContactSelect(selectedContact.id)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert(isSpanish 
        ? "No se pudo enviar el mensaje. Intenta nuevamente."
        : "Could not send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (messageDate.getTime() === today.getTime()) {
      return t.chat.today
    } else if (messageDate.getTime() === today.getTime() - 86400000) {
      return t.chat.yesterday
    } else {
      return date.toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
        month: "short",
        day: "numeric",
      })
    }
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(language === "es" ? "es-ES" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className={cn("flex h-screen gap-6", className)}>
      {/* Contacts Sidebar */}
      <div className="w-80 shrink-0 flex flex-col gap-4">
        <div className="relative">
          <Input
            placeholder={t.chat.searchMessages}
            className="pl-10 rounded-xl bg-accent/20 border-none h-11"
          />
        </div>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-2">
            {contacts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">{t.chat.noContacts}</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => {
                    setSelectedContact(contact)
                    if (onContactSelect) {
                      onContactSelect(contact.id)
                    }
                  }}
                  className={cn(
                    "w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left",
                    selectedContact?.id === contact.id
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "hover:bg-accent/30"
                  )}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12 rounded-xl border border-border/40">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {contact.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {contact.status === "online" && (
                      <div className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-full">
                        <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold truncate">{contact.name}</p>
                      {contact.lastMessageTime && (
                        <span
                          className={cn(
                            "text-[10px] shrink-0",
                            selectedContact?.id === contact.id
                              ? "text-white/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatTime(contact.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    {contact.lastMessage && (
                      <p
                        className={cn(
                          "text-xs truncate",
                          selectedContact?.id === contact.id
                            ? "text-white/80"
                            : "text-muted-foreground"
                        )}
                      >
                        {contact.lastMessage}
                      </p>
                    )}
                  </div>
                  {contact.unread && contact.unread > 0 && selectedContact?.id !== contact.id && (
                    <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {contact.unread}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Window */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col border border-border/40 rounded-[2.5rem] overflow-hidden bg-card shadow-lg">
          {/* Emergency Banner - Solo para pacientes */}
          {role === "patient" && (
            <Card className="m-4 mb-0 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-orange-900 dark:text-orange-200 mb-1">
                      {t.chat.notEmergency}
                    </p>
                    <p className="text-xs text-orange-800 dark:text-orange-300">
                      {t.chat.notEmergencyDesc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Header */}
          <div className="p-6 border-b border-border/40 flex justify-between items-center bg-accent/5">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 rounded-xl border border-border/40">
                <AvatarImage src={selectedContact.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedContact.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">{selectedContact.name}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Circle
                      className={cn(
                        "h-2 w-2 fill-current",
                        selectedContact.status === "online"
                          ? "text-green-500"
                          : "text-muted-foreground"
                      )}
                    />
                    {selectedContact.status === "online" ? t.chat.onlineNow : t.chat.lastSeen}
                  </div>
                  {selectedContact.responseTime && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{t.chat.typicalResponse} {selectedContact.responseTime}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-lg border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400">
                <Shield className="h-3 w-3 mr-1.5" />
                {t.chat.secureCommunication}
              </Badge>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-8 bg-accent/5 h-full">
            <div className="pr-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">{t.chat.loadingMessages}</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium text-muted-foreground">{t.chat.noMessages}</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {isSpanish 
                      ? "Este es un espacio seguro para comunicarte con tu profesional. Puedes hacer preguntas, compartir información o coordinar tu atención."
                      : "This is a safe space to communicate with your professional. You can ask questions, share information, or coordinate your care."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, index) => {
                  const isMe = msg.sender_id === currentUserId
                  const showDateSeparator =
                    index === 0 ||
                    new Date(msg.created_at).toDateString() !==
                      new Date(messages[index - 1].created_at).toDateString()

                  return (
                    <div key={msg.id}>
                      {showDateSeparator && (
                        <div className="flex justify-center mb-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-accent/20 px-3 py-1 rounded-full">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "flex flex-col max-w-[70%]",
                          isMe ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                      >
                        {!isMe && (
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="w-6 h-6 rounded-full">
                              <AvatarImage src={msg.sender_avatar} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {msg.sender_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-muted-foreground">
                              {msg.sender_name}
                            </span>
                          </div>
                        )}
                        <div
                          className={cn(
                            "p-4 rounded-3xl shadow-sm",
                            isMe
                              ? "bg-primary text-white rounded-tr-none"
                              : "bg-white text-foreground rounded-tl-none border border-border/20"
                          )}
                        >
                          {msg.file_url ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 p-2 bg-white/10 dark:bg-black/10 rounded-lg">
                                <FileText className="h-4 w-4" />
                                <a
                                  href={msg.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm underline hover:no-underline"
                                >
                                  {msg.file_name || (isSpanish ? "Archivo" : "File")}
                                </a>
                              </div>
                              {msg.content && msg.content !== (isSpanish ? "Archivo adjunto" : "File attached") && (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {formatMessageTime(msg.created_at)}
                          </span>
                          {isMe && (
                            <span className="text-[10px] text-muted-foreground">
                              {msg.read ? (
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                              ) : (
                                <Circle className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="p-6 bg-background border-t border-border/40 space-y-3">
            {selectedFile && (
              <div className="flex items-center gap-2 p-3 bg-accent/20 rounded-xl border border-border/40">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium flex-1 truncate">{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""
                    }
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-4 bg-accent/20 p-2 rounded-[1.5rem] border border-border/40">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-muted-foreground hover:text-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile || sending}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.chat.typeMessage}
                className="border-none bg-transparent shadow-none focus-visible:ring-0 text-sm flex-1"
                disabled={sending || uploadingFile}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={(!newMessage.trim() && !selectedFile) || sending || uploadingFile}
                className="rounded-xl bg-primary shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {sending || uploadingFile ? (
                  <Clock className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            {selectedContact.businessHours && (
              <p className="text-xs text-muted-foreground text-center">
                {t.chat.businessHoursDesc}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center border border-border/40 rounded-[2.5rem] bg-card space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <p className="font-medium text-muted-foreground">{t.chat.selectConversation}</p>
            <p className="text-sm text-muted-foreground max-w-md">
              {isSpanish 
                ? "Selecciona un profesional para comenzar una conversación segura y privada."
                : "Select a professional to start a secure and private conversation."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

