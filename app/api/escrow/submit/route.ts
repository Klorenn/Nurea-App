import { NextResponse } from "next/server";
import { TransactionBuilder, Networks } from "stellar-sdk";
import { Server as SorobanRpcServer } from "stellar-sdk/rpc";
import { createClient } from "@/lib/supabase/server";

const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;
const POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 2000;

/**
 * Recibe la transacción firmada (XDR), la envía al Soroban RPC y espera a que
 * el estado sea SUCCESS antes de devolver el txHash.
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
    const { signedXdr, rpcUrl: bodyRpcUrl } = body;

    if (!signedXdr) {
      return NextResponse.json({ message: "Falta signedXdr." }, { status: 400 });
    }

    const rpcUrl = bodyRpcUrl || process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || SOROBAN_RPC_URL;
    const server = new SorobanRpcServer(rpcUrl, { allowHttp: rpcUrl.startsWith("http://") });

    // Reconstruir la transacción desde el XDR firmado
    const transaction = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

    // Enviar a la red
    const sendResult = await server.sendTransaction(transaction);

    if (sendResult.errorResult) {
      return NextResponse.json(
        {
          message: "La transacción fue rechazada por la red.",
          errorResult: sendResult.errorResult,
        },
        { status: 400 }
      );
    }

    const txHash = sendResult.hash;
    if (!txHash) {
      return NextResponse.json(
        { message: "No se recibió hash de la transacción." },
        { status: 500 }
      );
    }

    // Poll hasta que el estado sea SUCCESS (o FAILED)
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      const txResponse = await server.getTransaction(txHash);

      if (txResponse.status === "SUCCESS") {
        return NextResponse.json({ txHash });
      }

      if (txResponse.status === "FAILED" || txResponse.status === "NOT_FOUND") {
        return NextResponse.json(
          {
            message:
              txResponse.status === "FAILED"
                ? "La transacción falló en la red."
                : "No se pudo confirmar la transacción.",
            status: txResponse.status,
            errorResult: (txResponse as { errorResult?: string }).errorResult,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Tiempo de espera agotado. La transacción puede estar pendiente.",
        txHash,
      },
      { status: 202 }
    );
  } catch (e) {
    console.error("[escrow submit]", e);
    return NextResponse.json(
      {
        message: e instanceof Error ? e.message : "Error al enviar la transacción.",
      },
      { status: 500 }
    );
  }
}
