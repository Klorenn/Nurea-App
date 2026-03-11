/**
 * Mapeo de nombres de ciudad/location a [lat, lng] para Chile.
 * Usado por el mapa de búsqueda para posicionar marcadores.
 */
const CHILE_CITY_COORDS: Record<string, [number, number]> = {
  santiago: [-33.4489, -70.6693],
  "santiago de chile": [-33.4489, -70.6693],
  "valparaíso": [-33.0472, -71.6127],
  valparaiso: [-33.0472, -71.6127],
  temuco: [-38.7397, -72.5984],
  "concepción": [-36.8267, -73.0617],
  concepcion: [-36.8267, -73.0617],
  "viña del mar": [-33.0246, -71.5518],
  "la serena": [-29.9027, -71.2519],
  antofagasta: [-23.6504, -70.4003],
  iquique: [-20.2141, -70.1504],
  "puerto montt": [-41.4718, -72.9396],
  osorno: [-40.5739, -73.1310],
  "chillán": [-36.6064, -72.1034],
  talca: [-35.4264, -71.6554],
  rancagua: [-34.1701, -70.7406],
}

const DEFAULT_CENTER: [number, number] = [-33.4489, -70.6693] // Santiago

/**
 * Obtiene [lat, lng] para un string de ubicación (ej. ciudad).
 * Normaliza el string a minúsculas y sin acentos para el match.
 */
export function locationToCoords(location: string | null | undefined): [number, number] | null {
  if (!location || typeof location !== "string") return null
  const normalized = location
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
  return CHILE_CITY_COORDS[normalized] ?? CHILE_CITY_COORDS[normalized.replace(/\s+/g, " ")] ?? null
}

/**
 * Centro por defecto del mapa (Chile).
 */
export function getDefaultMapCenter(): [number, number] {
  return DEFAULT_CENTER
}
