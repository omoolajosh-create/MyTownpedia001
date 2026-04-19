// Analytics event tracking utility
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
};

// Common events
export const analytics = {
  pageView: (path: string) => {
    trackEvent('page_view', { page_path: path });
  },
  
  storyView: (storyId: string, storyTitle: string) => {
    trackEvent('view_story', { story_id: storyId, story_title: storyTitle });
  },
  
  townView: (townId: string, townName: string) => {
    trackEvent('view_town', { town_id: townId, town_name: townName });
  },
  
  share: (contentType: string, contentId: string, platform: string) => {
    trackEvent('share', { content_type: contentType, content_id: contentId, platform });
  },
  
  search: (searchTerm: string) => {
    trackEvent('search', { search_term: searchTerm });
  },
  
  engagement: (action: string, label?: string) => {
    trackEvent('engagement', { action, label });
  },
  
  signup: (method: string) => {
    trackEvent('sign_up', { method });
  },
  
  login: (method: string) => {
    trackEvent('login', { method });
  }
};
