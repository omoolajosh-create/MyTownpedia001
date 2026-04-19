-- Interactive Heritage Timeline
CREATE TABLE public.timeline_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_year INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('foundation', 'leadership', 'cultural', 'development', 'celebration', 'milestone')),
  featured_image TEXT,
  media_gallery JSONB DEFAULT '[]',
  created_by UUID NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved timeline events"
ON public.timeline_events FOR SELECT
USING (is_approved = true);

CREATE POLICY "Authenticated users can submit timeline events"
ON public.timeline_events FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own timeline events"
ON public.timeline_events FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all timeline events"
ON public.timeline_events FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Family Tree Builder
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  maiden_name TEXT,
  birth_date DATE,
  death_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  bio TEXT,
  profile_photo TEXT,
  birth_place TEXT,
  occupation TEXT,
  is_living BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.family_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  related_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('parent', 'child', 'spouse', 'sibling')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(member_id, related_member_id, relationship_type)
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public family members"
ON public.family_members FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own family members"
ON public.family_members FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view relationships of their family members"
ON public.family_relationships FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.id = member_id AND (fm.user_id = auth.uid() OR fm.is_public = true)
  )
);

CREATE POLICY "Users can manage relationships of their family members"
ON public.family_relationships FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.id = member_id AND fm.user_id = auth.uid()
  )
);

-- Virtual Town Tours
CREATE TABLE public.virtual_tours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  town_id UUID REFERENCES public.towns(id) ON DELETE CASCADE,
  cover_image TEXT,
  duration_minutes INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'challenging')),
  is_featured BOOLEAN DEFAULT false,
  total_views INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.tour_stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES public.virtual_tours(id) ON DELETE CASCADE,
  stop_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'panorama_360', 'audio')),
  media_url TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  audio_narration TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tour_id, stop_number)
);

ALTER TABLE public.virtual_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved tours"
ON public.virtual_tours FOR SELECT
USING (is_approved = true);

CREATE POLICY "Authenticated users can create tours"
ON public.virtual_tours FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tours"
ON public.virtual_tours FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all tours"
ON public.virtual_tours FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view stops of approved tours"
ON public.tour_stops FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.virtual_tours vt
    WHERE vt.id = tour_id AND vt.is_approved = true
  )
);

CREATE POLICY "Tour creators can manage their tour stops"
ON public.tour_stops FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.virtual_tours vt
    WHERE vt.id = tour_id AND vt.created_by = auth.uid()
  )
);

CREATE POLICY "Admins can manage all tour stops"
ON public.tour_stops FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Community Calendar & Live Streaming
CREATE TABLE public.community_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('festival', 'meeting', 'ceremony', 'workshop', 'celebration', 'fundraiser', 'other')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  cover_image TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  has_live_stream BOOLEAN DEFAULT false,
  stream_url TEXT,
  created_by UUID NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rsvp_status TEXT NOT NULL CHECK (rsvp_status IN ('attending', 'maybe', 'not_attending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE TABLE public.live_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.community_events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  stream_url TEXT NOT NULL,
  chat_enabled BOOLEAN DEFAULT true,
  is_live BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  total_viewers INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.stream_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved events"
ON public.community_events FOR SELECT
USING (is_approved = true);

CREATE POLICY "Authenticated users can create events"
ON public.community_events FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own events"
ON public.community_events FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all events"
ON public.community_events FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can manage their RSVP"
ON public.event_attendees FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view live streams"
ON public.live_streams FOR SELECT
USING (is_live = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Event creators can manage streams"
ON public.live_streams FOR ALL
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.community_events ce
    WHERE ce.id = event_id AND ce.created_by = auth.uid()
  )
);

CREATE POLICY "Anyone can view approved chat messages"
ON public.stream_chat_messages FOR SELECT
USING (is_approved = true);

CREATE POLICY "Authenticated users can send chat messages"
ON public.stream_chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can moderate chat"
ON public.stream_chat_messages FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Crowdfunding Platform
CREATE TABLE public.funding_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('heritage_preservation', 'infrastructure', 'education', 'healthcare', 'cultural_event', 'community_project', 'emergency_relief')),
  goal_amount DECIMAL(10, 2) NOT NULL,
  current_amount DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  cover_image TEXT,
  media_gallery JSONB DEFAULT '[]',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  total_donors INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.campaign_donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.funding_campaigns(id) ON DELETE CASCADE,
  donor_id UUID,
  amount DECIMAL(10, 2) NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  donor_name TEXT,
  donor_message TEXT,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.campaign_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.funding_campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funding_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved campaigns"
ON public.funding_campaigns FOR SELECT
USING (is_approved = true AND is_active = true);

CREATE POLICY "Authenticated users can create campaigns"
ON public.funding_campaigns FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own campaigns"
ON public.funding_campaigns FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all campaigns"
ON public.funding_campaigns FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view donations for public campaigns"
ON public.campaign_donations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.funding_campaigns fc
    WHERE fc.id = campaign_id AND fc.is_approved = true
  )
);

CREATE POLICY "Authenticated users can donate"
ON public.campaign_donations FOR INSERT
WITH CHECK (auth.uid() = donor_id OR is_anonymous = true);

CREATE POLICY "Campaign creators can view all donations"
ON public.campaign_donations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.funding_campaigns fc
    WHERE fc.id = campaign_id AND fc.created_by = auth.uid()
  )
);

CREATE POLICY "Anyone can view campaign updates"
ON public.campaign_updates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.funding_campaigns fc
    WHERE fc.id = campaign_id AND fc.is_approved = true
  )
);

CREATE POLICY "Campaign creators can post updates"
ON public.campaign_updates FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.funding_campaigns fc
    WHERE fc.id = campaign_id AND fc.created_by = auth.uid()
  )
);

CREATE POLICY "Admins can manage campaign updates"
ON public.campaign_updates FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_timeline_events_year ON public.timeline_events(event_year);
CREATE INDEX idx_timeline_events_approved ON public.timeline_events(is_approved);
CREATE INDEX idx_family_members_user ON public.family_members(user_id);
CREATE INDEX idx_virtual_tours_town ON public.virtual_tours(town_id);
CREATE INDEX idx_tour_stops_tour ON public.tour_stops(tour_id);
CREATE INDEX idx_community_events_dates ON public.community_events(start_date, end_date);
CREATE INDEX idx_event_attendees_event ON public.event_attendees(event_id);
CREATE INDEX idx_live_streams_event ON public.live_streams(event_id);
CREATE INDEX idx_funding_campaigns_active ON public.funding_campaigns(is_approved, is_active);
CREATE INDEX idx_campaign_donations_campaign ON public.campaign_donations(campaign_id);

-- Triggers for updated_at
CREATE TRIGGER update_timeline_events_updated_at
BEFORE UPDATE ON public.timeline_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at
BEFORE UPDATE ON public.family_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_virtual_tours_updated_at
BEFORE UPDATE ON public.virtual_tours
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_events_updated_at
BEFORE UPDATE ON public.community_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funding_campaigns_updated_at
BEFORE UPDATE ON public.funding_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();