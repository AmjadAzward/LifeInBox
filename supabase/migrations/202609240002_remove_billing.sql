-- LifeInbox no longer has paid plans or billing.
alter table public.profiles
  drop column if exists stripe_customer_id,
  drop column if exists subscription_plan;
