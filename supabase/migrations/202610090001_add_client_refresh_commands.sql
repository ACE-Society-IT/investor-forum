-- Add real-time client command broadcasting support to public.game_state
alter table if exists public.game_state 
add column if not exists last_client_command text default null,
add column if not exists last_client_command_time timestamp with time zone default null;
