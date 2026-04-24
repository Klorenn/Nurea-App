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

  // Check if profile exists
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    // Profile doesn't exist yet - create a temporary one or redirect
    // Try to create a default profile
    try {
      const { error: createError } = await supabase.from('profiles').insert({
        id: userId,
        first_name: '',
        last_name: '',
        role: 'patient',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (createError) {
        console.error('Failed to create profile:', createError);
        redirect('/auth/register');
      }
    } catch (err) {
      console.error('Error creating profile:', err);
      redirect('/auth/register');
    }
  }

  return <>{children}</>;
}
