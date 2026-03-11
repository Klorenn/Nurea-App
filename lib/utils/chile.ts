/**
 * Utilidades para localización Chile (Nurea).
 * Zona horaria: America/Santiago.
 * RUT: formato y validación básica.
 * Desarrollado por Pau Andreu Koh Cuende.
 */

/** Zona horaria oficial de Chile (continental) */
export const CHILE_TIMEZONE = "America/Santiago"

/**
 * Formatea una fecha/hora en zona horaria Chile.
 * Uso: fechas de citas, recordatorios, correos.
 */
export function formatInChileTimeZone(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "short",
    timeZone: CHILE_TIMEZONE,
  }
): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("es-CL", { ...options, timeZone: CHILE_TIMEZONE }).format(d)
}

/**
 * Fecha/hora actual (mismo instante UTC). Para mostrar en Chile use formatInChileTimeZone(nowInChile()).
 */
export function nowInChile(): Date {
  return new Date()
}

/**
 * Formato RUT chileno: 12.345.678-9 (con puntos y guión).
 * No valida dígito verificador; solo formatea.
 */
export function formatRut(value: string): string {
  const cleaned = value.replace(/\D/g, "").toUpperCase()
  if (cleaned.length === 0) return ""
  const body = cleaned.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  const dv = cleaned.slice(-1)
  return `${body}-${dv}`
}

/**
 * Valida RUT chileno (algoritmo módulo 11).
 * Acepta con o sin puntos/guión.
 */
export function isValidRut(rut: string): boolean {
  const cleaned = rut.replace(/\D/g, "").toUpperCase()
  if (cleaned.length < 2) return false
  const body = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1)
  let sum = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const expected = 11 - (sum % 11)
  const expectedStr = expected === 11 ? "0" : expected === 10 ? "K" : String(expected)
  return dv === expectedStr
}
