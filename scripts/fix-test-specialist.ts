import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const userId = '4ea7d91c-15e6-4db4-a9af-c130f612bb76'; // especialista@nurea.app

  // 1. Check current professionals record
  const { data: prof, error: profError } = await supabase
    .from('professionals')
    .select('*')
    .eq('id', userId)
    .single();

  console.log('Current professional record:', prof);
  if (profError) {
    console.log('Error:', profError.message);
  }

  // 2. Check columns available on professionals table
  const { data: columns, error: colError } = await supabase
    .from('professionals')
    .select('*')
    .limit(1);
  
  if (columns && columns.length > 0) {
    console.log('Available professional columns:', Object.keys(columns[0]));
  }

  // 3. Upsert with all possible fields to make the specialist visible in explore
  const updateData: Record<string, any> = {
    id: userId,
    verified: true,
    specialty: 'Medicina General',
  };

  // Add optional fields if they exist
  const possibleFields = {
    average_rating: 4.8,
    review_count: 12,
    consultation_price: 25000,
    online_price: 20000,
    in_person_price: 25000,
    consultation_type: 'both',
    years_experience: 5,
    languages: ['ES'],
    bio: 'Médico general con amplia experiencia en atención primaria.',
  };

  if (columns && columns.length > 0) {
    const availableCols = Object.keys(columns[0]);
    for (const [key, val] of Object.entries(possibleFields)) {
      if (availableCols.includes(key)) {
        updateData[key] = val;
      }
    }
  } else {
    // Apply all anyway, Supabase will ignore unknown columns
    Object.assign(updateData, possibleFields);
  }

  const { data: updated, error: updateError } = await supabase
    .from('professionals')
    .upsert(updateData, { onConflict: 'id' })
    .select();

  if (updateError) {
    console.error('Error updating professional:', updateError.message);
  } else {
    console.log('\n✅ Professional updated successfully:', updated);
  }

  // Also make sure the slug is set on the profile if it exists
  const { data: profile } = await supabase
    .from('professionals')
    .update({ slug: 'dr-especialista-test' })
    .eq('id', userId)
    .select();
    
  console.log('\n✅ Done! The specialist should now be visible in /explore');
}

main();
