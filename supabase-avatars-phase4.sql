-- Fase 4: tienda de avatares + inventario.
-- Ejecutar después de las fases 1, 2 y 3.

create table if not exists public.avatars (
  id text primary key,
  name text not null,
  price_chips integer not null default 0 check (price_chips >= 0),
  image_path text not null,
  rarity text not null default 'common',
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_avatars (
  user_id uuid not null references public.profiles(id) on delete cascade,
  avatar_id text not null references public.avatars(id) on delete cascade,
  purchased_at timestamptz not null default now(),
  primary key (user_id, avatar_id)
);

alter table public.avatars enable row level security;
alter table public.user_avatars enable row level security;

drop policy if exists "Avatars are readable" on public.avatars;
drop policy if exists "Users can read their avatars" on public.user_avatars;

create policy "Avatars are readable"
on public.avatars for select
to anon, authenticated
using (enabled = true);

create policy "Users can read their avatars"
on public.user_avatars for select
to authenticated
using (auth.uid() = user_id);

insert into public.avatars (id, name, price_chips, image_path, rarity, enabled)
values
  ('default', 'Ficha clásica', 0, '/avatars/default.svg', 'common', true),
  ('frog', 'Rana arcade', 120, '/avatars/frog.svg', 'common', true),
  ('cat', 'Gato naranja', 180, '/avatars/cat.svg', 'rare', true),
  ('robot', 'Robot CRT', 250, '/avatars/robot.svg', 'rare', true),
  ('skull', 'Calavera pixel', 400, '/avatars/skull.svg', 'epic', true),
  ('wizard', 'Mago del tablero', 650, '/avatars/wizard.svg', 'legendary', true)
on conflict (id) do update
set
  name = excluded.name,
  price_chips = excluded.price_chips,
  image_path = excluded.image_path,
  rarity = excluded.rarity,
  enabled = excluded.enabled;

create or replace function public.ensure_default_avatar(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_avatars (user_id, avatar_id)
  values (p_user_id, 'default')
  on conflict (user_id, avatar_id) do nothing;

  update public.profiles
  set avatar_id = coalesce(nullif(avatar_id, ''), 'default')
  where id = p_user_id;
end;
$$;

create or replace function public.get_avatar_catalog()
returns table (
  id text,
  name text,
  price_chips integer,
  image_path text,
  rarity text,
  owned boolean,
  equipped boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión para ver la tienda.';
  end if;

  perform public.ensure_default_avatar(v_user_id);

  return query
  select
    avatar.id,
    avatar.name,
    avatar.price_chips,
    avatar.image_path,
    avatar.rarity,
    owned.avatar_id is not null as owned,
    profile.avatar_id = avatar.id as equipped
  from public.avatars avatar
  cross join public.profiles profile
  left join public.user_avatars owned
    on owned.avatar_id = avatar.id
   and owned.user_id = v_user_id
  where avatar.enabled = true
    and profile.id = v_user_id
  order by avatar.price_chips asc, avatar.created_at asc;
end;
$$;

create or replace function public.buy_avatar(p_avatar_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_price integer;
  v_chips integer;
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión para comprar avatares.';
  end if;

  perform public.ensure_default_avatar(v_user_id);

  select price_chips into v_price
  from public.avatars
  where id = p_avatar_id and enabled = true;

  if v_price is null then
    raise exception 'Avatar no disponible.';
  end if;

  if exists (select 1 from public.user_avatars where user_id = v_user_id and avatar_id = p_avatar_id) then
    raise exception 'Ya tienes este avatar.';
  end if;

  select chips into v_chips
  from public.profiles
  where id = v_user_id
  for update;

  if coalesce(v_chips, 0) < v_price then
    raise exception 'No tienes fichas suficientes.';
  end if;

  update public.profiles
  set chips = chips - v_price
  where id = v_user_id;

  insert into public.user_avatars (user_id, avatar_id)
  values (v_user_id, p_avatar_id);

  insert into public.chip_transactions (user_id, amount, reason)
  values (v_user_id, -v_price, 'avatar_purchase:' || p_avatar_id);
end;
$$;

create or replace function public.equip_avatar(p_avatar_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesión para equipar avatares.';
  end if;

  perform public.ensure_default_avatar(v_user_id);

  if not exists (select 1 from public.user_avatars where user_id = v_user_id and avatar_id = p_avatar_id) then
    raise exception 'No tienes este avatar en tu inventario.';
  end if;

  update public.profiles
  set avatar_id = p_avatar_id
  where id = v_user_id;
end;
$$;

-- Actualiza el trigger de nuevos usuarios para entregar avatar inicial.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, username, avatar_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Jugador'),
    null,
    'default'
  )
  on conflict (id) do nothing;

  insert into public.user_avatars (user_id, avatar_id)
  values (new.id, 'default')
  on conflict (user_id, avatar_id) do nothing;

  return new;
end;
$$;

grant execute on function public.get_avatar_catalog() to authenticated;
grant execute on function public.buy_avatar(text) to authenticated;
grant execute on function public.equip_avatar(text) to authenticated;
