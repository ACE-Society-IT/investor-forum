-- =====================================================================
-- ⚡ INVESTOR FORUM: PRESENCE, LOGIN APPROVALS & MEMBER SECRET KEYS
-- =====================================================================
-- Migration: 202609150002_presence_approvals_member_keys.sql
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- =====================================================================

-- 1. Extend public.team_members with individual keys & presence tracking
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'team_members' and column_name = 'secret_key'
  ) then
    alter table public.team_members add column secret_key text;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'team_members' and column_name = 'secret_key_used'
  ) then
    alter table public.team_members add column secret_key_used boolean default false;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'team_members' and column_name = 'secret_key_used_at'
  ) then
    alter table public.team_members add column secret_key_used_at timestamp with time zone;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'team_members' and column_name = 'locked_ip'
  ) then
    alter table public.team_members add column locked_ip text;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'team_members' and column_name = 'locked_device_info'
  ) then
    alter table public.team_members add column locked_device_info text;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'team_members' and column_name = 'is_online'
  ) then
    alter table public.team_members add column is_online boolean default false;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'team_members' and column_name = 'last_seen_at'
  ) then
    alter table public.team_members add column last_seen_at timestamp with time zone;
  end if;
end $$;

-- Populate unique secret keys for any existing team members who do not have one yet
update public.team_members
set secret_key = 'TRD-' || upper(substr(md5(random()::text || id::text), 1, 4)) || '-' || upper(substr(md5(now()::text || random()::text), 1, 4))
where secret_key is null or secret_key = '';

-- 2. Extend public.game_state with require_login_approval flag
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'game_state' and column_name = 'require_login_approval'
  ) then
    alter table public.game_state add column require_login_approval boolean default true;
  end if;
end $$;

-- 3. Create public.login_requests table for real-time admin approval queue
create table if not exists public.login_requests (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade not null,
  team_name text not null,
  member_id uuid references public.team_members(id) on delete set null,
  member_name text,
  member_role text,
  ip_address text,
  user_agent text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  session_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reviewed_at timestamp with time zone
);

create index if not exists idx_login_requests_status on public.login_requests(status, created_at desc);
create index if not exists idx_login_requests_team_id on public.login_requests(team_id);
create index if not exists idx_team_members_secret_key on public.team_members(secret_key);

-- 4. Permissions & RLS policies
grant select, insert, update, delete on public.login_requests to anon, authenticated;
grant select, insert, update, delete on public.team_members to anon, authenticated;

alter table public.login_requests enable row level security;
drop policy if exists "Allow select login_requests" on public.login_requests;
create policy "Allow select login_requests" on public.login_requests for select using (true);
drop policy if exists "Allow insert login_requests" on public.login_requests;
create policy "Allow insert login_requests" on public.login_requests for insert with check (true);
drop policy if exists "Allow update login_requests" on public.login_requests;
create policy "Allow update login_requests" on public.login_requests for update using (true);

-- 5. Add to Realtime Publication
do $$
begin
  begin
    alter publication supabase_realtime add table public.login_requests;
  exception when duplicate_object then
    null;
  end;
  begin
    alter publication supabase_realtime add table public.team_members;
  exception when duplicate_object then
    null;
  end;
end $$;
