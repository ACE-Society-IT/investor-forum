-- Investor Forum Competition Database Schema
-- Supabase Project: txsvejwayjdfqzjtiqap

-- 1. Game State (Singleton control)
create table if not exists public.game_state (
  id integer primary key default 1,
  current_round text not null default 'Round 1 - Active',
  is_market_open boolean not null default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default game state if not exists
insert into public.game_state (id, current_round, is_market_open)
values (1, 'Round 1 - Active', true)
on conflict (id) do update set updated_at = now();

-- 2. Stocks Table
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

-- 3. News Feed Table
create table if not exists public.news_feed (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  sector text not null,
  impact_percent numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Teams Table
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  username text unique not null,
  password text not null,
  cash_balance numeric not null default 100000,
  is_admin boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Portfolio Inventory Table
create table if not exists public.portfolio (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade not null,
  stock_id uuid references public.stocks(id) on delete cascade not null,
  shares integer not null default 0,
  avg_buy_price numeric not null default 0,
  unique(team_id, stock_id)
);

-- 6. Transactions Table
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

-- Enable Row Level Security
alter table public.game_state enable row level security;
alter table public.stocks enable row level security;
alter table public.news_feed enable row level security;
alter table public.teams enable row level security;
alter table public.portfolio enable row level security;
alter table public.transactions enable row level security;

-- Policies for Competition Access
create policy "Allow all game_state read" on public.game_state for select using (true);
create policy "Allow all game_state update" on public.game_state for update using (true);

create policy "Allow all stocks read" on public.stocks for select using (true);
create policy "Allow all stocks insert" on public.stocks for insert with check (true);
create policy "Allow all stocks update" on public.stocks for update using (true);

create policy "Allow all news read" on public.news_feed for select using (true);
create policy "Allow all news insert" on public.news_feed for insert with check (true);

create policy "Allow all teams read" on public.teams for select using (true);
create policy "Allow all teams insert" on public.teams for insert with check (true);
create policy "Allow all teams update" on public.teams for update using (true);

create policy "Allow all portfolio read" on public.portfolio for select using (true);
create policy "Allow all portfolio insert" on public.portfolio for insert with check (true);
create policy "Allow all portfolio update" on public.portfolio for update using (true);
create policy "Allow all portfolio delete" on public.portfolio for delete using (true);

create policy "Allow all transactions read" on public.transactions for select using (true);
create policy "Allow all transactions insert" on public.transactions for insert with check (true);

-- Seed Initial Competition Stocks
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

-- Seed Initial News
insert into public.news_feed (headline, sector, impact_percent)
values
  ('Global chip shortage eases as new silicon fabrication plant opens ahead of schedule.', 'Technology', 4.5),
  ('Regulatory board grants fast-track clearance for breakthrough oncology drug.', 'Pharmaceuticals', 8.2),
  ('Renewable energy subsidies expanded in nationwide infrastructure bill.', 'Energy', 5.0)
on conflict do nothing;

-- Seed Sample Teams & Admin Account
insert into public.teams (name, username, password, cash_balance, is_admin)
values
  ('Admin Command', 'admin', 'admin2026', 0, true),
  ('Alpha Traders', 'team1', 'pass123', 100000, false),
  ('Wall Street Wolves', 'team2', 'pass123', 100000, false),
  ('Quantum Fund', 'team3', 'pass123', 100000, false),
  ('Bullish Titans', 'team4', 'pass123', 100000, false)
on conflict (username) do nothing;
