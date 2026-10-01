-- =====================================================================
-- ⚡ INVESTOR FORUM: STAGED NEWS WIRE & DEFERRED MARKET SHOCKS
-- =====================================================================
-- Migration: 202609160001_staged_news_and_deferred_shocks.sql
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- =====================================================================

-- 1. Create staged_news table for saving drafted news and stock price shocks
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

-- 2. Performance indexes for quick querying and ordering
create index if not exists idx_staged_news_status on public.staged_news(status, created_at desc);
create index if not exists idx_staged_news_created on public.staged_news(created_at desc);

-- 3. Grants for anon & authenticated roles
grant select, insert, update, delete on public.staged_news to anon, authenticated;

-- 4. Row Level Security Policies
alter table public.staged_news enable row level security;
drop policy if exists "Allow all staged_news select" on public.staged_news;
create policy "Allow all staged_news select" on public.staged_news for select using (true);
drop policy if exists "Allow all staged_news insert" on public.staged_news;
create policy "Allow all staged_news insert" on public.staged_news for insert with check (true);
drop policy if exists "Allow all staged_news update" on public.staged_news;
create policy "Allow all staged_news update" on public.staged_news for update using (true);
drop policy if exists "Allow all staged_news delete" on public.staged_news;
create policy "Allow all staged_news delete" on public.staged_news for delete using (true);

-- 5. Add to Supabase Realtime Publication for instantaneous multi-admin sync
do $$
begin
  begin
    alter publication supabase_realtime add table public.staged_news;
  exception when duplicate_object then
    null;
  end;
end $$;
