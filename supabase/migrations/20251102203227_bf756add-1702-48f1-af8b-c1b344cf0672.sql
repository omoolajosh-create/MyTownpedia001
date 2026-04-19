-- Create story_views table to track story views
CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT,
  UNIQUE(story_id, user_id, session_id)
);

-- Create town_views table to track town page views
CREATE TABLE IF NOT EXISTS public.town_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  town_id UUID NOT NULL REFERENCES public.towns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT,
  UNIQUE(town_id, user_id, session_id)
);

-- Create town_followers table for users following towns
CREATE TABLE IF NOT EXISTS public.town_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  town_id UUID NOT NULL REFERENCES public.towns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(town_id, user_id)
);

-- Create story_bookmarks table for users bookmarking stories
CREATE TABLE IF NOT EXISTS public.story_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bookmarked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Add view_count columns to stories and towns
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.towns 
ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.town_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.town_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for story_views
CREATE POLICY "Anyone can view story view counts"
ON public.story_views FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert story views"
ON public.story_views FOR INSERT
WITH CHECK (true);

-- RLS Policies for town_views
CREATE POLICY "Anyone can view town view counts"
ON public.town_views FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert town views"
ON public.town_views FOR INSERT
WITH CHECK (true);

-- RLS Policies for town_followers
CREATE POLICY "Anyone can view followers"
ON public.town_followers FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can follow towns"
ON public.town_followers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow towns"
ON public.town_followers FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for story_bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON public.story_bookmarks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can bookmark stories"
ON public.story_bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their bookmarks"
ON public.story_bookmarks FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON public.story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_town_views_town_id ON public.town_views(town_id);
CREATE INDEX IF NOT EXISTS idx_town_followers_town_id ON public.town_followers(town_id);
CREATE INDEX IF NOT EXISTS idx_town_followers_user_id ON public.town_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_story_bookmarks_story_id ON public.story_bookmarks(story_id);
CREATE INDEX IF NOT EXISTS idx_story_bookmarks_user_id ON public.story_bookmarks(user_id);

-- Function to increment story view count
CREATE OR REPLACE FUNCTION public.increment_story_views()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.stories
  SET view_count = view_count + 1
  WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$;

-- Function to increment town view count
CREATE OR REPLACE FUNCTION public.increment_town_views()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.towns
  SET view_count = view_count + 1
  WHERE id = NEW.town_id;
  RETURN NEW;
END;
$$;

-- Triggers to auto-increment view counts
CREATE TRIGGER on_story_view_insert
AFTER INSERT ON public.story_views
FOR EACH ROW
EXECUTE FUNCTION public.increment_story_views();

CREATE TRIGGER on_town_view_insert
AFTER INSERT ON public.town_views
FOR EACH ROW
EXECUTE FUNCTION public.increment_town_views();