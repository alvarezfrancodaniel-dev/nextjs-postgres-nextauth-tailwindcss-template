import { createClient } from '@/lib/supabase/server'
import { CategoriesContent } from '@/components/categories/categories-content'

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })

  return <CategoriesContent categories={categories ?? []} />
}
