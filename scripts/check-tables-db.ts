import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.rpc('execute_sql', { query: "SELECT tablename FROM pg_tables WHERE schemaname='public'" });
  if (error) {
    console.log('Cannot use execute_sql. Will try selecting from pg_tables directly if possible, or via PostgREST.');
    // Try to generic request to /rest/v1/
    const res = await supabase.from('favorites').select('id').limit(1);
    console.log('Favorites exist check (id only):', res);
  } else {
    console.log('Tables:', data);
  }
}

check();
