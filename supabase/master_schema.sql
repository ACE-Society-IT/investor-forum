-- =====================================================================
-- ⚡ INVESTOR FORUM: COMPLETE MASTER DATABASE SCHEMA & SEED SUITE
-- =====================================================================
-- Run this complete script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- =====================================================================

-- 1. Enable Required Extensions
create extension if not exists "uuid-ossp";

-- =====================================================================
-- 2. GAME STATE (TOURNAMENT SEQUENCING, TIMERS & REVEAL CONTROLS)
-- =====================================================================
create table if not exists public.game_state (
  id integer primary key default 1,
  current_round text not null default 'Round 1 - Active',
  is_market_open boolean not null default true,
  total_rounds integer not null default 3,
  current_round_number integer not null default 1,
  round_ends_at timestamp with time zone,
  next_round_starts_at timestamp with time zone,
  round_duration_minutes integer default 15,
  is_results_revealed boolean not null default false,
  results_headline text default 'Official Results Audit in Progress - Stand By For Winner Announcement',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure singleton row id = 1
insert into public.game_state (
  id, current_round, is_market_open, total_rounds, current_round_number, round_duration_minutes, is_results_revealed
) values (
  1, 'Round 1 - Active', true, 3, 1, 15, false
) on conflict (id) do update set updated_at = now();

-- =====================================================================
-- 3. EQUITIES & SECURITIES (STOCKS MATRIX)
-- =====================================================================
create table if not exists public.stocks (
  id uuid primary key default gen_random_uuid(),
  ticker text unique not null,
  name text not null,
  sector text not null, -- 'Technology', 'Pharmaceuticals', 'Energy', 'Consumer Goods'
  price numeric not null,
  previous_price numeric not null,
  change_percent numeric not null default 0,
  spark_data jsonb default '[100, 102, 98, 105, 110, 108, 115]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- 4. NEWS WIRE & BREAKING BULLETINS
-- =====================================================================
create table if not exists public.news_feed (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  body text,
  sector text not null,
  impact_percent numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- 5. TRADING DESKS & TEAMS
-- =====================================================================
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  username text unique not null,
  password text not null,
  cash_balance numeric not null default 100000,
  is_admin boolean not null default false,
  is_banned boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- 6. PORTFOLIO INVENTORY (TEAM STOCK HOLDINGS)
-- =====================================================================
create table if not exists public.portfolio (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade not null,
  stock_id uuid references public.stocks(id) on delete cascade not null,
  shares integer not null default 0,
  avg_buy_price numeric not null default 0,
  unique(team_id, stock_id)
);

-- =====================================================================
-- 7. AUDIT LEDGER & TRANSACTION HISTORY
-- =====================================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade not null,
  stock_id uuid references public.stocks(id) on delete cascade not null,
  type text not null check (type in ('BUY', 'SELL')),
  shares integer not null,
  price_per_share numeric not null,
  total_amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- 8. DIRECTOR MASTER KEYS (ADMIN AUTHENTICATION)
-- =====================================================================
create table if not exists public.admin_keys (
  id uuid primary key default gen_random_uuid(),
  key_name text not null default 'Director Master Key',
  key_code text unique not null,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- 9. PERFORMANCE INDEXES (SUB-MILLISECOND EXECUTION)
-- =====================================================================
create index if not exists idx_portfolio_team_id on public.portfolio(team_id);
create index if not exists idx_portfolio_stock_id on public.portfolio(stock_id);
create index if not exists idx_portfolio_team_shares on public.portfolio(team_id, shares) where shares > 0;

create index if not exists idx_transactions_team_created on public.transactions(team_id, created_at desc);
create index if not exists idx_transactions_created on public.transactions(created_at desc);

create index if not exists idx_news_feed_created on public.news_feed(created_at desc);
create index if not exists idx_news_feed_sector on public.news_feed(sector);

create index if not exists idx_stocks_ticker on public.stocks(ticker);
create index if not exists idx_stocks_sector on public.stocks(sector);

create index if not exists idx_teams_username on public.teams(username);
create index if not exists idx_teams_is_admin on public.teams(is_admin);
create index if not exists idx_teams_cash on public.teams(cash_balance desc);

create index if not exists idx_admin_keys_code on public.admin_keys(key_code);
create index if not exists idx_admin_keys_active on public.admin_keys(is_active);

-- =====================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
alter table public.game_state enable row level security;
alter table public.stocks enable row level security;
alter table public.news_feed enable row level security;
alter table public.teams enable row level security;
alter table public.portfolio enable row level security;
alter table public.transactions enable row level security;
alter table public.admin_keys enable row level security;

-- Game State Policies
drop policy if exists "Allow all game_state read" on public.game_state;
drop policy if exists "Allow all game_state update" on public.game_state;
create policy "Allow all game_state read" on public.game_state for select using (true);
create policy "Allow all game_state update" on public.game_state for update using (true);

-- Stocks Policies
drop policy if exists "Allow all stocks read" on public.stocks;
drop policy if exists "Allow all stocks insert" on public.stocks;
drop policy if exists "Allow all stocks update" on public.stocks;
drop policy if exists "Allow all stocks delete" on public.stocks;
create policy "Allow all stocks read" on public.stocks for select using (true);
create policy "Allow all stocks insert" on public.stocks for insert with check (true);
create policy "Allow all stocks update" on public.stocks for update using (true);
create policy "Allow all stocks delete" on public.stocks for delete using (true);

-- News Feed Policies
drop policy if exists "Allow all news read" on public.news_feed;
drop policy if exists "Allow all news insert" on public.news_feed;
drop policy if exists "Allow all news update" on public.news_feed;
drop policy if exists "Allow all news delete" on public.news_feed;
create policy "Allow all news read" on public.news_feed for select using (true);
create policy "Allow all news insert" on public.news_feed for insert with check (true);
create policy "Allow all news update" on public.news_feed for update using (true);
create policy "Allow all news delete" on public.news_feed for delete using (true);

-- Teams Policies
drop policy if exists "Allow all teams read" on public.teams;
drop policy if exists "Allow all teams insert" on public.teams;
drop policy if exists "Allow all teams update" on public.teams;
drop policy if exists "Allow all teams delete" on public.teams;
create policy "Allow all teams read" on public.teams for select using (true);
create policy "Allow all teams insert" on public.teams for insert with check (true);
create policy "Allow all teams update" on public.teams for update using (true);
create policy "Allow all teams delete" on public.teams for delete using (true);

-- Portfolio Policies
drop policy if exists "Allow all portfolio read" on public.portfolio;
drop policy if exists "Allow all portfolio insert" on public.portfolio;
drop policy if exists "Allow all portfolio update" on public.portfolio;
drop policy if exists "Allow all portfolio delete" on public.portfolio;
create policy "Allow all portfolio read" on public.portfolio for select using (true);
create policy "Allow all portfolio insert" on public.portfolio for insert with check (true);
create policy "Allow all portfolio update" on public.portfolio for update using (true);
create policy "Allow all portfolio delete" on public.portfolio for delete using (true);

-- Transactions Policies
drop policy if exists "Allow all transactions read" on public.transactions;
drop policy if exists "Allow all transactions insert" on public.transactions;
create policy "Allow all transactions read" on public.transactions for select using (true);
create policy "Allow all transactions insert" on public.transactions for insert with check (true);

-- Admin Keys Policies
drop policy if exists "Allow public read on admin_keys" on public.admin_keys;
drop policy if exists "Allow public insert on admin_keys" on public.admin_keys;
drop policy if exists "Allow public update on admin_keys" on public.admin_keys;
drop policy if exists "Allow public delete on admin_keys" on public.admin_keys;
create policy "Allow public read on admin_keys" on public.admin_keys for select using (true);
create policy "Allow public insert on admin_keys" on public.admin_keys for insert with check (true);
create policy "Allow public update on admin_keys" on public.admin_keys for update using (true);
create policy "Allow public delete on admin_keys" on public.admin_keys for delete using (true);

-- =====================================================================
-- 11. INITIAL SEED DATA (STOCKS, NEWS, TEAMS & MASTER KEYS)
-- =====================================================================

-- Seed Competition Equities
insert into public.stocks (ticker, name, sector, price, previous_price, change_percent, spark_data)
values
  ('NVX', 'NovaTech AI Corp', 'Technology', 145.50, 140.00, 3.93, '[135, 138, 142, 140, 144, 145.5]'::jsonb),
  ('CLD', 'Apex Cloud Systems', 'Technology', 82.00, 85.00, -3.53, '[88, 86, 84, 85, 83, 82]'::jsonb),
  ('PHM', 'PharmaCare Therapeutics', 'Pharmaceuticals', 210.00, 198.00, 6.06, '[190, 195, 198, 204, 210]'::jsonb),
  ('BIO', 'Helix BioGenetics', 'Pharmaceuticals', 64.20, 64.20, 0.00, '[62, 65, 63, 64, 64.2]'::jsonb),
  ('VLT', 'VoltGrid Energy Solutions', 'Energy', 95.80, 102.00, -6.08, '[105, 104, 102, 98, 95.8]'::jsonb),
  ('SOL', 'AeroSolar Dynamics', 'Energy', 48.00, 45.00, 6.67, '[42, 44, 45, 46, 48]'::jsonb),
  ('AUR', 'Aura Luxury Retail', 'Consumer Goods', 124.00, 120.00, 3.33, '[115, 118, 120, 122, 124]'::jsonb),
  ('FDX', 'PrimeFoods Global', 'Consumer Goods', 36.50, 37.00, -1.35, '[38, 37.5, 37, 36.8, 36.5]'::jsonb)
on conflict (ticker) do nothing;

-- Seed Initial News Bulletins
insert into public.news_feed (headline, body, sector, impact_percent)
values
  ('Global chip shortage eases as new silicon fabrication plant opens ahead of schedule.', 'Semiconductor production hits record throughput in Q3, bolstering hardware supply chains and hardware margins worldwide.', 'Technology', 4.5),
  ('Regulatory board grants fast-track clearance for breakthrough oncology drug.', 'Clinical trials demonstrate overwhelming efficacy with zero adverse side effects reported across phase 3 study groups.', 'Pharmaceuticals', 8.2),
  ('Renewable energy subsidies expanded in nationwide infrastructure bill.', 'Federal incentives provide massive capital depreciation allowances for grid storage and next-generation solar installations.', 'Energy', 5.0)
on conflict do nothing;

-- Seed Default Trading Desks & Admin Team
insert into public.teams (name, username, password, cash_balance, is_admin)
values
  ('Admin Command', 'admin', 'admin2026', 0, true),
  ('Alpha Traders', 'team1', 'pass123', 100000, false),
  ('Wall Street Wolves', 'team2', 'pass123', 100000, false),
  ('Quantum Fund', 'team3', 'pass123', 100000, false),
  ('Bullish Titans', 'team4', 'pass123', 100000, false)
on conflict (username) do nothing;

-- Seed Default Director Master Keys
insert into public.admin_keys (key_name, key_code, is_active)
values
  ('Lead Director Key', 'IF-ADMIN-KEY-2026', true),
  ('Tournament Master Key', 'admin123', true)
on conflict (key_code) do update set is_active = true;
