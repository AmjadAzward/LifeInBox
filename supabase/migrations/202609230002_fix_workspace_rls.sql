-- Avoid recursive RLS evaluation between workspaces and workspace_members.
-- SECURITY DEFINER membership checks run with the function owner's privileges.
create or replace function public.is_workspace_member(target_workspace_id uuid, target_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.workspace_members where workspace_id=target_workspace_id and user_id=target_user_id)
$$;

create or replace function public.is_workspace_owner(target_workspace_id uuid, target_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.workspaces where id=target_workspace_id and owner_id=target_user_id)
$$;

revoke all on function public.is_workspace_member(uuid,uuid) from public;
revoke all on function public.is_workspace_owner(uuid,uuid) from public;
grant execute on function public.is_workspace_member(uuid,uuid) to authenticated;
grant execute on function public.is_workspace_owner(uuid,uuid) to authenticated;

drop policy if exists workspaces_member on public.workspaces;
drop policy if exists workspaces_owner on public.workspaces;
drop policy if exists workspaces_select on public.workspaces;
drop policy if exists workspaces_owner_write on public.workspaces;
drop policy if exists members_visible on public.workspace_members;
drop policy if exists members_owner on public.workspace_members;
drop policy if exists members_select on public.workspace_members;
drop policy if exists members_owner_write on public.workspace_members;
drop policy if exists items_access on public.life_items;

create policy workspaces_select on public.workspaces for select
using(owner_id=auth.uid() or public.is_workspace_member(id));
create policy workspaces_owner_write on public.workspaces for all
using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy members_select on public.workspace_members for select
using(user_id=auth.uid() or public.is_workspace_owner(workspace_id));
create policy members_owner_write on public.workspace_members for all
using(public.is_workspace_owner(workspace_id)) with check(public.is_workspace_owner(workspace_id));
create policy items_access on public.life_items for all
using(owner_id=auth.uid() or (workspace_id is not null and public.is_workspace_member(workspace_id)))
with check(owner_id=auth.uid());
