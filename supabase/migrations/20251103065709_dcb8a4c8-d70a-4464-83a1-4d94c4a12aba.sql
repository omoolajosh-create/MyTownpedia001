-- Story Reactions System
CREATE TABLE public.story_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('love', 'fire', 'touching', 'inspiring', 'insightful')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id, reaction_type)
);

CREATE INDEX idx_story_reactions_story_id ON public.story_reactions(story_id);
CREATE INDEX idx_story_reactions_user_id ON public.story_reactions(user_id);

ALTER TABLE public.story_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions"
  ON public.story_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add reactions"
  ON public.story_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions"
  ON public.story_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- User Achievements/Badges System
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('storyteller', 'historian', 'legend', 'explorer', 'guardian', 'pioneer', 'scholar', 'mentor', 'champion')),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  badge_tier TEXT NOT NULL DEFAULT 'bronze' CHECK (badge_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  UNIQUE(user_id, badge_type, badge_tier)
);

CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON public.user_achievements FOR SELECT
  USING (true);

CREATE POLICY "System can create achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (true);

-- Story Collections/Anthologies
CREATE TABLE public.story_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cover_image_url TEXT
);

CREATE TABLE public.collection_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.story_collections(id) ON DELETE CASCADE,
  story_id UUID NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  display_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(collection_id, story_id)
);

CREATE INDEX idx_collection_stories_collection_id ON public.collection_stories(collection_id);
CREATE INDEX idx_collection_stories_story_id ON public.collection_stories(story_id);

ALTER TABLE public.story_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public collections"
  ON public.story_collections FOR SELECT
  USING (is_public = true);

CREATE POLICY "Admins can manage collections"
  ON public.story_collections FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own collections"
  ON public.story_collections FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can create collections"
  ON public.story_collections FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Anyone can view public collection stories"
  ON public.collection_stories FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.story_collections WHERE id = collection_id AND is_public = true));

CREATE POLICY "Collection owners can manage stories"
  ON public.collection_stories FOR ALL
  USING (EXISTS (SELECT 1 FROM public.story_collections WHERE id = collection_id AND created_by = auth.uid()));

-- Featured Content System
CREATE TABLE public.featured_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('story_of_week', 'editors_pick', 'contributor_spotlight')),
  story_id UUID,
  user_id UUID,
  featured_from TIMESTAMP WITH TIME ZONE NOT NULL,
  featured_until TIMESTAMP WITH TIME ZONE NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_featured_content_type ON public.featured_content(content_type);
CREATE INDEX idx_featured_content_dates ON public.featured_content(featured_from, featured_until);

ALTER TABLE public.featured_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active featured content"
  ON public.featured_content FOR SELECT
  USING (featured_from <= now() AND featured_until >= now());

CREATE POLICY "Admins can manage featured content"
  ON public.featured_content FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Reading Progress Tracking
CREATE TABLE public.reading_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  story_id UUID NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, story_id)
);

CREATE INDEX idx_reading_progress_user_id ON public.reading_progress(user_id);

ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reading progress"
  ON public.reading_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can track their reading progress"
  ON public.reading_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their reading progress"
  ON public.reading_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Add reaction counts to stories for performance
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS reaction_counts JSONB DEFAULT '{}'::jsonb;

-- Enable realtime for comments and reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.story_reactions;