import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Users2,
  ClipboardList,
  CheckCircle2,
  CircleDot,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Package
} from 'lucide-react';
import { getDashboardStats, getPedidos } from '@/lib/db';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const pedidosRecientes = await getPedidos('');

  const ultimos5 = pedidosRecientes.slice(-5).reverse();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Panel de Control
        </h1>
        <p className="text-muted-foreground">
          Resumen general de tu gomeria
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/clientes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clientes
              </CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clientes}</div>
              <p className="text-xs text-muted-foreground">registrados</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pedidos">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pedidos Activos
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pedidosPendientes}
              </div>
              <p className="text-xs text-muted-foreground">
                pendientes o en progreso
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/realizados">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Realizados
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.realizados}</div>
              <p className="text-xs text-muted-foreground">
                trabajos completados
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inventario">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cubiertas en Stock
              </CardTitle>
              <CircleDot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.cubiertasEnStock}
              </div>
              <p className="text-xs text-muted-foreground">unidades disponibles</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Finance Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/finanzas?tab=por_cobrar">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Por Cobrar
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-primary">
                {formatCurrency(stats.finanzas.porCobrar)}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/finanzas?tab=deuda">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-destructive">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Deudas
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-destructive">
                {formatCurrency(stats.finanzas.deudas)}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/finanzas?tab=pagada">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4" style={{ borderLeftColor: 'hsl(var(--success))' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pagadas
              </CardTitle>
              <DollarSign className="h-4 w-4" style={{ color: 'hsl(var(--success))' }} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold" style={{ color: 'hsl(var(--success))' }}>
                {formatCurrency(stats.finanzas.pagadas)}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recientes</CardTitle>
          <CardDescription>
            Ultimos movimientos de tu gomeria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ultimos5.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No hay pedidos recientes
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {ultimos5.map((pedido) => (
                <div
                  key={pedido.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium leading-none">
                      {pedido.descripcion}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pedido.clienteNombre ?? 'Sin cliente'} -{' '}
                      {pedido.fechaPedido?.toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      {formatCurrency(Number(pedido.total))}
                    </span>
                    <EstadoBadge estado={pedido.estado} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pendiente: { label: 'Pendiente', variant: 'outline' },
    en_progreso: { label: 'En Progreso', variant: 'default' },
    realizado: { label: 'Realizado', variant: 'secondary' },
    cancelado: { label: 'Cancelado', variant: 'destructive' }
  };
  const c = config[estado] ?? { label: estado, variant: 'outline' as const };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
