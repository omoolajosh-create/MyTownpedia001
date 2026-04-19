-- Secure existing public.posts table
alter table public.posts enable row level security;

-- Posts policies
create policy "Anyone can read published posts"
  on public.posts for select using (status = 'published');
create policy "Admins can manage posts"
  on public.posts for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Add policies for user_roles
create policy "Users can read their roles"
  on public.user_roles for select using (auth.uid() = user_id);
create policy "Admins can manage user_roles"
  on public.user_roles for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Re-create functions with fixed search_path
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql
set search_path = public;