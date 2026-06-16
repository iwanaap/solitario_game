-- Fase 5: perfil público seguro.
-- Ejecutar después de fases 1, 2, 3 y 4.

create unique index if not exists profiles_username_lower_unique
on public.profiles (lower(username))
where username is not null;

create or replace function public.update_profile_basics(
  p_display_name text,
  p_username text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text := trim(regexp_replace(coalesce(p_display_name, ''), '\s+', ' ', 'g'));
  v_username text := lower(regexp_replace(coalesce(p_username, ''), '[^a-zA-Z0-9_]', '', 'g'));
  v_profile public.profiles;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión para actualizar tu perfil.';
  end if;

  if length(v_display_name) < 2 then
    raise exception 'El nombre visible debe tener al menos 2 caracteres.';
  end if;

  if length(v_username) < 3 then
    raise exception 'El usuario debe tener al menos 3 caracteres.';
  end if;

  if length(v_username) > 24 then
    raise exception 'El usuario no puede superar 24 caracteres.';
  end if;

  insert into public.profiles (id, display_name, username, avatar_id)
  values (v_user_id, v_display_name, v_username, 'default')
  on conflict (id) do nothing;

  update public.profiles
  set display_name = v_display_name,
      username = v_username
  where id = v_user_id
  returning * into v_profile;

  return v_profile;
end;
$$;

-- Evita que el frontend pueda modificar fichas/estadísticas directamente.
-- Las actualizaciones sensibles quedan solo dentro de funciones security definer.
revoke update on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant execute on function public.update_profile_basics(text, text) to authenticated;
