-- Phase 1: Create user roles system to prevent privilege escalation

-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Migrate existing admin users from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- Migrate all other users as regular users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role
FROM public.profiles
WHERE role = 'user' OR role IS NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create helper function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- RLS policy for user_roles: users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy for user_roles: admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policy for user_roles: only admins can insert/update/delete roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Phase 2: Fix email exposure - Drop overly permissive profile policy
DROP POLICY IF EXISTS "Anyone can view profiles for public display" ON public.profiles;

-- Update all existing RLS policies to use the new has_role function

-- Stories table policies
DROP POLICY IF EXISTS "Admins can view all stories" ON public.stories;
CREATE POLICY "Admins can view all stories"
ON public.stories
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update any story" ON public.stories;
CREATE POLICY "Admins can update any story"
ON public.stories
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete stories" ON public.stories;
CREATE POLICY "Admins can delete stories"
ON public.stories
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Comments table policies
DROP POLICY IF EXISTS "Admins can view all comments" ON public.comments;
CREATE POLICY "Admins can view all comments"
ON public.comments
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update comments" ON public.comments;
CREATE POLICY "Admins can update comments"
ON public.comments
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete comments" ON public.comments;
CREATE POLICY "Admins can delete comments"
ON public.comments
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Towns table policies
DROP POLICY IF EXISTS "Admins can insert towns" ON public.towns;
CREATE POLICY "Admins can insert towns"
ON public.towns
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update towns" ON public.towns;
CREATE POLICY "Admins can update towns"
ON public.towns
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Media gallery policies
DROP POLICY IF EXISTS "Admins can delete any media" ON public.media_gallery;
CREATE POLICY "Admins can delete any media"
ON public.media_gallery
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Keep the role column in profiles for backward compatibility but it's no longer used for authorization
COMMENT ON COLUMN public.profiles.role IS 'Deprecated: Use user_roles table instead. Kept for backward compatibility only.';