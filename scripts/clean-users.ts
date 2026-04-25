import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function cleanUsers() {
  console.log("Fetching all users...")

  const { data, error } = await supabase.auth.admin.listUsers()

  console.log("Response:", { data, error })
  
  const users = data?.users || []

  console.log(`Found ${users.length} users`)

  for (const user of users) {
    console.log(`Deleting user: ${user.email} (${user.id})`)
    
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
    
    if (deleteError) {
      console.error(`  Failed to delete ${user.email}:`, deleteError.message)
    } else {
      console.log(`  Deleted: ${user.email}`)
    }
  }

  console.log("\nDone!")
}

cleanUsers()