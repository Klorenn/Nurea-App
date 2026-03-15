import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Signing in as admin...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'kohcuendepau@gmail.com',
    password: 'Password123!'
  });

  if (authError || !authData.user) {
    console.error('Failed to sign in as admin:', authError);
    return;
  }
  console.log('Logged in as admin. User ID:', authData.user.id);

  // We still need the specialist's user ID.
  const { data: spProfile, error: getError } = await supabase
    .from('profiles')
    .select('id')
    .eq('first_name', 'Especialista')
    .eq('last_name', 'Test')
    .single();

  if (getError || !spProfile) {
    console.error('Failed to find specialist profile:', getError);
    return;
  }
  
  console.log('Specialist id:', spProfile.id);

  // Now force it to professional while logged in as admin
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'professional' })
    .eq('id', spProfile.id);
  
  if (updateError) {
    console.error('Failed to update role as admin:', updateError);
  } else {
    console.log('Update command as admin succeeded');
  }
  
  const { data: profAfter } = await supabase.from('profiles').select('*').eq('id', spProfile.id).single();
  console.log('Profile after fix role is:', profAfter?.role);
}

run();
