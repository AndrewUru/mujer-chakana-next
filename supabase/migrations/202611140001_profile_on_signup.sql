-- Crea el perfil en el servidor al registrarse una usuaria.
-- Con la confirmación de correo activa, signUp no devuelve sesión, así que el
-- insert desde el navegador se ejecutaba como "anon" y RLS lo rechazaba.
begin;

create or replace function public.handle_new_user_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id, user_id, email, display_name, perfil_completo, tipo_plan)
  select
    new.id,
    new.id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1)),
    false,
    'gratuito'
  where not exists (select 1 from public.perfiles where user_id = new.id);
  return new;
end $$;
revoke all on function public.handle_new_user_profile() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users
for each row execute function public.handle_new_user_profile();

-- Recupera las cuentas que se quedaron sin perfil por el error anterior.
insert into public.perfiles (id, user_id, email, display_name, perfil_completo, tipo_plan)
select
  u.id,
  u.id,
  u.email,
  coalesce(nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''), split_part(u.email, '@', 1)),
  false,
  'gratuito'
from auth.users u
where not exists (select 1 from public.perfiles p where p.user_id = u.id);

commit;
