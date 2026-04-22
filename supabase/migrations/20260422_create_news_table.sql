-- Create news table
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  excerpt text,
  cover_image_url text,
  cover_image_key text,
  category text not null default 'Community',
  tags jsonb default '[]'::jsonb,
  author_id uuid not null references auth.users(id) on delete cascade,
  is_published boolean not null default false,
  published_at timestamptz,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on news table
alter table public.news enable row level security;

-- Create indexes for performance
create index idx_news_published on public.news(is_published, published_at desc);
create index idx_news_category on public.news(category, is_published);
create index idx_news_author on public.news(author_id);

-- RLS Policies for news table
-- Anyone can view published news
create policy "Published news is viewable by everyone"
  on public.news for select
  using (is_published = true);

-- Admins can view all news (including drafts)
create policy "Admins can view all news"
  on public.news for select
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Only admins can create news
create policy "Only admins can create news"
  on public.news for insert
  with check (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Only admins can update news
create policy "Only admins can update news"
  on public.news for update
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Only admins can delete news
create policy "Only admins can delete news"
  on public.news for delete
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Create news_notifications table for tracking sent notifications
create table if not exists public.news_notifications (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null references public.news(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  sent_at timestamptz not null default now(),
  unique(news_id, user_id)
);

alter table public.news_notifications enable row level security;

-- RLS Policies for news_notifications
create policy "Users can view their own notifications"
  on public.news_notifications for select
  using (auth.uid() = user_id);

create policy "System can insert notifications"
  on public.news_notifications for insert
  with check (true);
