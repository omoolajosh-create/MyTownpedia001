import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Heart, Upload } from 'lucide-react';

export default function SubmitTribute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    photo_url: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('story-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('story-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, photo_url: publicUrl });
      toast({
        title: 'Success',
        description: 'Photo uploaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a tribute',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('memory_wall').insert({
        title: formData.title,
        message: formData.message,
        photo_url: formData.photo_url,
        author_id: user.id,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your tribute has been submitted for review',
      });
      navigate('/memory-wall');
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

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Please Log In</h1>
          <p className="text-muted-foreground">You must be logged in to submit a tribute.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Heart className="w-12 h-12 text-heritage-gold mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Share a Tribute</h1>
            <p className="text-muted-foreground">
              Honor the memory of a loved one who has passed away
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tribute Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Name / Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="In loving memory of..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="photo">Photo *</Label>
                  <div className="flex items-center gap-4">
                    {formData.photo_url ? (
                      <div className="relative w-32 h-32">
                        <img
                          src={formData.photo_url}
                          alt="Tribute"
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    ) : null}
                    <div>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="max-w-xs"
                      />
                      {uploadingImage && (
                        <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message / Tribute *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Share your memories and what made them special..."
                    rows={6}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading || !formData.photo_url} className="flex-1">
                    {loading ? 'Submitting...' : 'Submit Tribute'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/memory-wall')}
                  >
                    Cancel
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  * Your tribute will be reviewed by our team before being published.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
