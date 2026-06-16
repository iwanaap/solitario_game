-- Fase 3: desafíos diarios + recompensas en fichas.
-- Ejecutar después de supabase-auth-phase1.sql y supabase-game-results-phase2.sql.

create extension if not exists pgcrypto;

create table if not exists public.daily_challenges (
  id uuid primary key default gen_random_uuid(),
  challenge_date date not null,
  challenge_type text not null check (challenge_type in ('play_games', 'max_remaining_pieces', 'finish_under_time')),
  target_value integer not null check (target_value > 0),
  reward_chips integer not null check (reward_chips > 0),
  title text not null,
  description text not null,
  created_at timestamptz not null default now(),
  unique (challenge_date, challenge_type)
);

create table if not exists public.user_daily_challenge_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.daily_challenges(id) on delete cascade,
  progress integer not null default 0 check (progress >= 0),
  completed boolean not null default false,
  claimed boolean not null default false,
  completed_at timestamptz,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, challenge_id)
);

create table if not exists public.chip_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  reason text not null,
  challenge_id uuid references public.daily_challenges(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.daily_challenges enable row level security;
alter table public.user_daily_challenge_progress enable row level security;
alter table public.chip_transactions enable row level security;

drop policy if exists "Daily challenges are readable" on public.daily_challenges;
drop policy if exists "Users can read their challenge progress" on public.user_daily_challenge_progress;
drop policy if exists "Users can read their chip transactions" on public.chip_transactions;

create policy "Daily challenges are readable"
on public.daily_challenges for select
to anon, authenticated
using (true);

create policy "Users can read their challenge progress"
on public.user_daily_challenge_progress for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can read their chip transactions"
on public.chip_transactions for select
to authenticated
using (auth.uid() = user_id);

drop trigger if exists user_daily_challenge_progress_set_updated_at on public.user_daily_challenge_progress;
create trigger user_daily_challenge_progress_set_updated_at
before update on public.user_daily_challenge_progress
for each row execute function public.set_updated_at();

create or replace function public.ensure_daily_challenges(p_date date default current_date)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.daily_challenges (challenge_date, challenge_type, target_value, reward_chips, title, description)
  values
    (p_date, 'play_games', 3, 30, 'Calienta motores', 'Juega 3 partidas durante el día.'),
    (p_date, 'max_remaining_pieces', 2, 30, 'Final limpio', 'Termina 2 partidas con exactamente 3 fichas restantes.'),
    (p_date, 'finish_under_time', 5, 30, 'Contra el reloj', 'Gana 5 partidas en menos de 50 segundos cada una.')
  on conflict (challenge_date, challenge_type) do update
  set
    target_value = excluded.target_value,
    reward_chips = excluded.reward_chips,
    title = excluded.title,
    description = excluded.description;
end;
$$;

create or replace function public.ensure_user_daily_challenge_progress(p_user_id uuid, p_date date default current_date)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_daily_challenges(p_date);

  insert into public.user_daily_challenge_progress (user_id, challenge_id)
  select p_user_id, challenge.id
  from public.daily_challenges challenge
  where challenge.challenge_date = p_date
  on conflict (user_id, challenge_id) do nothing;
end;
$$;

create or replace function public.update_daily_challenges_after_game(
  p_user_id uuid,
  p_remaining_pieces integer,
  p_duration_ms integer,
  p_outcome text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := current_date;
begin
  perform public.ensure_user_daily_challenge_progress(p_user_id, v_today);

  update public.user_daily_challenge_progress progress
  set
    progress = progress.progress + 1,
    completed = case when progress.progress + 1 >= challenge.target_value then true else progress.completed end,
    completed_at = case
      when progress.completed = false and progress.progress + 1 >= challenge.target_value then now()
      else progress.completed_at
    end
  from public.daily_challenges challenge
  where progress.challenge_id = challenge.id
    and progress.user_id = p_user_id
    and challenge.challenge_date = v_today
    and challenge.challenge_type = 'play_games'
    and progress.claimed = false;

  update public.user_daily_challenge_progress progress
  set
    progress = progress.progress + 1,
    completed = case when progress.progress + 1 >= challenge.target_value then true else progress.completed end,
    completed_at = case
      when progress.completed = false and progress.progress + 1 >= challenge.target_value then now()
      else progress.completed_at
    end
  from public.daily_challenges challenge
  where progress.challenge_id = challenge.id
    and progress.user_id = p_user_id
    and challenge.challenge_date = v_today
    and challenge.challenge_type = 'max_remaining_pieces'
    and p_remaining_pieces = 3
    and progress.claimed = false;

  update public.user_daily_challenge_progress progress
  set
    progress = progress.progress + 1,
    completed = case when progress.progress + 1 >= challenge.target_value then true else progress.completed end,
    completed_at = case
      when progress.completed = false and progress.progress + 1 >= challenge.target_value then now()
      else progress.completed_at
    end
  from public.daily_challenges challenge
  where progress.challenge_id = challenge.id
    and progress.user_id = p_user_id
    and challenge.challenge_date = v_today
    and challenge.challenge_type = 'finish_under_time'
    and p_outcome = 'won'
    and p_duration_ms < 50000
    and progress.claimed = false;
end;
$$;

create or replace function public.get_daily_challenge_progress(p_date date default current_date)
returns table (
  challenge_id uuid,
  challenge_date date,
  challenge_type text,
  target_value integer,
  reward_chips integer,
  title text,
  description text,
  progress integer,
  completed boolean,
  claimed boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión para ver desafíos.';
  end if;

  perform public.ensure_user_daily_challenge_progress(v_user_id, p_date);

  return query
  select
    challenge.id,
    challenge.challenge_date,
    challenge.challenge_type,
    challenge.target_value,
    challenge.reward_chips,
    challenge.title,
    challenge.description,
    coalesce(progress.progress, 0),
    coalesce(progress.completed, false),
    coalesce(progress.claimed, false)
  from public.daily_challenges challenge
  left join public.user_daily_challenge_progress progress
    on progress.challenge_id = challenge.id
   and progress.user_id = v_user_id
  where challenge.challenge_date = p_date
  order by challenge.created_at asc;
end;
$$;

create or replace function public.claim_daily_challenge(p_challenge_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_reward integer;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión para reclamar fichas.';
  end if;

  select challenge.reward_chips
  into v_reward
  from public.user_daily_challenge_progress progress
  join public.daily_challenges challenge on challenge.id = progress.challenge_id
  where progress.user_id = v_user_id
    and progress.challenge_id = p_challenge_id
    and progress.completed = true
    and progress.claimed = false
  for update;

  if v_reward is null then
    raise exception 'El desafío no está completado o ya fue reclamado.';
  end if;

  update public.user_daily_challenge_progress
  set claimed = true, claimed_at = now()
  where user_id = v_user_id and challenge_id = p_challenge_id;

  update public.profiles
  set chips = chips + v_reward
  where id = v_user_id;

  insert into public.chip_transactions (user_id, amount, reason, challenge_id)
  values (v_user_id, v_reward, 'daily_challenge', p_challenge_id);

  return v_reward;
end;
$$;

-- Reemplaza la función de fase 2 para que cada partida actualice desafíos diarios.
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
    user_id, score, remaining_pieces, moves, duration_ms, evaluation, perfect, outcome, ranking_points_awarded, played_at
  ) values (
    v_user_id, p_score, p_remaining_pieces, p_moves, p_duration_ms, p_evaluation, p_perfect, p_outcome, v_points, coalesce(p_played_at, now())
  )
  returning * into v_result;

  update public.profiles
  set
    total_score = total_score + p_score,
    total_games = total_games + 1,
    total_wins = total_wins + case when p_outcome = 'won' then 1 else 0 end,
    perfect_games = perfect_games + case when p_perfect then 1 else 0 end,
    best_score = greatest(best_score, p_score),
    best_remaining_pieces = case when best_remaining_pieces is null then p_remaining_pieces else least(best_remaining_pieces, p_remaining_pieces) end,
    best_time_ms = case
      when p_outcome = 'won' and best_time_ms is null then p_duration_ms
      when p_outcome = 'won' then least(best_time_ms, p_duration_ms)
      else best_time_ms
    end,
    ranking_points = ranking_points + v_points
  where id = v_user_id;

  perform public.update_daily_challenges_after_game(v_user_id, p_remaining_pieces, p_duration_ms, p_outcome);

  return v_result;
end;
$$;

grant execute on function public.get_daily_challenge_progress(date) to authenticated;
grant execute on function public.claim_daily_challenge(uuid) to authenticated;
