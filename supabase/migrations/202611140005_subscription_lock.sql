-- La suscripción deja de poder escribirse desde el navegador: solo la cambian
-- el servidor (service_role, tras verificar con PayPal) y las administradoras.
--
-- APLICAR JUNTO CON EL DESPLIEGUE del código que usa /api/suscripcion/activar.
-- Si se aplica antes, el botón de PayPal de la versión antigua cobra pero no
-- consigue activar la cuenta.
begin;

alter table public.perfiles add column if not exists paypal_subscription_id text;
create unique index if not exists perfiles_paypal_subscription_id_key
  on public.perfiles (paypal_subscription_id) where paypal_subscription_id is not null;

create or replace function public.perfiles_protect_billing() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') and not public.shop_is_admin() then
    if TG_OP = 'INSERT' then
      new.suscripcion_activa := false;
      new.tipo_plan := 'gratuito';
      new.fecha_expiracion := null;
      new.paypal_subscription_id := null;
    elsif new.suscripcion_activa is distinct from old.suscripcion_activa
       or new.tipo_plan is distinct from old.tipo_plan
       or new.fecha_expiracion is distinct from old.fecha_expiracion
       or new.paypal_subscription_id is distinct from old.paypal_subscription_id then
      raise exception 'La suscripción solo puede cambiarse desde el servidor.';
    end if;
  end if;
  return new;
end $$;
revoke all on function public.perfiles_protect_billing() from public, anon, authenticated;

drop trigger if exists perfiles_protect_billing on public.perfiles;
create trigger perfiles_protect_billing before insert or update on public.perfiles
for each row execute function public.perfiles_protect_billing();

-- La base de datos usa ahora el mismo criterio que la interfaz: los recursos
-- gratuitos los ve cualquier usuaria con sesión y el resto requiere una
-- suscripción activa (antes dependía de tipo_plan, que el alta podía elegir).
drop policy if exists "Ver recursos según tipo de plan" on public.recursos;
drop policy if exists recursos_select_by_subscription on public.recursos;
create policy recursos_select_by_subscription on public.recursos
  for select to authenticated using (
    tipo_suscripcion = 'gratuito'
    or exists (
      select 1 from public.perfiles p
      where p.user_id = (select auth.uid()) and p.suscripcion_activa
    )
  );

commit;
