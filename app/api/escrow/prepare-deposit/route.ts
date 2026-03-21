import { NextResponse } from "next/server";
import {
  Contract,
  TransactionBuilder,
  Networks,
  Address,
  xdr,
  BASE_FEE,
} from "stellar-sdk";
import { Server as SorobanRpcServer } from "stellar-sdk/rpc";
import { createClient } from "@/lib/supabase/server";

const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

/**
 * Prepara la transacción Soroban para invocar deposit(token, appointment_id, patient, doctor, amount).
 * Retorna la XDR sin firmar para que el frontend la firme con Freighter.
 */
export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const {
      appointmentId,
      patientWallet,
      doctorWallet,
      amount,
      contractId: bodyContractId,
      tokenId: bodyTokenId,
      networkPassphrase,
    } = body;

    const contractId = bodyContractId || process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID;
    const tokenId = bodyTokenId || process.env.NEXT_PUBLIC_ESCROW_TOKEN_ID;

    if (
      !contractId ||
      !tokenId ||
      !appointmentId ||
      !patientWallet ||
      !doctorWallet ||
      amount == null
    ) {
      return NextResponse.json(
        {
          message:
            "Faltan parámetros: contractId, tokenId, appointmentId, patientWallet, doctorWallet, amount.",
        },
        { status: 400 }
      );
    }

    const passphrase = networkPassphrase || NETWORK_PASSPHRASE;
    const rpcUrl = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || SOROBAN_RPC_URL;

    // Servidor Soroban RPC (Testnet)
    const server = new SorobanRpcServer(rpcUrl, { allowHttp: rpcUrl.startsWith("http://") });

    // Cargar cuenta del paciente (source de la transacción) para sequence number
    const account = await server.getAccount(patientWallet);

    // Contrato de escrow
    const escrowContract = new Contract(contractId);

    // Monto: si viene como número/string pequeño (ej. 45), se interpreta como unidades (45 USDC) y se escala a 7 decimales.
    const amountNum = typeof amount === "string" ? Number(amount) : Number(amount);
    const amountScaled =
      amountNum > 0 && amountNum < 1e6
        ? BigInt(Math.floor(amountNum * 10_000_000))
        : BigInt(Math.floor(amountNum));

    const amountScVal = xdr.ScVal.scvI128(amountScaled as any);

    // Argumentos en el orden del contrato: deposit(env, token, appointment_id, patient, doctor, amount)
    const tokenScVal = new Address(tokenId).toScVal();
    const appointmentIdScVal = xdr.ScVal.scvString(appointmentId);
    const patientScVal = new Address(patientWallet).toScVal();
    const doctorScVal = new Address(doctorWallet).toScVal();

    const depositOp = escrowContract.call(
      "deposit",
      tokenScVal,
      appointmentIdScVal,
      patientScVal,
      doctorScVal,
      amountScVal
    );

    const rawTx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: passphrase,
    })
      .setTimeout(60)
      .addOperation(depositOp)
      .build();

    // Simular y preparar (footprints, auth, fee)
    const preparedTx = await server.prepareTransaction(rawTx);

    const xdrOutput = preparedTx.toXDR();

    return NextResponse.json({
      xdr: xdrOutput,
      networkPassphrase: passphrase,
    });
  } catch (e: unknown) {
    console.error("[escrow prepare-deposit]", e);

    const err = e as { response?: { data?: { error?: string; data?: unknown } }; message?: string };
    const sorobanError = err.response?.data?.error;
    const message =
      sorobanError ||
      (err.message || "Error al preparar el depósito en escrow.");

    const status =
      typeof sorobanError === "string" && sorobanError.includes("insufficient")
        ? 402
        : 500;

    return NextResponse.json(
      {
        message,
        details: err.response?.data?.data ?? undefined,
      },
      { status }
    );
  }
}
