import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as StellarSdk from '@stellar/stellar-sdk';

// Configuración de red (Testnet por defecto para desarrollo)
const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET';
const server = new StellarSdk.Horizon.Server(
  STELLAR_NETWORK === 'PUBLIC' 
    ? 'https://horizon.stellar.org' 
    : 'https://horizon-testnet.stellar.org'
);

const NUREA_WALLET = process.env.NEXT_PUBLIC_NUREA_STELLAR_WALLET;
const EXPECTED_AMOUNT = "2.0000000"; // 2 USDC por ejemplo

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

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

    // 2. Liquidación: activar acceso premium en BD (suscripción vía Mercado Pago es el flujo principal)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ subscription_status: 'active' })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error al activar suscripción tras pago x402:', updateError);
      return NextResponse.json({ 
        error: 'Pago recibido pero hubo un error al activar la suscripción premium.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'x402 Micropayment completado. Acceso Premium concedido.' 
    });

  } catch (error: any) {
    console.error('Error x402 Settle:', error.message || error);
    return NextResponse.json({ error: 'Fallo al procesar la liquidación de la transacción' }, { status: 500 });
  }
}
