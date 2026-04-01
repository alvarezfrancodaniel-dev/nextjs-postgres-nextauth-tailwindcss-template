-- Script para recrear las tablas service_orders y remitos con las foreign keys correctas
-- ADVERTENCIA: Esto eliminará todos los datos existentes en estas tablas

-- Primero eliminamos las tablas dependientes
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS service_orders CASCADE;
DROP TABLE IF EXISTS remitos CASCADE;

-- Recrear tabla service_orders con foreign key correcta
CREATE TABLE service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  description TEXT,
  items JSONB DEFAULT '[]',
  total DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recrear tabla order_items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recrear tabla remitos con foreign key correcta
CREATE TABLE remitos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remito_number SERIAL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  doc_type TEXT DEFAULT 'remito' CHECK (doc_type IN ('remito', 'presupuesto')),
  description TEXT,
  items JSONB DEFAULT '[]',
  total DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  is_presupuesto BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE remitos ENABLE ROW LEVEL SECURITY;

-- Políticas para service_orders
CREATE POLICY "Allow authenticated users to read service_orders"
  ON service_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert service_orders"
  ON service_orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update service_orders"
  ON service_orders FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete service_orders"
  ON service_orders FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para order_items
CREATE POLICY "Allow authenticated users to read order_items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert order_items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update order_items"
  ON order_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete order_items"
  ON order_items FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para remitos
CREATE POLICY "Allow authenticated users to read remitos"
  ON remitos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert remitos"
  ON remitos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update remitos"
  ON remitos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete remitos"
  ON remitos FOR DELETE
  TO authenticated
  USING (true);

-- Crear índices para mejorar performance
CREATE INDEX idx_service_orders_client_id ON service_orders(client_id);
CREATE INDEX idx_service_orders_status ON service_orders(status);
CREATE INDEX idx_service_orders_created_at ON service_orders(created_at DESC);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE INDEX idx_remitos_client_id ON remitos(client_id);
CREATE INDEX idx_remitos_doc_type ON remitos(doc_type);
CREATE INDEX idx_remitos_created_at ON remitos(created_at DESC);
