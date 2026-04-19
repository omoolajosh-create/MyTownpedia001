import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate session ID for anonymous users
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

export const useStoryView = (storyId: string | undefined) => {
  useEffect(() => {
    if (!storyId) return;

    const trackView = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = getSessionId();

      await supabase.from('story_views').insert({
        story_id: storyId,
        user_id: user?.id || null,
        session_id: sessionId
      });
    };

    // Track after 2 seconds to avoid counting accidental clicks
    const timer = setTimeout(trackView, 2000);
    return () => clearTimeout(timer);
  }, [storyId]);
};

export const useTownView = (townId: string | undefined) => {
  useEffect(() => {
    if (!townId) return;

    const trackView = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = getSessionId();

      await supabase.from('town_views').insert({
        town_id: townId,
        user_id: user?.id || null,
        session_id: sessionId
      });
    };

    // Track after 2 seconds to avoid counting accidental clicks
    const timer = setTimeout(trackView, 2000);
    return () => clearTimeout(timer);
  }, [townId]);
};

export const getStoryViewCount = async (storyId: string): Promise<number> => {
  const { data } = await supabase
    .from('stories')
    .select('view_count')
    .eq('id', storyId)
    .single();
  
  return data?.view_count || 0;
};

export const getTownViewCount = async (townId: string): Promise<number> => {
  const { data } = await supabase
    .from('towns')
    .select('view_count')
    .eq('id', townId)
    .single();
  
  return data?.view_count || 0;
};
