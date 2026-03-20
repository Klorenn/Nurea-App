import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  // 1. Verificación de Autenticación (Supabase)
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'No autorizado. Inicie sesión.' }, { status: 401 });
  }

  // 2. Verificación de suscripción activa (Mercado Pago vía webhook → profiles.subscription_status)
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, trial_end_date')
    .eq('id', user.id)
    .single();

  const now = new Date()
  const hasActive = profile?.subscription_status === 'active'
  const hasPendingApproval = profile?.subscription_status === 'pending_approval'
  const hasTrialAccess =
    profile?.subscription_status === 'trialing' &&
    profile?.trial_end_date &&
    new Date(profile.trial_end_date) > now

  const hasAccess = hasActive || hasPendingApproval || hasTrialAccess;

  // 3. Respuesta 402 si NO hay acceso
  if (!hasAccess) {
    return NextResponse.json(
      { 
        error: 'Acceso Premium Requerido', 
        message: 'Para ver este contenido debes tener una suscripción activa (Mercado Pago).',
        options: {
          fiat: "Suscripción Mercado Pago"
        }
      },
      { status: 402 }
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
