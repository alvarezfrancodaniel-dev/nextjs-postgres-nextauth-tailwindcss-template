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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, ClipboardList, Eye, Pencil, Trash2 } from 'lucide-react'

interface Order {
  id: string
  order_number: number
  client_id: string | null
  service_type: string
  status: string
  description: string | null
  vehicle_info: string | null
  total: number
  notes: string | null
  created_at: string
  clients: {
    name: string
    vehicle_brand: string | null
    vehicle_model: string | null
    license_plate: string | null
  } | null
}

interface SimpleClient {
  id: string
  name: string
  vehicle_brand: string | null
  vehicle_model: string | null
  license_plate: string | null
}

interface SimpleProduct {
  id: string
  name: string
  brand: string | null
  size: string | null
  sale_price: number
  stock: number
}

interface OrderItem {
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
}

interface OrdersContentProps {
  orders: Order[]
  clients: SimpleClient[]
  products: SimpleProduct[]
}

const serviceTypes = [
  { value: 'reparacion', label: 'Reparacion de Cubiertas' },
  { value: 'alineacion', label: 'Alineacion' },
  { value: 'balanceo', label: 'Balanceo' },
  { value: 'lavado', label: 'Lavado de Auto' },
  { value: 'venta', label: 'Venta de Cubiertas' },
  { value: 'otro', label: 'Otro' },
]

const serviceTypeLabels: Record<string, string> = {
  reparacion: 'Reparacion',
  alineacion: 'Alineacion',
  balanceo: 'Balanceo',
  lavado: 'Lavado',
  venta: 'Venta',
  otro: 'Otro',
}

const statuses = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'completado', label: 'Completado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const statusLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

const statusColors: Record<string, string> = {
  pendiente: 'bg-warning text-warning-foreground',
  en_proceso: 'bg-primary text-primary-foreground',
  completado: 'bg-success text-success-foreground',
  cancelado: 'bg-destructive text-destructive-foreground',
}

const serviceTypeColors: Record<string, string> = {
  reparacion: 'bg-chart-1/15 text-chart-1 border-chart-1/30',
  alineacion: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
  balanceo: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  lavado: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  venta: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
  otro: 'bg-muted text-muted-foreground',
}

const emptyForm = {
  client_id: '',
  service_type: 'reparacion' as string,
  status: 'pendiente' as string,
  description: '',
  vehicle_info: '',
  total: 0,
  notes: '',
}

export function OrdersContent({ orders, clients, products }: OrdersContentProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [items, setItems] = useState<OrderItem[]>([])

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase()
    const matchSearch =
      o.order_number.toString().includes(q) ||
      (o.clients?.name?.toLowerCase() || '').includes(q) ||
      (o.description?.toLowerCase() || '').includes(q) ||
      (serviceTypeLabels[o.service_type]?.toLowerCase() || '').includes(q)
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const openCreate = () => {
    setEditingOrder(null)
    setForm(emptyForm)
    setItems([])
    setDialogOpen(true)
  }

  const openEdit = (order: Order) => {
    setEditingOrder(order)
    setForm({
      client_id: order.client_id || '',
      service_type: order.service_type,
      status: order.status,
      description: order.description || '',
      vehicle_info: order.vehicle_info || '',
      total: order.total,
      notes: order.notes || '',
    })
    setItems([])
    setDialogOpen(true)
  }

  const openDetail = (order: Order) => {
    setViewingOrder(order)
    setDetailDialogOpen(true)
  }

  const openDelete = (order: Order) => {
    setDeletingOrder(order)
    setDeleteDialogOpen(true)
  }

  const addItem = () => {
    setItems([...items, { product_id: null, description: '', quantity: 1, unit_price: 0 }])
  }

  const updateItem = (index: number, field: string, value: string | number | null) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Auto-fill price from product
    if (field === 'product_id' && value) {
      const product = products.find((p) => p.id === value)
      if (product) {
        newItems[index].unit_price = product.sale_price
        newItems[index].description = `${product.name}${product.brand ? ` - ${product.brand}` : ''}${product.size ? ` (${product.size})` : ''}`
      }
    }

    setItems(newItems)
    // Update total
    const total = newItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
    setForm((prev) => ({ ...prev, total }))
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    const total = newItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
    setForm((prev) => ({ ...prev, total }))
  }

  const handleSave = async () => {
    if (!form.service_type) {
      toast.error('El tipo de servicio es obligatorio')
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
      client_id: form.client_id || null,
      service_type: form.service_type,
      status: form.status,
      description: form.description || null,
      vehicle_info: form.vehicle_info || null,
      total: form.total,
      notes: form.notes || null,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    }

    if (editingOrder) {
      const { error } = await supabase
        .from('service_orders')
        .update(payload)
        .eq('id', editingOrder.id)
      if (error) {
        console.log('[v0] Error updating order:', error)
        toast.error('Error al actualizar: ' + error.message)
      } else {
        console.log('[v0] Order updated successfully')
        toast.success('Orden actualizada')
      }
    } else {
      console.log('[v0] Creating order with payload:', payload)
      const { data: newOrder, error } = await supabase
        .from('service_orders')
        .insert(payload)
        .select()
        .single()
      console.log('[v0] Create order result:', { newOrder, error })
      if (error) {
        toast.error('Error al crear: ' + error.message)
      } else {
        // Insert items
        if (items.length > 0 && newOrder) {
          const orderItems = items.map((item) => ({
            order_id: newOrder.id,
            product_id: item.product_id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.quantity * item.unit_price,
          }))
          await supabase.from('order_items').insert(orderItems)
        }
        toast.success('Orden creada')
      }
    }

    setIsLoading(false)
    setDialogOpen(false)
    console.log('[v0] Calling router.refresh()')
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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">Ordenes de Servicio</h1>
          <p className="text-muted-foreground">Gestiona reparaciones, alineacion, balanceo, lavado y ventas</p>
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No se encontraron ordenes</p>
              <p className="text-sm text-muted-foreground/70">Crea una nueva orden para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vehiculo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm font-medium text-foreground">
                        {order.order_number}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={serviceTypeColors[order.service_type]}>
                          {serviceTypeLabels[order.service_type] || order.service_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.clients?.name || 'Sin cliente'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {order.clients?.license_plate
                          ? `${order.clients.vehicle_brand || ''} ${order.clients.vehicle_model || ''} (${order.clients.license_plate})`
                          : order.vehicle_info || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        ${Number(order.total).toLocaleString('es-AR')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openDetail(order)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver detalle</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(order)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDelete(order)}>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOrder ? 'Editar Orden' : 'Nueva Orden de Servicio'}</DialogTitle>
            <DialogDescription>
              {editingOrder ? 'Modifica los datos de la orden' : 'Completa los datos del nuevo servicio'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo de Servicio *</Label>
                <Select
                  value={form.service_type}
                  onValueChange={(value) => setForm({ ...form, service_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Estado</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm({ ...form, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Cliente</Label>
              <Select
                value={form.client_id}
                onValueChange={(value) => {
                  const client = clients.find((c) => c.id === value)
                  setForm({
                    ...form,
                    client_id: value,
                    vehicle_info: client
                      ? `${client.vehicle_brand || ''} ${client.vehicle_model || ''} ${client.license_plate ? `(${client.license_plate})` : ''}`.trim()
                      : '',
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.license_plate ? `(${c.license_plate})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Info Vehiculo</Label>
              <Input
                value={form.vehicle_info}
                onChange={(e) => setForm({ ...form, vehicle_info: e.target.value })}
                placeholder="Se completa automaticamente al seleccionar cliente"
              />
            </div>
            <div className="grid gap-2">
              <Label>Descripcion del Trabajo</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detalle del servicio a realizar..."
                rows={3}
              />
            </div>

            {/* Items Section */}
            {!editingOrder && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base">Productos / Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="mr-1 h-3 w-3" />
                    Agregar Item
                  </Button>
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-end">
                    <div className="col-span-5">
                      <Select
                        value={item.product_id || ''}
                        onValueChange={(v) => updateItem(idx, 'product_id', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} {p.size ? `(${p.size})` : ''} - Stock: {p.stock}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                        placeholder="Cant"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))}
                        placeholder="Precio"
                      />
                    </div>
                    <div className="col-span-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(idx)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Total ($)</Label>
                <Input
                  type="number"
                  value={form.total}
                  onChange={(e) => setForm({ ...form, total: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Notas</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Guardando...' : editingOrder ? 'Actualizar' : 'Crear Orden'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Orden #{viewingOrder?.order_number}</DialogTitle>
            <DialogDescription>Detalle de la orden de servicio</DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <div className="grid gap-3 py-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Servicio</span>
                <Badge variant="outline" className={serviceTypeColors[viewingOrder.service_type]}>
                  {serviceTypeLabels[viewingOrder.service_type]}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Estado</span>
                <Badge className={statusColors[viewingOrder.status]}>
                  {statusLabels[viewingOrder.status]}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cliente</span>
                <span className="text-sm font-medium text-foreground">
                  {viewingOrder.clients?.name || 'Sin cliente'}
                </span>
              </div>
              {viewingOrder.vehicle_info && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Vehiculo</span>
                  <span className="text-sm text-foreground">{viewingOrder.vehicle_info}</span>
                </div>
              )}
              {viewingOrder.description && (
                <div className="border-t pt-3">
                  <span className="text-sm text-muted-foreground">Descripcion</span>
                  <p className="text-sm text-foreground mt-1">{viewingOrder.description}</p>
                </div>
              )}
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">
                  ${Number(viewingOrder.total).toLocaleString('es-AR')}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Creada: {formatDate(viewingOrder.created_at)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Orden</DialogTitle>
            <DialogDescription>
              {'Estas seguro de que queres eliminar la orden #'}
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
