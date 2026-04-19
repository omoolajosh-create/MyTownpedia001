import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useBookmarks = (storyId: string | undefined) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storyId || !user) {
      setIsBookmarked(false);
      return;
    }

    checkBookmarkStatus();
  }, [storyId, user]);

  const checkBookmarkStatus = async () => {
    if (!user || !storyId) return;

    const { data } = await supabase
      .from('story_bookmarks')
      .select('id')
      .eq('story_id', storyId)
      .eq('user_id', user.id)
      .maybeSingle();

    setIsBookmarked(!!data);
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast.error('Please log in to bookmark stories');
      return;
    }

    if (!storyId) return;

    setLoading(true);

    try {
      if (isBookmarked) {
        await supabase
          .from('story_bookmarks')
          .delete()
          .eq('story_id', storyId)
          .eq('user_id', user.id);
        
        setIsBookmarked(false);
        toast.success('Bookmark removed');
      } else {
        await supabase
          .from('story_bookmarks')
          .insert({
            story_id: storyId,
            user_id: user.id
          });
        
        setIsBookmarked(true);
        toast.success('Story bookmarked!');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    } finally {
      setLoading(false);
    }
  };

  return { isBookmarked, toggleBookmark, loading };
};

export const getUserBookmarks = async (userId: string) => {
  const { data, error } = await supabase
    .from('story_bookmarks')
    .select(`
      story_id,
      bookmarked_at,
      stories (
        id,
        title,
        content,
        story_type,
        featured_image_url,
        created_at,
        view_count,
        author:profiles!stories_author_id_fkey (
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('user_id', userId)
    .order('bookmarked_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }

  return data || [];
};
