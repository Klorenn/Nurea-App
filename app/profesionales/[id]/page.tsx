import { redirect } from "next/navigation";

interface ProfessionalLegacyPageProps {
  params: Promise<{ id: string }>;
}

// Legacy Prisma-based route.
// We now use the Supabase-powered /professionals/[id] page for public profiles.
// This file simply redirects old URLs to the new route to avoid runtime errors.
export default async function ProfessionalLegacyPage({ params }: ProfessionalLegacyPageProps) {
  const { id } = await params;

  if (!id) {
    redirect("/explore");
  }

  redirect(`/professionals/${id}`);
}

