import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Prefetch route data on hover/focus for instant navigation
export const usePrefetch = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handlePrefetch = (e: MouseEvent | FocusEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="/"]') as HTMLAnchorElement;
      
      if (link && link.href) {
        const url = new URL(link.href);
        // Prefetch by triggering a low-priority fetch
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = url.pathname;
        document.head.appendChild(prefetchLink);
      }
    };

    // Prefetch on hover and focus for better perceived performance
    document.addEventListener('mouseover', handlePrefetch);
    document.addEventListener('focus', handlePrefetch, true);

    return () => {
      document.removeEventListener('mouseover', handlePrefetch);
      document.removeEventListener('focus', handlePrefetch, true);
    };
  }, []);
};
