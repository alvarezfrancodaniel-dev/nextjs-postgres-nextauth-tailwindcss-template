-- Script para agregar columna items a service_orders
-- Ejecutar en el SQL Editor de Supabase

-- Agregar columna items de tipo JSONB a service_orders si no existe
ALTER TABLE service_orders 
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]';

-- Verificar
SELECT 'Columna items agregada a service_orders' as mensaje;
