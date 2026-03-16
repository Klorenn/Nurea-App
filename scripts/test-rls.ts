import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing auth...");
  const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: userData, error: userError } = await adminClient.auth.admin.listUsers();
  const userId = userData?.users.find(u => u.email?.toLowerCase() === 'kohcuendepau@gmail.com')?.id;
  
  if (!userId) return console.log("User not found");
  
  // Create an authenticated client manually using the service role to simulate login
  const { data: userTokens, error: tokenError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: 'kohcuendepau@gmail.com'
  });

  // What about RLS on profiles using the anon key with JWT overriden?
  // Let's just create a signed JWT directly? Let's just use a select query and look at the RLS policy!
  let { data: profile_before, error: err1 } = await adminClient.from('profiles').select('*').eq('id', userId).single();
  console.log('Profile via admin:', profile_before.role);
  
}
test();
