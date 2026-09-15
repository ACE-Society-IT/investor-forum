-- =====================================================================
-- ⚡ INVESTOR FORUM: SCHEMA SYNC & TEAM MANAGEMENT FIXES
-- =====================================================================
-- Migration: 202609150001_team_management_and_schema_sync.sql
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- =====================================================================

-- 1. Ensure public.transactions has both 'price' and 'price_per_share'
--    This prevents 400 Bad Request whether client requests 'price' or 'price_per_share'
do $$
begin
  -- Add price column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'price'
  ) then
    alter table public.transactions add column price numeric;
  end if;

  -- Add price_per_share column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'transactions' and column_name = 'price_per_share'
  ) then
    alter table public.transactions add column price_per_share numeric;
  end if;
end $$;

-- Synchronize prices across both columns for existing records
update public.transactions
set price = price_per_share
where price is null and price_per_share is not null;

update public.transactions
set price_per_share = price
where price_per_share is null and price is not null;

-- Trigger to keep price and price_per_share in sync automatically on future inserts
create or replace function public.sync_transaction_price()
returns trigger as $$
begin
  if new.price is null and new.price_per_share is not null then
    new.price := new.price_per_share;
  elsif new.price_per_share is null and new.price is not null then
    new.price_per_share := new.price;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_transaction_price on public.transactions;
create trigger trg_sync_transaction_price
before insert or update on public.transactions
for each row execute function public.sync_transaction_price();

-- 2. Ensure public.stocks has 'is_trading_halted'
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'stocks' and column_name = 'is_trading_halted'
  ) then
    alter table public.stocks add column is_trading_halted boolean default false;
  end if;
end $$;

-- 3. Ensure public.game_state has 'status'
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'game_state' and column_name = 'status'
  ) then
    alter table public.game_state add column status text default 'active';
  end if;
end $$;

-- 4. Ensure public.team_members table exists with roles
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade not null,
  name text not null,
  role text not null default 'Trader' check (role in ('Lead Trader', 'Trader')),
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure index on team_members for fast lookups
create index if not exists idx_team_members_team_id on public.team_members(team_id);
create index if not exists idx_transactions_team_created on public.transactions(team_id, created_at desc);

-- 5. Ensure Table Permissions & RLS for anon & authenticated roles
grant select, insert on public.transactions to anon, authenticated;
grant select on public.stocks to anon, authenticated;
grant select on public.game_state to anon, authenticated;
grant select, insert, update, delete on public.team_members to anon, authenticated;
grant select on public.portfolio to anon, authenticated;
grant select on public.teams to anon, authenticated;

-- Ensure RLS allows read access if enabled
alter table public.transactions enable row level security;
drop policy if exists "Allow read transactions" on public.transactions;
create policy "Allow read transactions" on public.transactions for select using (true);
drop policy if exists "Allow insert transactions" on public.transactions;
create policy "Allow insert transactions" on public.transactions for insert with check (true);

alter table public.team_members enable row level security;
drop policy if exists "Allow read team_members" on public.team_members;
create policy "Allow read team_members" on public.team_members for select using (true);
drop policy if exists "Allow all team_members" on public.team_members;
create policy "Allow all team_members" on public.team_members for all using (true);

-- 6. Add to Realtime Publication if not already added
do $$
begin
  begin
    alter publication supabase_realtime add table public.transactions;
  exception when duplicate_object then
    null;
  end;
  begin
    alter publication supabase_realtime add table public.team_members;
  exception when duplicate_object then
    null;
  end;
end $$;
