-- Cierra la lectura pública de perfiles (correo, nombre, plan y rol eran
-- visibles con la clave anónima) y la lectura sin sesión de los arquetipos.
-- No depende de ningún cambio de código: puede aplicarse en cualquier momento.
begin;

drop policy if exists "Enable read access for all users" on public.perfiles;

-- La política anterior consultaba perfiles desde una política de perfiles.
-- shop_is_admin() es security definer y evita esa autorreferencia.
drop policy if exists admin_update_suscripcion on public.perfiles;
drop policy if exists perfiles_admin_select on public.perfiles;
drop policy if exists perfiles_admin_update on public.perfiles;

create policy perfiles_admin_select on public.perfiles
  for select to authenticated using ((select public.shop_is_admin()));
create policy perfiles_admin_update on public.perfiles
  for update to authenticated
  using ((select public.shop_is_admin())) with check ((select public.shop_is_admin()));

-- Sin sesión no hay nada que hacer en perfiles: el alta la crea un trigger.
revoke all on public.perfiles from anon;

-- Los arquetipos (con sus audios y rituales) solo se leen con sesión iniciada.
drop policy if exists "Enable read access for all users" on public.mujer_chakana;

commit;
