-- Fase 2: resultados autenticados + ranking global combinado.
-- Ejecutar después de supabase-auth-phase1.sql.

create extension if not exists pgcrypto;

create table if not exists public.account_game_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score >= 0),
  remaining_pieces integer not null check (remaining_pieces >= 0),
  moves integer not null check (moves >= 0),
  duration_ms integer not null check (duration_ms >= 0),
  evaluation text not null,
  perfect boolean not null default false,
  outcome text not null check (outcome in ('won', 'lost')),
  ranking_points_awarded integer not null default 0 check (ranking_points_awarded >= 0),
  played_at timestamptz not null default now()
);

create index if not exists account_game_results_user_played_at_idx
on public.account_game_results (user_id, played_at desc);

alter table public.account_game_results enable row level security;

drop policy if exists "Account game results are readable" on public.account_game_results;
drop policy if exists "Users can insert their account results" on public.account_game_results;

create policy "Account game results are readable"
on public.account_game_results for select
to anon, authenticated
using (true);

create policy "Users can insert their account results"
on public.account_game_results for insert
to authenticated
with check (auth.uid() = user_id);

create or replace function public.calculate_ranking_points(
  p_score integer,
  p_outcome text,
  p_perfect boolean,
  p_duration_ms integer
)
returns integer
language sql
immutable
as $$
  select greatest(
    0,
    coalesce(p_score, 0)
    + 25
    + case when p_outcome = 'won' then 300 else 0 end
    + case when p_perfect then 1000 else 0 end
    + case
        when p_outcome <> 'won' then 0
        when p_duration_ms <= 120000 then 250
        when p_duration_ms <= 300000 then 120
        when p_duration_ms <= 600000 then 50
        else 0
      end
  );
$$;

create or replace function public.register_game_result(
  p_score integer,
  p_remaining_pieces integer,
  p_moves integer,
  p_duration_ms integer,
  p_evaluation text,
  p_perfect boolean,
  p_outcome text,
  p_played_at timestamptz default now()
)
returns public.account_game_results
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_points integer;
  v_result public.account_game_results;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión para guardar resultados.';
  end if;

  if p_outcome not in ('won', 'lost') then
    raise exception 'Resultado inválido.';
  end if;

  insert into public.profiles (id)
  values (v_user_id)
  on conflict (id) do nothing;

  v_points := public.calculate_ranking_points(p_score, p_outcome, p_perfect, p_duration_ms);

  insert into public.account_game_results (
    user_id,
    score,
    remaining_pieces,
    moves,
    duration_ms,
    evaluation,
    perfect,
    outcome,
    ranking_points_awarded,
    played_at
  ) values (
    v_user_id,
    p_score,
    p_remaining_pieces,
    p_moves,
    p_duration_ms,
    p_evaluation,
    p_perfect,
    p_outcome,
    v_points,
    coalesce(p_played_at, now())
  )
  returning * into v_result;

  update public.profiles
  set
    total_score = total_score + p_score,
    total_games = total_games + 1,
    total_wins = total_wins + case when p_outcome = 'won' then 1 else 0 end,
    perfect_games = perfect_games + case when p_perfect then 1 else 0 end,
    best_score = greatest(best_score, p_score),
    best_remaining_pieces = case
      when best_remaining_pieces is null then p_remaining_pieces
      else least(best_remaining_pieces, p_remaining_pieces)
    end,
    best_time_ms = case
      when p_outcome = 'won' and best_time_ms is null then p_duration_ms
      when p_outcome = 'won' then least(best_time_ms, p_duration_ms)
      else best_time_ms
    end,
    ranking_points = ranking_points + v_points
  where id = v_user_id;

  return v_result;
end;
$$;

grant execute on function public.register_game_result(integer, integer, integer, integer, text, boolean, text, timestamptz)
to authenticated;

create or replace view public.global_combined_ranking as
select
  id,
  coalesce(display_name, username, 'Jugador sin nombre') as player_name,
  avatar_id,
  ranking_points,
  total_score,
  total_games,
  total_wins,
  perfect_games,
  best_score,
  best_remaining_pieces,
  best_time_ms
from public.profiles
where total_games > 0
order by ranking_points desc, total_score desc, total_games desc;
