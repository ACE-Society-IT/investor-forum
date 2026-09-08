-- =====================================================================
-- INVESTOR FORUM: ROUND TIMERS & TOTAL ROUNDS CONFIGURATION
-- =====================================================================
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Add round scheduling columns to game_state
alter table public.game_state add column if not exists total_rounds integer not null default 3;
alter table public.game_state add column if not exists current_round_number integer not null default 1;
alter table public.game_state add column if not exists round_ends_at timestamp with time zone;
alter table public.game_state add column if not exists next_round_starts_at timestamp with time zone;
alter table public.game_state add column if not exists round_duration_minutes integer default 15;

-- 2. Update default singleton game_state record
update public.game_state
set 
  total_rounds = coalesce(total_rounds, 3),
  current_round_number = coalesce(current_round_number, 1),
  round_duration_minutes = coalesce(round_duration_minutes, 15)
where id = 1;
