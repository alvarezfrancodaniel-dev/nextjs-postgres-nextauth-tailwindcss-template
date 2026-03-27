-- Add doc_type column to remitos table
ALTER TABLE public.remitos ADD COLUMN IF NOT EXISTS doc_type TEXT DEFAULT 'remito';

-- Update any existing remitos to have doc_type = 'remito'
UPDATE public.remitos SET doc_type = 'remito' WHERE doc_type IS NULL;

-- Drop the status column (no longer needed)
ALTER TABLE public.remitos DROP COLUMN IF EXISTS status;
