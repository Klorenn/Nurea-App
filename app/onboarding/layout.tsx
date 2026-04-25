import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Skip auth check - let middleware handle protection
  // For now, just render children
  return <>{children}</>
}