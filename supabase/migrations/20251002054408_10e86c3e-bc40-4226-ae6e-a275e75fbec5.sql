-- Allow viewing all profiles for public information (names, avatars)
-- The application layer must filter out email addresses when displaying to non-owners
CREATE POLICY "Anyone can view public profile fields"
ON public.profiles
FOR SELECT
USING (true);

-- Note: We now have two SELECT policies:
-- 1. "Users can view their own profile" - allows users to see their own complete profile
-- 2. "Anyone can view public profile fields" - allows viewing profiles for displaying author names/avatars
-- The application must implement logic to hide email addresses unless viewing own profile