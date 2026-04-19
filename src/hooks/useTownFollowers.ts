import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useTownFollowers = (townId: string | undefined) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!townId) return;

    checkFollowStatus();
    getFollowerCount();
  }, [townId, user]);

  const checkFollowStatus = async () => {
    if (!user || !townId) {
      setIsFollowing(false);
      return;
    }

    const { data } = await supabase
      .from('town_followers')
      .select('id')
      .eq('town_id', townId)
      .eq('user_id', user.id)
      .maybeSingle();

    setIsFollowing(!!data);
  };

  const getFollowerCount = async () => {
    if (!townId) return;

    const { count } = await supabase
      .from('town_followers')
      .select('*', { count: 'exact', head: true })
      .eq('town_id', townId);

    setFollowerCount(count || 0);
  };

  const toggleFollow = async () => {
    if (!user) {
      toast.error('Please log in to follow towns');
      return;
    }

    if (!townId) return;

    setLoading(true);

    try {
      if (isFollowing) {
        await supabase
          .from('town_followers')
          .delete()
          .eq('town_id', townId)
          .eq('user_id', user.id);
        
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        toast.success('Unfollowed town');
      } else {
        await supabase
          .from('town_followers')
          .insert({
            town_id: townId,
            user_id: user.id
          });
        
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast.success('Following town!');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, followerCount, toggleFollow, loading };
};

export const getUserFollowedTowns = async (userId: string) => {
  const { data, error } = await supabase
    .from('town_followers')
    .select(`
      town_id,
      followed_at,
      towns (
        id,
        name,
        slug,
        description,
        featured_image_url,
        view_count,
        location
      )
    `)
    .eq('user_id', userId)
    .order('followed_at', { ascending: false });

  if (error) {
    console.error('Error fetching followed towns:', error);
    return [];
  }

  return data || [];
};
