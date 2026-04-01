import { createClient } from '@/lib/supabase/server'
import { OrdersContent } from '@/components/orders/orders-content'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('service_orders')
    .select('*, clients(name, vehicle_brand, vehicle_model, license_plate)')
    .order('created_at', { ascending: false })

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, vehicle_brand, vehicle_model, license_plate')
    .order('name')

  const { data: products } = await supabase
    .from('products')
    .select('id, name, brand, size, sale_price, stock')
    .order('name')

  return (
    <OrdersContent
      orders={orders ?? []}
      clients={clients ?? []}
      products={products ?? []}
    />
  )
}
