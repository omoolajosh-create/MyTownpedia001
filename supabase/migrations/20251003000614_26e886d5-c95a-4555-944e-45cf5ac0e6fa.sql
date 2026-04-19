-- Create memory_wall table for tributes
CREATE TABLE public.memory_wall (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  message TEXT NOT NULL,
  author_id UUID NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.memory_wall ENABLE ROW LEVEL SECURITY;

-- RLS Policies for memory_wall
CREATE POLICY "Anyone can view approved tributes"
ON public.memory_wall
FOR SELECT
USING (is_approved = true);

CREATE POLICY "Authors can view their own tributes"
ON public.memory_wall
FOR SELECT
USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can create tributes"
ON public.memory_wall
FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can view all tributes"
ON public.memory_wall
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tributes"
ON public.memory_wall
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tributes"
ON public.memory_wall
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create prayer_capsules table
CREATE TABLE public.prayer_capsules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  audio_url TEXT,
  author_id UUID NOT NULL,
  release_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_released BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prayer_capsules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prayer_capsules
CREATE POLICY "Anyone can view released capsules"
ON public.prayer_capsules
FOR SELECT
USING (is_released = true AND release_date <= now());

CREATE POLICY "Authors can view their own capsules"
ON public.prayer_capsules
FOR SELECT
USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can create capsules"
ON public.prayer_capsules
FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can view all capsules"
ON public.prayer_capsules
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on memory_wall
CREATE TRIGGER update_memory_wall_updated_at
BEFORE UPDATE ON public.memory_wall
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-release capsules
CREATE OR REPLACE FUNCTION public.release_prayer_capsules()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.prayer_capsules
  SET is_released = true
  WHERE release_date <= now() AND is_released = false;
END;
$$;