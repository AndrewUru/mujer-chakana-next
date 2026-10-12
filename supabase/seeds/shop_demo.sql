-- Optional, explicit demo catalog. Run once after the shop migration.
-- Demo works have NO invented art/history and cannot be added to the cart.
begin;
insert into public.shop_products(slug,name,description,status,is_demo,featured)
select 'obra-demo-'||lpad(n::text,2,'0'),'Obra '||lpad(n::text,2,'0'),
  'Contenido temporal de demostración. La ilustración real se añadirá próximamente.',
  'published',true,n in (1,5,9)
from generate_series(1,14) n on conflict(slug) do nothing;
insert into public.shop_variants(product_id,name,width_cm,height_cm,price_cents,sort_order)
select p.id,d.name,d.width_cm,d.height_cm,d.price_cents,d.id from public.shop_products p cross join public.shop_variant_defaults d
where p.is_demo and p.slug like 'obra-demo-%' and not exists(select 1 from public.shop_variants v where v.product_id=p.id);
commit;
