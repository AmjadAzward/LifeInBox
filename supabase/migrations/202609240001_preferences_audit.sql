alter table public.user_preferences
  add column if not exists theme text not null default 'system' check (theme in ('light','dark','system')),
  add column if not exists language text not null default 'en',
  add column if not exists locale text not null default 'en-LK',
  add column if not exists currency char(3) not null default 'LKR',
  add column if not exists date_format text not null default 'dd/MM/yyyy',
  add column if not exists time_format text not null default '24h' check (time_format in ('12h','24h')),
  add column if not exists reminder_defaults jsonb not null default '{}'::jsonb;

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  reminder_id uuid references public.reminders(id) on delete set null,
  channel public.reminder_channel not null,
  status public.reminder_status not null,
  error text,
  attempted_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.extraction_feedback (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  life_item_id uuid references public.life_items(id) on delete set null,
  attachment_id uuid references public.attachments(id) on delete set null,
  extraction jsonb not null,
  corrections jsonb,
  helpful boolean,
  created_at timestamptz not null default now()
);

alter table public.notification_deliveries enable row level security;
alter table public.audit_logs enable row level security;
alter table public.extraction_feedback enable row level security;

drop policy if exists notification_deliveries_self on public.notification_deliveries;
create policy notification_deliveries_self on public.notification_deliveries for select using (owner_id=auth.uid());
drop policy if exists audit_logs_self on public.audit_logs;
create policy audit_logs_self on public.audit_logs for select using (owner_id=auth.uid());
drop policy if exists extraction_feedback_self on public.extraction_feedback;
create policy extraction_feedback_self on public.extraction_feedback for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());

create index if not exists notification_deliveries_owner_idx on public.notification_deliveries(owner_id, attempted_at desc);
create index if not exists audit_logs_owner_idx on public.audit_logs(owner_id, created_at desc);
