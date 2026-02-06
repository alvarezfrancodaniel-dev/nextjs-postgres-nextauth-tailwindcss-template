-- Drop existing tables/types if they exist
DROP TABLE IF EXISTS finanzas CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS cubiertas CASCADE;
DROP TABLE IF EXISTS inventario CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TYPE IF EXISTS status CASCADE;
DROP TYPE IF EXISTS estado_pedido CASCADE;
DROP TYPE IF EXISTS estado_finanza CASCADE;

-- Create enum types
CREATE TYPE estado_pedido AS ENUM ('pendiente', 'en_progreso', 'realizado', 'cancelado');
CREATE TYPE estado_finanza AS ENUM ('por_cobrar', 'deuda', 'pagada');

-- Clientes table
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inventario general
CREATE TABLE inventario (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'general',
  cantidad INTEGER NOT NULL DEFAULT 0,
  precio_unitario NUMERIC(10, 2) NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cubiertas (tires) - specialized inventory
CREATE TABLE cubiertas (
  id SERIAL PRIMARY KEY,
  marca TEXT NOT NULL,
  medida TEXT NOT NULL,
  modelo TEXT,
  tipo TEXT DEFAULT 'radial',
  cantidad INTEGER NOT NULL DEFAULT 0,
  precio_compra NUMERIC(10, 2) NOT NULL DEFAULT 0,
  precio_venta NUMERIC(10, 2) NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pedidos (orders)
CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  descripcion TEXT NOT NULL,
  estado estado_pedido NOT NULL DEFAULT 'pendiente',
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notas TEXT,
  fecha_pedido TIMESTAMP DEFAULT NOW(),
  fecha_completado TIMESTAMP
);

-- Finanzas
CREATE TABLE finanzas (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos(id) ON DELETE SET NULL,
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  descripcion TEXT NOT NULL,
  monto NUMERIC(10, 2) NOT NULL,
  estado estado_finanza NOT NULL DEFAULT 'por_cobrar',
  fecha_vencimiento TIMESTAMP,
  fecha_pago TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed sample data
INSERT INTO clientes (nombre, telefono, email, direccion) VALUES
  ('Juan Perez', '011-4555-1234', 'juan@email.com', 'Av. Rivadavia 1234, CABA'),
  ('Maria Garcia', '011-4555-5678', 'maria@email.com', 'Calle San Martin 567, Moreno'),
  ('Carlos Lopez', '011-4555-9012', 'carlos@email.com', 'Ruta 7 km 42, Lujan'),
  ('Ana Rodriguez', '011-4555-3456', 'ana@email.com', 'Av. Mitre 890, Avellaneda'),
  ('Roberto Fernandez', '011-4555-7890', 'roberto@email.com', 'Calle Belgrano 123, Quilmes');

INSERT INTO cubiertas (marca, medida, modelo, tipo, cantidad, precio_compra, precio_venta) VALUES
  ('Pirelli', '195/65 R15', 'Cinturato P1', 'radial', 12, 45000.00, 68000.00),
  ('Firestone', '175/70 R13', 'F-600', 'radial', 8, 32000.00, 48000.00),
  ('Fate', '205/55 R16', 'Eximia Pininfarina', 'radial', 5, 52000.00, 78000.00),
  ('Bridgestone', '185/65 R15', 'Turanza ER300', 'radial', 15, 48000.00, 72000.00),
  ('Continental', '195/55 R15', 'PowerContact 2', 'radial', 3, 55000.00, 82000.00),
  ('Goodyear', '175/65 R14', 'Assurance', 'radial', 10, 38000.00, 56000.00),
  ('Michelin', '205/60 R16', 'Primacy 4', 'radial', 6, 62000.00, 92000.00),
  ('Dunlop', '185/60 R14', 'SP Touring R1', 'radial', 20, 35000.00, 52000.00);

INSERT INTO inventario (nombre, categoria, cantidad, precio_unitario, stock_minimo) VALUES
  ('Valvulas de goma', 'accesorios', 50, 500.00, 20),
  ('Parches radiales', 'reparacion', 30, 800.00, 10),
  ('Contrapesos adhesivos', 'balanceo', 100, 200.00, 30),
  ('Contrapesos de clip', 'balanceo', 80, 250.00, 20),
  ('Liquido sellador', 'reparacion', 15, 3500.00, 5),
  ('Filtro de aceite universal', 'general', 25, 2500.00, 10);

INSERT INTO pedidos (cliente_id, descripcion, estado, total, fecha_pedido) VALUES
  (1, 'Cambio de 4 cubiertas Pirelli 195/65 R15', 'pendiente', 280000.00, NOW() - INTERVAL '1 day'),
  (2, 'Reparacion de pinchadura + balanceo', 'en_progreso', 8500.00, NOW() - INTERVAL '2 hours'),
  (3, 'Alineacion y balanceo completo', 'realizado', 15000.00, NOW() - INTERVAL '3 days'),
  (4, 'Cambio de 2 cubiertas Fate 205/55 R16', 'realizado', 164000.00, NOW() - INTERVAL '5 days'),
  (1, 'Rotacion de cubiertas', 'realizado', 6000.00, NOW() - INTERVAL '7 days'),
  (5, 'Cambio de 4 cubiertas Bridgestone 185/65 R15 + alineacion', 'pendiente', 303000.00, NOW()),
  (2, 'Reparacion de llanta y balanceo', 'en_progreso', 12000.00, NOW() - INTERVAL '4 hours');

INSERT INTO finanzas (pedido_id, cliente_id, descripcion, monto, estado, fecha_vencimiento) VALUES
  (1, 1, 'Cambio de 4 cubiertas Pirelli', 280000.00, 'por_cobrar', NOW() + INTERVAL '15 days'),
  (2, 2, 'Reparacion de pinchadura + balanceo', 8500.00, 'por_cobrar', NOW() + INTERVAL '7 days'),
  (3, 3, 'Alineacion y balanceo completo', 15000.00, 'pagada', NOW() - INTERVAL '2 days'),
  (4, 4, 'Cambio de 2 cubiertas Fate', 164000.00, 'deuda', NOW() - INTERVAL '1 day'),
  (5, 1, 'Rotacion de cubiertas', 6000.00, 'pagada', NOW() - INTERVAL '6 days'),
  (6, 5, 'Cambio cubiertas Bridgestone + alineacion', 303000.00, 'por_cobrar', NOW() + INTERVAL '30 days');
