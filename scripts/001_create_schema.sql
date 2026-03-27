-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'employee',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_year TEXT,
  license_plate TEXT,
  notes TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_select" ON public.clients FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "clients_insert" ON public.clients FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "clients_update" ON public.clients FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "clients_delete" ON public.clients FOR DELETE USING (auth.uid() IS NOT NULL);

-- Product categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select" ON public.categories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "categories_insert" ON public.categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "categories_update" ON public.categories FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "categories_delete" ON public.categories FOR DELETE USING (auth.uid() IS NOT NULL);

-- Products / Tires inventory
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  size TEXT,
  category_id UUID REFERENCES public.categories(id),
  purchase_price NUMERIC(10,2) DEFAULT 0,
  sale_price NUMERIC(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 2,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select" ON public.products FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "products_insert" ON public.products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "products_update" ON public.products FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "products_delete" ON public.products FOR DELETE USING (auth.uid() IS NOT NULL);

-- Service types
CREATE TYPE service_type AS ENUM ('reparacion', 'alineacion', 'balanceo', 'lavado', 'venta', 'otro');
CREATE TYPE service_status AS ENUM ('pendiente', 'en_proceso', 'completado', 'cancelado');

-- Service orders
CREATE TABLE IF NOT EXISTS public.service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL,
  client_id UUID REFERENCES public.clients(id),
  service_type service_type NOT NULL,
  status service_status DEFAULT 'pendiente',
  description TEXT,
  vehicle_info TEXT,
  total NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select" ON public.service_orders FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "orders_insert" ON public.service_orders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "orders_update" ON public.service_orders FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "orders_delete" ON public.service_orders FOR DELETE USING (auth.uid() IS NOT NULL);

-- Order items (products used in a service)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  description TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2) DEFAULT 0,
  subtotal NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_select" ON public.order_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "order_items_insert" ON public.order_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "order_items_update" ON public.order_items FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "order_items_delete" ON public.order_items FOR DELETE USING (auth.uid() IS NOT NULL);

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
  ('Cubiertas', 'Cubiertas y neumaticos para vehiculos'),
  ('Camaras', 'Camaras para cubiertas'),
  ('Valvulas', 'Valvulas para neumaticos'),
  ('Picos', 'Picos de inflado'),
  ('Parches', 'Parches para reparacion de cubiertas'),
  ('Otros', 'Otros productos y accesorios');
