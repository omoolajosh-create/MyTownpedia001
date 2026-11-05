-- Admin-only Web Push subscriptions. The browser stores only the public subscription
-- endpoint and encryption keys; VAPID private keys stay in Supabase Edge Function secrets.
create table if not exists public.admin_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.admin_push_subscriptions enable row level security;

create policy "Admins manage their own push subscriptions"
  on public.admin_push_subscriptions for all
  to authenticated
  using (user_id = auth.uid() and public.has_role(auth.uid(), 'admin'))
  with check (user_id = auth.uid() and public.has_role(auth.uid(), 'admin'));

create index if not exists idx_admin_push_subscriptions_user
  on public.admin_push_subscriptions(user_id);

-- Run the accompanying notify-admins Edge Function from the fetch-news function
-- after new pending_content rows are inserted. Required secrets:
-- VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.
