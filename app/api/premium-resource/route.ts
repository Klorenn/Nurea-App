import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Simula la llamada S2S a RevenueCat para verificar Entitlements
// En producción, se usaría fetch() al API REST de RevenueCat (/v1/subscribers...)
// o el SDK si se adapta a Edge/Node.
async function checkRevenueCatEntitlement(appUserId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${appUserId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.REVENUECAT_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error("Error consultando RevenueCat:", response.status);
      return false;
    }

    const data = await response.json();
    
    // Verificamos si el usuario tiene el entitlement de premium_access (nuevo) o Nurea APP Pro (legacy)
    const entitlements = data?.subscriber?.entitlements;
    const hasPremiumAccess = (entitlements?.['premium_access']?.expires_date === null || 
                              new Date(entitlements?.['premium_access']?.expires_date) > new Date()) ||
                             (entitlements?.['Nurea APP Pro']?.expires_date === null || 
                              new Date(entitlements?.['Nurea APP Pro']?.expires_date) > new Date());
                             
    return !!hasPremiumAccess;
  } catch (error) {
    console.error("Excepción en checkRevenueCatEntitlement:", error);
    return false;
  }
}

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Verificación de Autenticación Base (Supabase)
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }

  // 2. Verificación de Permisos Vía RevenueCat Gatekeeper
  // El App User ID debe corresponder al ID único en tu BD.
  const appUserId = user.id; 
  const hasAccess = await checkRevenueCatEntitlement(appUserId);

  // 3. Respuesta X402 (Payment Required) si NO hay acceso
  if (!hasAccess) {
    return NextResponse.json(
      { 
        error: 'Acceso Premium Requerido', 
        message: 'Para ver este contenido debes estar suscrito o realizar un micropago x402.',
        options: {
          fiat: "Stripe Subscription (RevenueCat)",
          crypto: "Stellar Micropayment (USDC)"
        }
      },
      { 
        status: 402, // HTTP 402 Payment Required
        headers: {
          // Headers estandarizados del protocolo x402
          'X-402-Payment-Required': `2.0 USDC; address=${process.env.NEXT_PUBLIC_NUREA_STELLAR_WALLET || "G_NUREA_WALLET"}`,
          'X-402-Gateway': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nurea.app'}/api/x402/settle`,
          'Access-Control-Expose-Headers': 'X-402-Payment-Required, X-402-Gateway'
        }
      }
    );
  }

  // 4. Si TIENE acceso, se entrega el recurso protegido
  return NextResponse.json({ 
    success: true, 
    data: {
      type: "premium_report",
      content: "Resultados del análisis impulsados por Nura AI...",
      generated_at: new Date().toISOString()
    }
  });
}
