import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', '268bb863-ce29-4fb0-99ac-9ac08ef2c39c');
  console.log("Profiles data:", data);
  if (error) console.error("Error:", error);
}

check();
