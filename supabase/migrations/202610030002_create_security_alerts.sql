-- =====================================================================
-- INVESTOR FORUM: LIVE SECURITY ALERTS & PROCTORING RADAR
-- =====================================================================

create table if not exists public.security_alerts (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  team_name text not null,
  leader_name text,
  event_type text not null, -- 'TAB_SWITCH' | 'COPY_ATTEMPT' | 'CONTEXT_MENU' | 'DEVTOOLS' | 'WINDOW_BLUR'
  severity text not null default 'WARNING', -- 'INFO' | 'WARNING' | 'CRITICAL'
  details text,
  is_acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

-- Ensure director_warning column on teams table for live desk popups
alter table if exists public.teams
  add column if not exists director_warning text,
  add column if not exists tab_switches_count integer not null default 0,
  add column if not exists last_security_flag timestamptz;

-- Enable RLS
alter table public.security_alerts enable row level security;

create policy "Allow all security_alerts select" on public.security_alerts for select using (true);
create policy "Allow all security_alerts insert" on public.security_alerts for insert with check (true);
create policy "Allow all security_alerts update" on public.security_alerts for update using (true);
create policy "Allow all security_alerts delete" on public.security_alerts for delete using (true);

-- Realtime Publication
alter table if exists public.security_alerts replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'security_alerts'
  ) then
    alter publication supabase_realtime add table public.security_alerts;
  end if;
end $$;
