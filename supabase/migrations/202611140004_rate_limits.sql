-- Contador de uso por ventana fija para las rutas de IA. Solo lo usa el
-- servidor con la clave service_role. Sin esta migración el límite no se
-- aplica (la app sigue funcionando), así que puede aplicarse en cualquier momento.
begin;

create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);
create index if not exists rate_limits_window_start_idx on public.rate_limits (window_start);

alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from public, anon, authenticated;

-- Suma un uso y devuelve true mientras no se supere el límite de la ventana.
create or replace function public.consume_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql security invoker set search_path = '' as $$
declare
  current_window timestamptz := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds
  );
  current_hits integer;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, current_window, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning r.hits into current_hits;

  delete from public.rate_limits where window_start < clock_timestamp() - interval '2 days';

  return current_hits <= p_limit;
end $$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

commit;
