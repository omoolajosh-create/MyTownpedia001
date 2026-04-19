import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function PrayerCapsuleButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [releaseDate, setReleaseDate] = useState<Date>();
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a prayer capsule',
        variant: 'destructive',
      });
      return;
    }

    if (!releaseDate) {
      toast({
        title: 'Error',
        description: 'Please select a release date',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('prayer_capsules').insert({
        content,
        author_id: user.id,
        release_date: releaseDate.toISOString(),
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your prayer capsule has been sealed and will be released on the chosen date',
      });
      setOpen(false);
      setContent('');
      setReleaseDate(undefined);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-gradient-to-r from-heritage-gold to-yellow-600 hover:from-heritage-gold/90 hover:to-yellow-600/90 text-white font-semibold shadow-lg"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Prayer & Wishes Capsule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-heritage-gold" />
            Create Prayer & Wishes Capsule
          </DialogTitle>
          <DialogDescription>
            Write your prayers, wishes, or messages for the future. They will be sealed and revealed on your chosen date.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">Your Message *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your prayers, wishes, or hopes for the future..."
              rows={6}
              required
            />
          </div>

          <div>
            <Label>Release Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !releaseDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {releaseDate ? format(releaseDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={releaseDate}
                  onSelect={setReleaseDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-sm text-muted-foreground mt-1">
              Your capsule will be opened and visible on this date
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !user} className="flex-1">
              {loading ? 'Sealing...' : 'Seal Capsule'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>

          {!user && (
            <p className="text-sm text-destructive">
              Please log in to create a prayer capsule
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
