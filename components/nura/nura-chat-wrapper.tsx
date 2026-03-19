"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const NuraChatLazy = dynamic(
  () => import("./NuraChat").then((mod) => mod.NuraChat),
  { ssr: false }
);

/**
 * Wrapper para Nura que evita que el botón/flotante aparezca
 * en pantallas donde estorba (por ejemplo, el chat paciente‑profesional).
 */
export function NuraChatDynamic() {
  const pathname = usePathname();

  // Ocultar Nura en el chat interno para no tapar el input ni la UI
  if (pathname?.startsWith("/dashboard/chat")) {
    return null;
  }

  return <NuraChatLazy />;
}

