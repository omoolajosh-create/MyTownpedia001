-- Enable required extensions
create extension if not exists pgcrypto;

-- 1) Roles enum and table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
  END IF;
END $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique(user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- 2) Profiles table (keeps a role column for compatibility with existing code)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Profiles policies
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- 3) Timestamp update function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach to profiles
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- 4) Towns
create table if not exists public.towns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  history text,
  location text,
  population integer,
  founded_year integer,
  featured_image_url text,
  gallery_images text[],
  is_featured boolean not null default false,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.towns enable row level security;

-- Towns policies
create policy "Towns are viewable by everyone"
  on public.towns for select using (true);

create policy "Admins can manage towns"
  on public.towns for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Triggers
drop trigger if exists trg_towns_updated_at on public.towns;
create trigger trg_towns_updated_at
before update on public.towns
for each row execute function public.update_updated_at_column();

-- 5) Stories
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'story_type') THEN
    CREATE TYPE public.story_type AS ENUM ('personal','historical','cultural','legend');
  END IF;
END $$;

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  story_type public.story_type not null,
  author_id uuid not null references auth.users(id) on delete cascade,
  town_id uuid not null references public.towns(id) on delete cascade,
  is_published boolean not null default false,
  featured_image_url text,
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stories enable row level security;

-- Stories policies
create policy "Anyone can read published stories"
  on public.stories for select using (is_published = true);
create policy "Authors can read their stories"
  on public.stories for select using (auth.uid() = author_id);
create policy "Users can create their own stories"
  on public.stories for insert with check (auth.uid() = author_id);
create policy "Authors can update their own stories"
  on public.stories for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "Admins can manage stories"
  on public.stories for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Triggers
drop trigger if exists trg_stories_updated_at on public.stories;
create trigger trg_stories_updated_at
before update on public.stories
for each row execute function public.update_updated_at_column();

-- 6) Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  author_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete set null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.comments enable row level security;

-- Comments policies
create policy "Anyone can read approved comments"
  on public.comments for select using (is_approved = true);
create policy "Authors can read their comments"
  on public.comments for select using (auth.uid() = author_id);
create policy "Users can create their own comments"
  on public.comments for insert with check (auth.uid() = author_id);
create policy "Authors can manage their comments"
  on public.comments for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "Authors can delete their comments"
  on public.comments for delete using (auth.uid() = author_id);
create policy "Admins can manage comments"
  on public.comments for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Triggers
drop trigger if exists trg_comments_updated_at on public.comments;
create trigger trg_comments_updated_at
before update on public.comments
for each row execute function public.update_updated_at_column();

-- 7) Media gallery
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
    CREATE TYPE public.media_type AS ENUM ('image','video','audio');
  END IF;
END $$;

create table if not exists public.media_gallery (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  media_url text not null,
  media_type public.media_type not null,
  town_id uuid references public.towns(id) on delete set null,
  story_id uuid references public.stories(id) on delete set null,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.media_gallery enable row level security;

create policy "Media is viewable by everyone"
  on public.media_gallery for select using (true);
create policy "Users can upload their own media"
  on public.media_gallery for insert with check (auth.uid() = uploaded_by);
create policy "Owners can update their media"
  on public.media_gallery for update using (auth.uid() = uploaded_by) with check (auth.uid() = uploaded_by);
create policy "Admins can manage all media"
  on public.media_gallery for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- 8) Notifications
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE public.notification_type AS ENUM ('general','story_approved','comment','admin');
  END IF;
END $$;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  notification_type public.notification_type not null default 'general',
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "User can see own notifications"
  on public.notifications for select using (auth.uid() = user_id);
create policy "User can create own notifications"
  on public.notifications for insert with check (auth.uid() = user_id);
create policy "Admins can manage notifications"
  on public.notifications for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- 9) Auth trigger to create profile and default role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();