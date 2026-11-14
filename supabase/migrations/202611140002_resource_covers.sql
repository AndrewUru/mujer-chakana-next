-- Portadas de los recursos de la biblioteca.
begin;

alter table public.recursos add column if not exists imagen_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recursos-portadas', 'recursos-portadas', true, 5242880,
  array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Solo las administradoras suben portadas. Cada subida usa una ruta nueva, así
-- que nadie necesita sobrescribir ni borrar objetos desde el navegador.
create policy resource_covers_insert on storage.objects for insert to authenticated
with check (bucket_id = 'recursos-portadas' and public.archetype_resources_is_admin());

-- Las guardas restrictivas protegen el bucket de las políticas antiguas que
-- permiten subir a cualquier usuaria autenticada.
create policy resource_covers_insert_guard on storage.objects as restrictive for insert to public
with check (bucket_id <> 'recursos-portadas' or public.archetype_resources_is_admin());
create policy resource_covers_update_guard on storage.objects as restrictive for update to public
using (bucket_id <> 'recursos-portadas') with check (bucket_id <> 'recursos-portadas');
create policy resource_covers_delete_guard on storage.objects as restrictive for delete to public
using (bucket_id <> 'recursos-portadas');

commit;
