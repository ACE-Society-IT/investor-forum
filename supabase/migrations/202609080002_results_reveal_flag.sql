-- =====================================================================
-- INVESTOR FORUM: RESULTS REVEAL FLAG FOR TOURNAMENT LEADERBOARD
-- =====================================================================
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Add is_results_revealed and headline column to game_state
alter table public.game_state add column if not exists is_results_revealed boolean not null default false;
alter table public.game_state add column if not exists results_headline text default 'Official Results Audit in Progress - Stand By For Winner Announcement';

-- 2. Update default singleton game_state record
update public.game_state
set 
  is_results_revealed = coalesce(is_results_revealed, false),
  results_headline = coalesce(results_headline, 'Official Results Audit in Progress - Stand By For Winner Announcement')
where id = 1;
