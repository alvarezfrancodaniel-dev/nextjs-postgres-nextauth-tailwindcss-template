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
import { getInventario, getCubiertas } from '@/lib/db';
import { Package, CircleDot, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export default async function InventarioPage(
  props: {
    searchParams: Promise<{ q?: string; tab?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const tab = searchParams.tab ?? 'cubiertas';

  const [inventarioList, cubiertasList] = await Promise.all([
    getInventario(search),
    getCubiertas(search)
  ]);

  const totalCubiertas = cubiertasList.reduce((sum, c) => sum + c.cantidad, 0);
  const totalGeneral = inventarioList.reduce((sum, i) => sum + i.cantidad, 0);
  const bajosStock = [
    ...cubiertasList.filter((c) => c.cantidad <= c.stockMinimo),
    ...inventarioList.filter((i) => i.cantidad <= i.stockMinimo)
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Inventario
        </h1>
        <p className="text-muted-foreground">
          Gestion del stock de cubiertas y materiales
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cubiertas
            </CardTitle>
            <CircleDot className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCubiertas}</div>
            <p className="text-xs text-muted-foreground">unidades en stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Materiales
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGeneral}</div>
            <p className="text-xs text-muted-foreground">items generales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock Bajo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {bajosStock.length}
            </div>
            <p className="text-xs text-muted-foreground">items por reponer</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={tab}>
        <TabsList>
          <TabsTrigger value="cubiertas">Cubiertas</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        {/* Cubiertas Tab */}
        <TabsContent value="cubiertas">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CircleDot className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Cubiertas</CardTitle>
                  <CardDescription>
                    {cubiertasList.length} modelo{cubiertasList.length !== 1 ? 's' : ''} en inventario
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {cubiertasList.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No se encontraron cubiertas
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Marca</TableHead>
                      <TableHead>Medida</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Modelo
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Tipo
                      </TableHead>
                      <TableHead>Cant.</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        P. Compra
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        P. Venta
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Estado
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cubiertasList.map((cubierta) => (
                      <TableRow key={cubierta.id}>
                        <TableCell className="font-medium">
                          {cubierta.marca}
                        </TableCell>
                        <TableCell>{cubierta.medida}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {cubierta.modelo ?? '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className="capitalize">
                            {cubierta.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {cubierta.cantidad}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {formatCurrency(Number(cubierta.precioCompra))}
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-medium">
                          {formatCurrency(Number(cubierta.precioVenta))}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {cubierta.cantidad <= cubierta.stockMinimo ? (
                            <Badge variant="destructive">Bajo</Badge>
                          ) : (
                            <Badge variant="secondary">OK</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Inventory Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Inventario General</CardTitle>
                  <CardDescription>
                    {inventarioList.length} producto{inventarioList.length !== 1 ? 's' : ''} en stock
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {inventarioList.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No se encontraron productos
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Cant.</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        P. Unitario
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Estado
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventarioList.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.nombre}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.categoria}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.cantidad}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {formatCurrency(Number(item.precioUnitario))}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {item.cantidad <= item.stockMinimo ? (
                            <Badge variant="destructive">Bajo</Badge>
                          ) : (
                            <Badge variant="secondary">OK</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
