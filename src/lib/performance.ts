// Performance monitoring utilities
export const measurePerformance = () => {
  if (typeof window === 'undefined' || !window.performance) return;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (navigation) {
    const metrics = {
      // Core Web Vitals
      FCP: 0, // First Contentful Paint
      LCP: 0, // Largest Contentful Paint
      FID: 0, // First Input Delay
      CLS: 0, // Cumulative Layout Shift
      
      // Navigation Timing
      DNS: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
      TCP: Math.round(navigation.connectEnd - navigation.connectStart),
      Request: Math.round(navigation.responseStart - navigation.requestStart),
      Response: Math.round(navigation.responseEnd - navigation.responseStart),
      Processing: Math.round(navigation.domComplete - navigation.domInteractive),
      Load: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
      Total: Math.round(navigation.loadEventEnd - navigation.fetchStart),
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.table(metrics);
    }

    // Send to analytics in production
    if (import.meta.env.PROD && window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: 'page_load',
        value: metrics.Total,
        event_category: 'Performance',
      });
    }

    return metrics;
  }
};

// Debounce function for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
