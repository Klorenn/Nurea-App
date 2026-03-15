import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: f, error: favErr } = await supabase.from('favorites').select('*').limit(1);
  console.log('Favorites Error:', favErr);
  
  const { data: p, error: payErr } = await supabase.from('payments').select('*').limit(1);
  console.log('Payments Error:', payErr);
}

check();
