import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
  serial
} from 'drizzle-orm/pg-core';
import { count, eq, ilike, or, sql } from 'drizzle-orm';

export const db = drizzle(neon(process.env.POSTGRES_URL!));

// Enums
export const estadoPedidoEnum = pgEnum('estado_pedido', [
  'pendiente',
  'en_progreso',
  'realizado',
  'cancelado'
]);

export const estadoFinanzaEnum = pgEnum('estado_finanza', [
  'por_cobrar',
  'deuda',
  'pagada'
]);

// Clientes
export const clientes = pgTable('clientes', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  telefono: text('telefono'),
  email: text('email'),
  direccion: text('direccion'),
  notas: text('notas'),
  createdAt: timestamp('created_at').defaultNow()
});

export type SelectCliente = typeof clientes.$inferSelect;

// Inventario
export const inventario = pgTable('inventario', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  categoria: text('categoria').notNull().default('general'),
  cantidad: integer('cantidad').notNull().default(0),
  precioUnitario: numeric('precio_unitario', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  stockMinimo: integer('stock_minimo').notNull().default(5),
  createdAt: timestamp('created_at').defaultNow()
});

export type SelectInventario = typeof inventario.$inferSelect;

// Cubiertas
export const cubiertas = pgTable('cubiertas', {
  id: serial('id').primaryKey(),
  marca: text('marca').notNull(),
  medida: text('medida').notNull(),
  modelo: text('modelo'),
  tipo: text('tipo').default('radial'),
  cantidad: integer('cantidad').notNull().default(0),
  precioCompra: numeric('precio_compra', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  precioVenta: numeric('precio_venta', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  stockMinimo: integer('stock_minimo').notNull().default(2),
  createdAt: timestamp('created_at').defaultNow()
});

export type SelectCubierta = typeof cubiertas.$inferSelect;

// Pedidos
export const pedidos = pgTable('pedidos', {
  id: serial('id').primaryKey(),
  clienteId: integer('cliente_id'),
  descripcion: text('descripcion').notNull(),
  estado: estadoPedidoEnum('estado').notNull().default('pendiente'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull().default('0'),
  notas: text('notas'),
  fechaPedido: timestamp('fecha_pedido').defaultNow(),
  fechaCompletado: timestamp('fecha_completado')
});

export type SelectPedido = typeof pedidos.$inferSelect;

// Finanzas
export const finanzas = pgTable('finanzas', {
  id: serial('id').primaryKey(),
  pedidoId: integer('pedido_id'),
  clienteId: integer('cliente_id'),
  descripcion: text('descripcion').notNull(),
  monto: numeric('monto', { precision: 10, scale: 2 }).notNull(),
  estado: estadoFinanzaEnum('estado').notNull().default('por_cobrar'),
  fechaVencimiento: timestamp('fecha_vencimiento'),
  fechaPago: timestamp('fecha_pago'),
  createdAt: timestamp('created_at').defaultNow()
});

export type SelectFinanza = typeof finanzas.$inferSelect;

// ---- Query functions ----

// Clientes
export async function getClientes(search: string) {
  if (search) {
    return db
      .select()
      .from(clientes)
      .where(
        or(
          ilike(clientes.nombre, `%${search}%`),
          ilike(clientes.telefono, `%${search}%`),
          ilike(clientes.email, `%${search}%`)
        )
      )
      .orderBy(clientes.nombre);
  }
  return db.select().from(clientes).orderBy(clientes.nombre);
}

export async function getClienteById(id: number) {
  const results = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, id));
  return results[0] ?? null;
}

// Inventario
export async function getInventario(search: string) {
  if (search) {
    return db
      .select()
      .from(inventario)
      .where(
        or(
          ilike(inventario.nombre, `%${search}%`),
          ilike(inventario.categoria, `%${search}%`)
        )
      )
      .orderBy(inventario.nombre);
  }
  return db.select().from(inventario).orderBy(inventario.nombre);
}

// Cubiertas
export async function getCubiertas(search: string) {
  if (search) {
    return db
      .select()
      .from(cubiertas)
      .where(
        or(
          ilike(cubiertas.marca, `%${search}%`),
          ilike(cubiertas.medida, `%${search}%`),
          ilike(cubiertas.modelo, `%${search}%`)
        )
      )
      .orderBy(cubiertas.marca);
  }
  return db.select().from(cubiertas).orderBy(cubiertas.marca);
}

// Pedidos
export async function getPedidos(
  search: string,
  estado?: 'pendiente' | 'en_progreso' | 'realizado' | 'cancelado'
) {
  const baseQuery = db
    .select({
      id: pedidos.id,
      clienteId: pedidos.clienteId,
      descripcion: pedidos.descripcion,
      estado: pedidos.estado,
      total: pedidos.total,
      notas: pedidos.notas,
      fechaPedido: pedidos.fechaPedido,
      fechaCompletado: pedidos.fechaCompletado,
      clienteNombre: clientes.nombre
    })
    .from(pedidos)
    .leftJoin(clientes, eq(pedidos.clienteId, clientes.id));

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(pedidos.descripcion, `%${search}%`),
        ilike(clientes.nombre, `%${search}%`)
      )
    );
  }

  if (estado) {
    conditions.push(eq(pedidos.estado, estado));
  }

  if (conditions.length > 0) {
    return baseQuery
      .where(conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`)
      .orderBy(pedidos.fechaPedido);
  }

  return baseQuery.orderBy(pedidos.fechaPedido);
}

// Finanzas
export async function getFinanzas(
  estado?: 'por_cobrar' | 'deuda' | 'pagada'
) {
  const baseQuery = db
    .select({
      id: finanzas.id,
      pedidoId: finanzas.pedidoId,
      clienteId: finanzas.clienteId,
      descripcion: finanzas.descripcion,
      monto: finanzas.monto,
      estado: finanzas.estado,
      fechaVencimiento: finanzas.fechaVencimiento,
      fechaPago: finanzas.fechaPago,
      createdAt: finanzas.createdAt,
      clienteNombre: clientes.nombre
    })
    .from(finanzas)
    .leftJoin(clientes, eq(finanzas.clienteId, clientes.id));

  if (estado) {
    return baseQuery
      .where(eq(finanzas.estado, estado))
      .orderBy(finanzas.createdAt);
  }

  return baseQuery.orderBy(finanzas.createdAt);
}

export async function getFinanzasResumen() {
  const porCobrar = await db
    .select({ total: sql<string>`COALESCE(SUM(monto), 0)` })
    .from(finanzas)
    .where(eq(finanzas.estado, 'por_cobrar'));

  const deudas = await db
    .select({ total: sql<string>`COALESCE(SUM(monto), 0)` })
    .from(finanzas)
    .where(eq(finanzas.estado, 'deuda'));

  const pagadas = await db
    .select({ total: sql<string>`COALESCE(SUM(monto), 0)` })
    .from(finanzas)
    .where(eq(finanzas.estado, 'pagada'));

  return {
    porCobrar: Number(porCobrar[0].total),
    deudas: Number(deudas[0].total),
    pagadas: Number(pagadas[0].total)
  };
}

// Dashboard stats
export async function getDashboardStats() {
  const totalClientes = await db.select({ count: count() }).from(clientes);
  const totalPedidosPendientes = await db
    .select({ count: count() })
    .from(pedidos)
    .where(
      or(eq(pedidos.estado, 'pendiente'), eq(pedidos.estado, 'en_progreso'))
    );
  const totalRealizados = await db
    .select({ count: count() })
    .from(pedidos)
    .where(eq(pedidos.estado, 'realizado'));
  const totalCubiertas = await db
    .select({ total: sql<string>`COALESCE(SUM(cantidad), 0)` })
    .from(cubiertas);
  const resumenFinanzas = await getFinanzasResumen();

  return {
    clientes: totalClientes[0].count,
    pedidosPendientes: totalPedidosPendientes[0].count,
    realizados: totalRealizados[0].count,
    cubiertasEnStock: Number(totalCubiertas[0].total),
    finanzas: resumenFinanzas
  };
}
