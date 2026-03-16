import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const TEST_ACCOUNTS = [
  {
    email: 'paciente@nurea.app',
    password: 'nureatest123',
    role: 'patient',
    first_name: 'Paciente',
    last_name: 'Test',
  },
  {
    email: 'especialista@nurea.app',
    password: 'nureatest123',
    role: 'professional',
    first_name: 'Especialista',
    last_name: 'Test',
  },
];

async function createOrUpdateTestAccount(account: typeof TEST_ACCOUNTS[0]) {
  const { email, password, role, first_name, last_name } = account;

  // 1. Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

  let userId: string;

  if (existing) {
    console.log(`⚡ User ${email} already exists — updating password & metadata...`);
    const { data: updated, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { role, first_name, last_name },
    });
    if (error) throw new Error(`Failed to update ${email}: ${error.message}`);
    userId = existing.id;
  } else {
    console.log(`✨ Creating new user: ${email}...`);
    const { data: created, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, first_name, last_name },
    });
    if (error) throw new Error(`Failed to create ${email}: ${error.message}`);
    userId = created.user.id;
  }

  // 2. Upsert profile row
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        role,
        first_name,
        last_name,
        email_verified: true,
        account_status: 'active',
        is_onboarded: role === 'patient' ? true : false,
      },
      { onConflict: 'id' }
    );

  if (profileError) {
    console.warn(`⚠️  Profile upsert warning for ${email}: ${profileError.message}`);
  } else {
    console.log(`✅  Profile upserted for ${email} (role: ${role})`);
  }

  // 3. If professional, also upsert into professionals table if it exists
  if (role === 'professional') {
    const { error: profError } = await supabase
      .from('professionals')
      .upsert(
        {
          id: userId,
          specialty: 'Medicina General',
          verified: true,
        },
        { onConflict: 'id' }
      );

    if (profError) {
      console.warn(`⚠️  Professionals upsert warning: ${profError.message}`);
    } else {
      console.log(`✅  Professional record upserted for ${email}`);
    }
  }

  return { userId, email, role };
}

async function main() {
  console.log('🚀 Creating NUREA test accounts...\n');

  for (const account of TEST_ACCOUNTS) {
    try {
      const result = await createOrUpdateTestAccount(account);
      console.log(`   → ID: ${result.userId}\n`);
    } catch (err) {
      console.error(`❌ Error with ${account.email}:`, err);
    }
  }

  console.log('🎉 Done! Credentials:');
  for (const acc of TEST_ACCOUNTS) {
    console.log(`   ${acc.role.padEnd(12)} → ${acc.email}  /  ${acc.password}`);
  }
}

main();
