/**
 * Full viewport — standalone routes (auth, /dashboard redirect, shell antes del sidebar).
 * Usa 100dvh para centrar bien en móviles (barra de URL).
 */
export function loadingFullViewportClassName(className?: string): string {
  const base = "flex min-h-[100dvh] w-full flex-col items-center justify-center"
  return className ? `${base} ${className}` : base
}

/**
 * Área principal del dashboard (sidebar + header h-14 + padding del layout).
 * Extiende al ancho/alto útil y centra el contenido; anula p-4/md:p-6/lg:p-8 de (main) y DashboardLayout.
 */
export function loadingDashboardInsetClassName(className?: string): string {
  const base = "flex w-full min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center -mx-4 -my-4 md:-mx-6 md:-my-6 lg:-mx-8 lg:-my-8"
  return className ? `${base} ${className}` : base
}

/**
 * Pantalla completa bajo un header h-14 (sin padding lateral del dashboard).
 * Ej.: `/dashboard/calendar` con barra "Volver".
 */
export function loadingBelowHeaderClassName(className?: string): string {
  const base = "flex w-full min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center"
  return className ? `${base} ${className}` : base
}