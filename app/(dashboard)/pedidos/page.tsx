import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getPedidos } from '@/lib/db';
import { ClipboardList, Clock, Wrench } from 'lucide-react';

export const dynamic = 'force-dynamic';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function EstadoBadge({ estado }: { estado: string }) {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pendiente: { label: 'Pendiente', variant: 'outline' },
    en_progreso: { label: 'En Progreso', variant: 'default' },
    cancelado: { label: 'Cancelado', variant: 'destructive' }
  };
  const c = config[estado] ?? { label: estado, variant: 'outline' as const };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export default async function PedidosPage(
  props: {
    searchParams: Promise<{ q?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';

  // Get only pendiente and en_progreso orders
  const pendientes = await getPedidos(search, 'pendiente');
  const enProgreso = await getPedidos(search, 'en_progreso');
  const pedidosList = [...pendientes, ...enProgreso];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Pedidos
        </h1>
        <p className="text-muted-foreground">
          Pedidos pendientes y en progreso
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendientes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Progreso
            </CardTitle>
            <Wrench className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {enProgreso.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Todos los Pedidos Activos</CardTitle>
              <CardDescription>
                {pedidosList.length} pedido{pedidosList.length !== 1 ? 's' : ''} activo{pedidosList.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pedidosList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No hay pedidos activos
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N&deg;</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Descripcion
                  </TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden md:table-cell">Total</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidosList.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">#{pedido.id}</TableCell>
                    <TableCell>
                      {pedido.clienteNombre ?? 'Sin cliente'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell max-w-[200px] truncate">
                      {pedido.descripcion}
                    </TableCell>
                    <TableCell>
                      <EstadoBadge estado={pedido.estado} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-medium">
                      {formatCurrency(Number(pedido.total))}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {pedido.fechaPedido?.toLocaleDateString('es-AR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
