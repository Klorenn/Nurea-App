"use server"

import { createClient } from "@/lib/supabase/server"

export async function requestGraduatePlan() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }
  
  // Check if user is professional
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, subscription_status")
    .eq("id", user.id)
    .single()
    
  if (!profile || profile.role !== 'professional') {
    return { success: false, error: "Only professionals can request this plan" }
  }
  
  // Only allow request if not already subscribed or pending
  if (profile.subscription_status === 'active' || profile.subscription_status === 'trialing') {
    return { success: false, error: "Already has an active subscription" }
  }
  
  const { error } = await supabase
    .from("profiles")
    .update({ 
      subscription_status: "pending_approval",
      selected_plan_id: "graduate"
    })
    .eq("id", user.id)
    
  if (error) {
    console.error("Error requesting graduate plan:", error)
    return { success: false, error: error.message }
  }
  
  return { success: true }
}
