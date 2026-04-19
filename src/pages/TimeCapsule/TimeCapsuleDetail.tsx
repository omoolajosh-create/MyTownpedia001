import { Layout } from '@/components/layout/Layout';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TimeCapsule } from '@/hooks/useTimeCapsules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Lock, Unlock, Calendar, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { toast } from 'sonner';

export default function TimeCapsuleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [capsule, setCapsule] = useState<TimeCapsule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCapsule();
  }, [id]);

  const fetchCapsule = async () => {
    try {
      const { data, error } = await supabase
        .from('time_capsules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCapsule(data as TimeCapsule);
    } catch (error: any) {
      console.error('Error fetching capsule:', error);
      toast.error('Failed to load time capsule');
    } finally {
      setLoading(false);
    }
  };

  const getTimeStatus = (unlockDate: string, isUnlocked: boolean) => {
    if (isUnlocked) {
      return { label: 'Unlocked', icon: Unlock, variant: 'default' as const };
    }
    if (isPast(new Date(unlockDate))) {
      return { label: 'Ready to Unlock', icon: Unlock, variant: 'default' as const };
    }
    return { label: 'Sealed', icon: Lock, variant: 'secondary' as const };
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-8 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (!capsule) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Time Capsule Not Found</h1>
            <Button onClick={() => navigate('/time-capsule')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Time Capsules
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const status = getTimeStatus(capsule.unlock_date, capsule.is_unlocked);
  const StatusIcon = status.icon;
  const canView = capsule.is_unlocked || isPast(new Date(capsule.unlock_date));

  return (
    <Layout>
      <Helmet>
        <title>{capsule.title} - Time Capsule</title>
        <meta name="description" content={`Time capsule: ${capsule.title}`} />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/time-capsule')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Time Capsules
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-4">
                <CardTitle className="text-3xl">{capsule.title}</CardTitle>
                <Badge variant={status.variant} className="shrink-0">
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <CardDescription className="flex flex-wrap gap-4 text-base">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {capsule.is_unlocked 
                    ? `Unlocked on ${format(new Date(capsule.unlocked_at!), 'MMMM d, yyyy')}`
                    : `Unlocks on ${format(new Date(capsule.unlock_date), 'MMMM d, yyyy')}`
                  }
                </span>
                <Badge variant="outline" className="capitalize">
                  {capsule.capsule_type}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {canView ? (
                <>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {capsule.content}
                    </p>
                  </div>

                  {capsule.media_urls && capsule.media_urls.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Attached Media
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {capsule.media_urls.map((url, index) => (
                          <div key={index} className="relative rounded-lg overflow-hidden border">
                            <img 
                              src={url} 
                              alt={`Capsule media ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {capsule.is_unlocked && capsule.unlocked_at && (
                    <div className="pt-4 border-t text-sm text-muted-foreground">
                      <p>This capsule was unlocked {format(new Date(capsule.unlocked_at), 'MMMM d, yyyy')}</p>
                      <p>Views: {capsule.view_count}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">This Capsule is Sealed</h3>
                  <p className="text-muted-foreground mb-4">
                    This time capsule will unlock on {format(new Date(capsule.unlock_date), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Come back after the unlock date to view its contents
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
