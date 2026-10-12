-- One-time, additive installation. Does not modify existing profile data.
begin;

create function public.shop_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.perfiles where user_id = (select auth.uid()) and rol = 'admin');
$$;
revoke all on function public.shop_is_admin() from public;
grant execute on function public.shop_is_admin() to anon, authenticated;

-- Keep the existing role authoritative even if a legacy profile policy is broad.
create function public.shop_protect_profile_role() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') and not public.shop_is_admin() then
    if TG_OP = 'INSERT' and new.rol = 'admin' then raise exception 'No puedes asignar el rol administrador.'; end if;
    if TG_OP = 'UPDATE' and (new.rol is distinct from old.rol or new.user_id is distinct from old.user_id) then
      raise exception 'No puedes modificar los permisos de un perfil.';
    end if;
    if TG_OP = 'DELETE' and old.rol = 'admin' then raise exception 'No puedes eliminar un perfil administrador.'; end if;
  end if;
  if TG_OP = 'DELETE' then return old; end if;
  return new;
end $$;
revoke all on function public.shop_protect_profile_role() from public;
create trigger shop_protect_profile_role before insert or update or delete on public.perfiles
for each row execute function public.shop_protect_profile_role();

create table public.shop_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (length(slug) between 1 and 120 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) between 1 and 160),
  description text not null default '' check (length(description) <= 500),
  story text not null default '' check (length(story) <= 12000),
  author text not null default 'Samari' check (length(author) between 1 and 160),
  author_bio text not null default '' check (length(author_bio) <= 4000),
  paper_info text not null default 'Impresión de alta calidad sobre papel artístico.' check (length(paper_info) <= 1000),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  featured boolean not null default false,
  is_demo boolean not null default false,
  main_image_path text,
  seo_title text not null default '' check (length(seo_title) <= 160),
  meta_description text not null default '' check (length(meta_description) <= 320),
  og_image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default clock_timestamp()
);
create table public.shop_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.shop_products(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 100),
  width_cm numeric(7,2) not null check (width_cm > 0),
  height_cm numeric(7,2) not null check (height_cm > 0),
  price_cents integer not null check (price_cents between 1 and 100000000),
  active boolean not null default true,
  sort_order integer not null default 0
);
create table public.shop_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.shop_products(id) on delete cascade,
  storage_path text not null check (storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'),
  image_type text not null check (image_type in ('original','mockup','detail')),
  alt_text text not null default '' check (length(alt_text) <= 300),
  sort_order integer not null default 0,
  unique(product_id, storage_path)
);
create index shop_variants_product on public.shop_variants(product_id);
create index shop_images_product on public.shop_images(product_id);
create index shop_images_path on public.shop_images(storage_path);
create index shop_products_published on public.shop_products(status, featured, created_at);

-- Defaults live in the database, never in React. Existing products are independent.
create table public.shop_variant_defaults (
  id integer primary key,
  name text not null,
  width_cm numeric(7,2) not null check (width_cm > 0),
  height_cm numeric(7,2) not null check (height_cm > 0),
  price_cents integer not null check (price_cents > 0)
);
insert into public.shop_variant_defaults values (1,'A4',21,29.7,2200),(2,'A3',29.7,42,3200),(3,'50 × 70 cm',50,70,5200);

alter table public.shop_products enable row level security;
alter table public.shop_variants enable row level security;
alter table public.shop_images enable row level security;
alter table public.shop_variant_defaults enable row level security;
revoke all on public.shop_products, public.shop_variants, public.shop_images, public.shop_variant_defaults from anon, authenticated;
grant select on public.shop_products, public.shop_variants, public.shop_images to anon, authenticated;
grant insert, update, delete on public.shop_products, public.shop_variants, public.shop_images to authenticated;
grant select on public.shop_variant_defaults to authenticated;

create policy shop_products_read on public.shop_products for select to anon, authenticated using (status = 'published' or public.shop_is_admin());
create policy shop_products_admin on public.shop_products for all to authenticated using (public.shop_is_admin()) with check (public.shop_is_admin());
create policy shop_variants_read on public.shop_variants for select to anon, authenticated using (public.shop_is_admin() or (active and exists(select 1 from public.shop_products p where p.id = product_id and p.status = 'published')));
create policy shop_variants_admin on public.shop_variants for all to authenticated using (public.shop_is_admin()) with check (public.shop_is_admin());
create policy shop_images_read on public.shop_images for select to anon, authenticated using (public.shop_is_admin() or exists(select 1 from public.shop_products p where p.id = product_id and p.status = 'published'));
create policy shop_images_admin on public.shop_images for all to authenticated using (public.shop_is_admin()) with check (public.shop_is_admin());
create policy shop_defaults_read on public.shop_variant_defaults for select to authenticated using (public.shop_is_admin());

create function public.shop_touch_product() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = clock_timestamp(); return new; end $$;
create trigger shop_touch before update on public.shop_products for each row execute function public.shop_touch_product();

create function public.shop_create_product() returns uuid language plpgsql security invoker set search_path = '' as $$
declare product uuid := gen_random_uuid();
begin
  if not public.shop_is_admin() then raise exception 'Solo las administradoras pueden crear obras.'; end if;
  insert into public.shop_products(id,slug,name,description) values(product,'obra-' || product::text,'Nueva ilustración','Reproducción artística de una ilustración original de Samari.');
  insert into public.shop_variants(product_id,name,width_cm,height_cm,price_cents,sort_order)
    select product,name,width_cm,height_cm,price_cents,id from public.shop_variant_defaults order by id;
  return product;
end $$;

-- Atomic product + variants + image metadata save, with stale-editor protection.
create function public.shop_save_product(p_id uuid, p_expected_updated_at timestamptz, p_data jsonb) returns timestamptz
language plpgsql security invoker set search_path = '' as $$
declare current_version timestamptz; result_version timestamptz; item jsonb; image_path text;
begin
  if not public.shop_is_admin() then raise exception 'Solo las administradoras pueden guardar obras.'; end if;
  select updated_at into current_version from public.shop_products where id=p_id for update;
  if not found then raise exception 'No encontramos esta obra.'; end if;
  if p_expected_updated_at is distinct from current_version then raise exception 'SHOP_CONFLICT'; end if;
  if jsonb_typeof(p_data->'variants') is distinct from 'array' or jsonb_typeof(p_data->'images') is distinct from 'array' then raise exception 'Faltan los tamaños o las imágenes.'; end if;
  if jsonb_array_length(p_data->'variants') > 30 or jsonb_array_length(p_data->'images') > 30 then raise exception 'Máximo 30 tamaños e imágenes por obra.'; end if;
  if p_data->>'status' = 'published' and not coalesce((p_data->>'is_demo')::boolean,false) then
    if not exists(select 1 from jsonb_array_elements(p_data->'variants') v where (v->>'active')::boolean) then raise exception 'Activa al menos un tamaño antes de publicar.'; end if;
    if not exists(select 1 from jsonb_array_elements(p_data->'images') i where i->>'storage_path'=p_data->>'main_image_path' and i->>'image_type'='original' and length(trim(i->>'alt_text')) > 0) then raise exception 'Añade una imagen principal original con texto ALT antes de publicar.'; end if;
  end if;
  for item in select * from jsonb_array_elements(p_data->'images') loop
    image_path := item->>'storage_path';
    if not exists(select 1 from storage.objects where bucket_id='shop-products' and name=image_path) then raise exception 'Una imagen ya no está disponible. Vuelve a subirla.'; end if;
  end loop;
  if nullif(p_data->>'main_image_path','') is not null and not exists(select 1 from jsonb_array_elements(p_data->'images') i where i->>'storage_path'=p_data->>'main_image_path' and i->>'image_type'='original') then raise exception 'La imagen principal debe ser una imagen original de la galería.'; end if;
  if nullif(p_data->>'og_image_path','') is not null and not exists(select 1 from jsonb_array_elements(p_data->'images') i where i->>'storage_path'=p_data->>'og_image_path') then raise exception 'Elige una imagen de la galería para SEO.'; end if;

  delete from public.shop_variants where product_id=p_id and id not in (select (v->>'id')::uuid from jsonb_array_elements(p_data->'variants') v);
  for item in select * from jsonb_array_elements(p_data->'variants') loop
    insert into public.shop_variants(id,product_id,name,width_cm,height_cm,price_cents,active,sort_order)
    values((item->>'id')::uuid,p_id,item->>'name',(item->>'width_cm')::numeric,(item->>'height_cm')::numeric,(item->>'price_cents')::integer,(item->>'active')::boolean,(item->>'sort_order')::integer)
    on conflict(id) do update set name=excluded.name,width_cm=excluded.width_cm,height_cm=excluded.height_cm,price_cents=excluded.price_cents,active=excluded.active,sort_order=excluded.sort_order where shop_variants.product_id=p_id;
    if not found then raise exception 'Un tamaño pertenece a otra obra.'; end if;
  end loop;
  delete from public.shop_images where product_id=p_id;
  for item in select * from jsonb_array_elements(p_data->'images') loop
    insert into public.shop_images(id,product_id,storage_path,image_type,alt_text,sort_order)
    values((item->>'id')::uuid,p_id,item->>'storage_path',item->>'image_type',coalesce(item->>'alt_text',''),(item->>'sort_order')::integer);
  end loop;
  update public.shop_products set name=trim(p_data->>'name'),slug=p_data->>'slug',description=p_data->>'description',story=p_data->>'story',author=p_data->>'author',author_bio=p_data->>'author_bio',paper_info=p_data->>'paper_info',status=p_data->>'status',featured=(p_data->>'featured')::boolean,is_demo=(p_data->>'is_demo')::boolean,main_image_path=nullif(p_data->>'main_image_path',''),seo_title=p_data->>'seo_title',meta_description=p_data->>'meta_description',og_image_path=nullif(p_data->>'og_image_path','') where id=p_id returning updated_at into result_version;
  return result_version;
end $$;

create function public.shop_duplicate_product(p_id uuid) returns uuid language plpgsql security invoker set search_path = '' as $$
declare result uuid := gen_random_uuid();
begin
  if not public.shop_is_admin() then raise exception 'Solo las administradoras pueden duplicar obras.'; end if;
  perform 1 from public.shop_products where id=p_id for update;
  if not found then raise exception 'No encontramos esta obra.'; end if;
  insert into public.shop_products(id,slug,name,description,story,author,author_bio,paper_info,featured,is_demo,main_image_path,seo_title,meta_description,og_image_path)
    select result,'copia-'||result::text,left(name,150)||' (copia)',description,story,author,author_bio,paper_info,false,is_demo,main_image_path,seo_title,meta_description,og_image_path from public.shop_products where id=p_id;
  insert into public.shop_variants(product_id,name,width_cm,height_cm,price_cents,active,sort_order)
    select result,name,width_cm,height_cm,price_cents,active,sort_order from public.shop_variants where product_id=p_id;
  insert into public.shop_images(product_id,storage_path,image_type,alt_text,sort_order)
    select result,storage_path,image_type,alt_text,sort_order from public.shop_images where product_id=p_id;
  return result;
end $$;
revoke all on function public.shop_create_product(), public.shop_save_product(uuid,timestamptz,jsonb), public.shop_duplicate_product(uuid), public.shop_touch_product() from public;
grant execute on function public.shop_create_product(), public.shop_save_product(uuid,timestamptz,jsonb), public.shop_duplicate_product(uuid) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('shop-products','shop-products',true,8388608,array['image/jpeg','image/png','image/webp']);
create policy shop_storage_admin_read on storage.objects for select to authenticated using(bucket_id='shop-products' and public.shop_is_admin());
create policy shop_storage_admin_insert on storage.objects for insert to authenticated with check(bucket_id='shop-products' and public.shop_is_admin() and exists(select 1 from public.shop_products where id::text=(storage.foldername(name))[1]));
create policy shop_storage_admin_update on storage.objects for update to authenticated using(bucket_id='shop-products' and public.shop_is_admin()) with check(bucket_id='shop-products' and public.shop_is_admin());
create policy shop_storage_admin_delete on storage.objects for delete to authenticated using(bucket_id='shop-products' and public.shop_is_admin() and not exists(select 1 from public.shop_images where storage_path=name));
-- Restrictive guards prevent legacy permissive policies from granting writes here.
create policy shop_storage_insert_guard on storage.objects as restrictive for insert to public with check(bucket_id <> 'shop-products' or (public.shop_is_admin() and exists(select 1 from public.shop_products where id::text=(storage.foldername(name))[1])));
create policy shop_storage_update_guard on storage.objects as restrictive for update to public using(bucket_id <> 'shop-products' or public.shop_is_admin()) with check(bucket_id <> 'shop-products' or public.shop_is_admin());
create policy shop_storage_delete_guard on storage.objects as restrictive for delete to public using(bucket_id <> 'shop-products' or (public.shop_is_admin() and not exists(select 1 from public.shop_images where storage_path=name)));

commit;
