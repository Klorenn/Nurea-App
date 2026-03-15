import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError || !usersData?.users) {
    console.error('Failed to list users:', usersError);
    return;
  }
  
  const pt = usersData.users.find(u => u.email === 'pacientetest@nurea.app');
  const sp = usersData.users.find(u => u.email === 'especialistatest@nurea.app');

  if (!pt || !sp) {
    console.error('Test users not found');
    return;
  }

  // Create an appointment scheduled for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  const { data, error } = await supabase.from('appointments').insert({
    patient_id: pt.id,
    professional_id: sp.id,
    appointment_date: dateStr,
    appointment_time: '14:00',
    duration_minutes: 60,
    type: 'online',
    status: 'confirmed',
    price: 30000,
    payment_status: 'paid',
    video_platform: 'jitsi', // Defaulting manually, but the API will handle reading it
    meeting_link: 'https://meet.jit.si/nurea-test-123',
    meeting_room_id: 'nurea-test-123'
  }).select().single();

  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Created appointment ID:', data.id);
  }
}

run();
