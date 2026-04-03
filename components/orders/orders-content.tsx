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
import { Plus, Search, Pencil, Trash2, ClipboardList, X } from 'lucide-react'

interface Client {
  id: string
  name: string
  vehicle_brand: string | null
  vehicle_model: string | null
  license_plate: string | null
}

interface Product {
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

interface Order {
  id: string
  order_number: number
  client_id: string | null
  service_type: string
  status: string
  description: string | null
  items: OrderItem[]
  total: number
  created_at: string
  clients: Client | null
}

interface OrdersContentProps {
  orders: Order[]
  clients: Client[]
  products: Product[]
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

const emptyItem: OrderItem = {
  product_id: null,
  description: '',
  quantity: 1,
  unit_price: 0,
}

const emptyForm = {
  client_id: '',
  service_type: 'otro',
  status: 'pendiente',
  description: '',
}

export function OrdersContent({ orders, clients, products }: OrdersContentProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [items, setItems] = useState<OrderItem[]>([{ ...emptyItem }])

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase()
    return (
      (o.order_number?.toString() || '').includes(q) ||
      (o.clients?.name?.toLowerCase() || '').includes(q) ||
      (o.clients?.license_plate?.toLowerCase() || '').includes(q) ||
      (o.service_type?.toLowerCase() || '').includes(q)
    )
  })

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  }

  const openCreate = () => {
    setEditingOrder(null)
    setForm(emptyForm)
    setItems([{ ...emptyItem }])
    setDialogOpen(true)
  }

  const openEdit = (order: Order) => {
    setEditingOrder(order)
    setForm({
      client_id: order.client_id || '',
      service_type: order.service_type,
      status: order.status,
      description: order.description || '',
    })
    setItems(order.items?.length > 0 ? order.items : [{ ...emptyItem }])
    setDialogOpen(true)
  }

  const openDelete = (order: Order) => {
    setDeletingOrder(order)
    setDeleteDialogOpen(true)
  }

  const addItem = () => {
    setItems([...items, { ...emptyItem }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof OrderItem, value: string | number | null) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // If selecting a product, auto-fill description and price
    if (field === 'product_id' && value) {
      const product = products.find((p) => p.id === value)
      if (product) {
        newItems[index].description = `${product.name} ${product.brand || ''} ${product.size || ''}`.trim()
        newItems[index].unit_price = product.sale_price
      }
    }
    
    setItems(newItems)
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

    const validItems = items.filter((item) => item.description.trim() || item.product_id)

    const payload = {
      user_id: user.id,
      client_id: form.client_id || null,
      service_type: form.service_type,
      status: form.status,
      description: form.description || null,
      items: validItems,
      total: calculateTotal(),
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
                    <TableHead>Items</TableHead>
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
                      <TableCell>{order.items?.length || 0} items</TableCell>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <Label>Descripcion / Notas</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detalles del trabajo..."
                rows={2}
              />
            </div>

            {/* Items */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Items / Productos</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Label className="text-xs text-muted-foreground">Producto</Label>
                      <Select
                        value={item.product_id || ''}
                        onValueChange={(v) => updateItem(index, 'product_id', v || null)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ${product.sale_price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Label className="text-xs text-muted-foreground">Descripcion</Label>
                      <Input
                        className="h-9"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Descripcion..."
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">Cantidad</Label>
                      <Input
                        className="h-9"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">Precio Unit.</Label>
                      <Input
                        className="h-9"
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4 pt-4 border-t">
                <div className="text-lg font-semibold">
                  Total: ${calculateTotal().toLocaleString('es-AR')}
                </div>
              </div>
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
