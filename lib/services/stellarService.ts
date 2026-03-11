/**
 * Stellar Service - Infraestructura para integración con Freighter (billetera).
 * Solo lógica: sin UI. Importar connectWallet donde se necesite (ej. botón).
 */

import { isConnected, requestAccess } from "@stellar/freighter-api";

// --- Conexión de billetera (Freighter) ---

/** Mensajes de error conocidos para tipado y UX posterior. */
export type StellarWalletErrorCode =
  | "FREIGHTER_NOT_INSTALLED"
  | "USER_REJECTED"
  | "NOT_IN_BROWSER"
  | "UNKNOWN";

export class StellarWalletError extends Error {
  code: StellarWalletErrorCode;

  constructor(message: string, code: StellarWalletErrorCode = "UNKNOWN") {
    super(message);
    this.name = "StellarWalletError";
    this.code = code;
  }
}

/**
 * Comprueba si Freighter está instalado (y estamos en navegador).
 */
async function checkFreighterInstalled(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }
  const result = await isConnected();
  return Boolean(result?.isConnected);
}

/**
 * Conecta la billetera Freighter y obtiene la clave pública del usuario.
 *
 * - Verifica que la extensión Freighter esté instalada.
 * - Solicita acceso a la clave pública (puede mostrar popup en Freighter).
 * - Retorna la clave pública (Stellar public key / address) si todo va bien.
 *
 * @returns La clave pública (public key) de la cuenta en Stellar.
 * @throws {StellarWalletError} Si Freighter no está instalado, el usuario rechaza, o hay error.
 */
export async function connectWallet(): Promise<string> {
  try {
    if (typeof window === "undefined") {
      throw new StellarWalletError(
        "Conexión de billetera solo disponible en el navegador.",
        "NOT_IN_BROWSER"
      );
    }

    const installed = await checkFreighterInstalled();
    if (!installed) {
      throw new StellarWalletError(
        "Freighter no está instalado. Instala la extensión para continuar.",
        "FREIGHTER_NOT_INSTALLED"
      );
    }

    const accessObj = await requestAccess();

    if (accessObj?.error) {
      const message =
        typeof accessObj.error === "object" && accessObj.error !== null && "message" in accessObj.error
          ? String((accessObj.error as { message: string }).message)
          : String(accessObj.error);
      throw new StellarWalletError(
        message || "El usuario rechazó la conexión o no se pudo obtener la clave pública.",
        "USER_REJECTED"
      );
    }

    const address = accessObj?.address;
    if (!address || typeof address !== "string") {
      throw new StellarWalletError(
        "No se recibió la clave pública de Freighter.",
        "UNKNOWN"
      );
    }

    return address;
  } catch (err) {
    if (err instanceof StellarWalletError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    throw new StellarWalletError(message, "UNKNOWN");
  }
}

// --- Procesamiento de pagos (stub para futura implementación con nuevo SDK) ---

/**
 * Procesamiento de pagos directo con Stellar.
 * Actualmente no está implementado para la versión instalada del SDK.
 * Usa los endpoints de escrow existentes en su lugar.
 */
export async function processPayment(
  _senderPublicKey: string,
  _destinationPublicKey: string,
  _amount: string
): Promise<never> {
  throw new Error(
    "processPayment no está implementado con la versión actual de stellar-sdk. Usa los endpoints de escrow."
  );
}
