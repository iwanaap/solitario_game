create extension if not exists pgcrypto;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists players_name_lower_unique on public.players (lower(name));

create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  player_name text not null,
  score integer not null,
  remaining_pieces integer not null,
  moves integer not null,
  duration_ms integer not null,
  evaluation text not null,
  perfect boolean not null,
  outcome text not null,
  played_at timestamptz not null default now()
);

alter table public.players enable row level security;
alter table public.game_results enable row level security;

drop policy if exists "Players are readable" on public.players;
drop policy if exists "Players can be inserted" on public.players;
drop policy if exists "Game results are readable" on public.game_results;
drop policy if exists "Game results can be inserted" on public.game_results;

create policy "Players are readable"
on public.players for select
to anon
using (true);

create policy "Players can be inserted"
on public.players for insert
to anon
with check (true);

create policy "Game results are readable"
on public.game_results for select
to anon
using (true);

create policy "Game results can be inserted"
on public.game_results for insert
to anon
with check (true);

create or replace view public.weekly_ranking as
select distinct on (player_id)
  player_id,
  player_name,
  score,
  remaining_pieces,
  moves,
  duration_ms,
  evaluation,
  perfect,
  outcome,
  played_at
from public.game_results
where played_at >= date_trunc('week', now())
order by player_id, remaining_pieces asc, score desc, moves asc, duration_ms asc;
