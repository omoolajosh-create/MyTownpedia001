import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Stats {
  storiesCount: number;
  townsCount: number;
  membersCount: number;
  oldestYear: number;
}

export const useStats = () => {
  const [stats, setStats] = useState<Stats>({
    storiesCount: 0,
    townsCount: 0,
    membersCount: 0,
    oldestYear: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch stories count
      const { count: storiesCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Fetch towns count
      const { count: townsCount } = await supabase
        .from('towns')
        .select('*', { count: 'exact', head: true });

      // Fetch members count
      const { count: membersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Calculate years of heritage (from oldest town founded_year to now)
      const { data: oldestTown } = await supabase
        .from('towns')
        .select('founded_year')
        .not('founded_year', 'is', null)
        .order('founded_year', { ascending: true })
        .limit(1)
        .maybeSingle();

      const currentYear = new Date().getFullYear();
      const yearsOfHeritage = oldestTown?.founded_year 
        ? currentYear - oldestTown.founded_year 
        : 0;

      setStats({
        storiesCount: storiesCount || 0,
        townsCount: townsCount || 0,
        membersCount: 10,
        oldestYear: yearsOfHeritage || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading };
};
