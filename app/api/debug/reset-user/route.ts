import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ subscription_status: 'inactive' })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error al resetear suscripción:', updateError);
      return NextResponse.json({ error: 'Fallo al actualizar perfil' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Usuario reseteado exitosamente para pruebas (suscripción inactiva).' 
    });
  } catch (error: any) {
    console.error('Error Debug Reset:', error.message || error);
    return NextResponse.json({ error: 'Error interno en el reseteo' }, { status: 500 });
  }
}
