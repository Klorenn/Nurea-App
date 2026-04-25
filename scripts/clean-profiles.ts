import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceKey)

async function cleanData() {
  console.log("Fetching profiles...")
  
  const { data: profiles, error: fetchError } = await supabase.from("profiles").select("id")
  
  if (fetchError) {
    console.error("Error fetching profiles:", fetchError.message)
    return
  }
  
  console.log(`Found ${profiles.length} profiles`)
  
  if (profiles.length > 0) {
    const ids = profiles.map(p => p.id)
    console.log("Deleting profiles:", ids)
    
    const { error: deleteError } = await supabase.from("profiles").delete().in("id", ids)
    
    if (deleteError) {
      console.error("Error deleting profiles:", deleteError.message)
    } else {
      console.log("Profiles deleted!")
    }
  }
  
  console.log("Fetching professionals...")
  
  const { data: professionals, error: fetchProfError } = await supabase.from("professionals").select("id")
  
  if (fetchProfError) {
    console.error("Error fetching professionals:", fetchProfError.message)
    return
  }
  
  console.log(`Found ${professionals.length} professionals`)
  
  if (professionals.length > 0) {
    const ids = professionals.map(p => p.id)
    console.log("Deleting professionals:", ids)
    
    const { error: deleteError } = await supabase.from("professionals").delete().in("id", ids)
    
    if (deleteError) {
      console.error("Error deleting professionals:", deleteError.message)
    } else {
      console.log("Professionals deleted!")
    }
  }
  
  console.log("Done!")
}

cleanData()