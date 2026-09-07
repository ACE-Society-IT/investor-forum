-- Investor Forum Database Schema
-- Project: txsvejwayjdfqzjtiqap

-- 1. Deals / Startups Table
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  stage text not null default 'Seed',
  sector text not null default 'Artificial Intelligence',
  location text not null default 'San Francisco, CA',
  valuation text not null default '$10M',
  growth numeric not null default 0,
  raised numeric not null default 0,
  target numeric not null default 1000000,
  min_check numeric not null default 2500,
  investors_count integer not null default 0,
  days_left integer not null default 14,
  tagline text not null,
  logo text,
  spark_data jsonb default '[10, 15, 22, 30, 45, 60, 80]'::jsonb
);

-- 2. Reviews / Posts Table
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  author text not null,
  role text not null default 'Verified Member',
  title text not null,
  content text not null,
  sentiment text not null default 'DUE DILIGENCE',
  upvotes integer not null default 0,
  tags text[] default array['Investing', 'Startups']
);

-- 3. Comments Table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  author text not null,
  role text not null default 'Verified Member',
  text text not null
);

-- 4. User Investments Table
create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deal_name text not null,
  amount numeric not null,
  stage text not null default 'Seed',
  ownership text not null,
  current_val text,
  multiple text default '1.0x',
  date text not null
);

-- 5. Investor Groups / Syndicates Table
create table if not exists public.syndicates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  lead_name text not null,
  lead_person text not null,
  focus text not null,
  moic text not null default '3.0x',
  irr text not null default '30%',
  members integer not null default 0,
  total_deployed text not null default '$10M',
  deals_count integer not null default 0,
  recent_deal text
);

-- 6. Official Documents Table
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  company text not null,
  type text not null,
  size text not null default '1.0 MB',
  status text not null default 'Verified',
  security text not null default 'Official'
);

-- Enable Row Level Security (RLS)
alter table public.deals enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.investments enable row level security;
alter table public.syndicates enable row level security;
alter table public.documents enable row level security;

-- Public read access policies
create policy "Public read deals" on public.deals for select using (true);
create policy "Public insert deals" on public.deals for insert with check (true);

create policy "Public read posts" on public.posts for select using (true);
create policy "Public insert posts" on public.posts for insert with check (true);

create policy "Public read comments" on public.comments for select using (true);
create policy "Public insert comments" on public.comments for insert with check (true);

create policy "Public read investments" on public.investments for select using (true);
create policy "Public insert investments" on public.investments for insert with check (true);

create policy "Public read syndicates" on public.syndicates for select using (true);
create policy "Public read documents" on public.documents for select using (true);
