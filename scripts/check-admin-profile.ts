import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const targetEmail = 'kohcuendepau@gmail.com';
  
  console.log(`Checking user: ${targetEmail}`);
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error listing users:', authError);
    return;
  }
  
  const myUser = authUsers?.users?.find(u => u.email === targetEmail);
  console.log('User found in auth.users:', myUser?.id);
  
  if (myUser) {
    const { data: profile, error: profError } = await supabase.from('profiles').select('*').eq('id', myUser.id).single();
    
    if (profError) {
      console.error('Error fetching profile:', profError);
    }
    
    console.log('Profile found:', !!profile);
    if (!profile) {
      console.log('Profile is missing for user ID:', myUser.id);
    } else {
      console.log('Profile details:', profile);
    }
  } else {
    console.log('User not found in auth.users by email.');
  }
}

run();
