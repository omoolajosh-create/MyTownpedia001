import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ShareButtons } from '@/components/social/ShareButtons';

interface Tribute {
  id: string;
  title: string;
  photo_url: string;
  message: string;
  author_id: string;
  created_at: string;
}

export default function MemoryWall() {
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchTributes();
  }, []);

  const fetchTributes = async () => {
    try {
      const { data, error } = await supabase
        .from('memory_wall')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTributes(data || []);
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-heritage-gold" />
              <h1 className="text-4xl md:text-5xl font-bold">Memory Wall</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              Honoring the lives and legacies of our loved ones
            </p>
            {user && (
              <Link to="/memory-wall/submit">
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Share a Tribute
                </Button>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading tributes...</p>
            </div>
          ) : tributes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No tributes yet. Be the first to share a memory.</p>
              {user && (
                <Link to="/memory-wall/submit">
                  <Button>Share a Tribute</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tributes.map((tribute) => (
                <Card key={tribute.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={tribute.photo_url}
                      alt={tribute.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{tribute.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3">{tribute.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(tribute.created_at).toLocaleDateString()}
                      </span>
                      <ShareButtons
                        url={`${window.location.origin}/memory-wall#${tribute.id}`}
                        title={tribute.title}
                        description={tribute.message}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
