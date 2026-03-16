import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const REVENUECAT_SECRET = process.env.REVENUECAT_SECRET_KEY;
const ENTITLEMENT_ID = 'premium_access';

export async function POST() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // En un entorno de Sandbox/Debug, revocamos el acceso promocional de RevenueCat
    // Llamada: DELETE https://api.revenuecat.com/v1/subscribers/{app_user_id}/entitlements/{entitlement_id}/promotional
    
    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${user.id}/entitlements/${ENTITLEMENT_ID}/promotional`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${REVENUECAT_SECRET}`,
        'Content-Type': 'application/json',
      }
    });

    // También intentamos con el otro ID si existe
    await fetch(`https://api.revenuecat.com/v1/subscribers/${user.id}/entitlements/Nurea APP Pro/promotional`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${REVENUECAT_SECRET}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      console.error("Error al resetear usuario en RC:", errorText);
      return NextResponse.json({ error: 'Fallo al revocar permisos en RevenueCat' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Usuario reseteado exitosamente para pruebas.' 
    });

  } catch (error: any) {
    console.error('Error Debug Reset:', error.message || error);
    return NextResponse.json({ error: 'Error interno en el reseteo' }, { status: 500 });
  }
}
