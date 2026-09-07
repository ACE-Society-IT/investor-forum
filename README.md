# Investor Forum - High-Frequency Trading Simulation & Auditorium Projector

A production-grade, real-time financial simulation platform built for collegiate competitions and trading tournaments. Built with Next.js 16 (App Router), Tailwind CSS, Supabase Realtime, and Google Gemma AI for intelligent macroeconomic breaking news shocks.

---

## ⚡ Core Features

- **🏛️ Auditorium Projector (`/projector`)**: High-impact live 4K screen designed for stage projection with automated cycling views, live market ticker tape, active volatility alerts, and instant tournament leaderboard updates.
- **📈 Student Trading Floor (`/`)**: High-speed, responsive trading desk featuring real-time sparklines, dynamic portfolio valuation, instant buy/sell order execution with slippage/cash validation, and market intelligence.
- **🛡️ Admin Command Center (`/admin`)**: Real-time management console to create/edit/delete stocks, broadcast breaking news alerts, adjust market volatility regimes, emergency pause the market, disqualify/ban teams, and adjust capital.
- **🤖 Gemma AI News Reactor (`/api/ai/news-impact`)**: Automated macroeconomic intelligence powered by Google AI (`gemma-4-26b-a4b-it`) which analyzes breaking news, computes sentiment, and generates realistic market shock waves across affected sectors.
- **⚡ Autonomous Market Ticker (`/api/market/tick`)**: Micro-volatility price fluctuation engine that provides continuous, lifelike market movements and price history drift.
- **✨ Flicker-Free Realtime Engine**: Optimized SVG rendering with localized state reconciliation, preventing UI flicker during continuous high-frequency updates.
- **🎨 Modern Design System**: Vercel-inspired monochrome & amber aesthetic with seamless Dark and Light theme support.

---

## 🚀 One-Click Deploy to Vercel

1. Push or import this repository into your [Vercel Dashboard](https://vercel.com/new).
2. Configure the following **Environment Variables** in Vercel Project Settings:

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xyzcompany.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous public key | `eyJhbGciOi...` |
| `GOOGLE_API_KEY` | Google Gemini API Key for AI News Reactor | `AIzaSy...` |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Public Google Gemini API Key | `AIzaSy...` |
| `AI_MODEL_NAME` | Model identifier for AI news analysis | `gemma-4-26b-a4b-it` |

3. Click **Deploy**. Vercel will automatically build and serve the application globally with serverless API edge routes.

---

## 🛠️ Local Development

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ACE-Society-IT/investor-forum.git
cd investor-forum
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials and Google AI API key.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the Trading Floor.

### 4. Run Production Build & Lint
```bash
npm run lint
npm run build
```

---

## 🗄️ Database Setup (Supabase)

Execute the SQL migration scripts located in `supabase/migrations/`:
- `supabase/migrations/202609070001_initial_schema.sql`
- `supabase/migrations/202609070002_investor_forum_competition.sql`

This will provision all tables (`stocks`, `teams`, `portfolio`, `transactions`, `news_events`, `system_state`) and enable Realtime replication.

---

## 🔐 Security & Anti-Abuse Controls

- **Client-Side Trade Validation**: Strict verification of available cash, portfolio holdings, non-negative shares, and trading halt status.
- **Session Authentication**: Isolated admin authentication with brute-force rate limiting and sessionStorage encryption.
- **Zero-Secret Exposure**: No private API keys or service role tokens are exposed in client-side bundles.

---

## 👥 Built with ACE Society
Crafted for high-energy investment tournaments and collegiate finance summits.
