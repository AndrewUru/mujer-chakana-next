-- Archivos PDF de los recursos de la biblioteca, subidos desde el panel de
-- administración. Mismo esquema que las portadas (recursos-portadas): bucket
-- público, solo suben las administradoras y cada subida usa una ruta nueva.
--
-- Público como el de los arquetipos: quien tenga el enlace puede abrir el PDF.
-- Aditiva: no toca tablas ni datos existentes.
begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recursos-archivos', 'recursos-archivos', true, 20971520, array['application/pdf'])
on conflict (id) do nothing;

drop policy if exists resource_files_insert on storage.objects;
create policy resource_files_insert on storage.objects for insert to authenticated
with check (bucket_id = 'recursos-archivos' and public.archetype_resources_is_admin());

-- Las guardas restrictivas protegen el bucket de las políticas antiguas que
-- permiten subir a cualquier usuaria autenticada.
drop policy if exists resource_files_insert_guard on storage.objects;
create policy resource_files_insert_guard on storage.objects as restrictive for insert to public
with check (bucket_id <> 'recursos-archivos' or public.archetype_resources_is_admin());
drop policy if exists resource_files_update_guard on storage.objects;
create policy resource_files_update_guard on storage.objects as restrictive for update to public
using (bucket_id <> 'recursos-archivos') with check (bucket_id <> 'recursos-archivos');
drop policy if exists resource_files_delete_guard on storage.objects;
create policy resource_files_delete_guard on storage.objects as restrictive for delete to public
using (bucket_id <> 'recursos-archivos');

commit;
