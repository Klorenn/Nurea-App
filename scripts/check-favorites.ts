import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: favorites, error: favoritesError } = await supabase
    .from('favorites')
    .select(`
      id,
      professional_id,
      created_at,
      professional:professional_id (
        id,
        specialty,
        consultation_price,
        verified,
        location,
        profile:id (
          id,
          first_name,
          last_name,
          avatar_url
        )
      )
    `)
    .limit(1);
    
  console.log('Favorites Join Error:', favoritesError);
}

check();
