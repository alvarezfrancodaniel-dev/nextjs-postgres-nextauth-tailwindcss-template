import { createClient } from '@/lib/supabase/server'
import { RemitosContent } from '@/components/remitos/remitos-content'

export const dynamic = 'force-dynamic'

export default async function RemitosPage() {
  const supabase = await createClient()

  // Fetch clients first for manual join
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, cuit, address, vehicle_brand, vehicle_model, license_plate')
    .order('name')

  // Fetch remitos without embedded relation (foreign key may not exist)
  const { data: remitosRaw } = await supabase
    .from('remitos')
    .select('*')
    .order('created_at', { ascending: false })

  // Manual join to attach client data
  const clientsMap = new Map((clients ?? []).map(c => [c.id, c]))
  const remitos = (remitosRaw ?? []).map(r => ({
    ...r,
    clients: r.client_id ? clientsMap.get(r.client_id) ?? null : null
  }))

  const { data: products } = await supabase
    .from('products')
    .select('id, name, brand, size, sale_price, stock')
    .gt('stock', 0)
    .order('name')

  return (
    <RemitosContent
      remitos={remitos}
      clients={clients ?? []}
      products={products ?? []}
    />
  )
}
