import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import * as StellarSdk from '@stellar/stellar-sdk';

// Configuración de red (Testnet por defecto para desarrollo)
const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET';
const server = new StellarSdk.Horizon.Server(
  STELLAR_NETWORK === 'PUBLIC' 
    ? 'https://horizon.stellar.org' 
    : 'https://horizon-testnet.stellar.org'
);

const NUREA_WALLET = process.env.NEXT_PUBLIC_NUREA_STELLAR_WALLET;
const REVENUECAT_SECRET = process.env.REVENUECAT_SECRET_KEY;
const EXPECTED_AMOUNT = "2.0000000"; // 2 USDC por ejemplo

/**
 * Concede un "Promotional Entitlement" vía API de RevenueCat (Server-to-Server)
 * @param appUserId ID del usuario en NUREA (Supabase UUID)
 * @param durationDays Cantidad de días de acceso (ej: 1 día por micropago)
 */
async function grantRevenueCatAccess(appUserId: string, durationDays: number = 1) {
  try {
    const startTimeStampMs = Date.now();
    const endTimeStampMs = startTimeStampMs + (durationDays * 24 * 60 * 60 * 1000);

    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${appUserId}/entitlements/premium_access/promotional`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REVENUECAT_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        duration: "daily", // o el formato que pida tu setup de RC
        start_time_ms: startTimeStampMs,
        end_time_ms: endTimeStampMs
      })
    });

    if (!response.ok) {
      console.error("Error al conceder entitlement en RevenueCat:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Excepción en grantRevenueCatAccess:", error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { transactionHash } = await req.json();

    if (!transactionHash) {
      return NextResponse.json({ error: 'Falta el hash de la transacción (txHash)' }, { status: 400 });
    }

    // 1. Verificación en la red Stellar (Gatekeeper Check)
    // Obtenemos la transacción desde Horizon
    const tx = await server.transactions().transaction(transactionHash).call();
    
    // Obtenemos las operaciones de esa transacción
    const ops = await tx.operations();

    let paymentValid = false;

    // Buscamos si hay una operación de pago (Payment) hacia la billetera de Nurea
    for (const op of ops.records) {
      if (op.type === 'payment' && op.to === NUREA_WALLET) {
        // En un entorno real, también verificaríamos que el asset_code sea 'USDC' 
        // y el asset_issuer sea el del USDC oficial de testnet/mainnet.
        if (parseFloat(op.amount) >= parseFloat(EXPECTED_AMOUNT)) {
            paymentValid = true;
            break;
        }
      }
    }

    if (!paymentValid) {
      return NextResponse.json({ 
        error: 'Transacción inválida o monto insuficiente.',
        details: `Se esperaban ${EXPECTED_AMOUNT} XLM/USDC depositados en ${NUREA_WALLET}` 
      }, { status: 402 });
    }

    // 2. Liquidación (Settlement): Sincronizar pago con RevenueCat
    // El pago es on-chain válido. Le damos 1 día de acceso Premium usando el API
    const granted = await grantRevenueCatAccess(user.id, 1);

    if (!granted) {
      return NextResponse.json({ 
        error: 'Pago recibido pero hubo un error al activar la suscripción premium.' 
      }, { status: 500 });
    }

    // 3. (Opcional) Registrar la auditoría en Supabase
    // await supabase.from('stellar_payments').insert({
    //   user_id: user.id,
    //   tx_hash: transactionHash,
    //   amount: EXPECTED_AMOUNT,
    //   status: 'settled_revenuecat'
    // });

    return NextResponse.json({ 
      success: true, 
      message: 'x402 Micropayment completado. Acceso Premium concedido.' 
    });

  } catch (error: any) {
    console.error('Error x402 Settle:', error.message || error);
    return NextResponse.json({ error: 'Fallo al procesar la liquidación de la transacción' }, { status: 500 });
  }
}
