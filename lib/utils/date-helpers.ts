/**
 * Helpers para parseo y validación de fechas en el proceso de agendamiento
 */

const monthNamesEs = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/**
 * Parsea una fecha del formato "Ene 15" o "Jan 15" a una fecha ISO (YYYY-MM-DD)
 * Maneja automáticamente el cambio de año
 */
export function parseShortDate(dateString: string, language: "es" | "en" = "es"): string {
  const monthNames = language === "es" ? monthNamesEs : monthNamesEn
  const parts = dateString.trim().split(" ")
  
  if (parts.length < 2) {
    throw new Error(language === "es" ? "Formato de fecha inválido" : "Invalid date format")
  }

  const monthName = parts[0]
  const dayNumber = parseInt(parts[1])
  
  if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31) {
    throw new Error(language === "es" ? "Día inválido" : "Invalid day")
  }

  const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthName.toLowerCase())
  
  if (monthIndex === -1) {
    throw new Error(language === "es" ? "Mes inválido" : "Invalid month")
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  // Crear fecha asumiendo año actual
  let appointmentDate = new Date(currentYear, monthIndex, dayNumber)

  // Si la fecha está en el pasado (mismo año), probablemente es del año siguiente
  // Ejemplo: Estamos en diciembre y la fecha es de enero
  if (appointmentDate < now && monthIndex < currentMonth) {
    appointmentDate = new Date(currentYear + 1, monthIndex, dayNumber)
  }
  // Si la fecha es hoy pero la hora ya pasó, o es en el pasado del mismo mes
  else if (appointmentDate < now) {
    // Si estamos cerca del fin de año y la fecha es de principios del año siguiente
    if (currentMonth >= 10 && monthIndex <= 2) {
      appointmentDate = new Date(currentYear + 1, monthIndex, dayNumber)
    } else {
      // Si no, es probablemente del año siguiente
      appointmentDate = new Date(currentYear + 1, monthIndex, dayNumber)
    }
  }

  return appointmentDate.toISOString().split('T')[0]
}

/**
 * Valida que una fecha y hora sean en el futuro
 */
export function isFutureDateTime(date: string, time: string): boolean {
  const dateTime = new Date(`${date}T${time}`)
  const now = new Date()
  return dateTime > now
}

/**
 * Valida que una fecha sea en el futuro (solo fecha, sin hora)
 */
export function isFutureDate(date: string): boolean {
  const dateObj = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dateObj.setHours(0, 0, 0, 0)
  return dateObj >= today
}

/**
 * Formatea una fecha ISO a formato corto "Ene 15"
 */
export function formatShortDate(date: string | Date, language: "es" | "en" = "es"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const monthNames = language === "es" ? monthNamesEs : monthNamesEn
  const monthName = monthNames[dateObj.getMonth()]
  const day = dateObj.getDate()
  return `${monthName} ${day}`
}

/**
 * Obtiene el nombre del día de la semana
 */
export function getDayName(date: string | Date, language: "es" | "en" = "es"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const dayNamesEs = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  const dayNamesEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const dayNames = language === "es" ? dayNamesEs : dayNamesEn
  return dayNames[dateObj.getDay()]
}

/**
 * Obtiene el nombre corto del día de la semana
 */
export function getShortDayName(date: string | Date, language: "es" | "en" = "es"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const dayNamesEs = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  const dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const dayNames = language === "es" ? dayNamesEs : dayNamesEn
  return dayNames[dateObj.getDay()]
}

/**
 * Valida que una hora esté en formato HH:MM válido
 */
export function isValidTime(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

/**
 * Combina fecha y hora en un objeto Date
 */
export function combineDateTime(date: string, time: string): Date {
  if (!isValidTime(time)) {
    throw new Error("Formato de hora inválido. Use HH:MM")
  }
  return new Date(`${date}T${time}`)
}

/**
 * Obtiene la fecha de hoy en formato ISO
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Obtiene la fecha de mañana en formato ISO
 */
export function getTomorrowISO(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const today = new Date()
  return dateObj.toDateString() === today.toDateString()
}

/**
 * Verifica si una fecha es mañana
 */
export function isTomorrow(date: string | Date): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return dateObj.toDateString() === tomorrow.toDateString()
}

