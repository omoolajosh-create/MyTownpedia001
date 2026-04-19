-- Create time_capsules table for the revolutionary heritage preservation feature
CREATE TABLE public.time_capsules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  unlock_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  recipients TEXT[] DEFAULT '{}', -- Array of email addresses who can view when unlocked
  capsule_type TEXT NOT NULL DEFAULT 'personal', -- personal, family, community
  town_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unlocked_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT unlock_date_future CHECK (unlock_date > created_at)
);

-- Enable RLS
ALTER TABLE public.time_capsules ENABLE ROW LEVEL SECURITY;

-- Authors can view their own capsules anytime
CREATE POLICY "Authors can view their own capsules"
ON public.time_capsules
FOR SELECT
USING (auth.uid() = author_id);

-- Authors can create capsules
CREATE POLICY "Authenticated users can create capsules"
ON public.time_capsules
FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Authors can update their own LOCKED capsules
CREATE POLICY "Authors can update their locked capsules"
ON public.time_capsules
FOR UPDATE
USING (auth.uid() = author_id AND is_unlocked = false);

-- Anyone can view unlocked capsules
CREATE POLICY "Anyone can view unlocked capsules"
ON public.time_capsules
FOR SELECT
USING (is_unlocked = true AND unlock_date <= now());

-- Admins can manage all capsules
CREATE POLICY "Admins can manage all capsules"
ON public.time_capsules
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to automatically unlock capsules when their time comes
CREATE OR REPLACE FUNCTION public.unlock_time_capsules()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.time_capsules
  SET is_unlocked = true,
      unlocked_at = now()
  WHERE unlock_date <= now() 
    AND is_unlocked = false;
END;
$$;

-- Create index for efficient querying
CREATE INDEX idx_time_capsules_unlock_date ON public.time_capsules(unlock_date);
CREATE INDEX idx_time_capsules_author ON public.time_capsules(author_id);
CREATE INDEX idx_time_capsules_town ON public.time_capsules(town_id);