'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Search, Pencil, Trash2, Users, Car } from 'lucide-react'

interface Client {
  id: string
  name: string
  cuit: string | null
  email: string | null
  address: string | null
  vehicle_brand: string | null
  vehicle_model: string | null
  vehicle_year: string | null
  license_plate: string | null
  notes: string | null
  created_at: string
}

interface ClientsContentProps {
  clients: Client[]
}

const emptyClient = {
  name: '',
  cuit: '',
  email: '',
  address: '',
  vehicle_brand: '',
  vehicle_model: '',
  vehicle_year: '',
  license_plate: '',
  notes: '',
}

export function ClientsContent({ clients }: ClientsContentProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [form, setForm] = useState(emptyClient)

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.cuit?.toLowerCase() || '').includes(q) ||
      (c.license_plate?.toLowerCase() || '').includes(q) ||
      (c.vehicle_brand?.toLowerCase() || '').includes(q)
    )
  })

  const openCreate = () => {
    setEditingClient(null)
    setForm(emptyClient)
    setDialogOpen(true)
  }

  const openEdit = (client: Client) => {
    setEditingClient(client)
    setForm({
      name: client.name,
      cuit: client.cuit || '',
      email: client.email || '',
      address: client.address || '',
      vehicle_brand: client.vehicle_brand || '',
      vehicle_model: client.vehicle_model || '',
      vehicle_year: client.vehicle_year || '',
      license_plate: client.license_plate || '',
      notes: client.notes || '',
    })
    setDialogOpen(true)
  }

  const openDelete = (client: Client) => {
    setDeletingClient(client)
    setDeleteDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('No autenticado')
      setIsLoading(false)
      return
    }

    const payload = {
      name: form.name,
      cuit: form.cuit || null,
      email: form.email || null,
      address: form.address || null,
      vehicle_brand: form.vehicle_brand || null,
      vehicle_model: form.vehicle_model || null,
      vehicle_year: form.vehicle_year || null,
      license_plate: form.license_plate || null,
      notes: form.notes || null,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    }

    if (editingClient) {
      const { error } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', editingClient.id)
      if (error) {
        toast.error('Error al actualizar: ' + error.message)
      } else {
        toast.success('Cliente actualizado')
      }
    } else {
      const { error } = await supabase.from('clients').insert(payload)
      if (error) {
        toast.error('Error al crear: ' + error.message)
      } else {
        toast.success('Cliente creado')
      }
    }

    setIsLoading(false)
    setDialogOpen(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deletingClient) return
    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', deletingClient.id)

    if (error) {
      toast.error('Error al eliminar: ' + error.message)
    } else {
      toast.success('Cliente eliminado')
    }

    setIsLoading(false)
    setDeleteDialogOpen(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">Clientes</h1>
          <p className="text-muted-foreground">Gestion de clientes y vehiculos</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes ({filtered.length})
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, CUIT, patente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No se encontraron clientes</p>
              <p className="text-sm text-muted-foreground/70">Agrega un cliente para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>CUIT</TableHead>
                    <TableHead>Vehiculo</TableHead>
                    <TableHead>Patente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium text-foreground">{client.name}</TableCell>
                      <TableCell className="text-muted-foreground">{client.cuit || '-'}</TableCell>
                      <TableCell>
                        {client.vehicle_brand || client.vehicle_model ? (
                          <div className="flex items-center gap-1.5">
                            <Car className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {[client.vehicle_brand, client.vehicle_model, client.vehicle_year]
                                .filter(Boolean)
                                .join(' ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {client.license_plate ? (
                          <Badge variant="outline">{client.license_plate}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{client.email || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(client)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDelete(client)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
            <DialogDescription>
              {editingClient ? 'Modifica los datos del cliente' : 'Completa los datos del nuevo cliente'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Juan Perez"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cuit">CUIT</Label>
                <Input
                  id="cuit"
                  value={form.cuit}
                  onChange={(e) => setForm({ ...form, cuit: e.target.value })}
                  placeholder="Ej: 20-12345678-9"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Ej: juan@email.com"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Direccion</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Ej: Av. Corrientes 1234"
              />
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Car className="h-4 w-4" />
                Datos del Vehiculo
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="vehicle_brand">Marca</Label>
                  <Input
                    id="vehicle_brand"
                    value={form.vehicle_brand}
                    onChange={(e) => setForm({ ...form, vehicle_brand: e.target.value })}
                    placeholder="Ej: Ford"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vehicle_model">Modelo</Label>
                  <Input
                    id="vehicle_model"
                    value={form.vehicle_model}
                    onChange={(e) => setForm({ ...form, vehicle_model: e.target.value })}
                    placeholder="Ej: Focus"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="vehicle_year">Ano</Label>
                  <Input
                    id="vehicle_year"
                    value={form.vehicle_year}
                    onChange={(e) => setForm({ ...form, vehicle_year: e.target.value })}
                    placeholder="Ej: 2022"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="license_plate">Patente</Label>
                  <Input
                    id="license_plate"
                    value={form.license_plate}
                    onChange={(e) => setForm({ ...form, license_plate: e.target.value })}
                    placeholder="Ej: AB123CD"
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Guardando...' : editingClient ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Cliente</DialogTitle>
            <DialogDescription>
              {'Estas seguro de que queres eliminar a "'}
              {deletingClient?.name}
              {'"? Esta accion no se puede deshacer.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
