create extension if not exists pgcrypto;

create type public.life_item_category as enum ('BILL','APPOINTMENT','TRAVEL','SUBSCRIPTION','INSURANCE','WARRANTY','DOCUMENT_EXPIRY','RESERVATION','RETURN','DELIVERY','VEHICLE','MEMBERSHIP','MEDICATION','BORROWING','GENERAL_REMINDER');
create type public.life_item_status as enum ('UPCOMING','NEEDS_ATTENTION','DUE_TODAY','OVERDUE','COMPLETED','EXPIRED','ARCHIVED');
create type public.reminder_channel as enum ('PUSH','EMAIL','BOTH');
create type public.reminder_status as enum ('PENDING','SENT','FAILED','CANCELLED');
create type public.workspace_role as enum ('OWNER','ADMIN','MEMBER');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '', email text not null default '', image_url text,
  country text not null default '', timezone text not null default 'UTC',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  push_enabled boolean not null default true, email_enabled boolean not null default true,
  morning_summary boolean not null default true, weekly_summary boolean not null default false,
  default_notification_time time not null default '08:00', timezone text not null default 'UTC',
  updated_at timestamptz not null default now()
);
create table public.workspaces (
  id uuid primary key default gen_random_uuid(), name text not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.workspace_members (
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role public.workspace_role not null default 'MEMBER', joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null, role public.workspace_role not null default 'MEMBER', token uuid not null default gen_random_uuid() unique,
  expires_at timestamptz not null default now() + interval '7 days', accepted_at timestamptz,
  created_by uuid not null references public.profiles(id), created_at timestamptz not null default now()
);
create table public.life_items (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade, title text not null,
  category public.life_item_category not null, description text, organization text, person_name text,
  amount numeric(14,2), currency char(3) not null default 'LKR', issue_date date, due_date date,
  event_date date, expiry_date date, reference_number text, location text, action_required text,
  status public.life_item_status not null default 'UPCOMING', recurring boolean not null default false,
  recurrence_rule text, ai_generated boolean not null default false, ai_confidence real not null default 1 check(ai_confidence between 0 and 1),
  confirmed boolean not null default true, completed_at timestamptz, archived_at timestamptz,
  search_vector tsvector generated always as (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(organization,'') || ' ' || coalesce(reference_number,''))) stored,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index life_items_search_idx on public.life_items using gin(search_vector);
create index life_items_owner_date_idx on public.life_items(owner_id, due_date, event_date, expiry_date);
create table public.attachments (
  id uuid primary key default gen_random_uuid(), life_item_id uuid references public.life_items(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade, file_name text not null,
  storage_path text not null unique, file_type text not null check(file_type in ('IMAGE','PDF')),
  mime_type text not null, file_size bigint not null check(file_size between 1 and 10485760),
  created_at timestamptz not null default now()
);
create table public.reminders (
  id uuid primary key default gen_random_uuid(), life_item_id uuid not null references public.life_items(id) on delete cascade,
  remind_at timestamptz not null, channel public.reminder_channel not null default 'BOTH',
  status public.reminder_status not null default 'PENDING', sent_at timestamptz, failed_at timestamptz,
  last_error text, attempts int not null default 0, created_at timestamptz not null default now()
);
create index reminders_due_idx on public.reminders(status, remind_at);
create table public.notifications (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  life_item_id uuid references public.life_items(id) on delete cascade, title text not null, message text not null,
  type text not null default 'REMINDER', read boolean not null default false, created_at timestamptz not null default now()
);
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique, p256dh text not null, auth text not null, created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into profiles(id, full_name, email, country, timezone) values(new.id, coalesce(new.raw_user_meta_data->>'full_name',''), coalesce(new.email,''), coalesce(new.raw_user_meta_data->>'country',''), coalesce(new.raw_user_meta_data->>'timezone','UTC'));
  insert into user_preferences(user_id, timezone) values(new.id, coalesce(new.raw_user_meta_data->>'timezone','UTC'));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table profiles enable row level security; alter table user_preferences enable row level security;
alter table workspaces enable row level security; alter table workspace_members enable row level security;
alter table workspace_invites enable row level security; alter table life_items enable row level security;
alter table attachments enable row level security; alter table reminders enable row level security;
alter table notifications enable row level security; alter table push_subscriptions enable row level security;
create policy profiles_self on profiles for all using(id=auth.uid()) with check(id=auth.uid());
create policy preferences_self on user_preferences for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy workspaces_member on workspaces for select using(owner_id=auth.uid() or exists(select 1 from workspace_members m where m.workspace_id=id and m.user_id=auth.uid()));
create policy workspaces_owner on workspaces for all using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy members_visible on workspace_members for select using(user_id=auth.uid() or exists(select 1 from workspaces w where w.id=workspace_id and w.owner_id=auth.uid()));
create policy members_owner on workspace_members for all using(exists(select 1 from workspaces w where w.id=workspace_id and w.owner_id=auth.uid())) with check(exists(select 1 from workspaces w where w.id=workspace_id and w.owner_id=auth.uid()));
create policy invites_owner on workspace_invites for all using(created_by=auth.uid()) with check(created_by=auth.uid());
create policy items_access on life_items for all using(owner_id=auth.uid() or (workspace_id is not null and exists(select 1 from workspace_members m where m.workspace_id=life_items.workspace_id and m.user_id=auth.uid()))) with check(owner_id=auth.uid());
create policy attachments_access on attachments for all using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy reminders_access on reminders for all using(exists(select 1 from life_items i where i.id=life_item_id and i.owner_id=auth.uid())) with check(exists(select 1 from life_items i where i.id=life_item_id and i.owner_id=auth.uid()));
create policy notifications_self on notifications for all using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy pushes_self on push_subscriptions for all using(owner_id=auth.uid()) with check(owner_id=auth.uid());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('documents','documents',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf']) on conflict(id) do nothing;
create policy document_read on storage.objects for select using(bucket_id='documents' and (storage.foldername(name))[1]=auth.uid()::text);
create policy document_insert on storage.objects for insert with check(bucket_id='documents' and (storage.foldername(name))[1]=auth.uid()::text);
create policy document_delete on storage.objects for delete using(bucket_id='documents' and (storage.foldername(name))[1]=auth.uid()::text);
