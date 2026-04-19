-- Add admin DELETE policies for all content tables

-- Funding campaigns
DROP POLICY IF EXISTS "Admins can delete campaigns" ON public.funding_campaigns;
CREATE POLICY "Admins can delete campaigns" 
ON public.funding_campaigns 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Campaign donations
DROP POLICY IF EXISTS "Admins can delete donations" ON public.campaign_donations;
CREATE POLICY "Admins can delete donations" 
ON public.campaign_donations 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Campaign updates
DROP POLICY IF EXISTS "Admins can delete campaign updates" ON public.campaign_updates;
CREATE POLICY "Admins can delete campaign updates" 
ON public.campaign_updates 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Diaspora posts
DROP POLICY IF EXISTS "Admins can delete diaspora posts" ON public.diaspora_posts;
CREATE POLICY "Admins can delete diaspora posts" 
ON public.diaspora_posts 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Community events
DROP POLICY IF EXISTS "Admins can delete events" ON public.community_events;
CREATE POLICY "Admins can delete events" 
ON public.community_events 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Virtual tours
DROP POLICY IF EXISTS "Admins can delete tours" ON public.virtual_tours;
CREATE POLICY "Admins can delete tours" 
ON public.virtual_tours 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Timeline events
DROP POLICY IF EXISTS "Admins can delete timeline events" ON public.timeline_events;
CREATE POLICY "Admins can delete timeline events" 
ON public.timeline_events 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Polls
DROP POLICY IF EXISTS "Admins can delete polls" ON public.polls;
CREATE POLICY "Admins can delete polls" 
ON public.polls 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Quizzes
DROP POLICY IF EXISTS "Admins can delete quizzes" ON public.quizzes;
CREATE POLICY "Admins can delete quizzes" 
ON public.quizzes 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Story collections
DROP POLICY IF EXISTS "Admins can delete collections" ON public.story_collections;
CREATE POLICY "Admins can delete collections" 
ON public.story_collections 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Prayer capsules
DROP POLICY IF EXISTS "Admins can delete prayer capsules" ON public.prayer_capsules;
CREATE POLICY "Admins can delete prayer capsules" 
ON public.prayer_capsules 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Time capsules
DROP POLICY IF EXISTS "Admins can delete time capsules" ON public.time_capsules;
CREATE POLICY "Admins can delete time capsules" 
ON public.time_capsules 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));