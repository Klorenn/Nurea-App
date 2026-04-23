import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * DELETE /api/account/delete
 * El usuario autenticado borra su propia cuenta.
 * - Borra de public.profiles (cascade dispara limpieza de tablas ligadas)
 * - Llama a supabase.auth.admin.deleteUser si hay service role disponible
 * - Si no hay service role, al menos marca el profile como deleted y cierra sesión
 */
export async function DELETE() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    // 1. Borrar el profile (cascade se encarga del resto según 02_rls)
    const { error: profileErr } = await supabase.from("profiles").delete().eq("id", user.id)

    if (profileErr) {
      return NextResponse.json(
        { success: false, error: profileErr.message },
        { status: 500 }
      )
    }

    // 2. Si hay SERVICE_ROLE_KEY en el servidor, borrar también en auth.users
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (serviceRole && url) {
      try {
        const { createClient: adminClient } = await import("@supabase/supabase-js")
        const admin = adminClient(url, serviceRole, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
        await admin.auth.admin.deleteUser(user.id)
      } catch (e) {
        console.error("[account/delete] auth.admin.deleteUser falló:", e)
      }
    }

    // 3. Cerrar sesión del usuario actual
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error interno"
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
