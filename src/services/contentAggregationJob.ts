/**
 * Background job service for content aggregation
 * This runs periodically to fetch content from sources and queue for approval
 */

import {
  fetchRSSContent,
  isDuplicateContent,
  cacheContent,
  savePendingContent,
  logAggregationActivity,
  getActiveSources,
} from './contentAggregation';
import {
  rewriteContentWithAI,
  updatePendingContentWithRewrite,
  markRewriteFailed,
} from './aiContentRewriter';

/**
 * Run the content aggregation job
 * This should be called periodically (e.g., every 30-60 minutes)
 */
export async function runContentAggregationJob(): Promise<void> {
  console.log('[ContentAggregation] Starting aggregation job...');

  try {
    const sources = await getActiveSources();

    if (sources.length === 0) {
      console.log('[ContentAggregation] No active sources found');
      return;
    }

    for (const source of sources) {
      await processSource(source);
    }

    console.log('[ContentAggregation] Aggregation job completed');
  } catch (error) {
    console.error('[ContentAggregation] Job failed:', error);
    await logAggregationActivity(null, 'error', null, {}, String(error));
  }
}

/**
 * Process a single content source
 */
async function processSource(source: any): Promise<void> {
  try {
    console.log(`[ContentAggregation] Processing source: ${source.name}`);

    let fetchedContent: any[] = [];

    // Fetch content based on source type
    if (source.source_type === 'rss') {
      fetchedContent = await fetchRSSContent(source.url);
    } else if (source.source_type === 'api') {
      // API fetching would be implemented here
      console.log(`[ContentAggregation] API fetching not yet implemented for ${source.name}`);
    } else if (source.source_type === 'web_scrape') {
      // Web scraping would be implemented here
      console.log(`[ContentAggregation] Web scraping not yet implemented for ${source.name}`);
    }

    console.log(`[ContentAggregation] Fetched ${fetchedContent.length} items from ${source.name}`);

    // Process each fetched item
    for (const content of fetchedContent) {
      try {
        // Check for duplicates
        const isDuplicate = await isDuplicateContent(
          source.id,
          content.title,
          content.content
        );

        if (isDuplicate) {
          console.log(`[ContentAggregation] Skipping duplicate: ${content.title}`);
          continue;
        }

        // Determine content type and category
        const contentType = determineContentType(content.title, content.content, source.category);
        const category = determineCategory(content.title, content.content);

        // Save to pending content queue
        const pendingId = await savePendingContent(
          source.id,
          content,
          contentType,
          category
        );

        if (pendingId) {
          // Cache the content to avoid duplicates
          await cacheContent(source.id, content.url, content.title, content.content);

          // Queue for AI rewriting
          await queueForAIRewriting(pendingId, content.title, content.content, contentType);

          await logAggregationActivity(source.id, 'fetched', pendingId, {
            title: content.title,
            source: content.source,
          });

          console.log(`[ContentAggregation] Queued for approval: ${content.title}`);
        }
      } catch (itemError) {
        console.error(`[ContentAggregation] Error processing item:`, itemError);
        await logAggregationActivity(
          source.id,
          'error',
          null,
          { title: content.title },
          String(itemError)
        );
      }
    }

    // Update last fetched time
    // This would be done via Supabase update
  } catch (error) {
    console.error(`[ContentAggregation] Error processing source ${source.name}:`, error);
    await logAggregationActivity(source.id, 'error', null, {}, String(error));
  }
}

/**
 * Queue content for AI rewriting
 */
async function queueForAIRewriting(
  contentId: string,
  title: string,
  content: string,
  contentType: string
): Promise<void> {
  try {
    // In production, this would be a background job queue
    // For now, we'll simulate it with a timeout
    setTimeout(async () => {
      try {
        const rewriteResult = await rewriteContentWithAI(title, content, contentType);

        if (rewriteResult) {
          await updatePendingContentWithRewrite(contentId, rewriteResult);
          await logAggregationActivity(null, 'rewritten', contentId);
          console.log(`[ContentAggregation] AI rewriting completed for ${contentId}`);
        } else {
          await markRewriteFailed(contentId, 'AI rewriting failed');
        }
      } catch (error) {
        console.error(`[ContentAggregation] Error in AI rewriting:`, error);
        await markRewriteFailed(contentId, String(error));
      }
    }, 1000); // 1 second delay to simulate async processing
  } catch (error) {
    console.error(`[ContentAggregation] Error queuing for AI rewriting:`, error);
  }
}

/**
 * Determine content type based on title and content
 */
function determineContentType(title: string, content: string, sourceCategory: string): string {
  const text = (title + ' ' + content).toLowerCase();

  if (sourceCategory === 'jobs' || text.includes('job') || text.includes('hiring') || text.includes('position')) {
    return 'job';
  }

  if (sourceCategory === 'events' || text.includes('event') || text.includes('conference') || text.includes('summit')) {
    return 'event';
  }

  if (sourceCategory === 'opportunities' || text.includes('opportunity') || text.includes('apply')) {
    return 'opportunity';
  }

  return 'news';
}

/**
 * Determine category for content
 */
function determineCategory(title: string, content: string): string {
  const text = (title + ' ' + content).toLowerCase();

  const categories: Record<string, string[]> = {
    'Community': ['community', 'local', 'town', 'village'],
    'Heritage': ['heritage', 'history', 'culture', 'tradition'],
    'Events': ['event', 'conference', 'summit', 'gathering'],
    'Culture': ['culture', 'cultural', 'art', 'music'],
    'History': ['history', 'historical', 'past', 'archive'],
    'Traditions': ['tradition', 'custom', 'practice'],
    'Development': ['development', 'infrastructure', 'project', 'construction'],
    'Other': [],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return 'Other';
}

/**
 * Initialize the content aggregation job
 * This should be called once when the app starts
 */
export function initializeContentAggregationJob(): void {
  // Run immediately on startup
  runContentAggregationJob();

  // Then run periodically (every 60 minutes)
  setInterval(runContentAggregationJob, 60 * 60 * 1000);

  console.log('[ContentAggregation] Job scheduler initialized');
}
