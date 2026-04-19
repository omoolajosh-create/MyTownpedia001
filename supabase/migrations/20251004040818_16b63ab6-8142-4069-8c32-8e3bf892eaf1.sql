-- Create community_partners table
CREATE TABLE public.community_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  logo_url TEXT,
  location TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  is_approved BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create partner_events table
CREATE TABLE public.partner_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.community_partners(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  image_url TEXT,
  is_approved BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create diaspora_posts table
CREATE TABLE public.diaspora_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  featured_image_url TEXT,
  is_approved BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.community_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_partners
CREATE POLICY "Anyone can view approved partners" ON public.community_partners
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can view their own partners" ON public.community_partners
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can create partners" ON public.community_partners
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can view all partners" ON public.community_partners
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update partners" ON public.community_partners
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete partners" ON public.community_partners
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for partner_events
CREATE POLICY "Anyone can view approved events" ON public.partner_events
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Authenticated users can create events" ON public.partner_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.community_partners
      WHERE id = partner_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all events" ON public.partner_events
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events" ON public.partner_events
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events" ON public.partner_events
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for diaspora_posts
CREATE POLICY "Anyone can view approved diaspora posts" ON public.diaspora_posts
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can view their own posts" ON public.diaspora_posts
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can create posts" ON public.diaspora_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can view all posts" ON public.diaspora_posts
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update posts" ON public.diaspora_posts
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts" ON public.diaspora_posts
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Trigger for community_partners updated_at
CREATE TRIGGER update_community_partners_updated_at
  BEFORE UPDATE ON public.community_partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for partner_events updated_at
CREATE TRIGGER update_partner_events_updated_at
  BEFORE UPDATE ON public.partner_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for diaspora_posts updated_at
CREATE TRIGGER update_diaspora_posts_updated_at
  BEFORE UPDATE ON public.diaspora_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();