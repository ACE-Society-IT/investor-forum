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
  phase text not null default 'IDLE', -- 'IDLE' | 'ANALYSIS' | 'TRADING' | 'CALCULATING'
  analysis_duration_minutes numeric default 4,
  trading_duration_minutes numeric default 5,
  analysis_ends_at timestamp with time zone,
  trading_ends_at timestamp with time zone,
  active_crisis_id text,
  active_crisis_headline text,
  active_crisis_body text,
  active_crisis_sector text,
  active_crisis_impacts jsonb default '{}'::jsonb,
  active_event_number integer default 1,
  phase_message text default 'Market Ready',
  round_ends_at timestamp with time zone,
  next_round_starts_at timestamp with time zone,
  round_duration_minutes integer default 15,
  is_results_revealed boolean not null default false,
  results_headline text default 'Official Results Audit in Progress - Stand By For Winner Announcement',
  last_client_command text default null,
  last_client_command_time timestamp with time zone default null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure singleton row id = 1
insert into public.game_state (
  id, current_round, is_market_open, total_rounds, current_round_number, round_duration_minutes, is_results_revealed, phase
) values (
  1, 'Round 1 - Active', true, 3, 1, 15, false, 'IDLE'
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
  is_active boolean not null default true,
  is_open boolean not null default true,
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
-- 4b. STAGED NEWS & DEFERRED MARKET SHOCKS (DRAFTS QUEUE)
-- =====================================================================
create table if not exists public.staged_news (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  body text,
  sector text not null default 'Technology',
  target_scope text not null default 'sector' check (target_scope in ('sector', 'stocks')),
  target_stock_ids jsonb default '[]'::jsonb,
  impact_percent numeric not null default 0,
  stock_shocks jsonb default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  published_at timestamp with time zone
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

create index if not exists idx_staged_news_status on public.staged_news(status, created_at desc);
create index if not exists idx_staged_news_created on public.staged_news(created_at desc);

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
alter table public.staged_news enable row level security;
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

-- Staged News Policies
drop policy if exists "Allow all staged_news select" on public.staged_news;
drop policy if exists "Allow all staged_news insert" on public.staged_news;
drop policy if exists "Allow all staged_news update" on public.staged_news;
drop policy if exists "Allow all staged_news delete" on public.staged_news;
create policy "Allow all staged_news select" on public.staged_news for select using (true);
create policy "Allow all staged_news insert" on public.staged_news for insert with check (true);
create policy "Allow all staged_news update" on public.staged_news for update using (true);
create policy "Allow all staged_news delete" on public.staged_news for delete using (true);

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

-- Seed Official Competition Equities (20 Stocks from Tournament Spec)
insert into public.stocks (ticker, name, sector, price, previous_price, change_percent, spark_data)
values
  -- Category: Commercial Banks
  ('UBL', 'United Bank Limited', 'Commercial Banks', 400.00, 400.00, 0.00, '[400, 400, 400, 400, 400]'::jsonb),
  ('HBL', 'Habib Bank Limited', 'Commercial Banks', 280.00, 280.00, 0.00, '[280, 280, 280, 280, 280]'::jsonb),
  ('MCB', 'MCB Bank Limited', 'Commercial Banks', 220.00, 220.00, 0.00, '[220, 220, 220, 220, 220]'::jsonb),

  -- Category: Automobiles (Motors)
  ('INDU', 'Indus Motor Company', 'Automobiles', 1950.00, 1950.00, 0.00, '[1950, 1950, 1950, 1950, 1950]'::jsonb),
  ('HCAR', 'Honda Atlas Cars (Pakistan)', 'Automobiles', 240.00, 240.00, 0.00, '[240, 240, 240, 240, 240]'::jsonb),

  -- Category: Energy (Oil, Gas, Power & Refineries)
  ('KEL', 'K-Electric Limited', 'Energy', 7.00, 7.00, 0.00, '[7.0, 7.0, 7.0, 7.0, 7.0]'::jsonb),
  ('PSO', 'Pakistan State Oil', 'Energy', 320.00, 320.00, 0.00, '[320, 320, 320, 320, 320]'::jsonb),
  ('APL', 'Attock Petroleum Limited', 'Energy', 450.00, 450.00, 0.00, '[450, 450, 450, 450, 450]'::jsonb),
  ('PPL', 'Pakistan Petroleum Limited', 'Energy', 220.00, 220.00, 0.00, '[220, 220, 220, 220, 220]'::jsonb),
  ('PRL', 'Pakistan Refinery Limited', 'Energy', 85.00, 85.00, 0.00, '[85, 85, 85, 85, 85]'::jsonb),
  ('MARI', 'Mari Petroleum Company', 'Energy', 700.00, 700.00, 0.00, '[700, 700, 700, 700, 700]'::jsonb),

  -- Category: Pharmaceuticals
  ('ABOT', 'Abbott Laboratories (Pakistan)', 'Pharmaceuticals', 600.00, 600.00, 0.00, '[600, 600, 600, 600, 600]'::jsonb),
  ('GSK', 'GlaxoSmithKline Pakistan', 'Pharmaceuticals', 500.00, 500.00, 0.00, '[500, 500, 500, 500, 500]'::jsonb),
  ('HALEON', 'Haleon Pakistan Limited', 'Pharmaceuticals', 580.00, 580.00, 0.00, '[580, 580, 580, 580, 580]'::jsonb),

  -- Category: Cement
  ('DGKC', 'D.G. Khan Cement', 'Cement', 200.00, 200.00, 0.00, '[200, 200, 200, 200, 200]'::jsonb),
  ('MLCF', 'Maple Leaf Cement', 'Cement', 60.00, 60.00, 0.00, '[60, 60, 60, 60, 60]'::jsonb),
  ('KOHC', 'Kohat Cement Company', 'Cement', 160.00, 160.00, 0.00, '[160, 160, 160, 160, 160]'::jsonb),

  -- Category: Textiles & Footwear
  ('ILP', 'Interloop Limited', 'Textiles', 20.00, 20.00, 0.00, '[20, 20, 20, 20, 20]'::jsonb),
  ('STYL', 'Stylers International', 'Textiles', 40.00, 40.00, 0.00, '[40, 40, 40, 40, 40]'::jsonb),
  ('SGF', 'Service Global Footwear', 'Textiles', 100.00, 100.00, 0.00, '[100, 100, 100, 100, 100]'::jsonb)
on conflict (ticker) do update
set price = excluded.price,
    previous_price = excluded.previous_price,
    change_percent = excluded.change_percent,
    name = excluded.name,
    sector = excluded.sector,
    spark_data = excluded.spark_data;

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
