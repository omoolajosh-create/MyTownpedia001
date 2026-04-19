import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Brain, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Helmet } from 'react-helmet-async';

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  created_at: string;
}

export default function QuizzesList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, description, difficulty, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Community Quizzes | MyTownpedia</title>
        <meta name="description" content="Take engaging community quizzes on MyTownpedia and test your knowledge." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <div className="container mx-auto px-4 py-12 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Quizzes</h1>
                <p className="text-lg text-muted-foreground">
                  Test your knowledge about Ekiti history and culture!
                </p>
              </div>
              {isAdmin && (
                <Button onClick={() => navigate('/admin/quizzes/create')} size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Quiz
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading quizzes...</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No active quizzes at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="rounded-xl shadow-warm hover:shadow-glow transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl">{quiz.title}</CardTitle>
                      <Badge className={getDifficultyColor(quiz.difficulty)}>
                        {quiz.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/quizzes/${quiz.id}`}>
                      <Button className="w-full">Take Quiz</Button>
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
