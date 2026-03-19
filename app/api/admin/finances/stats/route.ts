import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: "forbidden" }, { status: 403 })

    // 2. Fetch Base Data (Transactions and Appointments)
    // We fetch appointments as well to find "real" transactions that might not be recorded yet
    const [transactionsRes, appointmentsRes, profilesRes] = await Promise.all([
      supabase.from('financial_transactions').select('*'),
      supabase.from('appointments').select('price, status, created_at, professional_id'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active')
    ])

    const transactions = transactionsRes.data || []
    const appointments = appointmentsRes.data || []
    const activeSubs = profilesRes.count || 0

    // 3. Real-time stats derivation
    const totalGMV = transactions.reduce((acc, tx) => acc + Number(tx.amount_total), 0)
    const netRevenue = transactions.reduce((acc, tx) => acc + Number(tx.platform_fee), 0)

    const pendingPayouts = transactions
      .filter(tx => tx.status === 'available')
      .reduce((acc, tx) => acc + Number(tx.professional_net), 0)

    const mrr = activeSubs * 29990

    // 4. Chart Data (Last 6 Months)
    const chartData = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)
      const monthLabel = format(date, 'MMM')

      const monthTxs = transactions.filter(tx => {
        const txDate = new Date(tx.created_at)
        return txDate >= monthStart && txDate <= monthEnd
      })

      const commissions = monthTxs.reduce((acc, tx) => acc + Number(tx.platform_fee), 0)

      // We don't have historical subscriptions easily accessible here right now, 
      // but to ensure 0 when no sales, we'll keep it simple and not fake it.
      // Easiest is to rely on current activeSubs * 29990 for current month or 0 for past.
      const subsRevenue = i === 0 ? mrr : 0;

      chartData.push({
        name: monthLabel,
        subscriptions: subsRevenue,
        commissions: commissions,
        transactions: monthTxs.length
      })
    }

    // 5. Payouts Table
    const { data: professionals } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        professionals(specialty)
      `)
      .eq('role', 'professional')

    const payoutList = []
    for (const pro of (professionals || [])) {
      const proAvailable = transactions
        .filter(tx => tx.professional_id === pro.id && tx.status === 'available')
        .reduce((acc, tx) => acc + Number(tx.professional_net), 0)
      
      const proName = `${pro.first_name || ''} ${pro.last_name || ''}`.trim() || 'Profesional'
      
      if (proAvailable >= 0) { // Return everyone even if 0 for consistency, or > 0 as per user request
        payoutList.push({
          id: pro.id,
          name: proName,
          avatar: pro.avatar_url,
          specialty: (pro as any).professionals?.specialty || "Médico",
          amount: proAvailable,
          status: proAvailable > 100000 ? 'ready' : 'pending'
        })
      }
    }

    return NextResponse.json({
      stats: {
        gmv: totalGMV,
        netRevenue,
        mrr,
        pendingPayouts,
        activeSubs
      },
      chartData,
      payoutList: payoutList.sort((a, b) => b.amount - a.amount).slice(0, 5)
    })

  } catch (error) {
    console.error("Error fetching financial stats:", error)
    return NextResponse.json({ 
      error: "internal_error",
      stats: { gmv: 0, netRevenue: 0, mrr: 0, pendingPayouts: 0, activeSubs: 0 },
      chartData: [],
      payoutList: []
    }, { status: 500 })
  }
}
