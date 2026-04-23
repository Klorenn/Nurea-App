/**
 * Servicio para depositar en el contrato de Escrow Nurea (Soroban).
 * Flujo: conectar wallet del paciente → preparar tx deposit → firmar con Freighter → enviar a red.
 * Cuando tengas el contrato desplegado, configura NEXT_PUBLIC_ESCROW_CONTRACT_ID y
 * NEXT_PUBLIC_ESCROW_TOKEN_ID (y opcionalmente NEXT_PUBLIC_SOROBAN_RPC_URL).
 */

import { connectWallet } from "./stellarService";
import { signTransaction } from "@stellar/freighter-api";
import { Networks } from "stellar-sdk";

const SOROBAN_RPC_TESTNET = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

export type DepositEscrowParams = {
  appointmentId: string;
  doctorWallet: string;
  amount: string; // en unidades del token (ej. "10" para 10 USDC; 7 decimales = 10_0000000)
};

export type DepositEscrowResult = { txHash: string };

/**
 * Obtiene la clave pública del paciente (Freighter) y ejecuta el depósito en el contrato de escrow.
 * Si el contrato no está configurado o el usuario rechaza en Freighter, lanza.
 * Solo si la red confirma la transacción se devuelve txHash.
 */
export async function depositEscrowForBooking(
  params: DepositEscrowParams
): Promise<DepositEscrowResult> {
  const contractId = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID;
  const tokenId = process.env.NEXT_PUBLIC_ESCROW_TOKEN_ID;

  // 1) Conectar wallet del paciente (abre Freighter si hace falta)
  const patientWallet = await connectWallet();

  if (!contractId || !tokenId) {
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
      throw new Error(
        "Escrow no configurado. Por favor, configura NEXT_PUBLIC_ESCROW_CONTRACT_ID y NEXT_PUBLIC_ESCROW_TOKEN_ID."
      );
    }
    console.warn(
      "[sorobanEscrow] NEXT_PUBLIC_ESCROW_CONTRACT_ID o NEXT_PUBLIC_ESCROW_TOKEN_ID no configurados. Simulando depósito."
    );
    await new Promise((r) => setTimeout(r, 1200));
    return { txHash: `sim-${params.appointmentId}-${Date.now()}` };
  }

  // 2) Preparar transacción deposit en el backend (evita exponer lógica pesada en cliente)
  const rpcUrl = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || SOROBAN_RPC_TESTNET;
  const res = await fetch("/api/escrow/prepare-deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appointmentId: params.appointmentId,
      patientWallet,
      doctorWallet: params.doctorWallet,
      amount: params.amount,
      contractId,
      tokenId,
      networkPassphrase: NETWORK_PASSPHRASE,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 501) {
      throw new Error(
        "Pago por escrow no disponible aún. La reserva se guardará sin bloqueo de pago."
      );
    }
    throw new Error(data.message || res.statusText || "Error al preparar el depósito en escrow.");
  }

  const { xdr } = await res.json();
  if (!xdr) throw new Error("No se recibió la transacción para firmar.");

  // 3) Firmar con Freighter (el usuario puede rechazar aquí)
  const signResult = await signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if (signResult?.error) {
    const msg =
      typeof signResult.error === "object" && signResult.error !== null && "message" in signResult.error
        ? String((signResult.error as { message: string }).message)
        : String(signResult.error);
    throw new Error(msg || "Firma cancelada o rechazada.");
  }

  const signedXdr = signResult.signedTxXdr;
  if (!signedXdr) throw new Error("No se recibió la transacción firmada.");

  // 4) Enviar a la red (Soroban RPC)
  const submitRes = await fetch("/api/escrow/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signedXdr, rpcUrl }),
  });

  if (!submitRes.ok) {
    const data = await submitRes.json().catch(() => ({}));
    throw new Error(data.message || "Error al enviar la transacción.");
  }

  const { txHash } = await submitRes.json();
  if (!txHash) throw new Error("No se recibió el hash de la transacción.");
  return { txHash };
}
