import { createClient } from '@/lib/supabase/server'
import { RemitosContent } from '@/components/remitos/remitos-content'

export const dynamic = 'force-dynamic'

export default async function RemitosPage() {
  const supabase = await createClient()

  const { data: remitos } = await supabase
    .from('remitos')
    .select('*, clients(name, cuit, address, vehicle_brand, vehicle_model, license_plate)')
    .order('created_at', { ascending: false })

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, cuit, address, vehicle_brand, vehicle_model, license_plate')
    .order('name')

  const { data: products } = await supabase
    .from('products')
    .select('id, name, brand, size, sale_price, stock')
    .gt('stock', 0)
    .order('name')

  return (
    <RemitosContent
      remitos={remitos ?? []}
      clients={clients ?? []}
      products={products ?? []}
    />
  )
}
