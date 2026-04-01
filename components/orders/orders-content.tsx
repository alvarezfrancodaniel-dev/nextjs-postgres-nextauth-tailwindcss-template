'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus, Search, Pencil, Trash2, ClipboardList } from 'lucide-react'

interface Client {
  id: string
  name: string
  vehicle_brand: string | null
  vehicle_model: string | null
  license_plate: string | null
}

interface Order {
  id: string
  order_number: number
  client_id: string | null
  service_type: string
  status: string
  description: string | null
  total: number
  created_at: string
  clients: Client | null
}

interface OrdersContentProps {
  orders: Order[]
  clients: Client[]
}

const serviceTypes = [
  { value: 'reparacion', label: 'Reparacion' },
  { value: 'alineacion', label: 'Alineacion' },
  { value: 'balanceo', label: 'Balanceo' },
  { value: 'cambio_cubiertas', label: 'Cambio de Cubiertas' },
  { value: 'lavado', label: 'Lavado' },
  { value: 'otro', label: 'Otro' },
]

const statusOptions = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'completado', label: 'Completado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const statusColors: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  completado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
}

const emptyForm = {
  client_id: '',
  service_type: 'otro',
  status: 'pendiente',
  description: '',
  total: '',
}

export function OrdersContent({ orders, clients }: OrdersContentProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase()
    return (
      (o.order_number?.toString() || '').includes(q) ||
      (o.clients?.name?.toLowerCase() || '').includes(q) ||
      (o.clients?.license_plate?.toLowerCase() || '').includes(q) ||
      (o.service_type?.toLowerCase() || '').includes(q)
    )
  })

  const openCreate = () => {
    setEditingOrder(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (order: Order) => {
    setEditingOrder(order)
    setForm({
      client_id: order.client_id || '',
      service_type: order.service_type,
      status: order.status,
      description: order.description || '',
      total: order.total?.toString() || '',
    })
    setDialogOpen(true)
  }

  const openDelete = (order: Order) => {
    setDeletingOrder(order)
    setDeleteDialogOpen(true)
  }

  const handleSave = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('No autenticado')
      setIsLoading(false)
      return
    }

    const payload = {
      user_id: user.id,
      client_id: form.client_id || null,
      service_type: form.service_type,
      status: form.status,
      description: form.description || null,
      total: parseFloat(form.total) || 0,
      updated_at: new Date().toISOString(),
    }

    if (editingOrder) {
      const { error } = await supabase
        .from('service_orders')
        .update(payload)
        .eq('id', editingOrder.id)
      if (error) {
        toast.error('Error al actualizar: ' + error.message)
      } else {
        toast.success('Orden actualizada')
      }
    } else {
      const { error } = await supabase.from('service_orders').insert(payload)
      if (error) {
        toast.error('Error al crear: ' + error.message)
      } else {
        toast.success('Orden creada')
      }
    }

    setIsLoading(false)
    setDialogOpen(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deletingOrder) return
    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('service_orders')
      .delete()
      .eq('id', deletingOrder.id)

    if (error) {
      toast.error('Error al eliminar: ' + error.message)
    } else {
      toast.success('Orden eliminada')
    }

    setIsLoading(false)
    setDeleteDialogOpen(false)
    router.refresh()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ordenes de Servicio</h1>
          <p className="text-muted-foreground">Gestion de trabajos y servicios</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Orden
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Ordenes ({filtered.length})
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por numero, cliente..."
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
              <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No se encontraron ordenes</p>
              <p className="text-sm text-muted-foreground/70">Crea una orden para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.order_number ?? '-'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell>
                        {order.clients ? (
                          <div>
                            <div className="font-medium text-foreground">{order.clients.name}</div>
                            {order.clients.license_plate && (
                              <div className="text-xs text-muted-foreground">
                                {order.clients.license_plate}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin cliente</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {serviceTypes.find((s) => s.value === order.service_type)?.label || order.service_type}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status] || ''}>
                          {statusOptions.find((s) => s.value === order.status)?.label || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(order.total || 0).toLocaleString('es-AR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(order)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDelete(order)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingOrder ? 'Editar Orden' : 'Nueva Orden'}</DialogTitle>
            <DialogDescription>
              {editingOrder ? 'Modifica los datos de la orden' : 'Completa los datos de la nueva orden'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Cliente</Label>
              <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.license_plate ? `- ${client.license_plate}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo de Servicio</Label>
                <Select value={form.service_type} onValueChange={(v) => setForm({ ...form, service_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Descripcion</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detalles del trabajo..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Total ($)</Label>
              <Input
                type="number"
                value={form.total}
                onChange={(e) => setForm({ ...form, total: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Guardando...' : editingOrder ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Orden</DialogTitle>
            <DialogDescription>
              {'Estas seguro de eliminar la orden #'}
              {deletingOrder?.order_number}
              {'? Esta accion no se puede deshacer.'}
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
