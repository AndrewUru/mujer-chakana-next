-- Read-only diagnostics. Run in the SQL Editor of the active Supabase project.
-- No user records, files, bucket settings or policies are modified.

-- An empty result means the bucket has not been created in this project.
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'avatars';

-- Uploading with upsert requires INSERT, SELECT and UPDATE access.
-- Inspect all policies: permissive and restrictive policies can interact.
select tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'storage'
  and tablename in ('buckets', 'objects')
order by tablename, policyname;

-- Metadata count only; no file contents or user identifiers are returned.
select count(*) as avatar_object_count
from storage.objects
where bucket_id = 'avatars';
