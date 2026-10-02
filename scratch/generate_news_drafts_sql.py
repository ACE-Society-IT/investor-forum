import json

drafts_data = [
    # --- DAY 1 ---
    {
        "id": "draft-day1-news1",
        "day_category": "Day 1",
        "event_number": 1,
        "admin_label": "Day 1 • Event 1: Pakistan-China EV Investment Agreement",
        "headline": "A New Chapter in Pakistan-China Economic Cooperation",
        "body": "A meeting took place between Pakistan and China's EV industry, where it was agreed that China would make significant investments in Pakistan's growing EV market. The development could strengthen economic cooperation between the two countries, with potential improvements to the CPEC agreement. There are also increasing chances of Pakistan becoming a part of BRICS, adding further significance to the country's growing economic and diplomatic ties.",
        "sector": "Automobiles",
        "stock_shocks_by_ticker": {
            "KEL": -14.29,
            "ILP": 35.00,
            "PSO": 9.38,
            "APL": -2.67,
            "DGKC": 2.50,
            "INDU": 2.56,
            "HCAR": 5.42
        }
    },
    {
        "id": "draft-day1-news2",
        "day_category": "Day 1",
        "event_number": 2,
        "admin_label": "Day 1 • Event 2: Domestic Fuel Hike & Industrial Disruption",
        "headline": "Rising Global Oil Prices Trigger Domestic Economic Unrest",
        "body": "Due to increasing global oil prices, the Pakistani government raised domestic oil prices despite widespread public opposition. The decision placed further pressure on consumers and businesses, contributing to growing frustration across the country. This led to a series of widespread riots, with the situation escalating further following the death of the owner of Stylers. The incident added to the uncertainty surrounding the country's economic and social conditions.",
        "sector": "Energy",
        "stock_shocks_by_ticker": {
            "PSO": -14.29,
            "PPL": -9.09,
            "ABOT": 8.33,
            "GSK": 2.00,
            "STYL": -37.50
        }
    },
    {
        "id": "draft-day1-news3",
        "day_category": "Day 1",
        "event_number": 3,
        "admin_label": "Day 1 • Event 3: Gul Plaza Incident & Banking Impact",
        "headline": "Gul Plaza Commercial Hub Destroyed Amid Widespread City Riots",
        "body": "The riots continued to spread throughout the city, intensifying unrest and disruption across several areas. Amid the ongoing situation, a fire broke out at Gul Plaza, leaving the entire building in ruins. The incident caused major losses for the traders and businesses operating within the plaza, further worsening the economic impact of the unrest.",
        "sector": "Commercial Banks",
        "stock_shocks_by_ticker": {
            "PSO": 5.00,
            "DGKC": 17.07,
            "UBL": 0.00,
            "GSK": 0.00,
            "HBL": 21.43
        }
    },
    {
        "id": "draft-day1-news4",
        "day_category": "Day 1",
        "event_number": 4,
        "admin_label": "Day 1 • Event 4: Government Relief & Infrastructure Subsidies",
        "headline": "Government Announces Subsidies & Infrastructure Package for Affected Traders",
        "body": "A meeting was held between Pakistan's government and the Trade Union, where an agreement was finalised to support traders adversely affected by the riots, particularly those affected by the Gul Plaza incident. Under the agreement, the government would assist by constructing new infrastructure while also promising to reduce taxes on petrol. These measures hinted at potential improvements in economic stability and support for the affected business community.",
        "sector": "Cement",
        "stock_shocks_by_ticker": {
            "ILP": 29.63,
            "STYL": 20.00,
            "MCB": 5.00,
            "DGKC": 2.08,
            "MLCF": 58.33
        }
    },
    {
        "id": "draft-day1-news5",
        "day_category": "Day 1",
        "event_number": 5,
        "admin_label": "Day 1 • Event 5: Geopolitical Tensions & Market Shocks",
        "headline": "Attack on Foreign Delegation Raises Geopolitical Tensions & Market Uncertainty",
        "body": "A delegation arriving from China to Pakistan for further talks concerning the agreement was attacked in a bomb blast. The incident resulted in the deaths of five Chinese delegates along with two Pakistani officials. The attack created further uncertainty surrounding the ongoing discussions between Pakistan and China and raised concerns over the future of their economic cooperation.",
        "sector": "Pharmaceuticals",
        "stock_shocks_by_ticker": {
            "INDU": -5.00,
            "HCAR": 20.17,
            "HALEON": 3.45,
            "GSK": 15.38,
            "HBL": -20.59,
            "UBL": -4.65,
            "MCB": 8.23,
            "ILP": -42.86
        }
    },

    # --- DAY 2 ---
    {
        "id": "draft-day2-news1",
        "day_category": "Day 2",
        "event_number": 1,
        "admin_label": "Day 2 • Event 1: Western Bilateral Trade Agreements",
        "headline": "Pakistan Signs Major Trade & Investment Agreement with UK and USA",
        "body": "Amid an overall decline in the country's economic condition, the PM led a delegation to Britain to sign a trade agreement with Britain and the USA. The agreement would result in investment flowing into Pakistan's infrastructure and renewable and non-renewable energy sectors, along with increased exports of Pakistani textiles and medical and surgical instruments. However, Bloomberg suggested that Pakistan-China relations could worsen following these developments, further reducing the prospects of Pakistan joining BRICS.",
        "sector": "Textiles",
        "stock_shocks_by_ticker": {
            "STYL": 16.67,
            "ILP": 10.00,
            "UBL": 19.51,
            "HBL": 7.41,
            "KOHC": 56.25,
            "DGKC": -10.20,
            "HCAR": 17.86,
            "INDU": 2.63,
            "PRL": 100.00,
            "ABOT": 4.62
        }
    },
    {
        "id": "draft-day2-news2",
        "day_category": "Day 2",
        "event_number": 2,
        "admin_label": "Day 2 • Event 2: Prime Minister Reassurances on Foreign Ties",
        "headline": "Prime Minister Dismisses Rumours of Strained Pakistan-China Relations",
        "body": "The PM intervened and dismissed the rumours regarding worsening Pakistan-China relations as false. The government clarified that normal investment from China would continue despite the recent developments. The statement helped reassure that Pakistan's economic cooperation with China would remain intact, despite the growing uncertainty surrounding the country's international trade and investment relationships.",
        "sector": "Energy",
        "stock_shocks_by_ticker": {
            "ILP": 104.55,
            "HCAR": 30.43,
            "INDU": 5.13,
            "PSO": -11.11,
            "MARI": -7.14,
            "SGF": 20.00,
            "PRL": -23.53,
            "APL": -8.68,
            "MCB": -14.00
        }
    },
    {
        "id": "draft-day2-news3",
        "day_category": "Day 2",
        "event_number": 3,
        "admin_label": "Day 2 • Event 3: Provincial Election Results",
        "headline": "Provincial Election Results Trigger Political Uncertainty and Market Fluctuations",
        "body": "Provincial elections took place across Pakistan, resulting in the previously elected party losing in its traditional stronghold. The unexpected outcome created uncertainty surrounding the country's political direction and the stability of the newly elected government. Widespread rumours of electoral rigging further intensified the situation, raising concerns among the public and international allies. The resulting political uncertainty negatively affected Pakistan's relations with its allies and contributed to a decline in the inflow of foreign investment.",
        "sector": "Commercial Banks",
        "stock_shocks_by_ticker": {
            "UBL": -12.50,
            "MCB": 24.53,
            "ILP": -11.11,
            "SGF": -16.67
        }
    },
    {
        "id": "draft-day2-news4",
        "day_category": "Day 2",
        "event_number": 4,
        "admin_label": "Day 2 • Event 4: New Economic Subsidies & Infrastructure Drive",
        "headline": "New Government Unveils Fuel Subsidies and Nationwide Infrastructure Plan",
        "body": "The newly elected government announced plans to provide subsidies to the petrol industry while attracting new investment into the country. It also committed to improving overall infrastructure, with a focus on strengthening key areas of the economy. Increased efforts towards the development of the public sector were expected to support improvements across multiple sectors. These measures signalled the government's intention to promote economic stability and encourage further investment in Pakistan.",
        "sector": "Cement",
        "stock_shocks_by_ticker": {
            "HALEON": 6.00,
            "GSK": 1.33,
            "HBL": 37.93,
            "UBL": -9.52,
            "INDU": 6.10,
            "DGKC": 36.36,
            "KOHC": -20.00,
            "PSO": 25.00,
            "APL": 18.75
        }
    },
    {
        "id": "draft-day2-news5",
        "day_category": "Day 2",
        "event_number": 5,
        "admin_label": "Day 2 • Event 5: Grand Finale Market Reforms & Multi-Sector Rebalancing",
        "headline": "Comprehensive Market Reforms Trigger Multi-Sector Capital Rotation",
        "body": "In a decisive economic transition, comprehensive fiscal restructuring and policy adjustments triggered massive capital rotations across all major sectors. High volatility and sharp valuation realignments created unprecedented trading volume across energy, banking, automotive, cement, pharma, and textiles.",
        "sector": "Energy",
        "stock_shocks_by_ticker": {
            "INDU": -20.93,
            "HCAR": 40.00,
            "HBL": -34.21,
            "UBL": -20.00,
            "KEL": 500.00,
            "PSO": 42.86,
            "PPL": 45.00,
            "PRL": 53.85,
            "KOHC": -15.00,
            "ILP": -50.00,
            "STYL": -57.14,
            "GSK": -0.66,
            "HALEON": 1.67,
            "ABOT": -4.41,
            "MCB": -7.58,
            "MARI": -2.77,
            "MLCF": -18.95,
            "DGKC": -10.00,
            "SGF": -5.00
        }
    }
]

# Generate SQL script
sql_lines = [
    "-- =====================================================================",
    "-- 📰 INVESTOR FORUM: OFFICIAL COMPETITION NEWS DRAFTS (DAY 1 & DAY 2)",
    "-- =====================================================================",
    "-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql",
    "-- Generated from: Invester Forum.pdf & Investors forum (3).pdf",
    "-- =====================================================================\n",
    "CREATE TABLE IF NOT EXISTS public.staged_news (",
    "  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),",
    "  headline text NOT NULL,",
    "  body text,",
    "  sector text NOT NULL DEFAULT 'General',",
    "  day_category text NOT NULL DEFAULT 'Day 1',",
    "  event_number integer DEFAULT 1,",
    "  admin_label text DEFAULT NULL,",
    "  target_scope text NOT NULL DEFAULT 'stocks',",
    "  target_stock_ids jsonb DEFAULT '[]'::jsonb,",
    "  impact_percent numeric NOT NULL DEFAULT 0,",
    "  stock_shocks jsonb DEFAULT '{}'::jsonb,",
    "  status text NOT NULL DEFAULT 'draft',",
    "  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,",
    "  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,",
    "  published_at timestamp with time zone",
    ");",
    "ALTER TABLE IF EXISTS public.staged_news ADD COLUMN IF NOT EXISTS day_category text NOT NULL DEFAULT 'Day 1';",
    "ALTER TABLE IF EXISTS public.staged_news ADD COLUMN IF NOT EXISTS event_number integer DEFAULT 1;",
    "ALTER TABLE IF EXISTS public.staged_news ADD COLUMN IF NOT EXISTS admin_label text DEFAULT NULL;\n",
    "DELETE FROM public.staged_news WHERE status = 'draft';\n",
    "DO $$",
    "DECLARE",
    "  v_stock_id uuid;",
    "  v_shocks jsonb;",
    "  v_stock_ids jsonb;",
    "BEGIN"
]

for d in drafts_data:
    esc_hl = d["headline"].replace("'", "''")
    esc_body = d["body"].replace("'", "''")
    esc_sec = d["sector"].replace("'", "''")
    esc_day = d["day_category"].replace("'", "''")
    esc_lbl = d["admin_label"].replace("'", "''")
    ev_num = d["event_number"]
    
    sql_lines.append(f"\n  -- {esc_lbl}")
    sql_lines.append("  v_shocks := '{}'::jsonb;")
    sql_lines.append("  v_stock_ids := '[]'::jsonb;")
    
    avg_impact = round(sum(d["stock_shocks_by_ticker"].values()) / max(1, len(d["stock_shocks_by_ticker"])), 2)
    
    for ticker, pct in d["stock_shocks_by_ticker"].items():
        sql_lines.append(f"  SELECT id INTO v_stock_id FROM public.stocks WHERE ticker = '{ticker}';")
        sql_lines.append(f"  IF v_stock_id IS NOT NULL THEN")
        sql_lines.append(f"    v_shocks := jsonb_set(v_shocks, ARRAY[v_stock_id::text], to_jsonb({pct}::numeric));")
        sql_lines.append(f"    v_stock_ids := v_stock_ids || to_jsonb(v_stock_id::text);")
        sql_lines.append(f"  END IF;")
        
    sql_lines.append(f"  INSERT INTO public.staged_news (headline, body, sector, day_category, event_number, admin_label, target_scope, target_stock_ids, impact_percent, stock_shocks, status)")
    sql_lines.append(f"  VALUES ('{esc_hl}', '{esc_body}', '{esc_sec}', '{esc_day}', {ev_num}, '{esc_lbl}', 'stocks', v_stock_ids, {avg_impact}, v_shocks, 'draft');")

sql_lines.append("\nEND $$;\n")
sql_lines.append("NOTIFY pgrst, 'reload config';")
sql_lines.append("NOTIFY pgrst, 'reload schema';")

with open(r"c:\Users\kingm\Downloads\Projects\Investor Forum\supabase\migrations\202610020004_seed_official_competition_news_drafts.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

with open(r"c:\Users\kingm\Downloads\Projects\Investor Forum\scratch\official_drafts_data.json", "w", encoding="utf-8") as f:
    json.dump(drafts_data, f, indent=2)

print("Generated official news drafts migration SQL and JSON data!")
