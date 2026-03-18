"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { EmojiPicker } from "./emoji-picker"
import { Paperclip, Send, Mic, Image, FileText } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  placeholder?: string
  disabled?: boolean
  businessHours?: string
}

export function ChatInput({
  onSendMessage,
  placeholder = "Escribe un mensaje...",
  disabled = false,
  businessHours,
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    textareaRef.current?.focus()
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  return (
    <div className="p-4 bg-card border-t border-border shrink-0">
      <div className="flex items-end gap-2 bg-muted/50 rounded-2xl p-2 border border-border/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0"
            >
              <Paperclip className="h-5 w-5" />
              <span className="sr-only">Adjuntar archivo</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-48">
            <DropdownMenuItem className="gap-2 focus:bg-primary/10">
              <Image className="h-4 w-4 text-primary" />
              <span>Imagen o video</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 focus:bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
              <span>Documento</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <EmojiPicker onEmojiSelect={handleEmojiSelect} />

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 min-h-[36px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2 px-1 text-sm shadow-none"
          rows={1}
        />

        {message.trim() ? (
          <Button
            onClick={handleSend}
            disabled={disabled}
            size="icon"
            className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 shrink-0 shadow-sm"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar mensaje</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0"
          >
            <Mic className="h-5 w-5" />
            <span className="sr-only">Grabar audio</span>
          </Button>
        )}
      </div>
      {businessHours && (
        <p className="text-xs text-muted-foreground text-center mt-2 px-2">
          {businessHours}
        </p>
      )}
    </div>
  )
}
