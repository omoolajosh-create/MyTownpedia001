-- Create content_sources table to track data sources
create table if not exists public.content_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  source_type text not null, -- 'rss', 'api', 'web_scrape'
  url text not null,
  api_key text,
  category text not null, -- 'news', 'jobs', 'events', 'opportunities'
  is_active boolean not null default true,
  last_fetched_at timestamptz,
  fetch_frequency_minutes integer default 60,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_sources enable row level security;

-- Create pending_content table for content awaiting approval
create table if not exists public.pending_content (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.content_sources(id) on delete cascade,
  original_title text not null,
  original_content text not null,
  original_url text,
  original_source text,
  
  -- Rewritten content
  rewritten_title text,
  rewritten_content text,
  rewritten_excerpt text,
  
  -- Metadata
  content_type text not null, -- 'news', 'job', 'event', 'opportunity'
  category text not null,
  tags jsonb default '[]'::jsonb,
  image_url text,
  
  -- AI Processing
  ai_rewrite_status text default 'pending', -- 'pending', 'processing', 'completed', 'failed'
  ai_quality_score integer, -- 0-100
  ai_originality_score integer, -- 0-100
  
  -- Approval
  approval_status text not null default 'pending', -- 'pending', 'approved', 'rejected'
  approval_notes text,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  
  -- Publishing
  published_news_id uuid references public.news(id) on delete set null,
  published_at timestamptz,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pending_content enable row level security;

-- Create content_cache table to avoid duplicates
create table if not exists public.content_cache (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.content_sources(id) on delete cascade,
  original_url text not null,
  title_hash text not null,
  content_hash text not null,
  created_at timestamptz not null default now(),
  unique(source_id, title_hash, content_hash)
);

alter table public.content_cache enable row level security;

-- Create content_logs table for tracking aggregation activity
create table if not exists public.content_logs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.content_sources(id) on delete set null,
  action text not null, -- 'fetched', 'rewritten', 'approved', 'published', 'rejected', 'error'
  content_id uuid references public.pending_content(id) on delete set null,
  details jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.content_logs enable row level security;

-- Create indexes for performance
create index if not exists idx_pending_content_status on public.pending_content(approval_status, ai_rewrite_status);
create index if not exists idx_pending_content_type on public.pending_content(content_type, category);
create index if not exists idx_content_sources_active on public.content_sources(is_active);
create index if not exists idx_content_cache_hash on public.content_cache(title_hash, content_hash);
create index if not exists idx_content_logs_source on public.content_logs(source_id, created_at desc);

-- RLS Policies for content_sources (admins only)
create policy "Admins can view content sources"
  on public.content_sources for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage content sources"
  on public.content_sources for insert
  with check (auth.role() = 'authenticated');

create policy "Admins can update content sources"
  on public.content_sources for update
  using (auth.role() = 'authenticated');

create policy "Admins can delete content sources"
  on public.content_sources for delete
  using (auth.role() = 'authenticated');

-- RLS Policies for pending_content (admins only)
create policy "Admins can view pending content"
  on public.pending_content for select
  using (auth.role() = 'authenticated');

create policy "System can insert pending content"
  on public.pending_content for insert
  with check (true);

create policy "Admins can update pending content"
  on public.pending_content for update
  using (auth.role() = 'authenticated');

create policy "Admins can delete pending content"
  on public.pending_content for delete
  using (auth.role() = 'authenticated');

-- RLS Policies for content_cache
create policy "System can access content cache"
  on public.content_cache for all
  using (true);

-- RLS Policies for content_logs
create policy "Admins can view content logs"
  on public.content_logs for select
  using (auth.role() = 'authenticated');

create policy "System can insert content logs"
  on public.content_logs for insert
  with check (true);
