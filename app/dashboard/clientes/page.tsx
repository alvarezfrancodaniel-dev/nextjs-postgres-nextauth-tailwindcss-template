import { createClient } from '@/lib/supabase/server'
import { ClientsContent } from '@/components/clients/clients-content'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  return <ClientsContent clients={clients ?? []} />
}
