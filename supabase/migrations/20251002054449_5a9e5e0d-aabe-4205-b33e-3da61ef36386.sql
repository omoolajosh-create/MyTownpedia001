-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view public profile fields" ON public.profiles;

-- Create a view that only exposes public profile information (excludes email)
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id,
  full_name,
  avatar_url,
  role,
  created_at,
  updated_at
FROM public.profiles;

-- Grant SELECT permission on the view to authenticated and anon users
GRANT SELECT ON public.profiles_public TO authenticated, anon;

-- Add comment to explain the view's purpose
COMMENT ON VIEW public.profiles_public IS 'Public view of user profiles that excludes sensitive information like email addresses. Use this view for displaying author information in stories, comments, etc.';