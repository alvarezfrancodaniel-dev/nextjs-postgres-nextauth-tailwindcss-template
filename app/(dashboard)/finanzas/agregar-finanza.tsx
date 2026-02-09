'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { agregarFinanza } from '../actions';

type Cliente = { id: number; nombre: string };

export function AgregarFinanza({ clientes }: { clientes: Cliente[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estado, setEstado] = useState('por_cobrar');
  const [clienteId, setClienteId] = useState('');

  async function handleSubmit(formData: FormData) {
    formData.set('estado', estado);
    formData.set('clienteId', clienteId);
    setLoading(true);
    setError('');
    const result = await agregarFinanza(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
      setEstado('por_cobrar');
      setClienteId('');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nuevo Registro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Registro Financiero</DialogTitle>
          <DialogDescription>
            Registra un nuevo movimiento financiero.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Cliente</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="descripcion">Descripcion *</Label>
            <Input id="descripcion" name="descripcion" placeholder="Detalle del movimiento" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="monto">Monto ($) *</Label>
              <Input id="monto" name="monto" type="number" step="0.01" min="0.01" placeholder="0.00" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Estado</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="por_cobrar">Por Cobrar</SelectItem>
                  <SelectItem value="deuda">Deuda</SelectItem>
                  <SelectItem value="pagada">Pagada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
            <Input id="fechaVencimiento" name="fechaVencimiento" type="date" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
