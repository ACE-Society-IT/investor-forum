import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const OFFICIAL_COMPETITION_DRAFTS = [
  // --- DAY 1 ---
  {
    id: "draft-day1-news1",
    headline: "A New Chapter in Pakistan-China Economic Cooperation",
    admin_label: "Day 1 • Event 1: Pakistan-China EV Investment Agreement",
    body: "A meeting took place between Pakistan and China's EV industry, where it was agreed that China would make significant investments in Pakistan's growing EV market. The development could strengthen economic cooperation between the two countries, with potential improvements to the CPEC agreement. There are also increasing chances of Pakistan becoming a part of BRICS, adding further significance to the country's growing economic and diplomatic ties.",
    sector: "Automobiles",
    day_category: "Day 1",
    event_number: 1,
    target_scope: "stocks",
    target_stock_tickers: ["KEL", "ILP", "PSO", "APL", "DGKC", "INDU", "HCAR"],
    stock_shocks_by_ticker: {
      KEL: -14.29,
      ILP: 35.0,
      PSO: 9.38,
      APL: -2.67,
      DGKC: 2.5,
      INDU: 2.56,
      HCAR: 5.42
    },
    impact_percent: 5.4,
    status: "draft",
    created_at: new Date("2026-10-02T08:00:00Z").toISOString()
  },
  {
    id: "draft-day1-news2",
    headline: "Rising Global Oil Prices Trigger Domestic Economic Unrest",
    admin_label: "Day 1 • Event 2: Domestic Fuel Hike & Industrial Disruption",
    body: "Due to increasing global oil prices, the Pakistani government raised domestic oil prices despite widespread public opposition. The decision placed further pressure on consumers and businesses, contributing to growing frustration across the country. This led to a series of widespread riots, with the situation escalating further following the death of the owner of Stylers. The incident added to the uncertainty surrounding the country's economic and social conditions.",
    sector: "Energy",
    day_category: "Day 1",
    event_number: 2,
    target_scope: "stocks",
    target_stock_tickers: ["PSO", "PPL", "ABOT", "GSK", "STYL"],
    stock_shocks_by_ticker: {
      PSO: -14.29,
      PPL: -9.09,
      ABOT: 8.33,
      GSK: 2.0,
      STYL: -37.5
    },
    impact_percent: -10.1,
    status: "draft",
    created_at: new Date("2026-10-02T08:15:00Z").toISOString()
  },
  {
    id: "draft-day1-news3",
    headline: "Gul Plaza Commercial Hub Destroyed Amid Widespread City Riots",
    admin_label: "Day 1 • Event 3: Gul Plaza Incident & Banking Impact",
    body: "The riots continued to spread throughout the city, intensifying unrest and disruption across several areas. Amid the ongoing situation, a fire broke out at Gul Plaza, leaving the entire building in ruins. The incident caused major losses for the traders and businesses operating within the plaza, further worsening the economic impact of the unrest.",
    sector: "Commercial Banks",
    day_category: "Day 1",
    event_number: 3,
    target_scope: "stocks",
    target_stock_tickers: ["PSO", "DGKC", "UBL", "GSK", "HBL"],
    stock_shocks_by_ticker: {
      PSO: 5.0,
      DGKC: 17.07,
      UBL: 0.0,
      GSK: 0.0,
      HBL: 21.43
    },
    impact_percent: 8.7,
    status: "draft",
    created_at: new Date("2026-10-02T08:30:00Z").toISOString()
  },
  {
    id: "draft-day1-news4",
    headline: "Government Announces Subsidies & Infrastructure Package for Affected Traders",
    admin_label: "Day 1 • Event 4: Government Relief & Infrastructure Subsidies",
    body: "A meeting was held between Pakistan's government and the Trade Union, where an agreement was finalised to support traders adversely affected by the riots, particularly those affected by the Gul Plaza incident. Under the agreement, the government would assist by constructing new infrastructure while also promising to reduce taxes on petrol. These measures hinted at potential improvements in economic stability and support for the affected business community.",
    sector: "Cement",
    day_category: "Day 1",
    event_number: 4,
    target_scope: "stocks",
    target_stock_tickers: ["ILP", "STYL", "MCB", "DGKC", "MLCF"],
    stock_shocks_by_ticker: {
      ILP: 29.63,
      STYL: 20.0,
      MCB: 5.0,
      DGKC: 2.08,
      MLCF: 58.33
    },
    impact_percent: 23.0,
    status: "draft",
    created_at: new Date("2026-10-02T08:45:00Z").toISOString()
  },
  {
    id: "draft-day1-news5",
    headline: "Attack on Foreign Delegation Raises Geopolitical Tensions & Market Uncertainty",
    admin_label: "Day 1 • Event 5: Geopolitical Tensions & Market Shocks",
    body: "A delegation arriving from China to Pakistan for further talks concerning the agreement was attacked in a bomb blast. The incident resulted in the deaths of five Chinese delegates along with two Pakistani officials. The attack created further uncertainty surrounding the ongoing discussions between Pakistan and China and raised concerns over the future of their economic cooperation.",
    sector: "Pharmaceuticals",
    day_category: "Day 1",
    event_number: 5,
    target_scope: "stocks",
    target_stock_tickers: ["INDU", "HCAR", "HALEON", "GSK", "HBL", "UBL", "MCB", "ILP"],
    stock_shocks_by_ticker: {
      INDU: -5.0,
      HCAR: 20.17,
      HALEON: 3.45,
      GSK: 15.38,
      HBL: -20.59,
      UBL: -4.65,
      MCB: 8.23,
      ILP: -42.86
    },
    impact_percent: -3.2,
    status: "draft",
    created_at: new Date("2026-10-02T09:00:00Z").toISOString()
  },

  // --- DAY 2 ---
  {
    id: "draft-day2-news1",
    headline: "Pakistan Signs Major Trade & Investment Agreement with UK and USA",
    admin_label: "Day 2 • Event 1: Western Bilateral Trade Agreements",
    body: "Amid an overall decline in the country's economic condition, the PM led a delegation to Britain to sign a trade agreement with Britain and the USA. The agreement would result in investment flowing into Pakistan's infrastructure and renewable and non-renewable energy sectors, along with increased exports of Pakistani textiles and medical and surgical instruments. However, Bloomberg suggested that Pakistan-China relations could worsen following these developments, further reducing the prospects of Pakistan joining BRICS.",
    sector: "Textiles",
    day_category: "Day 2",
    event_number: 1,
    target_scope: "stocks",
    target_stock_tickers: ["STYL", "ILP", "UBL", "HBL", "KOHC", "DGKC", "HCAR", "INDU", "PRL", "ABOT"],
    stock_shocks_by_ticker: {
      STYL: 16.67,
      ILP: 10.0,
      UBL: 19.51,
      HBL: 7.41,
      KOHC: 56.25,
      DGKC: -10.2,
      HCAR: 17.86,
      INDU: 2.63,
      PRL: 100.0,
      ABOT: 4.62
    },
    impact_percent: 22.5,
    status: "draft",
    created_at: new Date("2026-10-02T09:15:00Z").toISOString()
  },
  {
    id: "draft-day2-news2",
    headline: "Prime Minister Dismisses Rumours of Strained Pakistan-China Relations",
    admin_label: "Day 2 • Event 2: Prime Minister Reassurances on Foreign Ties",
    body: "The PM intervened and dismissed the rumours regarding worsening Pakistan-China relations as false. The government clarified that normal investment from China would continue despite the recent developments. The statement helped reassure that Pakistan's economic cooperation with China would remain intact, despite the growing uncertainty surrounding the country's international trade and investment relationships.",
    sector: "Energy",
    day_category: "Day 2",
    event_number: 2,
    target_scope: "stocks",
    target_stock_tickers: ["ILP", "HCAR", "INDU", "PSO", "MARI", "SGF", "PRL", "APL", "MCB"],
    stock_shocks_by_ticker: {
      ILP: 104.55,
      HCAR: 30.43,
      INDU: 5.13,
      PSO: -11.11,
      MARI: -7.14,
      SGF: 20.0,
      PRL: -23.53,
      APL: -8.68,
      MCB: -14.0
    },
    impact_percent: 10.6,
    status: "draft",
    created_at: new Date("2026-10-02T09:30:00Z").toISOString()
  },
  {
    id: "draft-day2-news3",
    headline: "Provincial Election Results Trigger Political Uncertainty and Market Fluctuations",
    admin_label: "Day 2 • Event 3: Provincial Election Results",
    body: "Provincial elections took place across Pakistan, resulting in the previously elected party losing in its traditional stronghold. The unexpected outcome created uncertainty surrounding the country's political direction and the stability of the newly elected government. Widespread rumours of electoral rigging further intensified the situation, raising concerns among the public and international allies. The resulting political uncertainty negatively affected Pakistan's relations with its allies and contributed to a decline in the inflow of foreign investment.",
    sector: "Commercial Banks",
    day_category: "Day 2",
    event_number: 3,
    target_scope: "stocks",
    target_stock_tickers: ["UBL", "MCB", "ILP", "SGF"],
    stock_shocks_by_ticker: {
      UBL: -12.5,
      MCB: 24.53,
      ILP: -11.11,
      SGF: -16.67
    },
    impact_percent: -3.9,
    status: "draft",
    created_at: new Date("2026-10-02T09:45:00Z").toISOString()
  },
  {
    id: "draft-day2-news4",
    headline: "New Government Unveils Fuel Subsidies and Nationwide Infrastructure Plan",
    admin_label: "Day 2 • Event 4: New Economic Subsidies & Infrastructure Drive",
    body: "The newly elected government announced plans to provide subsidies to the petrol industry while attracting new investment into the country. It also committed to improving overall infrastructure, with a focus on strengthening key areas of the economy. Increased efforts towards the development of the public sector were expected to support improvements across multiple sectors. These measures signalled the government's intention to promote economic stability and encourage further investment in Pakistan.",
    sector: "Cement",
    day_category: "Day 2",
    event_number: 4,
    target_scope: "stocks",
    target_stock_tickers: ["HALEON", "GSK", "HBL", "UBL", "INDU", "DGKC", "KOHC", "PSO", "APL"],
    stock_shocks_by_ticker: {
      HALEON: 6.0,
      GSK: 1.33,
      HBL: 37.93,
      UBL: -9.52,
      INDU: 6.1,
      DGKC: 36.36,
      KOHC: -20.0,
      PSO: 25.0,
      APL: 18.75
    },
    impact_percent: 11.3,
    status: "draft",
    created_at: new Date("2026-10-02T10:00:00Z").toISOString()
  },
  {
    id: "draft-day2-news5",
    headline: "Comprehensive Market Reforms Trigger Multi-Sector Capital Rotation",
    admin_label: "Day 2 • Event 5: Grand Finale Market Reforms & Multi-Sector Rebalancing",
    body: "In a decisive economic transition, comprehensive fiscal restructuring and policy adjustments triggered massive capital rotations across all major sectors. High volatility and sharp valuation realignments created unprecedented trading volume across energy, banking, automotive, cement, pharma, and textiles.",
    sector: "Energy",
    day_category: "Day 2",
    event_number: 5,
    target_scope: "stocks",
    target_stock_tickers: ["INDU", "HCAR", "HBL", "UBL", "KEL", "PSO", "PPL", "PRL", "KOHC", "ILP", "STYL", "GSK", "HALEON", "ABOT", "MCB", "MARI", "MLCF", "DGKC", "SGF"],
    stock_shocks_by_ticker: {
      INDU: -20.93,
      HCAR: 40.0,
      HBL: -34.21,
      UBL: -20.0,
      KEL: 500.0,
      PSO: 42.86,
      PPL: 45.0,
      PRL: 53.85,
      KOHC: -15.0,
      ILP: -50.0,
      STYL: -57.14,
      GSK: -0.66,
      HALEON: 1.67,
      ABOT: -4.41,
      MCB: -7.58,
      MARI: -2.77,
      MLCF: -18.95,
      DGKC: -10.0,
      SGF: -5.0
    },
    impact_percent: 23.4,
    status: "draft",
    created_at: new Date("2026-10-02T10:15:00Z").toISOString()
  }
];

/**
 * GET /api/admin/news/drafts
 * Fetches all saved/staged draft news bulletins.
 */
export async function GET() {
  try {
    const { data: drafts, error } = await supabase
      .from("staged_news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !drafts || drafts.length === 0) {
      return NextResponse.json({
        success: true,
        drafts: OFFICIAL_COMPETITION_DRAFTS
      });
    }

    return NextResponse.json({
      success: true,
      drafts: drafts
    });
  } catch (err) {
    console.error("GET /api/admin/news/drafts error:", err);
    return NextResponse.json({
      success: true,
      drafts: OFFICIAL_COMPETITION_DRAFTS
    });
  }
}

/**
 * POST /api/admin/news/drafts
 * Creates and saves a draft/staged news bulletin with target stock shocks.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      headline,
      body: newsBody,
      sector,
      dayCategory,
      eventNumber,
      adminLabel,
      targetScope,
      targetStockIds,
      impactPercent,
      stockShocks
    } = body;

    if (!headline || !headline.trim()) {
      return NextResponse.json(
        { success: false, error: "Headline is required to save a draft." },
        { status: 400 }
      );
    }

    const payload = {
      headline: headline.trim(),
      body: (newsBody || "").trim(),
      sector: sector || "General",
      day_category: dayCategory || "Day 1",
      event_number: Number(eventNumber) || 1,
      admin_label: adminLabel || `${dayCategory || "Day 1"} • Custom News Draft`,
      target_scope: targetScope === "stocks" ? "stocks" : "sector",
      target_stock_ids: Array.isArray(targetStockIds) ? targetStockIds : [],
      impact_percent: Number(impactPercent) || 0,
      stock_shocks: typeof stockShocks === "object" && stockShocks !== null ? stockShocks : {},
      status: "draft",
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("staged_news")
      .insert([payload])
      .select()
      .single();

    if (error) {
      const fallbackPayload = { ...payload };
      delete fallbackPayload.day_category;
      delete fallbackPayload.event_number;
      delete fallbackPayload.admin_label;
      const { data: fbData, error: fbError } = await supabase
        .from("staged_news")
        .insert([fallbackPayload])
        .select()
        .single();
      if (fbError) throw fbError;
      return NextResponse.json({
        success: true,
        draft: { ...fbData, day_category: payload.day_category, event_number: payload.event_number, admin_label: payload.admin_label },
        message: "Draft catalyst successfully saved."
      });
    }

    return NextResponse.json({
      success: true,
      draft: data,
      message: "Draft catalyst successfully saved."
    });
  } catch (err) {
    console.error("POST /api/admin/news/drafts error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/news/drafts
 * Updates an existing draft news bulletin.
 */
export async function PUT(req) {
  try {
    const body = await req.json();
    const {
      id,
      headline,
      body: newsBody,
      sector,
      dayCategory,
      eventNumber,
      adminLabel,
      targetScope,
      targetStockIds,
      impactPercent,
      stockShocks,
      status
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Draft ID is required." },
        { status: 400 }
      );
    }

    const updates = {
      updated_at: new Date().toISOString()
    };

    if (headline !== undefined) updates.headline = headline.trim();
    if (newsBody !== undefined) updates.body = (newsBody || "").trim();
    if (sector !== undefined) updates.sector = sector;
    if (dayCategory !== undefined) updates.day_category = dayCategory;
    if (eventNumber !== undefined) updates.event_number = Number(eventNumber);
    if (adminLabel !== undefined) updates.admin_label = adminLabel;
    if (targetScope !== undefined) updates.target_scope = targetScope;
    if (targetStockIds !== undefined) updates.target_stock_ids = targetStockIds;
    if (impactPercent !== undefined) updates.impact_percent = Number(impactPercent) || 0;
    if (stockShocks !== undefined) updates.stock_shocks = stockShocks;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabase
      .from("staged_news")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      draft: data,
      message: "Draft updated successfully."
    });
  } catch (err) {
    console.error("PUT /api/admin/news/drafts error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/news/drafts
 * Permanently deletes a single draft or purges all drafts.
 */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all") === "true";

    if (all) {
      const { error } = await supabase
        .from("staged_news")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: "All staged drafts cleared."
      });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Draft ID is required." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("staged_news")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Draft permanently deleted."
    });
  } catch (err) {
    console.error("DELETE /api/admin/news/drafts error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
