"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from "@/components/ui/button"
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered,
  Type
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TipTapEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function TipTapEditor({ value, onChange, placeholder, className }: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: placeholder || 'Escribe aquí...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none min-h-[150px] p-4 focus:outline-none",
          className
        ),
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/50 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("h-8 w-8 p-0", editor.isActive('bold') && "bg-slate-200 dark:bg-slate-800")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("h-8 w-8 p-0", editor.isActive('italic') && "bg-slate-200 dark:bg-slate-800")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn("h-8 w-8 p-0", editor.isActive('underline') && "bg-slate-200 dark:bg-slate-800")}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("h-8 w-8 p-0", editor.isActive('bulletList') && "bg-slate-200 dark:bg-slate-800")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("h-8 w-8 p-0", editor.isActive('orderedList') && "bg-slate-200 dark:bg-slate-800")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
      <div className="flex justify-between items-center p-2 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Type className="h-3 w-3" />
          TipTap Editor
        </div>
        <div className={cn(
          "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-all",
          editor.storage.characterCount?.characters?.() < 50
            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-900"
            : "bg-teal-50 dark:bg-teal-950/30 text-teal-600 border-teal-200 dark:border-teal-900"
        )}>
           Mínimo 50 caracteres
        </div>
      </div>
    </div>
  )
}
