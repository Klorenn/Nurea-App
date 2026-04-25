'use server';

import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@/lib/auth/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function savePatientProfile(data: {
  gender: string;
  age: string;
  allergies: {
    medications: string[];
    other: string[];
  };
  currentMedications?: string;
  familyMedicalHistory?: string;
  chronicConditions: string[];
  reasonForConsultation: string;
  lifestyleHabits: {
    alcohol: boolean;
    smoking: boolean;
    drugs: boolean;
    exercise: string;
  };
  fullName: string;
  rut: string;
  dateOfBirth: string;
}) {
  const user = await currentUser();
  if (!user?.id) throw new Error('Not authenticated');

  // Get or create profile
  let profile = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  let profileId = profile.data?.id;

  if (!profile.data) {
    const createProfile = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        user_type: 'patient',
        full_name: data.fullName,
        rut: data.rut,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
      })
      .select('id')
      .single();

    profileId = createProfile.data?.id;
  }

  // Save patient data
  const existing = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('profile_id', profileId)
    .single();

  if (existing.data?.id) {
    await supabase
      .from('patient_profiles')
      .update({
        allergies: data.allergies,
        current_medications: data.currentMedications,
        family_medical_history: data.familyMedicalHistory,
        chronic_conditions: data.chronicConditions,
        reason_for_consultation: data.reasonForConsultation,
        lifestyle_habits: data.lifestyleHabits,
      })
      .eq('profile_id', profileId);
  } else {
    await supabase
      .from('patient_profiles')
      .insert({
        profile_id: profileId,
        allergies: data.allergies,
        current_medications: data.currentMedications,
        family_medical_history: data.familyMedicalHistory,
        chronic_conditions: data.chronicConditions,
        reason_for_consultation: data.reasonForConsultation,
        lifestyle_habits: data.lifestyleHabits,
      });
  }

  // Mark onboarding as complete
  await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('user_id', user.id);

  return { success: true };
}
