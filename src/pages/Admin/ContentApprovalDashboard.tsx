import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ArrowLeft, Check, X, Eye, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

interface PendingContent {
  id: string;
  original_title: string;
  original_content: string;
  rewritten_title: string;
  rewritten_content: string;
  content_type: string;
  category: string;
  approval_status: string;
  ai_rewrite_status: string;
  ai_quality_score: number;
  ai_originality_score: number;
  created_at: string;
}

export default function ContentApprovalDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [pendingContent, setPendingContent] = useState<PendingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<PendingContent | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !isAdmin) {
      navigate('/', { replace: true });
      return;
    }

    fetchPendingContent();
    const interval = setInterval(fetchPendingContent, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user, isAdmin, authLoading, navigate]);

  const fetchPendingContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pending_content')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPendingContent(data || []);
    } catch (error) {
      console.error('Error fetching pending content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending content',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (contentId: string) => {
    if (!selectedContent) return;

    try {
      setIsProcessing(true);

      // Create news article from approved content
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .insert({
          title: selectedContent.rewritten_title || selectedContent.original_title,
          content: selectedContent.rewritten_content || selectedContent.original_content,
          excerpt: selectedContent.rewritten_content?.substring(0, 150) || '',
          category: selectedContent.category,
          tags: [], // Will be populated from pending_content tags
          author_id: user?.id,
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (newsError) throw newsError;

      // Update pending content with approval
      const { error: updateError } = await supabase
        .from('pending_content')
        .update({
          approval_status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          published_news_id: newsData?.id,
          published_at: new Date().toISOString(),
        })
        .eq('id', contentId);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Content approved and published',
      });

      setShowPreview(false);
      setSelectedContent(null);
      fetchPendingContent();
    } catch (error) {
      console.error('Error approving content:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve content',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (contentId: string) => {
    try {
      setIsProcessing(true);

      const { error } = await supabase
        .from('pending_content')
        .update({
          approval_status: 'rejected',
          approval_notes: rejectionNotes,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Content rejected',
      });

      setShowPreview(false);
      setSelectedContent(null);
      setRejectionNotes('');
      fetchPendingContent();
    } catch (error) {
      console.error('Error rejecting content:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject content',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Helmet>
        <title>Content Approval - MyTownpedia Admin</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-serif font-bold">Content Approval</h1>
                <p className="text-muted-foreground">
                  Review and approve aggregated content before publishing
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary">
                    {pendingContent.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-600">
                    {pendingContent.filter(c => c.ai_rewrite_status === 'completed').length}
                  </div>
                  <p className="text-sm text-muted-foreground">AI Rewritten</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-600">
                    {pendingContent.filter(c => c.ai_rewrite_status === 'processing').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                </CardContent>
              </Card>
              <Button
                onClick={fetchPendingContent}
                variant="outline"
                className="h-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pendingContent.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <h3 className="text-2xl font-bold mb-4">No Pending Content</h3>
                <p className="text-muted-foreground">
                  All content has been reviewed. Check back soon for new submissions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Pending Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>AI Status</TableHead>
                        <TableHead>Quality</TableHead>
                        <TableHead>Originality</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingContent.map((content) => (
                        <TableRow key={content.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {content.rewritten_title || content.original_title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{content.content_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{content.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(content.ai_rewrite_status)}>
                              {content.ai_rewrite_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${content.ai_quality_score || 0}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm">
                                {content.ai_quality_score || 0}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{
                                    width: `${content.ai_originality_score || 0}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm">
                                {content.ai_originality_score || 0}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedContent(content);
                                  setShowPreview(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedContent?.rewritten_title || selectedContent?.original_title}
              </DialogTitle>
              <DialogDescription>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{selectedContent?.content_type}</Badge>
                  <Badge variant="secondary">{selectedContent?.category}</Badge>
                  <Badge className={getStatusColor(selectedContent?.ai_rewrite_status || '')}>
                    {selectedContent?.ai_rewrite_status}
                  </Badge>
                </div>
              </DialogDescription>
            </DialogHeader>

            {selectedContent && (
              <div className="space-y-6">
                {/* Quality Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Quality Score</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{
                          width: `${selectedContent.ai_quality_score || 0}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedContent.ai_quality_score || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Originality Score</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full"
                        style={{
                          width: `${selectedContent.ai_originality_score || 0}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedContent.ai_originality_score || 0}%
                    </p>
                  </div>
                </div>

                {/* Original vs Rewritten */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Original</h4>
                    <div className="bg-muted p-3 rounded text-sm max-h-40 overflow-y-auto">
                      <p className="font-medium mb-2">{selectedContent.original_title}</p>
                      <p className="text-xs line-clamp-6">
                        {selectedContent.original_content}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">AI Rewritten</h4>
                    <div className="bg-green-50 p-3 rounded text-sm max-h-40 overflow-y-auto">
                      <p className="font-medium mb-2">{selectedContent.rewritten_title}</p>
                      <p className="text-xs line-clamp-6">
                        {selectedContent.rewritten_content}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rejection Notes */}
                <div>
                  <label className="text-sm font-medium">Notes (if rejecting)</label>
                  <Textarea
                    placeholder="Enter reason for rejection..."
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedContent && handleReject(selectedContent.id)}
                disabled={isProcessing}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => selectedContent && handleApprove(selectedContent.id)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Approve & Publish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
