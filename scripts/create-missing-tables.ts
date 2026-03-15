import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const query = `
    CREATE TABLE IF NOT EXISTS public.favorites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(patient_id, professional_id)
    );
    ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "favorites_select_patient" ON public.favorites;
    CREATE POLICY "favorites_select_patient" ON public.favorites FOR SELECT TO authenticated USING (patient_id = auth.uid());
    
    DROP POLICY IF EXISTS "favorites_insert_patient" ON public.favorites;
    CREATE POLICY "favorites_insert_patient" ON public.favorites FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());
    
    DROP POLICY IF EXISTS "favorites_delete_patient" ON public.favorites;
    CREATE POLICY "favorites_delete_patient" ON public.favorites FOR DELETE TO authenticated USING (patient_id = auth.uid());

    CREATE TABLE IF NOT EXISTS public.payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
      amount NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT,
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "payments_select_patient" ON public.payments;
    CREATE POLICY "payments_select_patient" ON public.payments FOR SELECT TO authenticated USING (patient_id = auth.uid());
  `;

  const { error } = await supabase.rpc('execute_sql', { query });
  
  if (error) {
    console.log('Execute SQL failed. Let us try fallback using PostgREST or let the user run it via psql.');
    console.log('Error:', error);
  } else {
    console.log('Tables created successfully.');
  }
}

run();
