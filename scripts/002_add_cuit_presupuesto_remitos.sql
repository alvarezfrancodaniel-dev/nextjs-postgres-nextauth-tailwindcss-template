-- 1. Rename 'phone' column to 'cuit' in clients table (preserves existing data)
ALTER TABLE public.clients RENAME COLUMN phone TO cuit;

-- 2. Add 'Presupuesto' category if it doesn't exist
INSERT INTO public.categories (name, description)
SELECT 'Presupuesto', 'Presupuestos para clientes'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Presupuesto');

-- 3. Create remitos table
CREATE TABLE IF NOT EXISTS public.remitos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remito_number SERIAL,
  client_id UUID REFERENCES public.clients(id),
  order_id UUID REFERENCES public.service_orders(id),
  description TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  total NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'pendiente',
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.remitos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "remitos_select" ON public.remitos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "remitos_insert" ON public.remitos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "remitos_update" ON public.remitos FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "remitos_delete" ON public.remitos FOR DELETE USING (auth.uid() IS NOT NULL);
