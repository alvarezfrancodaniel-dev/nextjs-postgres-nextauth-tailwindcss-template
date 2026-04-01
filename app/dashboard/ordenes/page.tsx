import { createClient } from '@/lib/supabase/server'
import { OrdersContent } from '@/components/orders/orders-content'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const supabase = await createClient()

  // Fetch clients first for manual join
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, vehicle_brand, vehicle_model, license_plate')
    .order('name')

  // Fetch orders without embedded relation (foreign key may not exist)
  const { data: ordersRaw } = await supabase
    .from('service_orders')
    .select('*')
    .order('created_at', { ascending: false })

  // Manual join to attach client data
  const clientsMap = new Map((clients ?? []).map(c => [c.id, c]))
  const orders = (ordersRaw ?? []).map(o => ({
    ...o,
    clients: o.client_id ? clientsMap.get(o.client_id) ?? null : null
  }))

  return (
    <OrdersContent
      orders={orders}
      clients={clients ?? []}
    />
  )
}
