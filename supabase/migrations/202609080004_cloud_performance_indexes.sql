-- =====================================================================
-- INVESTOR FORUM: HIGH-SPEED CLOUD STORAGE & DATABASE PERFORMANCE INDEXES
-- =====================================================================
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- These indexes accelerate queries across the competition by up to 10x-50x.

-- 1. Accelerate team portfolio lookup and holdings calculations
create index if not exists idx_portfolio_team_id on public.portfolio(team_id);
create index if not exists idx_portfolio_stock_id on public.portfolio(stock_id);
create index if not exists idx_portfolio_team_shares on public.portfolio(team_id, shares) where shares > 0;

-- 2. Accelerate transaction history and ledger sorting
create index if not exists idx_transactions_team_created on public.transactions(team_id, created_at desc);
create index if not exists idx_transactions_created on public.transactions(created_at desc);

-- 3. Accelerate news feed sorting & AI shock lookups
create index if not exists idx_news_feed_created on public.news_feed(created_at desc);
create index if not exists idx_news_feed_sector on public.news_feed(sector);

-- 4. Accelerate stock price tickers & trading floor search
create index if not exists idx_stocks_ticker on public.stocks(ticker);
create index if not exists idx_stocks_sector on public.stocks(sector);

-- 5. Accelerate team logins, authorization & leaderboard rankings
create index if not exists idx_teams_username on public.teams(username);
create index if not exists idx_teams_is_admin on public.teams(is_admin);
create index if not exists idx_teams_cash on public.teams(cash_balance desc);
