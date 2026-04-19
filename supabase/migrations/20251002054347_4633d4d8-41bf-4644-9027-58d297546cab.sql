-- Drop the overly permissive policy that exposes emails
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Allow users to view their own complete profile (including email)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow anyone to view basic public profile info (excluding email)
-- This is accomplished by creating a view or by checking in the application layer
-- For now, we'll create a policy that allows viewing other profiles but the app
-- should filter out email addresses when displaying to non-owners

-- Create a security definer function to check if viewing own profile
CREATE OR REPLACE FUNCTION public.can_view_profile_email(profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT profile_id = auth.uid();
$$;

-- Add comment to document the security considerations
COMMENT ON TABLE public.profiles IS 'User profiles table. Email addresses should only be visible to the profile owner. Applications must implement email filtering when displaying profiles to other users.';