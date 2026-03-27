'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CircleDot,
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  Tags,
  FileText,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'

const navItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Inventario',
    url: '/dashboard/inventario',
    icon: Package,
  },
  {
    title: 'Clientes',
    url: '/dashboard/clientes',
    icon: Users,
  },
  {
    title: 'Ordenes de Servicio',
    url: '/dashboard/ordenes',
    icon: ClipboardList,
  },
  {
    title: 'Remitos',
    url: '/dashboard/remitos',
    icon: FileText,
  },
  {
    title: 'Categorias',
    url: '/dashboard/categorias',
    icon: Tags,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <CircleDot className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Farah Servicios</span>
                  <span className="text-xs text-sidebar-foreground/60">Sistema de Gestion</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.url === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(item.url)
                    }
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
