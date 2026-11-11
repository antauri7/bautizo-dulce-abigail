-- Ejecutar en un proyecto Supabase nuevo. No existen políticas para visitantes.
create table public.memories (
 id uuid primary key default gen_random_uuid(),
 path text unique not null,
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 mime text not null check (mime in ('image/jpeg','image/png')),
 bytes integer not null check (bytes > 0 and bytes <= 6291456),
 consent_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
alter table public.memories enable row level security;
revoke all on public.memories from anon, authenticated;
create table public.upload_limits (key text primary key, count integer not null default 1, expires_at timestamptz not null);
alter table public.upload_limits enable row level security;
revoke all on public.upload_limits from anon, authenticated;
create or replace function public.reserve_upload(p_key text, p_max integer, p_expires timestamptz)
returns boolean language plpgsql security invoker set search_path=public as $$
declare hits integer;
begin
 insert into public.upload_limits(key,count,expires_at) values(p_key,1,p_expires)
 on conflict(key) do update set count=upload_limits.count+1 returning count into hits;
 return hits<=p_max;
end; $$;
revoke all on function public.reserve_upload(text,integer,timestamptz) from public,anon,authenticated;
grant execute on function public.reserve_upload(text,integer,timestamptz) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('memories-private','memories-private',false,6291456,array['image/jpeg','image/png']);
-- No añadir políticas públicas a storage.objects. Solo la función con service_role accede.

grant select, insert, update, delete on public.memories, public.upload_limits to service_role;
create index memories_approved_created_idx on public.memories(created_at desc) where status = 'approved';
