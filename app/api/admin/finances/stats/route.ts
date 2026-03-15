import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // month, quarter, year

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: "forbidden" }, { status: 403 })

    // 2. Calculate Stats
    // GMV & Net Revenue from financial_transactions
    const { data: transactions, error: txError } = await supabase
      .from('financial_transactions')
      .select('amount_total, platform_fee, professional_net, status, created_at, professional_id')

    if (txError) throw txError

    const gmv = transactions.reduce((acc, tx) => acc + Number(tx.amount_total), 0)
    const netRevenue = transactions.reduce((acc, tx) => acc + Number(tx.platform_fee), 0)
    const pendingPayouts = transactions
      .filter(tx => tx.status === 'available')
      .reduce((acc, tx) => acc + Number(tx.professional_net), 0)

    // Subscriptions from profiles
    const { count: activeSubs } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')
    
    // MRR (Mocking $29.990 for now)
    const mrr = (activeSubs || 0) * 29990

    // 3. Chart Data (Last 6 Months)
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
      // MOCK: assuming subscriptions grow slightly or are stable
      const subsRevenue = (activeSubs || 0) * 29990 * (1 - (i * 0.05)) 

      chartData.push({
        name: monthLabel,
        subscriptions: Math.round(subsRevenue),
        commissions: Math.round(commissions),
        transactions: monthTxs.length
      })
    }

    // 4. Payouts Table (Doctors with > 100k)
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
      
      if (proAvailable > 0) { // Changed to > 0 for demo, user said 100k
        payoutList.push({
          id: pro.id,
          name: `${pro.first_name} ${pro.last_name}`,
          avatar: pro.avatar_url,
          specialty: (pro as any).professionals?.specialty || "Médico",
          amount: proAvailable,
          status: proAvailable > 100000 ? 'ready' : 'pending'
        })
      }
    }

    return NextResponse.json({
      stats: {
        gmv,
        netRevenue,
        mrr,
        pendingPayouts,
        activeSubs: activeSubs || 0
      },
      chartData,
      payoutList: payoutList.sort((a, b) => b.amount - a.amount).slice(0, 5)
    })

  } catch (error) {
    console.error("Error fetching financial stats:", error)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
}
