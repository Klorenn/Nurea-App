'use server';

import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SaveProfessionalProfileInput {
  gender: string;
  specialty: string;
  licenseNumber: string;
  licenseFileUrl?: string;
  officeLocation: string;
  phone: string;
  officeHours: Record<string, { start: string; end: string } | null>;
  services: string[];
  insuranceAccepted: string[];
  secondarySpecialties: string[];
  fullName: string;
  rut: string;
  dateOfBirth: string;
}

export async function saveProfessionalProfile(data: SaveProfessionalProfileInput) {
  const user = await currentUser();
  if (!user?.id) throw new Error('Not authenticated');

  // Validation
  if (!data.gender || !data.specialty || !data.licenseNumber || !data.officeLocation || !data.phone) {
    throw new Error('Missing required fields');
  }

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
        user_type: 'professional',
        full_name: data.fullName,
        rut: data.rut,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
      })
      .select('id')
      .single();

    if (createProfile.error) {
      throw new Error(createProfile.error.message);
    }

    profileId = createProfile.data?.id;
  }

  if (!profileId) {
    throw new Error('Failed to create or retrieve profile');
  }

  // Save or update professional profile
  const existing = await supabase
    .from('professional_profiles')
    .select('id')
    .eq('profile_id', profileId)
    .single();

  const professionalData = {
    specialty: data.specialty,
    license_number: data.licenseNumber,
    license_file_url: data.licenseFileUrl || null,
    office_location: data.officeLocation,
    phone: data.phone,
    office_hours: data.officeHours,
    services: data.services,
    insurance_accepted: data.insuranceAccepted,
    secondary_specialties: data.secondarySpecialties,
  };

  if (existing.data?.id) {
    const updateResult = await supabase
      .from('professional_profiles')
      .update(professionalData)
      .eq('profile_id', profileId);

    if (updateResult.error) {
      throw new Error(updateResult.error.message);
    }
  } else {
    const insertResult = await supabase
      .from('professional_profiles')
      .insert({
        profile_id: profileId,
        ...professionalData,
      });

    if (insertResult.error) {
      throw new Error(insertResult.error.message);
    }
  }

  // Mark onboarding as complete
  const updateOnboarding = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('user_id', user.id);

  if (updateOnboarding.error) {
    throw new Error(updateOnboarding.error.message);
  }

  return { success: true };
}

export async function uploadLicenseFile(formData: FormData): Promise<{ url: string }> {
  const user = await currentUser();
  if (!user?.id) throw new Error('Not authenticated');

  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only PDF, JPEG, PNG, and WebP are allowed.');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File is too large. Maximum size is 5MB.');
  }

  const buffer = await file.arrayBuffer();
  const fileName = `${user.id}/${Date.now()}-${file.name}`;

  const uploadResult = await supabase.storage
    .from('license-documents')
    .upload(fileName, buffer, {
      contentType: file.type,
    });

  if (uploadResult.error) {
    throw new Error(uploadResult.error.message);
  }

  const { data: publicUrl } = supabase.storage
    .from('license-documents')
    .getPublicUrl(fileName);

  return { url: publicUrl.publicUrl };
}
