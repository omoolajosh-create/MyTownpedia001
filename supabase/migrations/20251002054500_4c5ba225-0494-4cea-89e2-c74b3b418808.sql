-- Drop and recreate the view with SECURITY INVOKER to enforce RLS properly
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  full_name,
  avatar_url,
  role,
  created_at,
  updated_at
FROM public.profiles;

-- Grant SELECT permission on the view
GRANT SELECT ON public.profiles_public TO authenticated, anon;

COMMENT ON VIEW public.profiles_public IS 'Public view of user profiles that excludes sensitive information like email addresses. Uses security_invoker to enforce RLS based on querying user permissions.';