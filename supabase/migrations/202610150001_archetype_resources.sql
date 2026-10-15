begin;

create function public.archetype_resources_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.perfiles where user_id = (select auth.uid()) and rol = 'admin');
$$;
revoke all on function public.archetype_resources_is_admin() from public;
grant execute on function public.archetype_resources_is_admin() to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('arquetipo-recursos', 'arquetipo-recursos', true, 52428800,
  array['application/pdf','audio/mpeg','audio/mp3','audio/mp4','audio/x-m4a','audio/wav','audio/x-wav','audio/ogg','audio/aac','audio/webm']);

create policy archetype_resources_insert on storage.objects for insert to authenticated
with check (bucket_id = 'arquetipo-recursos' and public.archetype_resources_is_admin()
  and exists(select 1 from public.mujer_chakana where id::text = (storage.foldername(storage.objects.name))[1]));

-- Restrictive guards also protect this bucket from broad legacy storage policies.
create policy archetype_resources_insert_guard on storage.objects as restrictive for insert to public
with check (bucket_id <> 'arquetipo-recursos' or (public.archetype_resources_is_admin()
  and exists(select 1 from public.mujer_chakana where id::text = (storage.foldername(storage.objects.name))[1])));
create policy archetype_resources_update_guard on storage.objects as restrictive for update to public
using (bucket_id <> 'arquetipo-recursos') with check (bucket_id <> 'arquetipo-recursos');
create policy archetype_resources_delete_guard on storage.objects as restrictive for delete to public
using (bucket_id <> 'arquetipo-recursos');

commit;
