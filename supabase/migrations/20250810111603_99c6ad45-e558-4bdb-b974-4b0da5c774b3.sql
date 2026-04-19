-- Add missing trigger to populate profiles and user_roles on signup
do $$
begin
  if not exists (
    select 1 from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where t.tgname = 'on_auth_user_created'
      and n.nspname = 'auth'
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end $$;

-- Ensure updated_at triggers exist for tables with updated_at columns
-- profiles
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_profiles_updated_at'
  ) then
    create trigger trg_profiles_updated_at
      before update on public.profiles
      for each row execute function public.update_updated_at_column();
  end if;
end $$;

-- stories
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_stories_updated_at'
  ) then
    create trigger trg_stories_updated_at
      before update on public.stories
      for each row execute function public.update_updated_at_column();
  end if;
end $$;

-- towns
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_towns_updated_at'
  ) then
    create trigger trg_towns_updated_at
      before update on public.towns
      for each row execute function public.update_updated_at_column();
  end if;
end $$;

-- comments
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_comments_updated_at'
  ) then
    create trigger trg_comments_updated_at
      before update on public.comments
      for each row execute function public.update_updated_at_column();
  end if;
end $$;
