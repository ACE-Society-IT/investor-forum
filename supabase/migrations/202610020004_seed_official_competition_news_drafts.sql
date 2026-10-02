-- =====================================================================
-- 📰 INVESTOR FORUM: OFFICIAL COMPETITION NEWS DRAFTS (DAY 1 & DAY 2)
-- =====================================================================
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- Generated from: Invester Forum.pdf & Investors forum (3).pdf
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.staged_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline text NOT NULL,
  body text,
  sector text NOT NULL DEFAULT 'General',
  day_category text NOT NULL DEFAULT 'Day 1',
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
ALTER TABLE IF EXISTS public.staged_news ADD COLUMN IF NOT EXISTS day_category text NOT NULL DEFAULT 'Day 1';
ALTER TABLE IF EXISTS public.staged_news ADD COLUMN IF NOT EXISTS event_number integer DEFAULT 1;
ALTER TABLE IF EXISTS public.staged_news ADD COLUMN IF NOT EXISTS admin_label text DEFAULT NULL;

DELETE FROM public.staged_news WHERE status = 'draft';

DO $$
DECLARE
  v_stock_id uuid;
  v_shocks jsonb;
  v_stock_ids jsonb;
BEGIN

  -- Day 1 • Event 1: Pakistan-China EV Investment Agreement
  v_shocks := '{}'::jsonb;
  v_stock_ids := '[]'::jsonb;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'KEL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-14.29::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'ILP';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(35.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PSO';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(9.38::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'APL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-2.67::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'DGKC';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(2.5::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'INDU';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(2.56::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HCAR';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(5.42::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  INSERT INTO public.staged_news (headline, body, sector, day_category, event_number, admin_label, target_scope, target_stock_ids, impact_percent, stock_shocks, status)
  VALUES ('A New Chapter in Pakistan-China Economic Cooperation', 'A meeting took place between Pakistan and China''s EV industry, where it was agreed that China would make significant investments in Pakistan''s growing EV market. The development could strengthen economic cooperation between the two countries, with potential improvements to the CPEC agreement. There are also increasing chances of Pakistan becoming a part of BRICS, adding further significance to the country''s growing economic and diplomatic ties.', 'Automobiles', 'Day 1', 1, 'Day 1 • Event 1: Pakistan-China EV Investment Agreement', 'stocks', v_stock_ids, 5.41, v_shocks, 'draft');

  -- Day 1 • Event 2: Domestic Fuel Hike & Industrial Disruption
  v_shocks := '{}'::jsonb;
  v_stock_ids := '[]'::jsonb;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PSO';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-14.29::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PPL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-9.09::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'ABOT';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(8.33::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'GSK';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(2.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'STYL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-37.5::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  INSERT INTO public.staged_news (headline, body, sector, day_category, event_number, admin_label, target_scope, target_stock_ids, impact_percent, stock_shocks, status)
  VALUES ('Rising Global Oil Prices Trigger Domestic Economic Unrest', 'Due to increasing global oil prices, the Pakistani government raised domestic oil prices despite widespread public opposition. The decision placed further pressure on consumers and businesses, contributing to growing frustration across the country. This led to a series of widespread riots, with the situation escalating further following the death of the owner of Stylers. The incident added to the uncertainty surrounding the country''s economic and social conditions.', 'Energy', 'Day 1', 2, 'Day 1 • Event 2: Domestic Fuel Hike & Industrial Disruption', 'stocks', v_stock_ids, -10.11, v_shocks, 'draft');

  -- Day 1 • Event 3: Gul Plaza Incident & Banking Impact
  v_shocks := '{}'::jsonb;
  v_stock_ids := '[]'::jsonb;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PSO';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(5.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'DGKC';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(17.07::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'UBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(0.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'GSK';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(0.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(21.43::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  INSERT INTO public.staged_news (headline, body, sector, day_category, event_number, admin_label, target_scope, target_stock_ids, impact_percent, stock_shocks, status)
  VALUES ('Gul Plaza Commercial Hub Destroyed Amid Widespread City Riots', 'The riots continued to spread throughout the city, intensifying unrest and disruption across several areas. Amid the ongoing situation, a fire broke out at Gul Plaza, leaving the entire building in ruins. The incident caused major losses for the traders and businesses operating within the plaza, further worsening the economic impact of the unrest.', 'Commercial Banks', 'Day 1', 3, 'Day 1 • Event 3: Gul Plaza Incident & Banking Impact', 'stocks', v_stock_ids, 8.7, v_shocks, 'draft');

  -- Day 1 • Event 4: Government Relief & Infrastructure Subsidies
  v_shocks := '{}'::jsonb;
  v_stock_ids := '[]'::jsonb;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'ILP';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(29.63::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'STYL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(20.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'MCB';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(5.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'DGKC';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(2.08::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'MLCF';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(58.33::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  INSERT INTO public.staged_news (headline, body, sector, day_category, event_number, admin_label, target_scope, target_stock_ids, impact_percent, stock_shocks, status)
  VALUES ('Government Announces Subsidies & Infrastructure Package for Affected Traders', 'A meeting was held between Pakistan''s government and the Trade Union, where an agreement was finalised to support traders adversely affected by the riots, particularly those affected by the Gul Plaza incident. Under the agreement, the government would assist by constructing new infrastructure while also promising to reduce taxes on petrol. These measures hinted at potential improvements in economic stability and support for the affected business community.', 'Cement', 'Day 1', 4, 'Day 1 • Event 4: Government Relief & Infrastructure Subsidies', 'stocks', v_stock_ids, 23.01, v_shocks, 'draft');

  -- Day 1 • Event 5: Geopolitical Tensions & Market Shocks
  v_shocks := '{}'::jsonb;
  v_stock_ids := '[]'::jsonb;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'INDU';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-5.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HCAR';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(20.17::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HALEON';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(3.45::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'GSK';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(15.38::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-20.59::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'UBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-4.65::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'MCB';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(8.23::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'ILP';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-42.86::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  INSERT INTO public.staged_news (headline, body, sector, day_category, event_number, admin_label, target_scope, target_stock_ids, impact_percent, stock_shocks, status)
  VALUES ('Attack on Foreign Delegation Raises Geopolitical Tensions & Market Uncertainty', 'A delegation arriving from China to Pakistan for further talks concerning the agreement was attacked in a bomb blast. The incident resulted in the deaths of five Chinese delegates along with two Pakistani officials. The attack created further uncertainty surrounding the ongoing discussions between Pakistan and China and raised concerns over the future of their economic cooperation.', 'Pharmaceuticals', 'Day 1', 5, 'Day 1 • Event 5: Geopolitical Tensions & Market Shocks', 'stocks', v_stock_ids, -3.23, v_shocks, 'draft');

  -- Day 2 • Event 1: Western Bilateral Trade Agreements
  v_shocks := '{}'::jsonb;
  v_stock_ids := '[]'::jsonb;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'STYL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(16.67::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'ILP';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(10.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'UBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(19.51::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(7.41::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'KOHC';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(56.25::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'DGKC';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-10.2::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HCAR';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(17.86::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'INDU';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(2.63::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PRL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(100.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'ABOT';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(4.62::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  INSERT INTO public.staged_news (headline, body, sector, day_category, event_number, admin_label, target_scope, target_stock_ids, impact_percent, stock_shocks, status)
  VALUES ('Pakistan Signs Major Trade & Investment Agreement with UK and USA', 'Amid an overall decline in the country''s economic condition, the PM led a delegation to Britain to sign a trade agreement with Britain and the USA. The agreement would result in investment flowing into Pakistan''s infrastructure and renewable and non-renewable energy sectors, along with increased exports of Pakistani textiles and medical and surgical instruments. However, Bloomberg suggested that Pakistan-China relations could worsen following these developments, further reducing the prospects of Pakistan joining BRICS.', 'Textiles', 'Day 2', 1, 'Day 2 • Event 1: Western Bilateral Trade Agreements', 'stocks', v_stock_ids, 22.48, v_shocks, 'draft');

  -- Day 2 • Event 2: Prime Minister Reassurances on Foreign Ties
  v_shocks := '{}'::jsonb;
  v_stock_ids := '[]'::jsonb;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'ILP';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(104.55::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HCAR';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(30.43::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'INDU';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(5.13::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PSO';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-11.11::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'MARI';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-7.14::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'SGF';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(20.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PRL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-23.53::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'APL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-8.68::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'MCB';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-14.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  INSERT INTO public.staged_news (headline, body, sector, day_category, event_number, admin_label, target_scope, target_stock_ids, impact_percent, stock_shocks, status)
  VALUES ('Prime Minister Dismisses Rumours of Strained Pakistan-China Relations', 'The PM intervened and dismissed the rumours regarding worsening Pakistan-China relations as false. The government clarified that normal investment from China would continue despite the recent developments. The statement helped reassure that Pakistan''s economic cooperation with China would remain intact, despite the growing uncertainty surrounding the country''s international trade and investment relationships.', 'Energy', 'Day 2', 2, 'Day 2 • Event 2: Prime Minister Reassurances on Foreign Ties', 'stocks', v_stock_ids, 10.63, v_shocks, 'draft');

  -- Day 2 • Event 3: Provincial Election Results
  v_shocks := '{}'::jsonb;
  v_stock_ids := '[]'::jsonb;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'UBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-12.5::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'MCB';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(24.53::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'ILP';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-11.11::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'SGF';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-16.67::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  INSERT INTO public.staged_news (headline, body, sector, day_category, event_number, admin_label, target_scope, target_stock_ids, impact_percent, stock_shocks, status)
  VALUES ('Provincial Election Results Trigger Political Uncertainty and Market Fluctuations', 'Provincial elections took place across Pakistan, resulting in the previously elected party losing in its traditional stronghold. The unexpected outcome created uncertainty surrounding the country''s political direction and the stability of the newly elected government. Widespread rumours of electoral rigging further intensified the situation, raising concerns among the public and international allies. The resulting political uncertainty negatively affected Pakistan''s relations with its allies and contributed to a decline in the inflow of foreign investment.', 'Commercial Banks', 'Day 2', 3, 'Day 2 • Event 3: Provincial Election Results', 'stocks', v_stock_ids, -3.94, v_shocks, 'draft');

  -- Day 2 • Event 4: New Economic Subsidies & Infrastructure Drive
  v_shocks := '{}'::jsonb;
  v_stock_ids := '[]'::jsonb;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HALEON';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(6.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'GSK';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(1.33::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(37.93::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'UBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-9.52::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'INDU';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(6.1::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'DGKC';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(36.36::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'KOHC';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-20.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PSO';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(25.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'APL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(18.75::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  INSERT INTO public.staged_news (headline, body, sector, day_category, event_number, admin_label, target_scope, target_stock_ids, impact_percent, stock_shocks, status)
  VALUES ('New Government Unveils Fuel Subsidies and Nationwide Infrastructure Plan', 'The newly elected government announced plans to provide subsidies to the petrol industry while attracting new investment into the country. It also committed to improving overall infrastructure, with a focus on strengthening key areas of the economy. Increased efforts towards the development of the public sector were expected to support improvements across multiple sectors. These measures signalled the government''s intention to promote economic stability and encourage further investment in Pakistan.', 'Cement', 'Day 2', 4, 'Day 2 • Event 4: New Economic Subsidies & Infrastructure Drive', 'stocks', v_stock_ids, 11.33, v_shocks, 'draft');

  -- Day 2 • Event 5: Grand Finale Market Reforms & Multi-Sector Rebalancing
  v_shocks := '{}'::jsonb;
  v_stock_ids := '[]'::jsonb;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'INDU';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-20.93::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HCAR';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(40.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-34.21::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'UBL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-20.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'KEL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(500.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PSO';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(42.86::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PPL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(45.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'PRL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(53.85::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'KOHC';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-15.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'ILP';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-50.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'STYL';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-57.14::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'GSK';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-0.66::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'HALEON';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(1.67::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'ABOT';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-4.41::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'MCB';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-7.58::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'MARI';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-2.77::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'MLCF';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-18.95::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'DGKC';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-10.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = 'SGF';
  IF v_stock_id IS NOT NULL THEN
    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb(-5.0::numeric));
    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);
  END IF;
  INSERT INTO public.staged_news (headline, body, sector, day_category, event_number, admin_label, target_scope, target_stock_ids, impact_percent, stock_shocks, status)
  VALUES ('Comprehensive Market Reforms Trigger Multi-Sector Capital Rotation', 'In a decisive economic transition, comprehensive fiscal restructuring and policy adjustments triggered massive capital rotations across all major sectors. High volatility and sharp valuation realignments created unprecedented trading volume across energy, banking, automotive, cement, pharma, and textiles.', 'Energy', 'Day 2', 5, 'Day 2 • Event 5: Grand Finale Market Reforms & Multi-Sector Rebalancing', 'stocks', v_stock_ids, 22.99, v_shocks, 'draft');

END $$;

NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';