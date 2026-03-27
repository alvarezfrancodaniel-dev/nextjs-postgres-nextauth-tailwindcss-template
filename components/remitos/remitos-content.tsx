'use client'

import { useState, useRef } from 'react'
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
import { Plus, Search, FileText, Eye, Trash2, Printer, X } from 'lucide-react'

interface Remito {
  id: string
  remito_number: number
  client_id: string | null
  doc_type: string
  description: string | null
  items: RemitoItem[]
  total: number
  notes: string | null
  created_at: string
  clients: {
    name: string
    cuit: string | null
    address: string | null
    vehicle_brand: string | null
    vehicle_model: string | null
    license_plate: string | null
  } | null
}

interface SimpleClient {
  id: string
  name: string
  cuit: string | null
  address: string | null
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

interface RemitoItem {
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
}

interface RemitosContentProps {
  remitos: Remito[]
  clients: SimpleClient[]
  products: SimpleProduct[]
}

const docTypeLabels: Record<string, string> = {
  remito: 'Remito',
  presupuesto: 'Presupuesto',
}

const docTypeColors: Record<string, string> = {
  remito: 'bg-primary text-primary-foreground',
  presupuesto: 'bg-warning text-warning-foreground',
}

const emptyForm = {
  client_id: '',
  doc_type: 'remito' as string,
  description: '',
  notes: '',
  total: 0,
}

export function RemitosContent({ remitos, clients, products }: RemitosContentProps) {
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [docTypeFilter, setDocTypeFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [viewingRemito, setViewingRemito] = useState<Remito | null>(null)
  const [deletingRemito, setDeletingRemito] = useState<Remito | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [items, setItems] = useState<RemitoItem[]>([])

  const filtered = remitos.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch =
      r.remito_number.toString().includes(q) ||
      (r.clients?.name?.toLowerCase() || '').includes(q) ||
      (r.description?.toLowerCase() || '').includes(q)
    const matchDocType = docTypeFilter === 'all' || r.doc_type === docTypeFilter
    return matchSearch && matchDocType
  })

  const openCreate = () => {
    setForm(emptyForm)
    setItems([])
    setDialogOpen(true)
  }

  const openDetail = (remito: Remito) => {
    setViewingRemito(remito)
    setDetailDialogOpen(true)
  }

  const openDelete = (remito: Remito) => {
    setDeletingRemito(remito)
    setDeleteDialogOpen(true)
  }

  const addItem = () => {
    setItems([...items, { product_id: null, description: '', quantity: 1, unit_price: 0 }])
  }

  const updateItem = (index: number, field: string, value: string | number | null) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    if (field === 'product_id' && value) {
      const product = products.find((p) => p.id === value)
      if (product) {
        newItems[index].unit_price = product.sale_price
        newItems[index].description = `${product.name}${product.brand ? ` - ${product.brand}` : ''}${product.size ? ` (${product.size})` : ''}`
      }
    }

    setItems(newItems)
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
    if (!form.client_id) {
      toast.error('El cliente es obligatorio')
      return
    }
    if (items.length === 0) {
      toast.error('Agrega al menos un item al remito')
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
      doc_type: form.doc_type,
      description: form.description || null,
      items: items.map((item) => ({
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      total: form.total,
      notes: form.notes || null,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('remitos').insert(payload)
    if (error) {
      toast.error('Error al crear: ' + error.message)
    } else {
      toast.success('Remito creado')
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

  const handlePrint = () => {
    if (!viewingRemito) return

    const win = window.open('', '_blank')
    if (!win) return

    const docLabel = docTypeLabels[viewingRemito.doc_type] || viewingRemito.doc_type
    const client = viewingRemito.clients

    const itemsHtml = viewingRemito.items && viewingRemito.items.length > 0
      ? `<table>
          <thead>
            <tr>
              <th>Descripcion</th>
              <th style="text-align:center">Cant.</th>
              <th style="text-align:right">P. Unit.</th>
              <th style="text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${viewingRemito.items.map((item: RemitoItem) => `
              <tr>
                <td>${item.description}</td>
                <td style="text-align:center">${item.quantity}</td>
                <td style="text-align:right">${formatCurrency(item.unit_price)}</td>
                <td style="text-align:right">${formatCurrency(item.quantity * item.unit_price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`
      : ''

    win.document.write(`
      <html>
        <head>
          <title>${docLabel} #${viewingRemito.remito_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #111; background: #fff; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #111; padding-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; color: #111; }
            .header p { margin: 4px 0; color: #555; font-size: 14px; }
            .info { margin-bottom: 24px; font-size: 14px; color: #111; }
            .info p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; font-size: 14px; color: #111; }
            th { background: #f5f5f5; font-weight: 600; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 10px; color: #111; }
            .notes { margin-top: 20px; font-size: 13px; color: #555; border-top: 1px solid #ccc; padding-top: 10px; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; }
            .signature { border-top: 1px solid #111; width: 200px; text-align: center; padding-top: 8px; font-size: 13px; color: #111; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Farah Servicios - ${docLabel}</h1>
            <p>${docLabel} N.${viewingRemito.remito_number.toString().padStart(4, '0')} | Fecha: ${formatDate(viewingRemito.created_at)}</p>
          </div>
          <div class="info">
            <p><strong>Cliente:</strong> ${client?.name || '-'}</p>
            ${client?.cuit ? `<p><strong>CUIT:</strong> ${client.cuit}</p>` : ''}
            ${client?.address ? `<p><strong>Direccion:</strong> ${client.address}</p>` : ''}
            ${viewingRemito.description ? `<p><strong>Descripcion:</strong> ${viewingRemito.description}</p>` : ''}
          </div>
          ${itemsHtml}
          <div class="total">Total: ${formatCurrency(viewingRemito.total)}</div>
          ${viewingRemito.notes ? `<div class="notes"><strong>Notas:</strong> ${viewingRemito.notes}</div>` : ''}
          <div class="footer">
            <div class="signature">Firma Emisor</div>
            <div class="signature">Firma Receptor</div>
          </div>
          <script>window.onload = function() { window.print(); }<\/script>
        </body>
      </html>
    `)
    win.document.close()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">Remitos y Presupuestos</h1>
          <p className="text-muted-foreground">Genera y gestiona remitos y presupuestos</p>
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
              Remitos ({filtered.length})
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={docTypeFilter} onValueChange={setDocTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="remito">Remito</SelectItem>
                  <SelectItem value="presupuesto">Presupuesto</SelectItem>
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
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No se encontraron remitos</p>
              <p className="text-sm text-muted-foreground/70">Crea un nuevo remito para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Descripcion</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((remito) => (
                    <TableRow key={remito.id}>
                      <TableCell className="font-medium text-foreground">
                        {remito.remito_number.toString().padStart(4, '0')}
                      </TableCell>
                      <TableCell>
                        <Badge className={docTypeColors[remito.doc_type] || 'bg-muted text-muted-foreground'}>
                          {docTypeLabels[remito.doc_type] || remito.doc_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {remito.clients?.name || 'Sin cliente'}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-48 truncate">
                        {remito.description || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        {formatCurrency(remito.total)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(remito.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openDetail(remito)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDelete(remito)}>
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

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Documento</DialogTitle>
            <DialogDescription>
              Completa los datos del remito o presupuesto
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="doc_type">Tipo de Documento *</Label>
                <Select value={form.doc_type} onValueChange={(v) => setForm({ ...form, doc_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remito">Remito</SelectItem>
                    <SelectItem value="presupuesto">Presupuesto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client_id">Cliente *</Label>
                <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}{c.cuit ? ` (${c.cuit})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descripcion general del remito..."
                rows={2}
              />
            </div>

            {/* Items */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Items del Remito
                </p>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-1 h-3 w-3" />
                  Agregar Item
                </Button>
              </div>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Agrega items al remito
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map((item, index) => (
                    <div key={index} className="rounded-md border p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Item {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeItem(index)}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs">Producto</Label>
                        <Select
                          value={item.product_id || ''}
                          onValueChange={(v) => updateItem(index, 'product_id', v)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Seleccionar producto..." />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}{p.brand ? ` - ${p.brand}` : ''}{p.size ? ` (${p.size})` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs">Descripcion</Label>
                        <Input
                          className="h-9"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Detalle del item"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-1">
                          <Label className="text-xs">Cantidad</Label>
                          <Input
                            className="h-9"
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs">Precio Unitario</Label>
                          <Input
                            className="h-9"
                            type="number"
                            min={0}
                            step={0.01}
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-right text-sm font-medium text-foreground pt-2 border-t">
                    Total: {formatCurrency(form.total)}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Observaciones adicionales..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Crear Remito'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{docTypeLabels[viewingRemito?.doc_type || 'remito']} #{viewingRemito?.remito_number.toString().padStart(4, '0')}</span>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </DialogTitle>
          </DialogHeader>
          {viewingRemito && (
            <>
              {/* Print-only hidden content with inline styles for light background */}
              <div ref={printRef} style={{ display: 'none' }}>
                <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '2px solid #111', paddingBottom: '16px' }}>
                  <h1 style={{ margin: 0, fontSize: '22px', color: '#111' }}>
                    {'Farah Servicios - '}{docTypeLabels[viewingRemito.doc_type] || viewingRemito.doc_type}
                  </h1>
                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#555' }}>
                    {docTypeLabels[viewingRemito.doc_type] || viewingRemito.doc_type}{' N.'}{viewingRemito.remito_number.toString().padStart(4, '0')}{' | Fecha: '}{formatDate(viewingRemito.created_at)}
                  </p>
                </div>
                <div style={{ marginBottom: '16px', fontSize: '14px', color: '#111' }}>
                  <p style={{ margin: '4px 0' }}><strong>Cliente:</strong> {viewingRemito.clients?.name || '-'}</p>
                  {viewingRemito.clients?.cuit && <p style={{ margin: '4px 0' }}><strong>CUIT:</strong> {viewingRemito.clients.cuit}</p>}
                  {viewingRemito.clients?.address && <p style={{ margin: '4px 0' }}><strong>Direccion:</strong> {viewingRemito.clients.address}</p>}
                  {viewingRemito.description && <p style={{ margin: '4px 0' }}><strong>Descripcion:</strong> {viewingRemito.description}</p>}
                </div>
                {viewingRemito.items && viewingRemito.items.length > 0 && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', background: '#f5f5f5', color: '#111' }}>Descripcion</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', background: '#f5f5f5', color: '#111' }}>Cant.</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', background: '#f5f5f5', color: '#111' }}>P. Unit.</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', background: '#f5f5f5', color: '#111' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingRemito.items.map((item: RemitoItem, idx: number) => (
                        <tr key={idx}>
                          <td style={{ border: '1px solid #ccc', padding: '8px', color: '#111' }}>{item.description}</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', color: '#111' }}>{item.quantity}</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', color: '#111' }}>{formatCurrency(item.unit_price)}</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', color: '#111', fontWeight: 600 }}>{formatCurrency(item.quantity * item.unit_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div style={{ textAlign: 'right', fontSize: '18px', fontWeight: 'bold', color: '#111', marginTop: '8px' }}>
                  Total: {formatCurrency(viewingRemito.total)}
                </div>
                {viewingRemito.notes && (
                  <div style={{ marginTop: '16px', fontSize: '13px', color: '#555', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                    <strong>Notas:</strong> {viewingRemito.notes}
                  </div>
                )}
              </div>
              {/* Visible detail view in dialog */}
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium text-foreground">{viewingRemito.clients?.name || '-'}</span>
                </div>
                {viewingRemito.clients?.cuit && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">CUIT:</span>
                    <span className="text-foreground">{viewingRemito.clients.cuit}</span>
                  </div>
                )}
                {viewingRemito.clients?.address && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Direccion:</span>
                    <span className="text-foreground">{viewingRemito.clients.address}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <Badge className={docTypeColors[viewingRemito.doc_type] || 'bg-muted text-muted-foreground'}>
                    {docTypeLabels[viewingRemito.doc_type] || viewingRemito.doc_type}
                  </Badge>
                </div>
                {viewingRemito.description && (
                  <div>
                    <span className="text-muted-foreground">Descripcion:</span>
                    <p className="text-foreground mt-1">{viewingRemito.description}</p>
                  </div>
                )}
                {viewingRemito.items && viewingRemito.items.length > 0 && (
                  <div className="border-t pt-3">
                    <span className="text-muted-foreground font-medium">Items:</span>
                    <div className="mt-2 flex flex-col gap-1 bg-muted/50 p-3 rounded-md">
                      {viewingRemito.items.map((item: RemitoItem, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">
                            {item.quantity}x {item.description}
                          </span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(item.quantity * item.unit_price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-medium text-foreground">Total:</span>
                  <span className="text-lg font-bold text-foreground">{formatCurrency(viewingRemito.total)}</span>
                </div>
                {viewingRemito.notes && (
                  <div>
                    <span className="text-muted-foreground">Notas:</span>
                    <p className="text-foreground mt-1">{viewingRemito.notes}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Remito</DialogTitle>
            <DialogDescription>
              {'Estas seguro de que queres eliminar el remito #'}
              {deletingRemito?.remito_number.toString().padStart(4, '0')}
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
