"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Paperclip, Phone, Video, MoreVertical, Circle } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read: boolean
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
}

interface FunctionalChatProps {
  currentUserId: string
  currentUserName: string
  currentUserAvatar?: string
  contacts: Contact[]
  onContactSelect?: (contactId: string) => void
  className?: string
}

export function FunctionalChat({
  currentUserId,
  currentUserName,
  currentUserAvatar,
  contacts,
  onContactSelect,
  className,
}: FunctionalChatProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0] || null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { language } = useLanguage()

  const t = {
    placeholder: language === "es" ? "Escribe un mensaje..." : "Type a message...",
    online: language === "es" ? "En línea" : "Online",
    offline: language === "es" ? "Desconectado" : "Offline",
    search: language === "es" ? "Buscar conversaciones..." : "Search conversations...",
    noMessages: language === "es" ? "No hay mensajes aún. ¡Envía el primero!" : "No messages yet. Send the first one!",
    today: language === "es" ? "Hoy" : "Today",
    yesterday: language === "es" ? "Ayer" : "Yesterday",
  }

  // Load messages when contact changes
  useEffect(() => {
    if (!selectedContact) {
      setMessages([])
      return
    }

    const loadMessages = async () => {
      setLoading(true)
      try {
        // Get messages where current user is sender and contact is receiver, or vice versa
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
        // Sort by created_at
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
          // Only add if it's a new message from the selected contact or from current user
          if (newMsg.sender_id === selectedContact.id || newMsg.sender_id === currentUserId) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("first_name, last_name, avatar_url")
              .eq("id", newMsg.sender_id)
              .single()

            setMessages((prev) => {
              // Check if message already exists
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
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedContact, currentUserId, currentUserName])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || sending) return

    setSending(true)
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUserId,
          receiver_id: selectedContact.id,
          content: newMessage.trim(),
          read: false,
        })
        .select()
        .single()

      if (error) throw error

      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev
        return [
          ...prev,
          {
            ...data,
            sender_name: currentUserName,
            sender_avatar: currentUserAvatar,
          },
        ]
      })

      setNewMessage("")
      if (onContactSelect) {
        onContactSelect(selectedContact.id)
      }
    } catch (error) {
      console.error("Error sending message:", error)
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
      return date.toLocaleTimeString(language === "es" ? "es-CL" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else if (messageDate.getTime() === today.getTime() - 86400000) {
      return t.yesterday
    } else {
      return date.toLocaleDateString(language === "es" ? "es-CL" : "en-US", {
        month: "short",
        day: "numeric",
      })
    }
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(language === "es" ? "es-CL" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className={cn("flex h-[calc(100vh-10rem)] gap-6", className)}>
      {/* Contacts Sidebar */}
      <div className="w-80 shrink-0 flex flex-col gap-4">
        <div className="relative">
          <Input
            placeholder={t.search}
            className="pl-10 rounded-xl bg-accent/20 border-none h-11"
          />
        </div>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-2">
            {contacts.map((contact) => (
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
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Window */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col border border-border/40 rounded-[2.5rem] overflow-hidden bg-card shadow-lg">
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
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Circle
                    className={cn(
                      "h-2 w-2 fill-current",
                      selectedContact.status === "online"
                        ? "text-green-500"
                        : "text-muted-foreground"
                    )}
                  />
                  {selectedContact.status === "online" ? t.online : t.offline}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl bg-transparent border-border/40 text-muted-foreground hover:text-primary"
              >
                <Phone className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl bg-transparent border-border/40 text-muted-foreground hover:text-primary"
              >
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-8 bg-accent/5 h-full" ref={scrollAreaRef}>
            <div className="pr-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  {language === "es" ? "Cargando mensajes..." : "Loading messages..."}
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">{t.noMessages}</p>
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
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-2 font-medium">
                          {formatMessageTime(msg.created_at)}
                        </span>
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
          <div className="p-6 bg-background border-t border-border/40">
            <div className="flex items-center gap-4 bg-accent/20 p-2 rounded-[1.5rem] border border-border/40">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-muted-foreground hover:text-primary"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.placeholder}
                className="border-none bg-transparent shadow-none focus-visible:ring-0 text-sm flex-1"
                disabled={sending}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="rounded-xl bg-primary shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center border border-border/40 rounded-[2.5rem] bg-card">
          <p className="text-muted-foreground">
            {language === "es"
              ? "Selecciona una conversación para comenzar"
              : "Select a conversation to start"}
          </p>
        </div>
      )}
    </div>
  )
}

