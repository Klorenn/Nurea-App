export type Gender = "M" | "F" | null | undefined

/**
 * Genderize professional specialty labels in Spanish.
 * Example: "Psicólogo General" -> "Psicóloga General" when gender = "F".
 */
export function genderizeSpecialtyLabel(title: string, gender: Gender): string {
  if (!title) return title
  if (gender !== "F") return title

  const t = title

  // Psychologist
  let out = t
    .replace(/\bpsicólog(o|O)\b/g, (m) => m.slice(0, -1) + (m.endsWith("O") ? "A" : "a"))
    .replace(/\bpsicolog(o|O)\b/g, (m) => m.slice(0, -1) + (m.endsWith("O") ? "A" : "a"))

  // Doctor
  out = out
    .replace(/\bmédic(o|O)\b/g, (m) => m.slice(0, -1) + (m.endsWith("O") ? "A" : "a"))
    .replace(/\bmedic(o|O)\b/g, (m) => m.slice(0, -1) + (m.endsWith("O") ? "A" : "a"))

  return out
}

