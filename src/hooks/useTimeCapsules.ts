import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TimeCapsule {
  id: string;
  author_id: string;
  title: string;
  content: string;
  media_urls: string[];
  unlock_date: string;
  is_unlocked: boolean;
  recipients: string[];
  capsule_type: 'personal' | 'family' | 'community';
  town_id: string | null;
  created_at: string;
  unlocked_at: string | null;
  view_count: number;
}

export const useTimeCapsules = () => {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCapsules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('time_capsules')
        .select('*')
        .order('created_at', { ascending: false });

      if (user) {
        // Fetch user's own capsules + unlocked public capsules
        query = query.or(`author_id.eq.${user.id},and(is_unlocked.eq.true,unlock_date.lte.${new Date().toISOString()})`);
      } else {
        // Only unlocked capsules for non-authenticated users
        query = query.eq('is_unlocked', true).lte('unlock_date', new Date().toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setCapsules((data as TimeCapsule[]) || []);
    } catch (error: any) {
      console.error('Error fetching capsules:', error);
      toast.error('Failed to load time capsules');
    } finally {
      setLoading(false);
    }
  };

  const createCapsule = async (capsule: Omit<TimeCapsule, 'id' | 'created_at' | 'is_unlocked' | 'unlocked_at' | 'view_count'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be signed in to create a time capsule');
        return { error: 'Not authenticated' };
      }

      const { error } = await supabase.from('time_capsules').insert([{
        ...capsule,
        author_id: user.id
      }]);

      if (error) throw error;

      toast.success('Time capsule sealed! It will unlock on the specified date.');
      fetchCapsules();
      return { error: null };
    } catch (error: any) {
      console.error('Error creating capsule:', error);
      toast.error('Failed to create time capsule');
      return { error: error.message };
    }
  };

  useEffect(() => {
    fetchCapsules();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('time_capsules_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_capsules'
        },
        () => {
          fetchCapsules();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    capsules,
    loading,
    createCapsule,
    refetch: fetchCapsules
  };
};
