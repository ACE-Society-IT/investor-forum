-- =====================================================================
-- INVESTOR FORUM: TEAM MEMBERS & INDIVIDUAL TRADERS SCHEMA
-- =====================================================================
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- Adds participant_type, trader_title to teams and creates team_members table.
-- =====================================================================

-- 1. Alter Teams Table for Participant Types
alter table if exists public.teams 
  add column if not exists participant_type text not null default 'team' check (participant_type in ('team', 'individual'));

alter table if exists public.teams 
  add column if not exists trader_title text default null;

-- 2. Create Team Members Table
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade not null,
  name text not null,
  role text not null default 'Trader',
  email text default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Composite Indexes
create index if not exists idx_team_members_team_id on public.team_members(team_id, created_at asc);

-- 4. Enable Row Level Security (RLS)
alter table public.team_members enable row level security;

-- Policies for team_members
create policy "Allow all team_members read" on public.team_members for select using (true);
create policy "Allow all team_members insert" on public.team_members for insert with check (true);
create policy "Allow all team_members update" on public.team_members for update using (true);
create policy "Allow all team_members delete" on public.team_members for delete using (true);

-- 5. Realtime Publication & Replica Identity
alter table if exists public.team_members replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'team_members'
  ) then
    alter publication supabase_realtime add table public.team_members;
  end if;
end $$;

-- 6. Reload PostgREST Schema Cache
notify pgrst, 'reload config';
notify pgrst, 'reload schema';
