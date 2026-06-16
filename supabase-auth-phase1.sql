-- Fase 1: perfiles ligados a Supabase Auth.
-- Ejecutar en el SQL editor de Supabase después de activar Email y Google en Authentication > Providers.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_id text not null default 'default',
  chips integer not null default 0 check (chips >= 0),
  total_score integer not null default 0 check (total_score >= 0),
  total_games integer not null default 0 check (total_games >= 0),
  total_wins integer not null default 0 check (total_wins >= 0),
  perfect_games integer not null default 0 check (perfect_games >= 0),
  best_score integer not null default 0 check (best_score >= 0),
  best_remaining_pieces integer,
  best_time_ms integer,
  ranking_points integer not null default 0 check (ranking_points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable" on public.profiles;
drop policy if exists "Users can insert their profile" on public.profiles;
drop policy if exists "Users can update their profile basics" on public.profiles;

create policy "Profiles are readable"
on public.profiles for select
to anon, authenticated
using (true);

create policy "Users can insert their profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update their profile basics"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Jugador'),
    null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
