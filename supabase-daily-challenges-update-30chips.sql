-- Actualización desafíos diarios: 30 fichas, metas más difíciles.
-- Ejecutar en Supabase SQL Editor después de haber aplicado las fases anteriores.

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

-- Actualiza los desafíos de hoy con los nuevos textos/metas/recompensas.
select public.ensure_daily_challenges(current_date);

-- Reinicia progreso no reclamado de los desafíos que cambiaron de significado.
update public.user_daily_challenge_progress progress
set progress = 0,
    completed = false,
    completed_at = null
from public.daily_challenges challenge
where progress.challenge_id = challenge.id
  and challenge.challenge_date = current_date
  and challenge.challenge_type in ('max_remaining_pieces', 'finish_under_time')
  and progress.claimed = false;
