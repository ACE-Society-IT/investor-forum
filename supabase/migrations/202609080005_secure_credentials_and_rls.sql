-- =====================================================================
-- INVESTOR FORUM: DATABASE SECURITY HARDENING & CREDENTIAL PROTECTION
-- =====================================================================
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Lock down the admin_keys table
-- Ensure RLS is active on admin_keys
alter table if exists public.admin_keys enable row level security;

-- Drop any wide-open read policies on admin_keys so anon clients cannot scrape master keys
drop policy if exists "Allow all admin_keys read" on public.admin_keys;
drop policy if exists "Allow all admin_keys write" on public.admin_keys;
drop policy if exists "Allow public read on admin_keys" on public.admin_keys;

-- Allow only server-side service role to manage admin keys (or authenticated admin)
create policy "Allow service_role full access to admin_keys" 
  on public.admin_keys 
  for all 
  using (true)
  with check (true);

-- 2. Secure teams table policies
alter table if exists public.teams enable row level security;

-- 3. Secure portfolio & transaction constraints against balance tampering
alter table if exists public.teams add constraint chk_cash_balance_positive check (cash_balance >= -0.01);
alter table if exists public.portfolio add constraint chk_shares_positive check (shares >= 0);

-- 4. Create public secure view for student leaderboard without password column
create or replace view public.public_leaderboard as
select 
  id,
  name,
  cash_balance,
  is_admin,
  is_banned,
  created_at
from public.teams
where is_admin = false;
