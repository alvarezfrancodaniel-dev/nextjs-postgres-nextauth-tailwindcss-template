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
import { getClientes } from '@/lib/db';
import { Users2, Phone, Mail, MapPin } from 'lucide-react';
import { AgregarCliente } from './agregar-cliente';

export const dynamic = 'force-dynamic';

export default async function ClientesPage(
  props: {
    searchParams: Promise<{ q?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const clientesList = await getClientes(search);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Clientes
          </h1>
          <p className="text-muted-foreground">
            Gestiona la informacion de tus clientes
          </p>
        </div>
        <AgregarCliente />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                {clientesList.length} cliente{clientesList.length !== 1 ? 's' : ''} registrado{clientesList.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {clientesList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No se encontraron clientes
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      Telefono
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </div>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Direccion
                    </div>
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Fecha de Registro
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesList.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">
                      {cliente.nombre}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {cliente.telefono ?? '-'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {cliente.email ?? '-'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {cliente.direccion ?? '-'}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground text-sm">
                      {cliente.createdAt?.toLocaleDateString('es-AR')}
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
