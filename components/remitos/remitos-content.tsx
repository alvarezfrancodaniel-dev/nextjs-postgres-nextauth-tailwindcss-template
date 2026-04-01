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
import { Plus, Search, Pencil, Trash2, FileText, X } from 'lucide-react'

interface Client {
  id: string
  name: string
  cuit: string | null
  address: string | null
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

interface RemitoItem {
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
}

interface Remito {
  id: string
  remito_number: number
  client_id: string | null
  doc_type: string
  description: string | null
  items: RemitoItem[]
  total: number
  created_at: string
  clients: Client | null
}

interface RemitosContentProps {
  remitos: Remito[]
  clients: Client[]
  products: Product[]
}

const docTypes = [
  { value: 'remito', label: 'Remito' },
  { value: 'presupuesto', label: 'Presupuesto' },
]

const emptyItem: RemitoItem = {
  product_id: null,
  description: '',
  quantity: 1,
  unit_price: 0,
}

const emptyForm = {
  client_id: '',
  doc_type: 'remito',
  description: '',
}

export function RemitosContent({ remitos, clients, products }: RemitosContentProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingRemito, setEditingRemito] = useState<Remito | null>(null)
  const [deletingRemito, setDeletingRemito] = useState<Remito | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [items, setItems] = useState<RemitoItem[]>([{ ...emptyItem }])

  const filtered = remitos.filter((r) => {
    const q = search.toLowerCase()
    return (
      r.remito_number?.toString().includes(q) ||
      (r.clients?.name?.toLowerCase() || '').includes(q) ||
      (r.clients?.cuit?.toLowerCase() || '').includes(q)
    )
  })

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  }

  const openCreate = () => {
    setEditingRemito(null)
    setForm(emptyForm)
    setItems([{ ...emptyItem }])
    setDialogOpen(true)
  }

  const openEdit = (remito: Remito) => {
    setEditingRemito(remito)
    setForm({
      client_id: remito.client_id || '',
      doc_type: remito.doc_type || 'remito',
      description: remito.description || '',
    })
    setItems(remito.items?.length > 0 ? remito.items : [{ ...emptyItem }])
    setDialogOpen(true)
  }

  const openDelete = (remito: Remito) => {
    setDeletingRemito(remito)
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

  const updateItem = (index: number, field: keyof RemitoItem, value: string | number | null) => {
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
    const validItems = items.filter((item) => item.description.trim() || item.product_id)
    if (validItems.length === 0) {
      toast.error('Agrega al menos un item')
      return
    }

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
      doc_type: form.doc_type,
      description: form.description || null,
      items: validItems,
      total: calculateTotal(),
      updated_at: new Date().toISOString(),
    }

    if (editingRemito) {
      const { error } = await supabase
        .from('remitos')
        .update(payload)
        .eq('id', editingRemito.id)
      if (error) {
        toast.error('Error al actualizar: ' + error.message)
      } else {
        toast.success('Remito actualizado')
      }
    } else {
      const { error } = await supabase.from('remitos').insert(payload)
      if (error) {
        toast.error('Error al crear: ' + error.message)
      } else {
        toast.success('Remito creado')
      }
    }

    setIsLoading(false)
    setDialogOpen(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deletingRemito) return
    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('remitos')
      .delete()
      .eq('id', deletingRemito.id)

    if (error) {
      toast.error('Error al eliminar: ' + error.message)
    } else {
      toast.success('Remito eliminado')
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
          <h1 className="text-2xl font-bold text-foreground">Remitos y Presupuestos</h1>
          <p className="text-muted-foreground">Gestion de documentos de venta</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Remito
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos ({filtered.length})
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
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No se encontraron documentos</p>
              <p className="text-sm text-muted-foreground/70">Crea un remito para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((remito) => (
                    <TableRow key={remito.id}>
                      <TableCell className="font-medium">#{remito.remito_number ?? '-'}</TableCell>
                      <TableCell>
                        <Badge variant={remito.doc_type === 'presupuesto' ? 'secondary' : 'default'}>
                          {docTypes.find((d) => d.value === remito.doc_type)?.label || remito.doc_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(remito.created_at)}
                      </TableCell>
                      <TableCell>
                        {remito.clients ? (
                          <div>
                            <div className="font-medium text-foreground">{remito.clients.name}</div>
                            {remito.clients.cuit && (
                              <div className="text-xs text-muted-foreground">{remito.clients.cuit}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin cliente</span>
                        )}
                      </TableCell>
                      <TableCell>{remito.items?.length || 0} items</TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(remito.total || 0).toLocaleString('es-AR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(remito)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDelete(remito)}>
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
            <DialogTitle>{editingRemito ? 'Editar Remito' : 'Nuevo Remito'}</DialogTitle>
            <DialogDescription>
              {editingRemito ? 'Modifica los datos del documento' : 'Completa los datos del nuevo documento'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo de Documento</Label>
                <Select value={form.doc_type} onValueChange={(v) => setForm({ ...form, doc_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {docTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Cliente</Label>
                <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} {client.cuit ? `(${client.cuit})` : ''}
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
                placeholder="Observaciones adicionales..."
                rows={2}
              />
            </div>

            {/* Items */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Items</Label>
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
              {isLoading ? 'Guardando...' : editingRemito ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Documento</DialogTitle>
            <DialogDescription>
              {'Estas seguro de eliminar el documento #'}
              {deletingRemito?.remito_number}
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
