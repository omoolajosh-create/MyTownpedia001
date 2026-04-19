-- Create polls table
CREATE TABLE public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  category TEXT DEFAULT 'general'
);

-- Create poll_votes table
CREATE TABLE public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(poll_id, user_id)
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  difficulty TEXT DEFAULT 'medium'
);

-- Create quiz_submissions table
CREATE TABLE public.quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_stats table for leaderboard
CREATE TABLE public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_posts INTEGER DEFAULT 0 NOT NULL,
  total_interactions INTEGER DEFAULT 0 NOT NULL,
  quiz_points INTEGER DEFAULT 0 NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for polls
CREATE POLICY "Anyone can view active polls" ON public.polls
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage polls" ON public.polls
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for poll_votes
CREATE POLICY "Users can view poll votes" ON public.poll_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for quizzes
CREATE POLICY "Anyone can view active quizzes" ON public.quizzes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage quizzes" ON public.quizzes
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for quiz_submissions
CREATE POLICY "Users can view their submissions" ON public.quiz_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can submit" ON public.quiz_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_stats
CREATE POLICY "Anyone can view stats" ON public.user_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can update their stats" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update user stats
CREATE OR REPLACE FUNCTION public.increment_user_interaction(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, total_interactions, last_updated)
  VALUES (p_user_id, 1, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_interactions = user_stats.total_interactions + 1,
    last_updated = now();
END;
$$;