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
import { getPedidos, getClientes } from '@/lib/db';
import { CheckCircle2 } from 'lucide-react';
import { AgregarRealizado } from './agregar-realizado';

export const dynamic = 'force-dynamic';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export default async function RealizadosPage(
  props: {
    searchParams: Promise<{ q?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const [realizadosList, clientesList] = await Promise.all([
    getPedidos(search, 'realizado'),
    getClientes('')
  ]);

  const totalFacturado = realizadosList.reduce(
    (sum, p) => sum + Number(p.total),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Realizados
          </h1>
          <p className="text-muted-foreground">
            Trabajos completados
          </p>
        </div>
        <AgregarRealizado clientes={clientesList.map(c => ({ id: c.id, nombre: c.nombre }))} />
      </div>

      <div className="grid gap-4 grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completados
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realizadosList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Facturado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'hsl(var(--success))' }}>
              {formatCurrency(totalFacturado)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" style={{ color: 'hsl(var(--success))' }} />
            <div>
              <CardTitle>Trabajos Realizados</CardTitle>
              <CardDescription>
                {realizadosList.length} trabajo{realizadosList.length !== 1 ? 's' : ''} completado{realizadosList.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {realizadosList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No hay trabajos realizados
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
                  <TableHead className="hidden md:table-cell">Total</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Fecha Pedido
                  </TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {realizadosList.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">#{pedido.id}</TableCell>
                    <TableCell>
                      {pedido.clienteNombre ?? 'Sin cliente'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell max-w-[200px] truncate">
                      {pedido.descripcion}
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-medium">
                      {formatCurrency(Number(pedido.total))}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {pedido.fechaPedido?.toLocaleDateString('es-AR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Realizado</Badge>
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
