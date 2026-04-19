import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimeCapsules } from '@/hooks/useTimeCapsules';
import { useAuthSession } from '@/hooks/useAuthSession';
import { toast } from 'sonner';
import { ArrowLeft, Lock } from 'lucide-react';

export default function CreateTimeCapsule() {
  const [isLoading, setIsLoading] = useState(false);
  const { createCapsule } = useTimeCapsules();
  const { user } = useAuthSession();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const unlockDate = formData.get('unlockDate') as string;
    const capsuleType = formData.get('capsuleType') as 'personal' | 'family' | 'community';

    if (!title || !content || !unlockDate) {
      toast.error('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    const selectedDate = new Date(unlockDate);
    if (selectedDate <= new Date()) {
      toast.error('Unlock date must be in the future');
      setIsLoading(false);
      return;
    }

    const { error } = await createCapsule({
      title,
      content,
      unlock_date: selectedDate.toISOString(),
      capsule_type: capsuleType,
      media_urls: [],
      recipients: [],
      town_id: null,
      author_id: user.id
    });

    if (!error) {
      navigate('/time-capsule');
    }
    setIsLoading(false);
  };

  return (
    <Layout>
      <Helmet>
        <title>Create Time Capsule - African Heritage Platform</title>
        <meta name="description" content="Create a digital time capsule to preserve your memories for the future." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/time-capsule')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Capsules
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Create Time Capsule</CardTitle>
                  <CardDescription>
                    Seal your memories, stories, or messages to be revealed on a future date
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="My Heritage Journey"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Your Message *</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Write your story, memories, or message for the future..."
                    rows={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Share your thoughts, experiences, hopes, or family stories
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capsuleType">Capsule Type *</Label>
                  <Select name="capsuleType" defaultValue="personal">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal - Just for you</SelectItem>
                      <SelectItem value="family">Family - Share with family</SelectItem>
                      <SelectItem value="community">Community - Public when unlocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unlockDate">Unlock Date *</Label>
                  <Input
                    id="unlockDate"
                    name="unlockDate"
                    type="datetime-local"
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose when this capsule should be revealed
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    How it works
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Your capsule will be sealed until the unlock date</li>
                    <li>No one (including you) can view the contents until then</li>
                    <li>Once unlocked, it becomes part of our heritage archive</li>
                    <li>Community capsules will be visible to all members</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/time-capsule')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Sealing...' : 'Seal Capsule'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
