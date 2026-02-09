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
import { agregarCubierta } from '../actions';

export function AgregarCubierta() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tipo, setTipo] = useState('radial');

  async function handleSubmit(formData: FormData) {
    formData.set('tipo', tipo);
    setLoading(true);
    setError('');
    const result = await agregarCubierta(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
      setTipo('radial');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Agregar Cubierta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Cubierta</DialogTitle>
          <DialogDescription>
            Agrega una nueva cubierta al inventario.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input id="marca" name="marca" placeholder="Ej: Pirelli" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="medida">Medida *</Label>
              <Input id="medida" name="medida" placeholder="Ej: 195/65 R15" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input id="modelo" name="modelo" placeholder="Ej: Cinturato P1" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="radial">Radial</SelectItem>
                  <SelectItem value="convencional">Convencional</SelectItem>
                  <SelectItem value="run_flat">Run Flat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input id="cantidad" name="cantidad" type="number" min="0" defaultValue="0" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="precioCompra">P. Compra ($)</Label>
              <Input id="precioCompra" name="precioCompra" type="number" step="0.01" min="0" placeholder="0.00" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="precioVenta">P. Venta ($)</Label>
              <Input id="precioVenta" name="precioVenta" type="number" step="0.01" min="0" placeholder="0.00" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="stockMinimo">Stock Minimo</Label>
            <Input id="stockMinimo" name="stockMinimo" type="number" min="0" defaultValue="2" />
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
