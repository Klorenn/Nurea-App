import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.log('No service role key found!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const sp = users.users.find(u => u.email === 'especialistatest@nurea.app');
  if (!sp) return console.log('user not found');
  
  console.log('User id:', sp.id);

  // 1. Update the actual Auth User metadata so the DB trigger sees them as professional
  const { error: authError } = await supabase.auth.admin.updateUserById(sp.id, {
    user_metadata: { role: 'professional' }
  });
  if (authError) {
    console.error('Failed to update auth metadata:', authError);
    return;
  }
  console.log('Auth metadata updated.');

  // 2. Now force it in profiles if needed, bypassing the trigger check
  // Wait, if we use the service role key, bypassing is fine if we are admin, but the trigger `is_admin()`
  // reads user_metadata. Since we updated the metadata, it evaluates properly? Better yet, if their
  // metadata is professional, they aren't admin so they STILL can't update `role` EXCEPT that we are Service Role!
  // Wait! A Service Role client DOES NOT FIRE triggers as a specific user unless set. But auth.uid() is null.
  // We can just execute raw sql as admin to bypass or we can try updating it now.
  const { error: updateError } = await supabase.from('profiles').update({ role: 'professional' }).eq('id', sp.id);
  
  if (updateError) {
    console.error('Failed to update profile role:', updateError);
  } else {
    console.log('Update profile command succeeded');
  }
  
  const { data: profAfter } = await supabase.from('profiles').select('*').eq('id', sp.id).single();
  console.log('Profile after fix role is:', profAfter?.role);
}

run();
