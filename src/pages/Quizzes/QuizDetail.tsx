import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function QuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, description, questions')
        .eq('id', id)
        .single();

      if (error) throw error;
      const quizData = {
        ...data,
        questions: data.questions as unknown as Question[]
      };
      setQuiz(quizData);
      setAnswers(new Array(quizData.questions.length).fill(-1));
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

  const handleNext = () => {
    if (selectedAnswer === null) {
      toast({
        title: 'Select an Answer',
        description: 'Please select an answer before proceeding',
        variant: 'destructive',
      });
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: number[]) => {
    if (!user || !quiz) {
      toast({
        title: 'Login Required',
        description: 'Please log in to submit your quiz',
        variant: 'destructive',
      });
      return;
    }

    let correctCount = 0;
    quiz.questions.forEach((q, i) => {
      if (finalAnswers[i] === q.correctAnswer) correctCount++;
    });

    setScore(correctCount);
    setShowResults(true);

    try {
      await supabase.from('quiz_submissions').insert({
        quiz_id: id!,
        user_id: user.id,
        answers: finalAnswers,
        score: correctCount,
      });

      await supabase.rpc('increment_user_interaction', { p_user_id: user.id });

      const points = correctCount * 10;
      const { data: stats } = await supabase
        .from('user_stats')
        .select('quiz_points')
        .eq('user_id', user.id)
        .maybeSingle();

      if (stats) {
        await supabase
          .from('user_stats')
          .update({ quiz_points: stats.quiz_points + points })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_stats')
          .insert({ user_id: user.id, quiz_points: points });
      }
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
    }
  };

  if (loading || !quiz) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center">Loading quiz...</p>
        </div>
      </Layout>
    );
  }

  if (showResults) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl text-center">Quiz Complete!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-6xl font-bold text-primary mb-2">
                    {score}/{quiz.questions.length}
                  </p>
                  <p className="text-xl text-muted-foreground">
                    You got {score} out of {quiz.questions.length} questions correct!
                  </p>
                  <p className="text-lg mt-2">+{score * 10} points earned</p>
                </div>

                <div className="space-y-4">
                  {quiz.questions.map((q, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-2">
                        {answers[index] === q.correctAnswer ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mt-1" />
                        )}
                        <p className="font-semibold">{q.question}</p>
                      </div>
                      <p className="text-sm text-muted-foreground ml-7">
                        Your answer: {q.options[answers[index]]}
                      </p>
                      {answers[index] !== q.correctAnswer && (
                        <p className="text-sm text-green-600 ml-7">
                          Correct answer: {q.options[q.correctAnswer]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => navigate('/quizzes')} className="flex-1">
                    Back to Quizzes
                  </Button>
                  <Button onClick={() => navigate('/leaderboard')} variant="outline" className="flex-1">
                    View Leaderboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className="text-xl font-semibold">{question.question}</h3>
              
              <RadioGroup value={selectedAnswer?.toString()} onValueChange={(v) => setSelectedAnswer(parseInt(v))}>
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`answer-${index}`} />
                    <Label htmlFor={`answer-${index}`} className="cursor-pointer">{option}</Label>
                  </div>
                ))}
              </RadioGroup>

              <Button onClick={handleNext} className="w-full">
                {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
