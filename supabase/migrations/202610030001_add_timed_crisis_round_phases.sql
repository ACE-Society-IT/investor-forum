-- =====================================================================
-- INVESTOR FORUM: TIMED CRISIS ROUND PHASES & AUTOMATED SHOCKWAVE SCHEMA
-- =====================================================================

-- Add phase and timing columns to public.game_state
alter table if exists public.game_state
  add column if not exists phase text not null default 'IDLE', -- 'IDLE' | 'ANALYSIS' | 'TRADING' | 'CALCULATING'
  add column if not exists analysis_duration_minutes numeric default 4,
  add column if not exists trading_duration_minutes numeric default 5,
  add column if not exists analysis_ends_at timestamp with time zone,
  add column if not exists trading_ends_at timestamp with time zone,
  add column if not exists active_crisis_id text,
  add column if not exists active_crisis_headline text,
  add column if not exists active_crisis_body text,
  add column if not exists active_crisis_sector text,
  add column if not exists active_crisis_impacts jsonb default '{}'::jsonb,
  add column if not exists active_event_number integer default 1,
  add column if not exists phase_message text default 'Market Ready';

-- Enable realtime on game_state if not already present
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'game_state'
  ) then
    alter publication supabase_realtime add table public.game_state;
  end if;
end $$;
