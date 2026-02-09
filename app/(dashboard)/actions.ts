'use server';

import { db, clientes, cubiertas, inventario, pedidos, finanzas } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// ---------- Clientes ----------
export async function agregarCliente(formData: FormData) {
  const nombre = formData.get('nombre') as string;
  const telefono = formData.get('telefono') as string;
  const email = formData.get('email') as string;
  const direccion = formData.get('direccion') as string;
  const notas = formData.get('notas') as string;

  if (!nombre || nombre.trim() === '') {
    return { error: 'El nombre es obligatorio' };
  }

  await db.insert(clientes).values({
    nombre: nombre.trim(),
    telefono: telefono?.trim() || null,
    email: email?.trim() || null,
    direccion: direccion?.trim() || null,
    notas: notas?.trim() || null,
  });

  revalidatePath('/clientes');
  revalidatePath('/');
  return { success: true };
}

// ---------- Pedidos ----------
export async function agregarPedido(formData: FormData) {
  const clienteId = formData.get('clienteId') as string;
  const descripcion = formData.get('descripcion') as string;
  const estado = formData.get('estado') as string;
  const total = formData.get('total') as string;
  const notas = formData.get('notas') as string;

  if (!descripcion || descripcion.trim() === '') {
    return { error: 'La descripcion es obligatoria' };
  }

  await db.insert(pedidos).values({
    clienteId: clienteId ? parseInt(clienteId) : null,
    descripcion: descripcion.trim(),
    estado: (estado as 'pendiente' | 'en_progreso' | 'realizado' | 'cancelado') || 'pendiente',
    total: total || '0',
    notas: notas?.trim() || null,
  });

  revalidatePath('/pedidos');
  revalidatePath('/realizados');
  revalidatePath('/');
  return { success: true };
}

// ---------- Cubiertas ----------
export async function agregarCubierta(formData: FormData) {
  const marca = formData.get('marca') as string;
  const medida = formData.get('medida') as string;
  const modelo = formData.get('modelo') as string;
  const tipo = formData.get('tipo') as string;
  const cantidad = formData.get('cantidad') as string;
  const precioCompra = formData.get('precioCompra') as string;
  const precioVenta = formData.get('precioVenta') as string;
  const stockMinimo = formData.get('stockMinimo') as string;

  if (!marca || marca.trim() === '') {
    return { error: 'La marca es obligatoria' };
  }
  if (!medida || medida.trim() === '') {
    return { error: 'La medida es obligatoria' };
  }

  await db.insert(cubiertas).values({
    marca: marca.trim(),
    medida: medida.trim(),
    modelo: modelo?.trim() || null,
    tipo: tipo?.trim() || 'radial',
    cantidad: cantidad ? parseInt(cantidad) : 0,
    precioCompra: precioCompra || '0',
    precioVenta: precioVenta || '0',
    stockMinimo: stockMinimo ? parseInt(stockMinimo) : 2,
  });

  revalidatePath('/inventario');
  revalidatePath('/');
  return { success: true };
}

// ---------- Inventario General ----------
export async function agregarInventario(formData: FormData) {
  const nombre = formData.get('nombre') as string;
  const categoria = formData.get('categoria') as string;
  const cantidad = formData.get('cantidad') as string;
  const precioUnitario = formData.get('precioUnitario') as string;
  const stockMinimo = formData.get('stockMinimo') as string;

  if (!nombre || nombre.trim() === '') {
    return { error: 'El nombre es obligatorio' };
  }

  await db.insert(inventario).values({
    nombre: nombre.trim(),
    categoria: categoria?.trim() || 'general',
    cantidad: cantidad ? parseInt(cantidad) : 0,
    precioUnitario: precioUnitario || '0',
    stockMinimo: stockMinimo ? parseInt(stockMinimo) : 5,
  });

  revalidatePath('/inventario');
  revalidatePath('/');
  return { success: true };
}

// ---------- Finanzas ----------
export async function agregarFinanza(formData: FormData) {
  const clienteId = formData.get('clienteId') as string;
  const descripcion = formData.get('descripcion') as string;
  const monto = formData.get('monto') as string;
  const estado = formData.get('estado') as string;
  const fechaVencimiento = formData.get('fechaVencimiento') as string;

  if (!descripcion || descripcion.trim() === '') {
    return { error: 'La descripcion es obligatoria' };
  }
  if (!monto || parseFloat(monto) <= 0) {
    return { error: 'El monto debe ser mayor a 0' };
  }

  await db.insert(finanzas).values({
    clienteId: clienteId ? parseInt(clienteId) : null,
    descripcion: descripcion.trim(),
    monto: monto,
    estado: (estado as 'por_cobrar' | 'deuda' | 'pagada') || 'por_cobrar',
    fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
  });

  revalidatePath('/finanzas');
  revalidatePath('/');
  return { success: true };
}
