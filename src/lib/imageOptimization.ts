// Image optimization utilities
export const getOptimizedImageUrl = (url: string, width?: number, quality?: number) => {
  if (!url) return url;
  
  // For Supabase storage URLs, add transformation parameters
  if (url.includes('supabase.co/storage')) {
    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (quality) params.append('quality', quality.toString());
    return url.includes('?') ? `${url}&${params}` : `${url}?${params}`;
  }
  
  return url;
};

export const generateResponsiveSrcSet = (url: string, sizes: number[]) => {
  return sizes.map(size => `${getOptimizedImageUrl(url, size)} ${size}w`).join(', ');
};

export const generateSizes = (config: { mobile?: string; tablet?: string; desktop?: string }) => {
  const { mobile = '100vw', tablet = '50vw', desktop = '33vw' } = config;
  return `(max-width: 640px) ${mobile}, (max-width: 1024px) ${tablet}, ${desktop}`;
};
