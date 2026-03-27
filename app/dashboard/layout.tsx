import { createClient } from '@/lib/supabase/server'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null
  let profile = null

  try {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    user = userData.user

    if (!user) {
      redirect('/auth/login')
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    profile = profileData
  } catch (e) {
    // If it's a redirect, rethrow it
    if (e && typeof e === 'object' && 'digest' in e) throw e
    redirect('/auth/login')
  }

  return (
    <SidebarProvider>
      <AppSidebar
        userEmail={user.email}
        userName={profile?.full_name || user.email}
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium text-muted-foreground">GomeriaPro</span>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
