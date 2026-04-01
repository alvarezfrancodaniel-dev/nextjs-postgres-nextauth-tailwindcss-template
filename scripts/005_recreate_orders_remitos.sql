-- Script para recrear las tablas de ordenes de servicio y remitos
-- IMPORTANTE: Ejecutar este script en el SQL Editor de Supabase

-- 1. Eliminar tablas existentes (si existen)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS service_orders CASCADE;
DROP TABLE IF EXISTS remitos CASCADE;

-- 2. Crear tabla de ordenes de servicio
CREATE TABLE service_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  order_number SERIAL,
  service_type TEXT NOT NULL DEFAULT 'otro',
  status TEXT NOT NULL DEFAULT 'pendiente',
  description TEXT,
  total DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crear tabla de items de ordenes
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crear tabla de remitos
CREATE TABLE remitos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  remito_number SERIAL,
  doc_type TEXT NOT NULL DEFAULT 'remito',
  description TEXT,
  items JSONB DEFAULT '[]',
  total DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Crear indices para mejor rendimiento
CREATE INDEX idx_service_orders_user_id ON service_orders(user_id);
CREATE INDEX idx_service_orders_client_id ON service_orders(client_id);
CREATE INDEX idx_service_orders_status ON service_orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_remitos_user_id ON remitos(user_id);
CREATE INDEX idx_remitos_client_id ON remitos(client_id);

-- 6. Habilitar RLS
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE remitos ENABLE ROW LEVEL SECURITY;

-- 7. Crear politicas de acceso
CREATE POLICY "Users can manage their own orders" ON service_orders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage items of their orders" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM service_orders 
      WHERE service_orders.id = order_items.order_id 
      AND service_orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own remitos" ON remitos
  FOR ALL USING (auth.uid() = user_id);

-- 8. Verificar que las tablas se crearon correctamente
SELECT 'Tablas creadas exitosamente' as mensaje;
