import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default async function DashboardPage() {
  let supabase
  try {
    supabase = await createClient()
  } catch {
    const { redirect } = await import('next/navigation')
    redirect('/auth/login')
  }

  const [
    { count: clientCount },
    { count: productCount },
    { data: orders },
    { data: allProducts },
    { count: pendingCount },
    { count: completedTodayCount },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase
      .from('service_orders')
      .select('*, clients(name)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('products')
      .select('*')
      .order('stock', { ascending: true })
      .limit(20),
    supabase
      .from('service_orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendiente'),
    supabase
      .from('service_orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completado')
      .gte('updated_at', new Date().toISOString().split('T')[0]),
  ])

  // Filter low stock products client-side for column comparison
  const lowStockProducts = (allProducts ?? [])
    .filter((p) => p.stock <= p.min_stock)
    .slice(0, 5)

  return (
    <DashboardContent
      clientCount={clientCount ?? 0}
      productCount={productCount ?? 0}
      pendingOrderCount={pendingCount ?? 0}
      completedTodayCount={completedTodayCount ?? 0}
      recentOrders={orders ?? []}
      lowStockProducts={lowStockProducts}
    />
  )
}
