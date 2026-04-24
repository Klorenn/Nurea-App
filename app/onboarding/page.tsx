import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (!profile) {
    // No profile found, shouldn't happen (created during signup)
    redirect('/auth/register');
  }

  // Redirect to appropriate onboarding based on user role
  if (profile.role === 'professional') {
    redirect('/onboarding/professional');
  } else {
    redirect('/onboarding/patient');
  }
}
