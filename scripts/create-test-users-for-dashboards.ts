import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser(email: string, role: string) {
  const password = 'nureapp123';
  
  console.log(`Creating/updating ${role}: ${email}`);
  
  // Create user in auth schema
  const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
  let user = authUsers?.users?.find(u => u.email === email);
  
  // First delete the user if they exist to start fresh
  if (user) {
    console.log(`Deleting existing user ${email}...`);
    await supabase.auth.admin.deleteUser(user.id);
  }
  
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { 
      first_name: role === 'patient' ? 'Paciente' : 'Especialista', 
      last_name: 'Test',
      role: role // CRITICAL: This bypasses the DB trigger default
    }
  });
  
  if (createError) {
    console.error(`Error creating user ${email}:`, createError);
    return;
  }
  user = newUser.user;

  // Create profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    first_name: role === 'patient' ? 'Paciente' : 'Especialista',
    last_name: 'Test',
    role: role,
    email_verified: true,
    updated_at: new Date().toISOString()
  });

  if (profileError) {
    console.error(`Error creating profile for ${email}:`, profileError);
  } else {
    console.log(`Successfully created/updated profile for ${email} as ${role}`);
  }

  // If specialist, might need to create professional record
  if (role === 'professional') {
    const { error: profError } = await supabase.from('professionals').upsert({
      id: user.id,
      specialty: 'Medicina General',
      consultation_type: 'both',
      consultation_price: 30000,
      online_price: 30000,
      in_person_price: 35000,
      verified: true,
      years_experience: 5,
      languages: ['ES'],
      availability: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    if (profError) {
      console.error(`Error creating professional record for ${email}:`, profError);
    } else {
      console.log(`Successfully created professional record for ${email}`);
    }
  }
}

async function run() {
  await createUser('pacientetest@nurea.app', 'patient');
  await createUser('especialistatest@nurea.app', 'professional');
  console.log('✅ Accounts processed successfully.');
}

run();
