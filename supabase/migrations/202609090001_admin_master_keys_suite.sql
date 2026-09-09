-- =====================================================================
-- INVESTOR FORUM: ADMIN MASTER KEYS SUITE & ACCESS CONTROL
-- =====================================================================
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Create dedicated table for Director Master Keys
CREATE TABLE IF NOT EXISTS public.admin_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL DEFAULT 'Director Master Key',
  key_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create performance indexes for instant sub-millisecond key lookups
CREATE INDEX IF NOT EXISTS idx_admin_keys_code ON public.admin_keys (key_code);
CREATE INDEX IF NOT EXISTS idx_admin_keys_active ON public.admin_keys (is_active);

-- 3. Configure Row Level Security (RLS) policies
ALTER TABLE public.admin_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service_role full access to admin_keys" ON public.admin_keys;
DROP POLICY IF EXISTS "Allow all admin_keys read" ON public.admin_keys;
DROP POLICY IF EXISTS "Allow all admin_keys write" ON public.admin_keys;
DROP POLICY IF EXISTS "Allow public read on admin_keys" ON public.admin_keys;
DROP POLICY IF EXISTS "Allow public insert on admin_keys" ON public.admin_keys;
DROP POLICY IF EXISTS "Allow public update on admin_keys" ON public.admin_keys;
DROP POLICY IF EXISTS "Allow public delete on admin_keys" ON public.admin_keys;

CREATE POLICY "Allow public read on admin_keys" ON public.admin_keys FOR SELECT USING (true);
CREATE POLICY "Allow public insert on admin_keys" ON public.admin_keys FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on admin_keys" ON public.admin_keys FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on admin_keys" ON public.admin_keys FOR DELETE USING (true);

-- 4. Seed initial default master keys
INSERT INTO public.admin_keys (key_name, key_code, is_active)
VALUES
  ('Lead Director Key', 'IF-ADMIN-KEY-2026', true),
  ('Tournament Master Key', 'admin123', true)
ON CONFLICT (key_code) DO UPDATE SET is_active = true;
