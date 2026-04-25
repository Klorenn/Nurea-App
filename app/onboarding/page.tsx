import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  try {
    const { userId } = await auth();

    if (!userId) {
      redirect('/login');
    }

    // Skip the profile check - just redirect to patient onboarding
    // The profile creation will happen in the individual pages
    redirect('/onboarding/patient');
  } catch (error) {
    console.error('Onboarding page error:', error);
    redirect('/login');
  }
}
