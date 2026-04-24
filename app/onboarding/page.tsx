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
    .select('user_type, onboarding_completed')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    // No profile found, shouldn't happen (created during signup)
    redirect('/auth/register');
  }

  if (profile.onboarding_completed) {
    redirect('/dashboard');
  }

  // Redirect to appropriate onboarding based on user type
  if (profile.user_type === 'professional') {
    redirect('/onboarding/professional');
  } else {
    redirect('/onboarding/patient');
  }
}
