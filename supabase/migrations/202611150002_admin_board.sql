-- Pizarra colaborativa del panel de administración (/admin/pizarra).
-- Los elementos se guardan en admin_board_items; los movimientos y cursores en
-- vivo viajan por el canal privado «pizarra:admin». Todo es exclusivo de las
-- administradoras.
--
-- Aditiva: crea una tabla nueva y dos políticas de Realtime. Para deshacerla:
--   drop table public.admin_board_items;
--   drop policy pizarra_admin_read on realtime.messages;
--   drop policy pizarra_admin_write on realtime.messages;
begin;

create table if not exists public.admin_board_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('note', 'text', 'rect', 'ellipse')),
  x double precision not null default 0,
  y double precision not null default 0,
  w double precision not null default 200 check (w between 20 and 4000),
  h double precision not null default 160 check (h between 20 and 4000),
  content text not null default '' check (char_length(content) <= 4000),
  color text not null default 'yellow' check (char_length(color) <= 20),
  z bigint not null default 0,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.admin_board_items enable row level security;
revoke all on public.admin_board_items from anon, authenticated;
grant select, insert, update, delete on public.admin_board_items to authenticated;

drop policy if exists admin_board_items_admin on public.admin_board_items;
create policy admin_board_items_admin on public.admin_board_items
  for all to authenticated
  using ((select public.shop_is_admin()))
  with check ((select public.shop_is_admin()));

drop policy if exists pizarra_admin_read on realtime.messages;
create policy pizarra_admin_read on realtime.messages
  for select to authenticated
  using (
    (select realtime.topic()) = 'pizarra:admin'
    and extension in ('broadcast', 'presence')
    and (select public.shop_is_admin())
  );

drop policy if exists pizarra_admin_write on realtime.messages;
create policy pizarra_admin_write on realtime.messages
  for insert to authenticated
  with check (
    (select realtime.topic()) = 'pizarra:admin'
    and extension in ('broadcast', 'presence')
    and (select public.shop_is_admin())
  );

commit;
