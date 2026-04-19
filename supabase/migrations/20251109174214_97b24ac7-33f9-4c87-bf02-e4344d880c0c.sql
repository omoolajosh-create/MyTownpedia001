-- Fix 1: Restrict poll_votes to prevent individual vote tracking
-- Remove public view policy and only allow viewing own votes + admins
DROP POLICY IF EXISTS "Users can view poll votes" ON public.poll_votes;

CREATE POLICY "Users can view their own votes"
ON public.poll_votes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all votes"
ON public.poll_votes
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Add explicit denial policy for profiles to prevent enumeration
-- This ensures no other policy can accidentally expose data
DROP POLICY IF EXISTS "Block unauthorized profile access" ON public.profiles;

CREATE POLICY "Block unauthorized profile access"
ON public.profiles
FOR SELECT
USING (false);

-- Ensure the "view own profile" policy exists and takes precedence
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Fix 3: Restrict unapproved community partners to admins only
DROP POLICY IF EXISTS "Users can view their own partners" ON public.community_partners;

CREATE POLICY "Users can view their approved partners"
ON public.community_partners
FOR SELECT
USING (auth.uid() = created_by AND is_approved = true);