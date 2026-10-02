-- =====================================================================
-- 🏆 INVESTOR FORUM: OFFICIAL COMPETITION STOCKS RESET & SEED SCRIPT
-- =====================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- =====================================================================

-- 1. Clear old portfolio positions, transactions, news & staged drafts
DELETE FROM public.portfolio;
DELETE FROM public.transactions;
DELETE FROM public.news_feed;
DELETE FROM public.staged_news;

-- 2. Clear out old test stocks
DELETE FROM public.stocks;

-- 3. Reset Game State to Round 1 Market Open
UPDATE public.game_state
SET current_round = 'Round 1 - Active',
    is_market_open = true,
    is_results_revealed = false,
    current_round_number = 1,
    round_ends_at = null,
    next_round_starts_at = null,
    updated_at = now()
WHERE id = 1;

-- 4. Reset all non-admin participant desks to initial PKR 100,000 capital
UPDATE public.teams
SET cash_balance = 100000,
    is_banned = false
WHERE is_admin = false;

-- 5. Insert Official 20 Competition Equities by Category
INSERT INTO public.stocks (ticker, name, sector, price, previous_price, change_percent, spark_data)
VALUES
  -- Category: Commercial Banks
  ('UBL', 'United Bank Limited', 'Commercial Banks', 400.00, 400.00, 0.00, '[400, 400, 400, 400, 400]'::jsonb),
  ('HBL', 'Habib Bank Limited', 'Commercial Banks', 280.00, 280.00, 0.00, '[280, 280, 280, 280, 280]'::jsonb),
  ('MCB', 'MCB Bank Limited', 'Commercial Banks', 220.00, 220.00, 0.00, '[220, 220, 220, 220, 220]'::jsonb),

  -- Category: Automobiles (Automobile Assemblers / Motors)
  ('INDU', 'Indus Motor Company', 'Automobiles', 1950.00, 1950.00, 0.00, '[1950, 1950, 1950, 1950, 1950]'::jsonb),
  ('HCAR', 'Honda Atlas Cars (Pakistan)', 'Automobiles', 240.00, 240.00, 0.00, '[240, 240, 240, 240, 240]'::jsonb),

  -- Category: Energy (Oil, Gas, Power & Refineries)
  ('KEL', 'K-Electric Limited', 'Energy', 7.00, 7.00, 0.00, '[7.0, 7.0, 7.0, 7.0, 7.0]'::jsonb),
  ('PSO', 'Pakistan State Oil', 'Energy', 320.00, 320.00, 0.00, '[320, 320, 320, 320, 320]'::jsonb),
  ('APL', 'Attock Petroleum Limited', 'Energy', 450.00, 450.00, 0.00, '[450, 450, 450, 450, 450]'::jsonb),
  ('PPL', 'Pakistan Petroleum Limited', 'Energy', 220.00, 220.00, 0.00, '[220, 220, 220, 220, 220]'::jsonb),
  ('PRL', 'Pakistan Refinery Limited', 'Energy', 85.00, 85.00, 0.00, '[85, 85, 85, 85, 85]'::jsonb),
  ('MARI', 'Mari Petroleum Company', 'Energy', 700.00, 700.00, 0.00, '[700, 700, 700, 700, 700]'::jsonb),

  -- Category: Pharmaceuticals & Healthcare
  ('ABOT', 'Abbott Laboratories (Pakistan)', 'Pharmaceuticals', 600.00, 600.00, 0.00, '[600, 600, 600, 600, 600]'::jsonb),
  ('GSK', 'GlaxoSmithKline Pakistan', 'Pharmaceuticals', 500.00, 500.00, 0.00, '[500, 500, 500, 500, 500]'::jsonb),
  ('HALEON', 'Haleon Pakistan Limited', 'Pharmaceuticals', 580.00, 580.00, 0.00, '[580, 580, 580, 580, 580]'::jsonb),

  -- Category: Cement & Building Materials
  ('DGKC', 'D.G. Khan Cement', 'Cement', 200.00, 200.00, 0.00, '[200, 200, 200, 200, 200]'::jsonb),
  ('MLCF', 'Maple Leaf Cement', 'Cement', 60.00, 60.00, 0.00, '[60, 60, 60, 60, 60]'::jsonb),
  ('KOHC', 'Kohat Cement Company', 'Cement', 160.00, 160.00, 0.00, '[160, 160, 160, 160, 160]'::jsonb),

  -- Category: Textiles & Consumer Goods
  ('ILP', 'Interloop Limited', 'Textiles', 20.00, 20.00, 0.00, '[20, 20, 20, 20, 20]'::jsonb),
  ('STYL', 'Stylers International', 'Textiles', 40.00, 40.00, 0.00, '[40, 40, 40, 40, 40]'::jsonb),
  ('SGF', 'Service Global Footwear', 'Textiles', 100.00, 100.00, 0.00, '[100, 100, 100, 100, 100]'::jsonb)
ON CONFLICT (ticker) DO UPDATE
SET price = EXCLUDED.price,
    previous_price = EXCLUDED.previous_price,
    change_percent = EXCLUDED.change_percent,
    name = EXCLUDED.name,
    sector = EXCLUDED.sector,
    spark_data = EXCLUDED.spark_data;
