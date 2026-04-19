import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Trophy, TrendingUp } from 'lucide-react';

interface LeaderboardUser {
  user_id: string;
  total_posts: number;
  total_interactions: number;
  quiz_points: number;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface TownStats {
  town_id: string;
  post_count: number;
  towns: {
    name: string;
  };
}

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [topTowns, setTopTowns] = useState<TownStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      // Fetch top users
      const { data: usersData, error: usersError } = await supabase
        .from('user_stats')
        .select('user_id, total_posts, total_interactions, quiz_points')
        .order('total_interactions', { ascending: false })
        .limit(10);

      if (usersError) throw usersError;

      // Fetch profiles separately
      const enrichedUsers = await Promise.all(
        (usersData || []).map(async (user) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.user_id)
            .maybeSingle();
          
          return {
            ...user,
            profiles: profile || { full_name: '', avatar_url: '' }
          };
        })
      );

      setTopUsers(enrichedUsers);

      // Fetch top towns by post count
      const { data: townsData, error: townsError } = await supabase
        .from('stories')
        .select('town_id, towns:town_id(name)')
        .eq('is_published', true);

      if (townsError) throw townsError;

      const townCounts = townsData?.reduce((acc: Record<string, any>, story) => {
        const townId = story.town_id;
        if (!acc[townId]) {
          acc[townId] = {
            town_id: townId,
            post_count: 0,
            towns: story.towns,
          };
        }
        acc[townId].post_count++;
        return acc;
      }, {});

      const sortedTowns = Object.values(townCounts || {})
        .sort((a: any, b: any) => b.post_count - a.post_count)
        .slice(0, 10);

      setTopTowns(sortedTowns as TownStats[]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-500';
      case 1: return 'text-gray-400';
      case 2: return 'text-amber-700';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Leaderboard</h1>
            <p className="text-lg text-muted-foreground">
              Top contributors and most active towns
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Top Contributors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topUsers.map((user, index) => (
                      <div key={user.user_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <span className={`text-2xl font-bold w-8 ${getMedalColor(index)}`}>
                          {index + 1}
                        </span>
                        <Avatar>
                          <AvatarImage src={user.profiles?.avatar_url} />
                          <AvatarFallback>
                            {user.profiles?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{user.profiles?.full_name || 'Anonymous'}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.total_interactions} interactions • {user.quiz_points} quiz points
                          </p>
                        </div>
                        <Badge variant="secondary">{user.total_posts} posts</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Towns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Most Active Towns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topTowns.map((town, index) => (
                      <div key={town.town_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <span className={`text-2xl font-bold w-8 ${getMedalColor(index)}`}>
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold">{town.towns?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {town.post_count} published stories
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
