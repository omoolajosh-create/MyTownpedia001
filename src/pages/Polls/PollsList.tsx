import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { BarChart3, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface Poll {
  id: string;
  question: string;
  category: string;
  created_at: string;
}

export default function PollsList() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('id, question, category, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolls(data || []);
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
      <Helmet>
        <title>Community Polls | MyTownpedia</title>
        <meta name="description" content="Vote in community polls on MyTownpedia and see real-time results." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <div className="container mx-auto px-4 py-12 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Polls</h1>
                <p className="text-lg text-muted-foreground">
                  Share your opinion and see what others think!
                </p>
              </div>
              {isAdmin && (
                <Button onClick={() => navigate('/admin/polls/create')} size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Poll
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading polls...</p>
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No active polls at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {polls.map((poll) => (
                <Card key={poll.id} className="rounded-xl shadow-warm hover:shadow-glow transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{poll.question}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Category: {poll.category}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/polls/${poll.id}`}>
                      <Button className="w-full">Vote & View Results</Button>
                    </Link>
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
