-- =====================================================================
-- INVESTOR FORUM: ADMIN KEYS & CLEAN TEAM AUTHENTICATION
-- =====================================================================
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Create dedicated Admin Keys table for master director login
create table if not exists public.admin_keys (
  id uuid primary key default gen_random_uuid(),
  key_name text not null default 'Director Master Key',
  key_code text unique not null,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for admin_keys
alter table public.admin_keys enable row level security;
create policy "Allow all admin_keys read" on public.admin_keys for select using (true);

-- 2. Insert Default Admin Master Key (CHANGE THIS KEY TO YOUR DESIRED SECRET PASSCODE)
insert into public.admin_keys (key_name, key_code, is_active)
values
  ('Lead Director Key', 'IF-ADMIN-KEY-2026', true),
  ('Tournament Master Key', 'admin123', true)
on conflict (key_code) do update set is_active = true;

-- 3. Ensure teams table has is_admin column and RLS policies
alter table public.teams add column if not exists is_admin boolean default false;
alter table public.teams add column if not exists is_banned boolean default false;

-- 4. Create an Admin Account in teams table
insert into public.teams (name, username, password, cash_balance, is_admin, is_banned)
values
  ('Competition Director', 'admin', 'admin123', 0, true, false)
on conflict (username) do update set 
  password = excluded.password,
  is_admin = true;

-- 5. Optional: Clean up any old demo accounts so you start with a clean slate
-- (Uncomment the line below if you want to wipe sample teams and start empty)
-- delete from public.teams where is_admin = false;
