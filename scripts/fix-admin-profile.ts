import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const targetEmail = 'kohcuendepau@gmail.com';
  
  console.log(`Fixing user: ${targetEmail}`);
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error listing users:', authError);
    return;
  }
  
  const myUser = authUsers?.users?.find(u => u.email === targetEmail);
  console.log('User found in auth.users:', myUser?.id);
  
  if (myUser) {
    const { error: insertError } = await supabase.from('profiles').upsert({
      id: myUser.id,
      role: 'admin',
      first_name: 'PAU',
      last_name: 'Koh',
      email_verified: true,
      updated_at: new Date().toISOString()
    });
    
    if (insertError) {
      console.error('Error inserting/updating profile:', insertError);
    } else {
      console.log('Successfully created/updated profile to admin role!');
    }
  } else {
    // If user does not exist in auth, let's create them!
    console.log("Creating user in auth since they do not exist.");
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { first_name: 'PAU', last_name: 'Koh' }
    });
    
    if (createError) {
      console.error("Error creating user:", createError);
      return;
    }
    
    const { error: insertError } = await supabase.from('profiles').upsert({
      id: newUser.user.id,
      email: newUser.user.email,
      role: 'admin',
      first_name: 'PAU',
      last_name: 'Koh',
      email_verified: true,
      updated_at: new Date().toISOString()
    });
    
    if (insertError) {
      console.error("Error creating profile:", insertError);
    } else {
      console.log("Successfully created user and admin profile");
    }
  }
}

run();
