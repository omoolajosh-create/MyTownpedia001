import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export function useComments(storyId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url)
        `)
        .eq('story_id', storyId)
        .is('parent_id', null)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from('comments')
            .select(`
              *,
              author:profiles(id, full_name, avatar_url)
            `)
            .eq('parent_id', comment.id)
            .eq('is_approved', true)
            .order('created_at', { ascending: true });

          return { ...comment, replies: replies || [] } as Comment;
        })
      );

      setComments(commentsWithReplies as Comment[]);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`comments:story_id=eq.${storyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `story_id=eq.${storyId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storyId]);

  const submitComment = async (content: string, parentId?: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to comment',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('comments').insert({
        content,
        story_id: storyId,
        author_id: user.id,
        parent_id: parentId || null,
        is_approved: false, // Comments need approval
      });

      if (error) throw error;

      toast({
        title: 'Comment submitted',
        description: 'Your comment is pending approval',
      });

      // Refresh comments
      fetchComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit comment',
        variant: 'destructive',
      });
    }
  };

  return {
    comments,
    loading,
    submitComment,
    refreshComments: fetchComments,
  };
}