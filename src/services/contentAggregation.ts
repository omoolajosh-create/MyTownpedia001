import { supabase } from '@/integrations/supabase/client';
import Parser from 'rss-parser';

const parser = new Parser();

export interface ContentSource {
  id: string;
  name: string;
  source_type: 'rss' | 'api' | 'web_scrape';
  url: string;
  category: 'news' | 'jobs' | 'events' | 'opportunities';
  is_active: boolean;
}

export interface FetchedContent {
  title: string;
  content: string;
  url: string;
  source: string;
  image_url?: string;
  published_at?: string;
}

// Default content sources to aggregate from
export const DEFAULT_SOURCES: Omit<ContentSource, 'id'>[] = [
  {
    name: 'Ekiti State News RSS',
    source_type: 'rss',
    url: 'https://ekitistate.gov.ng/feed/',
    category: 'news',
    is_active: true,
  },
  {
    name: 'BBC News Africa',
    source_type: 'rss',
    url: 'http://feeds.bbc.co.uk/news/world/africa/rss.xml',
    category: 'news',
    is_active: true,
  },
  {
    name: 'Nigeria News',
    source_type: 'rss',
    url: 'https://www.vanguardngr.com/feed/',
    category: 'news',
    is_active: true,
  },
  {
    name: 'LinkedIn Jobs',
    source_type: 'api',
    url: 'https://www.linkedin.com/jobs/search/',
    category: 'jobs',
    is_active: true,
  },
  {
    name: 'Government Opportunities',
    source_type: 'web_scrape',
    url: 'https://www.firs.gov.ng/',
    category: 'opportunities',
    is_active: true,
  },
];

/**
 * Fetch content from RSS feeds
 */
export async function fetchRSSContent(url: string): Promise<FetchedContent[]> {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || [])
      .slice(0, 10) // Limit to 10 items per feed
      .map((item) => ({
        title: item.title || 'Untitled',
        content: item.content || item.summary || '',
        url: item.link || '',
        source: feed.title || 'Unknown Source',
        image_url: item.enclosure?.url || extractImageFromContent(item.content),
        published_at: item.pubDate,
      }));
  } catch (error) {
    console.error(`Error fetching RSS from ${url}:`, error);
    return [];
  }
}

/**
 * Extract image URL from HTML content
 */
function extractImageFromContent(content?: string): string | undefined {
  if (!content) return undefined;
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : undefined;
}

/**
 * Check if content already exists (duplicate detection)
 */
export async function isDuplicateContent(
  sourceId: string,
  title: string,
  content: string
): Promise<boolean> {
  try {
    const titleHash = hashString(title);
    const contentHash = hashString(content.substring(0, 500)); // Hash first 500 chars

    const { data, error } = await supabase
      .from('content_cache')
      .select('id')
      .eq('source_id', sourceId)
      .eq('title_hash', titleHash)
      .eq('content_hash', contentHash)
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking duplicate:', error);
    return false;
  }
}

/**
 * Simple hash function for content deduplication
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Cache fetched content to avoid duplicates
 */
export async function cacheContent(
  sourceId: string,
  url: string,
  title: string,
  content: string
): Promise<void> {
  try {
    const titleHash = hashString(title);
    const contentHash = hashString(content.substring(0, 500));

    await supabase.from('content_cache').insert({
      source_id: sourceId,
      original_url: url,
      title_hash: titleHash,
      content_hash: contentHash,
    });
  } catch (error) {
    console.error('Error caching content:', error);
  }
}

/**
 * Save content to pending approval queue
 */
export async function savePendingContent(
  sourceId: string,
  content: FetchedContent,
  contentType: string,
  category: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('pending_content')
      .insert({
        source_id: sourceId,
        original_title: content.title,
        original_content: content.content,
        original_url: content.url,
        original_source: content.source,
        image_url: content.image_url,
        content_type: contentType,
        category: category,
        tags: extractTags(content.title + ' ' + content.content),
        ai_rewrite_status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error('Error saving pending content:', error);
    return null;
  }
}

/**
 * Extract tags from content
 */
function extractTags(text: string): string[] {
  const keywords = [
    'news', 'update', 'event', 'opportunity', 'job', 'government',
    'community', 'development', 'education', 'health', 'business',
    'technology', 'culture', 'sports', 'entertainment', 'politics'
  ];

  const foundTags = keywords.filter(keyword =>
    text.toLowerCase().includes(keyword)
  );

  return foundTags.slice(0, 5); // Limit to 5 tags
}

/**
 * Log aggregation activity
 */
export async function logAggregationActivity(
  sourceId: string | null,
  action: string,
  contentId: string | null,
  details?: Record<string, any>,
  errorMessage?: string
): Promise<void> {
  try {
    await supabase.from('content_logs').insert({
      source_id: sourceId,
      action,
      content_id: contentId,
      details: details || {},
      error_message: errorMessage,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

/**
 * Get all active content sources
 */
export async function getActiveSources(): Promise<ContentSource[]> {
  try {
    const { data, error } = await supabase
      .from('content_sources')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active sources:', error);
    return [];
  }
}

/**
 * Initialize default content sources
 */
export async function initializeDefaultSources(): Promise<void> {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('content_sources')
      .select('name');

    if (fetchError) throw fetchError;

    const existingNames = (existing || []).map((s: any) => s.name);

    const newSources = DEFAULT_SOURCES.filter(
      (source) => !existingNames.includes(source.name)
    );

    if (newSources.length > 0) {
      const { error: insertError } = await supabase
        .from('content_sources')
        .insert(newSources);

      if (insertError) throw insertError;
      console.log(`Initialized ${newSources.length} default content sources`);
    }
  } catch (error) {
    console.error('Error initializing default sources:', error);
  }
}
