# Backup and recovery runbook

Supabase is the system of record. Before production, enable the backup option appropriate to the selected Supabase plan and perform a recovery drill in a separate project.

1. Export the database schema and data with `supabase db dump` or `pg_dump`.
2. Export the private `documents` bucket separately.
3. Store encrypted backups outside the production Supabase organization.
4. Restore into an empty test project.
5. Apply every migration in `supabase/migrations` in order.
6. Verify authentication profiles, life items, reminders, workspaces, RLS, and signed document downloads.
7. Record the recovery time and any missing data.

Never test restoration against the production database. Schedule recurring restore drills and document the person responsible for them.
