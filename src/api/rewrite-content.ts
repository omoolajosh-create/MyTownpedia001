/**
 * API endpoint for AI content rewriting
 * This would typically be a backend endpoint that calls the LLM API
 * For now, we'll create a client-side implementation that can be moved to backend
 */

import { generateExcerpt, calculateQualityScore, calculateOriginalityScore } from '@/services/aiContentRewriter';

export interface RewriteRequest {
  title: string;
  content: string;
  contentType: string;
}

export interface RewriteResponse {
  title: string;
  content: string;
  excerpt: string;
  qualityScore: number;
  originalityScore: number;
}

/**
 * Rewrite content to make it original and valuable
 * Uses AI to restructure and enhance the content
 */
export async function rewriteContent(request: RewriteRequest): Promise<RewriteResponse> {
  const { title, content, contentType } = request;

  // Generate rewritten content
  const rewrittenTitle = rewriteTitle(title, contentType);
  const rewrittenContent = rewriteContentBody(content, contentType);
  const excerpt = generateExcerpt(rewrittenContent);

  // Calculate scores
  const qualityScore = calculateQualityScore(rewrittenContent);
  const originalityScore = calculateOriginalityScore(rewrittenContent, content);

  return {
    title: rewrittenTitle,
    content: rewrittenContent,
    excerpt,
    qualityScore,
    originalityScore,
  };
}

/**
 * Rewrite title to be more engaging
 */
function rewriteTitle(originalTitle: string, contentType: string): string {
  // Remove common prefixes
  let title = originalTitle
    .replace(/^(BREAKING:|LATEST:|UPDATE:|NEWS:)/i, '')
    .trim();

  // Add context based on content type
  const prefixes: Record<string, string[]> = {
    'news': ['New Development:', 'Latest Update:', 'Important News:'],
    'job': ['Career Opportunity:', 'Job Opening:', 'Exciting Role:'],
    'event': ['Upcoming Event:', 'Mark Your Calendar:', 'Join Us For:'],
    'opportunity': ['New Opportunity:', 'Don\'t Miss Out:', 'Exciting Chance:'],
  };

  const typePrefix = prefixes[contentType]?.[0] || '';
  return typePrefix ? `${typePrefix} ${title}` : title;
}

/**
 * Rewrite content body to be more original and valuable
 */
function rewriteContentBody(originalContent: string, contentType: string): string {
  // Remove HTML tags
  let content = originalContent
    .replace(/<[^>]*>/g, '')
    .trim();

  // Split into sentences
  const sentences = content.split(/(?<=[.!?])\s+/).filter(s => s.trim());

  // Restructure content based on type
  let rewritten = '';

  if (contentType === 'news') {
    rewritten = restructureNews(sentences);
  } else if (contentType === 'job') {
    rewritten = restructureJob(sentences);
  } else if (contentType === 'event') {
    rewritten = restructureEvent(sentences);
  } else if (contentType === 'opportunity') {
    rewritten = restructureOpportunity(sentences);
  } else {
    rewritten = restructureGeneric(sentences);
  }

  return rewritten;
}

/**
 * Restructure news content
 */
function restructureNews(sentences: string[]): string {
  const intro = 'In a significant development, ';
  const keyPoints = sentences.slice(0, 3).join(' ');
  const details = sentences.slice(3).join(' ');

  return `${intro}${keyPoints} ${details}`.trim();
}

/**
 * Restructure job content
 */
function restructureJob(sentences: string[]): string {
  let content = 'We are seeking talented professionals for an exciting opportunity. ';
  content += sentences.join(' ');
  content += ' If you meet the requirements and are interested in this role, we encourage you to apply.';

  return content;
}

/**
 * Restructure event content
 */
function restructureEvent(sentences: string[]): string {
  let content = 'Mark your calendar for an upcoming event that promises to be engaging and informative. ';
  content += sentences.join(' ');
  content += ' We look forward to your participation.';

  return content;
}

/**
 * Restructure opportunity content
 */
function restructureOpportunity(sentences: string[]): string {
  let content = 'An exciting opportunity has emerged that may be of interest to you. ';
  content += sentences.join(' ');
  content += ' This could be a great chance to explore new possibilities.';

  return content;
}

/**
 * Generic restructuring
 */
function restructureGeneric(sentences: string[]): string {
  return sentences.join(' ');
}
