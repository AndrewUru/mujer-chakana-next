-- Presencia en tiempo real: cada usuaria con sesión anuncia que está conectada
-- en el canal privado «presencia:app»; solo las administradoras pueden leer
-- quién está en línea. Sin estas políticas el canal rechaza la conexión y el
-- panel muestra la presencia como no disponible (el resto de la app no cambia).
--
-- Aditiva: no toca tablas ni datos. Para deshacerla basta con borrar las tres
-- políticas (presencia_app_track, presencia_app_join, presencia_app_listen).
begin;

drop policy if exists presencia_app_track on realtime.messages;
create policy presencia_app_track on realtime.messages
  for insert to authenticated
  with check (
    (select realtime.topic()) = 'presencia:app'
    and extension = 'presence'
  );

-- Realtime solo deja unirse a un canal privado a quien puede leer algo de él.
-- Leer «broadcast» permite unirse sin dar acceso a la presencia; nadie puede
-- emitir broadcast en este canal (no hay política de insert para ello).
drop policy if exists presencia_app_join on realtime.messages;
create policy presencia_app_join on realtime.messages
  for select to authenticated
  using (
    (select realtime.topic()) = 'presencia:app'
    and extension = 'broadcast'
  );

drop policy if exists presencia_app_listen on realtime.messages;
create policy presencia_app_listen on realtime.messages
  for select to authenticated
  using (
    (select realtime.topic()) = 'presencia:app'
    and extension = 'presence'
    and (select public.shop_is_admin())
  );

commit;
