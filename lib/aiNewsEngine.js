// lib/aiNewsEngine.js
// Intelligent AI News Catalyst & Impact Engine using Google Gemma-4-26b-a4b-it

const GOOGLE_API_KEY =
  process.env.GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
  "";
const MODEL_NAME = "gemma-4-26b-a4b-it";

/**
 * Algorithmic Fallback Catalyst Generator (Guarantees instant response if AI times out)
 */
function generateAlgorithmicNewsFallback({ targetSector, headline, body, stocks }) {
  const headlinesPool = {
    Technology: [
      {
        h: "REVOLUTIONARY QUANTUM COMPUTE BENCHMARK ACHIEVED",
        b: "A major enterprise breakthrough in superconducting quantum gates is accelerating neural network training speeds by 400%, triggering massive market-wide tech reallocations.",
        sentiment: "BULLISH",
        delta: 16.5
      },
      {
        h: "GLOBAL REGULATORS ANNOUNCE AI DATA PRIVACY MANDATE",
        b: "New compliance directives require strict algorithmic audits for enterprise cloud platforms, temporarily dampening short-term software expansion forecasts.",
        sentiment: "BEARISH",
        delta: -8.5
      }
    ],
    Pharmaceuticals: [
      {
        h: "FDA GRANTS EXPEDITED APPROVAL FOR NOVEL GENE THERAPY",
        b: "Phase 3 clinical trial data demonstrates a 92% efficacy rate in oncology treatments, prompting institutional price target upgrades across the biotech corridor.",
        sentiment: "BULLISH",
        delta: 22.0
      },
      {
        h: "KEY DRUG PATENT CHALLENGE FILED BY GENERIC CONSORTIUM",
        b: "Unexpected patent infringement review raises market uncertainty regarding long-term revenue exclusivity on flagship therapeutics.",
        sentiment: "BEARISH",
        delta: -12.5
      }
    ],
    Energy: [
      {
        h: "OPEC+ ANNOUNCES SURPRISE 2.5M BARREL PRODUCTION CUT",
        b: "Global crude and renewable energy reserve metrics spike sharply as geopolitical supply tightens ahead of peak seasonal consumption.",
        sentiment: "BULLISH",
        delta: 14.0
      },
      {
        h: "COMMODITY RESERVES SPIKE AMID UNPRECEDENTED INVENTORY SURPLUS",
        b: "Refining margins contract under elevated inventory overhang, putting short-term pressure on baseline upstream valuations.",
        sentiment: "BEARISH",
        delta: -9.0
      }
    ],
    "Consumer Goods": [
      {
        h: "RECORD E-COMMERCE SPENDING SURGE OUTPACES QUARTERLY ESTIMATES",
        b: "Consumer sentiment and direct-to-consumer order velocity reached historical highs, lifting retail inventory turnover across all categories.",
        sentiment: "BULLISH",
        delta: 11.5
      },
      {
        h: "SUPPLY CHAIN DISRUPTION IMPACTS RAW MATERIAL SHIPMENTS",
        b: "Port congestion and elevated freight tariffs lead to localized margin compression across consumer retail distributors.",
        sentiment: "BEARISH",
        delta: -6.5
      }
    ]
  };

  const pool = headlinesPool[targetSector] || headlinesPool.Technology;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  const finalHeadline = headline || picked.h;
  const finalBody = body || picked.b;
  const sentiment = picked.sentiment;
  const baseDelta = picked.delta;

  const stockImpacts = stocks.map((s) => {
    const isTargetSector = s.sector === targetSector;
    const factor = isTargetSector ? 1.0 : (Math.random() - 0.5) * 0.4;
    const shift = Number((baseDelta * factor).toFixed(2));
    return {
      ticker: s.ticker,
      priceChangePercent: shift,
      rationale: isTargetSector
        ? `Direct ${sentiment.toLowerCase()} sector catalyst impact.`
        : `Secondary market correlation adjustment.`
    };
  });

  return {
    headline: finalHeadline,
    body: finalBody,
    sector: targetSector,
    overallSentiment: sentiment,
    marketSummary: `${targetSector} equities adjusted rapidly following breaking bulletin.`,
    stockImpacts
  };
}

/**
 * Calls Google AI API with Gemma-4-26b-a4b-it
 */
async function callGoogleGemma(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GOOGLE_API_KEY}`;
  
  const payload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4500,
      responseMimeType: "application/json"
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Google API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Generates an AI Breaking News Story & Stock Price Shifts
 */
export async function generateAINewsImpact({
  headline = "",
  body = "",
  targetSector = "Technology",
  stocks = [],
  generateFromScratch = false
}) {
  const stockSummary = stocks
    .map((s) => `${s.ticker} (${s.name}, Sector: ${s.sector}, Price: $${s.price})`)
    .join("; ");

  const prompt = `
You are the quantitative simulation engine for a live Wall Street stock trading tournament.
Available Stocks:
${stockSummary || "NVX ($145.00, Tech); GLRX ($88.00, Pharma); VLTO ($64.00, Energy); APXC ($112.00, Retail)"}

${
  generateFromScratch
    ? `Invent a dramatic breaking financial news event for sector: ${targetSector}.`
    : `Analyze incoming news bulletin:
Headline: "${headline}"
Sector: "${targetSector}"
Body: "${body}"`
}

Output strictly valid JSON matching this schema:
{
  "headline": "BREAKING: SHORT HEADLINE IN UPPERCASE",
  "body": "2 sentences describing the catalyst.",
  "sector": "${targetSector || 'Technology'}",
  "overallSentiment": "BULLISH",
  "marketSummary": "1 sentence describing market reaction.",
  "stockImpacts": [
    {
      "ticker": "TICKER",
      "priceChangePercent": 14.5,
      "rationale": "Reason for shift."
    }
  ]
}
`;

  try {
    const rawOutput = await callGoogleGemma(prompt);

    // Stage 1: Try markdown code blocks
    const codeBlocks = [...rawOutput.matchAll(/```(?:json)?\s*([\s\S]*?)\s*```/gi)];
    for (let i = codeBlocks.length - 1; i >= 0; i--) {
      try {
        const candidate = codeBlocks[i][1].trim();
        return JSON.parse(candidate);
      } catch (_) {}
    }

    // Stage 2: Direct matching braces
    let startIdx = 0;
    while ((startIdx = rawOutput.indexOf("{", startIdx)) !== -1) {
      let endIdx = rawOutput.lastIndexOf("}");
      while (endIdx > startIdx) {
        try {
          const candidate = rawOutput.slice(startIdx, endIdx + 1);
          return JSON.parse(candidate);
        } catch (_) {
          endIdx = rawOutput.lastIndexOf("}", endIdx - 1);
        }
      }
      startIdx++;
    }

    // Fallback if parsing fails
    console.warn("AI output parsing fell back to algorithmic generator.");
    return generateAlgorithmicNewsFallback({ targetSector, headline, body, stocks });
  } catch (err) {
    console.warn("Google Gemma call failed or timed out, executing high-fidelity algorithmic catalyst fallback:", err.message);
    return generateAlgorithmicNewsFallback({ targetSector, headline, body, stocks });
  }
}
