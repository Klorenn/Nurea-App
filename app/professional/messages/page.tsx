"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Plus, Copy, Trash2, Save } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageTemplate {
  id: string
  name: string
  content: string
  variables: string[]
}

const defaultTemplate: MessageTemplate = {
  id: "default",
  name: "Confirmación de Sesión",
  content: `Hola {{nombre}},

Espero que estés muy bien 🌿
Quería confirmarte con cariño los detalles de tu próxima sesión:

🗓 **Fecha:** {{fecha}}
⏰ **Hora:** {{hora}}
📍 **Modalidad:** {{modalidad}}
💰 **Valor:** {{valor}}

Para cuidar tu espacio y dejar la hora reservada, te agradeceré realizar el pago por **transferencia bancaria antes de la sesión**.

Si antes de la sesión necesitas comentarme algo, tienes alguna inquietud o te surge la necesidad de reprogramar, puedes escribirme con total confianza. Estoy aquí para acompañarte.

Un abrazo,
**María Jesús Chávez**
Psicóloga Clínica`,
  variables: ["nombre", "fecha", "hora", "modalidad", "valor"],
}

export default function MessagesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([defaultTemplate])
  const [selectedTemplate, setSelectedTemplate] = useState<string>(defaultTemplate.id)
  const [messageContent, setMessageContent] = useState("")
  const [variables, setVariables] = useState<Record<string, string>>({
    nombre: "",
    fecha: "",
    hora: "",
    modalidad: "",
    valor: "",
  })

  const currentTemplate = templates.find((t) => t.id === selectedTemplate) || defaultTemplate

  const replaceVariables = (content: string, vars: Record<string, string>) => {
    let result = content
    Object.entries(vars).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g")
      result = result.replace(regex, value || `{{${key}}}`)
    })
    return result
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setMessageContent(template.content)
      // Reset variables
      const newVars: Record<string, string> = {}
      template.variables.forEach((v) => {
        newVars[v] = variables[v] || ""
      })
      setVariables(newVars)
    }
  }

  const handleVariableChange = (key: string, value: string) => {
    setVariables({ ...variables, [key]: value })
    // Update message content in real-time
    const updatedContent = replaceVariables(currentTemplate.content, { ...variables, [key]: value })
    setMessageContent(updatedContent)
  }

  const handleCopyMessage = () => {
    const finalMessage = replaceVariables(messageContent, variables)
    navigator.clipboard.writeText(finalMessage)
    // You could add a toast notification here
  }

  const handleSaveTemplate = () => {
    const newTemplate: MessageTemplate = {
      id: Date.now().toString(),
      name: `Plantilla ${templates.length}`,
      content: messageContent,
      variables: currentTemplate.variables,
    }
    setTemplates([...templates, newTemplate])
  }

  // Initialize message content when template changes
  useEffect(() => {
    if (currentTemplate) {
      setMessageContent(currentTemplate.content)
    }
  }, [selectedTemplate, currentTemplate])

  return (
    <DashboardLayout role="professional">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" /> Mensajes Predeterminados
            </h1>
            <p className="text-muted-foreground mt-1">Gestiona tus plantillas de mensajes con variables</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Templates Sidebar */}
          <div className="space-y-4">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-lg">Plantillas</CardTitle>
                <CardDescription>Selecciona una plantilla para usar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateChange(template.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all",
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border/40 hover:border-primary/40"
                    )}
                  >
                    <p className="font-bold text-sm">{template.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {template.content.substring(0, 60)}...
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Message Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/40">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Editor de Mensaje</CardTitle>
                    <CardDescription>Completa las variables y personaliza tu mensaje</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={handleSaveTemplate}>
                      <Save className="h-4 w-4 mr-2" /> Guardar
                    </Button>
                    <Button size="sm" className="rounded-xl" onClick={handleCopyMessage}>
                      <Copy className="h-4 w-4 mr-2" /> Copiar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Variables Input */}
                <div className="space-y-4">
                  <Label className="text-lg font-bold">Variables</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentTemplate.variables.map((variable) => (
                      <div key={variable} className="space-y-2">
                        <Label htmlFor={variable} className="capitalize">
                          {variable}
                        </Label>
                        <input
                          id={variable}
                          type="text"
                          value={variables[variable] || ""}
                          onChange={(e) => handleVariableChange(variable, e.target.value)}
                          placeholder={`Ingresa ${variable}`}
                          className="w-full rounded-xl bg-accent/20 border-none px-3 py-2 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Preview */}
                <div className="space-y-2">
                  <Label className="text-lg font-bold">Vista Previa del Mensaje</Label>
                  <div className="bg-accent/10 rounded-xl p-4 border border-border/40 min-h-[300px]">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
                        {replaceVariables(messageContent, variables)}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Raw Template Editor */}
                <div className="space-y-2">
                  <Label className="text-lg font-bold">Editar Plantilla</Label>
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="min-h-[200px] rounded-xl bg-accent/20 border-none resize-none font-mono text-sm"
                    placeholder="Escribe tu mensaje aquí. Usa {{variable}} para variables..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Usa <code className="bg-accent/30 px-1 rounded">{"{{variable}}"}</code> para crear variables
                    dinámicas
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Variables Help */}
            <Card className="border-border/40 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Variables Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentTemplate.variables.map((variable) => (
                    <Badge key={variable} variant="secondary" className="justify-center py-2">
                      {"{{" + variable + "}}"}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Las variables se reemplazarán automáticamente en el mensaje final cuando copies el texto.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

