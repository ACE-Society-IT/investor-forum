import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://txsvejwayjdfqzjtiqap.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4c3ZlandheWpkZnF6anRpcWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODk3MjMsImV4cCI6MjEwNDM2NTcyM30.39tzqk6bQcgp73XYmYd0bguU-HGD1FanFK7D7-UJUHY";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseAnonKey &&
  supabaseAnonKey.length > 20 &&
  !supabaseAnonKey.includes("placeholder")
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});


