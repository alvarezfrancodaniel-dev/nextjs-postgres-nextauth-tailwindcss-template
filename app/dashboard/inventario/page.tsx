import { createClient } from '@/lib/supabase/server'
import { InventoryContent } from '@/components/inventory/inventory-content'

export default async function InventoryPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <InventoryContent
      products={products ?? []}
      categories={categories ?? []}
    />
  )
}
