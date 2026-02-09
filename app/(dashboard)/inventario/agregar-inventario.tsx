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
import { agregarInventario } from '../actions';

export function AgregarInventario() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoria, setCategoria] = useState('general');

  async function handleSubmit(formData: FormData) {
    formData.set('categoria', categoria);
    setLoading(true);
    setError('');
    const result = await agregarInventario(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
      setCategoria('general');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Agregar Material
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Material</DialogTitle>
          <DialogDescription>
            Agrega un nuevo producto al inventario general.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input id="nombre" name="nombre" placeholder="Ej: Valvulas de goma" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="accesorios">Accesorios</SelectItem>
                  <SelectItem value="reparacion">Reparacion</SelectItem>
                  <SelectItem value="balanceo">Balanceo</SelectItem>
                  <SelectItem value="herramientas">Herramientas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input id="cantidad" name="cantidad" type="number" min="0" defaultValue="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="precioUnitario">Precio Unitario ($)</Label>
              <Input id="precioUnitario" name="precioUnitario" type="number" step="0.01" min="0" placeholder="0.00" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="stockMinimo">Stock Minimo</Label>
              <Input id="stockMinimo" name="stockMinimo" type="number" min="0" defaultValue="5" />
            </div>
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
