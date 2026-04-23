import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NUREA - Tu Plataforma de Salud",
    short_name: "NUREA",
    description: "Conecta con profesionales de la salud confiables en Chile. Reserva horas, gestiona tu salud y accede a servicios médicos de calidad.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d9488",
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["health", "medical", "lifestyle"],
    lang: "es-CL",
    dir: "ltr",
  }
}
