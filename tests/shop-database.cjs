// Integration test against PostgreSQL in WASM, isolated from the connected project.
// Run with PGLITE_MODULE pointing to an installed @electric-sql/pglite package.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { PGlite } = require(process.env.PGLITE_MODULE || '@electric-sql/pglite');
const admin = '11111111-1111-4111-8111-111111111111';
const member = '22222222-2222-4222-8222-222222222222';
const db = new PGlite();
async function as(role, user = '') {
  await db.exec(`reset role; set role ${role}; select set_config('request.jwt.claim.sub','${user}',false); select set_config('request.jwt.claim.role','${role}',false);`);
}
async function rejected(sql, params) { await assert.rejects(() => db.query(sql, params)); }
(async () => {
  await db.exec(`create role anon; create role authenticated; create schema auth; create schema storage;
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create function auth.role() returns text language sql stable as $$ select current_setting('request.jwt.claim.role',true) $$;
    grant usage on schema auth,storage,public to anon,authenticated;
    create table public.perfiles(user_id uuid primary key, rol text, display_name text);
    insert into public.perfiles values ('${admin}','admin','Admin'),('${member}','user','Member');
    grant select,insert,update,delete on public.perfiles to anon,authenticated;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;
    grant select,insert,update,delete on storage.objects to anon,authenticated;
    create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/') $$;
    create policy legacy_broad_storage on storage.objects for all to anon,authenticated using(true) with check(true);
  `);
  await db.exec(fs.readFileSync('supabase/migrations/202610120001_shop.sql','utf8'));
  await db.exec(fs.readFileSync('supabase/seeds/shop_demo.sql','utf8'));
  await as('anon');
  assert.equal((await db.query('select * from public.shop_products')).rows.length,14);
  await rejected("insert into public.shop_products(slug,name) values('hack','Hack')");
  await rejected('select public.shop_create_product()');
  await as('authenticated',member);
  await rejected('select public.shop_create_product()');
  await rejected("update public.perfiles set rol='admin' where user_id=$1",[member]);
  await rejected("insert into storage.objects(bucket_id,name) values('shop-products','hack.jpg')");
  assert.equal((await db.query("update public.shop_variants set price_cents=1 returning id")).rows.length,0);
  await as('authenticated',admin);
  const id=(await db.query('select public.shop_create_product() as id')).rows[0].id;
  const original=async()=> (await db.query('select * from public.shop_products where id=$1',[id])).rows[0];
  const product=await original();
  product.variants=(await db.query('select * from public.shop_variants where product_id=$1 order by sort_order',[id])).rows;
  assert.deepEqual(product.variants.map(v=>v.price_cents),[2200,3200,5200]);
  const imagePath=id+'/33333333-3333-4333-8333-333333333333.jpg';
  await db.query("insert into storage.objects(bucket_id,name) values('shop-products',$1)",[imagePath]);
  product.images=[{id:'44444444-4444-4444-8444-444444444444',storage_path:imagePath,image_type:'original',alt_text:'Ilustración de prueba',sort_order:0}];
  product.main_image_path=imagePath;product.status='published';product.name='Publicación de prueba';
  const save=()=>db.query('select public.shop_save_product($1,$2,$3::jsonb)',[id,product.updated_at,JSON.stringify(product)]);
  await save(); await assert.rejects(save,/SHOP_CONFLICT/);
  assert.equal((await db.query("delete from storage.objects where name=$1 returning name",[imagePath])).rows.length,0);
  const copy=(await db.query('select public.shop_duplicate_product($1) as id',[id])).rows[0].id;
  assert.equal((await db.query('select status from public.shop_products where id=$1',[copy])).rows[0].status,'draft');
  await as('anon');
  assert.equal((await db.query('select id from public.shop_products where id=$1',[id])).rows.length,1);
  assert.equal((await db.query('select id from public.shop_products where id=$1',[copy])).rows.length,0);
  assert.equal((await db.query('select id from public.shop_variants where product_id=$1',[copy])).rows.length,0);
  await rejected("insert into storage.objects(bucket_id,name) values('shop-products',$1)",[id+'/x.jpg']);
  await as('authenticated',admin);
  const before=(await db.query('select * from public.shop_variants where product_id=$1',[id])).rows;
  product.updated_at=(await original()).updated_at;
  product.variants[0].price_cents=-1;
  await assert.rejects(save);
  assert.deepEqual((await db.query('select * from public.shop_variants where product_id=$1',[id])).rows,before);
  await db.query("update public.shop_products set status='archived' where id=$1",[id]);
  await as('anon');
  assert.equal((await db.query('select id from public.shop_products where id=$1',[id])).rows.length,0);
  console.log('PASS: migration, demo seed, roles, RLS, storage legacy-policy guards, role escalation, defaults, atomic save, conflict detection, duplication, publication and archive');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>db.close());
