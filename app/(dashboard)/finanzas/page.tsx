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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFinanzas, getFinanzasResumen } from '@/lib/db';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

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
    por_cobrar: { label: 'Por Cobrar', variant: 'default' },
    deuda: { label: 'Deuda', variant: 'destructive' },
    pagada: { label: 'Pagada', variant: 'secondary' }
  };
  const c = config[estado] ?? { label: estado, variant: 'outline' as const };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export default async function FinanzasPage(
  props: {
    searchParams: Promise<{ tab?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const tab = searchParams.tab ?? 'todas';

  const [resumen, porCobrar, deudas, pagadas, todas] = await Promise.all([
    getFinanzasResumen(),
    getFinanzas('por_cobrar'),
    getFinanzas('deuda'),
    getFinanzas('pagada'),
    getFinanzas()
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Finanzas
        </h1>
        <p className="text-muted-foreground">
          Control de cobros, deudas y pagos
        </p>
      </div>

      {/* Finance Summary */}
      <div className="grid gap-4 grid-cols-3">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Por Cobrar
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">
              {formatCurrency(resumen.porCobrar)}
            </div>
            <p className="text-xs text-muted-foreground">
              {porCobrar.length} registro{porCobrar.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Deudas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-destructive">
              {formatCurrency(resumen.deudas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {deudas.length} registro{deudas.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4" style={{ borderLeftColor: 'hsl(var(--success))' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagadas
            </CardTitle>
            <CheckCircle2 className="h-4 w-4" style={{ color: 'hsl(var(--success))' }} />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold" style={{ color: 'hsl(var(--success))' }}>
              {formatCurrency(resumen.pagadas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {pagadas.length} registro{pagadas.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for each category */}
      <Tabs defaultValue={tab}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="por_cobrar">Por Cobrar</TabsTrigger>
          <TabsTrigger value="deuda">Deudas</TabsTrigger>
          <TabsTrigger value="pagada">Pagadas</TabsTrigger>
        </TabsList>

        <TabsContent value="todas">
          <FinanzaTable items={todas} title="Todos los Registros" />
        </TabsContent>

        <TabsContent value="por_cobrar">
          <FinanzaTable items={porCobrar} title="Por Cobrar" />
        </TabsContent>

        <TabsContent value="deuda">
          <FinanzaTable items={deudas} title="Deudas" />
        </TabsContent>

        <TabsContent value="pagada">
          <FinanzaTable items={pagadas} title="Pagadas" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type FinanzaItem = {
  id: number;
  pedidoId: number | null;
  clienteId: number | null;
  descripcion: string;
  monto: string;
  estado: 'por_cobrar' | 'deuda' | 'pagada';
  fechaVencimiento: Date | null;
  fechaPago: Date | null;
  createdAt: Date | null;
  clienteNombre: string | null;
};

function FinanzaTable({
  items,
  title
}: {
  items: FinanzaItem[];
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {items.length} registro{items.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No hay registros
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Descripcion
                </TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">
                  Vencimiento
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  Fecha Pago
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.clienteNombre ?? 'Sin cliente'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell max-w-[200px] truncate text-muted-foreground">
                    {item.descripcion}
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(Number(item.monto))}
                  </TableCell>
                  <TableCell>
                    <EstadoBadge estado={item.estado} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {item.fechaVencimiento?.toLocaleDateString('es-AR') ?? '-'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                    {item.fechaPago?.toLocaleDateString('es-AR') ?? '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
