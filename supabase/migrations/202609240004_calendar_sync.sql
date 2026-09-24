create table if not exists public.calendar_sync_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  life_item_id uuid not null references public.life_items(id) on delete cascade,
  provider text not null check (provider in ('GOOGLE_CALENDAR','OUTLOOK_CALENDAR')),
  external_event_id text not null,
  external_etag text,
  last_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(owner_id, provider, life_item_id),
  unique(owner_id, provider, external_event_id)
);

alter table public.calendar_sync_links enable row level security;
drop policy if exists calendar_sync_links_self on public.calendar_sync_links;
create policy calendar_sync_links_self on public.calendar_sync_links for all
  using(owner_id=auth.uid()) with check(owner_id=auth.uid());

create index if not exists calendar_sync_links_item_idx on public.calendar_sync_links(life_item_id);
