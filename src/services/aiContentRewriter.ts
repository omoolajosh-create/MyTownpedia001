import { supabase } from '@/integrations/supabase/client';

export interface RewriteResult {
  title: string;
  content: string;
  excerpt: string;
  qualityScore: number;
  originalityScore: number;
}

/**
 * Rewrite content using AI to make it original and valuable
 * This uses the Manus built-in LLM API
 */
export async function rewriteContentWithAI(
  originalTitle: string,
  originalContent: string,
  contentType: string
): Promise<RewriteResult | null> {
  try {
    // Call the Manus LLM API through Supabase edge function or direct API
    const response = await fetch('/api/rewrite-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: originalTitle,
        content: originalContent,
        contentType: contentType,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error rewriting content with AI:', error);
    return null;
  }
}

/**
 * Generate a quality score for content (0-100)
 */
export function calculateQualityScore(content: string): number {
  let score = 50; // Base score

  // Length bonus (longer content = more valuable)
  if (content.length > 500) score += 15;
  if (content.length > 1000) score += 10;

  // Structure bonus
  if (content.includes('\n')) score += 10;
  if ((content.match(/\./g) || []).length > 5) score += 10;

  // Keyword presence
  const keywords = ['important', 'significant', 'opportunity', 'event', 'announcement', 'update'];
  keywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword)) score += 5;
  });

  // Ensure score is between 0-100
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate originality score (0-100)
 * This is a simplified version - in production, use plagiarism detection API
 */
export function calculateOriginalityScore(rewrittenContent: string, originalContent: string): number {
  // Simple similarity check - in production use Copyleaks or Turnitin API
  const originalWords = new Set(originalContent.toLowerCase().split(/\s+/));
  const rewrittenWords = rewrittenContent.toLowerCase().split(/\s+/);

  let matchCount = 0;
  rewrittenWords.forEach(word => {
    if (originalWords.has(word)) matchCount++;
  });

  const similarity = (matchCount / rewrittenWords.length) * 100;
  const originality = Math.max(0, 100 - similarity);

  return Math.round(originality);
}

/**
 * Update pending content with rewritten version
 */
export async function updatePendingContentWithRewrite(
  contentId: string,
  rewriteResult: RewriteResult
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('pending_content')
      .update({
        rewritten_title: rewriteResult.title,
        rewritten_content: rewriteResult.content,
        rewritten_excerpt: rewriteResult.excerpt,
        ai_quality_score: rewriteResult.qualityScore,
        ai_originality_score: rewriteResult.originalityScore,
        ai_rewrite_status: 'completed',
      })
      .eq('id', contentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating pending content:', error);
    return false;
  }
}

/**
 * Mark content rewrite as failed
 */
export async function markRewriteFailed(
  contentId: string,
  errorMessage: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('pending_content')
      .update({
        ai_rewrite_status: 'failed',
      })
      .eq('id', contentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking rewrite as failed:', error);
    return false;
  }
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content: string, maxLength: number = 150): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim());
  let excerpt = '';

  for (const sentence of sentences) {
    if ((excerpt + sentence).length <= maxLength) {
      excerpt += sentence + '. ';
    } else {
      break;
    }
  }

  return excerpt.trim() || content.substring(0, maxLength);
}
