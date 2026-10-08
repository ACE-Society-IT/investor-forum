-- =====================================================================
-- 📰 INVESTOR FORUM: DAY 02 CRISES & PER-STOCK SHOCKS (STAGED DRAFTS)
-- =====================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- Generated from: Invester Forum.pdf & Investors forum (3).pdf
-- =====================================================================

-- 1. Ensure table schema has all necessary columns
CREATE TABLE IF NOT EXISTS public.staged_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline text NOT NULL,
  body text,
  sector text NOT NULL DEFAULT 'General',
  day_category text NOT NULL DEFAULT 'Day 2',
  event_number integer DEFAULT 1,
  admin_label text DEFAULT NULL,
  target_scope text NOT NULL DEFAULT 'stocks',
  target_stock_ids jsonb DEFAULT '[]'::jsonb,
  impact_percent numeric NOT NULL DEFAULT 0,
  stock_shocks jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  published_at timestamp with time zone
);

ALTER TABLE IF EXISTS public.staged_news ADD COLUMN IF NOT EXISTS day_category text NOT NULL DEFAULT 'Day 2';
ALTER TABLE IF EXISTS public.staged_news ADD COLUMN IF NOT EXISTS event_number integer DEFAULT 1;
ALTER TABLE IF EXISTS public.staged_news ADD COLUMN IF NOT EXISTS admin_label text DEFAULT NULL;

-- 2. Clear existing Day 2 drafts to avoid duplicates
DELETE FROM public.staged_news 
WHERE day_category = 'Day 2' AND status = 'draft';

-- 3. Populate all 5 Day 02 Crises with their exact per-stock shocks
DO $$
DECLARE
  v_stock_id uuid;
  v_shocks jsonb;
  v_stock_ids jsonb;
BEGIN

  -- -------------------------------------------------------------------
  -- Day 2 • Crisis 1: Pakistan Turns Towards Western Trade Partners
  -- -------------------------------------------------------------------
  v_shocks := '{}'::jsonb;
  v_stock_ids := '[]'::jsonb;

  -- STYL: 30 -> 35 (+16.67%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'STYL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(16.67::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- ILP: 20 -> 22 (+10.00%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'ILP';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(10.00::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- UBL: 410 -> 490 (+19.51%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'UBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(19.51::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- HBL: 270 -> 290 (+7.41%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(7.41::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- KOHC: 160 -> 250 (+56.25%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'KOHC';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(56.25::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- DGKC: 245 -> 220 (-10.20%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'DGKC';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-10.20::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- HCAR: 280 -> 330 (+17.86%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HCAR';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(17.86::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- INDU: 1900 -> 1950 (+2.63%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'INDU';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(2.63::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- PRL: 85 -> 170 (+100.00%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PRL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(100.00::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- ABOT: 650 -> 680 (+4.62%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'ABOT';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(4.62::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  INSERT INTO public.staged_news (
    headline, body, sector, day_category, event_number, admin_label, 
    target_scope, target_stock_ids, impact_percent, stock_shocks, status
  ) VALUES (
    'Pakistan Turns Towards Western Trade Partners',
    'Amid an overall decline in the country''s economic condition, the PM led a delegation to Britain to sign a trade agreement with Britain and the USA. The agreement would result in investment flowing into Pakistan''s infrastructure and renewable and non-renewable energy sectors, along with increased exports of Pakistani textiles and medical and surgical instruments. However, Bloomberg suggested that Pakistan-China relations could worsen following these developments, further reducing the prospects of Pakistan joining BRICS.',
    'Textiles',
    'Day 2',
    1,
    'Day 2 • Event 1: Western Bilateral Trade Agreements',
    'stocks',
    v_stock_ids,
    22.48,
    v_shocks,
    'draft'
  );


  -- -------------------------------------------------------------------
  -- Day 2 • Crisis 2: PM Dismisses Reports of Worsening China Relations
  -- -------------------------------------------------------------------
  v_shocks := '{}'::jsonb;
  v_stock_ids := '[]'::jsonb;

  -- ILP: 22 -> 45 (+104.55%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'ILP';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(104.55::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- HCAR: 230 -> 300 (+30.43%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HCAR';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(30.43::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- INDU: 1950 -> 2050 (+5.13%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'INDU';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(5.13::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- PSO: 315 -> 280 (-11.11%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PSO';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-11.11::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- MARI: 700 -> 650 (-7.14%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'MARI';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-7.14::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- SGF: 100 -> 120 (+20.00%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'SGF';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(20.00::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- PRL: 170 -> 130 (-23.53%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PRL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-23.53::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- APL: 438 -> 400 (-8.68%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'APL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-8.68::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- MCB: 250 -> 215 (-14.00%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'MCB';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-14.00::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  INSERT INTO public.staged_news (
    headline, body, sector, day_category, event_number, admin_label, 
    target_scope, target_stock_ids, impact_percent, stock_shocks, status
  ) VALUES (
    'PM Dismisses Reports of Worsening China Relations',
    'The PM intervened and dismissed the rumours regarding worsening Pakistan-China relations as false. The government clarified that normal investment from China would continue despite the recent developments. The statement helped reassure that Pakistan''s economic cooperation with China would remain intact, despite the growing uncertainty surrounding the country''s international trade and investment relationships.',
    'Energy',
    'Day 2',
    2,
    'Day 2 • Event 2: Prime Minister Reassurances on Foreign Ties',
    'stocks',
    v_stock_ids,
    10.63,
    v_shocks,
    'draft'
  );


  -- -------------------------------------------------------------------
  -- Day 2 • Crisis 3: Provincial Elections Create Political Uncertainty
  -- -------------------------------------------------------------------
  v_shocks := '{}'::jsonb;
  v_stock_ids := '[]'::jsonb;

  -- UBL: 480 -> 420 (-12.50%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'UBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-12.50::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- MCB: 265 -> 330 (+24.53%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'MCB';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(24.53::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- ILP: 45 -> 40 (-11.11%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'ILP';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-11.11::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- SGF: 120 -> 100 (-16.67%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'SGF';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-16.67::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  INSERT INTO public.staged_news (
    headline, body, sector, day_category, event_number, admin_label, 
    target_scope, target_stock_ids, impact_percent, stock_shocks, status
  ) VALUES (
    'Provincial Elections Create Political Uncertainty',
    'Provincial elections took place across Pakistan, resulting in the previously elected party losing in its traditional stronghold. The unexpected outcome created uncertainty surrounding the country''s political direction and the stability of the newly elected government. Widespread rumours of electoral rigging further intensified the situation, raising concerns among the public and international allies. The resulting political uncertainty negatively affected Pakistan''s relations with its allies and contributed to a decline in the inflow of foreign investment.',
    'Commercial Banks',
    'Day 2',
    3,
    'Day 2 • Event 3: Provincial Election Results',
    'stocks',
    v_stock_ids,
    -3.94,
    v_shocks,
    'draft'
  );


  -- -------------------------------------------------------------------
  -- Day 2 • Crisis 4: New Government Announces Economic Measures
  -- -------------------------------------------------------------------
  v_shocks := '{}'::jsonb;
  v_stock_ids := '[]'::jsonb;

  -- HALEON: 600 -> 636 (+6.00%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HALEON';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(6.00::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- GSK: 750 -> 760 (+1.33%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'GSK';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(1.33::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- HBL: 290 -> 400 (+37.93%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(37.93::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- UBL: 420 -> 380 (-9.52%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'UBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-9.52::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- INDU: 2050 -> 2175 (+6.10%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'INDU';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(6.10::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- DGKC: 220 -> 300 (+36.36%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'DGKC';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(36.36::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- KOHC: 250 -> 200 (-20.00%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'KOHC';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-20.00::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- PSO: 280 -> 350 (+25.00%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PSO';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(25.00::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- APL: 400 -> 475 (+18.75%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'APL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(18.75::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  INSERT INTO public.staged_news (
    headline, body, sector, day_category, event_number, admin_label, 
    target_scope, target_stock_ids, impact_percent, stock_shocks, status
  ) VALUES (
    'New Government Announces Economic Measures',
    'The newly elected government announced plans to provide subsidies to the petrol industry while attracting new investment into the country. It also committed to improving overall infrastructure, with a focus on strengthening key areas of the economy. Increased efforts towards the development of the public sector were expected to support improvements across multiple sectors. These measures signalled the government''s intention to promote economic stability and encourage further investment in Pakistan.',
    'Cement',
    'Day 2',
    4,
    'Day 2 • Event 4: New Economic Subsidies & Infrastructure Drive',
    'stocks',
    v_stock_ids,
    11.33,
    v_shocks,
    'draft'
  );


  -- -------------------------------------------------------------------
  -- Day 2 • Crisis 5: Grand Finale Market Reforms & Multi-Sector Rebalancing
  -- -------------------------------------------------------------------
  v_shocks := '{}'::jsonb;
  v_stock_ids := '[]'::jsonb;

  -- INDU: 2150 -> 1700 (-20.93%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'INDU';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-20.93::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- HCAR: 300 -> 420 (+40.00%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HCAR';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(40.00::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- HBL: 380 -> 250 (-34.21%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-34.21::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- UBL: 400 -> 320 (-20.00%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'UBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-20.00::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- KEL: 7 -> 42 (+500.00%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'KEL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(500.00::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- PSO: 280 -> 400 (+42.86%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PSO';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(42.86::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- PPL: 200 -> 290 (+45.00%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PPL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(45.00::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- PRL: 130 -> 200 (+53.85%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PRL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(53.85::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- KOHC: 200 -> 170 (-15.00%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'KOHC';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-15.00::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- ILP: 40 -> 20 (-50.00%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'ILP';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-50.00::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- STYL: 35 -> 15 (-57.14%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'STYL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-57.14::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- GSK: 760 -> 755 (-0.66%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'GSK';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-0.66::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- HALEON: 600 -> 610 (+1.67%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HALEON';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(1.67::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- ABOT: 680 -> 650 (-4.41%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'ABOT';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-4.41::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- MCB: 330 -> 305 (-7.58%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'MCB';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-7.58::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- MARI: 650 -> 632 (-2.77%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'MARI';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-2.77::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- MLCF: 95 -> 77 (-18.95%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'MLCF';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-18.95::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- DGKC: 300 -> 270 (-10.00%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'DGKC';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-10.00::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  -- SGF: 100 -> 95 (-5.00%)
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'SGF';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-5.00::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;

  INSERT INTO public.staged_news (
    headline, body, sector, day_category, event_number, admin_label, 
    target_scope, target_stock_ids, impact_percent, stock_shocks, status
  ) VALUES (
    'Grand Finale Market Reforms & Multi-Sector Rebalancing',
    'In a decisive economic transition, comprehensive fiscal restructuring and policy adjustments triggered massive capital rotations across all major sectors. High volatility and sharp valuation realignments created unprecedented trading volume across energy, banking, automotive, cement, pharma, and textiles.',
    'Equities Market',
    'Day 2',
    5,
    'Day 2 • Event 5: Grand Finale Market Reforms & Multi-Sector Rebalancing',
    'stocks',
    v_stock_ids,
    22.99,
    v_shocks,
    'draft'
  );

END $$;

NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
