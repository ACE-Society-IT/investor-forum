import { supabase } from "./supabase";

export const initialStocks = [
  { id: "s-1", ticker: "NVX", name: "NovaTech AI Corp", sector: "Technology", price: 145.50, previous_price: 140.00, change_percent: 3.93, spark_data: [135, 138, 142, 140, 144, 145.5] },
  { id: "s-2", ticker: "CLD", name: "Apex Cloud Systems", sector: "Technology", price: 82.00, previous_price: 85.00, change_percent: -3.53, spark_data: [88, 86, 84, 85, 83, 82] },
  { id: "s-3", ticker: "PHM", name: "PharmaCare Therapeutics", sector: "Pharmaceuticals", price: 210.00, previous_price: 198.00, change_percent: 6.06, spark_data: [190, 195, 198, 204, 210] },
  { id: "s-4", ticker: "BIO", name: "Helix BioGenetics", sector: "Pharmaceuticals", price: 64.20, previous_price: 64.20, change_percent: 0.00, spark_data: [62, 65, 63, 64, 64.2] },
  { id: "s-5", ticker: "VLT", name: "VoltGrid Energy Solutions", sector: "Energy", price: 95.80, previous_price: 102.00, change_percent: -6.08, spark_data: [105, 104, 102, 98, 95.8] },
  { id: "s-6", ticker: "SOL", name: "AeroSolar Dynamics", sector: "Energy", price: 48.00, previous_price: 45.00, change_percent: 6.67, spark_data: [42, 44, 45, 46, 48] },
  { id: "s-7", ticker: "AUR", name: "Aura Luxury Retail", sector: "Consumer Goods", price: 124.00, previous_price: 120.00, change_percent: 3.33, spark_data: [115, 118, 120, 122, 124] },
  { id: "s-8", ticker: "FDX", name: "PrimeFoods Global", sector: "Consumer Goods", price: 36.50, previous_price: 37.00, change_percent: -1.35, spark_data: [38, 37.5, 37, 36.8, 36.5] }
];

export const initialNews = [
  { id: "n-1", headline: "Global chip shortage eases as new semiconductor factory opens ahead of schedule.", sector: "Technology", impact_percent: 4.5, time: "Just now" },
  { id: "n-2", headline: "Regulatory health committee fast-tracks breakthrough oncology drug.", sector: "Pharmaceuticals", impact_percent: 8.2, time: "5m ago" },
  { id: "n-3", headline: "Renewable energy tax credits approved in nationwide infrastructure package.", sector: "Energy", impact_percent: 5.0, time: "12m ago" }
];

export const initialTeams = [
  { id: "t-admin", name: "Admin Command", username: "admin", cash_balance: 0, is_admin: true },
  { id: "t-1", name: "Alpha Traders", username: "team1", cash_balance: 100000, is_admin: false },
  { id: "t-2", name: "Wall Street Wolves", username: "team2", cash_balance: 100000, is_admin: false },
  { id: "t-3", name: "Quantum Fund", username: "team3", cash_balance: 100000, is_admin: false },
  { id: "t-4", name: "Bullish Titans", username: "team4", cash_balance: 100000, is_admin: false }
];
