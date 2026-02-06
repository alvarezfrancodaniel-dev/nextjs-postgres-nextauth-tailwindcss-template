import Link from 'next/link';
import {
  Home,
  PanelLeft,
  Settings,
  Users2,
  ClipboardList,
  CheckCircle2,
  Package,
  DollarSign,
  CircleDot
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Analytics } from '@vercel/analytics/react';
import { User } from './user';
import Providers from './providers';
import { NavItem } from './nav-item';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <DesktopNav />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <MobileNav />
            <div className="flex-1" />
            <User />
          </header>
          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
            {children}
          </main>
        </div>
        <Analytics />
      </main>
    </Providers>
  );
}

function DesktopNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground text-lg font-semibold md:h-8 md:w-8 md:text-base"
        >
          <CircleDot className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Gomeria</span>
        </Link>

        <NavItem href="/" label="Inicio">
          <Home className="h-5 w-5" />
        </NavItem>

        <NavItem href="/clientes" label="Clientes">
          <Users2 className="h-5 w-5" />
        </NavItem>

        <NavItem href="/pedidos" label="Pedidos">
          <ClipboardList className="h-5 w-5" />
        </NavItem>

        <NavItem href="/realizados" label="Realizados">
          <CheckCircle2 className="h-5 w-5" />
        </NavItem>

        <NavItem href="/inventario" label="Inventario">
          <Package className="h-5 w-5" />
        </NavItem>

        <NavItem href="/finanzas" label="Finanzas">
          <DollarSign className="h-5 w-5" />
        </NavItem>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Configuracion</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Configuracion</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground text-lg font-semibold md:text-base"
          >
            <CircleDot className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Gomeria</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-5 w-5" />
            Inicio
          </Link>
          <Link
            href="/clientes"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Users2 className="h-5 w-5" />
            Clientes
          </Link>
          <Link
            href="/pedidos"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <ClipboardList className="h-5 w-5" />
            Pedidos
          </Link>
          <Link
            href="/realizados"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <CheckCircle2 className="h-5 w-5" />
            Realizados
          </Link>
          <Link
            href="/inventario"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Package className="h-5 w-5" />
            Inventario
          </Link>
          <Link
            href="/finanzas"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <DollarSign className="h-5 w-5" />
            Finanzas
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
