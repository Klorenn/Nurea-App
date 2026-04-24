import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  // Check if onboarding already completed
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type, onboarding_completed')
    .eq('user_id', userId)
    .single();

  if (profile?.onboarding_completed) {
    redirect('/dashboard');
  }

  // If profile exists but no onboarding_completed, show appropriate form
  // If no profile, redirect to choose type (handle in page.tsx)

  return <>{children}</>;
}
