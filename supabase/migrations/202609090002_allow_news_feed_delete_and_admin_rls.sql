-- =====================================================================
-- FIX: ENABLE DELETE & UPDATE POLICIES FOR NEWS_FEED & ADMIN CONTROLS
-- Run this in your Supabase SQL Editor:
-- =====================================================================

-- 1. Ensure RLS is configured for news_feed
alter table if exists public.news_feed enable row level security;

-- 2. Drop any legacy restrictive policies
drop policy if exists "Allow all news read" on public.news_feed;
drop policy if exists "Allow all news insert" on public.news_feed;
drop policy if exists "Allow all news update" on public.news_feed;
drop policy if exists "Allow all news delete" on public.news_feed;

-- 3. Create full permissive policies for tournament administration
create policy "Allow all news read" on public.news_feed for select using (true);
create policy "Allow all news insert" on public.news_feed for insert with check (true);
create policy "Allow all news update" on public.news_feed for update using (true);
create policy "Allow all news delete" on public.news_feed for delete using (true);

-- 4. Also ensure other tables have delete policies for resets and admin operations
drop policy if exists "Allow all stocks delete" on public.stocks;
create policy "Allow all stocks delete" on public.stocks for delete using (true);

drop policy if exists "Allow all teams delete" on public.teams;
create policy "Allow all teams delete" on public.teams for delete using (true);

drop policy if exists "Allow all portfolio delete" on public.portfolio;
create policy "Allow all portfolio delete" on public.portfolio for delete using (true);

drop policy if exists "Allow all transactions delete" on public.transactions;
create policy "Allow all transactions delete" on public.transactions for delete using (true);

-- 5. Notify PostgREST to refresh schema cache
notify pgrst, 'reload config';
notify pgrst, 'reload schema';
