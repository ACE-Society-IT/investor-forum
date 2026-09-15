-- =====================================================================
-- INVESTOR FORUM: ONE-TIME SECRET KEYS & STRICT DESK LOCK MIGRATION
-- =====================================================================
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- Adds one-time secret key verification and device binding to teams.
-- =====================================================================

-- 1. Alter Teams Table for One-Time Secret Key and Device Locking
alter table if exists public.teams 
  add column if not exists secret_key text default null;

alter table if exists public.teams 
  add column if not exists secret_key_used boolean not null default false;

alter table if exists public.teams 
  add column if not exists secret_key_used_at timestamp with time zone default null;

alter table if exists public.teams 
  add column if not exists locked_ip text default null;

alter table if exists public.teams 
  add column if not exists locked_device_info text default null;

-- 2. Ensure team_sessions table exists with IP and device tracking
create table if not exists public.team_sessions (
  team_id uuid primary key references public.teams(id) on delete cascade,
  session_token text not null,
  ip_address text default null,
  user_agent text default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_seen_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure columns exist in team_sessions if table was already created
alter table if exists public.team_sessions 
  add column if not exists ip_address text default null;

alter table if exists public.team_sessions 
  add column if not exists user_agent text default null;

alter table if exists public.team_sessions 
  add column if not exists last_seen_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- 3. Enable RLS on team_sessions
alter table public.team_sessions enable row level security;

create policy "Allow all team_sessions select" on public.team_sessions for select using (true);
create policy "Allow all team_sessions insert" on public.team_sessions for insert with check (true);
create policy "Allow all team_sessions update" on public.team_sessions for update using (true);
create policy "Allow all team_sessions delete" on public.team_sessions for delete using (true);

-- 4. Enable Realtime on team_sessions
alter table if exists public.team_sessions replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'team_sessions'
  ) then
    alter publication supabase_realtime add table public.team_sessions;
  end if;
end $$;

-- 5. Auto-populate secret keys for any existing teams without one
update public.teams
set secret_key = 'KEY-' || upper(substr(md5(random()::text || id::text), 1, 4)) || '-' || upper(substr(md5(random()::text || name), 1, 4))
where secret_key is null and is_admin = false;

-- 6. Reload PostgREST Schema Cache
notify pgrst, 'reload config';
notify pgrst, 'reload schema';
