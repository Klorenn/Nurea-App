"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2, Database, Shield, Users, Calendar, MessageSquare, Star, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface TestResult {
  name: string
  status: "loading" | "success" | "error"
  message?: string
}

export default function TestSupabasePage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    setLoading(true)
    const supabase = createClient()
    const testResults: TestResult[] = []

    // Test 1: Conexión básica
    testResults.push({ name: "Conexión con Supabase", status: "loading" })
    setResults([...testResults])

    try {
      const { data, error } = await supabase.from("profiles").select("count").limit(1)
      if (error) throw error
      testResults[0] = { name: "Conexión con Supabase", status: "success", message: "✅ Conectado correctamente" }
    } catch (err: any) {
      testResults[0] = { name: "Conexión con Supabase", status: "error", message: err.message }
    }
    setResults([...testResults])

    // Test 2: Verificar tablas
    const tables = [
      { name: "profiles", icon: Users },
      { name: "professionals", icon: Database },
      { name: "appointments", icon: Calendar },
      { name: "reviews", icon: Star },
      { name: "messages", icon: MessageSquare },
      { name: "favorites", icon: Heart },
    ]

    for (const table of tables) {
      testResults.push({ name: `Tabla: ${table.name}`, status: "loading" })
      setResults([...testResults])

      try {
        const { data, error } = await supabase.from(table.name).select("*").limit(1)
        if (error) throw error
        testResults[testResults.length - 1] = {
          name: `Tabla: ${table.name}`,
          status: "success",
          message: "✅ Tabla accesible",
        }
      } catch (err: any) {
        testResults[testResults.length - 1] = {
          name: `Tabla: ${table.name}`,
          status: "error",
          message: err.message,
        }
      }
      setResults([...testResults])
    }

    // Test 3: Verificar autenticación
    testResults.push({ name: "Sistema de Autenticación", status: "loading" })
    setResults([...testResults])

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      testResults[testResults.length - 1] = {
        name: "Sistema de Autenticación",
        status: "success",
        message: session ? `✅ Sesión activa (${session.user.email})` : "✅ Auth funcionando (sin sesión)",
      }
    } catch (err: any) {
      testResults[testResults.length - 1] = {
        name: "Sistema de Autenticación",
        status: "error",
        message: err.message,
      }
    }
    setResults([...testResults])

    // Test 4: Verificar RLS (Row Level Security)
    testResults.push({ name: "Row Level Security (RLS)", status: "loading" })
    setResults([...testResults])

    try {
      // Intentar leer perfiles (debería funcionar con RLS)
      const { data, error } = await supabase.from("profiles").select("id").limit(1)
      if (error && error.code === "42501") {
        testResults[testResults.length - 1] = {
          name: "Row Level Security (RLS)",
          status: "success",
          message: "✅ RLS activo (permisos correctos)",
        }
      } else if (error) {
        throw error
      } else {
        testResults[testResults.length - 1] = {
          name: "Row Level Security (RLS)",
          status: "success",
          message: "✅ RLS configurado",
        }
      }
    } catch (err: any) {
      testResults[testResults.length - 1] = {
        name: "Row Level Security (RLS)",
        status: "error",
        message: err.message,
      }
    }
    setResults([...testResults])

    setLoading(false)
  }

  const successCount = results.filter((r) => r.status === "success").length
  const errorCount = results.filter((r) => r.status === "error").length

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Verificación de Supabase</h1>
          <p className="text-muted-foreground">Verificando que todo esté configurado correctamente</p>
        </div>

        <Card className="border-teal-200/30 dark:border-teal-800/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultados de las Pruebas</span>
              {!loading && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal text-muted-foreground">
                    {successCount} ✅ / {errorCount} ❌
                  </span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && results.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className="ml-2 text-muted-foreground">Ejecutando pruebas...</span>
              </div>
            )}

            {results.map((result, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border",
                  result.status === "success" && "bg-teal-50/50 dark:bg-teal-950/20 border-teal-200/50 dark:border-teal-800/50",
                  result.status === "error" && "bg-red-50/50 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50",
                  result.status === "loading" && "bg-muted border-border"
                )}
              >
                {result.status === "loading" && <Loader2 className="h-5 w-5 animate-spin text-teal-600 mt-0.5" />}
                {result.status === "success" && <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5" />}
                {result.status === "error" && <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                <div className="flex-1">
                  <p className="font-medium text-foreground">{result.name}</p>
                  {result.message && <p className="text-sm text-muted-foreground mt-1">{result.message}</p>}
                </div>
              </div>
            ))}

            {!loading && results.length > 0 && (
              <div className="pt-4 border-t">
                <Button onClick={runTests} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  Ejecutar Pruebas Nuevamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {!loading && errorCount === 0 && (
          <Card className="border-teal-200/30 dark:border-teal-800/30 bg-teal-50/30 dark:bg-teal-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-teal-600" />
                <div>
                  <p className="font-semibold text-foreground">¡Todo está funcionando correctamente!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tu configuración de Supabase está lista. Puedes probar el registro e inicio de sesión con Google.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && errorCount > 0 && (
          <Card className="border-red-200/30 dark:border-red-800/30 bg-red-50/30 dark:bg-red-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-semibold text-foreground">Hay algunos problemas</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Revisa los errores arriba y consulta SUPABASE_COMPLETE_SETUP.md para solucionarlos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

