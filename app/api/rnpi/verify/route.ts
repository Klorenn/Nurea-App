import { NextResponse } from "next/server"
import { formatRut, isValidRut } from "@/lib/utils/chile"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rutRaw = searchParams.get("rut") || ""

    const rutFormatted = formatRut(rutRaw)
    if (!rutFormatted || !isValidRut(rutFormatted)) {
      return NextResponse.json(
        { error: "invalid_rut", message: "RUT inválido. Debe ser en formato chileno con guión." },
        { status: 400 }
      )
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const rnpiUrl = `https://rnpi.superdesalud.gob.cl/?rut=${encodeURIComponent(rutFormatted)}`
    const res = await fetch(rnpiUrl, { signal: controller.signal, headers: { "user-agent": "nurea-app" } })
    clearTimeout(timeout)

    const html = await res.text()
    const lower = html.toLowerCase()

    // Heurísticas (el portal es SPA/Angular): intentamos detectar
    // si existe una lista de prestadores o un mensaje de "sin resultados".
    const indicatesNoResults =
      lower.includes("no se encontraron") ||
      lower.includes("sin resultados") ||
      lower.includes("no se ha encontrado") ||
      lower.includes("no existe")

    const indicatesHasResults =
      lower.includes("prestadores") &&
      (lower.includes("mostrar") || lower.includes("length") || lower.includes("rut"))

    // Si el portal devuelve únicamente "Cargando" o no hay señales claras, respondemos unknown.
    const isLikelyLoading = lower.includes("cargando") || lower.includes("favors utilitzar")

    let found: boolean | null = null
    if (indicatesHasResults && !indicatesNoResults) found = true
    else if (indicatesNoResults) found = false
    else if (isLikelyLoading) found = null

    return NextResponse.json({
      success: true,
      rut: rutFormatted,
      found,
    })
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return NextResponse.json(
        { success: false, error: "timeout", message: "Tiempo de espera agotado consultando RNPI." },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { success: false, error: "server_error", message: "No se pudo verificar RNPI." },
      { status: 500 }
    )
  }
}

