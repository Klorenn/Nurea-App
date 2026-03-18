"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Smile } from "lucide-react"
import { cn } from "@/lib/utils"

const emojiCategories = [
  {
    name: "Recientes",
    icon: "🕐",
    emojis: ["😊", "👍", "❤️", "😂", "🙏", "👋", "🎉", "✨"],
  },
  {
    name: "Caras",
    icon: "😀",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
      "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
      "😘", "☺️", "😚", "😙", "🥲", "😋", "😛", "😜",
      "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐",
      "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬",
      "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒",
      "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵",
    ],
  },
  {
    name: "Gestos",
    icon: "👋",
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "👌", "✌️", "🤞",
      "👈", "👉", "👆", "👇", "☝️", "👍", "👎", "✊",
      "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝",
      "🙏", "✍️", "💪",
    ],
  },
  {
    name: "Corazones",
    icon: "❤️",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
      "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
      "💘", "💝",
    ],
  },
  {
    name: "Símbolos",
    icon: "✅",
    emojis: [
      "✅", "❌", "⭕", "🔴", "🟢", "🔵", "❗", "❓",
      "‼️", "💯", "🔥", "✨", "⭐", "🌟", "💫", "🎯",
      "🏆", "🎉", "🎊", "🎁", "🔔", "📢",
    ],
  },
]

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0)
  const [open, setOpen] = useState(false)

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full shrink-0"
        >
          <Smile className="h-5 w-5" />
          <span className="sr-only">Abrir selector de emojis</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 shadow-lg border-border/50"
        side="top"
        align="start"
        sideOffset={8}
      >
        <div className="flex flex-col">
          {/* Category tabs */}
          <div className="flex border-b border-border p-1 gap-0.5 bg-muted/30">
            {emojiCategories.map((category, index) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(index)}
                className={cn(
                  "flex-1 flex items-center justify-center p-2 rounded-md text-lg transition-colors",
                  activeCategory === index
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-muted-foreground"
                )}
                title={category.name}
              >
                {category.icon}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="p-2 h-56 overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
              {emojiCategories[activeCategory].name}
            </p>
            <div className="grid grid-cols-8 gap-0.5">
              {emojiCategories[activeCategory].emojis.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  onClick={() => handleEmojiClick(emoji)}
                  className="h-9 w-9 flex items-center justify-center text-xl hover:bg-primary/10 rounded-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
