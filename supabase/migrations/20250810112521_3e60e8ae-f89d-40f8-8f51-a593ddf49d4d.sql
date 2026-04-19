-- Promote specific user to admin
-- Parameters
--   email: oluwasegunjosh04@gmail.com
--   user_id: a781a862-96f7-43ba-9bf0-d85ad4f7f0dd

-- 1) Ensure profile exists and has role 'admin'
insert into public.profiles (id, email, role, full_name)
values (
  'a781a862-96f7-43ba-9bf0-d85ad4f7f0dd'::uuid,
  'oluwasegunjosh04@gmail.com',
  'admin',
  coalesce((select raw_user_meta_data->>'full_name' from auth.users where id = 'a781a862-96f7-43ba-9bf0-d85ad4f7f0dd'::uuid), null)
)
on conflict (id) do update set
  role = 'admin',
  email = excluded.email,
  full_name = coalesce(excluded.full_name, public.profiles.full_name),
  updated_at = now();

-- 2) Grant 'admin' role in user_roles only if the auth user exists
insert into public.user_roles (user_id, role)
select 'a781a862-96f7-43ba-9bf0-d85ad4f7f0dd'::uuid, 'admin'::app_role
where exists (select 1 from auth.users where id = 'a781a862-96f7-43ba-9bf0-d85ad4f7f0dd'::uuid)
on conflict (user_id, role) do nothing;