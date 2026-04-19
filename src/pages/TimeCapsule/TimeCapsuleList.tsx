import { Layout } from '@/components/layout/Layout';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTimeCapsules } from '@/hooks/useTimeCapsules';
import { useAuthSession } from '@/hooks/useAuthSession';
import { Link } from 'react-router-dom';
import { Clock, Lock, Unlock, Calendar, Users } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';

export default function TimeCapsuleList() {
  const { capsules, loading } = useTimeCapsules();
  const { user } = useAuthSession();

  const getTimeStatus = (unlockDate: string, isUnlocked: boolean) => {
    if (isUnlocked) {
      return { label: 'Unlocked', icon: Unlock, variant: 'default' as const };
    }
    if (isPast(new Date(unlockDate))) {
      return { label: 'Ready to Unlock', icon: Unlock, variant: 'default' as const };
    }
    return { label: 'Sealed', icon: Lock, variant: 'secondary' as const };
  };

  return (
    <Layout>
      <Helmet>
        <title>Digital Time Capsules - African Heritage Platform</title>
        <meta name="description" content="Preserve memories for the future. Create sealed time capsules to be revealed on special dates." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Digital Time Capsules</h1>
              <p className="text-muted-foreground">
                Seal your memories, stories, and messages for the future
              </p>
            </div>
            {user && (
              <Link to="/time-capsule/create">
                <Button size="lg">
                  <Clock className="mr-2 h-5 w-5" />
                  Create Capsule
                </Button>
              </Link>
            )}
          </div>

          {!user && (
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-center">
                  <Link to="/auth" className="text-primary hover:underline font-semibold">
                    Sign in
                  </Link>
                  {' '}to create your own time capsules and preserve your heritage stories for future generations.
                </p>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : capsules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground mb-4">
                  No time capsules yet. Be the first to seal a memory for the future!
                </p>
                {user && (
                  <Link to="/time-capsule/create">
                    <Button>Create Your First Capsule</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capsules.map((capsule) => {
                const status = getTimeStatus(capsule.unlock_date, capsule.is_unlocked);
                const StatusIcon = status.icon;
                
                return (
                  <Link key={capsule.id} to={`/time-capsule/${capsule.id}`}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="line-clamp-2">{capsule.title}</CardTitle>
                          <Badge variant={status.variant} className="shrink-0">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Calendar className="h-4 w-4" />
                          {capsule.is_unlocked 
                            ? `Unlocked ${format(new Date(capsule.unlocked_at!), 'MMM d, yyyy')}`
                            : `Unlocks ${format(new Date(capsule.unlock_date), 'MMM d, yyyy')}`
                          }
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {capsule.is_unlocked 
                            ? capsule.content 
                            : 'This capsule is sealed until its unlock date...'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <Badge variant="outline" className="capitalize">
                            {capsule.capsule_type}
                          </Badge>
                          {!capsule.is_unlocked && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(capsule.unlock_date), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
