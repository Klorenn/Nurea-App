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
 * POST /api/escrow/refund
 * Invoca refund(appointment_id, caller) en el contrato de escrow firmando con NUREA_ADMIN_SECRET_KEY.
 * El paciente no firma: el backend (admin) ejecuta el reembolso en 1 clic.
 * Si la cita no tiene fondos en escrow (payment_status !== 'escrow_locked'), retorna success + skipped.
 */
export async function POST(request: Request) {
  try {
    const secretKey = process.env.NUREA_ADMIN_SECRET_KEY;
    const contractId = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID;

    const body = await request.json();
    const { appointment_id: appointmentIdParam } = body;
    const appointmentId = appointmentIdParam ?? body.appointmentId;

    if (!appointmentId || typeof appointmentId !== "string") {
      return NextResponse.json(
        { message: "Falta appointment_id." },
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

    const { data: appointment } = await supabase
      .from("appointments")
      .select("id, patient_id, professional_id, payment_status, status")
      .eq("id", appointmentId)
      .single();

    if (!appointment) {
      return NextResponse.json({ message: "Cita no encontrada." }, { status: 404 });
    }

    const isPatient = appointment.patient_id === user.id;
    const isProfessional = appointment.professional_id === user.id;
    if (!isPatient && !isProfessional) {
      return NextResponse.json(
        { message: "No tienes permiso para solicitar el reembolso de esta cita." },
        { status: 403 }
      );
    }

    if (appointment.status === "cancelled") {
      return NextResponse.json(
        { message: "Esta cita ya está cancelada.", alreadyCancelled: true },
        { status: 400 }
      );
    }

    if (appointment.payment_status !== "escrow_locked") {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "No hay fondos en escrow para esta cita; se puede cancelar en la app.",
      });
    }

    if (!secretKey || !contractId) {
      return NextResponse.json(
        {
          message:
            "Configuración del escrow incompleta (NUREA_ADMIN_SECRET_KEY o NEXT_PUBLIC_ESCROW_CONTRACT_ID).",
        },
        { status: 500 }
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
    const refundOp = escrowContract.call("refund", appointmentIdScVal, callerScVal);

    const rawTx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .setTimeout(60)
      .addOperation(refundOp)
      .build();

    const preparedTx = await server.prepareTransaction(rawTx);
    preparedTx.sign(keypair);

    const sendResult = await server.sendTransaction(preparedTx);

    if (sendResult.errorResult) {
      return NextResponse.json(
        {
          message: "No se pudo procesar el reembolso. Los fondos pueden no estar disponibles o ya fueron liberados.",
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

    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      const txResponse = await server.getTransaction(txHash);
      const status = (txResponse as { status?: string }).status;

      if (status === "SUCCESS") {
        return NextResponse.json({ success: true, txHash });
      }

      if (status === "FAILED" || status === "NOT_FOUND") {
        return NextResponse.json(
          {
            message:
              status === "FAILED"
                ? "No se pudo procesar el reembolso. Los fondos pueden no estar disponibles."
                : "No se pudo confirmar la transacción.",
            status,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Tiempo de espera agotado. El reembolso puede estar pendiente.",
        txHash,
      },
      { status: 202 }
    );
  } catch (e) {
    console.error("[escrow refund]", e);
    return NextResponse.json(
      {
        message:
          e instanceof Error ? e.message : "No se pudo procesar el reembolso.",
      },
      { status: 500 }
    );
  }
}
