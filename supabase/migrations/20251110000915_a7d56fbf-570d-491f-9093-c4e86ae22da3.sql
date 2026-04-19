-- Create push subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
ON public.push_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
ON public.push_subscriptions
FOR DELETE
USING (auth.uid() = user_id);

-- Create notification queue table for tracking sent notifications
CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for notification queue
CREATE POLICY "Admins can view all notifications"
ON public.notification_queue
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to send notification
CREATE OR REPLACE FUNCTION public.queue_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notification_queue (user_id, notification_type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Create trigger for new comments
CREATE OR REPLACE FUNCTION public.notify_comment_author()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_story_title TEXT;
  v_story_author_id UUID;
  v_commenter_name TEXT;
BEGIN
  -- Get story details
  SELECT title, author_id INTO v_story_title, v_story_author_id
  FROM public.stories
  WHERE id = NEW.story_id;
  
  -- Get commenter name
  SELECT full_name INTO v_commenter_name
  FROM public.profiles
  WHERE id = NEW.author_id;
  
  -- Don't notify if author comments on their own story
  IF NEW.author_id = v_story_author_id THEN
    RETURN NEW;
  END IF;
  
  -- Queue notification
  PERFORM public.queue_notification(
    v_story_author_id,
    'comment',
    'New Comment',
    v_commenter_name || ' commented on "' || v_story_title || '"',
    jsonb_build_object('story_id', NEW.story_id, 'comment_id', NEW.id)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_comment_author
AFTER INSERT ON public.comments
FOR EACH ROW
WHEN (NEW.is_approved = true)
EXECUTE FUNCTION public.notify_comment_author();

-- Create trigger for story approval
CREATE OR REPLACE FUNCTION public.notify_story_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only notify when story becomes published
  IF NEW.is_published = true AND OLD.is_published = false THEN
    PERFORM public.queue_notification(
      NEW.author_id,
      'story_approved',
      'Story Approved',
      'Your story "' || NEW.title || '" has been approved and published!',
      jsonb_build_object('story_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_story_approval
AFTER UPDATE ON public.stories
FOR EACH ROW
EXECUTE FUNCTION public.notify_story_approval();

-- Create trigger for achievements
CREATE OR REPLACE FUNCTION public.notify_achievement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_badge_name TEXT;
BEGIN
  -- Get badge name from badge_type
  v_badge_name := CASE NEW.badge_type
    WHEN 'story_master' THEN 'Story Master'
    WHEN 'first_story' THEN 'First Story'
    WHEN 'engagement_champion' THEN 'Engagement Champion'
    WHEN 'community_builder' THEN 'Community Builder'
    ELSE 'New Achievement'
  END;
  
  -- Queue notification
  PERFORM public.queue_notification(
    NEW.user_id,
    'achievement',
    'New Achievement',
    'You earned the ' || v_badge_name || ' badge!',
    jsonb_build_object('achievement_id', NEW.id, 'badge_type', NEW.badge_type)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_achievement
AFTER INSERT ON public.user_achievements
FOR EACH ROW
EXECUTE FUNCTION public.notify_achievement();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_status ON public.notification_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions(user_id);