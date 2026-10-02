# 📈 Investor Forum

A live stock trading competition platform built for students and finance summits. Teams trade stocks in real time, react to breaking news, and compete for the top spot on the live leaderboard.

---

## 🎯 What is Investor Forum?

Investor Forum turns trading competitions into an exciting live experience:
- **For Participants:** A fast, responsive trading floor to buy/sell shares, track their portfolio, and react to market news.
- **For Organizers:** A simple Admin Control Room to pause the market, release news events, manage teams, and adjust stock prices.
- **For the Stage:** A big-screen Projector View that displays live rankings, top traders, and market movements for the audience.

---

## ✨ Main Features

- ⚡ **Real-Time Trading:** Instant buy and sell execution with zero delay.
- 💰 **PKR Currency:** All starting balances, stock prices, and portfolio totals are measured in Pakistani Rupees (PKR).
- 📰 **Breaking News Wire:** Organizers can broadcast news stories with smooth 45-second price waves to test how quickly teams analyze stories.
- 🏆 **Live Leaderboard:** Automatically calculates total net worth (cash + owned shares) and ranks teams in real time.
- 🖥️ **Auditorium Projector View:** Fullscreen leaderboard with podium medals and ticker tape for the main screen.
- 📱 **Any Device:** Works on mobile phones, tablets, laptops, and desktop computers.
- 🔒 **Desk Security:** Ensures teams only log in from their assigned workstation.

---

## 🚀 Quick Start Guide

### 1. Clone the project
```bash
git clone https://github.com/ACE-Society-IT/investor-forum.git
cd investor-forum
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a file named `.env.local` in the root folder and add your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GOOGLE_API_KEY=your_gemini_api_key
```

### 4. Run the app
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Page Overview

| Page | Path | Description |
|---|---|---|
| **Home Page** | `/` | Competition overview and rules |
| **Trading Floor** | `/dashboard` | Participant login, stock market, and trading desk |
| **Stage Projector** | `/projector` | Big-screen live leaderboard for the auditorium |
| **Admin Control** | `/admin` | Organizer control room for news, teams, and market controls |
| **Live Leaderboard** | `/leaderboard` | Tournament rankings and team standings |
| **News Wire** | `/news` | Live broadcast of all released news stories |
| **Market Stocks** | `/stocks` | Live stock prices and sector performance |

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Database & Realtime:** [Supabase](https://supabase.com/)
- **Styling:** Tailwind CSS & Vanilla CSS
- **Icons:** Lucide React
- **Hosting:** [Vercel](https://vercel.com/)

---

## 📜 Available Commands

- `npm run dev` – Starts the local development server.
- `npm run build` – Builds the optimized app for production.
- `npm run start` – Starts the production server.
- `npm run lint` – Checks the code for any errors.

---

## 👥 Organized by ACE Society

Made for collegiate finance competitions and trading challenges.
Released under the MIT License.
