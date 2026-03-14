import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfessionalSettingsContent } from "./settings-content"

export default async function ProfessionalSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url")
    .eq("id", user.id)
    .single()

  const { data: professional } = await supabase
    .from("professionals")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <ProfessionalSettingsContent
      profile={profile}
      professional={professional}
      userEmail={user.email}
    />
  )
}
