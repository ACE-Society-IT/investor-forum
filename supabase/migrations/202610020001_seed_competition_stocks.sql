-- =====================================================================
-- 🏆 INVESTOR FORUM: OFFICIAL COMPETITION STOCKS RESET & SEED SCRIPT
-- =====================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- =====================================================================

-- 1. Clear any old portfolio positions, transactions, news and staged drafts
delete from public.portfolio;
delete from public.transactions;
delete from public.news_feed;
delete from public.staged_news;

-- 2. Clear out all old test stocks
delete from public.stocks;

-- 3. Reset Game State to Round 1 Market Open
update public.game_state
set current_round = 'Round 1 - Active',
    is_market_open = true,
    is_results_revealed = false,
    current_round_number = 1,
    round_ends_at = null,
    next_round_starts_at = null,
    updated_at = now()
where id = 1;

-- 4. Reset all non-admin participant desks to initial $100,000 capital
update public.teams
set cash_balance = 100000,
    is_banned = false
where is_admin = false;

-- 5. Insert Official 20 Competition Stocks from Master Spec
insert into public.stocks (ticker, name, sector, price, previous_price, change_percent, spark_data)
values
  -- Sector: Energy (Oil, Gas, Power & Refineries)
  ('KEL', 'K-Electric Limited', 'Energy', 7.00, 7.00, 0.00, '[7.0, 7.0, 7.0, 7.0, 7.0]'::jsonb),
  ('PSO', 'Pakistan State Oil', 'Energy', 320.00, 320.00, 0.00, '[320, 320, 320, 320, 320]'::jsonb),
  ('APL', 'Attock Petroleum Limited', 'Energy', 450.00, 450.00, 0.00, '[450, 450, 450, 450, 450]'::jsonb),
  ('PPL', 'Pakistan Petroleum Limited', 'Energy', 220.00, 220.00, 0.00, '[220, 220, 220, 220, 220]'::jsonb),
  ('PRL', 'Pakistan Refinery Limited', 'Energy', 85.00, 85.00, 0.00, '[85, 85, 85, 85, 85]'::jsonb),
  ('MARI', 'Mari Petroleum Company', 'Energy', 700.00, 700.00, 0.00, '[700, 700, 700, 700, 700]'::jsonb),

  -- Sector: Pharmaceuticals & Healthcare
  ('ABOT', 'Abbott Laboratories (Pakistan)', 'Pharmaceuticals', 600.00, 600.00, 0.00, '[600, 600, 600, 600, 600]'::jsonb),
  ('GSK', 'GlaxoSmithKline Pakistan', 'Pharmaceuticals', 500.00, 500.00, 0.00, '[500, 500, 500, 500, 500]'::jsonb),
  ('HALEON', 'Haleon Pakistan Limited', 'Pharmaceuticals', 580.00, 580.00, 0.00, '[580, 580, 580, 580, 580]'::jsonb),

  -- Sector: Banking & Finance (Mapped to Technology & Financial Services)
  ('UBL', 'United Bank Limited', 'Technology', 400.00, 400.00, 0.00, '[400, 400, 400, 400, 400]'::jsonb),
  ('HBL', 'Habib Bank Limited', 'Technology', 280.00, 280.00, 0.00, '[280, 280, 280, 280, 280]'::jsonb),
  ('MCB', 'MCB Bank Limited', 'Technology', 220.00, 220.00, 0.00, '[220, 220, 220, 220, 220]'::jsonb),

  -- Sector: Consumer Goods, Automobiles & Textiles
  ('ILP', 'Interloop Limited', 'Consumer Goods', 20.00, 20.00, 0.00, '[20, 20, 20, 20, 20]'::jsonb),
  ('STYL', 'Stylers International', 'Consumer Goods', 40.00, 40.00, 0.00, '[40, 40, 40, 40, 40]'::jsonb),
  ('SGF', 'Service Global Footwear', 'Consumer Goods', 100.00, 100.00, 0.00, '[100, 100, 100, 100, 100]'::jsonb),
  ('INDU', 'Indus Motor Company', 'Consumer Goods', 1950.00, 1950.00, 0.00, '[1950, 1950, 1950, 1950, 1950]'::jsonb),
  ('HCAR', 'Honda Atlas Cars (Pakistan)', 'Consumer Goods', 240.00, 240.00, 0.00, '[240, 240, 240, 240, 240]'::jsonb),

  -- Sector: Cement & Heavy Industrials
  ('DGKC', 'D.G. Khan Cement', 'Consumer Goods', 200.00, 200.00, 0.00, '[200, 200, 200, 200, 200]'::jsonb),
  ('MLCF', 'Maple Leaf Cement', 'Consumer Goods', 60.00, 60.00, 0.00, '[60, 60, 60, 60, 60]'::jsonb),
  ('KOHC', 'Kohat Cement Company', 'Consumer Goods', 160.00, 160.00, 0.00, '[160, 160, 160, 160, 160]'::jsonb)
on conflict (ticker) do update
set price = excluded.price,
    previous_price = excluded.previous_price,
    change_percent = excluded.change_percent,
    name = excluded.name,
    sector = excluded.sector,
    spark_data = excluded.spark_data;
