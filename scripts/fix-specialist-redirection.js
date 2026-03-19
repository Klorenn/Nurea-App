const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Explicitly load .env.local from the project root
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const email = 'especialista@nurea.app';
  
  console.log(`🔍 Checking user ${email}...`);

  // 1. Find user in Auth
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;
  
  const user = users.find(u => u.email === email);
  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log(`✅ Found Auth User: ${user.id}`);

  // 2. Update Auth metadata to "professional"
  const { error: authUpdateError } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, role: 'professional' }
  });

  if (authUpdateError) {
    console.error('❌ Error updating Auth metadata:', authUpdateError.message);
  } else {
    console.log('✅ Auth metadata updated to role: professional');
  }

  // 3. Update Profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'professional' })
    .eq('id', user.id);

  if (profileError) {
    console.error('❌ Error updating profiles table:', profileError.message);
  } else {
    console.log('✅ Profiles table updated to role: professional');
  }

  // 4. Ensure record in professionals table with availability
  const mockAvailability = {
    monday: { online: { available: true, hours: "09:00 - 18:00" }, "in-person": { available: true, hours: "09:00 - 13:00" }, slotDuration: 60 },
    tuesday: { online: { available: true, hours: "09:00 - 18:00" }, "in-person": { available: true, hours: "14:00 - 18:00" }, slotDuration: 60 },
    wednesday: { online: { available: true, hours: "09:00 - 18:00" }, "in-person": { available: true, hours: "09:00 - 18:00" }, slotDuration: 60 },
    thursday: { online: { available: true, hours: "09:00 - 18:00" }, "in-person": { available: true, hours: "09:00 - 18:00" }, slotDuration: 60 },
    friday: { online: { available: true, hours: "09:00 - 18:00" }, "in-person": { available: true, hours: "09:00 - 18:00" }, slotDuration: 60 },
  };

  const { error: profError } = await supabase
    .from('professionals')
    .upsert({
      id: user.id,
      specialty: 'Psicología Clínica',
      availability: mockAvailability,
      consultation_price: 35000,
      online_price: 30000,
      in_person_price: 35000,
      consultation_type: 'both',
      verified: true,
      slug: 'especialista-test'
    }, { onConflict: 'id' });

  if (profError) {
    console.error('❌ Error updating professionals table:', profError.message);
  } else {
    console.log('✅ Professionals record updated with availability and prices');
  }

  console.log('\n🚀 Specialist account is now fully configured as PROFESSIONAL.');
}

main().catch(console.error);
