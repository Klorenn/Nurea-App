"use client"

import { useState, Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Paperclip, MoreVertical, Phone, Video, Search, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

const contacts = [
  {
    id: 1,
    name: "Dr. Elena Vargas",
    status: "online",
    lastMsg: "See you at our session tomorrow!",
    time: "10:30 AM",
    unread: 0,
    image: "/prof-1.jpg",
  },
  {
    id: 2,
    name: "Dr. Marco Polo",
    status: "offline",
    lastMsg: "Your lab results are ready.",
    time: "Yesterday",
    unread: 1,
    image: "/prof-2.jpg",
  },
  {
    id: 3,
    name: "Support Team",
    status: "online",
    lastMsg: "How can we help you today?",
    time: "Monday",
    unread: 0,
    image: "/prof-3.jpg",
  },
]

const messages = [
  { id: 1, sender: "Elena Vargas", text: "Hello! How are you feeling today?", time: "09:00 AM", isMe: false },
  {
    id: 2,
    sender: "Me",
    text: "Hi Doctor! Much better, thank you. The exercises are helping a lot.",
    time: "09:15 AM",
    isMe: true,
  },
  {
    id: 3,
    sender: "Elena Vargas",
    text: "That's wonderful to hear. Remember to stay consistent with the mindfulness practice.",
    time: "09:20 AM",
    isMe: false,
  },
  { id: 4, sender: "Elena Vargas", text: "See you at our session tomorrow!", time: "10:30 AM", isMe: false },
]

function ChatContent() {
  const [activeContact, setActiveContact] = useState(contacts[0])

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-6">
      {/* Contacts Sidebar */}
      <div className="w-80 shrink-0 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search messages..." className="pl-10 rounded-xl bg-accent/20 border-none h-11" />
        </div>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-2">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setActiveContact(contact)}
                className={cn(
                  "w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left",
                  activeContact.id === contact.id
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "hover:bg-accent/30",
                )}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                    <img
                      src={`${contact.image}?height=50&width=50&query=headshot`}
                      alt={contact.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {contact.status === "online" && (
                    <div className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-full">
                      <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold truncate">{contact.name}</p>
                    <span
                      className={cn(
                        "text-[10px]",
                        activeContact.id === contact.id ? "text-white/70" : "text-muted-foreground",
                      )}
                    >
                      {contact.time}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-xs truncate",
                      activeContact.id === contact.id ? "text-white/80" : "text-muted-foreground",
                    )}
                  >
                    {contact.lastMsg}
                  </p>
                </div>
                {contact.unread > 0 && activeContact.id !== contact.id && (
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-white">
                    {contact.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <Card className="flex-1 flex flex-col border-border/40 rounded-[2.5rem] overflow-hidden bg-card">
        {/* Chat Header */}
        <div className="p-6 border-b border-border/40 flex justify-between items-center bg-accent/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
              <img
                src={`${activeContact.image}?height=50&width=50&query=headshot`}
                alt={activeContact.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg">{activeContact.name}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Circle
                  className={cn(
                    "h-2 w-2 fill-current",
                    activeContact.status === "online" ? "text-green-500" : "text-muted-foreground",
                  )}
                />
                {activeContact.status === "online" ? "Online now" : "Last seen Monday"}
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
        <ScrollArea className="flex-1 p-8 bg-accent/5">
          <div className="space-y-6">
            <div className="flex justify-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-accent/20 px-3 py-1 rounded-full">
                Today
              </span>
            </div>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex flex-col max-w-[70%]", msg.isMe ? "ml-auto items-end" : "mr-auto items-start")}
              >
                <div
                  className={cn(
                    "p-4 rounded-3xl shadow-sm",
                    msg.isMe
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-white text-foreground rounded-tl-none border border-border/20",
                  )}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[10px] text-muted-foreground mt-2 font-medium">{msg.time}</span>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-6 bg-white border-t border-border/40">
          <div className="flex items-center gap-4 bg-accent/20 p-2 rounded-[1.5rem] border border-border/40">
            <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-primary">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Type your message..."
              className="border-none bg-transparent shadow-none focus-visible:ring-0 text-sm"
            />
            <Button size="icon" className="rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function ChatPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <ChatContent />
      </Suspense>
    </DashboardLayout>
  )
}
