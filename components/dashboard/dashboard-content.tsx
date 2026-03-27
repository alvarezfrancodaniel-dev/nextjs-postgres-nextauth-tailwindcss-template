'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Package, ClipboardList, CheckCircle, AlertTriangle } from 'lucide-react'

interface DashboardContentProps {
  clientCount: number
  productCount: number
  pendingOrderCount: number
  completedTodayCount: number
  recentOrders: Array<{
    id: string
    order_number: number
    service_type: string
    status: string
    total: number
    created_at: string
    clients: { name: string } | null
  }>
  lowStockProducts: Array<{
    id: string
    name: string
    brand: string
    size: string
    stock: number
    min_stock: number
  }>
}

const serviceTypeLabels: Record<string, string> = {
  reparacion: 'Reparacion',
  alineacion: 'Alineacion',
  balanceo: 'Balanceo',
  lavado: 'Lavado',
  venta: 'Venta',
  otro: 'Otro',
}

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

export function DashboardContent({
  clientCount,
  productCount,
  pendingOrderCount,
  completedTodayCount,
  recentOrders,
  lowStockProducts,
}: DashboardContentProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">Panel de Control</h1>
        <p className="text-muted-foreground">Resumen general del negocio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{clientCount}</div>
            <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{productCount}</div>
            <p className="text-xs text-muted-foreground">En inventario</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pendingOrderCount}</div>
            <p className="text-xs text-muted-foreground">Ordenes por completar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completados Hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{completedTodayCount}</div>
            <p className="text-xs text-muted-foreground">Servicios finalizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders + Low Stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ordenes Recientes</CardTitle>
            <CardDescription>Ultimas 5 ordenes de servicio</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No hay ordenes registradas</p>
            ) : (
              <div className="flex flex-col gap-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">#{order.order_number}</span>
                        <Badge variant="outline" className="text-xs">
                          {serviceTypeLabels[order.service_type] || order.service_type}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {order.clients?.name || 'Sin cliente'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ${Number(order.total).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Stock Bajo
            </CardTitle>
            <CardDescription>Productos con stock por debajo del minimo</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Todo el stock esta en orden</p>
            ) : (
              <div className="flex flex-col gap-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-foreground">{product.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {product.brand} - {product.size}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="destructive">{product.stock} uds</Badge>
                      <span className="text-xs text-muted-foreground">
                        Min: {product.min_stock}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
