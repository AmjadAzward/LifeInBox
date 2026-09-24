alter table public.life_items
  add column if not exists deleted_at timestamptz,
  add column if not exists due_time time,
  add column if not exists event_time time,
  add column if not exists expiry_time time;

alter table public.attachments
  add column if not exists extraction_status text not null default 'PENDING'
    check (extraction_status in ('PENDING','PROCESSING','COMPLETED','FAILED','UNSUPPORTED')),
  add column if not exists extraction_error text;

create table if not exists public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('GOOGLE_CALENDAR','OUTLOOK_CALENDAR')),
  encrypted_access_token text,
  encrypted_refresh_token text,
  expires_at timestamptz,
  calendar_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, provider)
);

alter table public.integration_connections enable row level security;
drop policy if exists integration_connections_self on public.integration_connections;
create policy integration_connections_self on public.integration_connections for select using(owner_id=auth.uid());

create index if not exists life_items_deleted_idx on public.life_items(owner_id, deleted_at);
