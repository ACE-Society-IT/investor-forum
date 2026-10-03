-- =====================================================================
-- 🧹 INVESTOR FORUM: CLEANUP UNUSED DEVICE PRESENCE & DESK LOCKS
-- =====================================================================
-- Migration: 202610030003_cleanup_device_presence_and_locks.sql
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- =====================================================================

-- 1. Remove device lock columns from public.teams
alter table if exists public.teams
  drop column if exists locked_ip,
  drop column if exists locked_device_info;

-- 2. Remove presence & device lock columns from public.team_members
alter table if exists public.team_members
  drop column if exists locked_ip,
  drop column if exists locked_device_info,
  drop column if exists is_online,
  drop column if exists last_seen_at;

-- 3. (Optional) Remove unused team_sessions table if session locking is disabled
-- If you want to completely remove the device sessions table, uncomment below:
-- drop table if exists public.team_sessions cascade;

-- 4. Reload PostgREST Schema Cache
notify pgrst, 'reload config';
notify pgrst, 'reload schema';
