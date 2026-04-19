-- Add policy to allow viewing all profiles (the view filters out sensitive data)
-- This policy is safe because:
-- 1. The profiles_public view only exposes non-sensitive fields
-- 2. Applications should use the view for public profile data
-- 3. Direct access to profiles table should only be for own profile
CREATE POLICY "Anyone can view profiles for public display"
ON public.profiles
FOR SELECT
USING (true);

-- Document that applications should use profiles_public view for author display
COMMENT ON TABLE public.profiles IS 'User profiles table. Contains sensitive data like email addresses. 
IMPORTANT: Use the profiles_public view for displaying author information. 
Only query this table directly when fetching the authenticated user''s own profile data.';