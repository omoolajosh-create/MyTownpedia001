import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useReadingProgress = (storyId: string | undefined) => {
  useEffect(() => {
    if (!storyId) return;

    let progressTimeout: NodeJS.Timeout;

    const saveProgress = async (percentage: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('reading_progress')
        .upsert({
          user_id: user.id,
          story_id: storyId,
          progress_percentage: percentage,
          last_read_at: new Date().toISOString()
        });
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = Math.round((scrollTop / docHeight) * 100);

      clearTimeout(progressTimeout);
      progressTimeout = setTimeout(() => {
        if (percentage > 10) {
          saveProgress(percentage);
        }
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(progressTimeout);
    };
  }, [storyId]);
};
