-- Disable RLS on all tables to allow public access
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE remitos DISABLE ROW LEVEL SECURITY;

-- Drop all RLS policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

DROP POLICY IF EXISTS "categories_select_all" ON categories;
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
DROP POLICY IF EXISTS "categories_update_admin" ON categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON categories;

DROP POLICY IF EXISTS "products_select_own" ON products;
DROP POLICY IF EXISTS "products_insert_own" ON products;
DROP POLICY IF EXISTS "products_update_own" ON products;
DROP POLICY IF EXISTS "products_delete_own" ON products;

DROP POLICY IF EXISTS "clients_select_own" ON clients;
DROP POLICY IF EXISTS "clients_insert_own" ON clients;
DROP POLICY IF EXISTS "clients_update_own" ON clients;
DROP POLICY IF EXISTS "clients_delete_own" ON clients;

DROP POLICY IF EXISTS "orders_select_own" ON service_orders;
DROP POLICY IF EXISTS "orders_insert_own" ON service_orders;
DROP POLICY IF EXISTS "orders_update_own" ON service_orders;
DROP POLICY IF EXISTS "orders_delete_own" ON service_orders;

DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;
DROP POLICY IF EXISTS "order_items_update_own" ON order_items;
DROP POLICY IF EXISTS "order_items_delete_own" ON order_items;

DROP POLICY IF EXISTS "remitos_select_own" ON remitos;
DROP POLICY IF EXISTS "remitos_insert_own" ON remitos;
DROP POLICY IF EXISTS "remitos_update_own" ON remitos;
DROP POLICY IF EXISTS "remitos_delete_own" ON remitos;
