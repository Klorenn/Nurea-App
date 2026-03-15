import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRoles() {
  console.log('Fixing user roles...');

  // 1. Set kohcuendepau@gmail.com to admin
  const { data: adminUser } = await supabase.auth.admin.listUsers();
  const koh = adminUser?.users.find(u => u.email === 'kohcuendepau@gmail.com');
  
  if (koh) {
    console.log('Found Koh, setting to admin...');
    const { error: err1 } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', koh.id);
    if (err1) console.error('Error updating Koh:', err1);
    else console.log('Koh is now admin.');
  }

  // 2. Set especialistatest@nurea.app to professional and general doctor
  const sp = adminUser?.users.find(u => u.email === 'especialistatest@nurea.app');
  if (sp) {
    console.log('Found Specialist, setting to professional...');
    const { error: err2 } = await supabase
      .from('profiles')
      .update({ role: 'professional' })
      .eq('id', sp.id);
    if (err2) console.error('Error updating profile:', err2);
    else console.log('Specialist profile updated to professional.');

    const { error: err3 } = await supabase
      .from('professionals')
      .upsert({ 
        id: sp.id, 
        specialty: 'Médico General',
        verified: true, // Auto-verify for testing
        registration_number: 'MG-12345-678',
        years_experience: 10
      });
    if (err3) console.error('Error updating professional data:', err3);
    else console.log('Specialist professional data updated.');
  }

  console.log('Done!');
}

fixRoles();
