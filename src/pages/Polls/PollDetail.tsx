import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Poll {
  id: string;
  question: string;
  options: string[];
  category: string;
}

export default function PollDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState<{ option: string; votes: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPoll();
      fetchResults();
      checkIfVoted();
    }
  }, [id, user]);

  const fetchPoll = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('id, question, options, category')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPoll({
        ...data,
        options: data.options as unknown as string[]
      });
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

  const checkIfVoted = async () => {
    if (!user || !id) return;
    
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('option_index')
        .eq('poll_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setHasVoted(true);
        setSelectedOption(data.option_index);
      }
    } catch (error: any) {
      console.error('Error checking vote:', error);
    }
  };

  const fetchResults = async () => {
    if (!id || !poll) return;

    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('option_index')
        .eq('poll_id', id);

      if (error) throw error;

      const voteCounts = (poll.options as string[]).map((option, index) => ({
        option,
        votes: data?.filter(v => v.option_index === index).length || 0,
      }));

      setResults(voteCounts);
    } catch (error: any) {
      console.error('Error fetching results:', error);
    }
  };

  const handleVote = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to vote',
        variant: 'destructive',
      });
      return;
    }

    if (selectedOption === null) {
      toast({
        title: 'Select an Option',
        description: 'Please select an option before voting',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: id!,
          user_id: user.id,
          option_index: selectedOption,
        });

      if (error) throw error;

      await supabase.rpc('increment_user_interaction', { p_user_id: user.id });

      setHasVoted(true);
      fetchResults();
      toast({
        title: 'Vote Submitted',
        description: 'Thank you for participating!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  if (loading || !poll) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center">Loading poll...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{poll.question}</CardTitle>
              <p className="text-sm text-muted-foreground">Category: {poll.category}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {!hasVoted ? (
                <>
                  <RadioGroup value={selectedOption?.toString()} onValueChange={(v) => setSelectedOption(parseInt(v))}>
                    {(poll.options as string[]).map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="cursor-pointer">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <Button onClick={handleVote} className="w-full">Submit Vote</Button>
                </>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    You voted for: {(poll.options as string[])[selectedOption!]}
                  </p>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="option" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="votes">
                          {results.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {results.map((result, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{result.option}</span>
                        <span className="font-semibold">{result.votes} votes</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
