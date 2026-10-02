-- =====================================================================
-- 🏢 ADD STOCK OPEN / CLOSE (ACTIVE STATUS) COLUMNS
-- =====================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- =====================================================================

-- 1. Ensure `is_active` and `is_open` exist on public.stocks
ALTER TABLE public.stocks ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.stocks ADD COLUMN IF NOT EXISTS is_open BOOLEAN NOT NULL DEFAULT true;

-- 2. Create index for high-performance dashboard filtering
CREATE INDEX IF NOT EXISTS idx_stocks_active ON public.stocks (is_active);
CREATE INDEX IF NOT EXISTS idx_stocks_open ON public.stocks (is_open);

-- 3. Set all existing stocks to OPEN (active)
UPDATE public.stocks SET is_active = true, is_open = true WHERE is_active IS NULL OR is_open IS NULL;
