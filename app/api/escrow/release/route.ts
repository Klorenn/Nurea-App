import { NextResponse } from "next/server";
import {
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Keypair,
  Address,
  xdr,
} from "stellar-sdk";
import { Server as SorobanRpcServer } from "stellar-sdk/rpc";
import { createClient } from "@/lib/supabase/server";

const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;
const POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 2000;

/**
 * Invoca release(appointment_id) en el contrato de escrow firmando con NUREA_ADMIN_SECRET_KEY.
 * Solo debe llamarse desde el dashboard del profesional. Tras ?xito en Soroban, actualiza
 * la cita en Supabase: status = completed, payment_status = paid.
 */
export async function POST(request: Request) {
  try {
    const secretKey = process.env.NUREA_ADMIN_SECRET_KEY;
    const contractId = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID;

    if (!secretKey || !contractId) {
      return NextResponse.json(
        {
          message:
            "Configuraci?n del escrow incompleta (NUREA_ADMIN_SECRET_KEY o NEXT_PUBLIC_ESCROW_CONTRACT_ID).",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { appointmentId } = body;

    if (!appointmentId || typeof appointmentId !== "string") {
      return NextResponse.json(
        { message: "Falta appointmentId." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "professional") {
      return NextResponse.json({ message: "Solo el profesional puede liberar el pago." }, { status: 403 });
    }

    const { data: appointment } = await supabase
      .from("appointments")
      .select("id, professional_id, payment_status, status")
      .eq("id", appointmentId)
      .single();

    if (!appointment) {
      return NextResponse.json({ message: "Cita no encontrada." }, { status: 404 });
    }

    if (appointment.professional_id !== user.id) {
      return NextResponse.json({ message: "No puedes liberar el pago de esta cita." }, { status: 403 });
    }

    if (appointment.payment_status === "paid") {
      return NextResponse.json({ message: "El pago ya fue liberado.", alreadyPaid: true }, { status: 200 });
    }

    if (appointment.payment_status !== "escrow_locked") {
      return NextResponse.json(
        { message: "Esta cita no tiene fondos en escrow para liberar." },
        { status: 400 }
      );
    }

    const keypair = Keypair.fromSecret(secretKey);
    const adminAddress = keypair.publicKey();
    const server = new SorobanRpcServer(SOROBAN_RPC_URL, {
      allowHttp: SOROBAN_RPC_URL.startsWith("http://"),
    });

    const account = await server.getAccount(adminAddress);
    const escrowContract = new Contract(contractId);
    const appointmentIdScVal = xdr.ScVal.scvString(appointmentId);
    const callerScVal = new Address(adminAddress).toScVal();
    const releaseOp = escrowContract.call("release", appointmentIdScVal, callerScVal);

    const rawTx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .setTimeout(60)
      .addOperation(releaseOp)
      .build();

    const preparedTx = await server.prepareTransaction(rawTx);
    preparedTx.sign(keypair);

    const sendResult = await server.sendTransaction(preparedTx);

    if (sendResult.errorResult) {
      return NextResponse.json(
        {
          message: "La transacci?n de liberaci?n fue rechazada por la red.",
          errorResult: sendResult.errorResult,
        },
        { status: 400 }
      );
    }

    const txHash = sendResult.hash;
    if (!txHash) {
      return NextResponse.json(
        { message: "No se recibi? hash de la transacci?n." },
        { status: 500 }
      );
    }

    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      const txResponse = await server.getTransaction(txHash);
      const status = (txResponse as { status?: string }).status;

      if (status === "SUCCESS") {
        const { error: updateError } = await supabase
          .from("appointments")
          .update({
            status: "completed",
            payment_status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", appointmentId);

        if (updateError) {
          console.error("[escrow release] Error actualizando Supabase:", updateError);
          return NextResponse.json(
            { message: "Pago liberado en blockchain pero fall? la actualizaci?n en base de datos." },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true, txHash });
      }

      if (status === "FAILED" || status === "NOT_FOUND") {
        return NextResponse.json(
          {
            message: status === "FAILED" ? "La transacci?n de liberaci?n fall?." : "No se pudo confirmar la transacci?n.",
            status,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: "Tiempo de espera agotado. La transacci?n puede estar pendiente.", txHash },
      { status: 202 }
    );
  } catch (e) {
    console.error("[escrow release]", e);
    return NextResponse.json(
      {
        message: e instanceof Error ? e.message : "Error al liberar el pago.",
      },
      { status: 500 }
    );
  }
}
